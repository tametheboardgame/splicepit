import { drawCorruptionPolish } from './frontDoorArt.js';

export const TITLE_VIEW_WIDTH = 1280;
export const TITLE_VIEW_HEIGHT = 720;
export const TITLE_REVEAL_MS = 1250;
export const TITLE_ADVANCE_MS = 3200;

const HAPPY_TITLE_SPLASH_SRC = '/assets/splicepit-happy-title-v3.webp';
const FIRST_PULSES = [
  { start: 1650, duration: 120, strength: 0.48 },
  { start: 1880, duration: 280, strength: 1 },
  { start: 2290, duration: 150, strength: 0.72 },
] as const;
const LOOP_START_MS = 6200;
const LOOP_PERIOD_MS = 7100;
const LOOP_PULSES = [
  { offset: 0, duration: 100, strength: 0.42 },
  { offset: 180, duration: 210, strength: 0.88 },
  { offset: 520, duration: 90, strength: 0.58 },
] as const;

export type TitleVisualState = {
  reveal: number;
  corruption: number;
  readyToAdvance: boolean;
  promptAlpha: number;
  corruptionEventsPassed: number;
};

export type CorruptionOverlayOptions = {
  amount: number;
  elapsedMs: number;
  width?: number;
  height?: number;
  seed?: number;
};

type HappySplashStatus = 'idle' | 'loading' | 'ready' | 'error';
type HappySplashDebug = { status: HappySplashStatus; error: string | null; src: string };

let happyReference: HTMLImageElement | null = null;
let happyStatus: HappySplashStatus = 'idle';
let happyError: string | null = null;
let happyReadyAtElapsed: number | null = null;

function syncHappyDebug(): void {
  (globalThis as typeof globalThis & { __SPLICEPIT_HAPPY_SPLASH__?: HappySplashDebug }).__SPLICEPIT_HAPPY_SPLASH__ = {
    status: happyStatus,
    error: happyError,
    src: HAPPY_TITLE_SPLASH_SRC,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function pulseAmount(elapsedMs: number, start: number, duration: number, strength: number): number {
  if (elapsedMs < start || elapsedMs >= start + duration) return 0;
  const phase = (elapsedMs - start) / duration;
  return clamp01(Math.sin(Math.PI * phase) * strength);
}

function hash(seed: number): number {
  let value = seed | 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
}

export function titleVisualState(elapsedMs: number): TitleVisualState {
  const elapsed = Math.max(0, elapsedMs);
  const reveal = smoothstep(elapsed / TITLE_REVEAL_MS);
  let corruption = 0;
  let corruptionEventsPassed = 0;

  for (const pulse of FIRST_PULSES) {
    if (elapsed >= pulse.start) corruptionEventsPassed += 1;
    corruption = Math.max(corruption, pulseAmount(elapsed, pulse.start, pulse.duration, pulse.strength));
  }

  if (elapsed >= LOOP_START_MS) {
    const loopElapsed = elapsed - LOOP_START_MS;
    const completedLoops = Math.floor(loopElapsed / LOOP_PERIOD_MS);
    corruptionEventsPassed += completedLoops * LOOP_PULSES.length;
    const local = loopElapsed % LOOP_PERIOD_MS;
    for (const pulse of LOOP_PULSES) {
      if (local >= pulse.offset) corruptionEventsPassed += 1;
      corruption = Math.max(corruption, pulseAmount(local, pulse.offset, pulse.duration, pulse.strength));
    }
  }

  const readyToAdvance = elapsed >= TITLE_ADVANCE_MS;
  const promptAlpha = readyToAdvance ? 0.62 + Math.sin(elapsed / 380) * 0.24 : 0;
  return { reveal, corruption, readyToAdvance, promptAlpha, corruptionEventsPassed };
}

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colour: string,
): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function happyTitleImage(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!happyReference) {
    happyStatus = 'loading';
    syncHappyDebug();
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      happyStatus = 'ready';
      happyError = null;
      syncHappyDebug();
    };
    image.onerror = () => {
      happyStatus = 'error';
      happyError = `Failed to load ${HAPPY_TITLE_SPLASH_SRC}`;
      syncHappyDebug();
    };
    image.src = HAPPY_TITLE_SPLASH_SRC;
    happyReference = image;
  }
  return happyStatus === 'ready' && happyReference.naturalWidth > 0 ? happyReference : null;
}

function drawHappyReference(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  reveal: number,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = true;

  // Always keep a bright frame underneath the title art. A slow or failed
  // asset load must never leave the last dark-corruption frame on screen.
  ctx.globalAlpha = 1;
  rect(ctx, 0, 0, TITLE_VIEW_WIDTH, 382, '#bce9dc');
  rect(ctx, 0, 382, TITLE_VIEW_WIDTH, TITLE_VIEW_HEIGHT - 382, '#6fa36e');

  if (image) {
    ctx.globalAlpha = smoothstep(reveal);
    ctx.drawImage(image, 0, 0, TITLE_VIEW_WIDTH, TITLE_VIEW_HEIGHT);
  }

  ctx.restore();
}

let darkReference: HTMLImageElement | null = null;
function darkTitleImage(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!darkReference) {
    darkReference = new Image();
    darkReference.src = '/assets/splicepit-dark-title-reference.webp';
  }
  return darkReference.complete && darkReference.naturalWidth > 0 ? darkReference : null;
}

function drawDarkReference(ctx: CanvasRenderingContext2D, amount: number, elapsedMs: number): void {
  const image = darkTitleImage();
  const jitterX = Math.round((hash(Math.floor(elapsedMs / 18) + 31) - 0.5) * 18 * amount);
  const jitterY = Math.round((hash(Math.floor(elapsedMs / 21) + 97) - 0.5) * 10 * amount);
  ctx.save();
  ctx.globalAlpha = clamp01(amount * 1.2);
  if (image) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, jitterX - 8, jitterY - 5, TITLE_VIEW_WIDTH + 16, TITLE_VIEW_HEIGHT + 10);
  } else {
    rect(ctx, 0, 0, TITLE_VIEW_WIDTH, TITLE_VIEW_HEIGHT, '#090d0b');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 132px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillStyle = '#d6e78b';
    ctx.fillText('SPLICEPIT', 640 + jitterX, 332 + jitterY);
  }
  ctx.globalAlpha = amount;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#d7e971';
  ctx.fillText('GENETIC EXCELLENCE · ETHICS OPTIONAL', 640, 564);
  ctx.restore();
}

export function drawCorruptionOverlay(ctx: CanvasRenderingContext2D, options: CorruptionOverlayOptions): void {
  const amount = clamp01(options.amount);
  if (amount <= 0) return;
  const width = options.width ?? TITLE_VIEW_WIDTH;
  const height = options.height ?? TITLE_VIEW_HEIGHT;
  const seed = options.seed ?? 4919;
  const frame = Math.floor(options.elapsedMs / 22);

  ctx.save();
  ctx.globalAlpha = amount * 0.3;
  rect(ctx, 0, 0, width, height, '#07100b');
  for (let i = 0; i < 14; i += 1) {
    const h = 3 + Math.floor(hash(seed + frame * 17 + i * 73) * 20);
    const y = Math.floor(hash(seed + frame * 31 + i * 97) * height);
    const x = Math.floor((hash(seed + frame * 43 + i * 131) - 0.5) * 130 * amount);
    ctx.globalAlpha = amount * (0.18 + hash(seed + i * 211) * 0.44);
    rect(ctx, x, y, width, h, i % 3 === 0 ? '#b8333f' : '#07100b');
  }
  ctx.globalAlpha = amount * 0.5;
  for (let y = 0; y < height; y += 8) rect(ctx, 0, y, width, 1, '#020503');
  ctx.restore();
  drawCorruptionPolish(ctx, amount, options.elapsedMs, width, height, seed);
}

export function drawTitleScreen(ctx: CanvasRenderingContext2D, elapsedMs: number): TitleVisualState {
  const image = happyTitleImage();
  if (image && happyReadyAtElapsed === null) happyReadyAtElapsed = elapsedMs;

  const visualElapsed =
    happyStatus === 'ready' && happyReadyAtElapsed !== null
      ? Math.max(0, elapsedMs - happyReadyAtElapsed)
      : happyStatus === 'error'
        ? elapsedMs
        : 0;
  const state = titleVisualState(visualElapsed);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  drawHappyReference(ctx, image, state.reveal);

  // Corruption is only permitted after the approved happy splash has actually
  // loaded. This prevents cold/mobile loads from ever appearing permanently dark.
  if (image && state.corruption > 0) {
    drawDarkReference(ctx, state.corruption, visualElapsed);
    drawCorruptionOverlay(ctx, { amount: state.corruption, elapsedMs: visualElapsed });
  }

  if (state.readyToAdvance) {
    ctx.save();
    ctx.globalAlpha = state.promptAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#26382f';
    ctx.strokeText('ENTER / SPACE / CLICK', 640, 674);
    ctx.fillStyle = '#fff5cf';
    ctx.fillText('ENTER / SPACE / CLICK', 640, 674);
    ctx.restore();
  }
  return state;
}

syncHappyDebug();
