import { spawn } from 'node:child_process';

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
      if (!current) throw new Error('YSP-10B lost Yard debug state while moving.');
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
    throw new Error(`YSP-10B could not reach ${axis}=${target}: ${JSON.stringify((await snapshot()).yard)}`);
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

  const guidance = await waitFor(async () => {
    const value = await snapshot();
    return value.image?.exitGuidanceVisible && value.image.exitGuidanceExitId === 'master-lab-south-path' ? value : null;
  }, 5000);
  if (guidance.image.locatorColour !== null) {
    throw new Error(`YSP-10B player locator should not be visible in the open central court: ${JSON.stringify(guidance.image)}`);
  }

  // Phone review found that the character could stand directly on the tall
  // DON'T LOOK DOWN sign above the pit. Approach its west edge from open ground;
  // collision must stop before the player's feet enter the sign/wall surface.
  await moveAxis('x', 650);
  await moveAxis('y', 270);
  const beforeSign = (await snapshot()).yard;
  await holdKey('d', 'KeyD', 68, 900);
  const afterSign = (await snapshot()).yard;
  if (afterSign.playerX > 750 || afterSign.collisionCount <= beforeSign.collisionCount) {
    throw new Error(`YSP-10B warning sign is still standable: ${JSON.stringify({ beforeSign, afterSign })}`);
  }

  // Move into the walk-behind lane. Ordinary ground immediately left of the
  // container silhouette must not be redrawn over the player and therefore must
  // not trigger the locator.
  await moveAxis('x', 650);
  await moveAxis('y', 570);
  await moveAxis('x', 940);
  const clearGround = await waitFor(async () => {
    const value = await snapshot();
    return value.yard?.playerX > 915 && value.yard?.playerX < 975 && value.yard?.playerY > 545 && value.yard?.playerY < 595 ? value : null;
  }, 5000);
  if (clearGround.image.locatorVisible) {
    throw new Error(`YSP-10B ordinary ground beside the cryo stack still hides the player: ${JSON.stringify(clearGround.image)}`);
  }

  // Behind the actual upper container silhouette the scene pixels should cover
  // the protagonist, and the apprentice-colour locator should appear above it.
  await moveAxis('x', 1050);
  const behindCrates = await waitFor(async () => {
    const value = await snapshot();
    return value.yard?.playerX > 1000 && value.yard?.playerY > 545 && value.yard?.playerY < 595 &&
      value.image?.locatorVisible && value.image?.locatorOccluderIds?.includes('cryo-container-upper-stack') ? value : null;
  }, 5000);
  if (behindCrates.image.locatorColour !== '#db634b') {
    throw new Error(`YSP-10B Milo locator did not use his authored accent colour: ${JSON.stringify(behindCrates.image)}`);
  }

  // The obvious central dirt path at the south edge is now the primary readable
  // way out. Move back into the open court and follow it down; this must hand off
  // to the existing Master Lab route without requiring the hidden side tunnel.
  await moveAxis('x', 575);
  for (let step = 0; step < 30; step += 1) {
    const current = (await snapshot()).yard;
    if (current.sceneMode === 'master-lab-route') break;
    await holdKey('s', 'KeyS', 83, 90);
  }
  const linked = await waitFor(async () => {
    const value = (await snapshot()).yard;
    return value?.sceneMode === 'master-lab-route' ? value : null;
  }, 5000);
  if (linked.routeHandoffTarget !== 'master-lab-route' || linked.routeHandoffExitId !== 'master-lab-south-path') {
    throw new Error(`YSP-10B south dirt path did not link to the opening route: ${JSON.stringify(linked)}`);
  }

  console.log(`YSP-10B spatial/depth human-gate smoke passed: ${JSON.stringify({
    selectionUniqueColours: selection.uniqueColours,
    spawn: { x: entered.yard.playerX, y: entered.yard.playerY },
    signBlockedAtX: afterSign.playerX,
    clearGround: { x: clearGround.yard.playerX, y: clearGround.yard.playerY },
    cratePosition: { x: behindCrates.yard.playerX, y: behindCrates.yard.playerY },
    locatorColour: behindCrates.image.locatorColour,
    handoffExit: linked.routeHandoffExitId,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
