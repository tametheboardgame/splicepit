import {
  ENVIRONMENT_MATERIALS,
  drawEnvironmentContactShadow,
  drawPixelRect,
} from '../environment/environmentArtLanguage.js';
import type { MasterLabState } from './masterLab.js';

export const MASTER_LAB_PRODUCTION_ART_CONTRACT = {
  locationId: 'master-lab',
  geometryId: 'master-lab-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  brightDetailGroups: [
    'splice-machinery',
    'specimen-storage',
    'tools-notes-consumables',
    'tubing-cabling-power',
    'drains-and-containment',
    'obsessive-workplace-clutter',
    'lighting-and-shadow-depth',
    'routine-biotech-humour',
  ] as const,
  darkStoryGroups: [
    'failed-specimens',
    'containment-horror',
    'blood-tissue-and-leakage',
    'damaged-equipment',
    'corrupted-work-surfaces',
    'hidden-silhouettes',
  ] as const,
} as const;

const M = ENVIRONMENT_MATERIALS;
const B = {
  wood: M.wood.bright,
  plaster: M.plaster.bright,
  steel: M.steel.bright,
  glass: M.glass.bright,
  cage: M.cage.bright,
  machinery: M.machinery.bright,
  residue: M['biological-residue'].bright,
  cable: M.steel.bright,
} as const;
const D = {
  wood: M.wood.dark,
  plaster: M.plaster.dark,
  steel: M.steel.dark,
  glass: M.glass.dark,
  cage: M.cage.dark,
  machinery: M.machinery.dark,
  residue: M['biological-residue'].dark,
  cable: M.steel.dark,
} as const;

const C = {
  cream: '#f2dfae',
  ink: '#26382f',
  paper: '#e9d9aa',
  paperShade: '#c6b47d',
  warning: '#e1bd5b',
  warningDark: '#805047',
  copper: '#b86d47',
  cable: '#46524c',
  cableLight: '#6b766a',
  reagentBlue: '#7299a5',
  reagentPink: '#c77b85',
  reagentGreen: '#91c673',
  reagentPurple: '#795b7e',
  lampGlow: 'rgba(240,220,153,0.10)',
  darkShadow: 'rgba(28,22,29,0.48)',
  oldBlood: '#72323a',
  freshBlood: '#9a4046',
  tissue: '#83505b',
  tissuePale: '#ad7580',
  blackTissue: '#392f34',
  badFluid: '#43554b',
  bone: '#c9ba94',
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

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colour: string,
  width = 3,
): void {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(Math.round(x1), Math.round(y1));
  ctx.lineTo(Math.round(x2), Math.round(y2));
  ctx.stroke();
  ctx.restore();
}

function drawDrain(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, dark = false): void {
  const steel = dark ? D.steel : B.steel;
  rect(ctx, x, y, width, 16, steel.shadow);
  rect(ctx, x + 3, y + 3, width - 6, 10, dark ? '#252d2e' : '#59665f');
  for (let gx = x + 7; gx < x + width - 5; gx += 12) rect(ctx, gx, y + 4, 4, 8, steel.highlight);
}

function drawGauge(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, dark = false): void {
  const steel = dark ? D.steel : B.steel;
  rect(ctx, x, y, 28, 28, steel.shadow);
  rect(ctx, x + 4, y + 4, 20, 20, dark ? '#343a39' : C.cream);
  rect(ctx, x + 13, y + 8, 2, 9, dark ? C.oldBlood : C.ink);
  const needleX = value % 2 === 0 ? x + 19 : x + 9;
  line(ctx, x + 14, y + 16, needleX, y + 11, dark ? '#a74b49' : C.warningDark, 2);
}

function drawWallServicesBright(ctx: CanvasRenderingContext2D, now: number): void {
  for (const x of [132, 354, 620, 1248, 1516, 1770]) {
    rect(ctx, x, 183, 10, 84, B.steel.shadow);
    rect(ctx, x + 3, 184, 4, 80, B.steel.highlight);
    rect(ctx, x - 7, 198, 24, 11, B.machinery.shadow);
    rect(ctx, x - 3, 201, 16, 5, Math.floor(now / 460 + x) % 3 === 0 ? C.warning : B.machinery.highlight);
  }

  line(ctx, 150, 282, 610, 282, C.cable, 5);
  line(ctx, 610, 282, 610, 238, C.cable, 5);
  line(ctx, 1238, 282, 1790, 282, C.cable, 5);
  line(ctx, 1238, 282, 1238, 236, C.cable, 5);
  line(ctx, 1562, 282, 1562, 320, C.cableLight, 3);

  for (const x of [242, 462, 1368, 1642]) {
    rect(ctx, x, 274, 34, 18, B.machinery.shadow);
    rect(ctx, x + 5, 278, 24, 9, B.machinery.base);
  }

  for (const [x, y, bars] of [[238, 214, 3], [620, 214, 2], [1268, 214, 4], [1606, 214, 3]] as const) {
    rect(ctx, x, y, 76, 46, B.wood.shadow);
    rect(ctx, x + 4, y + 4, 68, 38, C.paper);
    rect(ctx, x + 10, y + 10, 48, 4, C.warningDark);
    for (let row = 0; row < bars; row += 1) rect(ctx, x + 10, y + 20 + row * 6, 42 - row * 5, 2, C.ink);
    rect(ctx, x + 61, y + 5, 5, 5, C.reagentPink);
  }
}

function drawFloorDetailBright(ctx: CanvasRenderingContext2D): void {
  drawDrain(ctx, 850, 812, 260);
  drawDrain(ctx, 1010, 1004, 180);
  drawDrain(ctx, 1226, 748, 94);

  for (const [x, y, width] of [
    [716, 792, 94], [1112, 784, 70], [1216, 792, 84], [720, 1000, 108], [1208, 1008, 128],
  ] as const) {
    ctx.save();
    ctx.globalAlpha = 0.34;
    rect(ctx, x, y, width, 4, B.steel.shadow);
    rect(ctx, x + 12, y + 7, Math.max(12, width - 28), 3, B.plaster.shadow);
    ctx.restore();
  }

  for (const [x, y] of [[736, 770], [1164, 810], [1310, 776], [846, 1018], [1284, 1030]] as const) {
    rect(ctx, x, y, 6, 10, '#9e8f68');
    rect(ctx, x + 7, y + 8, 7, 5, '#b2a276');
  }

  for (const [x, y] of [[796, 784], [1194, 810], [1340, 786]] as const) {
    rect(ctx, x, y, 22, 4, C.warning);
    rect(ctx, x + 4, y + 5, 18, 4, C.ink);
    rect(ctx, x + 8, y + 10, 14, 4, C.warning);
  }
}

function drawSpliceBayBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawEnvironmentContactShadow(ctx, 430, 650, 205, 14);

  rect(ctx, 248, 330, 18, 76, B.machinery.shadow);
  rect(ctx, 254, 334, 8, 68, B.machinery.highlight);
  line(ctx, 257, 334, 316, 294, C.copper, 5);
  line(ctx, 316, 294, 360, 294, C.copper, 5);
  rect(ctx, 350, 286, 34, 22, B.machinery.shadow);
  rect(ctx, 356, 291, 22, 12, B.machinery.base);
  rect(ctx, 363, 294, 8, 6, Math.floor(now / 240) % 4 === 0 ? C.warning : B.machinery.highlight);

  for (const x of [284, 332, 382, 430, 478, 526]) {
    rect(ctx, x, 388, 30, 14, B.steel.shadow);
    rect(ctx, x + 4, 392, 22, 7, B.steel.highlight);
    rect(ctx, x + 12, 375, 6, 13, C.copper);
  }

  rect(ctx, 292, 536, 210, 14, B.wood.shadow);
  rect(ctx, 302, 526, 190, 12, B.wood.base);
  for (const [x, colour] of [[316, C.reagentBlue], [344, C.reagentPink], [372, C.reagentGreen], [400, C.reagentPurple]] as const) {
    rect(ctx, x, 498, 18, 30, B.glass.shadow);
    rect(ctx, x + 3, 494, 12, 32, B.glass.base);
    rect(ctx, x + 5, 510, 8, 13, colour);
    rect(ctx, x + 7, 490, 4, 6, B.steel.highlight);
  }

  rect(ctx, 438, 482, 64, 44, B.steel.shadow);
  rect(ctx, 444, 488, 52, 32, '#d7d1a3');
  rect(ctx, 450, 494, 18, 4, C.warningDark);
  rect(ctx, 450, 503, 39, 2, C.ink);
  rect(ctx, 450, 509, 32, 2, C.ink);
  rect(ctx, 482, 493, 8, 8, C.reagentPink);

  for (const [x, y, turn] of [[250, 568, 0], [522, 548, 1], [566, 570, 0]] as const) {
    rect(ctx, x, y, 30, 8, B.steel.shadow);
    rect(ctx, x + 8, y - 12, 6, 16, B.steel.base);
    if (turn === 1) line(ctx, x + 14, y - 12, x + 28, y - 22, C.cable, 3);
    else line(ctx, x + 14, y - 12, x + 14, y - 30, C.cable, 3);
  }

  drawGauge(ctx, 572, 352, Math.floor(now / 520));
  line(ctx, 586, 380, 586, 410, C.copper, 4);
  line(ctx, 586, 410, 610, 410, C.copper, 4);
}

function drawDemonstrationBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawEnvironmentContactShadow(ctx, 986, 760, 192, 13);
  rect(ctx, 876, 404, 218, 18, B.wood.shadow);
  rect(ctx, 884, 396, 202, 10, B.wood.base);

  for (const [x, colour] of [[900, C.reagentGreen], [948, C.reagentPink], [996, C.reagentBlue], [1044, C.reagentGreen]] as const) {
    rect(ctx, x, 382, 24, 14, B.glass.shadow);
    rect(ctx, x + 4, 378, 16, 18, B.glass.base);
    rect(ctx, x + 7, 386, 10, 8, colour);
  }

  rect(ctx, 978, 470, 22, 58, B.machinery.shadow);
  rect(ctx, 984, 472, 10, 52, B.machinery.base);
  rect(ctx, 966, 464, 46, 12, B.steel.shadow);
  rect(ctx, 973, 467, 32, 6, B.steel.highlight);
  line(ctx, 989, 525, 989, 554, C.cable, 4);

  for (const [x, colour] of [[818, C.warning], [1136, C.reagentGreen]] as const) {
    rect(ctx, x, 700, 42, 28, B.machinery.shadow);
    rect(ctx, x + 5, 704, 32, 18, B.machinery.base);
    rect(ctx, x + 10, 708, 10, 7, Math.floor(now / 430 + x) % 2 === 0 ? colour : B.machinery.highlight);
  }

  rect(ctx, 900, 744, 174, 14, '#787a6d');
  for (let x = 908; x < 1068; x += 22) rect(ctx, x, 746, 11, 8, B.steel.highlight);
}

function drawContainmentBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawEnvironmentContactShadow(ctx, 1490, 700, 228, 14);

  for (const x of [1278, 1332, 1692, 1746]) {
    rect(ctx, x, 288, 12, 290, B.steel.shadow);
    rect(ctx, x + 4, 294, 4, 278, B.steel.highlight);
  }
  line(ctx, 1284, 292, 1284, 246, C.copper, 5);
  line(ctx, 1284, 246, 1752, 246, C.copper, 5);
  line(ctx, 1752, 246, 1752, 292, C.copper, 5);

  for (const x of [1354, 1426, 1498, 1570, 1642]) drawGauge(ctx, x, 230, Math.floor(now / 620 + x));

  for (const [x, y] of [[1320, 614], [1682, 614]] as const) {
    rect(ctx, x, y, 54, 34, B.machinery.shadow);
    rect(ctx, x + 6, y + 5, 42, 24, B.machinery.base);
    rect(ctx, x + 12, y + 10, 12, 8, Math.floor(now / 350 + x) % 3 === 0 ? C.warning : B.machinery.highlight);
    rect(ctx, x + 30, y + 10, 10, 8, '#6f9871');
  }

  for (const [x, colour] of [[1312, C.reagentBlue], [1660, C.reagentGreen]] as const) {
    rect(ctx, x, 674, 34, 66, B.steel.shadow);
    rect(ctx, x + 5, 680, 24, 54, B.glass.base);
    rect(ctx, x + 9, 704, 16, 26, colour);
    line(ctx, x + 17, 674, x + 17, 642, C.cable, 3);
  }

  rect(ctx, 1460, 690, 92, 18, B.steel.shadow);
  rect(ctx, 1468, 694, 76, 10, B.steel.highlight);
  for (const x of [1476, 1495, 1514, 1533]) rect(ctx, x, 696, 7, 6, x === 1514 ? C.warning : B.machinery.base);
}

function drawStorageBright(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [baseX, baseY] of [[226, 784], [1266, 790]] as const) {
    rect(ctx, baseX, baseY, 14, 190, B.steel.shadow);
    rect(ctx, baseX + 470, baseY, 14, 190, B.steel.shadow);
    for (const shelfY of [baseY + 12, baseY + 82, baseY + 154]) {
      rect(ctx, baseX, shelfY, 484, 10, B.steel.shadow);
      rect(ctx, baseX + 5, shelfY + 2, 474, 4, B.steel.highlight);
    }
  }

  for (const [x, y, colour] of [
    [246, 808, C.reagentGreen], [282, 808, C.reagentPink], [320, 808, C.reagentBlue],
    [360, 808, C.reagentPurple], [402, 808, C.reagentGreen], [448, 808, C.reagentPink],
    [1288, 814, C.reagentPurple], [1330, 814, C.reagentGreen], [1372, 814, C.reagentBlue],
  ] as const) {
    rect(ctx, x, y, 24, 42, B.glass.shadow);
    rect(ctx, x + 4, y - 4, 16, 46, B.glass.base);
    rect(ctx, x + 7, y + 18, 10, 20, colour);
    rect(ctx, x + 9, y - 8, 6, 6, B.steel.highlight);
  }

  for (const [x, y] of [[500, 804], [548, 812], [596, 804], [1450, 812], [1502, 806], [1554, 814]] as const) {
    rect(ctx, x, y, 34, 28, B.wood.shadow);
    rect(ctx, x + 4, y + 4, 26, 20, B.wood.base);
    rect(ctx, x + 8, y + 9, 18, 3, C.paperShade);
  }

  const pulse = Math.floor(now / 560) % 2 === 0;
  rect(ctx, 1594, 818, 76, 48, B.machinery.shadow);
  rect(ctx, 1600, 824, 64, 36, B.machinery.base);
  rect(ctx, 1608, 832, 18, 8, pulse ? C.warning : B.machinery.highlight);
  rect(ctx, 1634, 832, 18, 8, '#6f9871');
}

function drawWorkplaceClutterBright(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y, rotation] of [[688, 356, -0.08], [716, 374, 0.05], [1172, 376, -0.04]] as const) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    rect(ctx, 0, 0, 82, 50, C.paperShade);
    rect(ctx, 4, 4, 74, 42, C.paper);
    rect(ctx, 10, 11, 54, 3, C.warningDark);
    rect(ctx, 10, 19, 48, 2, C.ink);
    rect(ctx, 10, 25, 58, 2, C.ink);
    rect(ctx, 10, 31, 35, 2, C.ink);
    ctx.restore();
  }

  for (const [x, y] of [[700, 442], [1168, 440], [748, 850], [1204, 842]] as const) {
    rect(ctx, x, y, 28, 8, B.steel.shadow);
    rect(ctx, x + 8, y - 11, 7, 14, B.steel.highlight);
    rect(ctx, x + 14, y - 18, 5, 10, C.warningDark);
  }

  rect(ctx, 686, 420, 124, 12, B.wood.shadow);
  rect(ctx, 692, 414, 112, 8, B.wood.base);
  for (const x of [704, 730, 756, 782]) {
    rect(ctx, x, 394, 14, 23, B.glass.shadow);
    rect(ctx, x + 3, 391, 8, 25, B.glass.base);
    rect(ctx, x + 4, 404, 6, 10, x === 756 ? C.reagentPink : C.reagentGreen);
  }

  rect(ctx, 1152, 420, 110, 12, B.wood.shadow);
  rect(ctx, 1158, 414, 98, 8, B.wood.base);
  rect(ctx, 1180, 392, 48, 22, B.steel.shadow);
  rect(ctx, 1186, 397, 36, 12, B.machinery.base);
  rect(ctx, 1195, 400, 18, 6, Math.floor(now / 280) % 4 === 0 ? C.warning : B.machinery.highlight);
}

function drawLightingBright(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.fillStyle = C.lampGlow;
  for (const [x, y, rx, ry] of [[430, 492, 260, 210], [988, 610, 270, 210], [1490, 516, 300, 240]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const x of [372, 908, 1436]) {
    rect(ctx, x, 188, 130, 14, B.steel.shadow);
    rect(ctx, x + 8, 191, 114, 7, Math.floor(now / 900 + x) % 12 === 0 ? '#cdbf86' : '#efe0a7');
    rect(ctx, x + 58, 202, 14, 5, B.steel.shadow);
  }
}

function drawBiotechHumourBright(ctx: CanvasRenderingContext2D): void {
  for (const [x, y, bars] of [[714, 294, 2], [1114, 294, 3]] as const) {
    rect(ctx, x, y, 124, 58, B.wood.shadow);
    rect(ctx, x + 4, y + 4, 116, 50, C.paper);
    rect(ctx, x + 10, y + 10, 92, 5, C.warningDark);
    for (let row = 0; row < bars; row += 1) rect(ctx, x + 12, y + 23 + row * 7, 80 - row * 13, 3, C.ink);
    rect(ctx, x + 96, y + 30, 14, 14, C.reagentPink);
    rect(ctx, x + 100, y + 34, 6, 6, C.cream);
  }
  rect(ctx, 742, 348, 70, 9, C.warning);
  rect(ctx, 1138, 351, 62, 8, C.warning);
}

export function drawMasterLabBrightProductionArt(
  ctx: CanvasRenderingContext2D,
  now: number,
  _storyState: MasterLabState = 'pre-disaster',
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawWallServicesBright(ctx, now);
  drawFloorDetailBright(ctx);
  drawSpliceBayBright(ctx, now);
  drawDemonstrationBright(ctx, now);
  drawContainmentBright(ctx, now);
  drawStorageBright(ctx, now);
  drawWorkplaceClutterBright(ctx, now);
  drawLightingBright(ctx, now);
  drawBiotechHumourBright(ctx);
  ctx.restore();
}

function drawHiddenSilhouettes(ctx: CanvasRenderingContext2D, now: number): void {
  const twitch = Math.floor(now / 180) % 2 ? 4 : 0;
  ctx.save();
  ctx.fillStyle = C.darkShadow;
  for (const [x, y, rx, ry] of [[410, 606, 185, 22], [988, 716, 182, 20], [1492, 650, 238, 24]] as const) {
    ctx.beginPath();
    ctx.ellipse(x + twitch, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  rect(ctx, 166, 111, 10, 63, C.blackTissue);
  rect(ctx, 176 + twitch, 102, 8, 72, C.blackTissue);
  rect(ctx, 1808, 112, 8, 62, C.blackTissue);
  rect(ctx, 1796 - twitch, 96, 7, 78, C.blackTissue);

  for (const [x, y] of [[176, 130], [1802, 126]] as const) {
    rect(ctx, x, y, 26, 12, '#2e3132');
    rect(ctx, x + 7, y + 2, 4, 4, '#8e4145');
    rect(ctx, x + 17, y + 2, 4, 4, '#8e4145');
  }
}

function drawDarkWallAndServices(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, width] of [[118, 274], [412, 238], [1222, 260], [1510, 300]] as const) {
    rect(ctx, x, 182, width, 28, D.plaster.base);
    rect(ctx, x + 10, 203, Math.max(18, width - 24), 7, D.plaster.shadow);
  }

  for (const x of [132, 354, 620, 1248, 1516, 1770]) {
    rect(ctx, x, 183, 10, 84, D.steel.shadow);
    rect(ctx, x - 7, 198, 24, 11, D.machinery.shadow);
    rect(ctx, x - 3, 201, 16, 5, Math.floor(now / 210 + x) % 4 === 0 ? '#a34846' : '#4d3436');
  }
  line(ctx, 150, 282, 610, 282, '#3a3437', 6);
  line(ctx, 1238, 282, 1790, 282, '#3a3437', 6);

  for (const [x, y] of [[242, 278], [462, 278], [1370, 278], [1644, 278]] as const) {
    rect(ctx, x, y, 30, 18, D.machinery.shadow);
    rect(ctx, x + 8, y + 5, 13, 6, C.oldBlood);
    line(ctx, x + 15, y + 18, x + 26, y + 46, C.blackTissue, 4);
  }
}

function drawFailedSpecimens(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y, body, eye] of [
    [250, 806, '#684653', '#a94c4d'], [322, 810, '#5d5846', '#b86a54'], [402, 808, '#724954', '#9c4349'],
    [1292, 812, '#63505b', '#a3494d'], [1370, 812, '#635945', '#9b4449'],
  ] as const) {
    rect(ctx, x, y, 28, 48, D.glass.shadow);
    rect(ctx, x + 4, y - 4, 20, 52, D.glass.base);
    rect(ctx, x + 7, y + 18, 14, 24, C.badFluid);
    rect(ctx, x + 8, y + 24, 10, 10, body);
    rect(ctx, x + 11, y + 22, 5, 6, C.tissuePale);
    rect(ctx, x + 15, y + 26, 3, 3, eye);
    if ((Math.floor(now / 400) + x) % 3 === 0) rect(ctx, x + 7, y + 10, 4, 4, D.glass.highlight);
  }

  rect(ctx, 520, 800, 116, 74, D.cage.shadow);
  rect(ctx, 528, 808, 100, 58, '#383b39');
  for (let x = 536; x < 624; x += 16) rect(ctx, x, 810, 4, 54, D.cage.highlight);
  rect(ctx, 548, 844, 42, 10, C.tissue);
  rect(ctx, 566, 836, 18, 12, C.tissuePale);
  rect(ctx, 584, 846, 22, 6, C.oldBlood);
  rect(ctx, 598, 829, 5, 5, '#9d4548');
}

function drawCorruptedSpliceBay(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 270, 410, 300, 112, D.steel.base);
  rect(ctx, 286, 432, 268, 60, '#5c5b4f');
  rect(ctx, 314, 448, 214, 24, '#574448');

  for (const [x, y, width] of [[312, 462, 74], [402, 470, 92], [476, 450, 54]] as const) {
    rect(ctx, x, y, width, 7, C.oldBlood);
    rect(ctx, x + 10, y + 6, Math.max(10, width - 22), 5, C.tissue);
  }

  rect(ctx, 556, 338, 54, 174, D.glass.shadow);
  rect(ctx, 566, 350, 34, 146, '#46564d');
  rect(ctx, 572, 404, 22, 84, C.badFluid);
  rect(ctx, 578, 434, 12, 24, C.tissue);
  rect(ctx, 572, 456, 20, 10, C.tissuePale);
  line(ctx, 586, 496, 586, 526, C.oldBlood, 5);

  for (const [x, y] of [[304, 532], [356, 540], [426, 528], [490, 544]] as const) {
    rect(ctx, x, y, 28, 10, D.steel.shadow);
    rect(ctx, x + 6, y - 9, 9, 12, C.blackTissue);
    rect(ctx, x + 13, y - 15, 5, 9, C.tissuePale);
  }

  const spark = Math.floor(now / 140) % 7 === 0;
  rect(ctx, 350, 286, 34, 22, D.machinery.shadow);
  rect(ctx, 358, 292, 18, 8, spark ? '#c0644c' : '#4c3436');
  if (spark) {
    rect(ctx, 383, 296, 5, 5, '#e2b65c');
    rect(ctx, 389, 289, 3, 8, '#f0d582');
  }
}

function drawContainmentHorror(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 1296, 306, 370, 280, D.glass.base);
  rect(ctx, 1310, 320, 342, 252, '#4b6054');
  rect(ctx, 1310, 512, 342, 60, C.badFluid);
  for (const x of [1330, 1394, 1458, 1522, 1586]) rect(ctx, x, 320, 5, 252, D.steel.shadow);

  for (const [x, y, width] of [[1324, 526, 70], [1410, 540, 104], [1528, 518, 100]] as const) {
    rect(ctx, x, y, width, 10, D.residue.shadow);
    rect(ctx, x + 12, y - 7, Math.max(12, width - 26), 13, C.tissue);
  }
  for (const [x, y] of [[1374, 452], [1460, 484], [1572, 442]] as const) {
    line(ctx, x, y, x - 18, y + 70, C.blackTissue, 5);
    rect(ctx, x - 24, y + 42, 16, 18, C.tissuePale);
  }

  rect(ctx, 1438, 342, 88, 48, '#394544');
  rect(ctx, 1450, 354, 58, 22, '#302f32');
  rect(ctx, 1462, 360, 8, 7, '#954449');
  rect(ctx, 1490, 360, 8, 7, '#954449');
  rect(ctx, 1470, 375, 24, 6, C.bone);

  rect(ctx, 1422, 610, 174, 70, D.machinery.shadow);
  rect(ctx, 1432, 620, 154, 50, D.machinery.base);
  for (const x of [1446, 1480, 1514, 1548]) rect(ctx, x, 642, 12, 10, x === 1514 && Math.floor(now / 220) % 3 === 0 ? '#a64948' : '#483638');
  line(ctx, 1548, 670, 1576, 712, C.blackTissue, 5);
}

function drawLeakageAndCleanup(ctx: CanvasRenderingContext2D): void {
  drawDrain(ctx, 850, 812, 260, true);
  drawDrain(ctx, 1010, 1004, 180, true);
  drawDrain(ctx, 1226, 748, 94, true);

  for (const [x, y, width] of [
    [826, 802, 118], [930, 816, 154], [1162, 786, 124], [1000, 992, 96], [1216, 1002, 124],
  ] as const) {
    rect(ctx, x, y, width, 7, C.oldBlood);
    rect(ctx, x + 14, y + 6, Math.max(12, width - 32), 5, D.residue.base);
  }

  for (const [x, y] of [[870, 790], [1052, 826], [1236, 770], [1288, 1016]] as const) {
    rect(ctx, x, y, 24, 9, C.tissue);
    rect(ctx, x + 8, y - 7, 12, 11, C.tissuePale);
    rect(ctx, x + 13, y - 13, 4, 8, C.blackTissue);
  }

  rect(ctx, 1088, 854, 88, 40, D.wood.shadow);
  rect(ctx, 1096, 862, 72, 24, '#6b6652');
  rect(ctx, 1110, 866, 46, 5, C.oldBlood);
  rect(ctx, 1114, 876, 32, 4, '#81765d');
}

function drawDamagedDarkEquipment(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y] of [[818, 700], [1136, 700], [1594, 818], [1180, 392]] as const) {
    rect(ctx, x, y, 46, 30, D.machinery.shadow);
    rect(ctx, x + 7, y + 6, 32, 18, '#394442');
    rect(ctx, x + 11, y + 10, 12, 6, Math.floor(now / 170 + x) % 5 === 0 ? '#b14c48' : '#523638');
    line(ctx, x + 28, y + 24, x + 40, y + 46, C.blackTissue, 4);
  }

  for (const [x, y] of [[706, 442], [1172, 440]] as const) {
    rect(ctx, x, y, 28, 8, D.steel.shadow);
    rect(ctx, x + 8, y - 10, 7, 14, D.steel.base);
    line(ctx, x + 14, y - 8, x + 28, y - 24, C.oldBlood, 3);
  }
}

function drawDarkLighting(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(18,20,23,0.16)';
  for (const [x, y, rx, ry] of [[430, 500, 238, 196], [986, 620, 244, 190], [1490, 520, 280, 220]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const x of [372, 908, 1436]) {
    rect(ctx, x, 188, 130, 14, D.steel.shadow);
    rect(ctx, x + 8, 191, 114, 7, x === 908 ? '#684047' : '#6d705c');
  }
}

export function drawMasterLabDarkProductionArt(
  ctx: CanvasRenderingContext2D,
  now: number,
  storyState: MasterLabState = 'pre-disaster',
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawHiddenSilhouettes(ctx, now);
  drawDarkWallAndServices(ctx, now);
  drawFailedSpecimens(ctx, now);
  drawCorruptedSpliceBay(ctx, now);
  drawContainmentHorror(ctx, now);
  drawLeakageAndCleanup(ctx);
  drawDamagedDarkEquipment(ctx, now);
  drawDarkLighting(ctx);
  if (storyState === 'aftermath') {
    rect(ctx, 1040, 630, 268, 12, C.freshBlood);
    rect(ctx, 1086, 642, 194, 9, C.oldBlood);
    rect(ctx, 1152, 651, 84, 8, C.tissue);
  }
  ctx.restore();
}

export function drawMasterLabBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  if (playerFeetY < 760) {
    rect(ctx, 738, 742, 6, 92, B.cable.shadow);
    rect(ctx, 748, 746, 4, 76, C.copper);
    rect(ctx, 1214, 736, 6, 96, B.cable.shadow);
    rect(ctx, 1224, 742, 4, 82, C.cableLight);
  }
  if (playerFeetY < 940) {
    rect(ctx, 230, 966, 470, 7, B.steel.shadow);
    rect(ctx, 1268, 964, 456, 7, B.steel.shadow);
  }
}

export function drawMasterLabDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  now: number,
): void {
  const twitch = Math.floor(now / 180) % 2 ? 3 : 0;
  if (playerFeetY < 760) {
    rect(ctx, 738 + twitch, 736, 8, 102, D.cable.shadow);
    rect(ctx, 746 + twitch, 760, 5, 68, C.tissue);
    rect(ctx, 1214 - twitch, 732, 8, 104, D.cable.shadow);
    rect(ctx, 1222 - twitch, 756, 6, 70, C.blackTissue);
  }
  if (playerFeetY < 940) {
    rect(ctx, 230, 964, 470, 9, D.steel.shadow);
    rect(ctx, 1268, 962, 456, 9, D.steel.shadow);
    rect(ctx, 514, 956, 82, 8, C.oldBlood);
    rect(ctx, 1452, 954, 96, 8, D.residue.base);
  }
}
