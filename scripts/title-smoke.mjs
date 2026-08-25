import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9225;
const gamePort = 8083;
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

  async function titleState() {
    return evaluate(`globalThis.__SPLICEPIT_TITLE__ ? ({ ...globalThis.__SPLICEPIT_TITLE__ }) : null`);
  }

  async function gameState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function key(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(70);
  }

  async function canvasHash() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return 0;
      const data = ctx.getImageData(80, 70, 1120, 560).data;
      let hash = 0;
      for (let i = 0; i < data.length; i += 96) {
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

  await waitFor(async () => {
    const current = await titleState();
    if (current?.error) throw new Error(current.error);
    return current?.ready && current?.titleRendered ? current : null;
  });
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });

  const baselineState = await waitFor(async () => {
    const current = await titleState();
    if (current?.error) throw new Error(current.error);
    return current?.titleRendered && current.elapsedMs >= 1250 && current.elapsedMs < 1600 && current.corruption === 0 ? current : null;
  });
  const baselineHash = await canvasHash();
  if (!baselineHash || baselineState.advanced || baselineState.readyToAdvance) {
    throw new Error(`Unexpected bright title baseline: ${JSON.stringify({ baselineState, baselineHash })}`);
  }

  const corruptState = await waitFor(async () => {
    const current = await titleState();
    return current?.corruption > 0.55 ? current : null;
  });
  const corruptHash = await canvasHash();
  if (!corruptHash || corruptHash === baselineHash || corruptState.corruptionEventsPassed < 2) {
    throw new Error(`Corruption did not visibly interrupt the title: ${JSON.stringify({ corruptState, baselineHash, corruptHash })}`);
  }

  const recovered = await waitFor(async () => {
    const current = await titleState();
    return current?.readyToAdvance && current.corruption < 0.01 && current.corruptionEventsPassed >= 3 ? current : null;
  });
  if (recovered.maxCorruption < 0.65 || recovered.advanced) {
    throw new Error(`Title did not recover cleanly after corruption: ${JSON.stringify(recovered)}`);
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
  if (!layout || layout.width !== 1280 || layout.height !== 720 || !String(layout.aria).includes('title') || layout.bodyWidth > layout.viewportWidth) {
    throw new Error(`Title canvas/layout contract failed: ${JSON.stringify(layout)}`);
  }

  // Fresh reload: one early input skips the reveal/corruption sequence but does not advance; the next advances.
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await titleState())?.titleRendered === true);
  await key(' ', 'Space', 32);
  const skipped = await waitFor(async () => {
    const current = await titleState();
    return current?.readyToAdvance ? current : null;
  });
  if (skipped.advanced) throw new Error(`First early input should skip, not advance: ${JSON.stringify(skipped)}`);

  await key('Enter', 'Enter', 13);
  const selector = await waitFor(async () => {
    const current = await gameState();
    return current?.ready && current?.phase === 'select' && current?.selectionRendered ? current : null;
  });
  const finalTitle = await titleState();
  if (!finalTitle?.advanced || finalTitle.titleRendered || selector.selectionPresentation !== 'yard-arrival') {
    throw new Error(`Title did not hand off cleanly to existing selector: ${JSON.stringify({ finalTitle, selector })}`);
  }

  console.log('WP0.5A bright title, visible corruption, clean recovery, skip and runtime handoff smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
