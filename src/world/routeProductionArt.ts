import {
  drawPassDRouteBright,
  drawPassDRouteBrightForeground,
  drawPassDRouteDark,
  drawPassDRouteDarkForeground,
} from './routeProductionArtPassD.js';

export { ROUTE_PRODUCTION_ART_CONTRACT } from './routeProductionArtPassD.js';

export function drawRouteBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDRouteBright(ctx, now);
}

export function drawRouteDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDRouteDark(ctx, now);
}

export function drawRouteBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawPassDRouteBrightForeground(ctx, playerFeetY);
}

export function drawRouteDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawPassDRouteDarkForeground(ctx, playerFeetY);
}
