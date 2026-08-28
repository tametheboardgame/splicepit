import {
  ENVIRONMENT_MATERIALS,
  drawEnvironmentContactShadow,
  drawPixelRect,
} from '../environment/environmentArtLanguage.js';
import { YARD_CORE_X, YARD_CORE_Y } from './yard.js';

export const YARD_PRODUCTION_ART_CONTRACT = {
  locationId: 'yard',
  geometryId: 'opening-world-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  brightDetailGroups: [
    'traffic-wear',
    'workshop-materials',
    'containment-hardware',
    'biotech-service',
    'drainage',
    'foliage-variation',
    'ambient-machinery',
  ] as const,
  darkStoryGroups: [
    'containment-failure',
    'biological-intrusion',
    'dead-vegetation',
    'runoff-and-staining',
    'damaged-equipment',
    'wrong-silhouettes',
  ] as const,
} as const;

const M = ENVIRONMENT_MATERIALS;
const B = {
  wood: M.wood.bright,
  brick: M.brick.bright,
  plaster: M.plaster.bright,
  steel: M.steel.bright,
  glass: M.glass.bright,
  dirt: M.dirt.bright,
  grass: M.grass.bright,
  cage: M.cage.bright,
  machinery: M.machinery.bright,
  residue: M['biological-residue'].bright,
} as const;
const D = {
  wood: M.wood.dark,
  plaster: M.plaster.dark,
  steel: M.steel.dark,
  glass: M.glass.dark,
  cage: M.cage.dark,
  machinery: M.machinery.dark,
  residue: M['biological-residue'].dark,
} as const;

const C = {
  cream: '#f2dfae',
  ink: '#26382f',
  warning: '#e2bd5d',
  warningDark: '#7a493b',
  copper: '#b56f48',
  cable: '#4a5149',
  leaf: '#6d9b54',
  leafLight: '#9fc665',
  flower: '#cc7f8a',
  darkWater: '#344c49',
  oldBlood: '#74333b',
  oldBloodDark: '#492c30',
  tissue: '#89505d',
  tissuePale: '#b2777d',
  deadLeaf: '#665d4c',
  fungus: '#73515f',
  fungusPale: '#9a7580',
  wrongShadow: 'rgba(31,19,26,0.48)',
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

function bootPrint(ctx: CanvasRenderingContext2D, x: number, y: number, flip = false): void {
  rect(ctx, x + (flip ? 5 : 0), y, 5, 8, B.dirt.shadow);
  rect(ctx, x + (flip ? 0 : 5), y + 9, 5, 7, B.dirt.shadow);
  rect(ctx, x + (flip ? 7 : -2), y + 2, 3, 4, B.dirt.base);
}

function drawTrafficWear(ctx: CanvasRenderingContext2D): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  ctx.save();
  ctx.globalAlpha = 0.45;
  for (const [px, py, width] of [
    [x + 356, y + 350, 52],
    [x + 424, y + 382, 68],
    [x + 500, y + 420, 58],
    [x + 574, y + 454, 48],
    [x + 650, y + 472, 44],
  ] as const) {
    rect(ctx, px, py, width, 4, B.dirt.shadow);
    rect(ctx, px + 10, py + 8, Math.max(12, width - 18), 3, B.dirt.highlight);
  }
  ctx.restore();

  for (const [px, py, flip] of [
    [x + 392, y + 366, false],
    [x + 430, y + 390, true],
    [x + 476, y + 416, false],
    [x + 524, y + 438, true],
    [x + 568, y + 460, false],
    [x + 626, y + 472, true],
  ] as const) bootPrint(ctx, px, py, flip);
}

function drawWorkshopBright(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  drawEnvironmentContactShadow(ctx, x + 224, y + 237, 178, 10);
  drawEnvironmentContactShadow(ctx, x + 410, y + 221, 66, 8);

  for (let sx = x + 72; sx <= x + 372; sx += 42) {
    rect(ctx, sx, y + 53, 3, 22, B.wood.shadow);
    rect(ctx, sx + 3, y + 55, 2, 18, B.wood.highlight);
  }
  rect(ctx, x + 64, y + 80, 324, 5, B.steel.shadow);
  rect(ctx, x + 70, y + 82, 312, 3, B.steel.highlight);
  for (let gx = x + 82; gx <= x + 366; gx += 38) rect(ctx, gx, y + 80, 4, 4, '#d2c38f');

  rect(ctx, x + 382, y + 83, 8, 82, B.machinery.shadow);
  rect(ctx, x + 385, y + 84, 4, 80, B.machinery.base);
  rect(ctx, x + 380, y + 158, 18, 7, B.machinery.shadow);
  rect(ctx, x + 390, y + 158, 6, 34, B.machinery.base);

  for (const [px, py] of [
    [x + 84, y + 176],
    [x + 166, y + 191],
    [x + 342, y + 174],
  ] as const) {
    rect(ctx, px, py, 42, 23, B.plaster.shadow);
    rect(ctx, px + 3, py + 3, 36, 17, B.brick.base);
    rect(ctx, px + 4, py + 9, 34, 2, B.brick.shadow);
    rect(ctx, px + 18, py + 3, 2, 7, B.brick.shadow);
    rect(ctx, px + 29, py + 11, 2, 8, B.brick.shadow);
    rect(ctx, px + 5, py + 4, 12, 3, B.brick.highlight);
  }

  for (const wx of [x + 94, x + 186]) {
    rect(ctx, wx - 4, y + 164, 70, 5, B.wood.shadow);
    rect(ctx, wx, y + 164, 62, 3, B.wood.highlight);
  }

  rect(ctx, x + 244, y + 102, 26, 14, B.steel.shadow);
  rect(ctx, x + 248, y + 105, 18, 8, B.machinery.base);
  rect(ctx, x + 254, y + 107, 6, 4, Math.floor(now / 420) % 2 === 0 ? C.warning : B.machinery.highlight);
  rect(ctx, x + 256, y + 116, 3, 42, C.cable);
  rect(ctx, x + 256, y + 155, 22, 3, C.cable);

  rect(ctx, x + 150, y + 108, 6, 24, C.copper);
  rect(ctx, x + 158, y + 108, 4, 31, B.steel.shadow);
  rect(ctx, x + 166, y + 108, 7, 20, B.machinery.base);
  rect(ctx, x + 232, y + 176, 34, 24, C.cream);
  rect(ctx, x + 235, y + 179, 28, 4, C.warningDark);
  rect(ctx, x + 238, y + 187, 22, 2, C.ink);
  rect(ctx, x + 238, y + 192, 15, 2, C.ink);
}

function drawContainmentBright(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  rect(ctx, x + 518, y + 82, 5, 92, B.cage.shadow);
  rect(ctx, x + 681, y + 82, 5, 92, B.cage.shadow);
  for (const [px, py] of [[x + 520, y + 84], [x + 650, y + 84]] as const) {
    for (let i = 0; i < 5; i += 1) rect(ctx, px + i * 9, py + i * 18, 4, 12, B.cage.highlight);
  }
  rect(ctx, x + 670, y + 116, 24, 16, B.machinery.shadow);
  rect(ctx, x + 674, y + 119, 16, 10, B.machinery.base);
  rect(ctx, x + 680, y + 121, 5, 5, Math.floor(now / 520) % 2 === 0 ? C.warning : '#8cb36d');

  rect(ctx, x + 530, y + 150, 52, 14, B.cage.shadow);
  rect(ctx, x + 534, y + 151, 44, 9, B.steel.base);
  rect(ctx, x + 538, y + 152, 36, 3, B.glass.highlight);
  rect(ctx, x + 514, y + 188, 30, 6, B.machinery.shadow);
  rect(ctx, x + 514, y + 194, 5, 30, B.machinery.base);
  rect(ctx, x + 519, y + 218, 34, 5, B.machinery.base);
  rect(ctx, x + 548, y + 210, 5, 13, B.machinery.shadow);

  rect(ctx, x + 642, y + 148, 39, 23, C.warning);
  rect(ctx, x + 646, y + 152, 31, 15, C.ink);
  rect(ctx, x + 649, y + 155, 25, 3, C.warning);
  rect(ctx, x + 655, y + 161, 13, 3, C.warning);

  rect(ctx, x + 68, y + 326, 8, 82, B.machinery.shadow);
  rect(ctx, x + 160, y + 326, 8, 82, B.machinery.shadow);
  for (const bandY of [y + 334, y + 388]) {
    rect(ctx, x + 74, bandY, 88, 5, B.machinery.base);
    rect(ctx, x + 82, bandY + 1, 72, 2, B.machinery.highlight);
  }
  rect(ctx, x + 169, y + 340, 30, 28, B.machinery.shadow);
  rect(ctx, x + 173, y + 344, 22, 20, B.machinery.base);
  rect(ctx, x + 178, y + 349, 12, 4, B.glass.highlight);
  rect(ctx, x + 181, y + 356, 6, 5, Math.floor(now / 360) % 2 === 0 ? C.warning : '#7cad6b');
}

function drawBiotechServiceBright(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  rect(ctx, x + 564, y + 386, 74, 22, B.steel.shadow);
  rect(ctx, x + 568, y + 390, 66, 14, '#697267');
  for (let gx = x + 573; gx < x + 632; gx += 9) rect(ctx, gx, y + 391, 3, 12, '#3f4d47');
  rect(ctx, x + 568, y + 389, 66, 2, B.steel.highlight);

  drawEnvironmentContactShadow(ctx, x + 663, y + 286, 48, 8);
  rect(ctx, x + 624, y + 260, 84, 24, B.machinery.shadow);
  rect(ctx, x + 630, y + 254, 72, 28, B.machinery.base);
  rect(ctx, x + 640, y + 262, 20, 12, B.machinery.highlight);
  rect(ctx, x + 670, y + 258, 20, 18, B.steel.base);
  rect(ctx, x + 677, y + 262, 6, 10, Math.floor(now / 300) % 3 === 0 ? C.warning : B.machinery.shadow);
  rect(ctx, x + 698, y + 264, 18, 5, C.copper);
  rect(ctx, x + 711, y + 267, 5, 42, C.copper);
  rect(ctx, x + 711, y + 304, 36, 5, C.copper);
  rect(ctx, x + 742, y + 304, 5, 28, C.copper);

  for (const [px, fill] of [[x + 618, '#7993a0'], [x + 642, '#97735c']] as const) {
    rect(ctx, px, y + 292, 17, 35, B.steel.shadow);
    rect(ctx, px + 3, y + 288, 11, 38, fill);
    rect(ctx, px + 5, y + 284, 7, 7, B.steel.highlight);
  }

  ctx.save();
  ctx.strokeStyle = '#3f6761';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 688, y + 326, 20, 0, Math.PI * 2);
  ctx.arc(x + 688, y + 326, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  rect(ctx, x + 704, y + 335, 31, 4, B.machinery.shadow);

  for (const [px, py, colour] of [
    [x + 36, y + 276, B.wood.base],
    [x + 14, y + 294, B.cage.base],
    [x + 332, y + 254, B.machinery.base],
  ] as const) {
    rect(ctx, px, py, 28, 24, B.wood.shadow);
    rect(ctx, px + 3, py + 3, 22, 18, colour);
    rect(ctx, px + 4, py + 7, 20, 3, B.wood.highlight);
  }
}

function drawFoliageBright(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  for (const [px, py] of [
    [x + 18, y + 456], [x + 185, y + 492], [x + 350, y + 510],
    [x + 815, y + 454], [x + 916, y + 260], [x + 744, y + 108], [x + 468, y + 40],
  ] as const) {
    rect(ctx, px, py + 8, 3, 12, C.leaf);
    rect(ctx, px + 5, py + 3, 3, 17, C.leaf);
    rect(ctx, px + 10, py + 9, 3, 11, C.leaf);
    rect(ctx, px + 3, py + 13, 9, 3, C.leafLight);
  }
  for (const [px, py] of [[x + 208, y + 486], [x + 824, y + 448], [x + 758, y + 114]] as const) {
    rect(ctx, px, py + 5, 2, 9, C.leaf);
    rect(ctx, px - 3, py, 6, 6, Math.floor(now / 800) % 2 === 0 ? C.flower : '#c19875');
    rect(ctx, px + 2, py + 2, 5, 5, '#e0be68');
  }
}

function drawAmbientBright(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  const phase = Math.floor(now / 220) % 4;
  rect(ctx, x + 348, y + 90, 30, 30, B.machinery.shadow);
  rect(ctx, x + 352, y + 94, 22, 22, B.machinery.base);
  rect(ctx, x + 361, y + 97, 4, 16, B.machinery.highlight);
  rect(ctx, x + 355, y + 103, 16, 4, B.machinery.highlight);
  rect(ctx, x + 359 + (phase % 2) * 3, y + 101, 7, 7, '#526a64');
  rect(ctx, x + 398, y + 94, 18, 10, B.machinery.shadow);
  rect(ctx, x + 402, y + 88, 10, 12, phase === 0 ? C.warning : '#b3894c');
  const drip = Math.floor(now / 120) % 5;
  rect(ctx, x + 739, y + 329 + drip * 5, 3, 4, '#8fc9bf');
}

export function drawYardBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawTrafficWear(ctx);
  drawWorkshopBright(ctx, now);
  drawContainmentBright(ctx, now);
  drawBiotechServiceBright(ctx, now);
  drawFoliageBright(ctx, now);
  drawAmbientBright(ctx, now);
  ctx.restore();
}

function drawWrongSilhouettes(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  const twitch = Math.floor(now / 170) % 2 ? 4 : 0;
  ctx.save();
  ctx.fillStyle = C.wrongShadow;
  ctx.beginPath();
  ctx.ellipse(x + 284 + twitch, y + 246, 114, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 664 - twitch, y + 198, 96, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  rect(ctx, x + 122 + twitch, y + 18, 8, 53, '#332832');
  rect(ctx, x + 128 + twitch, y + 6, 5, 68, '#332832');
  rect(ctx, x + 574 - twitch, y + 40, 6, 48, '#2f2830');
  rect(ctx, x + 584 - twitch, y + 28, 4, 61, '#2f2830');
}

function drawWorkshopDark(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  rect(ctx, x + 76, y + 96, 306, 32, D.plaster.base);
  rect(ctx, x + 76, y + 174, 306, 48, D.plaster.shadow);
  for (const [px, width] of [[x + 82, 48], [x + 162, 66], [x + 288, 72]] as const) {
    rect(ctx, px, y + 182, width, 5, '#4f4540');
    rect(ctx, px + 8, y + 187, Math.max(10, width - 18), 8, '#625148');
  }
  rect(ctx, x + 58, y + 52, 342, 14, D.wood.base);
  rect(ctx, x + 74, y + 42, 310, 10, D.wood.shadow);
  rect(ctx, x + 88, y + 48, 74, 5, C.oldBloodDark);
  rect(ctx, x + 306, y + 56, 62, 4, C.oldBloodDark);

  for (const wx of [x + 94, x + 186]) {
    rect(ctx, wx + 8, y + 126, 46, 30, '#283535');
    rect(ctx, wx + 14, y + 132, 8, 19, '#5e4b54');
    rect(ctx, wx + 34, y + 129, 12, 4, '#76636a');
    rect(ctx, wx + 39, y + 133, 4, 17, '#59404a');
  }
  for (const [px, py] of [[x + 154, y + 112], [x + 252, y + 166], [x + 344, y + 134]] as const) {
    rect(ctx, px, py, 4, 21, '#514640');
    rect(ctx, px + 4, py + 15, 13, 4, '#514640');
    rect(ctx, px + 13, py + 18, 3, 13, '#514640');
  }
  rect(ctx, x + 382, y + 84, 8, 78, D.steel.shadow);
  rect(ctx, x + 388, y + 154, 13, 38, D.machinery.shadow);
  rect(ctx, x + 396, y + 186, 29, 5, C.oldBloodDark);
  const blink = Math.floor(now / 270) % 5 === 0;
  rect(ctx, x + 244, y + 102, 26, 14, D.machinery.shadow);
  rect(ctx, x + 250, y + 106, 14, 6, blink ? '#a84d47' : '#4b3033');
}

function drawContainmentDark(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  for (const px of [x + 510, x + 554, x + 598, x + 642, x + 686]) {
    rect(ctx, px, y + 70, 7, 112, D.cage.shadow);
    if (px !== x + 598) rect(ctx, px + 2, y + 80, 3, 82, D.cage.highlight);
  }
  rect(ctx, x + 510, y + 72, 184, 6, D.cage.base);
  rect(ctx, x + 510, y + 178, 184, 7, D.cage.shadow);
  rect(ctx, x + 664, y + 116, 22, 12, '#392f31');
  rect(ctx, x + 676, y + 128, 7, 27, D.cage.accent ?? C.oldBlood);

  for (const [px, py, width] of [
    [x + 524, y + 174, 34], [x + 566, y + 181, 46], [x + 620, y + 172, 58],
  ] as const) {
    rect(ctx, px, py, width, 7, D.residue.shadow);
    rect(ctx, px + 7, py - 5, Math.max(8, width - 18), 7, D.residue.base);
  }
  for (const [px, py] of [[x + 548, y + 166], [x + 610, y + 168], [x + 654, y + 160]] as const) {
    rect(ctx, px, py, 6, 13, C.tissue);
    rect(ctx, px + 4, py - 5, 8, 9, C.tissuePale);
  }

  rect(ctx, x + 82, y + 312, 72, 102, D.glass.base);
  rect(ctx, x + 88, y + 352, 60, 56, '#465847');
  rect(ctx, x + 104, y + 352, 30, 24, '#774653');
  rect(ctx, x + 98, y + 374, 42, 8, D.residue.base);
  rect(ctx, x + 116, y + 334, 8, 52, C.tissue);
  rect(ctx, x + 124, y + 342, 16, 6, C.tissuePale);
  for (const [px, py] of [[x + 86, y + 328], [x + 146, y + 352], [x + 108, y + 402]] as const) {
    rect(ctx, px, py, 11, 3, D.glass.highlight);
    rect(ctx, px + 7, py + 2, 3, 12, D.glass.shadow);
  }

  rect(ctx, x + 242, y + 396, 98, 65, '#4c4f42');
  rect(ctx, x + 250, y + 404, 82, 49, '#5b5748');
  rect(ctx, x + 266, y + 438, 52, 7, C.oldBloodDark);
  rect(ctx, x + 280, y + 422, 29, 12, '#b4a58a');
  rect(ctx, x + 298, y + 417, 12, 8, C.tissuePale);
  const pulse = Math.floor(now / 340) % 2 === 0;
  rect(ctx, x + 173, y + 344, 22, 20, D.machinery.shadow);
  rect(ctx, x + 179, y + 350, 10, 5, pulse ? '#9a4247' : '#522e34');
}

function drawRunoffDark(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  const shift = Math.floor(now / 430) % 2 ? 5 : 0;
  rect(ctx, x + 564, y + 386, 74, 22, D.steel.shadow);
  rect(ctx, x + 569, y + 391, 64, 12, '#342f30');
  for (let gx = x + 574; gx < x + 631; gx += 9) rect(ctx, gx, y + 392, 3, 10, '#1f2927');
  rect(ctx, x + 632, y + 396, 12, 7, C.oldBlood);
  rect(ctx, x + 641, y + 401, 28, 6, C.oldBloodDark);
  rect(ctx, x + 664, y + 406, 42, 5, '#533638');
  rect(ctx, x + 700, y + 408, 54, 4, D.residue.shadow);

  rect(ctx, x + 732, y + 300, 156, 22, C.darkWater);
  rect(ctx, x + 716, y + 320, 188, 18, '#3b514d');
  for (const [px, py, width] of [
    [x + 752 + shift, y + 330, 46],
    [x + 820 - shift, y + 356, 58],
    [x + 772 + shift, y + 390, 72],
  ] as const) {
    rect(ctx, px, py, width, 5, D.residue.base);
    rect(ctx, px + 9, py + 4, Math.max(8, width - 24), 3, C.oldBloodDark);
  }
  for (const [px, py] of [[x + 804, y + 342], [x + 862, y + 382]] as const) {
    rect(ctx, px, py, 17, 7, '#b5aa8e');
    rect(ctx, px + 6, py - 5, 7, 7, '#b5aa8e');
  }
}

function drawDeadVegetation(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  const sway = Math.floor(now / 500) % 2;
  for (const [px, py] of [
    [x + 20, y + 456], [x + 188, y + 492], [x + 350, y + 510],
    [x + 816, y + 454], [x + 910, y + 258], [x + 748, y + 108],
  ] as const) {
    rect(ctx, px + sway, py + 6, 3, 15, C.deadLeaf);
    rect(ctx, px + 5 - sway, py + 2, 3, 19, '#4f4d42');
    rect(ctx, px + 9, py + 11, 7, 4, '#70624d');
    rect(ctx, px - 2, py + 17, 15, 3, '#3f433a');
  }
  for (const [px, py] of [[x + 202, y + 486], [x + 826, y + 446], [x + 752, y + 118]] as const) {
    rect(ctx, px, py + 5, 3, 10, '#4d463f');
    rect(ctx, px - 4, py, 10, 7, C.fungus);
    rect(ctx, px - 1, py + 1, 4, 3, C.fungusPale);
  }
}

function drawDamagedEquipment(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  const spark = Math.floor(now / 130) % 7 === 0;
  rect(ctx, x + 630, y + 254, 72, 28, D.machinery.base);
  rect(ctx, x + 642, y + 260, 18, 14, '#2d3735');
  rect(ctx, x + 670, y + 258, 20, 18, D.steel.shadow);
  rect(ctx, x + 696, y + 263, 22, 5, '#7b443a');
  rect(ctx, x + 711, y + 268, 5, 36, '#604139');
  rect(ctx, x + 708, y + 300, 18, 5, '#604139');
  if (spark) {
    rect(ctx, x + 720, y + 298, 5, 5, '#e3b65b');
    rect(ctx, x + 726, y + 292, 3, 7, '#f0d582');
  }
  ctx.save();
  ctx.strokeStyle = '#342f31';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 686, y + 326, 20, 0.3, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
  rect(ctx, x + 620, y + 290, 17, 36, D.steel.shadow);
  rect(ctx, x + 623, y + 297, 11, 27, '#6d4942');
  rect(ctx, x + 621, y + 316, 14, 6, C.oldBloodDark);
}

export function drawYardDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawWrongSilhouettes(ctx, now);
  drawWorkshopDark(ctx, now);
  drawContainmentDark(ctx, now);
  drawRunoffDark(ctx, now);
  drawDeadVegetation(ctx, now);
  drawDamagedEquipment(ctx, now);
  ctx.restore();
}
