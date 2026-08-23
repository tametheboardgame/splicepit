import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9222;
const gamePort = 8080;
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

  async function holdKey(key, code, windowsVirtualKeyCode, durationMs = 250) {
    const params = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode };
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
    await sleep(100);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/` });

  await waitFor(async () => Boolean(await evaluate(`globalThis.__SPLICEPIT_SANDBOX__?.ready`)), 20000);

  const state = () => evaluate(`({ ...globalThis.__SPLICEPIT_SANDBOX__, held: [...globalThis.__SPLICEPIT_SANDBOX__.held] })`);
  const initial = await state();

  await holdKey('ArrowRight', 'ArrowRight', 39);
  const right = await state();
  if (!(right.x > initial.x + 20)) throw new Error(`Right movement failed: ${JSON.stringify({ initial, right })}`);

  await holdKey('ArrowUp', 'ArrowUp', 38);
  const up = await state();
  if (!(up.y < right.y - 20)) throw new Error(`Up movement failed: ${JSON.stringify({ right, up })}`);

  await holdKey('ArrowLeft', 'ArrowLeft', 37);
  const left = await state();
  if (!(left.x < up.x - 20)) throw new Error(`Left movement failed: ${JSON.stringify({ up, left })}`);

  await holdKey('ArrowDown', 'ArrowDown', 40);
  const down = await state();
  if (!(down.y > left.y + 20)) throw new Error(`Down movement failed: ${JSON.stringify({ left, down })}`);

  await holdKey('2', 'Digit2', 50, 40);
  const switched = await state();
  if (switched.character !== 'theo') throw new Error(`Character switch failed: ${JSON.stringify(switched)}`);

  const layout = await evaluate(`({ canvases: document.querySelectorAll('#game canvas').length, width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight })`);
  if (layout.canvases !== 1 || layout.bodyWidth !== layout.width || layout.bodyHeight !== layout.height) {
    throw new Error(`Sandbox is not one full-screen canvas: ${JSON.stringify(layout)}`);
  }

  console.log('Raw canvas movement smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
