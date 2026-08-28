import type { MasterLabState } from './masterLab.js';
import {
  drawMasterLabBrightProductionArt as drawLegacyBright,
  drawMasterLabDarkProductionArt as drawLegacyDark,
  drawMasterLabBrightProductionArtForeground as drawLegacyBrightForeground,
  drawMasterLabDarkProductionArtForeground as drawLegacyDarkForeground,
} from './masterLabProductionArtLegacy.js';
import {
  drawPassCMasterLabBase,
  drawPassCMasterLabForeground,
} from './graphicsTighteningPassCEnvironment.js';

export * from './masterLabProductionArtLegacy.js';

export function drawMasterLabBrightProductionArt(
  ctx: CanvasRenderingContext2D,
  now: number,
  storyState: MasterLabState = 'pre-disaster',
): void {
  drawLegacyBright(ctx, now, storyState);
  drawPassCMasterLabBase(ctx, now, 0);
}

export function drawMasterLabDarkProductionArt(
  ctx: CanvasRenderingContext2D,
  now: number,
  storyState: MasterLabState = 'pre-disaster',
): void {
  drawLegacyDark(ctx, now, storyState);
  drawPassCMasterLabBase(ctx, now, 1);
}

export function drawMasterLabBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  drawLegacyBrightForeground(ctx, playerFeetY);
  drawPassCMasterLabForeground(ctx, playerFeetY, 0);
}

export function drawMasterLabDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  now: number,
): void {
  drawLegacyDarkForeground(ctx, playerFeetY, now);
  drawPassCMasterLabForeground(ctx, playerFeetY, 1);
}
