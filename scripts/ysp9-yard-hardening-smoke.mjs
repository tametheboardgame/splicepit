import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9259;
const gamePort = 8109;
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
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message)); else waiter.resolve(message.result);
  });

  function cdp(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
    return response.result?.value;
  }
  async function key(keyName, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }
  async function yardSnapshot() {
    return evaluate(`(() => {
      const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
      const image = globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__;
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      if (!yard || !image || !env) return null;
      return { yard: { ...yard }, image: { ...image }, environment: { ...env.state } };
    })()`);
  }
  async function waitForConfirmed() {
    return waitFor(async () => {
      const value = await yardSnapshot();
      return value?.yard?.phase === 'confirmed' && value.yard.yardRendered && value.image.active && value.image.baseRendered
        ? value
        : null;
    });
  }
  async function viewportSnapshot() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const action = document.querySelector('[data-control="action"]');
      const run = document.querySelector('[data-control="run"]');
      if (!(canvas instanceof HTMLCanvasElement)) return null;
      const canvasRect = canvas.getBoundingClientRect();
      const rect = (node) => {
        if (!(node instanceof HTMLElement)) return null;
        const r = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height, display: style.display, visibility: style.visibility };
      };
      const ctx = canvas.getContext('2d');
      return {
        width: innerWidth,
        height: innerHeight,
        bodyWidth: document.body.scrollWidth,
        canvas: { left: canvasRect.left, top: canvasRect.top, right: canvasRect.right, bottom: canvasRect.bottom, width: canvasRect.width, height: canvasRect.height },
        action: rect(action),
        run: rect(run),
        imageSmoothingEnabled: ctx?.imageSmoothingEnabled ?? null,
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`));
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const first = await waitForConfirmed();
  const lifecycle = first.image;
  if (
    lifecycle.preloadRequests !== 1 || lifecycle.assetCacheHits !== 0 || lifecycle.decodeStarts !== 3 ||
    lifecycle.successfulLoads !== 1 || lifecycle.failedLoads !== 0 || !lifecycle.imageSmoothingDisabled
  ) {
    throw new Error(`YSP-9 first Yard asset lifecycle is not atomic: ${JSON.stringify(lifecycle)}`);
  }
  if (
    lifecycle.compressedAuthoredBasesBytes !== 321604 ||
    lifecycle.decodedRgbaBytes !== 11059200 ||
    lifecycle.decodedRgbaBytes > lifecycle.decodedRgbaBudgetBytes ||
    lifecycle.decodedRgbaBudgetBytes !== 12582912
  ) {
    throw new Error(`YSP-9 Yard asset memory budget failed: ${JSON.stringify(lifecycle)}`);
  }
  if (lifecycle.lastLoadDurationMs === null || lifecycle.lastLoadDurationMs < 0 || lifecycle.lastLoadDurationMs > 5000) {
    throw new Error(`YSP-9 Yard preload exceeded the conservative local decode budget: ${JSON.stringify(lifecycle)}`);
  }

  // Leave the production Yard and re-enter it without reloading the page. The
  // decoded Bright, foreground and Dark surfaces must be reused exactly once.
  await key('Escape', 'Escape', 27);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.phase === 'select' && globalThis.__SPLICEPIT_VISUAL_RESET__?.selectionRendered === true`));
  await key('Enter', 'Enter', 13);
  const second = await waitFor(async () => {
    const value = await yardSnapshot();
    return value?.yard?.phase === 'confirmed' && value.image.preloadRequests >= 2 ? value : null;
  });
  if (
    second.image.preloadRequests !== 2 || second.image.assetCacheHits !== 1 ||
    second.image.decodeStarts !== 3 || second.image.successfulLoads !== 1 || second.image.failedLoads !== 0
  ) {
    throw new Error(`YSP-9 Yard re-entry decoded duplicate full-size assets: ${JSON.stringify(second.image)}`);
  }

  const locked = {
    playerX: second.yard.playerX,
    playerY: second.yard.playerY,
    cameraX: second.yard.cameraX,
    cameraY: second.yard.cameraY,
  };

  await cdp('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2.75, mobile: true });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await sleep(350);
  const portrait = await viewportSnapshot();
  if (
    !portrait || portrait.bodyWidth > portrait.width + 1 || portrait.canvas.left < -1 || portrait.canvas.right > portrait.width + 1 ||
    portrait.imageSmoothingEnabled !== false || !portrait.action || !portrait.run ||
    portrait.action.width < 44 || portrait.action.height < 44 || portrait.run.width < 44 || portrait.run.height < 44 ||
    portrait.action.display === 'none' || portrait.run.display === 'none'
  ) {
    throw new Error(`YSP-9 portrait Yard presentation failed: ${JSON.stringify(portrait)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  const mobileDark = await waitFor(async () => {
    const value = await yardSnapshot();
    return value?.image?.darkMix >= 0.999 && value.image.darkBaseRendered ? value : null;
  }, 10000);
  for (const keyName of ['playerX', 'playerY', 'cameraX', 'cameraY']) {
    if (Math.abs(mobileDark.yard[keyName] - locked[keyName]) > 0.2) {
      throw new Error(`YSP-9 portrait dark transition moved ${keyName}: ${JSON.stringify({ locked, mobileDark: mobileDark.yard })}`);
    }
  }

  // Opening shells intentionally suppress corruption presentation. Preserve that
  // established contract: forcedState remains dark, presentation becomes bright
  // while Bag is open, then the authored Dark Yard resumes after the shell closes.
  await key('b', 'KeyB', 66);
  const bag = await waitFor(async () => {
    const value = await yardSnapshot();
    return value?.yard?.activeOpeningShell === 'bag' && value.environment.suppressed ? value : null;
  });
  if (
    bag.environment.forcedState !== 'dark' || bag.environment.visualState !== 'bright' || bag.environment.darkMix !== 0 ||
    bag.image.darkMix !== 0 || !bag.environment.suppressionReasons.includes('opening-shell')
  ) {
    throw new Error(`YSP-9 Bag shell did not preserve corruption suppression semantics: ${JSON.stringify(bag)}`);
  }
  await key('Escape', 'Escape', 27);
  const resumedDark = await waitFor(async () => {
    const value = await yardSnapshot();
    return value?.yard?.activeOpeningShell === null && !value.environment.suppressed && value.image.darkMix >= 0.999
      ? value
      : null;
  }, 10000);
  for (const keyName of ['playerX', 'playerY', 'cameraX', 'cameraY']) {
    if (Math.abs(resumedDark.yard[keyName] - locked[keyName]) > 0.2) {
      throw new Error(`YSP-9 Bag suppression recovery moved ${keyName}: ${JSON.stringify({ locked, resumedDark: resumedDark.yard })}`);
    }
  }

  await cdp('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.75, mobile: true });
  await sleep(350);
  const landscape = await viewportSnapshot();
  if (
    !landscape || landscape.bodyWidth > landscape.width + 1 || landscape.canvas.left < -1 || landscape.canvas.right > landscape.width + 1 ||
    landscape.imageSmoothingEnabled !== false || !landscape.action || !landscape.run ||
    landscape.action.width < 44 || landscape.action.height < 44 || landscape.run.width < 44 || landscape.run.height < 44
  ) {
    throw new Error(`YSP-9 landscape Yard presentation failed: ${JSON.stringify(landscape)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__?.darkMix === 0 && !globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__?.darkBaseRendered`));

  console.log(`YSP-9 Yard lifecycle/mobile hardening passed: ${JSON.stringify({
    firstLoadMs: lifecycle.lastLoadDurationMs,
    decodedRgbaBytes: lifecycle.decodedRgbaBytes,
    preloadRequests: second.image.preloadRequests,
    cacheHits: second.image.assetCacheHits,
    decodeStarts: second.image.decodeStarts,
    portraitCanvas: portrait.canvas,
    landscapeCanvas: landscape.canvas,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
