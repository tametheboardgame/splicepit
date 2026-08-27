import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9237;
const gamePort = 8095;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 80) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  throw lastError ?? new Error(`Timed out after ${timeoutMs}ms`);
}

const server = spawn('python3', ['-m', 'http.server', String(gamePort), '--bind', '127.0.0.1', '--directory', 'dist'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
const chrome = spawn(chromePath, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${port}`, '--remote-allow-origins=*', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

function cleanup() {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
}
process.on('exit', cleanup);

try {
  const targets = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const list = await response.json();
    return list.length ? list : null;
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.id) return;
    const waiter = pending.get(msg.id);
    if (!waiter) return;
    pending.delete(msg.id);
    if (msg.error) waiter.reject(new Error(msg.error.message)); else waiter.resolve(msg.result);
  });

  function cdp(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  }

  async function key(keyName, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1` });

  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const brightState = await waitFor(async () => evaluate(`(() => {
    const lab = globalThis.__SPLICEPIT_MASTER_LAB__;
    const art = globalThis.__SPLICEPIT_MASTER_LAB_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!lab?.active || !lab.rendered || !art?.active || !art.brightRendered || !env || env.state.locationId !== 'master-lab') return null;
    return {
      lab: { ...lab },
      art: { ...art },
      environment: { ...env.state },
      extraCanvas: Boolean(document.querySelector('#master-lab-production-art-stage')),
      canvasCount: document.querySelectorAll('#master-lab-stage').length,
    };
  })()`));

  if (brightState.art.geometryId !== 'master-lab-v1' || brightState.art.collisionTopology !== 'unchanged') {
    throw new Error(`WP0.6J geometry contract failed: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.renderIntegration !== 'master-lab-render-loop' || brightState.art.depthModel !== 'base-before-player-foreground-after-player') {
    throw new Error(`WP0.6J render integration failed: ${JSON.stringify(brightState.art)}`);
  }
  if (brightState.extraCanvas || brightState.canvasCount !== 1) {
    throw new Error(`WP0.6J must render through the existing Lab canvas: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.darkMix !== 0 || brightState.art.visualState !== 'bright' || brightState.environment.visualState !== 'bright') {
    throw new Error(`WP0.6J did not initialise in the bright Lab: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.brightDetailGroups.length !== 8 || brightState.art.darkStoryGroups.length !== 6) {
    throw new Error(`WP0.6J production-art manifest is incomplete: ${JSON.stringify(brightState.art)}`);
  }

  const brightStats = await evaluate(`(() => {
    const canvas = document.querySelector('#master-lab-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let machinery = 0;
    let glass = 0;
    let warm = 0;
    for (let y = 40; y < 660; y += 4) {
      for (let x = 30; x < 1250; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (g > r + 8 && g > b - 8 && g > 80 && g < 180) machinery += 1;
        if (g > 135 && b > 120 && r > 95) glass += 1;
        if (r > 130 && g > 95 && b < 150) warm += 1;
      }
    }
    globalThis.__WP06J_BRIGHT_PIXELS__ = data.slice();
    return { uniqueColours: colours.size, machinery, glass, warm };
  })()`);

  if (!brightStats || brightStats.uniqueColours < 30 || brightStats.machinery < 180 || brightStats.glass < 70 || brightStats.warm < 180) {
    throw new Error(`WP0.6J bright Lab detail is too sparse: ${JSON.stringify(brightStats)}`);
  }

  const beforeDark = { x: brightState.lab.playerX, y: brightState.lab.playerY, storyState: brightState.lab.state };
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);

  const darkState = await waitFor(async () => evaluate(`(() => {
    const lab = globalThis.__SPLICEPIT_MASTER_LAB__;
    const art = globalThis.__SPLICEPIT_MASTER_LAB_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!lab || !art || !env || art.darkMix < 0.999 || !art.darkRendered) return null;
    return { lab: { ...lab }, art: { ...art }, environment: { ...env.state } };
  })()`));

  if (darkState.art.visualState !== 'dark' || darkState.environment.visualState !== 'dark') {
    throw new Error(`WP0.6J force-dark did not reach the authored dark Lab: ${JSON.stringify(darkState)}`);
  }

  const darkStats = await evaluate(`(() => {
    const canvas = document.querySelector('#master-lab-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__WP06J_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    let deepShadow = 0;
    let biological = 0;
    for (let y = 40; y < 660; y += 4) {
      for (let x = 30; x < 1250; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const br = bright[i], bg = bright[i + 1], bb = bright[i + 2];
        if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) > 45) changed += 1;
        if (r < 82 && g < 88 && b < 84) deepShadow += 1;
        if (r > g + 12 && r > b + 2 && r > 70) biological += 1;
      }
    }
    return { changed, deepShadow, biological };
  })()`);

  if (!darkStats || darkStats.changed < 300 || darkStats.deepShadow < 240 || darkStats.biological < 35) {
    throw new Error(`WP0.6J dark Lab is not materially distinct enough: ${JSON.stringify(darkStats)}`);
  }

  if (Math.abs(darkState.lab.playerX - beforeDark.x) > 1 || Math.abs(darkState.lab.playerY - beforeDark.y) > 1 || darkState.lab.state !== beforeDark.storyState) {
    throw new Error(`WP0.6J visual corruption changed gameplay/story state: ${JSON.stringify({ beforeDark, darkState })}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const restored = await waitFor(async () => evaluate(`(() => {
    const art = globalThis.__SPLICEPIT_MASTER_LAB_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!art || !env || art.darkMix !== 0) return null;
    return { art: { ...art }, environment: { ...env.state } };
  })()`));
  if (restored.art.visualState !== 'bright' || restored.environment.visualState !== 'bright') {
    throw new Error(`WP0.6J did not restore the bright Lab: ${JSON.stringify(restored)}`);
  }

  console.log(`WP0.6J Master Lab production art smoke passed: ${JSON.stringify({ brightStats, darkStats })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
