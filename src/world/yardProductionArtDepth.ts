import {
  drawPassDYardBrightForeground,
  drawPassDYardDarkForeground,
} from './yardProductionArtPassD.js';

export function drawYardBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawPassDYardBrightForeground(ctx, playerFeetY);
}

export function drawYardDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawPassDYardDarkForeground(ctx, playerFeetY);
}
