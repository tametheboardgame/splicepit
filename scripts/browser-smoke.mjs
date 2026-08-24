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
      const state = await evaluate(`globalThis.__SPLICEPIT_CHARACTER_SELECT__ ? ({ ...globalThis.__SPLICEPIT_CHARACTER_SELECT__ }) : null`);
      if (state?.error) throw new Error(`Character select failed to start: ${state.error}`);
      return state?.ready ? state : null;
    }, 20000);
  }

  async function state() {
    return evaluate(`({ ...globalThis.__SPLICEPIT_CHARACTER_SELECT__ })`);
  }

  async function typeLetter(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: key, unmodifiedText: key,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
    });
    await sleep(40);
  }

  async function previewHash() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#character-preview');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return 0;
      const data = ctx.getImageData(50, 25, 90, 120).data;
      let hash = 0;
      for (let i = 0; i < data.length; i += 16) {
        hash = (hash + data[i] * 3 + data[i + 1] * 5 + data[i + 2] * 7) % 2147483647;
      }
      return hash;
    })()`);
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
  if (initial.selectedAvatarId !== 'milo' || initial.loadedFromSave || initial.saved) {
    throw new Error(`Unexpected clean character-select state: ${JSON.stringify(initial)}`);
  }
  if (await evaluate(`typeof globalThis.__SPLICEPIT_SANDBOX__ !== 'undefined'`)) {
    throw new Error('The superseded WP0.4D sandbox is still exposed as the default runtime.');
  }

  const expected = ['milo', 'theo', 'ada', 'pip'];
  const hashes = new Set();
  for (const id of expected) {
    await evaluate(`document.querySelector('[data-avatar="${id}"]').click()`);
    await sleep(220);
    const selected = await state();
    if (selected.selectedAvatarId !== id) throw new Error(`Could not select ${id}: ${JSON.stringify(selected)}`);
    const hash = await previewHash();
    if (!hash) throw new Error(`${id} preview did not render.`);
    hashes.add(hash);
  }
  if (hashes.size < 3) throw new Error(`Live previews are not visually distinct enough for smoke verification: ${[...hashes]}`);

  await evaluate(`document.querySelector('[data-avatar="theo"]').click(); document.querySelector('#player-name').focus()`);
  await typeLetter('w', 'KeyW', 87);
  await typeLetter('a', 'KeyA', 65);
  await typeLetter('s', 'KeyS', 83);
  await typeLetter('d', 'KeyD', 68);
  const textEntry = await evaluate(`({ value: document.querySelector('#player-name').value, selected: globalThis.__SPLICEPIT_CHARACTER_SELECT__.selectedAvatarId })`);
  if (textEntry.value !== 'wasd' || textEntry.selected !== 'theo') {
    throw new Error(`Movement letters were intercepted during name entry: ${JSON.stringify(textEntry)}`);
  }

  await evaluate(`(() => {
    const input = document.querySelector('#player-name');
    input.value = 'Rook';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('#identity-form').requestSubmit();
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
  const restoredInput = await evaluate(`document.querySelector('#player-name').value`);
  if (!restored.loadedFromSave || !restored.saved || restored.selectedAvatarId !== 'theo' || restored.playerName !== 'Rook' || restoredInput !== 'Rook') {
    throw new Error(`Saved identity was not restored after reload: ${JSON.stringify({ restored, restoredInput })}`);
  }

  const layout = await evaluate(`({
    buttons: document.querySelectorAll('.character-tab').length,
    canvases: document.querySelectorAll('#character-preview').length,
    width: innerWidth,
    bodyWidth: document.body.scrollWidth,
    inputType: document.querySelector('#player-name')?.tagName,
  })`);
  if (layout.buttons !== 4 || layout.canvases !== 1 || layout.bodyWidth > layout.width || layout.inputType !== 'INPUT') {
    throw new Error(`Character-select layout contract failed: ${JSON.stringify(layout)}`);
  }

  console.log('WP0.4E character selection, keyboard-safe naming and identity persistence smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
