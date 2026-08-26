import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9233;
const gamePort = 8092;
let nextId = 0;
let pointerId = 200;
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

  async function key(keyName, code, vk) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }

  async function yardState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function labState() {
    return evaluate(`globalThis.__SPLICEPIT_MASTER_LAB__ ? ({ ...globalThis.__SPLICEPIT_MASTER_LAB__ }) : null`);
  }

  async function pressControls(controls, durationMs) {
    const ids = controls.map(() => ++pointerId);
    await evaluate(`(() => {
      const controls = ${JSON.stringify(controls)};
      const ids = ${JSON.stringify(ids)};
      controls.forEach((control, index) => {
        const button = document.querySelector('[data-control="' + control + '"]');
        if (!(button instanceof HTMLElement)) throw new Error('Missing control ' + control);
        button.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId: ids[index],
          pointerType: 'touch',
          isPrimary: index === 0,
        }));
      });
    })()`);
    await sleep(durationMs);
    await evaluate(`(() => {
      const controls = ${JSON.stringify(controls)};
      const ids = ${JSON.stringify(ids)};
      controls.forEach((control, index) => {
        const button = document.querySelector('[data-control="' + control + '"]');
        button?.dispatchEvent(new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId: ids[index],
          pointerType: 'touch',
          isPrimary: index === 0,
        }));
      });
    })()`);
    await sleep(140);
  }

  async function assertRunControlVisible() {
    const run = await evaluate(`(() => {
      const button = document.querySelector('[data-control="run"]');
      if (!(button instanceof HTMLElement)) return null;
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        label: button.textContent,
        aria: button.getAttribute('aria-label'),
        width: rect.width,
        height: rect.height,
        display: style.display,
        visibility: style.visibility,
      };
    })()`);
    if (!run || run.label !== 'RUN' || run.aria !== 'Hold to run' || run.width < 44 || run.height < 44 || run.display === 'none' || run.visibility === 'hidden') {
      throw new Error(`RUN control is not usable on mobile: ${JSON.stringify(run)}`);
    }
    return run;
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

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await yardState())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await yardState())?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);
  await waitFor(async () => {
    const state = await yardState();
    const active = await evaluate(`document.querySelector('#mobile-gameplay-controls')?.classList.contains('is-active') ?? false`);
    return state?.phase === 'confirmed' && state.yardRendered && active ? state : null;
  });

  const runControl = await assertRunControlVisible();
  const yardStart = await yardState();
  await pressControls(['move-right'], 320);
  const yardWalk = await yardState();
  const yardWalkDistance = yardWalk.playerX - yardStart.playerX;
  await pressControls(['run', 'move-left'], 320);
  const yardRun = await yardState();
  const yardRunDistance = yardWalk.playerX - yardRun.playerX;

  if (yardWalkDistance < 30 || yardRunDistance < yardWalkDistance * 1.45 || yardRunDistance > yardWalkDistance * 2.2) {
    throw new Error(`Yard RUN multiplier failed: ${JSON.stringify({ yardStart, yardWalk, yardRun, yardWalkDistance, yardRunDistance })}`);
  }

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1` });
  await waitFor(async () => (await yardState())?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);
  const labStart = await waitFor(async () => {
    const state = await labState();
    return state?.active && state.rendered ? state : null;
  });
  await assertRunControlVisible();

  await pressControls(['move-right'], 280);
  const labWalk = await labState();
  const labWalkDistance = labWalk.playerX - labStart.playerX;
  await pressControls(['run', 'move-left'], 280);
  const labRun = await labState();
  const labRunDistance = labWalk.playerX - labRun.playerX;

  if (labWalkDistance < 25 || labRunDistance < labWalkDistance * 1.45 || labRunDistance > labWalkDistance * 2.2) {
    throw new Error(`Master Lab RUN multiplier failed: ${JSON.stringify({ labStart, labWalk, labRun, labWalkDistance, labRunDistance })}`);
  }

  console.log(`WP0.6E1 hold-to-run control passed: ${JSON.stringify({ runControl, yardWalkDistance, yardRunDistance, labWalkDistance, labRunDistance })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
