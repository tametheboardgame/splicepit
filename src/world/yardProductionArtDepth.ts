import { ENVIRONMENT_MATERIALS, drawPixelRect } from '../environment/environmentArtLanguage.js';
import { YARD_CORE_X, YARD_CORE_Y } from './yard.js';

const B = {
  cage: ENVIRONMENT_MATERIALS.cage.bright,
  machinery: ENVIRONMENT_MATERIALS.machinery.bright,
  steel: ENVIRONMENT_MATERIALS.steel.bright,
} as const;
const D = {
  cage: ENVIRONMENT_MATERIALS.cage.dark,
  machinery: ENVIRONMENT_MATERIALS.machinery.dark,
  steel: ENVIRONMENT_MATERIALS.steel.dark,
  residue: ENVIRONMENT_MATERIALS['biological-residue'].dark,
} as const;

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colour: string,
): void {
  drawPixelRect(ctx, x, y, width, height, colour);
}

function ifBehind(playerFeetY: number, sortY: number, draw: () => void): void {
  if (sortY > playerFeetY) draw();
}

export function drawYardBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Front containment rail. It occludes the player only while their feet are behind it.
  ifBehind(playerFeetY, y + 185, () => {
    rect(ctx, x + 510, y + 178, 184, 7, B.cage.shadow);
    rect(ctx, x + 516, y + 178, 172, 3, B.cage.highlight);
  });

  // Sample-tank lower clamp and service meter face.
  ifBehind(playerFeetY, y + 414, () => {
    rect(ctx, x + 74, y + 406, 88, 6, B.machinery.shadow);
    rect(ctx, x + 84, y + 406, 68, 2, B.steel.highlight);
    rect(ctx, x + 169, y + 356, 30, 14, B.machinery.shadow);
  });

  // Small animal-cage front edge.
  ifBehind(playerFeetY, y + 461, () => {
    rect(ctx, x + 242, y + 454, 98, 7, B.cage.shadow);
    rect(ctx, x + 250, y + 454, 82, 3, B.cage.highlight);
  });

  ctx.restore();
}

export function drawYardDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ifBehind(playerFeetY, y + 185, () => {
    rect(ctx, x + 510, y + 178, 184, 8, D.cage.shadow);
    rect(ctx, x + 542, y + 174, 38, 7, D.residue.base);
    rect(ctx, x + 608, y + 176, 58, 8, D.residue.shadow);
  });

  ifBehind(playerFeetY, y + 414, () => {
    rect(ctx, x + 82, y + 406, 72, 8, D.steel.shadow);
    rect(ctx, x + 98, y + 402, 42, 10, D.residue.base);
    rect(ctx, x + 169, y + 356, 30, 16, D.machinery.shadow);
  });

  ifBehind(playerFeetY, y + 461, () => {
    rect(ctx, x + 242, y + 453, 98, 9, D.cage.shadow);
    rect(ctx, x + 266, y + 447, 52, 9, '#492c30');
  });

  ctx.restore();
}
