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

  async function waitForReady() {
    return waitFor(async () => {
      const state = await evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
      if (state?.error) throw new Error(`Visual reset stage failed to start: ${state.error}`);
      return state?.ready ? state : null;
    }, 20000);
  }

  async function state() {
    return evaluate(`({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ })`);
  }

  async function key(key, code, vk, text = '') {
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text, unmodifiedText: text,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
    });
    await sleep(50);
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
  await waitForReady();
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitForReady();
  await cdp('Page.bringToFront');

  const initial = await state();
  if (initial.selectedAvatarId !== 'milo' || initial.loadedFromSave || initial.saved || initial.phase !== 'select') {
    throw new Error(`Unexpected clean visual-reset state: ${JSON.stringify(initial)}`);
  }

  const rejectedUiPresent = await evaluate(`Boolean(
    document.querySelector('.character-select-shell, .character-tab, #identity-form, #character-preview') ||
    globalThis.__SPLICEPIT_CHARACTER_SELECT__
  )`);
  if (rejectedUiPresent) throw new Error('Rejected WP0.4E terminal/form presentation is still reachable at boot.');

  const layout = await evaluate(`({
    canvases: document.querySelectorAll('#visual-reset-stage').length,
    captureInputs: document.querySelectorAll('#player-name-capture').length,
    width: innerWidth,
    bodyWidth: document.body.scrollWidth,
  })`);
  if (layout.canvases !== 1 || layout.captureInputs !== 1 || layout.bodyWidth > layout.width) {
    throw new Error(`Visual reset layout contract failed: ${JSON.stringify(layout)}`);
  }

  const canvasHash = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return 0;
    const data = ctx.getImageData(100, 100, 760, 340).data;
    let hash = 0;
    for (let i = 0; i < data.length; i += 64) {
      hash = (hash + data[i] * 3 + data[i + 1] * 5 + data[i + 2] * 7) % 2147483647;
    }
    return hash;
  })()`);
  if (!canvasHash) throw new Error('Visual reset canvas did not render.');

  await key('ArrowRight', 'ArrowRight', 39);
  let current = await state();
  if (current.selectedAvatarId !== 'theo') throw new Error(`Keyboard selection did not move to Theo: ${JSON.stringify(current)}`);

  await key('Enter', 'Enter', 13);
  current = await state();
  if (current.phase !== 'name') throw new Error(`Enter did not start in-canvas naming: ${JSON.stringify(current)}`);

  await key('w', 'KeyW', 87, 'w');
  await key('a', 'KeyA', 65, 'a');
  await key('s', 'KeyS', 83, 's');
  await key('d', 'KeyD', 68, 'd');
  current = await state();
  if (current.playerName !== 'wasd' || current.selectedAvatarId !== 'theo') {
    throw new Error(`WASD was intercepted during naming: ${JSON.stringify(current)}`);
  }

  await evaluate(`(() => {
    const input = document.querySelector('#player-name-capture');
    input.value = 'Rook';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
  })()`);
  await waitFor(async () => (await state()).saved);

  const persisted = await evaluate(`(() => {
    const raw = localStorage.getItem('splicepit-save');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? { avatarId: parsed.payload.gameplay.avatarId, playerName: parsed.payload.gameplay.playerName } : null;
  })()`);
  if (persisted?.avatarId !== 'theo' || persisted?.playerName !== 'Rook') {
    throw new Error(`Identity was not written into the normal save: ${JSON.stringify(persisted)}`);
  }

  await cdp('Page.reload', { ignoreCache: true });
  const restored = await waitForReady();
  if (!restored.loadedFromSave || !restored.saved || restored.selectedAvatarId !== 'theo' || restored.playerName !== 'Rook') {
    throw new Error(`Saved identity was not restored after reload: ${JSON.stringify(restored)}`);
  }

  console.log('Visual-reset boot, game-like selection shell and identity persistence smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
