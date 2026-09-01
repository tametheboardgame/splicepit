import { spawn } from 'node:child_process';
import { traverseAuthoredYardToMasterLabTunnel } from './yard-scene-navigation.mjs';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9239;
const gamePort = 8097;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 25000, intervalMs = 70) {
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
    await sleep(90);
  }
  async function holdKey(keyName, code, vk, durationMs = 90) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }
  async function yardState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }
  async function waitForPrompt(id) {
    return waitFor(async () => {
      const value = await yardState();
      return value?.tutorialPromptId === id && value?.tutorialPromptVisible && !value?.tutorialPromptCompleting ? value : null;
    }, 10000);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  async function openScenario(query = '') {
    await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1${query}` });
    await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true && globalThis.__SPLICEPIT_CORRUPTION__?.state?.ready === true`));
    await evaluate(`localStorage.clear()`);
    await cdp('Page.reload', { ignoreCache: true });
    await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true && globalThis.__SPLICEPIT_CORRUPTION__?.state?.ready === true`));
    await cdp('Page.bringToFront');
    await key('Enter', 'Enter', 13);
    await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.phase === 'confirmed'`));
  }

  async function verifyCurrentLocation(locationId, artGlobalName, playerGlobalName) {
    await waitFor(async () => evaluate(`(() => {
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      const art = globalThis['${artGlobalName}'];
      return env?.state?.locationId === '${locationId}' && corruption?.state?.exploring === true && art?.active === true;
    })()`));

    const before = await evaluate(`(() => {
      const state = globalThis['${playerGlobalName}'];
      return state ? { playerX: state.playerX ?? null, playerY: state.playerY ?? null, zone: state.zone ?? null, stageId: state.stageId ?? null } : null;
    })()`);

    await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.forceAmbient('${locationId}', 'linger')`);
    const ruptured = await waitFor(async () => evaluate(`(() => {
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      const art = globalThis['${artGlobalName}'];
      const overlay = document.querySelector('#ambient-world-corruption');
      if (!env || !corruption || !art || !overlay) return null;
      if (corruption.state.activeEventId === null || env.state.locationId !== '${locationId}') return null;
      if (env.state.darkMix < 0.25 || art.darkMix < 0.25 || !art.darkRendered) return null;
      if (overlay.getAttribute('aria-hidden') !== 'false') return null;
      return { environment: { ...env.state }, corruption: { ...corruption.state }, art: { ...art } };
    })()`));

    if (ruptured.corruption.activeSource !== 'debug' || ruptured.corruption.intensity !== 'linger') {
      throw new Error(`WP0.6L deterministic corruption hook failed in ${locationId}: ${JSON.stringify(ruptured)}`);
    }

    const after = await evaluate(`(() => {
      const state = globalThis['${playerGlobalName}'];
      return state ? { playerX: state.playerX ?? null, playerY: state.playerY ?? null, zone: state.zone ?? null, stageId: state.stageId ?? null } : null;
    })()`);
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      throw new Error(`WP0.6L corruption changed gameplay state in ${locationId}: ${JSON.stringify({ before, after })}`);
    }

    await waitFor(async () => evaluate(`(() => {
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      const overlay = document.querySelector('#ambient-world-corruption');
      return env?.state?.locationId === '${locationId}' && env.state.phase === 'steady' && env.state.darkMix === 0 && corruption?.state?.activeEventId === null && overlay?.getAttribute('aria-hidden') === 'true';
    })()`), 12000);
  }

  await openScenario();
  const productionYard = await yardState();
  if (productionYard.yardRenderer !== 'scene-image' || productionYard.worldWidth !== 1280 || productionYard.worldHeight !== 720) {
    throw new Error(`YSP-10 ambient test did not begin in the production Yard: ${JSON.stringify(productionYard)}`);
  }
  await verifyCurrentLocation('yard', '__SPLICEPIT_YARD_ART__', '__SPLICEPIT_VISUAL_RESET__');

  await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.forceAmbient('yard', 'linger')`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.darkMix > 0.2`));
  await key('b', 'KeyB', 66);
  await waitFor(async () => evaluate(`(() => {
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
    return globalThis.__SPLICEPIT_VISUAL_RESET__?.activeOpeningShell === 'bag'
      && env?.state?.darkMix === 0
      && corruption?.state?.activeEventId === null
      && corruption.state.suppressionReasons.includes('opening-shell');
  })()`));
  await key('b', 'KeyB', 66);

  // Complete onboarding and enter the existing route through the reviewed
  // YSP-10 tunnel path. Keep this smoke focused on corruption semantics rather
  // than duplicating obsolete timed movement coordinates.
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
    const value = await yardState();
    return value?.openingSequenceComplete && value?.objectiveId === 'find-master' && value?.activeOpeningShell === 'map' ? value : null;
  });
  await key('Escape', 'Escape', 27);
  await traverseAuthoredYardToMasterLabTunnel({
    readState: yardState,
    moveLeft: () => holdKey('a', 'KeyA', 65, 90),
    moveRight: () => holdKey('d', 'KeyD', 68, 90),
    moveUp: () => holdKey('w', 'KeyW', 87, 90),
    moveDown: () => holdKey('s', 'KeyS', 83, 90),
    label: 'YSP-10 ambient corruption Yard navigation',
  });
  await waitFor(async () => {
    const value = await yardState();
    return value?.sceneMode === 'master-lab-route' && value?.routeRendered && value?.routeHandoffTarget === 'master-lab-route' ? value : null;
  });
  await verifyCurrentLocation('route', '__SPLICEPIT_ROUTE_ART__', '__SPLICEPIT_VISUAL_RESET__');

  await openScenario('&labTest=1');
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_MASTER_LAB__?.active === true`));
  await verifyCurrentLocation('master-lab', '__SPLICEPIT_MASTER_LAB_ART__', '__SPLICEPIT_MASTER_LAB__');

  await openScenario('&pitTest=1');
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_LOCAL_PIT__?.active === true`));
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__?.glitching === false && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.phase === 'steady'`), 10000);
  await verifyCurrentLocation('local-pit', '__SPLICEPIT_LOCAL_PIT_ART__', '__SPLICEPIT_LOCAL_PIT__');

  await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.suppress('story-test')`);
  await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.triggerAuthored('local-pit', 'rupture')`);
  const authored = await waitFor(async () => evaluate(`(() => {
    const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
    const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
    if (!env || !corruption || corruption.state.activeSource !== 'authored' || env.state.darkMix < 0.25) return null;
    return { environment: { ...env.state }, corruption: { ...corruption.state } };
  })()`));
  if (!authored.environment.transitionIgnoresSuppression || !authored.corruption.suppressionReasons.includes('corruption:story-test')) {
    throw new Error(`WP0.6L authored trigger cannot override suppression: ${JSON.stringify(authored)}`);
  }
  await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.resume('story-test')`);

  console.log('YSP-10 ambient world corruption smoke passed across scene Yard, tunnel route, Master Lab and Local Pit.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
