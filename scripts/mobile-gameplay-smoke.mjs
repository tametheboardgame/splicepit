import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9232;
const gamePort = 8090;
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

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function waitForSelection() {
    return waitFor(async () => {
      const current = await state();
      if (current?.error) throw new Error(`Mobile gameplay stage failed: ${current.error}`);
      return current?.ready && current?.phase === 'select' && current?.selectionRendered ? current : null;
    });
  }

  async function tapPoint(x, y, id = 1) {
    await cdp('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, radiusX: 5, radiusY: 5, force: 1, id }],
    });
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(90);
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
    if (!point) throw new Error('Mobile selection canvas is unavailable.');
    await tapPoint(point.x, point.y);
  }

  async function controlPoint(control) {
    return evaluate(`(() => {
      const button = document.querySelector('[data-control="${control}"]');
      if (!(button instanceof HTMLElement)) return null;
      const rect = button.getBoundingClientRect();
      const styles = getComputedStyle(button);
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        display: styles.display,
        visibility: styles.visibility,
      };
    })()`);
  }

  async function tapControl(control, id = 2) {
    const point = await controlPoint(control);
    if (!point || point.width < 44 || point.height < 44 || point.display === 'none' || point.visibility === 'hidden') {
      throw new Error(`Touch control ${control} is not usable: ${JSON.stringify(point)}`);
    }
    await tapPoint(point.x, point.y, id);
  }

  async function holdControl(control, durationMs, id = 3) {
    const point = await controlPoint(control);
    if (!point || point.width < 44 || point.height < 44) {
      throw new Error(`Touch control ${control} is not large enough: ${JSON.stringify(point)}`);
    }
    await cdp('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: point.x, y: point.y, radiusX: 5, radiusY: 5, force: 1, id }],
    });
    await sleep(durationMs);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(50);
  }

  async function waitForPrompt(id) {
    return waitFor(async () => {
      const current = await state();
      return current?.tutorialPromptId === id && current.tutorialPromptVisible ? current : null;
    });
  }

  async function moveAxis(axis, target, positiveControl, negativeControl, tolerance = 18) {
    let previous = null;
    let stalled = 0;
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const current = await state();
      const value = axis === 'x' ? current.playerX : current.playerY;
      const delta = target - value;
      if (Math.abs(delta) <= tolerance) return current;

      if (previous !== null && Math.abs(value - previous) < 1) stalled += 1;
      else stalled = 0;
      if (stalled >= 8) {
        throw new Error(`Mobile route movement stalled on ${axis} towards ${target}: ${JSON.stringify(current)}`);
      }
      previous = value;
      await holdControl(delta > 0 ? positiveControl : negativeControl, 90, 10 + (attempt % 4));
    }
    throw new Error(`Mobile route movement did not reach ${axis}=${target}: ${JSON.stringify(await state())}`);
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
  await waitForSelection();
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitForSelection();

  const hiddenBeforeSelection = await evaluate(`document.querySelector('#mobile-gameplay-controls')?.classList.contains('is-active') ?? false`);
  if (hiddenBeforeSelection) throw new Error('Mobile gameplay controls should stay hidden during character selection.');

  // Default Milo + USE button, entirely through touch.
  await tapCanvasAt(514, 683);
  let current = await waitFor(async () => {
    const value = await state();
    const active = await evaluate(`document.querySelector('#mobile-gameplay-controls')?.classList.contains('is-active') ?? false`);
    return value?.phase === 'confirmed' && value?.yardRendered && active ? value : null;
  });

  if (current.playerName !== 'Milo' || !current.saved) {
    throw new Error(`Touch selection did not enter the Yard with the default identity: ${JSON.stringify(current)}`);
  }

  current = await waitForPrompt('movement');
  if (current.tutorialHintLabels.join(',') !== '↑,←,↓,→') {
    throw new Error(`Mobile movement tutorial is not using touch hints: ${JSON.stringify(current.tutorialHintLabels)}`);
  }

  const startX = current.playerX;
  await holdControl('move-right', 420);
  current = await waitForPrompt('interact');
  if (current.playerX <= startX + 20) {
    throw new Error(`Touch D-pad did not move the protagonist: ${JSON.stringify(current)}`);
  }
  if (current.tutorialHintLabels[0] !== 'ACTION') {
    throw new Error(`Interact tutorial did not switch to ACTION on touch: ${JSON.stringify(current.tutorialHintLabels)}`);
  }

  await tapControl('action');
  await waitForPrompt('bag');
  await tapControl('bag');
  current = await waitForPrompt('confirm-cancel');
  if (current.activeOpeningShell !== 'bag' || current.tutorialHintLabels.join(',') !== 'ACTION,BACK') {
    throw new Error(`Touch Bag / confirm-back handoff failed: ${JSON.stringify(current)}`);
  }

  await tapControl('action');
  await tapControl('back');
  await waitForPrompt('map');
  await tapControl('map');

  current = await waitFor(async () => {
    const value = await state();
    return value?.openingSequenceComplete && value?.objectiveId === 'find-master' && value?.activeOpeningShell === 'map' ? value : null;
  });
  await tapControl('back');

  // Prove separate touch pointers can hold movement while ACTION is tapped.
  const multiStart = (await state()).playerX;
  await evaluate(`(() => {
    const move = document.querySelector('[data-control="move-right"]');
    const action = document.querySelector('[data-control="action"]');
    move?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 71, pointerType: 'touch', isPrimary: true }));
    action?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 72, pointerType: 'touch', isPrimary: false }));
  })()`);
  await sleep(300);
  await evaluate(`(() => {
    const action = document.querySelector('[data-control="action"]');
    const move = document.querySelector('[data-control="move-right"]');
    action?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 72, pointerType: 'touch' }));
    move?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 71, pointerType: 'touch' }));
  })()`);
  await sleep(120);
  current = await state();
  if (current.playerX <= multiStart + 20) {
    throw new Error(`Simultaneous movement + ACTION touch did not preserve movement: ${JSON.stringify(current)}`);
  }

  // Traverse the authored WP0.6D route using only the on-screen D-pad.
  await moveAxis('y', 700, 'move-down', 'move-up');
  await moveAxis('x', 1200, 'move-right', 'move-left');
  await moveAxis('x', 1450, 'move-right', 'move-left');
  await moveAxis('y', 655, 'move-down', 'move-up');
  await moveAxis('x', 1840, 'move-right', 'move-left');
  await moveAxis('x', 2140, 'move-right', 'move-left');
  await moveAxis('y', 566, 'move-down', 'move-up');
  current = await moveAxis('x', 2460, 'move-right', 'move-left');

  if (Math.abs(current.playerX - 2460) > 40 || Math.abs(current.playerY - 566) > 40 || current.objectiveId !== 'find-master') {
    throw new Error(`Touch-only route did not reach the Master's Lab staging area: ${JSON.stringify(current)}`);
  }

  const overflow = await evaluate(`({ width: innerWidth, bodyWidth: document.body.scrollWidth, scrollHeight: document.body.scrollHeight, height: innerHeight })`);
  if (overflow.bodyWidth > overflow.width + 1) {
    throw new Error(`Mobile gameplay controls introduced horizontal overflow: ${JSON.stringify(overflow)}`);
  }

  console.log('WP0.6D1 mobile touch controls complete onboarding and reach the Master Lab route staging area.');
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
