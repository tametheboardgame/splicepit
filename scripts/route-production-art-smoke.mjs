import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9236;
const gamePort = 8094;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 25000, intervalMs = 80) {
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
  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(120);
  }
  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }
  async function waitForPrompt(id) {
    return waitFor(async () => {
      const current = await state();
      return current?.tutorialPromptId === id && current?.tutorialPromptVisible && !current?.tutorialPromptCompleting ? current : null;
    }, 10000);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await state())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const yardStart = await waitForPrompt('movement');
  if (yardStart.yardRenderer !== 'scene-image' || yardStart.worldWidth !== 1280 || yardStart.worldHeight !== 720) {
    throw new Error(`YSP-7 route test did not begin in the production scene Yard: ${JSON.stringify(yardStart)}`);
  }

  // Complete the real opening onboarding in the authored Yard. The long first
  // right move also establishes the service-ring baseline used by the proven
  // YSP-5/YSP-6 tunnel traversal.
  await holdKey('d', 'KeyD', 68, 1200);
  await waitForPrompt('interact');
  await key('e', 'KeyE', 69);
  await waitForPrompt('bag');
  await key('b', 'KeyB', 66);
  await waitForPrompt('confirm-cancel');
  await key('Enter', 'Enter', 13);
  await key('Escape', 'Escape', 27);
  await waitForPrompt('map');
  await key('m', 'KeyM', 77);
  await waitFor(async () => {
    const current = await state();
    return current?.openingSequenceComplete && current?.objectiveId === 'find-master' && current?.activeOpeningShell === 'map' ? current : null;
  });
  await key('Escape', 'Escape', 27);

  await holdKey('a', 'KeyA', 65, 1000);
  await holdKey('w', 'KeyW', 87, 2050);
  await holdKey('d', 'KeyD', 68, 1200);
  await holdKey('s', 'KeyS', 83, 500);
  await holdKey('d', 'KeyD', 68, 1850);

  const routeArrival = await waitFor(async () => {
    const current = await state();
    return current?.sceneMode === 'master-lab-route' && current?.routeRendered && current?.routeHandoffTarget === 'master-lab-route'
      ? current
      : null;
  });
  if (routeArrival.routeHandoffCount !== 1 || routeArrival.routeHandoffExitId !== 'master-lab-tunnel' || routeArrival.playerX < 1760) {
    throw new Error(`YSP-7 did not enter the existing route through the authored tunnel: ${JSON.stringify(routeArrival)}`);
  }

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
    throw new Error(`WP0.6I route geometry contract failed after YSP-7 handoff: ${JSON.stringify(brightState)}`);
  }
  if (brightState.route.renderIntegration !== 'opening-world-render-loop' || brightState.route.depthModel !== 'base-before-player-foreground-after-player') {
    throw new Error(`WP0.6I route depth integration failed after YSP-7 handoff: ${JSON.stringify(brightState.route)}`);
  }
  if (brightState.overlayExists) throw new Error('Route production art must not use an independent overlay canvas.');
  if (brightState.route.darkMix !== 0 || brightState.environment.visualState !== 'bright') {
    throw new Error(`Route did not begin bright after YSP-7 handoff: ${JSON.stringify(brightState)}`);
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
    throw new Error(`Route production detail is too sparse after YSP-7 handoff: ${JSON.stringify(brightStats)}`);
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
    throw new Error(`Route force-dark failed after YSP-7 handoff: ${JSON.stringify(darkState)}`);
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
    throw new Error(`Dark route is not materially distinct enough after YSP-7 handoff: ${JSON.stringify(darkStats)}`);
  }

  const afterDark = await state();
  if (Math.abs(afterDark.playerX - positionBeforeDark.x) > 1 || Math.abs(afterDark.playerY - positionBeforeDark.y) > 1) {
    throw new Error(`Route visual corruption moved the player: ${JSON.stringify({ positionBeforeDark, afterDark })}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_ART__?.darkMix === 0 && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.visualState === 'bright'`));

  console.log(`YSP-7 tunnel-to-route production art smoke passed: ${JSON.stringify({ handoff: routeArrival.routeHandoffTarget, brightStats, darkStats })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
