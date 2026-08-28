import {
  drawRouteBrightProductionArt as drawLegacyBright,
  drawRouteDarkProductionArt as drawLegacyDark,
  drawRouteBrightProductionArtForeground as drawLegacyBrightForeground,
  drawRouteDarkProductionArtForeground as drawLegacyDarkForeground,
} from './routeProductionArtLegacy.js';
import {
  drawPassCRouteBase,
  drawPassCRouteForeground,
} from './graphicsTighteningPassCEnvironment.js';

export * from './routeProductionArtLegacy.js';

export function drawRouteBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyBright(ctx, now);
  drawPassCRouteBase(ctx, now, 0);
}

export function drawRouteDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyDark(ctx, now);
  drawPassCRouteBase(ctx, now, 1);
}

export function drawRouteBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyBrightForeground(ctx, playerFeetY);
  drawPassCRouteForeground(ctx, playerFeetY, 0);
}

export function drawRouteDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyDarkForeground(ctx, playerFeetY);
  drawPassCRouteForeground(ctx, playerFeetY, 1);
}
