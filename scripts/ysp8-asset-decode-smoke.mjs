import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9258;
const gamePort = 8108;
const expectedWidth = 1280;
const expectedHeight = 720;
const expectedBytes = 143796;
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

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/` });
  await waitFor(() => evaluate(`document.readyState === 'complete'`));

  const result = await evaluate(`(async () => {
    const response = await fetch('/generated/ysp8/yard-dark-base.webp', { cache: 'no-store' });
    if (!response.ok) throw new Error('YSP-8 base fetch failed: ' + response.status);
    const bytes = await response.arrayBuffer();
    const blob = new Blob([bytes], { type: 'image/webp' });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return { bytes: bytes.byteLength, width: image.naturalWidth, height: image.naturalHeight, complete: image.complete };
    } finally {
      URL.revokeObjectURL(url);
    }
  })()`);

  if (!result?.complete || result.bytes !== expectedBytes || result.width !== expectedWidth || result.height !== expectedHeight) {
    throw new Error(`YSP-8 browser decode mismatch: ${JSON.stringify(result)}`);
  }

  console.log(`YSP-8 browser decode passed: ${result.width}x${result.height}, ${result.bytes} bytes`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
