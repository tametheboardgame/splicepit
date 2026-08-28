import {
  drawYardBrightProductionArt as drawLegacyBright,
  drawYardDarkProductionArt as drawLegacyDark,
} from './yardProductionArtLegacy.js';
import {
  drawPassCYardBase,
} from './graphicsTighteningPassCEnvironment.js';

export * from './yardProductionArtLegacy.js';

export function drawYardBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyBright(ctx, now);
  drawPassCYardBase(ctx, now, 0);
}

export function drawYardDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawLegacyDark(ctx, now);
  drawPassCYardBase(ctx, now, 1);
}
