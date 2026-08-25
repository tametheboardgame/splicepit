import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9229;
const gamePort = 8087;
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
    await sleep(90);
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function waitForPrompt(id) {
    return waitFor(async () => {
      const current = await state();
      return current?.phase === 'confirmed' && current?.tutorialPromptId === id && !current?.tutorialPromptCompleting
        ? current
        : null;
    }, 8000);
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

  await key('Enter', 'Enter', 13);
  const movement = await waitForPrompt('movement');
  if (movement.objectiveId !== 'yard-orientation') {
    throw new Error(`Opening objective did not begin with Yard orientation: ${JSON.stringify(movement)}`);
  }

  await holdKey('d', 'KeyD', 68, 180);
  await waitForPrompt('interact');

  await key('e', 'KeyE', 69);
  await waitForPrompt('bag');

  await key('b', 'KeyB', 66);
  const chooseBack = await waitForPrompt('confirm-cancel');
  if (chooseBack.activeOpeningShell !== 'bag') {
    throw new Error(`Confirm/Back lesson was not contextualised inside the Bag: ${JSON.stringify(chooseBack)}`);
  }

  await key('Enter', 'Enter', 13);
  const afterConfirm = await state();
  if (afterConfirm.tutorialCompleted.includes('confirm-cancel')) {
    throw new Error(`Confirm/Back completed before Back was used: ${JSON.stringify(afterConfirm)}`);
  }

  await key('Escape', 'Escape', 27);
  const mapPrompt = await waitForPrompt('map');
  if (mapPrompt.phase !== 'confirmed' || mapPrompt.activeOpeningShell !== null) {
    throw new Error(`Back lesson escaped the Yard instead of closing the Bag: ${JSON.stringify(mapPrompt)}`);
  }

  await key('m', 'KeyM', 77);
  const finalState = await waitFor(async () => {
    const current = await state();
    return current?.objectiveId === 'find-master' && current?.openingSequenceComplete ? current : null;
  }, 8000);

  const expectedCompleted = ['movement', 'interact', 'bag', 'confirm-cancel', 'map'];
  if (JSON.stringify(finalState.tutorialCompleted) !== JSON.stringify(expectedCompleted)) {
    throw new Error(`Opening tutorial did not complete in authored order: ${JSON.stringify(finalState.tutorialCompleted)}`);
  }
  if (finalState.activeOpeningShell !== 'map') {
    throw new Error(`Final Master objective was not revealed in the open Map: ${JSON.stringify(finalState)}`);
  }
  if (!finalState.objectiveDetail.includes('splice fight of his life') || !finalState.objectiveDetail.includes('owes some very bad people')) {
    throw new Error(`Master objective lost the locked fight/debt stakes: ${JSON.stringify(finalState.objectiveDetail)}`);
  }

  console.log(`WP0.6C opening objective smoke passed: ${JSON.stringify({
    completed: finalState.tutorialCompleted,
    objectiveId: finalState.objectiveId,
    objectiveTitle: finalState.objectiveTitle,
    activeOpeningShell: finalState.activeOpeningShell,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
