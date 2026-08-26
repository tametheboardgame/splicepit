const GLITCH_CANVAS_ID = 'local-pit-entry-glitch';
const PIT_CANVAS_ID = 'local-pit-stage';
const GLITCH_DURATION_MS = 760;

type PitDebug = {
  active?: boolean;
  rendered?: boolean;
};

type PitGlitchPhase = 'idle' | 'rupture' | 'wrong-layer' | 'recovery';

type PitGlitchDebug = {
  ready: boolean;
  glitching: boolean;
  glitchCount: number;
  phase: PitGlitchPhase;
  elapsedMs: number;
};

type DebugGlobal = typeof globalThis & {
  __SPLICEPIT_LOCAL_PIT__?: PitDebug;
  __SPLICEPIT_PIT_ENTRY_GLITCH__?: PitGlitchDebug;
};

let lastActive = false;
let glitchStartedAt = Number.NEGATIVE_INFINITY;
let glitchCount = 0;

const debug: PitGlitchDebug = {
  ready: true,
  glitching: false,
  glitchCount: 0,
  phase: 'idle',
  elapsedMs: 0,
};
(globalThis as DebugGlobal).__SPLICEPIT_PIT_ENTRY_GLITCH__ = debug;

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(GLITCH_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas && canvas.parentElement === root) return canvas;
  canvas?.remove();
  canvas = document.createElement('canvas');
  canvas.id = GLITCH_CANVAS_ID;
  canvas.width = 1280;
  canvas.height = 720;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.width = 'min(100vw, calc(100vh * 16 / 9))';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '100vh';
  canvas.style.aspectRatio = '16 / 9';
  canvas.style.zIndex = '30';
  canvas.style.pointerEvents = 'none';
  canvas.style.imageRendering = 'pixelated';
  root.style.position = 'relative';
  root.append(canvas);
  return canvas;
}

function phaseFor(elapsed: number): PitGlitchPhase {
  if (elapsed < 150) return 'rupture';
  if (elapsed < 510) return 'wrong-layer';
  if (elapsed < GLITCH_DURATION_MS) return 'recovery';
  return 'idle';
}

function drawScanNoise(ctx: CanvasRenderingContext2D, elapsed: number, strength: number): void {
  const tick = Math.floor(elapsed / 34);
  for (let y = 0; y < 720; y += 12) {
    if ((y / 12 + tick) % 3 !== 0) continue;
    ctx.fillStyle = `rgba(11, 7, 9, ${0.12 + strength * 0.18})`;
    ctx.fillRect(0, y, 1280, 3 + ((tick + y) % 5));
  }
  for (let i = 0; i < 18; i += 1) {
    const seed = tick * 97 + i * 53;
    const x = (seed * 31) % 1240;
    const y = (seed * 17) % 700;
    const width = 12 + (seed % 90);
    ctx.fillStyle = i % 3 === 0
      ? `rgba(150, 39, 48, ${0.12 + strength * 0.22})`
      : `rgba(18, 10, 13, ${0.14 + strength * 0.2})`;
    ctx.fillRect(x, y, width, 3 + (seed % 8));
  }
}

function drawWrongLayer(ctx: CanvasRenderingContext2D, elapsed: number, strength: number): void {
  const pulse = Math.floor(elapsed / 70) % 2;
  ctx.fillStyle = `rgba(18, 5, 9, ${0.28 + strength * 0.24})`;
  ctx.fillRect(0, 0, 1280, 720);

  ctx.fillStyle = `rgba(104, 19, 30, ${0.32 + strength * 0.22})`;
  for (const [x, y, w, h] of [
    [80, 118, 210, 12], [242, 166, 8, 180], [1030, 92, 12, 196], [880, 560, 240, 9],
    [470, 604, 16, 78], [640, 40, 8, 132], [718, 180, 186, 7],
  ] as const) ctx.fillRect(x + (pulse ? 4 : -3), y, w, h);

  ctx.fillStyle = `rgba(228, 205, 164, ${0.18 + strength * 0.18})`;
  for (const [x, y] of [[210, 310], [262, 338], [996, 374], [1040, 402], [612, 540]] as const) {
    ctx.fillRect(x, y, 34, 7);
    ctx.fillRect(x + 9, y - 8, 18, 7);
    ctx.fillRect(x + 13, y + 7, 10, 12);
  }

  ctx.fillStyle = `rgba(8, 4, 7, ${0.36 + strength * 0.25})`;
  for (const [x, y, w] of [[0, 188, 340], [890, 232, 390], [180, 462, 430], [740, 506, 330]] as const) {
    ctx.fillRect(x + (pulse ? 10 : -8), y, w, 18);
  }
}

function drawGlitchFrame(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, elapsed: number): void {
  const phase = phaseFor(elapsed);
  const progress = Math.min(1, elapsed / GLITCH_DURATION_MS);
  const recovery = phase === 'recovery' ? 1 - ((elapsed - 510) / (GLITCH_DURATION_MS - 510)) : 1;
  const strength = phase === 'recovery' ? Math.max(0, recovery) : Math.min(1, progress * 3.2 + 0.2);
  const tick = Math.floor(elapsed / 38);
  const jitterX = ((tick * 7) % 13) - 6;
  const jitterY = ((tick * 5) % 7) - 3;

  ctx.clearRect(0, 0, 1280, 720);
  ctx.save();
  ctx.globalAlpha = phase === 'recovery' ? 0.82 * strength : 0.92;
  ctx.filter = phase === 'wrong-layer'
    ? 'contrast(190%) saturate(65%) hue-rotate(305deg) brightness(58%)'
    : 'contrast(150%) saturate(140%) brightness(78%)';
  ctx.drawImage(source, jitterX, jitterY, 1280, 720);
  ctx.filter = 'none';

  for (let y = 34; y < 690; y += 74) {
    const shift = (((tick + y) * 11) % 42) - 21;
    ctx.globalAlpha = 0.46 * strength;
    ctx.drawImage(source, 0, y, 1280, 14, shift, y + ((tick + y) % 3) - 1, 1280, 14);
  }

  drawWrongLayer(ctx, elapsed, strength);
  drawScanNoise(ctx, elapsed, strength);

  if (phase === 'rupture') {
    ctx.fillStyle = `rgba(236, 222, 185, ${0.12 + 0.12 * (tick % 2)})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
  ctx.restore();
}

function render(now: number): void {
  const pit = (globalThis as DebugGlobal).__SPLICEPIT_LOCAL_PIT__;
  const active = Boolean(pit?.active);
  if (active && !lastActive) {
    glitchStartedAt = now;
    glitchCount += 1;
  }
  lastActive = active;

  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  const source = document.getElementById(PIT_CANVAS_ID) as HTMLCanvasElement | null;
  const elapsed = now - glitchStartedAt;
  const glitching = active && elapsed >= 0 && elapsed < GLITCH_DURATION_MS && Boolean(source);

  debug.glitching = glitching;
  debug.glitchCount = glitchCount;
  debug.phase = glitching ? phaseFor(elapsed) : 'idle';
  debug.elapsedMs = glitching ? Math.round(elapsed) : 0;

  if (canvas && ctx) {
    canvas.setAttribute('aria-hidden', glitching ? 'false' : 'true');
    if (glitching && source) drawGlitchFrame(ctx, source, elapsed);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
