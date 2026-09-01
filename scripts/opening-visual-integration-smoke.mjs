import { spawn } from 'node:child_process';
import { traverseAuthoredYardToMasterLabTunnel } from './yard-scene-navigation.mjs';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9240;
const gamePort = 8098;
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

const server = spawn('python3', ['-m', 'http.server', String(gamePort), '--bind', '127.0.0.1', '--directory', 'dist'], { stdio: ['ignore', 'pipe', 'pipe'] });
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

  async function verifyLocation(locationId, artGlobalName, playerGlobalName, canvasId, shellProperty, expectDarkPixels = true) {
    await waitFor(async () => evaluate(`(() => {
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      const art = globalThis['${artGlobalName}'];
      return env?.state?.locationId === '${locationId}' && art?.active === true && art?.brightRendered === true;
    })()`));

    await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
    await waitFor(async () => evaluate(`globalThis['${artGlobalName}']?.darkMix === 0`));
    const bright = await evaluate(`(() => {
      const canvas = document.querySelector('#${canvasId}');
      const ctx = canvas?.getContext('2d');
      const state = globalThis['${playerGlobalName}'];
      if (!canvas || !ctx || !state) return null;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      globalThis.__WP06M_BRIGHT_PIXELS__ = data.slice();
      const colours = new Set();
      for (let y = 24; y < canvas.height - 24; y += 6) {
        for (let x = 24; x < canvas.width - 24; x += 6) {
          const i = (y * canvas.width + x) * 4;
          colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
        }
      }
      return {
        uniqueColours: colours.size,
        width: canvas.width,
        height: canvas.height,
        player: { x: state.playerX ?? null, y: state.playerY ?? null, zone: state.zone ?? null, stageId: state.stageId ?? null },
      };
    })()`);
    if (!bright || bright.width !== 1280 || bright.height !== 720 || bright.uniqueColours < 24) {
      throw new Error(`Opening visual ${locationId} bright contract failed: ${JSON.stringify(bright)}`);
    }

    await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.clearForce(); globalThis.__SPLICEPIT_CORRUPTION__.reschedule()`);
    await evaluate(`globalThis.__SPLICEPIT_CORRUPTION__.triggerAuthored('${locationId}', 'linger')`);
    await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.darkMix > 0.95 && globalThis['${artGlobalName}']?.darkMix > 0.95`));

    const dark = await evaluate(`(() => {
      const canvas = document.querySelector('#${canvasId}');
      const ctx = canvas?.getContext('2d');
      const brightPixels = globalThis.__WP06M_BRIGHT_PIXELS__;
      if (!canvas || !ctx || !brightPixels) return null;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let changed = 0;
      for (let y = 24; y < canvas.height - 24; y += 5) {
        for (let x = 24; x < canvas.width - 24; x += 5) {
          const i = (y * canvas.width + x) * 4;
          if (Math.abs(data[i] - brightPixels[i]) + Math.abs(data[i + 1] - brightPixels[i + 1]) + Math.abs(data[i + 2] - brightPixels[i + 2]) > 42) changed += 1;
        }
      }
      return { changed };
    })()`);
    if (!dark || (expectDarkPixels ? dark.changed < 120 : dark.changed > 8)) {
      throw new Error(`Opening visual ${locationId} dark-boundary contract failed: ${JSON.stringify({ dark, expectDarkPixels })}`);
    }

    await key('b', 'KeyB', 66);
    const shell = await waitFor(async () => evaluate(`(() => {
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      const state = globalThis['${playerGlobalName}'];
      if (!env || !corruption || !state || state['${shellProperty}'] !== 'bag') return null;
      return { darkMix: env.state.darkMix, reasons: [...corruption.state.suppressionReasons], shell: state['${shellProperty}'] };
    })()`));
    if (shell.darkMix <= 0.1 || !shell.reasons.includes('opening-shell')) {
      throw new Error(`Opening visual ${locationId} UI/corruption compatibility failed: ${JSON.stringify(shell)}`);
    }
    await key('Escape', 'Escape', 27);

    await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.phase === 'steady' && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.darkMix === 0`), 12000);
    const after = await evaluate(`(() => {
      const state = globalThis['${playerGlobalName}'];
      return state ? { x: state.playerX ?? null, y: state.playerY ?? null, zone: state.zone ?? null, stageId: state.stageId ?? null } : null;
    })()`);
    if (JSON.stringify(bright.player) !== JSON.stringify(after)) {
      throw new Error(`Opening visual ${locationId} changed gameplay state: ${JSON.stringify({ before: bright.player, after })}`);
    }
    return { locationId, uniqueColours: bright.uniqueColours, changedPixels: dark.changed };
  }

  const results = [];
  await openScenario();
  const scene = await yardState();
  if (scene.yardRenderer !== 'scene-image' || scene.worldWidth !== 1280 || scene.worldHeight !== 720 || scene.scenePackId !== 'yard-bright-scene-ysp10-r1') {
    throw new Error(`YSP-10 final visual integration did not begin in the reviewed scene Yard: ${JSON.stringify(scene)}`);
  }
  results.push(await verifyLocation('yard', '__SPLICEPIT_YARD_ART__', '__SPLICEPIT_VISUAL_RESET__', 'visual-reset-stage', 'activeOpeningShell'));

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
    label: 'YSP-10 final opening visual Yard navigation',
  });
  await waitFor(async () => {
    const value = await yardState();
    return value?.sceneMode === 'master-lab-route' && value?.routeRendered && value?.routeHandoffTarget === 'master-lab-route' ? value : null;
  });
  results.push(await verifyLocation('route', '__SPLICEPIT_ROUTE_ART__', '__SPLICEPIT_VISUAL_RESET__', 'visual-reset-stage', 'activeOpeningShell'));

  await openScenario('&labTest=1');
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_MASTER_LAB__?.active === true && globalThis.__SPLICEPIT_MASTER_LAB__?.rendered === true`));
  results.push(await verifyLocation('master-lab', '__SPLICEPIT_MASTER_LAB_ART__', '__SPLICEPIT_MASTER_LAB__', 'master-lab-stage', 'activeShell'));

  await openScenario('&pitTest=1');
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_LOCAL_PIT__?.active === true && globalThis.__SPLICEPIT_LOCAL_PIT__?.rendered === true`));
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__?.glitching === false && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.phase === 'steady'`), 10000);
  results.push(await verifyLocation('local-pit', '__SPLICEPIT_LOCAL_PIT_ART__', '__SPLICEPIT_LOCAL_PIT__', 'local-pit-stage', 'activeShell'));

  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(250);
  const mobile = await evaluate(`(() => {
    const stage = document.querySelector('#local-pit-stage');
    const corruption = document.querySelector('#ambient-world-corruption');
    if (!stage || !corruption) return null;
    const a = stage.getBoundingClientRect();
    const b = corruption.getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight },
      stage: { left: a.left, top: a.top, width: a.width, height: a.height },
      corruption: { left: b.left, top: b.top, width: b.width, height: b.height },
      overflow: document.body.scrollWidth > innerWidth || document.body.scrollHeight > innerHeight,
    };
  })()`);
  if (!mobile || mobile.overflow || mobile.stage.width > 390.5 || mobile.stage.height > 844.5
      || Math.abs(mobile.stage.left - mobile.corruption.left) > 1
      || Math.abs(mobile.stage.top - mobile.corruption.top) > 1
      || Math.abs(mobile.stage.width - mobile.corruption.width) > 1
      || Math.abs(mobile.stage.height - mobile.corruption.height) > 1) {
    throw new Error(`Opening visual mobile stack integration failed: ${JSON.stringify(mobile)}`);
  }

  console.log(`YSP-10 final opening visual integration smoke passed: ${JSON.stringify({ results, mobile })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
