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

  async function visiblePixels() {
    return evaluate(`(() => {
      const state = globalThis.__SPLICEPIT_SANDBOX__;
      const canvas = document.querySelector('#game canvas');
      const ctx = canvas?.getContext('2d');
      if (!state || !canvas || !ctx) return { count: 0, width: 0, height: 0 };
      const sx = Math.max(0, Math.floor(state.x - 70));
      const sy = Math.max(0, Math.floor(state.y - 200));
      const sw = Math.min(140, canvas.width - sx);
      const sh = Math.min(205, canvas.height - sy);
      const data = ctx.getImageData(sx, sy, sw, sh).data;
      let count = 0, minX = sw, minY = sh, maxX = -1, maxY = -1;
      for (let py = 0; py < sh; py += 1) {
        for (let px = 0; px < sw; px += 1) {
          const i = (py * sw + px) * 4;
          if (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8) {
            count += 1;
            minX = Math.min(minX, px); maxX = Math.max(maxX, px);
            minY = Math.min(minY, py); maxY = Math.max(maxY, py);
          }
        }
      }
      return { count, width: maxX >= 0 ? maxX - minX + 1 : 0, height: maxY >= 0 ? maxY - minY + 1 : 0 };
    })()`);
  }

  async function assertVisible(label) {
    const pixels = await visiblePixels();
    if (pixels.count < 300 || pixels.width < 30 || pixels.height < 80) {
      throw new Error(`${label} is not visibly rendered: ${JSON.stringify(pixels)}`);
    }
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
  await assertVisible('Milo down');

  await holdKey('ArrowRight', 'ArrowRight', 39);
  const right = await state();
  if (!(right.x > initial.x + 20) || right.direction !== 'right') throw new Error(`Right movement failed: ${JSON.stringify({ initial, right })}`);
  await assertVisible('Milo right');

  await holdKey('ArrowUp', 'ArrowUp', 38);
  const up = await state();
  if (!(up.y < right.y - 20) || up.direction !== 'up') throw new Error(`Up movement failed: ${JSON.stringify({ right, up })}`);
  await assertVisible('Milo up');

  await holdKey('ArrowLeft', 'ArrowLeft', 37);
  const left = await state();
  if (!(left.x < up.x - 20) || left.direction !== 'left') throw new Error(`Left movement failed: ${JSON.stringify({ up, left })}`);
  await assertVisible('Milo left');

  await holdKey('ArrowDown', 'ArrowDown', 40);
  const down = await state();
  if (!(down.y > left.y + 20) || down.direction !== 'down') throw new Error(`Down movement failed: ${JSON.stringify({ left, down })}`);
  await assertVisible('Milo down after movement');

  for (const [key, name] of [['2', 'Theo'], ['3', 'Ada'], ['4', 'Pip']]) {
    await holdKey(key, `Digit${key}`, 48 + Number(key), 40);
    await assertVisible(`${name} down`);
  }

  const switched = await state();
  if (switched.character !== 'pip') throw new Error(`Character switch failed: ${JSON.stringify(switched)}`);

  const layout = await evaluate(`({ canvases: document.querySelectorAll('#game canvas').length, width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight })`);
  if (layout.canvases !== 1 || layout.bodyWidth !== layout.width || layout.bodyHeight !== layout.height) {
    throw new Error(`Sandbox is not one full-screen canvas: ${JSON.stringify(layout)}`);
  }

  console.log('Raw canvas visual movement smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
