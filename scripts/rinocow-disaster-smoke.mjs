import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9242;
const gamePort = 8100;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 35000, intervalMs = 90) {
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
      const lab = globalThis.__SPLICEPIT_MASTER_LAB__;
      const cutscene = globalThis.__SPLICEPIT_CUTSCENE__;
      const disaster = globalThis.__SPLICEPIT_RINOCOW_DISASTER__;
      const corruption = globalThis.__SPLICEPIT_CORRUPTION__;
      const passC = globalThis.__SPLICEPIT_GRAPHICS_PASS_C__;
      if (!lab || !cutscene || !disaster || !corruption || !passC) return null;
      const dialogue = document.querySelector('#rinocow-disaster-dialogue');
      const overlay = document.querySelector('#rinocow-disaster-stage');
      const passCStage = document.querySelector('#graphics-tightening-pass-c-stage');
      return {
        lab: { active: lab.active, rendered: lab.rendered, postDeath: lab.postDeath, x: lab.playerX, y: lab.playerY },
        cutscene: { ...cutscene.state, flags: { ...cutscene.state.flags } },
        disaster: {
          ...disaster.state,
          flags: { ...disaster.state.flags },
          transitions: [...disaster.state.transitions],
          actorPositions: {
            viktor: { ...disaster.state.actorPositions.viktor },
            rinocow: { ...disaster.state.actorPositions.rinocow },
          },
        },
        corruption: { ...corruption.state },
        passC: { ...passC },
        dialogueVisible: Boolean(dialogue && !dialogue.hidden),
        overlayVisible: Boolean(overlay && getComputedStyle(overlay).display !== 'none'),
        legacyOverlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
        passCStageVisible: Boolean(passCStage && getComputedStyle(passCStage).display !== 'none'),
      };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1&labTest=1&rinocowTest=1` });
  await waitFor(async () => (await state())?.disaster?.ready === true, 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.disaster?.ready === true, 20000);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  const initial = await waitFor(async () => {
    const value = await state();
    return value?.lab?.active && value.lab.rendered && value.disaster.ready && value.passC.ready && value.passC.labBenchmarkRendered ? value : null;
  }, 20000);
  if (!initial.overlayVisible) throw new Error(`WP0.7B presentation overlay did not attach to Master Lab: ${JSON.stringify(initial)}`);
  if (!initial.passCStageVisible) throw new Error(`Pass C hero-art stage did not attach to Master Lab: ${JSON.stringify(initial.passC)}`);
  if (initial.legacyOverlayOpacity !== '0') {
    throw new Error(`Pass C did not visually supersede the legacy RinoCow primitive layer: ${JSON.stringify(initial)}`);
  }

  const authoredBefore = initial.corruption.authoredEventCount;
  await evaluate(`void globalThis.__SPLICEPIT_RINOCOW_DISASTER__.start(); true`);

  const running = await waitFor(async () => {
    const value = await state();
    return value?.disaster?.status === 'running' && value.cutscene.controlLocked && value.cutscene.ambientSuppressed ? value : null;
  });
  const lockedX = running.lab.x;
  const lockedY = running.lab.y;
  await key('ArrowRight', 'ArrowRight', 39, 220);
  const afterMoveAttempt = await state();
  if (Math.abs(afterMoveAttempt.lab.x - lockedX) > 1 || Math.abs(afterMoveAttempt.lab.y - lockedY) > 1) {
    throw new Error(`WP0.7B player moved while disaster cutscene was locked: ${JSON.stringify({ running, afterMoveAttempt })}`);
  }

  const heroBeat = await waitFor(async () => {
    const value = await state();
    return value?.disaster?.breachStarted && value.passC.cutsceneHeroRendered ? value : null;
  }, 20000, 70);
  if (!heroBeat.passC.legacyRinoCowStageSuperseded) {
    throw new Error(`Pass C did not register the superseded RinoCow layer: ${JSON.stringify(heroBeat.passC)}`);
  }

  let sawDialogue = false;
  const completed = await waitFor(async () => {
    const value = await state();
    if (!value) return null;
    if (value.dialogueVisible) sawDialogue = true;
    if (value.cutscene.dialogueCueId) {
      await evaluate(`globalThis.__SPLICEPIT_CUTSCENE__.advanceDialogue()`);
    }
    return value.disaster.status === 'completed' && value.cutscene.status === 'completed' ? value : null;
  }, 35000, 100);

  if (!sawDialogue) throw new Error('WP0.7B never displayed its text-box dialogue presentation.');
  if (completed.cutscene.completedSceneId !== 'wp0.7b-rinocow-disaster') {
    throw new Error(`WP0.7B scene completion id missing: ${JSON.stringify(completed.cutscene)}`);
  }
  for (const flag of ['master-dead', 'gas-released', 'rinocow-dead', 'other-apprentices-dead', 'player-survived', 'player-alone', 'rinocow-disaster-complete']) {
    if (completed.cutscene.flags[flag] !== true) {
      throw new Error(`WP0.7B required story flag ${flag} missing: ${JSON.stringify(completed.cutscene.flags)}`);
    }
  }
  for (const transition of ['rinocow-containment-breach', 'rinocow-impact', 'gas-release', 'rinocow-blackout', 'rinocow-blackout-release']) {
    if (!completed.disaster.transitions.includes(transition)) {
      throw new Error(`WP0.7B transition ${transition} was not presented: ${JSON.stringify(completed.disaster.transitions)}`);
    }
  }
  if (!completed.disaster.masterDead || !completed.disaster.rinocowDead || !completed.disaster.playerAlone || !completed.disaster.playerSurvived) {
    throw new Error(`WP0.7B aftermath state is incomplete: ${JSON.stringify(completed.disaster)}`);
  }
  if (completed.cutscene.controlLocked || completed.cutscene.ambientSuppressed) {
    throw new Error(`WP0.7B cleanup did not restore shared runtime state: ${JSON.stringify(completed.cutscene)}`);
  }
  if (completed.corruption.authoredEventCount < authoredBefore + 3) {
    throw new Error(`WP0.7B did not fire blink, rupture and linger corruption beats: ${JSON.stringify({ authoredBefore, corruption: completed.corruption })}`);
  }
  if (!completed.overlayVisible) throw new Error('WP0.7B aftermath presentation disappeared before WP0.7D hand-off.');

  const aftermath = await waitFor(async () => {
    const value = await state();
    return value?.lab?.postDeath && value.passC.aftermathRendered ? value : null;
  }, 20000, 80);
  if (!aftermath.passC.labBenchmarkRendered || !aftermath.passC.aftermathRendered) {
    throw new Error(`Pass C aftermath benchmark did not persist into the post-death Lab: ${JSON.stringify(aftermath.passC)}`);
  }

  console.log(`WP0.7B + Pass C RinoCow hero-art smoke passed: ${JSON.stringify({ transitions: completed.disaster.transitions, flags: completed.cutscene.flags, passC: aftermath.passC, authoredBefore, authoredAfter: completed.corruption.authoredEventCount })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
