import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9224;
const gamePort = 8082;
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
  `--remote-debugging-port=${port}`, '--remote-allow-origins=*', 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

function cleanup() {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
}
process.on('exit', cleanup);

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
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  }

  async function key(key, code, vk) {
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
    });
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/` });

  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`), 20000);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__?.ready === true`), 20000);
  await cdp('Page.bringToFront');

  await key('Enter', 'Enter', 13);

  const yardState = await waitFor(async () => {
    const state = await evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
    return state?.phase === 'confirmed' && state?.yardRendered ? state : null;
  });

  if (yardState.selectedAvatarId !== 'milo' || yardState.playerName !== 'Milo' || !yardState.saved) {
    throw new Error(`Yard did not receive the accepted selected identity: ${JSON.stringify(yardState)}`);
  }

  const visualStats = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colours = new Set();
    let dark = 0;
    let waterLike = 0;
    let warm = 0;
    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colours.add((r << 16) | (g << 8) | b);
        if (r < 90 && g < 110 && b < 100) dark += 1;
        if (b > r && g >= r && b > 100) waterLike += 1;
        if (r > 150 && g > 110 && b < 130) warm += 1;
      }
    }

    const player = ctx.getImageData(490, 360, 110, 125).data;
    let playerVariation = 0;
    for (let i = 4; i < player.length; i += 32) {
      if (
        player[i] !== player[i - 4] ||
        player[i + 1] !== player[i - 3] ||
        player[i + 2] !== player[i - 2]
      ) playerVariation += 1;
    }

    return {
      uniqueColours: colours.size,
      dark,
      waterLike,
      warm,
      playerVariation,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
    };
  })()`);

  if (!visualStats) throw new Error('Could not inspect Yard canvas.');
  if (visualStats.uniqueColours < 24) {
    throw new Error(`Yard palette/detail collapsed unexpectedly: ${JSON.stringify(visualStats)}`);
  }
  if (visualStats.waterLike < 25 || visualStats.warm < 40 || visualStats.dark < 25) {
    throw new Error(`Yard lost required environment colour families: ${JSON.stringify(visualStats)}`);
  }
  if (visualStats.playerVariation < 50) {
    throw new Error(`Accepted protagonist is not visibly present in the Yard review area: ${JSON.stringify(visualStats)}`);
  }
  if (visualStats.bodyWidth > visualStats.viewportWidth) {
    throw new Error(`Yard introduced horizontal overflow: ${JSON.stringify(visualStats)}`);
  }

  const rejectedUiPresent = await evaluate(`Boolean(
    document.querySelector('.character-select-shell, .character-tab, #identity-form, #character-preview') ||
    globalThis.__SPLICEPIT_CHARACTER_SELECT__
  )`);
  if (rejectedUiPresent) throw new Error('Rejected legacy presentation returned during Yard review.');

  console.log(`WP0.4F Yard render smoke passed: ${JSON.stringify(visualStats)}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
