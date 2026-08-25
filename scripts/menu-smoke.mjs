import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9226;
const gamePort = 8084;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 60) {
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

  async function menuState() {
    return evaluate(`globalThis.__SPLICEPIT_MENU__ ? ({ ...globalThis.__SPLICEPIT_MENU__ }) : null`);
  }

  async function dialogueState() {
    return evaluate(`globalThis.__SPLICEPIT_DIALOGUE__ ? ({ ...globalThis.__SPLICEPIT_DIALOGUE__ }) : null`);
  }

  async function selectionState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function key(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(70);
  }

  async function click(x, y) {
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await sleep(100);
  }

  async function persistedIdentity() {
    return evaluate(`(() => {
      const raw = localStorage.getItem('splicepit-save');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed ? {
        avatarId: parsed.payload.gameplay.avatarId,
        playerName: parsed.payload.gameplay.playerName,
      } : null;
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

  // Seed a previous prototype identity so New Game must prove that it starts fresh.
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await selectionState())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await selectionState())?.ready === true);
  await key('ArrowRight', 'ArrowRight', 39);
  await key('Enter', 'Enter', 13);
  const seeded = await waitFor(async () => {
    const current = await selectionState();
    return current?.phase === 'confirmed' && current?.saved && current?.yardRendered ? current : null;
  });
  if (seeded.selectedAvatarId !== 'theo' || seeded.playerName !== 'Theo') {
    throw new Error(`Could not seed previous identity before New Game test: ${JSON.stringify(seeded)}`);
  }

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?menuTest=1` });

  const initial = await waitFor(async () => {
    const current = await menuState();
    if (current?.error) throw new Error(current.error);
    return current?.ready && current?.rendered ? current : null;
  });
  if (initial.screen !== 'menu' || initial.selectedId !== 'new-game' || initial.continueEnabled !== false) {
    throw new Error(`Unexpected main menu initial state: ${JSON.stringify(initial)}`);
  }

  const oldIdentity = await persistedIdentity();
  if (oldIdentity?.avatarId !== 'theo' || oldIdentity?.playerName !== 'Theo') {
    throw new Error(`Seeded identity did not survive to menu: ${JSON.stringify(oldIdentity)}`);
  }

  const layout = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    return canvas ? {
      width: canvas.width,
      height: canvas.height,
      aria: canvas.getAttribute('aria-label'),
      bodyWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
    } : null;
  })()`);
  if (!layout || layout.width !== 1280 || layout.height !== 720 || !String(layout.aria).includes('main menu') || layout.bodyWidth > layout.viewportWidth) {
    throw new Error(`Main menu canvas/layout contract failed: ${JSON.stringify(layout)}`);
  }

  await key('ArrowDown', 'ArrowDown', 40);
  const keyboardSelected = await waitFor(async () => {
    const current = await menuState();
    return current?.selectedId === 'settings' ? current : null;
  });
  if (keyboardSelected.selectedId === 'continue') {
    throw new Error(`Keyboard navigation should skip disabled Continue: ${JSON.stringify(keyboardSelected)}`);
  }

  await key('Enter', 'Enter', 13);
  const settings = await waitFor(async () => {
    const current = await menuState();
    return current?.screen === 'settings' && current?.selectedId === 'back' ? current : null;
  });
  if (!settings.settingsOpened || settings.newGameStarted) {
    throw new Error(`Settings shell did not open cleanly: ${JSON.stringify(settings)}`);
  }

  await key('Escape', 'Escape', 27);
  await waitFor(async () => {
    const current = await menuState();
    return current?.screen === 'menu' && current?.selectedId === 'settings' ? current : null;
  });

  await click(640, 456);
  const disabledContinue = await waitFor(async () => {
    const current = await menuState();
    return current?.selectedId === 'continue' && String(current?.statusText).includes('checkpoint') ? current : null;
  });
  if (disabledContinue.newGameStarted || disabledContinue.continueEnabled) {
    throw new Error(`Disabled Continue became actionable: ${JSON.stringify(disabledContinue)}`);
  }

  await click(640, 376);
  const dialogue = await waitFor(async () => {
    const current = await dialogueState();
    return current?.ready && current?.rendered && current?.pageIndex === 0 ? current : null;
  });
  const finalMenu = await menuState();
  if (!finalMenu?.newGameStarted || finalMenu.rendered || dialogue.sequenceId !== 'opening-welcome' || dialogue.pageId !== 'welcome') {
    throw new Error(`New Game did not hand off to opening narration: ${JSON.stringify({ finalMenu, dialogue })}`);
  }

  // Skip the authored narration here. WP0.5C owns its detailed dialogue/corruption coverage.
  await key('Escape', 'Escape', 27);
  const selector = await waitFor(async () => {
    const current = await selectionState();
    if (current?.error) throw new Error(current.error);
    return current?.ready && current?.phase === 'select' && current?.selectionRendered ? current : null;
  });
  if (
    selector.selectedAvatarId !== 'milo' || selector.playerName !== 'Milo' ||
    selector.loadedFromSave || selector.saved || selector.selectionPresentation !== 'yard-arrival'
  ) {
    throw new Error(`New Game selector inherited stale identity instead of fresh state: ${JSON.stringify(selector)}`);
  }

  await key('ArrowRight', 'ArrowRight', 39);
  const theoSelection = await waitFor(async () => {
    const current = await selectionState();
    return current?.selectedAvatarId === 'theo' && current?.playerName === 'Theo' ? current : null;
  });
  if (theoSelection.phase !== 'select') {
    throw new Error(`Character choice did not remain in selection phase: ${JSON.stringify(theoSelection)}`);
  }

  await key('Enter', 'Enter', 13);
  const yard = await waitFor(async () => {
    const current = await selectionState();
    return current?.phase === 'confirmed' && current?.saved && current?.yardRendered ? current : null;
  });
  if (yard.selectedAvatarId !== 'theo' || yard.playerName !== 'Theo') {
    throw new Error(`Selected New Game identity did not enter onboarding Yard: ${JSON.stringify(yard)}`);
  }

  const newIdentity = await persistedIdentity();
  if (newIdentity?.avatarId !== 'theo' || newIdentity?.playerName !== 'Theo') {
    throw new Error(`Selected New Game identity did not become current state: ${JSON.stringify(newIdentity)}`);
  }

  console.log('WP0.5D menu, narration, fresh character selection, identity commit and Yard handoff smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
