import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9238;
const gamePort = 8096;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 70) {
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
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&pitTest=1` });

  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const ruptureState = await waitFor(async () => evaluate(`(() => {
    const pit = globalThis.__SPLICEPIT_LOCAL_PIT__;
    const art = globalThis.__SPLICEPIT_LOCAL_PIT_ART__;
    const glitch = globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!pit?.active || !pit.rendered || !art?.active || !glitch?.glitching || !env) return null;
    if (art.darkMix <= 0.05) return null;
    return { pit: { ...pit }, art: { ...art }, glitch: { ...glitch }, environment: { ...env.state } };
  })()`));

  if (ruptureState.art.geometryId !== 'local-pit-v1' || ruptureState.art.collisionTopology !== 'unchanged') {
    throw new Error(`WP0.6K geometry contract failed: ${JSON.stringify(ruptureState)}`);
  }
  if (ruptureState.art.renderIntegration !== 'local-pit-render-loop' || ruptureState.art.depthModel !== 'base-before-player-foreground-after-player') {
    throw new Error(`WP0.6K render integration failed: ${JSON.stringify(ruptureState.art)}`);
  }
  if (ruptureState.glitch.glitchCount < 1 || ruptureState.environment.locationId !== 'local-pit') {
    throw new Error(`WP0.6K did not retain the WP0.6F1 entry corruption contract: ${JSON.stringify(ruptureState)}`);
  }
  if (!ruptureState.art.darkRendered || ruptureState.glitch.environmentPhase === 'steady') {
    throw new Error(`WP0.6K entry corruption is not driving authored dark Pit art: ${JSON.stringify(ruptureState)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const brightState = await waitFor(async () => evaluate(`(() => {
    const pit = globalThis.__SPLICEPIT_LOCAL_PIT__;
    const art = globalThis.__SPLICEPIT_LOCAL_PIT_ART__;
    const glitch = globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!pit?.active || !pit.rendered || !art?.active || !env || art.darkMix !== 0) return null;
    return {
      pit: { ...pit },
      art: { ...art },
      glitch: glitch ? { ...glitch } : null,
      environment: { ...env.state },
      extraCanvas: Boolean(document.querySelector('#local-pit-production-art-stage')),
      canvasCount: document.querySelectorAll('#local-pit-stage').length,
    };
  })()`));

  if (brightState.extraCanvas || brightState.canvasCount !== 1) {
    throw new Error(`WP0.6K must render through the existing Pit canvas: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.visualState !== 'bright' || brightState.environment.visualState !== 'bright') {
    throw new Error(`WP0.6K did not settle into the bright Pit: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.brightDetailGroups.length !== 8 || brightState.art.darkStoryGroups.length !== 6) {
    throw new Error(`WP0.6K production-art manifest is incomplete: ${JSON.stringify(brightState.art)}`);
  }

  const brightStats = await evaluate(`(() => {
    const canvas = document.querySelector('#local-pit-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let warm = 0;
    let metal = 0;
    let grime = 0;
    for (let y = 30; y < 680; y += 4) {
      for (let x = 30; x < 1250; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (r > 120 && g > 70 && g < 170 && b < 135) warm += 1;
        if (Math.abs(r - g) < 24 && Math.abs(g - b) < 30 && r > 65 && r < 185) metal += 1;
        if (r < 125 && g < 125 && b < 105) grime += 1;
      }
    }
    globalThis.__WP06K_BRIGHT_PIXELS__ = data.slice();
    return { uniqueColours: colours.size, warm, metal, grime };
  })()`);

  if (!brightStats || brightStats.uniqueColours < 28 || brightStats.warm < 120 || brightStats.metal < 80 || brightStats.grime < 120) {
    throw new Error(`WP0.6K bright Pit detail is too sparse: ${JSON.stringify(brightStats)}`);
  }

  const beforeDark = { x: brightState.pit.playerX, y: brightState.pit.playerY, zone: brightState.pit.zone, stageId: brightState.pit.stageId };
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const darkState = await waitFor(async () => evaluate(`(() => {
    const pit = globalThis.__SPLICEPIT_LOCAL_PIT__;
    const art = globalThis.__SPLICEPIT_LOCAL_PIT_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!pit || !art || !env || art.darkMix < 0.999 || !art.darkRendered) return null;
    return { pit: { ...pit }, art: { ...art }, environment: { ...env.state } };
  })()`));

  if (darkState.art.visualState !== 'dark' || darkState.environment.visualState !== 'dark') {
    throw new Error(`WP0.6K force-dark did not reach the authored dark Pit: ${JSON.stringify(darkState)}`);
  }

  const darkStats = await evaluate(`(() => {
    const canvas = document.querySelector('#local-pit-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__WP06K_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    let deepShadow = 0;
    let bloodLike = 0;
    for (let y = 30; y < 680; y += 4) {
      for (let x = 30; x < 1250; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const br = bright[i], bg = bright[i + 1], bb = bright[i + 2];
        if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) > 42) changed += 1;
        if (r < 80 && g < 84 && b < 80) deepShadow += 1;
        if (r > g + 14 && r > b + 5 && r > 65) bloodLike += 1;
      }
    }
    return { changed, deepShadow, bloodLike };
  })()`);

  if (!darkStats || darkStats.changed < 180 || darkStats.deepShadow < 120 || darkStats.bloodLike < 18) {
    throw new Error(`WP0.6K dark Pit is not materially distinct enough: ${JSON.stringify(darkStats)}`);
  }

  if (Math.abs(darkState.pit.playerX - beforeDark.x) > 1 || Math.abs(darkState.pit.playerY - beforeDark.y) > 1 || darkState.pit.zone !== beforeDark.zone || darkState.pit.stageId !== beforeDark.stageId) {
    throw new Error(`WP0.6K visual corruption changed Pit gameplay state: ${JSON.stringify({ beforeDark, darkState })}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_LOCAL_PIT_ART__?.darkMix === 0`));

  console.log(`WP0.6K Local Pit production art smoke passed: ${JSON.stringify({ brightStats, darkStats })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
