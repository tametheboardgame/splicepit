import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9227;
const gamePort = 8085;
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

  async function dialogueState() {
    return evaluate(`globalThis.__SPLICEPIT_DIALOGUE__ ? ({ ...globalThis.__SPLICEPIT_DIALOGUE__ }) : null`);
  }

  async function gameState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function key(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?dialogueTest=1&dialogueSpeed=slow` });
  const initial = await waitFor(async () => {
    const current = await dialogueState();
    if (current?.error) throw new Error(current.error);
    return current?.ready && current?.rendered ? current : null;
  });
  if (initial.sequenceId !== 'opening-welcome' || initial.pageIndex !== 0 || initial.textSpeed !== 'slow') {
    throw new Error(`Unexpected opening dialogue state: ${JSON.stringify(initial)}`);
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
  if (!layout || layout.width !== 1280 || layout.height !== 720 || !String(layout.aria).includes('opening narration') || layout.bodyWidth > layout.viewportWidth) {
    throw new Error(`Opening dialogue canvas/layout contract failed: ${JSON.stringify(layout)}`);
  }

  await key('Enter', 'Enter', 13);
  const revealed = await waitFor(async () => {
    const current = await dialogueState();
    return current?.pageIndex === 0 && current?.textComplete ? current : null;
  });
  if (revealed.pageId !== 'welcome') throw new Error(`Early advance should reveal, not change page: ${JSON.stringify(revealed)}`);

  await key('Enter', 'Enter', 13);
  await waitFor(async () => {
    const current = await dialogueState();
    return current?.pageIndex === 1 && current?.pageId === 'science' ? current : null;
  });

  const corrupted = await waitFor(async () => {
    const current = await dialogueState();
    return current?.pageIndex === 1 && current?.maxCorruption > 0.7 && current?.corruptionEventsPassed >= 2 ? current : null;
  }, 5000);
  if (corrupted.error) throw new Error(corrupted.error);
  await waitFor(async () => {
    const current = await dialogueState();
    return current?.pageIndex === 1 && current?.corruptionEventsPassed >= 2 && current?.corruption === 0 ? current : null;
  }, 5000);

  await key('Enter', 'Enter', 13);
  await key('Enter', 'Enter', 13);
  await waitFor(async () => (await dialogueState())?.pageIndex === 2);
  await key('Enter', 'Enter', 13);
  await key('Enter', 'Enter', 13);
  await waitFor(async () => (await dialogueState())?.pageIndex === 3);
  await key('Enter', 'Enter', 13);
  await key('Enter', 'Enter', 13);

  const selector = await waitFor(async () => {
    const current = await gameState();
    return current?.ready && current?.phase === 'select' && current?.selectionRendered ? current : null;
  });
  const completed = await dialogueState();
  if (!completed?.completed || completed.skipped || !completed.handedOffToSelector || selector.selectionPresentation !== 'yard-arrival') {
    throw new Error(`Completed narration did not hand off cleanly: ${JSON.stringify({ completed, selector })}`);
  }

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?dialogueTest=1&dialogueSpeed=instant` });
  await waitFor(async () => {
    const current = await dialogueState();
    return current?.ready && current?.rendered && current?.textSpeed === 'instant' ? current : null;
  });
  await key('Escape', 'Escape', 27);
  await waitFor(async () => {
    const current = await gameState();
    return current?.ready && current?.phase === 'select' ? current : null;
  });
  const skipped = await dialogueState();
  if (!skipped?.completed || !skipped.skipped || !skipped.handedOffToSelector) {
    throw new Error(`Escape did not skip opening narration cleanly: ${JSON.stringify(skipped)}`);
  }

  console.log('WP0.5C opening narration reveal, corruption, completion, speed hook and skip smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
