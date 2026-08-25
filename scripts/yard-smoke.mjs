import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9224;
const gamePort = 8082;
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

  async function key(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(120);
  }

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
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

  await waitFor(async () => (await state())?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.ready === true, 20000);
  await cdp('Page.bringToFront');

  const selector = await waitFor(async () => {
    const current = await state();
    return current?.ready && current?.selectionRendered ? current : null;
  });
  if (selector.selectionPresentation !== 'yard-arrival' || selector.viewportWidth !== 1280 || selector.viewportHeight !== 720) {
    throw new Error(`WP0.4E-R selector was not ready before Yard entry: ${JSON.stringify(selector)}`);
  }

  await key('Enter', 'Enter', 13);
  const initial = await waitFor(async () => {
    const current = await state();
    return current?.phase === 'confirmed' && current?.yardRendered ? current : null;
  });

  if (initial.selectedAvatarId !== 'milo' || initial.playerName !== 'Milo' || !initial.saved) {
    throw new Error(`Yard did not receive selected identity: ${JSON.stringify(initial)}`);
  }
  if (initial.viewportWidth !== 1280 || initial.viewportHeight !== 720 || initial.worldWidth <= 1280 || initial.worldHeight <= 720) {
    throw new Error(`Expanded world/viewport contract failed: ${JSON.stringify(initial)}`);
  }

  const canvasSize = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    return canvas ? { width: canvas.width, height: canvas.height, bodyWidth: document.body.scrollWidth, viewportWidth: innerWidth } : null;
  })()`);
  if (!canvasSize || canvasSize.width !== 1280 || canvasSize.height !== 720 || canvasSize.bodyWidth > canvasSize.viewportWidth) {
    throw new Error(`Yard viewport size/overflow failed: ${JSON.stringify(canvasSize)}`);
  }

  const visualStats = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    const debug = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!canvas || !ctx || !debug) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let dark = 0;
    let waterLike = 0;
    let warm = 0;
    for (let y = 0; y < canvas.height; y += 10) {
      for (let x = 0; x < canvas.width; x += 10) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (r < 90 && g < 110 && b < 100) dark += 1;
        if (b > r && g >= r && b > 100) waterLike += 1;
        if (r > 150 && g > 110 && b < 140) warm += 1;
      }
    }
    const px = Math.round(debug.playerX - debug.cameraX);
    const py = Math.round(debug.playerY - debug.cameraY);
    const playerData = ctx.getImageData(Math.max(0, px - 38), Math.max(0, py - 100), 76, 104).data;
    let playerVariation = 0;
    for (let i = 4; i < playerData.length; i += 32) {
      if (playerData[i] !== playerData[i - 4] || playerData[i + 1] !== playerData[i - 3] || playerData[i + 2] !== playerData[i - 2]) {
        playerVariation += 1;
      }
    }
    return { uniqueColours: colours.size, dark, waterLike, warm, playerVariation };
  })()`);

  if (!visualStats || visualStats.uniqueColours < 24 || visualStats.waterLike < 20 || visualStats.warm < 25 || visualStats.dark < 20 || visualStats.playerVariation < 35) {
    throw new Error(`Expanded Yard visual contract failed: ${JSON.stringify(visualStats)}`);
  }

  await holdKey('s', 'KeyS', 83, 850);
  const south = await state();
  if (!(south.playerY > initial.playerY + 70) || south.facing !== 'down') {
    throw new Error(`South movement failed: ${JSON.stringify({ initial, south })}`);
  }
  if (!(south.cameraY > initial.cameraY + 25)) {
    throw new Error(`Camera did not follow southward movement: ${JSON.stringify({ initial, south })}`);
  }

  await holdKey('d', 'KeyD', 68, 1200);
  const east = await state();
  if (!(east.playerX > south.playerX + 120) || east.facing !== 'right') {
    throw new Error(`East movement failed: ${JSON.stringify({ south, east })}`);
  }
  if (!(east.cameraX > south.cameraX + 45)) {
    throw new Error(`Camera did not follow eastward movement: ${JSON.stringify({ south, east })}`);
  }

  const beforeCollision = east.collisionCount;
  await holdKey('w', 'KeyW', 87, 1200);
  const north = await state();
  if (north.facing !== 'up' || north.collisionCount <= beforeCollision) {
    throw new Error(`Water/prop collision was not exercised: ${JSON.stringify({ east, north })}`);
  }
  if (north.playerY < 650) {
    throw new Error(`Player appears to have crossed the pond collision: ${JSON.stringify(north)}`);
  }

  const rejectedUiPresent = await evaluate(`Boolean(
    document.querySelector('.character-select-shell, .character-tab, #identity-form, #character-preview') ||
    globalThis.__SPLICEPIT_CHARACTER_SELECT__
  )`);
  if (rejectedUiPresent) throw new Error('Rejected legacy presentation returned during Yard movement.');

  await key('Escape', 'Escape', 27);
  const returned = await waitFor(async () => {
    const current = await state();
    return current?.phase === 'select' && current?.selectionRendered ? current : null;
  });
  if (returned.viewportWidth !== 1280 || returned.viewportHeight !== 720 || returned.yardRendered || returned.selectionPresentation !== 'yard-arrival') {
    throw new Error(`Escape did not restore in-world selector cleanly: ${JSON.stringify(returned)}`);
  }

  console.log(`WP0.4G movement remains intact through WP0.4E-R: ${JSON.stringify({ visualStats, south, east, north })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
