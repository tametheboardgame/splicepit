import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { traverseAuthoredYardToMasterLabTunnel } from './yard-scene-navigation.mjs';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9272;
const gamePort = 8122;
const outputDir = path.resolve('artifacts/rsp8-route-visual-acceptance');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let nextId = 0;
const pending = new Map();
const captures = [];

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

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

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
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message)); else waiter.resolve(message.result);
  });

  function cdp(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
    return response.result?.value;
  }

  async function holdKey(keyName, code, vk, durationMs = 90) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(durationMs);
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(80);
  }

  async function key(keyName, code, vk) {
    await holdKey(keyName, code, vk, 35);
  }

  async function nudge(keyName, code, vk) {
    await holdKey(keyName, code, vk, 70);
  }

  async function state() {
    return evaluate(`globalThis.__SPLICEPIT_VISUAL_RESET__ ? ({ ...globalThis.__SPLICEPIT_VISUAL_RESET__ }) : null`);
  }

  async function waitForPrompt(id) {
    return waitFor(async () => {
      const current = await state();
      return current?.tutorialPromptId === id && current?.tutorialPromptVisible && !current?.tutorialPromptCompleting ? current : null;
    }, 10000);
  }

  async function moveRouteAxis(axis, target, positiveKey, negativeKey, tolerance = 18) {
    const keys = {
      w: ['w', 'KeyW', 87],
      a: ['a', 'KeyA', 65],
      s: ['s', 'KeyS', 83],
      d: ['d', 'KeyD', 68],
    };
    let previous = null;
    let stalled = 0;
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const current = await state();
      const value = axis === 'x' ? current.playerX : current.playerY;
      const delta = target - value;
      if (Math.abs(delta) <= tolerance) return current;
      if (previous !== null && Math.abs(value - previous) < 1) stalled += 1;
      else stalled = 0;
      if (stalled >= 8) throw new Error(`RSP-8 Route movement stalled on ${axis} towards ${target}: ${JSON.stringify(current)}`);
      previous = value;
      const [keyName, code, vk] = keys[delta > 0 ? positiveKey : negativeKey];
      await nudge(keyName, code, vk);
    }
    throw new Error(`RSP-8 Route movement did not reach ${axis}=${target}: ${JSON.stringify(await state())}`);
  }

  async function setViewport(width, height, deviceScaleFactor, mobile) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile });
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
    await sleep(350);
  }

  async function frameMetrics(label, requireMobileControls = false) {
    const metrics = await evaluate(`(() => {
      const stage = document.querySelector('#visual-reset-stage');
      const rect = stage?.getBoundingClientRect();
      const state = globalThis.__SPLICEPIT_VISUAL_RESET__;
      const scene = globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__;
      const env = globalThis.__SPLICEPIT_ENVIRONMENT__;
      if (!stage || !rect || !state || !scene || !env) return null;
      const controls = [...document.querySelectorAll('#mobile-gameplay-controls [data-control]')]
        .map((element) => {
          const r = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            id: element.getAttribute('data-control'),
            left: r.left,
            top: r.top,
            right: r.right,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
            display: style.display,
            visibility: style.visibility,
            opacity: Number(style.opacity || 1),
          };
        })
        .filter((control) => control.display !== 'none' && control.visibility !== 'hidden' && control.opacity > 0.05 && control.width > 0 && control.height > 0);
      const sourceX = state.playerX - state.cameraX;
      const sourceY = state.playerY - state.cameraY;
      const playerScreen = {
        x: rect.left + (sourceX / 1280) * rect.width,
        y: rect.top + (sourceY / 720) * rect.height,
      };
      const coveringControls = controls.filter((control) => (
        playerScreen.x >= control.left - 6 && playerScreen.x <= control.right + 6
        && playerScreen.y >= control.top - 6 && playerScreen.y <= control.bottom + 6
      )).map((control) => control.id);
      return {
        label: ${JSON.stringify(label)},
        viewport: { width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight },
        stage: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        player: { worldX: state.playerX, worldY: state.playerY, cameraX: state.cameraX, cameraY: state.cameraY, screenX: playerScreen.x, screenY: playerScreen.y },
        controls,
        coveringControls,
        routeRenderer: state.routeRenderer,
        routeProductionCutoverReady: state.routeProductionCutoverReady,
        routeScenePackId: state.routeScenePackId,
        sceneMode: state.sceneMode,
        scene: {
          ready: scene.ready,
          brightReady: scene.brightReady,
          darkReady: scene.darkReady,
          productionCutoverReady: scene.productionCutoverReady,
          fallback: scene.fallback,
          cutoverBlockers: [...scene.cutoverBlockers],
          darkMix: scene.darkMix,
        },
        environment: { visualState: env.state.visualState, darkMix: env.state.darkMix, locationId: env.state.locationId },
      };
    })()`);
    if (!metrics) throw new Error(`RSP-8 ${label} metrics were unavailable.`);
    if (
      metrics.routeRenderer !== 'scene-image'
      || metrics.routeProductionCutoverReady !== true
      || metrics.routeScenePackId !== 'opening-route-bright-rsp6-v1'
      || metrics.sceneMode !== 'master-lab-route'
      || metrics.scene.productionCutoverReady !== true
      || metrics.scene.fallback
      || metrics.scene.cutoverBlockers.length !== 0
    ) {
      throw new Error(`RSP-8 ${label} lost authored Route ownership: ${JSON.stringify(metrics)}`);
    }
    if (
      metrics.stage.left < -1 || metrics.stage.top < -1
      || metrics.stage.right > metrics.viewport.width + 1
      || metrics.stage.bottom > metrics.viewport.height + 1
      || metrics.viewport.bodyWidth > metrics.viewport.width + 1
    ) {
      throw new Error(`RSP-8 ${label} viewport containment failed: ${JSON.stringify(metrics)}`);
    }
    if (
      metrics.player.screenX < metrics.stage.left + 20
      || metrics.player.screenX > metrics.stage.right - 20
      || metrics.player.screenY < metrics.stage.top + 20
      || metrics.player.screenY > metrics.stage.bottom - 20
    ) {
      throw new Error(`RSP-8 ${label} player is not safely visible in the Route viewport: ${JSON.stringify(metrics)}`);
    }
    if (requireMobileControls) {
      if (metrics.controls.length < 6) throw new Error(`RSP-8 ${label} has too few usable touch controls: ${JSON.stringify(metrics.controls)}`);
      const undersized = metrics.controls.filter((control) => control.width < 44 || control.height < 44);
      if (undersized.length) throw new Error(`RSP-8 ${label} has undersized touch controls: ${JSON.stringify(undersized)}`);
      if (metrics.coveringControls.length) throw new Error(`RSP-8 ${label} touch controls cover the protagonist: ${JSON.stringify(metrics.coveringControls)}`);
    }
    return metrics;
  }

  async function capture(label, requireMobileControls = false) {
    const metrics = await frameMetrics(label, requireMobileControls);
    const shot = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    const file = `${label}.png`;
    await writeFile(path.join(outputDir, file), Buffer.from(shot.data, 'base64'));
    captures.push({ file, metrics });
    return metrics;
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await setViewport(1280, 720, 1, false);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?skipTitle=1` });
  await waitFor(async () => (await state())?.ready === true);
  await evaluate(`localStorage.clear()`);
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(async () => (await state())?.ready === true);
  await cdp('Page.bringToFront');
  await key('Enter', 'Enter', 13);

  await waitForPrompt('movement');
  await holdKey('d', 'KeyD', 68, 1200);
  await waitForPrompt('interact');
  await key('e', 'KeyE', 69);
  await waitForPrompt('bag');
  await key('b', 'KeyB', 66);
  await waitForPrompt('confirm-cancel');
  await key('Enter', 'Enter', 13);
  await key('Escape', 'Escape', 27);
  await waitForPrompt('map');
  await key('m', 'KeyM', 77);
  await waitFor(async () => {
    const current = await state();
    return current?.openingSequenceComplete && current?.objectiveId === 'find-master' && current?.activeOpeningShell === 'map' ? current : null;
  });
  await key('Escape', 'Escape', 27);

  await traverseAuthoredYardToMasterLabTunnel({
    readState: state,
    moveLeft: () => nudge('a', 'KeyA', 65),
    moveRight: () => nudge('d', 'KeyD', 68),
    moveUp: () => nudge('w', 'KeyW', 87),
    moveDown: () => nudge('s', 'KeyS', 83),
    label: 'RSP-8 visual acceptance Yard navigation',
  });

  const arrival = await waitFor(async () => {
    const current = await state();
    return current?.sceneMode === 'master-lab-route' && current?.routeRendered && current?.routeRenderer === 'scene-image' ? current : null;
  });
  if (arrival.worldWidth !== 3072 || arrival.worldHeight !== 2049) {
    throw new Error(`RSP-8 authored Route world identity failed: ${JSON.stringify(arrival)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix === 0 && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.visualState === 'bright'`));
  await capture('desktop-route-entry-bright');

  const brightPixels = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    globalThis.__RSP8_BRIGHT_PIXELS__ = ctx.getImageData(0, 0, canvas.width, canvas.height).data.slice();
    return { width: canvas.width, height: canvas.height };
  })()`);
  if (!brightPixels || brightPixels.width !== 1280 || brightPixels.height !== 720) {
    throw new Error(`RSP-8 Bright Route pixel baseline failed: ${JSON.stringify(brightPixels)}`);
  }

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix >= 0.999 && globalThis.__SPLICEPIT_ENVIRONMENT__?.state?.visualState === 'dark'`), 10000);
  const darkDelta = await evaluate(`(() => {
    const canvas = document.querySelector('#visual-reset-stage');
    const ctx = canvas?.getContext('2d');
    const bright = globalThis.__RSP8_BRIGHT_PIXELS__;
    if (!canvas || !ctx || !bright) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    let sampled = 0;
    for (let y = 24; y < canvas.height - 24; y += 5) {
      for (let x = 24; x < canvas.width - 24; x += 5) {
        const i = (y * canvas.width + x) * 4;
        sampled += 1;
        if (Math.abs(data[i] - bright[i]) + Math.abs(data[i + 1] - bright[i + 1]) + Math.abs(data[i + 2] - bright[i + 2]) > 42) changed += 1;
      }
    }
    return { changed, sampled, ratio: sampled ? changed / sampled : 0 };
  })()`);
  if (!darkDelta || darkDelta.changed < 120) {
    throw new Error(`RSP-8 Dark Route does not materially differ from Bright: ${JSON.stringify(darkDelta)}`);
  }
  await capture('desktop-route-entry-dark');

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix === 0`), 10000);
  await moveRouteAxis('y', 768, 's', 'w');
  await moveRouteAxis('x', 1728, 'd', 'a');
  await capture('desktop-lab-approach-bright');

  await moveRouteAxis('y', 1272, 's', 'w', 10);
  await moveRouteAxis('x', 1953, 'd', 'a', 10);
  await capture('desktop-weighbridge-bright');

  await setViewport(412, 915, 2.75, true);
  await capture('mobile-portrait-weighbridge-bright', true);
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix >= 0.999`), 10000);
  await capture('mobile-portrait-weighbridge-dark', true);

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix === 0`), 10000);
  await setViewport(915, 412, 2.75, true);
  await capture('mobile-landscape-weighbridge-bright', true);
  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceDark()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix >= 0.999`), 10000);
  await capture('mobile-landscape-weighbridge-dark', true);

  await evaluate(`globalThis.__SPLICEPIT_ENVIRONMENT__.forceBright()`);
  await waitFor(async () => evaluate(`globalThis.__SPLICEPIT_ROUTE_SCENE_IMAGE__?.darkMix === 0`), 10000);
  await setViewport(1280, 720, 1, false);
  await moveRouteAxis('y', 1980, 's', 'w');
  await moveRouteAxis('x', 2256, 'd', 'a');
  await capture('desktop-pit-approach-bright');

  const manifest = {
    workPackage: 'RSP-8',
    routeScenePackId: arrival.routeScenePackId,
    routeWorld: [arrival.worldWidth, arrival.worldHeight],
    darkSha256: '5bff87c2bfe36bfb60bf6562afd8f66bfd3405a8ce85a6ef87bf92ba54d85be6',
    darkDelta,
    captureCount: captures.length,
    captures,
  };
  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`RSP-8 Route visual acceptance capture smoke passed: ${JSON.stringify({
    captureCount: captures.length,
    darkDelta,
    outputDir,
  })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  await writeFile(path.join(outputDir, 'failure.txt'), `${error?.stack ?? error}\n`, 'utf8').catch(() => {});
  console.error(error);
  process.exit(1);
}
