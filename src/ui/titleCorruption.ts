export const TITLE_VIEW_WIDTH = 1280;
export const TITLE_VIEW_HEIGHT = 720;
export const TITLE_REVEAL_MS = 1250;
export const TITLE_ADVANCE_MS = 3200;

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

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly [number, number][], colour: string): void {
  ctx.fillStyle = colour;
  ctx.beginPath();
  points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function drawBrightBackdrop(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  rect(ctx, 0, 0, 1280, 210, '#bce9dc');
  rect(ctx, 0, 210, 1280, 150, '#91cda9');
  rect(ctx, 0, 360, 1280, 360, '#6fa36e');
  polygon(ctx, [[0, 320], [180, 158], [350, 320]], '#7db68d');
  polygon(ctx, [[210, 330], [470, 132], [700, 330]], '#74aa82');
  polygon(ctx, [[650, 330], [930, 150], [1180, 330]], '#78b187');
  polygon(ctx, [[1020, 320], [1180, 190], [1280, 265], [1280, 360]], '#679b75');

  const shift = Math.floor((elapsedMs / 90) % 80);
  rect(ctx, 105 - shift, 92, 110, 18, '#eff8dc');
  rect(ctx, 142 - shift, 74, 58, 18, '#eff8dc');
  rect(ctx, 965 + shift / 2, 104, 124, 18, '#eff8dc');
  rect(ctx, 1004 + shift / 2, 86, 54, 18, '#eff8dc');

  rect(ctx, 0, 574, 1280, 146, '#5b895e');
  for (let x = 0; x < 1280; x += 48) {
    rect(ctx, x + 6, 604 + ((x / 48) % 2) * 12, 18, 6, '#86b979');
    rect(ctx, x + 14, 610 + ((x / 48) % 2) * 12, 5, 12, '#496448');
  }
}

function drawDnaFrame(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const left = 262;
  const right = 1018;
  const top = 214;
  const bottom = 456;

  ctx.strokeStyle = '#365644';
  ctx.lineWidth = 38;
  ctx.beginPath();
  ctx.moveTo(left, 338);
  ctx.bezierCurveTo(360, top, 472, top, 570, 338);
  ctx.bezierCurveTo(668, bottom, 780, bottom, 878, 338);
  ctx.bezierCurveTo(938, 265, 984, 266, right, 326);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, 338);
  ctx.bezierCurveTo(360, bottom, 472, bottom, 570, 338);
  ctx.bezierCurveTo(668, top, 780, top, 878, 338);
  ctx.bezierCurveTo(938, 408, 984, 408, right, 348);
  ctx.stroke();

  ctx.strokeStyle = '#7ebc69';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(left, 338);
  ctx.bezierCurveTo(360, top, 472, top, 570, 338);
  ctx.bezierCurveTo(668, bottom, 780, bottom, 878, 338);
  ctx.bezierCurveTo(938, 265, 984, 266, right, 326);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, 338);
  ctx.bezierCurveTo(360, bottom, 472, bottom, 570, 338);
  ctx.bezierCurveTo(668, top, 780, top, 878, 338);
  ctx.bezierCurveTo(938, 408, 984, 408, right, 348);
  ctx.stroke();

  ctx.strokeStyle = '#f2dfae';
  ctx.lineWidth = 6;
  for (let x = 350; x <= 900; x += 55) {
    const y1 = 281 + Math.sin(x / 82) * 44;
    const y2 = 395 - Math.sin(x / 82) * 44;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }

  const flowers = [[318, 277], [390, 432], [522, 232], [715, 444], [846, 239], [962, 386]] as const;
  for (const [x, y] of flowers) {
    ctx.fillStyle = '#f2dfae';
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d96b3b';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  }

  const bubbles = [[300, 404, 18], [445, 250, 14], [774, 240, 17], [944, 278, 15]] as const;
  for (const [x, y, r] of bubbles) {
    ctx.fillStyle = '#9adbc6';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dff6e8';
    ctx.beginPath(); ctx.arc(x - 5, y - 5, Math.max(3, r / 4), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBrightLogo(ctx: CanvasRenderingContext2D, reveal: number): void {
  const eased = smoothstep(reveal);
  ctx.save();
  ctx.translate(640, 338);
  ctx.scale(0.84 + eased * 0.16, 0.84 + eased * 0.16);
  ctx.translate(-640, -338);
  ctx.globalAlpha = eased;
  drawDnaFrame(ctx);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '900 126px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#26382f';
  ctx.strokeText('SplicePit', 640, 334);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#d96b3b';
  ctx.strokeText('SplicePit', 640, 330);
  ctx.fillStyle = '#fff0a9';
  ctx.fillText('SplicePit', 640, 326);

  ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#26382f';
  ctx.fillText('GENETIC EXCELLENCE · ETHICS OPTIONAL', 640, 512);
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
}

export function drawTitleScreen(ctx: CanvasRenderingContext2D, elapsedMs: number): TitleVisualState {
  const state = titleVisualState(elapsedMs);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawBrightBackdrop(ctx, elapsedMs);
  drawBrightLogo(ctx, state.reveal);

  if (state.corruption > 0) {
    drawDarkReference(ctx, state.corruption, elapsedMs);
    drawCorruptionOverlay(ctx, { amount: state.corruption, elapsedMs });
  }

  if (state.readyToAdvance) {
    ctx.save();
    ctx.globalAlpha = state.promptAlpha;
    ctx.fillStyle = '#fff5cf';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillText('ENTER / SPACE / CLICK', 640, 626);
    ctx.restore();
  }
  return state;
}
