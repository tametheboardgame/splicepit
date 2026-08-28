import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9245;
const gamePort = 8103;
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

function rendered(box) {
  return Boolean(box && box.display !== 'none' && box.visibility !== 'hidden' && box.width > 0 && box.height > 0);
}

const server = spawn('python3', ['-m', 'http.server', String(gamePort), '--bind', '127.0.0.1', '--directory', 'dist'], { stdio: ['ignore', 'pipe', 'pipe'] });
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

  async function snapshot() {
    return evaluate(`(() => {
      const debt = globalThis.__SPLICEPIT_DEBT_ENCOUNTER__;
      const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
      const cutscene = globalThis.__SPLICEPIT_CUTSCENE__;
      if (!debt || !yard || !cutscene) return null;
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height, display: style.display, visibility: style.visibility };
      };
      return {
        ready: yard.ready,
        phase: yard.phase,
        debt: { ...debt.state },
        cutscene: { ...cutscene.state },
        bodyClass: document.body.className,
        dialogue: rect('#debt-collector-dialogue'),
        objective: rect('#mobile-gameplay-hud [data-mobile-hud="objective"]'),
        tutorial: rect('#mobile-gameplay-hud [data-mobile-hud="tutorial"]'),
        dpad: rect('#mobile-gameplay-controls .mobile-dpad'),
        utility: rect('#mobile-gameplay-controls .mobile-utility-row'),
        back: rect('#mobile-gameplay-controls .mobile-back-button'),
        action: rect('#mobile-gameplay-controls [data-control="action"]'),
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&debtTest=1` });
  await waitFor(async () => {
    const value = await snapshot();
    return value?.debt?.ready === true && value.ready === true && value.phase === 'select' ? value : null;
  }, 20000);
  await key('Enter', 'Enter', 13);
  await waitFor(async () => (await snapshot())?.phase === 'confirmed');

  await evaluate(`globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.armForPitRoute()`);
  await evaluate(`(() => { void globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.start(); return true; })()`);
  const running = await waitFor(async () => {
    const value = await snapshot();
    return value?.debt?.running && value.cutscene.controlLocked && rendered(value.dialogue) ? value : null;
  });

  if (!running.bodyClass.includes('wp07e-debt-encounter-active')) throw new Error(`WP0.7E mobile class missing: ${JSON.stringify(running)}`);
  for (const [name, box] of [['objective', running.objective], ['tutorial', running.tutorial], ['dpad', running.dpad], ['utility', running.utility], ['back', running.back]]) {
    if (rendered(box)) throw new Error(`WP0.7E mobile ${name} remained visible during dialogue: ${JSON.stringify(box)}`);
  }
  if (!rendered(running.action) || running.action.width < 40 || running.action.height < 40) {
    throw new Error(`WP0.7E mobile ACTION is not available: ${JSON.stringify(running.action)}`);
  }
  if (running.dialogue.left < -1 || running.dialogue.right > 391 || running.dialogue.top < -1) {
    throw new Error(`WP0.7E mobile dialogue escaped viewport: ${JSON.stringify(running.dialogue)}`);
  }
  if (running.dialogue.bottom >= running.action.top - 12) {
    throw new Error(`WP0.7E mobile dialogue overlaps ACTION: ${JSON.stringify({ dialogue: running.dialogue, action: running.action })}`);
  }

  const completed = await waitFor(async () => {
    const value = await snapshot();
    if (!value) return null;
    if (value.cutscene.dialogueCueId) await evaluate(`globalThis.__SPLICEPIT_CUTSCENE__.advanceDialogue()`);
    return value.debt.completed
      && value.cutscene.status === 'completed'
      && !value.bodyClass.includes('wp07e-debt-encounter-active')
      && !value.debt.representativeVisible
      ? value
      : null;
  }, 20000, 70);

  console.log(`WP0.7E portrait mobile smoke passed: ${JSON.stringify({ dialogue: running.dialogue, action: running.action })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
