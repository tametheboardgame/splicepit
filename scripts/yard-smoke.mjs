import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const port = 9224;
const gamePort = 8082;
let nextId = 0;
const pending = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 20000, intervalMs = 80) {
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
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(100);
  }

  async function holdKey(keyName, code, vk, durationMs) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(120);
  }

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function imageState() {
    return evaluate(`globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ ? ({ ...globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ }) : null`);
  }

  async function playerSignature() {
    return evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      const ctx = canvas?.getContext('2d');
      const debug = globalThis.__SPLICEPIT_VISUAL_RESET__;
      if (!canvas || !ctx || !debug) return null;
      const x = Math.max(0, Math.round(debug.playerX - debug.cameraX - 32));
      const y = Math.max(0, Math.round(debug.playerY - debug.cameraY - 88));
      const data = ctx.getImageData(x, y, 64, 96).data;
      let hash = 2166136261 >>> 0;
      for (let i = 0; i < data.length; i += 4) {
        hash ^= data[i]; hash = Math.imul(hash, 16777619) >>> 0;
        hash ^= data[i + 1]; hash = Math.imul(hash, 16777619) >>> 0;
        hash ^= data[i + 2]; hash = Math.imul(hash, 16777619) >>> 0;
      }
      return hash >>> 0;
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });

  await waitFor(async () => (await state())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.ready === true);
  await cdp('Page.bringToFront');

  const expected = [
    { id: 'milo', name: 'Milo' },
    { id: 'theo', name: 'Theo' },
    { id: 'ada', name: 'Ada' },
    { id: 'pip', name: 'Pip' },
  ];
  const signatures = [];

  for (let index = 0; index < expected.length; index += 1) {
    const avatar = expected[index];
    const selector = await waitFor(async () => {
      const current = await state();
      return current?.ready && current?.phase === 'select' && current?.selectionRendered ? current : null;
    });

    if (selector.selectedAvatarId !== avatar.id || selector.selectionPresentation !== 'yard-arrival') {
      throw new Error(`YSP-7 selector did not expose ${avatar.id} before production Yard entry: ${JSON.stringify(selector)}`);
    }

    await key('Enter', 'Enter', 13);
    const initial = await waitFor(async () => {
      const current = await state();
      const image = await imageState();
      return current?.phase === 'confirmed'
        && current?.yardRendered
        && current?.yardRenderer === 'scene-image'
        && image?.active
        && image?.baseRendered
        && image?.foregroundRendered
        ? { current, image }
        : null;
    });

    const current = initial.current;
    const image = initial.image;
    if (current.selectedAvatarId !== avatar.id || current.playerName !== avatar.name || !current.saved) {
      throw new Error(`YSP-7 production Yard lost selected identity ${avatar.id}: ${JSON.stringify(current)}`);
    }
    if (current.scenePackId !== 'yard-bright-scene-ysp6-v1' || current.sceneMode !== 'yard') {
      throw new Error(`YSP-7 did not activate the authored Bright Yard scene pack: ${JSON.stringify(current)}`);
    }
    if (current.viewportWidth !== 1280 || current.viewportHeight !== 720 || current.worldWidth !== 1280 || current.worldHeight !== 720) {
      throw new Error(`YSP-7 production Yard dimensions are wrong: ${JSON.stringify(current)}`);
    }
    if (Math.abs(current.playerX - 575) > 1 || Math.abs(current.playerY - 660) > 1 || current.cameraX !== 0 || current.cameraY !== 0) {
      throw new Error(`YSP-7 did not use the authored spawn/camera contract: ${JSON.stringify(current)}`);
    }
    if (image.assetPackId !== 'yard-bright-scene-v1' || image.sourceWidth !== 1280 || image.sourceHeight !== 720 || image.fallback || image.legacyRendererRendered) {
      throw new Error(`YSP-7 production Yard mixed with or fell back to legacy scenery: ${JSON.stringify(image)}`);
    }

    const canvasSize = await evaluate(`(() => {
      const canvas = document.querySelector('#visual-reset-stage');
      return canvas ? { width: canvas.width, height: canvas.height, bodyWidth: document.body.scrollWidth, viewportWidth: innerWidth, visibility: getComputedStyle(canvas).visibility } : null;
    })()`);
    if (!canvasSize || canvasSize.width !== 1280 || canvasSize.height !== 720 || canvasSize.bodyWidth > canvasSize.viewportWidth || canvasSize.visibility === 'hidden') {
      throw new Error(`YSP-7 production Yard viewport/atomic preload contract failed: ${JSON.stringify(canvasSize)}`);
    }

    await sleep(100);
    const signature = await playerSignature();
    if (!Number.isInteger(signature)) throw new Error(`YSP-7 could not sample ${avatar.id} in the production Yard.`);
    signatures.push(signature);

    if (index === 0) {
      await holdKey('d', 'KeyD', 68, 1200);
      const collision = await state();
      if (collision.collisionCount < 1 || collision.playerX < 700 || collision.playerX > 750 || collision.facing !== 'right') {
        throw new Error(`YSP-7 production collision did not match the authored service ring: ${JSON.stringify(collision)}`);
      }

      await holdKey('w', 'KeyW', 87, 150);
      const depth = await waitFor(async () => {
        const value = await imageState();
        return value?.activeOccluderIds?.includes('service-ring-front-rim') ? value : null;
      });
      if (depth.occluderRenderCount < 1 || depth.legacyRendererRendered) {
        throw new Error(`YSP-7 production foreground depth did not activate cleanly: ${JSON.stringify(depth)}`);
      }
    }

    await key('Escape', 'Escape', 27);
    const returned = await waitFor(async () => {
      const value = await state();
      return value?.phase === 'select' && value?.selectionRendered ? value : null;
    });
    if (returned.yardRendered || returned.selectionPresentation !== 'yard-arrival') {
      throw new Error(`YSP-7 Escape did not restore the in-world selector: ${JSON.stringify(returned)}`);
    }

    if (index < expected.length - 1) {
      await key('ArrowRight', 'ArrowRight', 39);
    }
  }

  if (new Set(signatures).size !== expected.length) {
    throw new Error(`YSP-7 did not render four distinct selected protagonists in the production Yard: ${JSON.stringify(signatures)}`);
  }

  const rejectedUiPresent = await evaluate(`Boolean(
    document.querySelector('.character-select-shell, .character-tab, #identity-form, #character-preview') ||
    globalThis.__SPLICEPIT_CHARACTER_SELECT__
  )`);
  if (rejectedUiPresent) throw new Error('Rejected legacy character-selection presentation returned during YSP-7.');

  console.log(`YSP-7 production Bright Yard passed for all protagonists: ${JSON.stringify({ avatars: expected.map((entry) => entry.id), signatures })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
