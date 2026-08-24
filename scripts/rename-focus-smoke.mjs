import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9223;
const gamePort = 8081;
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

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function waitReady() {
    return waitFor(async () => {
      const current = await state();
      if (current?.error) throw new Error(current.error);
      return current?.ready ? current : null;
    }, 20000);
  }

  async function clickCanvasPoint(internalX, internalY) {
    const point = await evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left + (${internalX} / 960) * rect.width,
        y: rect.top + (${internalY} / 540) * rect.height,
      };
    })()`);
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(100);
  }

  async function key(key, code, vk, text = '') {
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text, unmodifiedText: text,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
    });
    await sleep(60);
  }

  async function typeText(text) {
    for (const char of text) {
      const upper = char.toUpperCase();
      const vk = upper.charCodeAt(0);
      await key(char, `Key${upper}`, vk, char);
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
  await waitReady();
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitReady();
  await cdp('Page.bringToFront');

  // Click the actual canvas Change name? control, rather than invoking app functions from JS.
  await clickCanvasPoint(567, 509);
  await waitFor(async () => (await state())?.phase === 'name');
  await sleep(100);

  const focusState = await evaluate(`(() => {
    const input = document.querySelector('#player-name-capture');
    const rect = input.getBoundingClientRect();
    return {
      active: document.activeElement === input,
      value: input.value,
      opacity: getComputedStyle(input).opacity,
      pointerEvents: getComputedStyle(input).pointerEvents,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      viewport: { width: innerWidth, height: innerHeight },
    };
  })()`);

  if (!focusState.active || focusState.value !== 'Milo' || focusState.opacity !== '1' || focusState.pointerEvents === 'none') {
    throw new Error(`Rename input did not become a real focused control: ${JSON.stringify(focusState)}`);
  }
  if (focusState.rect.left < 0 || focusState.rect.top < 0 || focusState.rect.width < 100 || focusState.rect.height < 20 ||
      focusState.rect.left >= focusState.viewport.width || focusState.rect.top >= focusState.viewport.height) {
    throw new Error(`Rename input is not visibly positioned over the game: ${JSON.stringify(focusState)}`);
  }

  // Because beginNaming selects the default name, a real keypress should replace it.
  await key('X', 'KeyX', 88, 'X');
  const typed = await evaluate(`({
    value: document.querySelector('#player-name-capture').value,
    debugName: globalThis.__SPLICEPIT_VISUAL_RESET__.playerName,
  })`);
  if (typed.value !== 'X' || typed.debugName !== 'X') {
    throw new Error(`Real keyboard typing did not reach rename input: ${JSON.stringify(typed)}`);
  }

  // Force focus loss and prove Escape still cannot trap the player in rename mode.
  await evaluate(`document.querySelector('#player-name-capture').blur()`);
  await key('Escape', 'Escape', 27);
  await waitFor(async () => (await state())?.phase === 'select');

  // Re-enter through the real pointer path, type a custom name and confirm with Enter.
  await clickCanvasPoint(567, 509);
  await waitFor(async () => (await state())?.phase === 'name');
  await sleep(80);
  await typeText('Rook');
  const custom = await state();
  if (custom.playerName !== 'Rook') throw new Error(`Custom name entry failed: ${JSON.stringify(custom)}`);

  await key('Enter', 'Enter', 13);
  const confirmed = await waitFor(async () => {
    const current = await state();
    return current?.phase === 'confirmed' && current.saved ? current : null;
  });
  if (confirmed.playerName !== 'Rook' || confirmed.selectedAvatarId !== 'milo') {
    throw new Error(`Enter did not confirm renamed identity: ${JSON.stringify(confirmed)}`);
  }

  const persisted = await evaluate(`(() => {
    const raw = localStorage.getItem('splicepit-save');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? {
      avatarId: parsed.payload.gameplay.avatarId,
      playerName: parsed.payload.gameplay.playerName,
    } : null;
  })()`);
  if (persisted?.avatarId !== 'milo' || persisted?.playerName !== 'Rook') {
    throw new Error(`Renamed identity did not persist: ${JSON.stringify(persisted)}`);
  }

  console.log('Real pointer rename, visible focus, typing, Escape fallback and Enter confirmation smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
