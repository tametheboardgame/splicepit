import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9241;
const gamePort = 8099;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 70) {
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

  async function key(keyName, code, vk, durationMs = 40) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }

  async function state() {
    return evaluate(`(() => {
      const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
      const cutscene = globalThis.__SPLICEPIT_CUTSCENE__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      if (!yard || !cutscene || !corruption) return null;
      return {
        yard: { phase: yard.phase, x: yard.playerX, y: yard.playerY, moving: yard.moving },
        cutscene: { ...cutscene.state, flags: { ...cutscene.state.flags } },
        corruption: { ...corruption.state },
        transitions: globalThis.__WP07A_TRANSITIONS__ ?? [],
        flags: globalThis.__WP07A_FLAGS__ ?? [],
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await state())?.cutscene?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.cutscene?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);
  const start = await waitFor(async () => {
    const value = await state();
    return value?.yard?.phase === 'confirmed' ? value : null;
  });

  await evaluate(`(() => {
    globalThis.__WP07A_TRANSITIONS__ = [];
    globalThis.__WP07A_FLAGS__ = [];
    window.addEventListener('splicepit:cutscene-transition', (event) => globalThis.__WP07A_TRANSITIONS__.push(event.detail.transitionId));
    window.addEventListener('splicepit:cutscene-flag', (event) => globalThis.__WP07A_FLAGS__.push([event.detail.flag, event.detail.value]));
    const before = globalThis.__SPLICEPIT_CORRUPTION__.state.authoredEventCount;
    globalThis.__WP07A_AUTHORED_BEFORE__ = before;
    void globalThis.__SPLICEPIT_CUTSCENE__.play({
      id: 'wp0.7a-browser-contract',
      steps: [
        { kind: 'flag', flag: 'wp0.7a-browser-probe', value: true },
        { kind: 'dialogue', cueId: 'runtime-probe', durationMs: 120 },
        { kind: 'corruption', cueId: 'runtime-probe-omen', role: 'omen' },
        { kind: 'wait', durationMs: 120 },
        { kind: 'transition', transitionId: 'runtime-probe-transition', durationMs: 80 },
        { kind: 'wait', durationMs: 520 }
      ]
    });
    return true;
  })()`);

  const locked = await waitFor(async () => {
    const value = await state();
    return value?.cutscene?.status === 'running' && value.cutscene.controlLocked && value.cutscene.ambientSuppressed ? value : null;
  });
  const lockedX = locked.yard.x;
  await key('ArrowRight', 'ArrowRight', 39, 260);
  const during = await state();
  if (Math.abs(during.yard.x - lockedX) > 1) {
    throw new Error(`WP0.7A player moved while cutscene control was locked: ${JSON.stringify({ locked, during })}`);
  }

  const completed = await waitFor(async () => {
    const value = await state();
    return value?.cutscene?.status === 'completed' ? value : null;
  });
  const authoredBefore = await evaluate(`globalThis.__WP07A_AUTHORED_BEFORE__`);
  if (completed.cutscene.controlLocked || completed.cutscene.ambientSuppressed) {
    throw new Error(`WP0.7A cleanup did not restore runtime state: ${JSON.stringify(completed.cutscene)}`);
  }
  if (completed.cutscene.completedSceneId !== 'wp0.7a-browser-contract') {
    throw new Error(`WP0.7A completion id missing: ${JSON.stringify(completed.cutscene)}`);
  }
  if (completed.cutscene.flags['wp0.7a-browser-probe'] !== true) {
    throw new Error(`WP0.7A event flag hook failed: ${JSON.stringify(completed.cutscene.flags)}`);
  }
  if (!completed.transitions.includes('runtime-probe-transition')) {
    throw new Error(`WP0.7A transition hook failed: ${JSON.stringify(completed.transitions)}`);
  }
  if (!completed.flags.some(([flag, value]) => flag === 'wp0.7a-browser-probe' && value === true)) {
    throw new Error(`WP0.7A flag event failed: ${JSON.stringify(completed.flags)}`);
  }
  if (completed.corruption.authoredEventCount <= authoredBefore) {
    throw new Error(`WP0.7A authored corruption hook failed: ${JSON.stringify({ authoredBefore, corruption: completed.corruption })}`);
  }

  const releasedX = completed.yard.x;
  await key('ArrowRight', 'ArrowRight', 39, 260);
  const released = await state();
  if (released.yard.x - releasedX < 15) {
    throw new Error(`WP0.7A player control did not release after cutscene: ${JSON.stringify({ completed, released })}`);
  }

  console.log(`WP0.7A cutscene runtime browser contract passed: ${JSON.stringify({ startX: start.yard.x, lockedX, releasedX, finalX: released.yard.x, authoredBefore, authoredAfter: completed.corruption.authoredEventCount })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
