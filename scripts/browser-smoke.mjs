import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9222;
const gamePort = 8080;
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
    } catch (error) { lastError = error; }
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

let chromeErrors = '';
chrome.stderr.on('data', (chunk) => { chromeErrors += chunk.toString(); });

function cleanup() {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

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
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed';
      throw new Error(detail);
    }
    return result.result?.value;
  }

  async function waitExpr(expression, timeoutMs = 15000) {
    return waitFor(async () => Boolean(await evaluate(expression)), timeoutMs, 120);
  }

  async function pressKey(key, code, windowsVirtualKeyCode) {
    const params = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode };
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await sleep(45);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
    await sleep(180);
  }

  async function holdKey(key, code, windowsVirtualKeyCode, durationMs) {
    const params = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode };
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
    await sleep(180);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?seed=wp03h-smoke&debug=1` });

  try {
    await waitExpr(`Boolean(globalThis.__SPLICEPIT_GAME__?.scene?.isActive('Title'))`, 20000);
    await waitExpr(`Boolean(globalThis.__SPLICEPIT_DEBUG__)`);
  } catch (error) {
    const diagnostics = await evaluate(`({
      href: location.href,
      title: document.title,
      text: document.body.innerText.slice(0, 1200),
      game: Boolean(globalThis.__SPLICEPIT_GAME__),
      debug: Boolean(globalThis.__SPLICEPIT_DEBUG__),
      scenes: globalThis.__SPLICEPIT_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) ?? []
    })`);
    throw new Error(`${error.message}; startup diagnostics=${JSON.stringify(diagnostics)}`);
  }

  const initialDiagnostics = await evaluate(`__SPLICEPIT_DEBUG__.diagnostics()`);
  if (initialDiagnostics?.rng?.seed !== 'wp03h-smoke' || !initialDiagnostics?.scene?.active?.includes('Title')) {
    throw new Error(`Unexpected deterministic diagnostics: ${JSON.stringify(initialDiagnostics)}`);
  }

  await pressKey('Enter', 'Enter', 13);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Intro')`);
  await pressKey('Enter', 'Enter', 13);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Lab')`);

  // A common 14-inch laptop viewport should show the whole shell without vertical page scrolling.
  const laptopLayout = await evaluate(`({
    innerWidth,
    innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    shellHeight: document.getElementById('shell')?.getBoundingClientRect().height ?? 0,
    gameHeight: document.getElementById('game-wrap')?.getBoundingClientRect().height ?? 0
  })`);
  if (laptopLayout.scrollHeight > laptopLayout.innerHeight + 1) {
    throw new Error(`Laptop viewport requires vertical scrolling: ${JSON.stringify(laptopLayout)}`);
  }

  // Movement must continue while a direction is held, not require one press per tile.
  const startX = await evaluate(`__SPLICEPIT_GAME__.scene.getScene('Lab').playerGrid.x`);
  await holdKey('ArrowRight', 'ArrowRight', 39, 390);
  const heldX = await evaluate(`__SPLICEPIT_GAME__.scene.getScene('Lab').playerGrid.x`);
  if (!(heldX >= startX + 3)) {
    throw new Error(`Held movement did not repeat across tiles: start=${startX} end=${heldX}`);
  }

  // The opening base animal is a genuine Rabbit / Goat / Pig choice.
  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Lab').useAnimalPen(); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').selectionMode === 'animal'`);
  await pressKey('ArrowDown', 'ArrowDown', 40);
  await pressKey('Enter', 'Enter', 13);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').selectionMode === null && __SPLICEPIT_GAME__.scene.getScene('Lab').blocked === true`);
  await pressKey('Escape', 'Escape', 27);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').blocked === false`);
  const selectedBase = await evaluate(`__SPLICEPIT_DEBUG__.diagnostics().gameplay.baseAnimalId`);
  if (selectedBase !== 'goat') throw new Error(`Opening animal choice did not persist Goat: ${selectedBase}`);

  // The source archive exposes the canonical opening ten and lets the player choose one.
  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Lab').useGeneCabinet(); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').selectionMode === 'source' && __SPLICEPIT_GAME__.scene.getScene('Lab').selectionItems.length === 10`);
  await pressKey('ArrowDown', 'ArrowDown', 40);
  await pressKey('ArrowDown', 'ArrowDown', 40);
  await pressKey('ArrowDown', 'ArrowDown', 40);
  await pressKey('Enter', 'Enter', 13);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').selectionMode === null && __SPLICEPIT_GAME__.scene.getScene('Lab').blocked === true`);
  await pressKey('Escape', 'Escape', 27);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Lab').blocked === false`);
  const recovered = await evaluate(`__SPLICEPIT_DEBUG__.diagnostics().gameplay.collectedGenes`);
  if (!Array.isArray(recovered) || recovered[0] !== 'gecko_regeneration') {
    throw new Error(`Opening source choice did not persist selected canonical source: ${JSON.stringify(recovered)}`);
  }

  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Lab').useSpliceBench(); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Splice')`);

  const initialLab = await evaluate(`(() => {
    const splice = __SPLICEPIT_GAME__.scene.getScene('Splice');
    return {
      subject: splice.selectedSubjectId,
      source: splice.selectedSourceId,
      forecast: splice.forecastText.text
    };
  })()`);
  if (!String(initialLab?.subject).startsWith('r03.test.') || initialLab?.source !== 'gecko_regeneration') {
    throw new Error(`Experimentation lab did not start on a test subject with the chosen physical material: ${JSON.stringify(initialLab)}`);
  }
  if (!initialLab?.forecast?.includes('VIABLE EXPRESSION') || !initialLab?.forecast?.includes('UNKNOWN')) {
    throw new Error(`Forecast leaked or omitted the uncertainty framing: ${JSON.stringify(initialLab)}`);
  }

  // The valued main cannot be used as the first experiment for a source package.
  const prematureMain = await evaluate(`(() => {
    const splice = __SPLICEPIT_GAME__.scene.getScene('Splice');
    const originalSubject = splice.selectedSubjectId;
    splice.selectedSubjectId = 'r03.main.goat';
    splice.confirmArmed = true;
    splice.refresh();
    splice.execute(true);
    const diagnostics = __SPLICEPIT_DEBUG__.diagnostics();
    const message = splice.outcomeText.text;
    splice.selectedSubjectId = originalSubject;
    splice.confirmArmed = false;
    splice.refresh();
    return { experiments: diagnostics.domain.experimentHistory.length, message };
  })()`);
  if (prematureMain?.experiments !== 0 || !prematureMain?.message?.includes('VALUED MAIN LOCKED')) {
    throw new Error(`Untested source could be committed to the valued main: ${JSON.stringify(prematureMain)}`);
  }

  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Splice').execute(false); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Splice').outcomeText.text.startsWith('LATEST OUTCOME')`);
  const afterTest = await evaluate(`__SPLICEPIT_DEBUG__.diagnostics()`);
  if (afterTest?.domain?.experimentHistory?.length !== 1 || afterTest?.domain?.researchKnowledge?.[0]?.observationCount !== 1) {
    throw new Error(`Test splice did not persist research evidence: ${JSON.stringify(afterTest?.domain)}`);
  }
  const mainBefore = afterTest.domain.creatures.find((creature) => creature.role === 'main');
  if (!mainBefore || mainBefore.baseAnimalId !== 'goat' || mainBefore.spliceHistory.length !== 0) {
    throw new Error(`Test splice modified or replaced the chosen valued main creature: ${JSON.stringify(mainBefore)}`);
  }

  await evaluate(`(() => {
    const splice = __SPLICEPIT_GAME__.scene.getScene('Splice');
    splice.selectedSubjectId = 'r03.main.goat';
    splice.confirmArmed = true;
    splice.refresh();
    __SPLICEPIT_DEBUG__.setSeed('wp03h-main-smoke');
    splice.execute(true);
    return true;
  })()`);
  await waitExpr(`__SPLICEPIT_DEBUG__.diagnostics().domain.creatures.some(c => c.role === 'main' && c.spliceHistory.length === 1)`);
  const afterMain = await evaluate(`__SPLICEPIT_DEBUG__.diagnostics()`);
  const mainAfter = afterMain.domain.creatures.find((creature) => creature.role === 'main');
  if (!mainAfter || mainAfter.spliceHistory.length !== 1 || afterMain.domain.experimentHistory.length !== 2) {
    throw new Error(`Irreversible main splice did not persist correctly: ${JSON.stringify(afterMain.domain)}`);
  }
  if (mainAfter.lifeState !== 'living') {
    throw new Error('Smoke seed unexpectedly killed the Goat main creature; choose a non-lethal deterministic smoke seed.');
  }
  if (!afterMain.gameplay.currentCreature) {
    throw new Error('R0.1 Fit Pit compatibility bridge was not populated from the living domain main creature.');
  }

  const spliceDiagnostics = await evaluate(`(() => ({
    diagnostics: __SPLICEPIT_DEBUG__.diagnostics(),
    exported: JSON.parse(__SPLICEPIT_DEBUG__.exportState())
  }))()`);
  if (spliceDiagnostics?.diagnostics?.rng?.calls < 1 || !spliceDiagnostics?.diagnostics?.creatureBiology?.id) {
    throw new Error(`Splice diagnostics missing RNG/biology state: ${JSON.stringify(spliceDiagnostics)}`);
  }
  if (spliceDiagnostics?.exported?.rng?.seed !== 'wp03h-main-smoke' || spliceDiagnostics?.exported?.version !== 1) {
    throw new Error(`Debug export is not reproducible: ${JSON.stringify(spliceDiagnostics?.exported)}`);
  }

  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.start('Lab'); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Lab')`);
  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Lab').useFitPit(); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Battle')`);
  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Battle').enemy.hp = 1; return true; })()`);
  await pressKey('1', 'Digit1', 49);

  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Battle').finished === true`, 5000);
  const save = await evaluate(`JSON.parse(localStorage.getItem('splicepit-save'))`);
  const gameplay = save?.payload?.gameplay;
  if (!save || save.schemaVersion !== 2 || gameplay?.questStage !== 'slice_complete' || gameplay?.fitPitWins !== 1 || !gameplay?.currentCreature || gameplay?.baseAnimalId !== 'goat') {
    throw new Error(`Unexpected versioned save state: ${JSON.stringify(save)}`);
  }
  if (!Array.isArray(save.payload?.creatures?.records) || !Array.isArray(save.payload?.materials?.stock) || !Array.isArray(save.payload?.research?.knowledge) || save.payload?.research?.experiments?.length !== 2) {
    throw new Error(`Missing R0.3H persistence sections: ${JSON.stringify(save)}`);
  }

  const debugRoundTrip = await evaluate(`(() => {
    const exported = __SPLICEPIT_DEBUG__.exportState();
    const before = JSON.parse(exported).rng;
    __SPLICEPIT_DEBUG__.setSeed('temporary-smoke-seed');
    const restored = __SPLICEPIT_DEBUG__.importState(exported, { persist: false, restartScene: false });
    return { before, after: restored.rng, persistedSource: restored.persistedSave?.source };
  })()`);
  if (JSON.stringify(debugRoundTrip?.before) !== JSON.stringify(debugRoundTrip?.after) || debugRoundTrip?.persistedSource !== 'primary') {
    throw new Error(`Debug import/export round-trip failed: ${JSON.stringify(debugRoundTrip)}`);
  }

  const pageText = await evaluate(`document.body.innerText`);
  if (pageText.includes('Unable to load the game engine')) throw new Error('Phaser failed to load');

  console.log('Browser smoke OK: laptop viewport fit, held movement, Goat base choice, opening-ten source choice, valued-main test-first guard, test-first research, irreversible main splice, persistence and Fit Pit bridge');
  ws.close();
} catch (error) {
  console.error(error);
  if (chromeErrors) console.error(chromeErrors.slice(-5000));
  process.exitCode = 1;
} finally {
  cleanup();
}
