import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9231;
const gamePort = 8090;
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

  async function labState() {
    return evaluate(`globalThis.__SPLICEPIT_MASTER_LAB__ ? ({ ...globalThis.__SPLICEPIT_MASTER_LAB__ }) : null`);
  }

  async function yardState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1` });

  await waitFor(async () => (await yardState())?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await yardState())?.ready === true, 20000);
  await cdp('Page.bringToFront');

  await key('Enter', 'Enter', 13);
  const initial = await waitFor(async () => {
    const current = await labState();
    return current?.active && current?.rendered ? current : null;
  }, 20000);

  if (!initial.framesReady || initial.state !== 'pre-disaster' || initial.stageId !== 'entry') {
    throw new Error(`Master Lab did not initialise in the authored pre-disaster entry state: ${JSON.stringify(initial)}`);
  }

  const canvasContract = await evaluate(`(() => {
    const lab = document.querySelector('#master-lab-stage');
    const yard = document.querySelector('#visual-reset-stage');
    if (!lab || !yard) return null;
    const style = getComputedStyle(lab);
    return {
      labWidth: lab.width,
      labHeight: lab.height,
      yardWidth: yard.width,
      yardHeight: yard.height,
      ariaHidden: lab.getAttribute('aria-hidden'),
      zIndex: Number(style.zIndex),
    };
  })()`);
  if (!canvasContract || canvasContract.labWidth !== 1280 || canvasContract.labHeight !== 720 || canvasContract.yardWidth !== 1280 || canvasContract.yardHeight !== 720 || canvasContract.ariaHidden !== 'false' || canvasContract.zIndex < 10) {
    throw new Error(`Master Lab overlay contract failed: ${JSON.stringify(canvasContract)}`);
  }

  const visualStats = await evaluate(`(() => {
    const canvas = document.querySelector('#master-lab-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let teal = 0;
    let warm = 0;
    let dark = 0;
    let glass = 0;
    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (g > r + 12 && g > b - 12 && g > 90) teal += 1;
        if (r > 145 && g > 105 && b < 150) warm += 1;
        if (r < 95 && g < 105 && b < 100) dark += 1;
        if (g > 150 && b > 140 && r > 120) glass += 1;
      }
    }
    return { uniqueColours: colours.size, teal, warm, dark, glass };
  })()`);
  if (!visualStats || visualStats.uniqueColours < 24 || visualStats.teal < 80 || visualStats.warm < 80 || visualStats.dark < 80 || visualStats.glass < 40) {
    throw new Error(`Master Lab visual density contract failed: ${JSON.stringify(visualStats)}`);
  }

  await key('b', 'KeyB', 66);
  const bag = await labState();
  if (bag.activeShell !== 'bag') throw new Error(`Bag did not open inside Master Lab: ${JSON.stringify(bag)}`);
  await key('Escape', 'Escape', 27);
  if ((await labState()).activeShell !== null) throw new Error('Escape did not close the Master Lab Bag shell.');

  await key('m', 'KeyM', 77);
  const map = await labState();
  if (map.activeShell !== 'map') throw new Error(`Map did not open inside Master Lab: ${JSON.stringify(map)}`);
  await key('Escape', 'Escape', 27);

  await holdKey('w', 'KeyW', 87, 1750);
  const masterStage = await labState();
  if (!(masterStage.playerY < initial.playerY - 200) || masterStage.facing !== 'up' || masterStage.stageId !== 'master-stage') {
    throw new Error(`Viktor staging route failed: ${JSON.stringify({ initial, masterStage })}`);
  }

  await holdKey('d', 'KeyD', 68, 2800);
  const containment = await labState();
  if (!(containment.playerX > masterStage.playerX + 350) || containment.facing !== 'right' || containment.stageId !== 'rinocow-containment') {
    throw new Error(`RinoCow staging route failed: ${JSON.stringify({ masterStage, containment })}`);
  }

  await holdKey('a', 'KeyA', 65, 2800);
  await holdKey('s', 'KeyS', 83, 1900);
  const exitPosition = await labState();
  if (!exitPosition.nearExit) throw new Error(`Player did not reach the authored lab exit: ${JSON.stringify(exitPosition)}`);

  await key('e', 'KeyE', 69);
  const exited = await waitFor(async () => {
    const current = await labState();
    return current && !current.active ? current : null;
  });
  const yard = await yardState();
  if (!yard?.yardRendered || yard.phase !== 'confirmed') {
    throw new Error(`Master Lab exit did not hand control back to the Yard: ${JSON.stringify({ exited, yard })}`);
  }

  console.log(`WP0.6E Master Lab smoke passed: ${JSON.stringify({ visualStats, masterStage, containment, exitPosition })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
