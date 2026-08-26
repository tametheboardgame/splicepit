import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9234;
const gamePort = 8093;
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

  async function key(keyName, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(160);
  }

  async function pitState() {
    return evaluate(`globalThis.__SPLICEPIT_LOCAL_PIT__ ? ({ ...globalThis.__SPLICEPIT_LOCAL_PIT__ }) : null`);
  }

  async function glitchState() {
    return evaluate(`globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__ ? ({ ...globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__ }) : null`);
  }

  async function yardState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&pitTest=1` });

  await waitFor(async () => (await yardState())?.ready === true, 20000);
  await waitFor(async () => (await glitchState())?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await yardState())?.ready === true, 20000);
  await waitFor(async () => (await glitchState())?.ready === true, 20000);
  await cdp('Page.bringToFront');

  await key('Enter', 'Enter', 13);
  const initial = await waitFor(async () => {
    const current = await pitState();
    return current?.active && current?.rendered ? current : null;
  }, 20000);

  if (!initial.framesReady || initial.zone !== 'exterior' || initial.stageId !== 'arrival-gate') {
    throw new Error(`Local Pit did not initialise at the authored exterior arrival: ${JSON.stringify(initial)}`);
  }

  const glitch = await waitFor(async () => {
    const current = await glitchState();
    return current?.glitching && current.glitchCount >= 1 ? current : null;
  }, 2000, 25);
  if (!['rupture', 'wrong-layer', 'recovery'].includes(glitch.phase)) {
    throw new Error(`Local Pit entry glitch did not expose a corrupted phase: ${JSON.stringify(glitch)}`);
  }

  const glitchCanvasContract = await evaluate(`(() => {
    const canvas = document.querySelector('#local-pit-entry-glitch');
    if (!canvas) return null;
    const style = getComputedStyle(canvas);
    return {
      width: canvas.width,
      height: canvas.height,
      ariaHidden: canvas.getAttribute('aria-hidden'),
      zIndex: Number(style.zIndex),
    };
  })()`);
  if (!glitchCanvasContract || glitchCanvasContract.width !== 1280 || glitchCanvasContract.height !== 720 || glitchCanvasContract.ariaHidden !== 'false' || glitchCanvasContract.zIndex < 30) {
    throw new Error(`Local Pit entry glitch overlay contract failed: ${JSON.stringify(glitchCanvasContract)}`);
  }

  const recoveredGlitch = await waitFor(async () => {
    const current = await glitchState();
    return current && !current.glitching && current.phase === 'idle' && current.glitchCount >= 1 ? current : null;
  }, 2500, 40);

  const canvasContract = await evaluate(`(() => {
    const pit = document.querySelector('#local-pit-stage');
    const yard = document.querySelector('#visual-reset-stage');
    const glitch = document.querySelector('#local-pit-entry-glitch');
    if (!pit || !yard || !glitch) return null;
    const style = getComputedStyle(pit);
    return {
      pitWidth: pit.width,
      pitHeight: pit.height,
      yardWidth: yard.width,
      yardHeight: yard.height,
      ariaHidden: pit.getAttribute('aria-hidden'),
      glitchHidden: glitch.getAttribute('aria-hidden'),
      zIndex: Number(style.zIndex),
    };
  })()`);
  if (!canvasContract || canvasContract.pitWidth !== 1280 || canvasContract.pitHeight !== 720 || canvasContract.yardWidth !== 1280 || canvasContract.yardHeight !== 720 || canvasContract.ariaHidden !== 'false' || canvasContract.glitchHidden !== 'true' || canvasContract.zIndex < 20) {
    throw new Error(`Local Pit overlay contract failed after glitch recovery: ${JSON.stringify(canvasContract)}`);
  }

  const visualStats = await evaluate(`(() => {
    const canvas = document.querySelector('#local-pit-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let green = 0;
    let warm = 0;
    let red = 0;
    let dark = 0;
    let grime = 0;
    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (g > r + 8 && g > b - 10 && g > 80) green += 1;
        if (r > 140 && g > 95 && b < 155) warm += 1;
        if (r > 120 && r > g + 15 && r > b + 10) red += 1;
        if (r < 105 && g < 115 && b < 110) dark += 1;
        if (r >= 60 && r <= 115 && g >= 55 && g <= 105 && b >= 45 && b <= 90 && Math.abs(r - g) < 32) grime += 1;
      }
    }
    return { uniqueColours: colours.size, green, warm, red, dark, grime };
  })()`);
  if (!visualStats || visualStats.uniqueColours < 28 || visualStats.green < 35 || visualStats.warm < 80 || visualStats.red < 20 || visualStats.dark < 80 || visualStats.grime < 20) {
    throw new Error(`Local Pit grimy happy-layer visual contract failed: ${JSON.stringify(visualStats)}`);
  }

  await key('b', 'KeyB', 66);
  const bag = await pitState();
  if (bag.activeShell !== 'bag') throw new Error(`Bag did not open inside the Local Pit: ${JSON.stringify(bag)}`);
  await key('Escape', 'Escape', 27);
  if ((await pitState()).activeShell !== null) throw new Error('Escape did not close the Local Pit Bag shell.');

  await key('m', 'KeyM', 77);
  const map = await pitState();
  if (map.activeShell !== 'map') throw new Error(`Map did not open inside the Local Pit: ${JSON.stringify(map)}`);
  await key('Escape', 'Escape', 27);

  await holdKey('w', 'KeyW', 87, 2850);
  const reception = await pitState();
  if (!(reception.playerY < initial.playerY - 400) || reception.facing !== 'up' || reception.zone !== 'interior' || reception.stageId !== 'reception') {
    throw new Error(`Local Pit reception route failed: ${JSON.stringify({ initial, reception })}`);
  }

  await holdKey('s', 'KeyS', 83, 3300);
  const exitPosition = await pitState();
  if (!exitPosition.nearExit || exitPosition.zone !== 'exterior') {
    throw new Error(`Player did not return to the authored Local Pit exit: ${JSON.stringify(exitPosition)}`);
  }

  await key('e', 'KeyE', 69);
  const exited = await waitFor(async () => {
    const current = await pitState();
    return current && !current.active ? current : null;
  });
  const yard = await yardState();
  if (!yard?.yardRendered || yard.phase !== 'confirmed') {
    throw new Error(`Local Pit exit did not hand control back to the Yard: ${JSON.stringify({ exited, yard })}`);
  }

  console.log(`WP0.6F1 Local Pit grime/glitch smoke passed: ${JSON.stringify({ visualStats, glitch, recoveredGlitch, reception, exitPosition })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
