import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9236;
const gamePort = 8094;
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

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function holdKey(keyName, code, vk, durationMs = 90) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(35);
  }

  async function moveAxis(axis, target, positive, negative, tolerance = 16) {
    let previous = null;
    let stalled = 0;
    for (let attempt = 0; attempt < 220; attempt += 1) {
      const current = await state();
      const value = axis === 'x' ? current.playerX : current.playerY;
      const delta = target - value;
      if (Math.abs(delta) <= tolerance) return current;
      if (previous !== null && Math.abs(value - previous) < 0.8) stalled += 1;
      else stalled = 0;
      if (stalled >= 10) throw new Error(`WP0.6I route movement stalled on ${axis}: ${JSON.stringify(current)}`);
      previous = value;
      const control = delta > 0 ? positive : negative;
      await holdKey(control.key, control.code, control.vk, 90);
    }
    throw new Error(`WP0.6I route movement failed to reach ${axis}=${target}: ${JSON.stringify(await state())}`);
  }

  const right = { key: 'ArrowRight', code: 'ArrowRight', vk: 39 };
  const left = { key: 'ArrowLeft', code: 'ArrowLeft', vk: 37 };
  const down = { key: 'ArrowDown', code: 'ArrowDown', vk: 40 };
  const up = { key: 'ArrowUp', code: 'ArrowUp', vk: 38 };

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });

  await waitFor(async () => (await state())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);
  await waitFor(async () => (await state())?.phase === 'confirmed');

  // Follow the existing WP0.6D route rather than introducing a test teleport.
  await moveAxis('y', 700, down, up);
  await moveAxis('x', 1200, right, left);
  await moveAxis('x', 1450, right, left);
  await moveAxis('y', 655, down, up);
  const routeArrival = await moveAxis('x', 1840, right, left);

  const brightState = await waitFor(async () => evaluate(`(() => {
    const route = globalThis.__SPLICEPIT_ROUTE_ART__;
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!route || !yard || !env || !route.active || !route.brightRendered || env.state.locationId !== 'route') return null;
    return {
      route: { ...route },
      environment: { ...env.state },
      yard: { playerX: yard.playerX, playerY: yard.playerY, worldWidth: yard.worldWidth, worldHeight: yard.worldHeight },
      overlayExists: Boolean(document.querySelector('#route-production-art-stage')),
    };
  })()`));

  if (brightState.route.geometryId !== 'opening-world-v1' || brightState.route.collisionTopology !== 'unchanged') {
    throw new Error(`WP0.6I geometry contract failed: ${JSON.stringify(brightState)}`);
  }
  if (brightState.route.renderIntegration !== 'opening-world-render-loop' || brightState.route.depthModel !== 'base-before-player-foreground-after-player') {
    throw new Error(`WP0.6I depth integration failed: ${JSON.stringify(brightState.route)}`);
  }
  if (brightState.overlayExists) throw new Error('WP0.6I must not use an independent route overlay canvas.');
  if (brightState.route.darkMix !== 0 || brightState.environment.visualState !== 'bright') {
    throw new Error(`WP0.6I did not arrive in the bright route state: ${JSON.stringify(brightState)}`);
  }
  if (brightState.route.brightDetailGroups.length < 8 || brightState.route.darkStoryGroups.length < 6) {
    throw new Error(`WP0.6I route art manifest is incomplete: ${JSON.stringify(brightState.route)}`);
  }

  const brightStats = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let infrastructure = 0;
    let vegetation = 0;
    for (let y = 70; y < 650; y += 4) {
      for (let x = 40; x < 1240; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (r > 105 && r < 210 && g > 75 && g < 180 && b < 125) infrastructure += 1;
        if (g > r + 12 && g > b + 10 && g > 90) vegetation += 1;
      }
    }
    globalThis.__WP06I_BRIGHT_PIXELS__ = data.slice();
    return { uniqueColours: colours.size, infrastructure, vegetation };
  })()`);

  if (!brightStats || brightStats.uniqueColours < 28 || brightStats.infrastructure < 120 || brightStats.vegetation < 150) {
    throw new Error(`WP0.6I bright route production detail is too sparse: ${JSON.stringify(brightStats)}`);
  }

  const positionBeforeDark = { x: brightState.yard.playerX, y: brightState.yard.playerY };
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const darkState = await waitFor(async () => evaluate(`(() => {
    const route = globalThis.__SPLICEPIT_ROUTE_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!route || !env || route.darkMix < 0.999 || !route.darkRendered) return null;
    return { route: { ...route }, environment: { ...env.state } };
  })()`), 10000);

  if (darkState.environment.visualState !== 'dark' || darkState.route.visualState !== 'dark') {
    throw new Error(`WP0.6I force-dark did not reach the authored dark route: ${JSON.stringify(darkState)}`);
  }

  const darkStats = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__WP06I_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    let darkPaint = 0;
    let biological = 0;
    for (let y = 70; y < 650; y += 4) {
      for (let x = 40; x < 1240; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const br = bright[i], bg = bright[i + 1], bb = bright[i + 2];
        if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) > 42) changed += 1;
        if (r < 100 && g < 100 && b < 95) darkPaint += 1;
        if (r > g + 12 && r > b + 2 && r > 72) biological += 1;
      }
    }
    return { changed, darkPaint, biological };
  })()`);

  if (!darkStats || darkStats.changed < 130 || darkStats.darkPaint < 260 || darkStats.biological < 18) {
    throw new Error(`WP0.6I dark route is not materially distinct enough: ${JSON.stringify(darkStats)}`);
  }

  const afterDark = await state();
  if (Math.abs(afterDark.playerX - positionBeforeDark.x) > 1 || Math.abs(afterDark.playerY - positionBeforeDark.y) > 1) {
    throw new Error(`WP0.6I visual corruption moved the player: ${JSON.stringify({ positionBeforeDark, afterDark })}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const restored = await waitFor(async () => evaluate(`(() => {
    const route = globalThis.__SPLICEPIT_ROUTE_ART__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    if (!route || !env || route.darkMix !== 0) return null;
    return { route: { ...route }, environment: { ...env.state } };
  })()`), 10000);

  if (restored.environment.visualState !== 'bright' || restored.route.visualState !== 'bright') {
    throw new Error(`WP0.6I did not restore the route to bright: ${JSON.stringify(restored)}`);
  }

  console.log(`WP0.6I opening route production art smoke passed: ${JSON.stringify({ routeArrival, brightStats, darkStats })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
