import { spawn } from 'node:child_process';
import { traverseAuthoredYardToMasterLabTunnel } from './yard-scene-navigation.mjs';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9264;
const gamePort = 8114;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let nextId = 0;
const pending = new Map();

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
  `--remote-debugging-port=${chromePort}`, '--remote-allow-origins=*', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

function cleanup() {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
}
process.on('exit', cleanup);

try {
  const targets = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${chromePort}/json/list`);
    const list = await response.json();
    return list.length ? list : null;
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message)); else waiter.resolve(message.result);
  });

  function cdp(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
    return response.result?.value;
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(90);
  }

  async function key(keyName, code, vk) {
    await holdKey(keyName, code, vk, 35);
  }

  async function nudge(keyName, code, vk) {
    await holdKey(keyName, code, vk, 70);
  }

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }
  async function labState() {
    return evaluate(`globalThis.__SPLICEPIT_MASTER_LAB__ ? ({ ...globalThis.__SPLICEPIT_MASTER_LAB__ }) : null`);
  }
  async function pitState() {
    return evaluate(`globalThis.__SPLICEPIT_LOCAL_PIT__ ? ({ ...globalThis.__SPLICEPIT_LOCAL_PIT__ }) : null`);
  }
  async function debtState() {
    return evaluate(`globalThis.__SPLICEPIT_DEBT_ENCOUNTER__ ? ({ ...globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.state }) : null`);
  }

  async function waitForPrompt(id) {
    return waitFor(async () => {
      const current = await state();
      return current?.tutorialPromptId === id && current?.tutorialPromptVisible && !current?.tutorialPromptCompleting ? current : null;
    }, 10000);
  }

  async function moveRouteAxis(axis, target, positiveKey, negativeKey, tolerance = 18) {
    const keys = {
      w: ['w', 'KeyW', 87],
      a: ['a', 'KeyA', 65],
      s: ['s', 'KeyS', 83],
      d: ['d', 'KeyD', 68],
    };
    let previous = null;
    let stalled = 0;
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const current = await state();
      const value = axis === 'x' ? current.playerX : current.playerY;
      const delta = target - value;
      if (Math.abs(delta) <= tolerance) return current;
      if (previous !== null && Math.abs(value - previous) < 1) stalled += 1;
      else stalled = 0;
      if (stalled >= 8) throw new Error(`RSP-7 Route movement stalled on ${axis} towards ${target}: ${JSON.stringify(current)}`);
      previous = value;
      const [keyName, code, vk] = keys[delta > 0 ? positiveKey : negativeKey];
      await nudge(keyName, code, vk);
    }
    throw new Error(`RSP-7 Route movement did not reach ${axis}=${target}: ${JSON.stringify(await state())}`);
  }

  async function moveOverlayToExit(readState, label) {
    let previousY = null;
    let stalled = 0;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const current = await readState();
      if (current?.nearExit) return current;
      if (!current?.active) throw new Error(`${label} became inactive before reaching its exit: ${JSON.stringify(current)}`);
      if (previousY !== null && Math.abs(current.playerY - previousY) < 1) stalled += 1;
      else stalled = 0;
      if (stalled >= 8) throw new Error(`${label} movement stalled before its authored exit: ${JSON.stringify(current)}`);
      previousY = current.playerY;
      await nudge('s', 'KeyS', 83);
    }
    throw new Error(`${label} did not reach its authored exit: ${JSON.stringify(await readState())}`);
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

  await waitForPrompt('movement');
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

  await traverseAuthoredYardToMasterLabTunnel({
    readState: state,
    moveLeft: () => nudge('a', 'KeyA', 65),
    moveRight: () => nudge('d', 'KeyD', 68),
    moveUp: () => nudge('w', 'KeyW', 87),
    moveDown: () => nudge('s', 'KeyS', 83),
    label: 'RSP-7 authored Route Yard navigation',
  });

  const arrival = await waitFor(async () => {
    const current = await state();
    return current?.sceneMode === 'master-lab-route' && current?.routeRendered ? current : null;
  });
  if (
    arrival.routeRenderer !== 'scene-image' ||
    arrival.routeProductionCutoverReady !== true ||
    arrival.routeScenePackId !== 'opening-route-bright-rsp6-v1' ||
    arrival.worldWidth !== 3072 ||
    arrival.worldHeight !== 2049 ||
    arrival.routeHandoffCount !== 1 ||
    arrival.routeHandoffExitId !== 'master-lab-tunnel'
  ) {
    throw new Error(`RSP-7 authored Route handoff contract failed: ${JSON.stringify(arrival)}`);
  }

  const bright = await waitFor(async () => evaluate(`(() => {
    const scene = globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!scene?.productionCutoverReady || !scene.ready || !scene.brightReady || !scene.darkReady || !yard?.routeRendered) return null;
    return { scene: { ...scene }, env: { ...env.state }, playerX: yard.playerX, playerY: yard.playerY };
  })()`));
  if (
    bright.scene.scenePackId !== 'opening-route-bright-rsp6-v1' ||
    bright.scene.fallback ||
    bright.scene.cutoverBlockers.length !== 0 ||
    bright.scene.baseRenderCount < 1 ||
    bright.scene.foregroundRenderCount < 1 ||
    bright.scene.darkMix !== 0 ||
    bright.env.visualState !== 'bright'
  ) {
    throw new Error(`RSP-7 Bright authored Route runtime contract failed: ${JSON.stringify(bright)}`);
  }

  const beforeDark = { x: bright.playerX, y: bright.playerY };
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const dark = await waitFor(async () => evaluate(`(() => {
    const scene = globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!scene || !env || !yard || scene.darkMix < 0.999 || !scene.darkBaseRendered) return null;
    return { scene: { ...scene }, env: { ...env.state }, playerX: yard.playerX, playerY: yard.playerY };
  })()`), 10000);
  if (dark.env.visualState !== 'dark' || !dark.scene.darkBaseRendered || dark.scene.baseRenderCount <= bright.scene.baseRenderCount) {
    throw new Error(`RSP-7 Dark authored Route transition failed: ${JSON.stringify(dark)}`);
  }
  if (Math.abs(dark.playerX - beforeDark.x) > 1 || Math.abs(dark.playerY - beforeDark.y) > 1) {
    throw new Error(`RSP-7 corruption transition moved the player: ${JSON.stringify({ beforeDark, dark })}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  const recovered = await waitFor(async () => evaluate(`(() => {
    const scene = globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__;
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    return scene?.darkMix === 0 && env?.state?.visualState === 'bright' ? { ...scene } : null;
  })()`), 10000);
  if (!recovered.productionCutoverReady || recovered.fallback || recovered.cutoverBlockers.length !== 0) {
    throw new Error(`RSP-7 Bright recovery lost authored cutover readiness: ${JSON.stringify(recovered)}`);
  }

  await moveRouteAxis('y', 768, 's', 'w');
  await moveRouteAxis('x', 1728, 'd', 'a');
  await waitFor(async () => {
    const current = await state();
    return current?.routeInteractionTarget === 'master-lab' ? current : null;
  });
  await key('e', 'KeyE', 69);

  const labEntered = await waitFor(async () => {
    const current = await labState();
    return current?.active && current?.rendered ? current : null;
  }, 20000);
  if (labEntered.stageId !== 'entry') throw new Error(`RSP-7 authored Master Lab entry failed: ${JSON.stringify(labEntered)}`);

  const labExit = await moveOverlayToExit(labState, 'RSP-7 Master Lab');
  await key('e', 'KeyE', 69);
  const labReturned = await waitFor(async () => {
    const lab = await labState();
    const yard = await state();
    if (lab?.active || !yard?.routeRendered || yard.routeRenderer !== 'scene-image') return null;
    if (Math.abs(yard.playerX - 1725) > 30 || Math.abs(yard.playerY - 825) > 30) return null;
    return yard;
  }, 15000);

  await moveRouteAxis('y', 1260, 's', 'w');
  await moveRouteAxis('x', 1944, 'd', 'a');
  const debtAtWeighbridge = await waitFor(async () => {
    const debt = await debtState();
    return debt?.landmarkLabel === 'Decommissioned Biosecurity Weighbridge'
      && typeof debt.distanceToPlayer === 'number'
      && debt.distanceToPlayer <= 30
      ? debt
      : null;
  });

  await moveRouteAxis('y', 1980, 's', 'w');
  await moveRouteAxis('x', 2256, 'd', 'a');
  await waitFor(async () => {
    const current = await state();
    return current?.routeInteractionTarget === 'local-pit' ? current : null;
  });
  await key('e', 'KeyE', 69);

  const pitEntered = await waitFor(async () => {
    const current = await pitState();
    return current?.active && current?.rendered ? current : null;
  }, 20000);
  if (pitEntered.stageId !== 'arrival-gate') throw new Error(`RSP-7 authored Local Pit entry failed: ${JSON.stringify(pitEntered)}`);

  const pitExit = await moveOverlayToExit(pitState, 'RSP-7 Local Pit');
  if (pitExit.zone !== 'exterior') throw new Error(`RSP-7 Local Pit exit was not exterior: ${JSON.stringify(pitExit)}`);
  await key('e', 'KeyE', 69);
  const pitReturned = await waitFor(async () => {
    const pit = await pitState();
    const yard = await state();
    if (pit?.active || !yard?.routeRendered || yard.routeRenderer !== 'scene-image') return null;
    if (Math.abs(yard.playerX - 2247) > 30 || Math.abs(yard.playerY - 1824) > 30) return null;
    return yard;
  }, 15000);

  console.log(`RSP-7 authored Route scene smoke passed: ${JSON.stringify({
    handoff: arrival.routeHandoffTarget,
    world: [arrival.worldWidth, arrival.worldHeight],
    darkSha256: '5bff87c2bfe36bfb60bf6562afd8f66bfd3405a8ce85a6ef87bf92ba54d85be6',
    baseRenderCount: recovered.baseRenderCount,
    foregroundRenderCount: recovered.foregroundRenderCount,
    labExit: [labExit.playerX, labExit.playerY],
    labReturn: [labReturned.playerX, labReturned.playerY],
    debtDistance: debtAtWeighbridge.distanceToPlayer,
    pitExit: [pitExit.playerX, pitExit.playerY],
    pitReturn: [pitReturned.playerX, pitReturned.playerY],
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
