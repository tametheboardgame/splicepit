import {
  drawPassDLocalPitBright,
  drawPassDLocalPitBrightForeground,
  drawPassDLocalPitDark,
  drawPassDLocalPitDarkForeground,
} from './localPitProductionArtPassD.js';

export { LOCAL_PIT_PRODUCTION_ART_CONTRACT } from './localPitProductionArtPassD.js';

export function drawLocalPitBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDLocalPitBright(ctx, now);
}

export function drawLocalPitDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDLocalPitDark(ctx, now);
}

export function drawLocalPitBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawPassDLocalPitBrightForeground(ctx, playerFeetY);
}

export function drawLocalPitDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  _now: number,
): void {
  drawPassDLocalPitDarkForeground(ctx, playerFeetY);
}
