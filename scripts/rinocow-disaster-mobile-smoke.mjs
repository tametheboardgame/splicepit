import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9243;
const gamePort = 8101;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 30000, intervalMs = 90) {
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

function isRenderedBox(box) {
  return Boolean(
    box
    && box.display !== 'none'
    && box.visibility !== 'hidden'
    && box.width > 0
    && box.height > 0
  );
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

  async function tapSelectionCanvasAt(sourceX, sourceY) {
    const point = await evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: rect.left + (${sourceX} / 1280) * rect.width,
        y: rect.top + (${sourceY} / 720) * rect.height,
      };
    })()`);
    if (!point) throw new Error('WP0.7B mobile smoke could not find the character-selection canvas.');
    await tapPoint(point.x, point.y);
  }

  async function waitForSelection() {
    return waitFor(async () => evaluate(`(() => {
      const state = globalThis.__SPLICEPIT_VISUAL_RESET__;
      return Boolean(state?.ready && state?.phase === 'select' && state?.selectionRendered);
    })()`), 20000);
  }

  async function snapshot() {
    return evaluate(`(() => {
      const lab = globalThis.__SPLICEPIT_MASTER_LAB__;
      const cutscene = globalThis.__SPLICEPIT_CUTSCENE__;
      const disaster = globalThis.__SPLICEPIT_RINOCOW_DISASTER__;
      if (!lab || !cutscene || !disaster) return null;
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          left: Math.round(box.left * 10) / 10,
          top: Math.round(box.top * 10) / 10,
          right: Math.round(box.right * 10) / 10,
          bottom: Math.round(box.bottom * 10) / 10,
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
          display: style.display,
          visibility: style.visibility,
        };
      };
      return {
        lab: { active: lab.active, rendered: lab.rendered },
        cutscene: { status: cutscene.state.status, controlLocked: cutscene.state.controlLocked, dialogueCueId: cutscene.state.dialogueCueId },
        disaster: { status: disaster.state.status, started: disaster.state.started, completed: disaster.state.completed },
        classes: document.body.className,
        labRect: rect('#master-lab-stage'),
        dialogueRect: rect('#rinocow-disaster-dialogue'),
        objectiveRect: rect('#mobile-gameplay-hud [data-mobile-hud="objective"]'),
        tutorialRect: rect('#mobile-gameplay-hud [data-mobile-hud="tutorial"]'),
        dpadRect: rect('#mobile-gameplay-controls .mobile-dpad'),
        bagRect: rect('#mobile-gameplay-controls [data-control="bag"]'),
        mapRect: rect('#mobile-gameplay-controls [data-control="map"]'),
        backRect: rect('#mobile-gameplay-controls [data-control="back"]'),
        actionRect: rect('#mobile-gameplay-controls [data-control="action"]'),
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1&rinocowTest=1` });

  await waitForSelection();
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitForSelection();
  await cdp('Page.bringToFront');

  // Enter normal gameplay through the same touch-only Milo USE target used by
  // the existing WP0.6D1 mobile smoke. labTest then auto-enters the Master Lab.
  await tapSelectionCanvasAt(514, 683);

  const initial = await waitFor(async () => {
    const value = await snapshot();
    return value?.lab?.active && value.lab.rendered && value.labRect ? value : null;
  }, 20000);

  await evaluate(`void globalThis.__SPLICEPIT_RINOCOW_DISASTER__.start(); true`);
  const running = await waitFor(async () => {
    const value = await snapshot();
    return value?.cutscene?.controlLocked && value.classes.includes('wp07b-cutscene-active') ? value : null;
  });

  if (!running.classes.includes('wp07b-objective-cleared')) {
    throw new Error(`WP0.7B did not clear the Find your Master objective on cutscene start: ${JSON.stringify(running)}`);
  }
  if (isRenderedBox(running.objectiveRect) || isRenderedBox(running.tutorialRect)) {
    throw new Error(`WP0.7B mobile HUD still occupies the dialogue area: ${JSON.stringify(running)}`);
  }
  for (const [name, box] of [['dpad', running.dpadRect], ['bag', running.bagRect], ['map', running.mapRect], ['back', running.backRect]]) {
    if (isRenderedBox(box)) throw new Error(`WP0.7B ${name} control remained visible during cutscene: ${JSON.stringify(running)}`);
  }
  if (!isRenderedBox(running.actionRect) || running.actionRect.width < 40 || running.actionRect.height < 40) {
    throw new Error(`WP0.7B ACTION control is not available during mobile dialogue: ${JSON.stringify(running)}`);
  }

  const dialogue = await waitFor(async () => {
    const value = await snapshot();
    return value?.cutscene?.dialogueCueId && isRenderedBox(value.dialogueRect) ? value : null;
  });
  if (dialogue.dialogueRect.top > 70) {
    throw new Error(`WP0.7B dialogue did not take over the top objective region: ${JSON.stringify(dialogue.dialogueRect)}`);
  }
  if (dialogue.dialogueRect.bottom >= dialogue.actionRect.top - 16) {
    throw new Error(`WP0.7B dialogue overlaps the retained ACTION button: ${JSON.stringify({ dialogue: dialogue.dialogueRect, action: dialogue.actionRect })}`);
  }

  const rectTolerance = 1.5;
  for (const key of ['left', 'top', 'right', 'bottom', 'width', 'height']) {
    if (Math.abs(dialogue.labRect[key] - initial.labRect[key]) > rectTolerance) {
      throw new Error(`WP0.7B camera focus moved the Master Lab viewport (${key}): ${JSON.stringify({ initial: initial.labRect, running: dialogue.labRect })}`);
    }
  }
  if (dialogue.labRect.left < -rectTolerance || dialogue.labRect.right > 390 + rectTolerance) {
    throw new Error(`WP0.7B Master Lab escaped the mobile viewport: ${JSON.stringify(dialogue.labRect)}`);
  }

  await evaluate(`(() => {
    const button = document.querySelector('#mobile-gameplay-controls [data-control="action"]');
    if (!button) return false;
    const options = { bubbles: true, cancelable: true, pointerId: 91, pointerType: 'touch', isPrimary: true };
    button.dispatchEvent(new PointerEvent('pointerdown', options));
    button.dispatchEvent(new PointerEvent('pointerup', options));
    return true;
  })()`);
  await waitFor(async () => {
    const value = await snapshot();
    return value?.cutscene?.dialogueCueId !== dialogue.cutscene.dialogueCueId ? value : null;
  }, 8000);

  const completed = await waitFor(async () => {
    const value = await snapshot();
    if (!value) return null;
    if (value.cutscene.dialogueCueId) await evaluate(`globalThis.__SPLICEPIT_CUTSCENE__.advanceDialogue()`);
    return value.disaster.completed && value.cutscene.status === 'completed' ? value : null;
  }, 35000, 80);

  if (completed.classes.includes('wp07b-cutscene-active')) {
    throw new Error(`WP0.7B did not restore normal controls after completion: ${JSON.stringify(completed)}`);
  }
  if (!completed.classes.includes('wp07b-objective-cleared') || isRenderedBox(completed.objectiveRect)) {
    throw new Error(`WP0.7B Find your Master objective returned after Viktor was found: ${JSON.stringify(completed)}`);
  }
  for (const [name, box] of [['dpad', completed.dpadRect], ['bag', completed.bagRect], ['map', completed.mapRect], ['back', completed.backRect]]) {
    if (!isRenderedBox(box)) throw new Error(`WP0.7B did not restore ${name} control after the scene: ${JSON.stringify(completed)}`);
  }

  console.log(`WP0.7B portrait mobile presentation smoke passed: ${JSON.stringify({ initialLab: initial.labRect, dialogue: dialogue.dialogueRect, action: dialogue.actionRect, completedClasses: completed.classes })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
