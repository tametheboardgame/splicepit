import {
  drawLocalPitBrightProductionArt as drawLegacyBright,
  drawLocalPitDarkProductionArt as drawLegacyDark,
  drawLocalPitBrightProductionArtForeground as drawLegacyBrightForeground,
  drawLocalPitDarkProductionArtForeground as drawLegacyDarkForeground,
} from './localPitProductionArtLegacy.js';
import {
  drawPassCLocalPitBase,
  drawPassCLocalPitForeground,
} from './graphicsTighteningPassCEnvironment.js';

export * from './localPitProductionArtLegacy.js';

export function drawLocalPitBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyBright(ctx, now);
  drawPassCLocalPitBase(ctx, now, 0);
}

export function drawLocalPitDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyDark(ctx, now);
  drawPassCLocalPitBase(ctx, now, 1);
}

export function drawLocalPitBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyBrightForeground(ctx, playerFeetY);
  drawPassCLocalPitForeground(ctx, playerFeetY, 0);
}

export function drawLocalPitDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  now: number,
): void {
  drawLegacyDarkForeground(ctx, playerFeetY, now);
  drawPassCLocalPitForeground(ctx, playerFeetY, 1);
}
