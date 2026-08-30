import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || '/usr/bin/chromium';
const chromePort = 9241;
const gamePort = 8099;
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
  async function imageState() {
    return evaluate(`globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ ? ({ ...globalThis.__SPLICEPIT_YARD_SCENE_IMAGE__ }) : null`);
  }
  async function controlPoint(control) {
    return evaluate(`(() => {
      const button = document.querySelector('[data-control="${control}"]');
      if (!(button instanceof HTMLElement)) return null;
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height, display: style.display, visibility: style.visibility };
    })()`);
  }
  async function tapControl(control, id = 3) {
    const point = await controlPoint(control);
    if (!point || point.width < 44 || point.height < 44 || point.display === 'none' || point.visibility === 'hidden') {
      throw new Error(`YSP-6 touch control ${control} is not usable: ${JSON.stringify(point)}`);
    }
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y, radiusX: 5, radiusY: 5, force: 1, id }] });
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(100);
  }
  async function holdControl(control, durationMs, id = 7) {
    const point = await controlPoint(control);
    if (!point || point.width < 44 || point.height < 44) throw new Error(`YSP-6 touch control ${control} is unavailable.`);
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y, radiusX: 5, radiusY: 5, force: 1, id }] });
    await sleep(durationMs);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(100);
  }
  async function waitForPrompt(id) {
    return waitFor(async () => {
      const value = await state();
      return value?.tutorialPromptId === id && value.tutorialPromptVisible ? value : null;
    });
  }
  async function mobileHudState() {
    return evaluate(`(() => {
      const root = document.querySelector('#mobile-gameplay-hud');
      const objective = root?.querySelector('[data-mobile-hud="objective"]');
      return { active: root?.classList.contains('is-active') ?? false, objectiveText: objective?.textContent ?? '' };
    })()`);
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2.75, mobile: true });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${gamePort}/?yardRenderer=scene-image` });

  let current = await waitFor(async () => {
    const yard = await state();
    const image = await imageState();
    const controls = await evaluate(`document.querySelector('#mobile-gameplay-controls')?.classList.contains('is-active') ?? false`);
    return yard?.ready && yard?.phase === 'confirmed' && yard?.yardRendered && image?.active && image?.baseRendered && image?.foregroundRendered && controls
      ? { yard, image }
      : null;
  });

  if (current.yard.yardRenderer !== 'scene-image' || current.yard.scenePackId !== 'yard-bright-scene-ysp6-v1') {
    throw new Error(`YSP-6 depth scene pack was not selected: ${JSON.stringify(current)}`);
  }
  if (current.image.scenePackId !== 'yard-bright-scene-ysp6-v1' || current.image.assetPackId !== 'yard-bright-scene-v1' || current.image.sourceWidth !== 1280 || current.image.sourceHeight !== 720) {
    throw new Error(`YSP-6 did not render the recovered Bright Yard through the depth pack: ${JSON.stringify(current.image)}`);
  }
  if (current.image.foregroundMode !== 'exact-base-pixel-regions' || current.image.activeOccluderIds.length !== 0) {
    throw new Error(`YSP-6 foreground did not begin in front/behind neutral state at spawn: ${JSON.stringify(current.image)}`);
  }
  if (current.yard.groundShadowAlpha !== 0.24 || current.yard.groundShadowRadiusX !== 20 || current.yard.groundShadowRadiusY !== 6) {
    throw new Error(`YSP-6 scene-specific contact shadow was not applied: ${JSON.stringify(current.yard)}`);
  }
  if (current.image.fallback || current.image.legacyRendererRendered) {
    throw new Error(`YSP-6 mixed or fell back to the legacy Yard renderer: ${JSON.stringify(current.image)}`);
  }
  if (current.yard.sceneMode !== 'yard' || current.yard.worldWidth !== 1280 || current.yard.worldHeight !== 720) {
    throw new Error(`YSP-6 did not start in the authored Yard world: ${JSON.stringify(current.yard)}`);
  }
  if (Math.abs(current.yard.playerX - 575) > 1 || Math.abs(current.yard.playerY - 660) > 1) {
    throw new Error(`YSP-6 did not use the authored lower-centre spawn: ${JSON.stringify(current.yard)}`);
  }

  current = await waitForPrompt('movement');
  await holdControl('move-right', 1200);
  current = await waitForPrompt('interact');
  if (current.collisionCount < 1 || current.playerX < 700 || current.playerX > 750) {
    throw new Error(`YSP-6 authored service-ring collision failed: ${JSON.stringify(current)}`);
  }

  // Step behind the low service-ring front rim. The exact base pixels for that
  // rim must now be rendered after Milo, while the other depth regions remain
  // inactive because their sort lines are further north.
  await holdControl('move-up', 150, 8);
  current = await state();
  const serviceDepth = await waitFor(async () => {
    const image = await imageState();
    return image?.activeOccluderIds?.includes('service-ring-front-rim') ? image : null;
  });
  if (serviceDepth.activeOccluderIds.length !== 1 || serviceDepth.occluderRenderCount < 1) {
    throw new Error(`YSP-6 service-ring foreground depth did not activate cleanly: ${JSON.stringify(serviceDepth)}`);
  }

  // Return to the same proven YSP-5 traversal baseline after the isolated depth
  // probe. This keeps the route test independent from the extra YSP-6 movement.
  await holdControl('move-down', 150, 9);
  current = await state();
  if (current.playerY < 650 || current.playerY > 670) {
    throw new Error(`YSP-6 depth probe did not return to the route baseline: ${JSON.stringify(current)}`);
  }

  const interactionsBefore = current.interactionCount;
  await tapControl('action');
  current = await waitForPrompt('bag');
  if (current.interactionCount <= interactionsBefore || current.lastInteractionAnchor !== 'service-ring-inspection') {
    throw new Error(`YSP-6 ACTION lost the authored service-ring semantic anchor: ${JSON.stringify(current)}`);
  }

  await tapControl('bag');
  current = await waitForPrompt('confirm-cancel');
  if (current.activeOpeningShell !== 'bag') throw new Error(`YSP-6 Bag shell failed: ${JSON.stringify(current)}`);
  await tapControl('action');
  await tapControl('back');
  await waitForPrompt('map');
  await tapControl('map');
  current = await waitFor(async () => {
    const value = await state();
    return value?.openingSequenceComplete && value?.objectiveId === 'find-master' && value?.activeOpeningShell === 'map' ? value : null;
  });

  const hud = await waitFor(async () => {
    const value = await mobileHudState();
    return value?.active && value.objectiveText.toLowerCase().includes('find') ? value : null;
  });
  if (!hud.active || !hud.objectiveText.toLowerCase().includes('find')) {
    throw new Error(`YSP-6 mobile objective HUD did not reach Find your Master: ${JSON.stringify(hud)}`);
  }

  await tapControl('back');

  // Reuse the exact YSP-5 route sequence after returning to its known baseline.
  await holdControl('move-left', 1000, 11);
  await holdControl('move-up', 2050, 12);
  await holdControl('move-right', 1200, 13);
  await holdControl('move-down', 500, 14);
  await holdControl('move-right', 1850, 15);

  current = await waitFor(async () => {
    const value = await state();
    return value?.sceneMode === 'master-lab-route' && value?.routeRendered && value?.routeHandoffTarget === 'master-lab-route'
      ? value
      : null;
  });
  if (current.routeHandoffCount !== 1 || current.routeHandoffExitId !== 'master-lab-tunnel') {
    throw new Error(`YSP-6 tunnel handoff did not fire exactly once: ${JSON.stringify(current)}`);
  }
  if (!current.openingSequenceComplete || current.objectiveId !== 'find-master') {
    throw new Error(`YSP-6 route handoff reset onboarding or objective state: ${JSON.stringify(current)}`);
  }
  if (current.worldWidth !== 2920 || current.worldHeight !== 1600 || current.playerX < 1760) {
    throw new Error(`YSP-6 did not enter the existing authored opening-route world at its Lab approach: ${JSON.stringify(current)}`);
  }

  const finalImageState = await imageState();
  if (!finalImageState.baseRendered || !finalImageState.foregroundRendered || finalImageState.legacyRendererRendered || finalImageState.occluderRenderCount < 1) {
    throw new Error(`YSP-6 Bright Yard depth layer did not remain isolated and active before route handoff: ${JSON.stringify(finalImageState)}`);
  }

  console.log(`YSP-6 Yard foreground/grounding smoke passed: ${JSON.stringify({ sceneMode: current.sceneMode, playerX: current.playerX, playerY: current.playerY, occluderRenders: finalImageState.occluderRenderCount, interactions: current.interactionCount, handoff: current.routeHandoffTarget })}`);
  ws.close();
  cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exit(1);
}
