import { drawPixelRect } from '../environment/environmentArtLanguage.js';
import { YARD_CORE_X, YARD_CORE_Y } from './yard.js';

export const YARD_PRODUCTION_ART_CONTRACT = {
  locationId: 'yard',
  geometryId: 'opening-world-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  activeArtGeneration: 'graphics-tightening-pass-d' as const,
  qualityReference: 'master-lab-and-approved-protagonists' as const,
  replacementMode: 'opaque-core-redraw-not-overlay-stack' as const,
  brightDetailGroups: [
    'authored-ground-plate',
    'apprentice-workshop',
    'animal-handling',
    'biotech-service',
    'containment-hardware',
    'waste-and-repairs',
    'directional-lighting',
    'foreground-depth',
  ] as const,
  darkStoryGroups: [
    'ruptured-containment',
    'organic-pipe-intrusion',
    'wrong-pen-silhouettes',
    'failed-cleanup',
    'dead-ground',
    'biological-runoff',
    'foreground-tissue',
  ] as const,
} as const;

interface Palette {
  grass: string;
  grassLight: string;
  grassDark: string;
  grassDeep: string;
  dirt: string;
  dirtLight: string;
  dirtDark: string;
  mud: string;
  timber: string;
  timberLight: string;
  timberDark: string;
  plaster: string;
  plasterLight: string;
  plasterDark: string;
  roof: string;
  roofLight: string;
  roofDark: string;
  steel: string;
  steelLight: string;
  steelDark: string;
  copper: string;
  glass: string;
  glassLight: string;
  fluid: string;
  warning: string;
  cream: string;
  ink: string;
  red: string;
  pink: string;
  bone: string;
  water: string;
  waterLight: string;
  waterDark: string;
  organic: string;
  organicLight: string;
}

const BRIGHT: Palette = {
  grass: '#7f9e59', grassLight: '#96b96a', grassDark: '#5f7748', grassDeep: '#465f3f',
  dirt: '#b89562', dirtLight: '#cfaf78', dirtDark: '#806448', mud: '#6f5943',
  timber: '#815d42', timberLight: '#a77a50', timberDark: '#4f3b30',
  plaster: '#d5c086', plasterLight: '#e8d69e', plasterDark: '#9f895f',
  roof: '#3d655f', roofLight: '#567c71', roofDark: '#27463f',
  steel: '#5e6d67', steelLight: '#87968b', steelDark: '#34443f', copper: '#aa6947',
  glass: '#86b5a9', glassLight: '#b7d6c4', fluid: '#8fc47d',
  warning: '#d8b758', cream: '#f0dfb1', ink: '#26342f', red: '#a34f45', pink: '#bf747f', bone: '#d8c9a4',
  water: '#5d9695', waterLight: '#8fc0b5', waterDark: '#416f72',
  organic: '#7c4a57', organicLight: '#a86872',
};

const DARK: Palette = {
  grass: '#3b4b3b', grassLight: '#485947', grassDark: '#27372f', grassDeep: '#1c2c29',
  dirt: '#665748', dirtLight: '#796756', dirtDark: '#3f3732', mud: '#46383a',
  timber: '#5d4840', timberLight: '#74584b', timberDark: '#2d2929',
  plaster: '#827867', plasterLight: '#9a8d76', plasterDark: '#514b47',
  roof: '#344b49', roofLight: '#405c55', roofDark: '#202e2f',
  steel: '#47534f', steelLight: '#65736b', steelDark: '#293330', copper: '#75483f',
  glass: '#55746f', glassLight: '#758e80', fluid: '#75546a',
  warning: '#8d6847', cream: '#aea189', ink: '#1f2928', red: '#763846', pink: '#87505e', bone: '#988d77',
  water: '#3d5f62', waterLight: '#557a73', waterDark: '#293f46',
  organic: '#713847', organicLight: '#9d5968',
};

const X = YARD_CORE_X;
const Y = YARD_CORE_Y;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  drawPixelRect(ctx, x, y, width, height, colour);
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[], colour: string): void {
  const first = points[0];
  if (!first) return;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(Math.round(first[0]), Math.round(first[1]));
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point) ctx.lineTo(Math.round(point[0]), Math.round(point[1]));
  }
  ctx.closePath();
  ctx.fill();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, colour: string, width = 3): void {
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

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, dark: boolean): void {
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(18,20,22,0.46)' : 'rgba(31,40,35,0.24)';
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // Opaque core plate deliberately removes the visible Pass B/C layer stack.
  rect(ctx, X, Y, 960, 540, p.grass);
  polygon(ctx, [[X, Y + 18], [X + 226, Y], [X + 438, Y + 28], [X + 618, Y + 6], [X + 960, Y + 34], [X + 960, Y], [X, Y]], p.grassLight);
  polygon(ctx, [[X, Y + 466], [X + 176, Y + 438], [X + 306, Y + 476], [X + 512, Y + 448], [X + 720, Y + 490], [X + 960, Y + 458], [X + 960, Y + 540], [X, Y + 540]], p.grassDark);

  polygon(ctx, [
    [X + 420, Y + 540], [X + 386, Y + 488], [X + 354, Y + 438], [X + 330, Y + 384],
    [X + 338, Y + 334], [X + 390, Y + 310], [X + 474, Y + 300], [X + 582, Y + 300],
    [X + 674, Y + 322], [X + 782, Y + 328], [X + 960, Y + 318], [X + 960, Y + 390],
    [X + 770, Y + 396], [X + 660, Y + 382], [X + 560, Y + 360], [X + 472, Y + 360],
    [X + 414, Y + 374], [X + 408, Y + 420], [X + 438, Y + 478], [X + 468, Y + 540],
  ], p.dirtDark);
  polygon(ctx, [
    [X + 432, Y + 540], [X + 404, Y + 482], [X + 374, Y + 432], [X + 368, Y + 394],
    [X + 386, Y + 356], [X + 454, Y + 334], [X + 562, Y + 330], [X + 666, Y + 352],
    [X + 778, Y + 356], [X + 960, Y + 346], [X + 960, Y + 372], [X + 776, Y + 380],
    [X + 662, Y + 370], [X + 558, Y + 346], [X + 462, Y + 348], [X + 396, Y + 370],
    [X + 392, Y + 414], [X + 420, Y + 476], [X + 450, Y + 540],
  ], p.dirtLight);

  for (const [px, py, width] of [
    [376, 401, 54], [426, 434, 72], [490, 466, 46], [565, 352, 64], [650, 365, 42], [744, 360, 60],
  ] as const) {
    rect(ctx, X + px, Y + py, width, 3, p.mud);
    rect(ctx, X + px + 8, Y + py + 7, Math.max(10, width - 18), 2, p.dirt);
  }

  for (const [px, py] of [[34, 96], [188, 448], [280, 92], [622, 466], [874, 118], [912, 476]] as const) {
    rect(ctx, X + px, Y + py, 3, 9, p.grassDeep);
    rect(ctx, X + px + 5, Y + py + 3, 3, 6, p.grassDeep);
    if (!dark) rect(ctx, X + px + 2, Y + py - 3, 5, 4, px % 2 ? '#c97987' : '#d8b758');
  }

  if (dark) {
    polygon(ctx, [[X + 470, Y + 408], [X + 538, Y + 396], [X + 616, Y + 418], [X + 594, Y + 454], [X + 518, Y + 446]], '#542f3d');
    rect(ctx, X + 492, Y + 422, 90, 6, p.organic);
    rect(ctx, X + 846, Y + 204, 94, 10, p.organic);
  }
}

function drawWorkshop(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  const bx = X + 54;
  const by = Y + 74;
  shadow(ctx, bx + 215, by + 165, 205, 13, dark);

  polygon(ctx, [[bx, by + 48], [bx + 34, by + 24], [bx + 118, by + 16], [bx + 176, by + 2], [bx + 260, by + 14], [bx + 332, by + 8], [bx + 430, by + 38], [bx + 418, by + 72], [bx + 12, by + 72]], p.roofDark);
  polygon(ctx, [[bx + 16, by + 44], [bx + 78, by + 28], [bx + 164, by + 18], [bx + 250, by + 28], [bx + 330, by + 22], [bx + 410, by + 44], [bx + 398, by + 58], [bx + 28, by + 58]], p.roof);
  for (const [px, py, width] of [[44, 35, 52], [136, 25, 66], [248, 31, 54], [332, 33, 44]] as const) rect(ctx, bx + px, by + py, width, 4, p.roofLight);

  rect(ctx, bx + 14, by + 62, 394, 102, p.timberDark);
  rect(ctx, bx + 22, by + 68, 378, 90, p.plaster);
  polygon(ctx, [[bx + 22, by + 118], [bx + 112, by + 110], [bx + 174, by + 126], [bx + 248, by + 116], [bx + 330, by + 130], [bx + 400, by + 120], [bx + 400, by + 158], [bx + 22, by + 158]], p.plasterDark);
  rect(ctx, bx + 30, by + 74, 156, 5, p.plasterLight);

  for (const wx of [48, 142] as const) {
    rect(ctx, bx + wx, by + 88, 70, 48, p.timberDark);
    rect(ctx, bx + wx + 5, by + 93, 60, 38, p.glass);
    rect(ctx, bx + wx + 9, by + 97, 20, 16, p.glassLight);
    rect(ctx, bx + wx + 34, by + 93, 3, 38, p.steelDark);
    rect(ctx, bx + wx + 8, by + 116, 54, 3, p.steelDark);
  }

  rect(ctx, bx + 238, by + 84, 72, 80, p.timberDark);
  rect(ctx, bx + 245, by + 91, 58, 73, p.timber);
  rect(ctx, bx + 253, by + 102, 42, 22, p.warning);
  rect(ctx, bx + 258, by + 107, 32, 4, p.ink);
  rect(ctx, bx + 262, by + 115, 24, 3, p.red);
  rect(ctx, bx + 293, by + 139, 5, 5, p.ink);

  rect(ctx, bx + 312, by + 72, 96, 92, p.steelDark);
  rect(ctx, bx + 318, by + 78, 84, 80, p.glass);
  rect(ctx, bx + 324, by + 84, 28, 26, p.glassLight);
  for (let gx = 330; gx <= 392; gx += 20) rect(ctx, bx + gx, by + 78, 3, 80, p.steel);
  rect(ctx, bx + 328, by + 132, 58, 14, p.timber);
  rect(ctx, bx + 338, by + 118, 7, 18, dark ? p.organic : '#6f9f5d');
  rect(ctx, bx + 330, by + 112, 22, 10, dark ? p.organicLight : '#9cc970');
  rect(ctx, bx + 365, by + 122, 6, 14, dark ? p.organic : '#6f9f5d');
  rect(ctx, bx + 358, by + 116, 20, 10, dark ? p.organicLight : '#bb7b8a');

  line(ctx, bx + 344, by + 14, bx + 344, by + 66, p.steelDark, 5);
  line(ctx, bx + 344, by + 16, bx + 394, by + 16, p.steelDark, 5);
  line(ctx, bx + 394, by + 16, bx + 394, by + 50, p.steelDark, 5);
  rect(ctx, bx + 354, by + 9, 20, 11, p.steel);
  rect(ctx, bx + 360, by + 12, 8, 5, Math.floor(now / 450) % 2 === 0 ? p.warning : p.steelLight);

  rect(ctx, bx + 86, by - 10, 30, 42, p.timberDark);
  rect(ctx, bx + 94, by - 18, 16, 48, p.timber);
  rect(ctx, bx + 91, by - 20, 22, 6, p.steelDark);
  rect(ctx, bx + 176, by + 12, 30, 5, p.copper);
  rect(ctx, bx + 208, by + 17, 42, 4, p.steelDark);

  if (dark) {
    line(ctx, bx + 345, by + 18, bx + 351, by + 62, p.organic, 5);
    line(ctx, bx + 351, by + 62, bx + 330, by + 89, p.organicLight, 4);
    line(ctx, bx + 351, by + 62, bx + 378, by + 90, p.organic, 3);
    polygon(ctx, [[bx + 112, by + 146], [bx + 170, by + 134], [bx + 210, by + 152], [bx + 178, by + 160], [bx + 122, by + 158]], '#57323d');
  }
}

function drawAnimalPen(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  const x = X + 506;
  const y = Y + 54;
  shadow(ctx, x + 98, y + 132, 96, 10, dark);
  for (const px of [0, 44, 88, 132, 190] as const) {
    rect(ctx, x + px, y + 18, 7, 116, p.timberDark);
    rect(ctx, x + px + 3, y + 22, 4, 108, p.timberLight);
  }
  for (const py of [28, 96] as const) {
    rect(ctx, x, y + py, 196, 6, p.timberDark);
    rect(ctx, x + 6, y + py + 2, 184, 3, p.timberLight);
  }
  rect(ctx, x + 148, y + 46, 36, 38, p.steelDark);
  rect(ctx, x + 154, y + 52, 24, 26, p.steel);
  rect(ctx, x + 160, y + 58, 12, 6, Math.floor(now / 520) % 2 === 0 ? p.warning : p.steelLight);
  polygon(ctx, [[x + 20, y + 92], [x + 84, y + 92], [x + 76, y + 110], [x + 28, y + 110]], p.steelDark);
  rect(ctx, x + 30, y + 96, 44, 8, dark ? p.organic : '#7ca278');

  if (!dark) {
    rect(ctx, x + 96, y + 72, 42, 24, p.bone);
    rect(ctx, x + 118, y + 58, 22, 20, p.bone);
    rect(ctx, x + 120, y + 42, 6, 20, p.timberLight);
    rect(ctx, x + 132, y + 40, 6, 22, p.timberLight);
    rect(ctx, x + 92, y + 78, 9, 7, p.pink);
    rect(ctx, x + 126, y + 64, 3, 4, p.ink);
    rect(ctx, x + 101, y + 94, 7, 13, p.timberLight);
    rect(ctx, x + 128, y + 94, 7, 13, p.timberLight);
  } else {
    polygon(ctx, [[x + 88, y + 78], [x + 132, y + 64], [x + 154, y + 80], [x + 142, y + 104], [x + 104, y + 100]], p.organic);
    line(ctx, x + 112, y + 68, x + 98, y + 42, p.organicLight, 5);
    line(ctx, x + 132, y + 68, x + 150, y + 38, p.organicLight, 5);
    rect(ctx, x + 142, y + 82, 4, 4, '#bf7378');
    polygon(ctx, [[x + 168, y + 104], [x + 194, y + 96], [x + 204, y + 116], [x + 178, y + 124]], '#53313e');
  }
}

function drawServiceBench(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  const x = X + 452;
  const y = Y + 228;
  shadow(ctx, x + 79, y + 68, 76, 9, dark);
  rect(ctx, x, y + 8, 158, 68, p.timberDark);
  rect(ctx, x + 8, y, 142, 18, p.timberLight);
  rect(ctx, x + 14, y + 18, 10, 52, p.timber);
  rect(ctx, x + 132, y + 18, 10, 52, p.timber);
  rect(ctx, x + 30, y - 20, 34, 28, p.steelDark);
  rect(ctx, x + 36, y - 16, 22, 20, p.glass);
  rect(ctx, x + 41, y - 5, 12, 7, dark ? p.organic : '#8ec678');
  rect(ctx, x + 78, y - 10, 26, 11, p.bone);
  rect(ctx, x + 84, y - 16, 14, 8, p.bone);
  rect(ctx, x + 88, y - 12, 6, 4, p.pink);
  rect(ctx, x + 116, y - 8, 20, 8, p.warning);
  line(ctx, x + 140, y + 5, x + 164, y + 5, p.copper, 4);
  line(ctx, x + 164, y + 5, x + 164, y + 44, p.copper, 4);
  rect(ctx, x + 158, y + 42, 18, 14, p.steelDark);
  rect(ctx, x + 162, y + 46, 10, 6, Math.floor(now / 300) % 2 === 0 ? p.warning : p.steelLight);
  if (dark) {
    line(ctx, x + 165, y + 12, x + 178, y + 28, p.organic, 4);
    line(ctx, x + 178, y + 28, x + 164, y + 52, p.organicLight, 4);
    polygon(ctx, [[x + 70, y + 8], [x + 110, y + 6], [x + 124, y + 20], [x + 84, y + 24]], '#5c3442');
  }
}

function drawVatAndCage(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  const vx = X + 68;
  const vy = Y + 298;
  shadow(ctx, vx + 82, vy + 137, 78, 9, dark);
  rect(ctx, vx, vy + 4, 164, 142, p.steelDark);
  rect(ctx, vx + 8, vy + 12, 148, 126, p.steel);
  rect(ctx, vx + 18, vy + 18, 128, 106, p.glass);
  rect(ctx, vx + 26, vy + 28, 112, 88, p.fluid);
  rect(ctx, vx + 32, vy + 32, 22, 9, p.glassLight);
  rect(ctx, vx + 18, vy + 78, 128, 5, p.steelDark);
  for (const px of [vx + 8, vx + 148] as const) rect(ctx, px, vy + 18, 8, 110, p.steelDark);
  rect(ctx, vx + 44, vy - 4, 76, 16, p.steelDark);
  rect(ctx, vx + 52, vy, 60, 9, p.steel);
  rect(ctx, vx + 68, vy + 2, 12, 5, Math.floor(now / 360) % 2 === 0 ? p.warning : p.steelLight);
  if (!dark) {
    rect(ctx, vx + 64, vy + 64, 36, 24, p.pink);
    rect(ctx, vx + 88, vy + 54, 18, 18, p.bone);
    rect(ctx, vx + 98, vy + 48, 5, 10, p.pink);
  } else {
    polygon(ctx, [[vx + 52, vy + 64], [vx + 90, vy + 48], [vx + 118, vy + 68], [vx + 106, vy + 96], [vx + 68, vy + 90]], p.organicLight);
    line(ctx, vx + 82, vy + 58, vx + 70, vy + 34, p.organicLight, 4);
    line(ctx, vx + 96, vy + 58, vx + 112, vy + 30, p.organicLight, 4);
    rect(ctx, vx + 116, vy + 100, 24, 12, p.organic);
  }

  const cx = X + 234;
  const cy = Y + 388;
  shadow(ctx, cx + 57, cy + 76, 54, 8, dark);
  rect(ctx, cx, cy, 114, 82, p.timberDark);
  rect(ctx, cx + 6, cy + 6, 102, 70, p.steelDark);
  for (let gx = cx + 12; gx < cx + 104; gx += 14) rect(ctx, gx, cy + 8, 3, 66, p.steelLight);
  rect(ctx, cx + 10, cy + 58, 94, 5, p.timber);
  if (!dark) {
    rect(ctx, cx + 42, cy + 42, 30, 18, p.bone);
    rect(ctx, cx + 64, cy + 34, 14, 14, p.bone);
    rect(ctx, cx + 72, cy + 30, 4, 8, p.pink);
  } else {
    polygon(ctx, [[cx + 28, cy + 50], [cx + 64, cy + 28], [cx + 92, cy + 42], [cx + 84, cy + 66], [cx + 42, cy + 64]], p.organic);
    line(ctx, cx + 64, cy + 34, cx + 78, cy + 14, p.organicLight, 4);
  }
}

function drawPond(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  const x = X + 704;
  const y = Y + 286;
  polygon(ctx, [[x + 20, y], [x + 142, y + 4], [x + 194, y + 34], [x + 202, y + 92], [x + 170, y + 142], [x + 60, y + 154], [x + 6, y + 120], [x, y + 52]], p.grassDeep);
  polygon(ctx, [[x + 32, y + 12], [x + 140, y + 14], [x + 182, y + 42], [x + 188, y + 92], [x + 158, y + 130], [x + 66, y + 140], [x + 18, y + 112], [x + 14, y + 54]], p.waterDark);
  polygon(ctx, [[x + 44, y + 22], [x + 134, y + 24], [x + 172, y + 48], [x + 174, y + 88], [x + 146, y + 118], [x + 72, y + 126], [x + 30, y + 102], [x + 28, y + 58]], p.water);
  const shift = Math.floor(now / 520) % 2 ? 6 : 0;
  for (const [wx, wy, width] of [[54, 46, 34], [112, 58, 42], [66, 98, 46], [126, 106, 24]] as const) rect(ctx, x + wx + shift, y + wy, width, 3, p.waterLight);
  if (dark) {
    polygon(ctx, [[x + 66, y + 74], [x + 108, y + 60], [x + 154, y + 78], [x + 138, y + 106], [x + 86, y + 102]], p.organic);
    line(ctx, x + 108, y + 80, x + 128, y + 52, p.organicLight, 4);
  }
}

function drawServiceCluster(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  ctx.save();
  ctx.globalAlpha = dark ? 0.18 : 0.16;
  polygon(ctx, [[X + 314, Y + 178], [X + 656, Y + 188], [X + 742, Y + 372], [X + 402, Y + 410]], dark ? '#9a5260' : '#ffe29e');
  ctx.restore();

  rect(ctx, X + 624, Y + 390, 34, 44, p.steelDark);
  rect(ctx, X + 630, Y + 396, 22, 32, p.steel);
  rect(ctx, X + 620, Y + 386, 42, 8, p.timberDark);
  rect(ctx, X + 672, Y + 404, 44, 7, p.timberDark);
  rect(ctx, X + 680, Y + 412, 30, 4, p.timberLight);
  ctx.save();
  ctx.strokeStyle = dark ? p.organic : '#3e625c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(X + 690, Y + 438, 18, 0, Math.PI * 2);
  ctx.arc(X + 690, Y + 438, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (!dark) {
    rect(ctx, X + 306, Y + 276, 46, 4, p.cream);
    rect(ctx, X + 312, Y + 282, 34, 3, p.timberDark);
    rect(ctx, X + 320, Y + 288, 20, 3, p.red);
  } else {
    polygon(ctx, [[X + 582, Y + 448], [X + 638, Y + 434], [X + 694, Y + 454], [X + 656, Y + 476], [X + 596, Y + 468]], p.organic);
    line(ctx, X + 636, Y + 448, X + 650, Y + 414, p.organicLight, 5);
  }
}

function drawScene(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawGround(ctx, p, dark);
  drawWorkshop(ctx, now, p, dark);
  drawAnimalPen(ctx, now, p, dark);
  drawServiceBench(ctx, now, p, dark);
  drawVatAndCage(ctx, now, p, dark);
  drawPond(ctx, now, p, dark);
  drawServiceCluster(ctx, p, dark);
  ctx.restore();
}

export function drawPassDYardBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawScene(ctx, now, BRIGHT, false);
}

export function drawPassDYardDark(ctx: CanvasRenderingContext2D, now: number): void {
  drawScene(ctx, now, DARK, true);
}

function drawForeground(ctx: CanvasRenderingContext2D, playerFeetY: number, p: Palette, dark: boolean): void {
  if (playerFeetY >= Y + 492) return;
  shadow(ctx, X + 213, Y + 486, 171, 7, dark);
  rect(ctx, X + 42, Y + 474, 342, 8, p.steelDark);
  rect(ctx, X + 48, Y + 477, 330, 3, p.steelLight);
  for (const px of [X + 58, X + 176, X + 304] as const) {
    rect(ctx, px, Y + 466, 9, 30, p.steelDark);
    rect(ctx, px + 3, Y + 470, 3, 22, p.steelLight);
  }
  if (dark) {
    line(ctx, X + 166, Y + 480, X + 186, Y + 500, p.organic, 4);
    line(ctx, X + 186, Y + 500, X + 202, Y + 490, p.organicLight, 3);
    polygon(ctx, [[X + 300, Y + 474], [X + 348, Y + 466], [X + 378, Y + 486], [X + 334, Y + 496]], p.organic);
  }
}

export function drawPassDYardBrightForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawForeground(ctx, playerFeetY, BRIGHT, false);
}

export function drawPassDYardDarkForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawForeground(ctx, playerFeetY, DARK, true);
}
