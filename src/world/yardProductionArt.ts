import {
  drawPassDYardBright,
  drawPassDYardDark,
  YARD_PRODUCTION_ART_CONTRACT,
} from './yardProductionArtPassD.js';

export { YARD_PRODUCTION_ART_CONTRACT } from './yardProductionArtPassD.js';

export function drawYardBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDYardBright(ctx, now);
}

export function drawYardDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDYardDark(ctx, now);
}

void YARD_PRODUCTION_ART_CONTRACT;
