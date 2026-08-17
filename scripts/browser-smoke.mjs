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
    const result = await cdp('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed';
      throw new Error(detail);
    }
    return result.result?.value;
  }

  async function waitExpr(expression, timeoutMs = 15000) {
    return waitFor(async () => Boolean(await evaluate(expression)), timeoutMs, 120);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/` });

  try {
    await waitExpr(`Boolean(globalThis.__SPLICEPIT_GAME__?.scene?.isActive('Title'))`, 20000);
  } catch (error) {
    const diagnostics = await evaluate(`({
      href: location.href,
      title: document.title,
      text: document.body.innerText.slice(0, 1200),
      game: Boolean(globalThis.__SPLICEPIT_GAME__),
      scenes: globalThis.__SPLICEPIT_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) ?? []
    })`);
    throw new Error(`${error.message}; startup diagnostics=${JSON.stringify(diagnostics)}`);
  }

  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.start('Intro'); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Intro')`);
  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.start('Lab'); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Lab')`);

  await evaluate(`(() => {
    const lab = __SPLICEPIT_GAME__.scene.getScene('Lab');
    lab.useAnimalPen(); lab.closeMessage();
    lab.useGeneCabinet(); lab.closeMessage();
    lab.useSpliceBench();
    return true;
  })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Splice')`);

  await evaluate(`(() => {
    const oldRandom = Math.random;
    Math.random = () => 0.01;
    const scene = __SPLICEPIT_GAME__.scene.getScene('Splice');
    scene.selected = new Set(['gecko_regeneration']);
    scene.splice();
    Math.random = oldRandom;
    return true;
  })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Lab')`, 5000);

  await evaluate(`(() => { __SPLICEPIT_GAME__.scene.getScene('Lab').useFitPit(); return true; })()`);
  await waitExpr(`__SPLICEPIT_GAME__.scene.isActive('Battle')`);
  await evaluate(`(() => {
    const battle = __SPLICEPIT_GAME__.scene.getScene('Battle');
    battle.enemy.hp = 1;
    battle.takeTurn('attack');
    return true;
  })()`);

  await waitExpr(`__SPLICEPIT_GAME__.scene.getScene('Battle').finished === true`, 5000);
  const save = await evaluate(`JSON.parse(localStorage.getItem('splicepit-save'))`);
  const gameplay = save?.payload?.gameplay;
  if (!save || save.schemaVersion !== 1 || gameplay?.questStage !== 'slice_complete' || gameplay?.fitPitWins !== 1 || !gameplay?.currentCreature) {
    throw new Error(`Unexpected versioned save state: ${JSON.stringify(save)}`);
  }
  if (!Array.isArray(save.payload?.creatures?.records) || !Array.isArray(save.payload?.materials?.stock) || !Array.isArray(save.payload?.research?.knowledge)) {
    throw new Error(`Missing R0.2 persistence sections: ${JSON.stringify(save)}`);
  }

  const pageText = await evaluate(`document.body.innerText`);
  if (pageText.includes('Unable to load the game engine')) throw new Error('Phaser failed to load');

  console.log('Browser smoke OK: dist Title -> Intro -> Lab -> Splice -> Battle -> versioned saved win');
  ws.close();
} catch (error) {
  console.error(error);
  if (chromeErrors) console.error(chromeErrors.slice(-5000));
  process.exitCode = 1;
} finally {
  cleanup();
}
