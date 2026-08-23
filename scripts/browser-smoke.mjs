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
process.on('SIGINT', () => { cleanup(); process.exit(130); });

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
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed';
      throw new Error(detail);
    }
    return result.result?.value;
  }

  async function holdKey(key, code, windowsVirtualKeyCode, durationMs = 250) {
    const params = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode };
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
    await sleep(100);
  }

  async function pressKey(key, code, windowsVirtualKeyCode) {
    await holdKey(key, code, windowsVirtualKeyCode, 40);
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

  await waitFor(async () => Boolean(await evaluate(`globalThis.__SPLICEPIT_GAME__?.scene?.isActive('SpriteSandbox')`)), 20000);

  const initial = await evaluate(`(() => {
    const scene = __SPLICEPIT_GAME__.scene.getScene('SpriteSandbox');
    return { x: scene.player.x, y: scene.player.y, texture: scene.player.texture.key };
  })()`);

  await holdKey('ArrowRight', 'ArrowRight', 39);
  const afterRight = await evaluate(`(() => { const p = __SPLICEPIT_GAME__.scene.getScene('SpriteSandbox').player; return { x: p.x, y: p.y, frame: p.frame.name }; })()`);
  if (!(afterRight.x > initial.x)) throw new Error(`Right movement failed: ${JSON.stringify({ initial, afterRight })}`);

  await holdKey('ArrowLeft', 'ArrowLeft', 37);
  const afterLeft = await evaluate(`(() => { const p = __SPLICEPIT_GAME__.scene.getScene('SpriteSandbox').player; return { x: p.x, y: p.y, frame: p.frame.name }; })()`);
  if (!(afterLeft.x < afterRight.x)) throw new Error(`Left movement failed: ${JSON.stringify({ afterRight, afterLeft })}`);

  await holdKey('ArrowUp', 'ArrowUp', 38);
  const afterUp = await evaluate(`(() => { const p = __SPLICEPIT_GAME__.scene.getScene('SpriteSandbox').player; return { x: p.x, y: p.y, frame: p.frame.name }; })()`);
  if (!(afterUp.y < afterLeft.y)) throw new Error(`Up movement failed: ${JSON.stringify({ afterLeft, afterUp })}`);

  await holdKey('ArrowDown', 'ArrowDown', 40);
  const afterDown = await evaluate(`(() => { const p = __SPLICEPIT_GAME__.scene.getScene('SpriteSandbox').player; return { x: p.x, y: p.y, frame: p.frame.name }; })()`);
  if (!(afterDown.y > afterUp.y)) throw new Error(`Down movement failed: ${JSON.stringify({ afterUp, afterDown })}`);

  await pressKey('2', 'Digit2', 50);
  const switched = await evaluate(`__SPLICEPIT_GAME__.scene.getScene('SpriteSandbox').player.texture.key`);
  if (switched !== 'sandbox-theo') throw new Error(`Character switch failed: ${switched}`);

  const layout = await evaluate(`({ width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight, canvases: document.querySelectorAll('#game canvas').length })`);
  if (layout.canvases !== 1 || layout.bodyWidth !== layout.width || layout.bodyHeight !== layout.height) {
    throw new Error(`Sandbox is not a single full-screen canvas: ${JSON.stringify(layout)}`);
  }

  console.log('Sprite sandbox browser smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
