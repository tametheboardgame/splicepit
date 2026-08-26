import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9233;
const gamePort = 8091;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 25000, intervalMs = 80) {
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

  async function tapPoint(x, y, id = 1) {
    await cdp('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, radiusX: 5, radiusY: 5, force: 1, id }],
    });
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(100);
  }

  async function tapCanvasAt(sourceX, sourceY) {
    const point = await evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: rect.left + (${sourceX} / 1280) * rect.width,
        y: rect.top + (${sourceY} / 720) * rect.height,
      };
    })()`);
    if (!point) throw new Error('Canvas unavailable for mobile layout smoke.');
    await tapPoint(point.x, point.y);
  }

  async function visualResetState() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function menuState() {
    return evaluate(`globalThis.__SPLICEPIT_MENU__ ? ({ ...globalThis.__SPLICEPIT_MENU__ }) : null`);
  }

  async function hudLayout() {
    return evaluate(`(() => {
      const card = (selector) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) return null;
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        const title = node.querySelector('.mobile-hud-title');
        const body = node.querySelector('.mobile-hud-body');
        return {
          left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
          width: rect.width, height: rect.height,
          display: style.display,
          titleFont: title ? parseFloat(getComputedStyle(title).fontSize) : 0,
          bodyFont: body ? parseFloat(getComputedStyle(body).fontSize) : 0,
        };
      };
      const rect = (selector) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) return null;
        const r = node.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      return {
        objective: card('[data-mobile-hud="objective"]'),
        tutorial: card('[data-mobile-hud="tutorial"]'),
        dpad: rect('.mobile-dpad'),
        actions: rect('.mobile-action-cluster'),
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        bodyWidth: document.body.scrollWidth,
      };
    })()`);
  }

  function overlaps(a, b) {
    if (!a || !b) return false;
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
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

  await waitFor(async () => {
    const state = await visualResetState();
    return state?.ready && state?.phase === 'select' && state?.selectionRendered ? state : null;
  });
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => {
    const state = await visualResetState();
    return state?.ready && state?.phase === 'select' ? state : null;
  });

  await tapCanvasAt(514, 683);
  await waitFor(async () => {
    const state = await visualResetState();
    const active = await evaluate(`document.querySelector('#mobile-gameplay-hud')?.classList.contains('is-active') ?? false`);
    return state?.phase === 'confirmed' && state?.tutorialPromptVisible && active ? state : null;
  });

  let layout = await hudLayout();
  if (!layout.objective || !layout.tutorial || layout.objective.display === 'none' || layout.tutorial.display === 'none') {
    throw new Error(`Portrait mobile HUD cards are not visible: ${JSON.stringify(layout)}`);
  }
  if (layout.objective.left < 0 || layout.objective.right > layout.viewportWidth + 1 || layout.objective.top < 0) {
    throw new Error(`Portrait objective card escapes the viewport: ${JSON.stringify(layout.objective)}`);
  }
  const controlTop = Math.min(layout.dpad?.top ?? layout.viewportHeight, layout.actions?.top ?? layout.viewportHeight);
  if (layout.tutorial.bottom > controlTop - 4) {
    throw new Error(`Portrait tutorial card overlaps gameplay controls: ${JSON.stringify({ tutorial: layout.tutorial, controlTop })}`);
  }
  if (layout.objective.titleFont < 14 || layout.tutorial.bodyFont < 11 || layout.bodyWidth > layout.viewportWidth + 1) {
    throw new Error(`Portrait HUD readability/overflow contract failed: ${JSON.stringify(layout)}`);
  }

  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 915,
    height: 412,
    deviceScaleFactor: 2.75,
    mobile: true,
  });
  await sleep(350);
  layout = await hudLayout();
  if (!layout.objective || !layout.tutorial || layout.objective.display === 'none' || layout.tutorial.display === 'none') {
    throw new Error(`Landscape mobile HUD cards disappeared: ${JSON.stringify(layout)}`);
  }
  if (
    layout.objective.left < 0 || layout.objective.right > layout.viewportWidth + 1 ||
    layout.tutorial.left < 0 || layout.tutorial.right > layout.viewportWidth + 1 ||
    layout.objective.top < 0 || layout.tutorial.top < 0 ||
    layout.objective.bottom > layout.viewportHeight + 1 || layout.tutorial.bottom > layout.viewportHeight + 1
  ) {
    throw new Error(`Landscape HUD escapes the viewport: ${JSON.stringify(layout)}`);
  }
  if (overlaps(layout.objective, layout.dpad) || overlaps(layout.objective, layout.actions) ||
      overlaps(layout.tutorial, layout.dpad) || overlaps(layout.tutorial, layout.actions)) {
    throw new Error(`Landscape HUD overlaps gameplay controls: ${JSON.stringify(layout)}`);
  }

  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?menuTest=1` });
  await waitFor(async () => {
    const state = await menuState();
    return state?.ready && state?.rendered && state?.screen === 'menu' ? state : null;
  });
  await tapCanvasAt(640, 536);
  await waitFor(async () => {
    const state = await menuState();
    return state?.screen === 'settings' ? state : null;
  });
  await tapCanvasAt(640, 412);
  let menu = await waitFor(async () => {
    const state = await menuState();
    const dimmed = await evaluate(`document.documentElement.classList.contains('display-dimmed')`);
    return state?.dimScreen && dimmed ? state : null;
  });
  if (typeof menu.fullscreenSupported !== 'boolean') {
    throw new Error(`Fullscreen capability is not exposed through Settings: ${JSON.stringify(menu)}`);
  }

  await cdp('Page.reload', { ignoreCache: true });
  menu = await waitFor(async () => {
    const state = await menuState();
    return state?.ready && state?.dimScreen ? state : null;
  });
  const persistedDim = await evaluate(`document.documentElement.classList.contains('display-dimmed')`);
  if (!persistedDim) throw new Error('Dim Screen setting did not persist across reload.');

  console.log('WP0.6D2 mobile HUD stays readable in portrait/landscape and display comfort settings persist.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
