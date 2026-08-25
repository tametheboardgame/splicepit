import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9231;
const gamePort = 8089;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 80) {
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
    return evaluate(`(() => {
      const title = globalThis.__SPLICEPIT_TITLE__ ? ({ ...globalThis.__SPLICEPIT_TITLE__ }) : null;
      const splash = globalThis.__SPLICEPIT_HAPPY_SPLASH__ ? ({ ...globalThis.__SPLICEPIT_HAPPY_SPLASH__ }) : null;
      const menu = globalThis.__SPLICEPIT_MENU__ ? ({ ...globalThis.__SPLICEPIT_MENU__ }) : null;
      const canvas = document.querySelector('#visual-reset-stage');
      const ctx = canvas?.getContext('2d');
      let complexity = 0;
      if (canvas && ctx) {
        const colours = new Set();
        for (let y = 40; y < 680; y += 32) {
          for (let x = 40; x < 1240; x += 32) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            colours.add((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]);
          }
        }
        complexity = colours.size;
      }
      const bounds = canvas?.getBoundingClientRect();
      return {
        title,
        splash,
        menu,
        complexity,
        canvasCssWidth: bounds?.width ?? 0,
        canvasCssHeight: bounds?.height ?? 0,
        canvasLeft: bounds?.left ?? 0,
        canvasTop: bounds?.top ?? 0,
        viewportWidth: innerWidth,
        scrollWidth: document.body.scrollWidth,
      };
    })()`);
  }

  async function assetDiagnostic() {
    return evaluate(`(async () => {
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
    })()`);
  }

  async function tapCanvas() {
    const current = await state();
    const x = current.canvasLeft + current.canvasCssWidth / 2;
    const y = current.canvasTop + current.canvasCssHeight / 2;
    await cdp('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, radiusX: 4, radiusY: 4, force: 1, id: 1 }],
    });
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(100);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 915,
    deviceScaleFactor: 2.75,
    mobile: true,
  });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/` });

  const firstStable = await waitFor(async () => {
    const current = await state();
    if (current.splash?.status === 'error') throw new Error(`Mobile happy splash failed: ${JSON.stringify(current.splash)}`);
    if (current.splash?.status !== 'ready' || !current.title?.titleRendered) return null;
    if (current.title.elapsedMs < 3300 || current.title.elapsedMs > 5600 || current.title.corruption !== 0) return null;
    if (current.complexity < 64) return null;
    return current;
  });

  if (firstStable.canvasCssWidth > firstStable.viewportWidth + 1 || firstStable.scrollWidth > firstStable.viewportWidth) {
    throw new Error(`Mobile title overflows viewport: ${JSON.stringify(firstStable)}`);
  }
  if (!String(firstStable.splash?.src).includes('splicepit-happy-title-v3.webp')) {
    throw new Error(`Mobile title is not using the v3 static happy asset: ${JSON.stringify(firstStable.splash)}`);
  }

  const asset = await assetDiagnostic();
  if (!asset.ok || asset.size !== 66786 || asset.width <= 0 || asset.height <= 0 || asset.decodeError) {
    throw new Error(`Mobile Chromium cannot decode the happy title asset: ${JSON.stringify(asset)}`);
  }

  await sleep(900);
  const secondStable = await state();
  if (secondStable.splash?.status !== 'ready' || secondStable.title?.corruption !== 0 || secondStable.complexity < 64) {
    throw new Error(`Mobile title did not remain in the bright stable state: ${JSON.stringify(secondStable)}`);
  }

  await cdp('Page.reload', { ignoreCache: true });
  const early = await waitFor(async () => {
    const current = await state();
    if (current.splash?.status === 'error') throw new Error(`Mobile happy splash failed after reload: ${JSON.stringify(current.splash)}`);
    if (current.splash?.status !== 'ready' || !current.title?.titleRendered) return null;
    return current.title.elapsedMs < 1200 ? current : null;
  });
  if (early.title.readyToAdvance || early.title.advanced) {
    throw new Error(`Mobile title was unexpectedly ready before the first touch: ${JSON.stringify(early.title)}`);
  }

  await tapCanvas();
  const skipped = await waitFor(async () => {
    const current = await state();
    return current.title?.readyToAdvance && !current.title.advanced ? current : null;
  });
  if (skipped.menu?.rendered) throw new Error(`First mobile touch advanced instead of skipping: ${JSON.stringify(skipped)}`);

  await tapCanvas();
  const handedOff = await waitFor(async () => {
    const current = await state();
    return current.menu?.ready && current.menu?.rendered && current.menu?.screen === 'menu' ? current : null;
  });
  if (!handedOff.title?.advanced || handedOff.menu?.selectedId !== 'new-game') {
    throw new Error(`Second mobile touch did not hand off to the main menu: ${JSON.stringify(handedOff)}`);
  }

  console.log('Mobile title renders the decoded bright splash, stays stable, and supports touch skip/menu handoff.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
