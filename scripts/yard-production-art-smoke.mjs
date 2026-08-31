import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9235;
const gamePort = 8093;
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
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const brightState = await waitFor(async () => evaluate(`(() => {
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    const image = globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!yard || !image || !env || yard.phase !== 'confirmed' || !yard.yardRendered || !image.active || !image.baseRendered || !image.foregroundRendered) return null;
    if (image.darkMix !== 0 || image.darkBaseRendered) return null;
    return {
      yard: { ...yard },
      image: { ...image },
      environment: { ...env.state },
      legacyOverlayExists: Boolean(document.querySelector('#yard-production-art-stage')),
    };
  })()`));

  if (brightState.yard.yardRenderer !== 'scene-image' || brightState.yard.scenePackId !== 'yard-bright-scene-ysp6-v1') {
    throw new Error(`YSP-8 normal runtime did not retain the authored Yard scene pack: ${JSON.stringify(brightState.yard)}`);
  }
  if (
    brightState.image.assetPackId !== 'yard-bright-scene-v1' ||
    brightState.image.darkAssetPackId !== 'yard-dark-scene-ysp8-v1' ||
    brightState.image.fallback ||
    brightState.image.legacyRendererRendered
  ) {
    throw new Error(`YSP-8 normal runtime mixed legacy or incomplete Yard rendering into the scene: ${JSON.stringify(brightState.image)}`);
  }
  if (brightState.legacyOverlayExists) throw new Error('YSP-8 must not use the old independent Yard production-art overlay.');
  if (brightState.environment.visualState !== 'bright') {
    throw new Error(`YSP-8 did not begin in bright environment state: ${JSON.stringify(brightState.environment)}`);
  }

  const brightStats = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let warmWorkplace = 0;
    let vegetation = 0;
    for (let y = 70; y < 650; y += 4) {
      for (let x = 40; x < 1240; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (r > 120 && g > 80 && b < 120) warmWorkplace += 1;
        if (g > r + 8 && g > b + 8 && g > 80) vegetation += 1;
      }
    }
    globalThis.__YSP8_BRIGHT_PIXELS__ = data.slice();
    return { uniqueColours: colours.size, warmWorkplace, vegetation };
  })()`);
  if (!brightStats || brightStats.uniqueColours < 100 || brightStats.warmWorkplace < 100 || brightStats.vegetation < 100) {
    throw new Error(`YSP-8 approved Bright Yard appears missing or visually sparse: ${JSON.stringify(brightStats)}`);
  }

  const lockedPosition = {
    playerX: brightState.yard.playerX,
    playerY: brightState.yard.playerY,
    cameraX: brightState.yard.cameraX,
    cameraY: brightState.yard.cameraY,
  };

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const darkState = await waitFor(async () => evaluate(`(() => {
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const image = globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__;
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!env || !image || !yard) return null;
    if (env.state.visualState !== 'dark' || env.state.darkMix < 0.999 || image.darkMix < 0.999 || !image.darkBaseRendered) return null;
    return { environment: { ...env.state }, image: { ...image }, yard: { ...yard } };
  })()`), 10000);

  const darkPixels = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__YSP8_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let materiallyChanged = 0;
    let purpleCorruption = 0;
    for (let y = 70; y < 650; y += 5) {
      for (let x = 40; x < 1240; x += 5) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.abs(r - bright[i]) + Math.abs(g - bright[i + 1]) + Math.abs(b - bright[i + 2]) > 60) materiallyChanged += 1;
        if (r > g + 20 && b > g + 20 && (r + b) > 180) purpleCorruption += 1;
      }
    }
    return { materiallyChanged, purpleCorruption };
  })()`);

  if (!darkPixels || darkPixels.materiallyChanged < 1500 || darkPixels.purpleCorruption < 40) {
    throw new Error(`YSP-8 authored Dark Yard did not materially replace the Bright Yard: ${JSON.stringify(darkPixels)}`);
  }
  if (darkState.image.fallback || darkState.image.legacyRendererRendered || darkState.image.darkAssetPackId !== 'yard-dark-scene-ysp8-v1') {
    throw new Error(`YSP-8 force-dark used a fallback or legacy renderer: ${JSON.stringify(darkState.image)}`);
  }

  for (const key of ['playerX', 'playerY', 'cameraX', 'cameraY']) {
    if (Math.abs(darkState.yard[key] - lockedPosition[key]) > 0.2) {
      throw new Error(`YSP-8 Bright→Dark transition moved ${key}: ${JSON.stringify({ lockedPosition, dark: darkState.yard })}`);
    }
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const recovered = await waitFor(async () => evaluate(`(() => {
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const image = globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__;
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!env || !image || !yard) return null;
    if (env.state.visualState !== 'bright' || env.state.darkMix !== 0 || image.darkMix !== 0 || image.darkBaseRendered) return null;
    return { image: { ...image }, yard: { ...yard } };
  })()`), 10000);

  for (const key of ['playerX', 'playerY', 'cameraX', 'cameraY']) {
    if (Math.abs(recovered.yard[key] - lockedPosition[key]) > 0.2) {
      throw new Error(`YSP-8 Dark→Bright recovery moved ${key}: ${JSON.stringify({ lockedPosition, recovered: recovered.yard })}`);
    }
  }

  console.log(`YSP-8 authored Bright/Dark Yard transition passed: ${JSON.stringify({ brightStats, darkPixels })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
