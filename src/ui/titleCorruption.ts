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
  const envelope = Math.sin(Math.PI * phase);
  return clamp01(envelope * strength);
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

function polygon(ctx: CanvasRenderingContext2D, points: readonly [number, number][], colour: string): void {
  ctx.fillStyle = colour;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
}

function drawBrightBackdrop(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  rect(ctx, 0, 0, TITLE_VIEW_WIDTH, 190, '#a9dfd0');
  rect(ctx, 0, 190, TITLE_VIEW_WIDTH, 130, '#8cc8a7');
  rect(ctx, 0, 320, TITLE_VIEW_WIDTH, 400, '#6fa36e');

  polygon(ctx, [[0, 285], [170, 160], [330, 285]], '#77b38b');
  polygon(ctx, [[185, 295], [410, 125], [620, 295]], '#6fa77f');
  polygon(ctx, [[505, 300], [790, 145], [1040, 300]], '#74ac83');
  polygon(ctx, [[890, 300], [1130, 165], [1280, 280], [1280, 320]], '#679b75');

  const cloudShift = Math.floor((elapsedMs / 70) % 64);
  rect(ctx, 115 - cloudShift, 88, 92, 18, '#e7f4d7');
  rect(ctx, 145 - cloudShift, 72, 56, 18, '#e7f4d7');
  rect(ctx, 915 + cloudShift / 2, 106, 110, 18, '#e7f4d7');
  rect(ctx, 950 + cloudShift / 2, 90, 48, 18, '#e7f4d7');

  rect(ctx, 0, 520, 1280, 200, '#5b895e');
  for (let x = 0; x < 1280; x += 42) {
    const y = 560 + ((x / 42) % 3) * 16;
    rect(ctx, x, y, 20, 6, '#7dad70');
    rect(ctx, x + 11, y + 6, 7, 10, '#496448');
  }

  rect(ctx, 92, 420, 250, 116, '#d9c27e');
  rect(ctx, 112, 392, 210, 36, '#b96b48');
  polygon(ctx, [[90, 396], [217, 320], [344, 396]], '#8d5543');
  rect(ctx, 142, 454, 54, 82, '#775143');
  rect(ctx, 242, 444, 54, 42, '#8fc0aa');
  rect(ctx, 251, 453, 36, 24, '#c8ead6');

  rect(ctx, 970, 406, 205, 128, '#c7d49a');
  polygon(ctx, [[948, 406], [1072, 332], [1192, 406]], '#668465');
  for (let x = 992; x <= 1136; x += 48) {
    rect(ctx, x, 438, 28, 52, '#9fd4c1');
    rect(ctx, x + 5, 443, 18, 42, '#d8f0df');
  }

  rect(ctx, 365, 535, 555, 22, '#caa56a');
  rect(ctx, 405, 557, 475, 12, '#9a754f');
  for (let x = 410; x < 880; x += 72) rect(ctx, x, 569, 12, 48, '#6d573f');

  for (let x = 0; x < 1280; x += 128) {
    const trunkX = 30 + x;
    rect(ctx, trunkX, 470, 20, 90, '#6f5140');
    rect(ctx, trunkX - 34, 432, 88, 52, '#496448');
    rect(ctx, trunkX - 18, 410, 54, 44, '#5d8057');
  }

  rect(ctx, 0, 656, 1280, 64, '#365644');
  for (let x = 0; x < 1280; x += 76) {
    rect(ctx, x + 12, 667, 40, 10, '#d96b3b');
    rect(ctx, x + 20, 677, 24, 26, '#f2dfae');
    rect(ctx, x + 26, 682, 12, 16, '#8cc8a7');
  }
}

function drawBrightLogo(ctx: CanvasRenderingContext2D, reveal: number): void {
  const eased = smoothstep(reveal);
  const scale = 0.82 + eased * 0.18;
  const y = 270 - (1 - eased) * 36;

  ctx.save();
  ctx.translate(640, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = eased;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '900 132px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#26382f';
  ctx.strokeText('SplicePit', 0, 0);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#d96b3b';
  ctx.strokeText('SplicePit', 0, -2);
  ctx.fillStyle = '#f4dfa0';
  ctx.fillText('SplicePit', 0, -5);

  ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#26382f';
  ctx.fillText('GENETIC EXCELLENCE · ETHICS OPTIONAL', 0, 86);

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#496448';
  ctx.beginPath();
  ctx.moveTo(-310, 72);
  ctx.bezierCurveTo(-260, 34, -220, 110, -170, 72);
  ctx.bezierCurveTo(-120, 34, -80, 110, -30, 72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, 72);
  ctx.bezierCurveTo(80, 34, 120, 110, 170, 72);
  ctx.bezierCurveTo(220, 34, 260, 110, 310, 72);
  ctx.stroke();
  ctx.restore();
}

function drawDarkTitle(ctx: CanvasRenderingContext2D, amount: number, elapsedMs: number): void {
  const jitter = Math.round((hash(Math.floor(elapsedMs / 18) + 31) - 0.5) * 14 * amount);
  ctx.save();
  ctx.globalAlpha = clamp01(amount * 1.18);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 132px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.lineJoin = 'miter';
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#090d0b';
  ctx.strokeText('SPLICEPIT', 640 + jitter, 264 - jitter / 2);
  ctx.fillStyle = '#d9d2b7';
  ctx.fillText('SPLICEPIT', 640 + jitter, 258 - jitter / 2);
  ctx.globalAlpha = amount * 0.72;
  ctx.fillStyle = '#b8333f';
  ctx.fillText('SPLICEPIT', 647 - jitter, 258 + jitter / 2);
  ctx.globalAlpha = amount;
  ctx.font = '900 18px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#d76b58';
  ctx.fillText('BREED · BREAK · REPEAT', 640, 352);
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
  ctx.globalAlpha = amount * 0.78;
  rect(ctx, 0, 0, width, height, '#101612');

  for (let i = 0; i < 12; i += 1) {
    const h = 3 + Math.floor(hash(seed + frame * 17 + i * 73) * 18);
    const y = Math.floor(hash(seed + frame * 31 + i * 97) * height);
    const x = Math.floor((hash(seed + frame * 43 + i * 131) - 0.5) * 120 * amount);
    ctx.globalAlpha = amount * (0.22 + hash(seed + i * 211) * 0.48);
    rect(ctx, x, y, width, h, i % 3 === 0 ? '#b8333f' : '#090d0b');
  }

  ctx.globalAlpha = amount * 0.52;
  ctx.strokeStyle = '#c84e52';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i += 1) {
    const baseX = hash(seed + i * 313) * width;
    const baseY = hash(seed + i * 397) * height;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.bezierCurveTo(
      baseX + 40 - hash(frame + i * 19) * 90,
      baseY + 40,
      baseX + 90,
      baseY - 60 + hash(frame + i * 23) * 120,
      baseX + 150,
      baseY + 25,
    );
    ctx.stroke();
  }

  ctx.globalAlpha = amount * 0.55;
  for (let y = 0; y < height; y += 8) rect(ctx, 0, y, width, 1, '#050806');
  ctx.restore();
}

export function drawTitleScreen(ctx: CanvasRenderingContext2D, elapsedMs: number): TitleVisualState {
  const state = titleVisualState(elapsedMs);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawBrightBackdrop(ctx, elapsedMs);
  drawBrightLogo(ctx, state.reveal);

  if (state.corruption > 0) {
    drawCorruptionOverlay(ctx, { amount: state.corruption, elapsedMs });
    drawDarkTitle(ctx, state.corruption, elapsedMs);
  }

  if (state.readyToAdvance) {
    ctx.save();
    ctx.globalAlpha = state.promptAlpha;
    ctx.fillStyle = '#fff5cf';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillText('ENTER / SPACE / CLICK', 640, 616);
    ctx.restore();
  }

  return state;
}
