import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9244;
const gamePort = 8102;
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

  async function key(keyName, code, vk, durationMs = 40) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }

  async function state() {
    return evaluate(`(() => {
      const yard = globalThis.__SPLICEPIT_VISUAL_RESET__;
      const debt = globalThis.__SPLICEPIT_DEBT_ENCOUNTER__;
      const cutscene = globalThis.__SPLICEPIT_CUTSCENE__;
      if (!yard || !debt || !cutscene) return null;
      const dialogue = document.querySelector('#debt-collector-dialogue');
      return {
        yard: { ready: yard.ready, phase: yard.phase, x: yard.playerX, y: yard.playerY },
        debt: { ...debt.state, flags: { ...debt.state.flags } },
        cutscene: { ...cutscene.state, flags: { ...cutscene.state.flags } },
        dialogueVisible: Boolean(dialogue && !dialogue.hidden),
        bodyClass: document.body.className,
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&debtTest=1` });
  await waitFor(async () => (await state())?.debt?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => {
    const value = await state();
    return value?.debt?.ready === true && value.yard.ready === true && value.yard.phase === 'select' ? value : null;
  }, 20000);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const initial = await waitFor(async () => {
    const value = await state();
    return value?.yard?.phase === 'confirmed' ? value : null;
  });
  if (initial.debt.phase !== 'locked' || initial.debt.completed) {
    throw new Error(`WP0.7E did not begin locked: ${JSON.stringify(initial.debt)}`);
  }
  const premature = await evaluate(`globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.start()`);
  if (premature !== false) throw new Error('WP0.7E started before the Pit-route hand-off was armed.');

  await evaluate(`globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.armForPitRoute()`);
  await waitFor(async () => {
    const value = await state();
    return value?.debt?.armed && value.debt.representativeVisible ? value : null;
  });

  await evaluate(`(() => { void globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.start(); return true; })()`);
  const running = await waitFor(async () => {
    const value = await state();
    return value?.debt?.running && value.cutscene.controlLocked && value.bodyClass.includes('wp07e-debt-encounter-active') ? value : null;
  });
  const lockedX = running.yard.x;
  await key('ArrowRight', 'ArrowRight', 39, 220);
  const afterMoveAttempt = await state();
  if (Math.abs(afterMoveAttempt.yard.x - lockedX) > 1) {
    throw new Error(`WP0.7E player moved during confrontation: ${JSON.stringify({ running, afterMoveAttempt })}`);
  }

  let sawDialogue = false;
  const completed = await waitFor(async () => {
    const value = await state();
    if (!value) return null;
    if (value.dialogueVisible) sawDialogue = true;
    if (value.cutscene.dialogueCueId) await evaluate(`globalThis.__SPLICEPIT_CUTSCENE__.advanceDialogue()`);
    return value.debt.completed && value.cutscene.status === 'completed' ? value : null;
  }, 20000, 70);

  if (!sawDialogue) throw new Error('WP0.7E never displayed debt confrontation dialogue.');
  if (completed.debt.encounterCount !== 1 || !completed.debt.inheritedDebtConfirmed) {
    throw new Error(`WP0.7E debt state did not complete once: ${JSON.stringify(completed.debt)}`);
  }
  for (const flag of ['debt-collector-encounter-started', 'inherited-debt-confirmed', 'debt-collector-encounter-complete']) {
    if (completed.cutscene.flags[flag] !== true) throw new Error(`WP0.7E missing flag ${flag}: ${JSON.stringify(completed.cutscene.flags)}`);
  }
  if (completed.bodyClass.includes('wp07e-debt-encounter-active') || completed.debt.representativeVisible) {
    throw new Error(`WP0.7E presentation did not clean up: ${JSON.stringify(completed)}`);
  }
  const secondStart = await evaluate(`globalThis.__SPLICEPIT_DEBT_ENCOUNTER__.start()`);
  if (secondStart !== false) throw new Error('WP0.7E confrontation replayed after completion.');

  console.log(`WP0.7E debt collector browser smoke passed: ${JSON.stringify({ flags: completed.cutscene.flags, encounterCount: completed.debt.encounterCount, inheritedDebtConfirmed: completed.debt.inheritedDebtConfirmed })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
