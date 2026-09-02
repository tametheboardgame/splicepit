import { spawn } from 'node:child_process';
import { traverseAuthoredYardToMasterLabTunnel } from './yard-scene-navigation.mjs';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9264;
const gamePort = 8114;
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

  async function key(keyName, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(110);
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(120);
  }

  async function snapshot() {
    return evaluate(`(() => ({
      yard: globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null,
      image: globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ ? ({ ...globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ }) : null,
    }))()`);
  }

  async function waitForPrompt(id) {
    return waitFor(async () => {
      const value = (await snapshot()).yard;
      return value?.tutorialPromptId === id ? value : null;
    }, 10000);
  }

  async function moveAxis(axis, target, tolerance = 7, maxSteps = 45) {
    for (let step = 0; step < maxSteps; step += 1) {
      const current = (await snapshot()).yard;
      if (!current) throw new Error('YSP-10 lost Yard debug state while moving.');
      if (current.sceneMode !== 'yard') return current;
      const value = axis === 'x' ? current.playerX : current.playerY;
      const delta = target - value;
      if (Math.abs(delta) <= tolerance) return current;
      const positive = delta > 0;
      const control = axis === 'x'
        ? (positive ? ['d', 'KeyD', 68] : ['a', 'KeyA', 65])
        : (positive ? ['s', 'KeyS', 83] : ['w', 'KeyW', 87]);
      const duration = Math.min(130, Math.max(45, Math.abs(delta) * 2.2));
      await holdKey(control[0], control[1], control[2], duration);
    }
    throw new Error(`YSP-10 could not reach ${axis}=${target}: ${JSON.stringify((await snapshot()).yard)}`);
  }

  async function selectionVisualStats() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const ctx = canvas?.getContext('2d');
      if (!(canvas instanceof HTMLCanvasElement) || !ctx) return null;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colours = new Set();
      for (let pixel = 0; pixel < data.length / 4; pixel += 11) {
        const i = pixel * 4;
        colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      }
      return { uniqueColours: colours.size };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await snapshot()).yard?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await snapshot()).yard?.ready === true, 20000);
  await cdp('Page.bringToFront');

  const selection = await waitFor(async () => {
    const current = await selectionVisualStats();
    return current?.uniqueColours > 4000 ? current : null;
  }, 10000);
  if (selection.uniqueColours <= 4000) {
    throw new Error(`YSP-10 apprentice selection still resembles the low-detail legacy backing: ${JSON.stringify(selection)}`);
  }

  await key('Enter', 'Enter', 13);
  const entered = await waitFor(async () => {
    const value = await snapshot();
    return value.yard?.phase === 'confirmed' && value.yard.yardRendered && value.image?.active ? value : null;
  }, 20000);
  if (entered.yard.scenePackId !== 'yard-bright-scene-ysp10-r1') {
    throw new Error(`YSP-10 revised scene pack is not active: ${JSON.stringify(entered.yard)}`);
  }
  if (Math.abs(entered.yard.playerX - 575) > 1 || entered.yard.playerY > 450) {
    throw new Error(`YSP-10 spawn was not raised above the mobile tutorial-card zone: ${JSON.stringify(entered.yard)}`);
  }

  await waitForPrompt('movement');
  // Give the movement tutorial comfortable timing margin without reaching the
  // west pit collider. The previous 180 ms sat too close to the completion
  // threshold and could miss on a busy hosted runner.
  await holdKey('d', 'KeyD', 68, 280);
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
    const current = (await snapshot()).yard;
    return current?.objectiveId === 'find-master' && current.openingSequenceComplete ? current : null;
  }, 10000);
  await key('Escape', 'Escape', 27);
  await waitFor(async () => (await snapshot()).yard?.activeOpeningShell === null);

  // Reproduce the human-gate collision bug: approach the old 50px seam from
  // above and try to descend. The new upper guard must stop the feet before the
  // visually impossible pit/wall overlap seen on the phone screenshot.
  await moveAxis('x', 650);
  await moveAxis('y', 270);
  await moveAxis('x', 785);
  const beforePit = (await snapshot()).yard;
  await holdKey('s', 'KeyS', 83, 900);
  const afterPit = (await snapshot()).yard;
  if (afterPit.playerY >= 288 || afterPit.collisionCount <= beforePit.collisionCount) {
    throw new Error(`YSP-10 pit seam can still be descended through: ${JSON.stringify({ beforePit, afterPit })}`);
  }

  // Move back into the central court, then behind the right foreground cryo /
  // shipping-container stack. The upper stack is no longer a giant collider;
  // its exact approved pixels should redraw in front of the protagonist.
  await moveAxis('x', 650);
  await moveAxis('y', 570);
  await moveAxis('x', 1050);
  const behindCrates = await waitFor(async () => {
    const value = await snapshot();
    return value.yard?.playerX > 1000 && value.yard?.playerY > 545 && value.yard?.playerY < 595 &&
      value.image?.activeOccluderIds?.includes('cryo-container-upper-stack') ? value : null;
  }, 5000);
  if (!behindCrates.image.activeOccluderIds.includes('cryo-container-upper-stack')) {
    throw new Error(`YSP-10 foreground container depth did not activate: ${JSON.stringify(behindCrates)}`);
  }

  // The human review also found that the Yard appeared to link nowhere. Follow
  // the same visible, collision-aware route used by the production desktop and
  // touch regressions: under the pit, through the foreground band, then north
  // through the actual Master Lab doorway.
  await traverseAuthoredYardToMasterLabTunnel({
    readState: async () => (await snapshot()).yard,
    moveLeft: () => holdKey('a', 'KeyA', 65, 90),
    moveRight: () => holdKey('d', 'KeyD', 68, 90),
    moveUp: () => holdKey('w', 'KeyW', 87, 90),
    moveDown: () => holdKey('s', 'KeyS', 83, 90),
    label: 'YSP-10 human-gate visible tunnel navigation',
  });
  const linked = await waitFor(async () => {
    const value = (await snapshot()).yard;
    return value?.sceneMode === 'master-lab-route' ? value : null;
  }, 5000);
  if (linked.routeHandoffTarget !== 'master-lab-route' || linked.routeHandoffExitId !== 'master-lab-tunnel') {
    throw new Error(`YSP-10 visible Lab tunnel did not link to the opening route: ${JSON.stringify(linked)}`);
  }

  console.log(`YSP-10 human-gate revision smoke passed: ${JSON.stringify({
    selectionUniqueColours: selection.uniqueColours,
    spawn: { x: entered.yard.playerX, y: entered.yard.playerY },
    pitBlockedAtY: afterPit.playerY,
    cratePosition: { x: behindCrates.yard.playerX, y: behindCrates.yard.playerY },
    crateOccluder: 'cryo-container-upper-stack',
    handoff: linked.routeHandoffTarget,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
