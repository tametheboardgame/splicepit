export interface DarkLayerFlickerOverlayOptions {
  readonly amount: number;
  readonly elapsedMs: number;
  readonly width?: number;
  readonly height?: number;
  readonly seed?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function hash(seed: number): number {
  let value = seed | 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
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

export function drawDarkLayerFlickerOverlay(
  ctx: CanvasRenderingContext2D,
  options: DarkLayerFlickerOverlayOptions,
): void {
  const amount = clamp01(options.amount);
  if (amount <= 0) return;

  const width = options.width ?? 1280;
  const height = options.height ?? 720;
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
