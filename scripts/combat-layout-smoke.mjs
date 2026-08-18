import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const debugPort = 9223;
const gamePort = 8081;
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
  `--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

function cleanup() {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

try {
  const targets = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
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
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed';
      throw new Error(detail);
    }
    return result.result?.value;
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', {
    url: `http://127.0.0.1:${gamePort}/?combatPlaytest=1&seed=wp04c-layout-smoke`,
  });

  await waitFor(async () => Boolean(await evaluate(`globalThis.__SPLICEPIT_GAME__?.scene?.isActive('CombatPlaytest')`)), 20000, 120);

  const layout = await evaluate(`(() => {
    const scene = __SPLICEPIT_GAME__.scene.getScene('CombatPlaytest');
    const canvas = document.querySelector('#game canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const interactives = scene.children.list
      .filter((value) => value.input?.enabled && typeof value.getBounds === 'function')
      .map((value) => {
        const bounds = value.getBounds();
        return {
          x: bounds.x,
          y: bounds.y,
          right: bounds.right,
          bottom: bounds.bottom,
          width: bounds.width,
          height: bounds.height,
        };
      });
    const actionEntries = [...scene.actionButtons.entries()];
    const firstAction = actionEntries[0];
    const firstBounds = firstAction?.[1]?.container?.getBounds?.();
    return {
      innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      canvasRect: { left: canvasRect.left, top: canvasRect.top, width: canvasRect.width, height: canvasRect.height },
      interactives,
      actionCount: actionEntries.length,
      firstActionId: firstAction?.[0] ?? null,
      firstActionCentre: firstBounds ? { x: firstBounds.centerX, y: firstBounds.centerY } : null,
      round: scene.state.round,
    };
  })()`);

  if (layout.scrollHeight > layout.innerHeight + 1) {
    throw new Error(`WP0.4C desktop shell requires vertical scrolling: ${JSON.stringify(layout)}`);
  }
  if (layout.actionCount < 5 || layout.actionCount > 12) {
    throw new Error(`Unexpected combat action count for layout gate: ${layout.actionCount}`);
  }
  const escaped = layout.interactives.filter((bounds) => bounds.x < -0.5 || bounds.y < -0.5 || bounds.right > 960.5 || bounds.bottom > 540.5);
  if (escaped.length > 0) {
    throw new Error(`Interactive combat controls escape the 960x540 canvas: ${JSON.stringify(escaped)}`);
  }
  if (!layout.firstActionCentre || !layout.firstActionId) {
    throw new Error('No clickable combat action was available for pointer regression test.');
  }

  const clientX = layout.canvasRect.left + (layout.firstActionCentre.x / 960) * layout.canvasRect.width;
  const clientY = layout.canvasRect.top + (layout.firstActionCentre.y / 540) * layout.canvasRect.height;
  await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: clientX, y: clientY });
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: clientX, y: clientY, button: 'left', clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: clientX, y: clientY, button: 'left', clickCount: 1 });

  await waitFor(async () => (await evaluate(`__SPLICEPIT_GAME__.scene.getScene('CombatPlaytest').state.round`)) === 1, 8000, 100);
  console.log(`WP0.4C combat layout smoke passed: ${layout.actionCount} actions, pointer click advanced round.`);
  ws.close();
} finally {
  cleanup();
}
