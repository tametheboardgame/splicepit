import {
  drawYardBrightProductionArtForeground as drawLegacyBrightForeground,
  drawYardDarkProductionArtForeground as drawLegacyDarkForeground,
} from './yardProductionArtDepthLegacy.js';
import { drawPassCYardForeground } from './graphicsTighteningPassCEnvironment.js';

export * from './yardProductionArtDepthLegacy.js';

export function drawYardBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyBrightForeground(ctx, playerFeetY);
  drawPassCYardForeground(ctx, playerFeetY, 0);
}

export function drawYardDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyDarkForeground(ctx, playerFeetY);
  drawPassCYardForeground(ctx, playerFeetY, 1);
}
