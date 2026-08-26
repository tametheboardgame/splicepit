import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9235;
const gamePort = 8093;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 15000, intervalMs = 100) {
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
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });

  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`), 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`), 20000);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const brightState = await waitFor(async () => evaluate(`(() => {
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    const art = globalThis.__SPLICEPIT_YARD_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!yard || !art || !env || yard.phase !== 'confirmed' || !art.active || !art.brightRendered) return null;
    return {
      art: { ...art },
      environment: { ...env.state },
      yard: { playerX: yard.playerX, playerY: yard.playerY, worldWidth: yard.worldWidth, worldHeight: yard.worldHeight },
    };
  })()`), 20000);

  if (brightState.art.geometryId !== 'opening-world-v1' || brightState.art.collisionTopology !== 'unchanged') {
    throw new Error(`WP0.6H geometry contract failed: ${JSON.stringify(brightState)}`);
  }
  if (brightState.environment.visualState !== 'bright' || brightState.art.darkMix !== 0) {
    throw new Error(`WP0.6H did not begin in authored bright state: ${JSON.stringify(brightState)}`);
  }
  if (brightState.art.brightDetailGroups.length < 7 || brightState.art.darkStoryGroups.length < 6) {
    throw new Error(`WP0.6H art manifest is incomplete: ${JSON.stringify(brightState.art)}`);
  }

  const brightStats = await evaluate(`(() => {
    const canvas = document.querySelector('#yard-production-art-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let painted = 0;
    let warmWorkplace = 0;
    for (let y = 0; y < canvas.height; y += 6) {
      for (let x = 0; x < canvas.width; x += 6) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 20) continue;
        painted += 1;
        colours.add((r << 16) | (g << 8) | b);
        if (r > 120 && g > 80 && b < 115) warmWorkplace += 1;
      }
    }
    globalThis.__WP06H_BRIGHT_PIXELS__ = data.slice();
    return { painted, uniqueColours: colours.size, warmWorkplace };
  })()`);

  if (!brightStats || brightStats.painted < 450 || brightStats.uniqueColours < 18 || brightStats.warmWorkplace < 35) {
    throw new Error(`WP0.6H bright Yard production detail is too sparse: ${JSON.stringify(brightStats)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const darkState = await waitFor(async () => evaluate(`(() => {
    const art = globalThis.__SPLICEPIT_YARD_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!art || !env || art.darkMix < 0.999 || !art.darkRendered) return null;
    return { art: { ...art }, environment: { ...env.state } };
  })()`), 10000);

  if (darkState.environment.visualState !== 'dark' || darkState.art.visualState !== 'dark') {
    throw new Error(`WP0.6H force-dark did not reach the authored dark Yard: ${JSON.stringify(darkState)}`);
  }

  const darkStats = await evaluate(`(() => {
    const canvas = document.querySelector('#yard-production-art-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__WP06H_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    let darkPaint = 0;
    let biological = 0;
    for (let y = 0; y < canvas.height; y += 6) {
      for (let x = 0; x < canvas.width; x += 6) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        const br = bright[i], bg = bright[i + 1], bb = bright[i + 2], ba = bright[i + 3];
        if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) + Math.abs(a - ba) > 45) changed += 1;
        if (a > 40 && r < 105 && g < 105 && b < 100) darkPaint += 1;
        if (a > 40 && r > g + 14 && r > b + 3 && r > 80) biological += 1;
      }
    }
    return { changed, darkPaint, biological };
  })()`);

  if (!darkStats || darkStats.changed < 160 || darkStats.darkPaint < 120 || darkStats.biological < 20) {
    throw new Error(`WP0.6H dark Yard is not materially distinct enough: ${JSON.stringify(darkStats)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const restored = await waitFor(async () => evaluate(`(() => {
    const art = globalThis.__SPLICEPIT_YARD_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!art || !env || art.darkMix !== 0) return null;
    return { art: { ...art }, environment: { ...env.state } };
  })()`), 10000);

  if (restored.environment.visualState !== 'bright' || restored.art.visualState !== 'bright') {
    throw new Error(`WP0.6H did not restore the Yard to bright: ${JSON.stringify(restored)}`);
  }

  console.log(`WP0.6H Yard production art smoke passed: ${JSON.stringify({ brightStats, darkStats })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
