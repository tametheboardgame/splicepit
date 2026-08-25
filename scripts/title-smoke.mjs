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

  async function splashState() {
    return evaluate(`globalThis.__SPLICEPIT_HAPPY_SPLASH__ ? ({ ...globalThis.__SPLICEPIT_HAPPY_SPLASH__ }) : null`);
  }

  async function menuState() {
    return evaluate(`globalThis.__SPLICEPIT_MENU__ ? ({ ...globalThis.__SPLICEPIT_MENU__ }) : null`);
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

  async function canvasComplexity() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return 0;
      const colours = new Set();
      for (let y = 40; y < 680; y += 24) {
        for (let x = 40; x < 1240; x += 24) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          colours.add((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]);
        }
      }
      return colours.size;
    })()`);
  }

  async function assetDiagnostic() {
    return evaluate(`(async () => {
      try {
        const response = await fetch('/assets/splicepit-happy-title-v3.webp', { cache: 'no-store' });
        const blob = await response.blob();
        let bitmap = null;
        let decodeError = null;
        try {
          bitmap = await createImageBitmap(blob);
        } catch (error) {
          decodeError = String(error);
        }
        const result = {
          ok: response.ok,
          status: response.status,
          type: blob.type,
          size: blob.size,
          width: bitmap?.width ?? 0,
          height: bitmap?.height ?? 0,
          decodeError,
        };
        bitmap?.close();
        return result;
      } catch (error) {
        return { fetchError: String(error) };
      }
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
    const splash = await splashState();
    if (splash?.status === 'error') throw new Error(`Happy splash load failed: ${JSON.stringify(splash)}`);
    return current?.ready && current?.titleRendered ? current : null;
  });
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });

  let baselineState;
  try {
    baselineState = await waitFor(async () => {
      const current = await titleState();
      if (current?.error) throw new Error(current.error);
      const splash = await splashState();
      if (splash?.status === 'error') throw new Error(`Happy splash load failed: ${JSON.stringify(splash)}`);
      if (splash?.status !== 'ready' || !current?.titleRendered || current.corruption !== 0) return null;
      const complexity = await canvasComplexity();
      return complexity >= 64 ? { ...current, complexity, splash } : null;
    });
  } catch (error) {
    const observation = {
      title: await titleState(),
      splash: await splashState(),
      complexity: await canvasComplexity(),
      asset: await assetDiagnostic(),
    };
    throw new Error(`Bright title baseline wait failed: ${JSON.stringify(observation)}; ${String(error)}`);
  }

  const asset = await assetDiagnostic();
  if (!asset.ok || asset.size !== 66786 || asset.width <= 0 || asset.height <= 0 || asset.decodeError) {
    throw new Error(`Happy title asset is not a decodable WebP: ${JSON.stringify(asset)}`);
  }

  const baselineHash = await canvasHash();
  if (!baselineHash || baselineState.complexity < 64 || baselineState.advanced) {
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

  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => {
    const current = await titleState();
    const splash = await splashState();
    if (splash?.status === 'error') throw new Error(`Happy splash load failed after reload: ${JSON.stringify(splash)}`);
    return current?.titleRendered === true && splash?.status === 'ready';
  });
  await key(' ', 'Space', 32);
  const skipped = await waitFor(async () => {
    const current = await titleState();
    return current?.readyToAdvance ? current : null;
  });
  if (skipped.advanced) throw new Error(`First early input should skip, not advance: ${JSON.stringify(skipped)}`);

  await key('Enter', 'Enter', 13);
  const menu = await waitFor(async () => {
    const current = await menuState();
    return current?.ready && current?.rendered && current?.screen === 'menu' ? current : null;
  });
  const finalTitle = await titleState();
  if (!finalTitle?.advanced || finalTitle.titleRendered || menu.selectedId !== 'new-game' || menu.continueEnabled !== false) {
    throw new Error(`Title did not hand off cleanly to WP0.5B menu: ${JSON.stringify({ finalTitle, menu })}`);
  }

  console.log('WP0.5A illustrated bright title, visible corruption, clean recovery, skip and main-menu handoff smoke passed.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
