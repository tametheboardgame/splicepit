import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9226;
const gamePort = 8084;
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
  const yard = await waitFor(async () => {
    const current = await state();
    return current?.phase === 'confirmed' && current?.yardRendered ? current : null;
  });

  if (yard.objectiveId !== 'yard-orientation' || yard.objectiveStep !== 1 || yard.objectiveCount !== 2) {
    throw new Error(`Opening objective shell was not initialised: ${JSON.stringify(yard)}`);
  }
  if (yard.openingInventory?.length !== 2) {
    throw new Error(`Opening inventory was not initialised: ${JSON.stringify(yard.openingInventory)}`);
  }

  await key('b', 'KeyB', 66);
  const bag = await waitFor(async () => (await state())?.activeOpeningShell === 'bag' ? state() : null);
  if (bag.phase !== 'confirmed') throw new Error(`Bag left the Yard runtime: ${JSON.stringify(bag)}`);

  const bagPixels = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return 0;
    const data = ctx.getImageData(220, 80, 840, 560).data;
    let parchment = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 220 && data[i + 1] > 205 && data[i + 2] > 145) parchment += 1;
    }
    return parchment;
  })()`);
  if (bagPixels < 50000) throw new Error(`Bag shell did not visibly render: ${bagPixels}`);

  await key('m', 'KeyM', 77);
  const map = await waitFor(async () => (await state())?.activeOpeningShell === 'map' ? state() : null);
  if (map.objectiveTitle !== 'Get your bearings') {
    throw new Error(`Map did not carry the current objective: ${JSON.stringify(map)}`);
  }

  await key('Escape', 'Escape', 27);
  const closed = await waitFor(async () => {
    const current = await state();
    return current?.activeOpeningShell === null && current?.phase === 'confirmed' ? current : null;
  });
  if (!closed.yardRendered) throw new Error(`Esc did not return cleanly to the Yard: ${JSON.stringify(closed)}`);

  console.log(`WP0.6B opening shells smoke passed: ${JSON.stringify({ bagPixels, closed })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
