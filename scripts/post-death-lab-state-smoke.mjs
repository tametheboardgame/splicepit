import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9237;
const gamePort = 8096;
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
    await sleep(120);
  }

  async function state() {
    return evaluate(`(() => ({
      lab: globalThis.__SPLICEPIT_MASTER_LAB__ ? ({ ...globalThis.__SPLICEPIT_MASTER_LAB__ }) : null,
      yard: globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null,
      postDeath: globalThis.__SPLICEPIT_POST_DEATH_LAB__?.snapshot ?? null,
    }))()`);
  }

  async function redAftermathPixels() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#master-lab-stage');
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return 0;
      const data = ctx.getImageData(350, 0, 560, 310).data;
      let red = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 105 && r > g * 1.28 && r > b * 1.08) red += 1;
      }
      return red;
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1` });

  await waitFor(async () => (await state()).yard?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state()).yard?.ready === true, 20000);
  await cdp('Page.bringToFront');

  await key('Enter', 'Enter', 13);
  const initial = await waitFor(async () => {
    const current = await state();
    return current.lab?.active && current.lab?.rendered ? current : null;
  }, 20000);
  if (initial.lab.state !== 'pre-disaster' || initial.lab.postDeath || initial.lab.masterPresent !== true) {
    throw new Error(`WP0.7D did not begin from the normal Master Lab state: ${JSON.stringify(initial)}`);
  }
  const beforeRed = await redAftermathPixels();

  await evaluate(`(() => {
    const disaster = globalThis.__SPLICEPIT_RINOCOW_DISASTER__?.state;
    if (disaster) {
      disaster.breachStarted = true;
      disaster.masterDead = true;
      disaster.rinocowDead = true;
      disaster.playerAlone = true;
      disaster.playerSurvived = true;
      disaster.completed = true;
      disaster.status = 'completed';
    }
    window.dispatchEvent(new CustomEvent('splicepit:cutscene-flag', {
      detail: { flag: 'rinocow-disaster-complete', value: true },
    }));
  })()`);

  const converted = await waitFor(async () => {
    const current = await state();
    return current.lab?.state === 'aftermath' && current.yard?.objectiveId === 'use-splice-bench' ? current : null;
  });
  if (!converted.lab.postDeath || converted.lab.masterPresent || !converted.lab.spliceBenchReady) {
    throw new Error(`Post-death lab contract did not activate: ${JSON.stringify(converted)}`);
  }
  if (converted.yard.objectiveStep !== 3 || converted.yard.objectiveCount !== 3) {
    throw new Error(`Post-death objective did not become the new opening objective: ${JSON.stringify(converted.yard)}`);
  }
  await sleep(180);
  const afterRed = await redAftermathPixels();
  if (afterRed <= beforeRed + 40) {
    throw new Error(`Master Lab did not visibly convert to aftermath art: ${JSON.stringify({ beforeRed, afterRed })}`);
  }

  await holdKey('s', 'KeyS', 83, 220);
  await key('e', 'KeyE', 69);
  await waitFor(async () => !(await state()).lab?.active);

  await evaluate(`(() => {
    const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
    if (!yard) return false;
    yard.playerX = 2506;
    yard.playerY = 566;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e', code: 'KeyE', bubbles: true }));
    return true;
  })()`);

  const reentered = await waitFor(async () => {
    const current = await state();
    return current.lab?.active && current.lab?.rendered ? current : null;
  });
  if (reentered.lab.state !== 'aftermath' || !reentered.lab.postDeath || reentered.lab.masterPresent) {
    throw new Error(`Leaving and re-entering resurrected the pre-disaster lab: ${JSON.stringify(reentered.lab)}`);
  }
  if (reentered.yard.objectiveId !== 'use-splice-bench') {
    throw new Error(`Post-death objective did not persist through lab re-entry: ${JSON.stringify(reentered.yard)}`);
  }

  await holdKey('w', 'KeyW', 87, 1600);
  await holdKey('a', 'KeyA', 65, 1600);
  const atBench = await waitFor(async () => {
    const current = await state();
    return current.lab?.nearSpliceBench ? current : null;
  }, 8000);
  await key('e', 'KeyE', 69);
  const benchUsed = await waitFor(async () => {
    const current = await state();
    return current.lab?.spliceBenchInteractionCount > 0 ? current : null;
  });
  if (benchUsed.postDeath?.spliceBenchInteractionCount !== 1) {
    throw new Error(`Primary Splice Bench did not accept the WP0.8 hand-off interaction: ${JSON.stringify(benchUsed)}`);
  }

  console.log(`WP0.7D post-death lab smoke passed: ${JSON.stringify({
    beforeRed,
    afterRed,
    reenteredState: reentered.lab.state,
    objectiveId: reentered.yard.objectiveId,
    benchStage: atBench.lab.stageId,
    benchInteractions: benchUsed.lab.spliceBenchInteractionCount,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
