import {
  DEFAULT_ENVIRONMENT_TRANSITION_MS,
  environmentVisualController,
  refreshEnvironmentVisualDebug,
  type EnvironmentTransitionPhase,
  type EnvironmentVisualState,
} from './environment/environmentVisualContract.js';

const GLITCH_CANVAS_ID = 'local-pit-entry-glitch';
const PIT_CANVAS_ID = 'local-pit-stage';
const GLITCH_DURATION_MS = DEFAULT_ENVIRONMENT_TRANSITION_MS;

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
  environmentVisualState: EnvironmentVisualState;
  environmentPhase: EnvironmentTransitionPhase;
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
  environmentVisualState: 'bright',
  environmentPhase: 'steady',
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
  ctx.globalAlpha = phase === 'recovery' ? Math.max(0.2, 0.82 * strength) : 0.92;
  ctx.drawImage(source, jitterX, jitterY, 1280, 720);

  for (let y = 34; y < 690; y += 74) {
    const shift = (((tick + y) * 11) % 42) - 21;
    ctx.globalAlpha = 0.46 * strength;
    ctx.drawImage(source, 0, y, 1280, 14, shift, y + ((tick + y) % 3) - 1, 1280, 14);
  }

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
    environmentVisualController.forceTransition('local-pit', now, GLITCH_DURATION_MS);
    refreshEnvironmentVisualDebug(now);
  }
  lastActive = active;

  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  const source = document.getElementById(PIT_CANVAS_ID) as HTMLCanvasElement | null;
  const elapsed = now - glitchStartedAt;
  const glitching = active && elapsed >= 0 && elapsed < GLITCH_DURATION_MS && Boolean(source);
  const sharedVisual = environmentVisualController.sample('local-pit', now);

  debug.glitching = glitching;
  debug.glitchCount = glitchCount;
  debug.phase = glitching ? phaseFor(elapsed) : 'idle';
  debug.elapsedMs = glitching ? Math.round(elapsed) : 0;
  debug.environmentVisualState = sharedVisual.visualState;
  debug.environmentPhase = sharedVisual.phase;

  if (canvas && ctx) {
    canvas.setAttribute('aria-hidden', glitching ? 'false' : 'true');
    if (glitching && source) drawGlitchFrame(ctx, source, elapsed);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
