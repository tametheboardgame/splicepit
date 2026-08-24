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

  const keyParams = (key, code, windowsVirtualKeyCode) => ({
    key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode,
  });

  async function keyDown(key, code, windowsVirtualKeyCode) {
    await cdp('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...keyParams(key, code, windowsVirtualKeyCode) });
  }

  async function keyUp(key, code, windowsVirtualKeyCode) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...keyParams(key, code, windowsVirtualKeyCode) });
  }

  async function tapKey(key, code, windowsVirtualKeyCode, durationMs = 40) {
    await keyDown(key, code, windowsVirtualKeyCode);
    await sleep(durationMs);
    await keyUp(key, code, windowsVirtualKeyCode);
    await sleep(80);
  }

  const state = () => evaluate(`({ ...globalThis.__SPLICEPIT_SANDBOX__, held: [...globalThis.__SPLICEPIT_SANDBOX__.held] })`);

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

  async function assertAnimatedDirection(label, key, code, vk) {
    const before = await state();
    await keyDown(key, code, vk);
    await sleep(150);
    const first = await state();
    await assertVisible(`${label} walk frame A`);
    await sleep(150);
    const second = await state();
    await assertVisible(`${label} walk frame B`);
    await keyUp(key, code, vk);
    await sleep(100);
    const idle = await state();

    if (!first.moving || first.animationFrame === 0) {
      throw new Error(`${label} did not enter walk animation: ${JSON.stringify(first)}`);
    }
    if (!second.moving || second.animationFrame === 0 || second.animationFrame === first.animationFrame) {
      throw new Error(`${label} walk frame did not advance: ${JSON.stringify({ first, second })}`);
    }
    if (idle.moving || idle.animationFrame !== 0) {
      throw new Error(`${label} did not return to idle: ${JSON.stringify(idle)}`);
    }
    if (label.endsWith('right') && !(idle.x > before.x + 20)) throw new Error(`${label} did not move right`);
    if (label.endsWith('left') && !(idle.x < before.x - 20)) throw new Error(`${label} did not move left`);
    if (label.endsWith('up') && !(idle.y < before.y - 20)) throw new Error(`${label} did not move up`);
    if (label.endsWith('down') && !(idle.y > before.y + 20)) throw new Error(`${label} did not move down`);
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

  await waitFor(async () => {
    const snapshot = await evaluate(`globalThis.__SPLICEPIT_SANDBOX__ ? ({ ready: globalThis.__SPLICEPIT_SANDBOX__.ready, error: globalThis.__SPLICEPIT_SANDBOX__.error }) : null`);
    if (snapshot?.error) throw new Error(`Sandbox failed to start: ${snapshot.error}`);
    return snapshot?.ready;
  }, 20000);

  await cdp('Page.bringToFront');
  await evaluate(`(() => {
    window.focus();
    const canvas = document.querySelector('#game canvas');
    canvas?.focus({ preventScroll: true });
    return document.activeElement === canvas;
  })()`);

  const characters = [
    ['1', 'Milo'],
    ['2', 'Theo'],
    ['3', 'Ada'],
    ['4', 'Pip'],
  ];
  const directions = [
    ['ArrowRight', 'ArrowRight', 39, 'right'],
    ['ArrowLeft', 'ArrowLeft', 37, 'left'],
    ['ArrowUp', 'ArrowUp', 38, 'up'],
    ['ArrowDown', 'ArrowDown', 40, 'down'],
  ];

  for (const [digit, name] of characters) {
    await tapKey(digit, `Digit${digit}`, 48 + Number(digit));
    await tapKey('r', 'KeyR', 82);
    await assertVisible(`${name} idle`);

    for (const [key, code, vk, direction] of directions) {
      await tapKey('r', 'KeyR', 82);
      await assertAnimatedDirection(`${name} ${direction}`, key, code, vk);
    }
  }

  const switched = await state();
  if (switched.character !== 'pip') throw new Error(`Character switch failed: ${JSON.stringify(switched)}`);

  const layout = await evaluate(`({ canvases: document.querySelectorAll('#game canvas').length, width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight })`);
  if (layout.canvases !== 1 || layout.bodyWidth !== layout.width || layout.bodyHeight !== layout.height) {
    throw new Error(`Sandbox is not one full-screen canvas: ${JSON.stringify(layout)}`);
  }

  console.log('Animated protagonist walk-cycle smoke passed for all 4 characters and directions.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
