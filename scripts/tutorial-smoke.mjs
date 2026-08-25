import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9225;
const gamePort = 8083;
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
    await sleep(80);
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
  const initial = await waitFor(async () => {
    const current = await state();
    return current?.phase === 'confirmed' && current?.yardRendered && current?.tutorialPromptVisible ? current : null;
  });

  if (initial.tutorialPromptId !== 'movement') {
    throw new Error(`Movement tutorial was not the first Yard context: ${JSON.stringify(initial)}`);
  }
  const expectedHints = ['↑/W', '←/A', '↓/S', '→/D'];
  if (JSON.stringify(initial.tutorialHintLabels) !== JSON.stringify(expectedHints)) {
    throw new Error(`Movement tutorial bindings are not semantic: ${JSON.stringify(initial.tutorialHintLabels)}`);
  }
  if (initial.tutorialCompleted.length !== 0) {
    throw new Error(`Movement tutorial started pre-completed: ${JSON.stringify(initial.tutorialCompleted)}`);
  }

  const promptPixels = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(20, 590, 620, 120).data;
    let parchment = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 205 && data[i + 1] > 195 && data[i + 2] > 150) parchment += 1;
    }
    return parchment;
  })()`);
  if (!promptPixels || promptPixels < 2000) {
    throw new Error(`Tutorial prompt did not visibly render over the Yard: ${promptPixels}`);
  }

  await holdKey('d', 'KeyD', 68, 220);
  const moved = await waitFor(async () => {
    const current = await state();
    return current?.tutorialCompleted?.includes('movement') ? current : null;
  });
  if (!(moved.playerX > initial.playerX)) {
    throw new Error(`Tutorial input blocked world movement: ${JSON.stringify({ initial, moved })}`);
  }

  const completed = await waitFor(async () => {
    const current = await state();
    return current?.tutorialCompleted?.includes('movement') && !current?.tutorialPromptVisible ? current : null;
  }, 5000);
  if (completed.phase !== 'confirmed' || !completed.yardRendered) {
    throw new Error(`Tutorial completion interrupted the Yard: ${JSON.stringify(completed)}`);
  }

  const modalUi = await evaluate(`Boolean(document.querySelector('[role="dialog"], .modal, .tutorial-modal'))`);
  if (modalUi) throw new Error('WP0.6A tutorial rendered as a modal interruption.');

  console.log(`WP0.6A tutorial smoke passed: ${JSON.stringify({ initial, completed })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
