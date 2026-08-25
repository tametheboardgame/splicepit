export const YARD_VIEW_WIDTH = 1280;
export const YARD_VIEW_HEIGHT = 720;
export const YARD_WORLD_WIDTH = 2920;
export const YARD_WORLD_HEIGHT = 1600;
export const YARD_CORE_X = 360;
export const YARD_CORE_Y = 220;
export const YARD_SPAWN = { x: YARD_CORE_X + 540, y: YARD_CORE_Y + 342 } as const;

export type YardFacing = 'down' | 'left' | 'right' | 'up';
export type YardRect = { x: number; y: number; width: number; height: number };
export type OpeningRouteLandmarkId = 'apprentice-yard' | 'master-lab' | 'debt-encounter' | 'local-pit-route';

export interface OpeningRouteLandmark {
  readonly id: OpeningRouteLandmarkId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

export const OPENING_ROUTE_LANDMARKS: readonly OpeningRouteLandmark[] = [
  { id: 'apprentice-yard', label: 'Apprentice Splicer Yard', x: YARD_SPAWN.x, y: YARD_SPAWN.y, radius: 300 },
  { id: 'master-lab', label: "Master's Lab", x: 2460, y: 566, radius: 150 },
  { id: 'debt-encounter', label: 'Old Toll Lay-by', x: 2170, y: 994, radius: 190 },
  { id: 'local-pit-route', label: 'Local Pit Road', x: 2590, y: 1432, radius: 210 },
] as const;

export const OPENING_ROUTE_WAYPOINTS = [
  { x: 1180, y: 660 },
  { x: 1560, y: 655 },
  { x: 1840, y: 655 },
  { x: 2140, y: 650 },
  { x: 2170, y: 566 },
  { x: 2460, y: 566 },
] as const;

type TreeSpec = { x: number; y: number; scale: number; sortY: number };

const P = {
  grass: '#8fb562',
  grassLight: '#a4c873',
  grassDark: '#769853',
  grassDeep: '#5f7f47',
  dirt: '#c7a66d',
  dirtLight: '#d5bb82',
  dirtDark: '#a98758',
  road: '#b89461',
  roadLight: '#cdb17a',
  roadDark: '#8d704f',
  stone: '#7f8174',
  stoneLight: '#a8aa91',
  stoneDark: '#585f56',
  wood: '#8f6846',
  woodDark: '#634a36',
  woodLight: '#b68957',
  roof: '#355f59',
  roofDark: '#274844',
  roofLight: '#4c756d',
  wall: '#d0b477',
  wallShade: '#a98c5d',
  plaster: '#ead59e',
  teal: '#4b8b81',
  tealDark: '#315f5b',
  glass: '#9fc7bb',
  glassLight: '#c7e0c8',
  water: '#60999a',
  waterDark: '#477d82',
  waterLight: '#8ec0b6',
  fence: '#9b754d',
  fenceDark: '#664e38',
  cream: '#f2dfae',
  ink: '#26382f',
  purple: '#795b7e',
  red: '#b95443',
  orange: '#d47a45',
  yellow: '#e2bd5d',
  pink: '#c97c86',
  slime: '#9cc86d',
  bone: '#dfd0aa',
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function outlineRect(ctx: CanvasRenderingContext2D, box: YardRect, fill: string, border: string, thickness = 2): void {
  rect(ctx, box.x, box.y, box.width, box.height, border);
  rect(ctx, box.x + thickness, box.y + thickness, box.width - thickness * 2, box.height - thickness * 2, fill);
}

function grassTuft(ctx: CanvasRenderingContext2D, x: number, y: number, colour = P.grassDark): void {
  rect(ctx, x, y + 5, 2, 6, colour);
  rect(ctx, x + 4, y + 2, 2, 9, colour);
  rect(ctx, x + 8, y + 6, 2, 5, colour);
  rect(ctx, x + 3, y + 8, 6, 2, colour);
}

function flower(ctx: CanvasRenderingContext2D, x: number, y: number, bloom: string): void {
  rect(ctx, x + 4, y + 6, 2, 6, P.grassDeep);
  rect(ctx, x + 2, y + 2, 4, 4, bloom);
  rect(ctx, x + 6, y + 2, 4, 4, bloom);
  rect(ctx, x + 4, y, 4, 4, bloom);
  rect(ctx, x + 4, y + 4, 4, 4, P.yellow);
}

function bush(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
  const s = scale;
  rect(ctx, x + 4 * s, y + 10 * s, 36 * s, 18 * s, P.grassDeep);
  rect(ctx, x, y + 14 * s, 44 * s, 14 * s, P.grassDeep);
  rect(ctx, x + 4 * s, y + 6 * s, 18 * s, 16 * s, P.grassDark);
  rect(ctx, x + 18 * s, y + 2 * s, 20 * s, 20 * s, P.grassDark);
  rect(ctx, x + 8 * s, y + 8 * s, 12 * s, 8 * s, P.grassLight);
  rect(ctx, x + 24 * s, y + 6 * s, 10 * s, 8 * s, P.grassLight);
}

function treeTrunk(ctx: CanvasRenderingContext2D, tree: TreeSpec): void {
  const s = tree.scale;
  rect(ctx, tree.x + 30 * s, tree.y + 55 * s, 14 * s, 34 * s, P.woodDark);
  rect(ctx, tree.x + 34 * s, tree.y + 55 * s, 10 * s, 32 * s, P.wood);
}

function treeCanopy(ctx: CanvasRenderingContext2D, tree: TreeSpec): void {
  const { x, y, scale: s } = tree;
  rect(ctx, x + 8 * s, y + 24 * s, 58 * s, 46 * s, P.grassDeep);
  rect(ctx, x, y + 34 * s, 74 * s, 30 * s, P.grassDeep);
  rect(ctx, x + 16 * s, y + 10 * s, 44 * s, 48 * s, P.grassDark);
  rect(ctx, x + 10 * s, y + 24 * s, 24 * s, 22 * s, P.grassLight);
  rect(ctx, x + 38 * s, y + 16 * s, 18 * s, 18 * s, P.grassLight);
  rect(ctx, x + 48 * s, y + 36 * s, 14 * s, 12 * s, '#85aa59');
}

function routeLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  ctx.fillStyle = P.cream;
  ctx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

const TREES: TreeSpec[] = [
  { x: 42, y: 54, scale: 1.2, sortY: 162 },
  { x: 170, y: 80, scale: 1, sortY: 169 },
  { x: 1550, y: 70, scale: 1.25, sortY: 181 },
  { x: 1450, y: 200, scale: 1, sortY: 289 },
  { x: 68, y: 876, scale: 1.25, sortY: 987 },
  { x: 260, y: 932, scale: 1, sortY: 1021 },
  { x: 1500, y: 872, scale: 1.3, sortY: 988 },
  { x: 1618, y: 720, scale: 1, sortY: 809 },
  { x: YARD_CORE_X - 30, y: YARD_CORE_Y - 10, scale: 1, sortY: YARD_CORE_Y + 79 },
  { x: YARD_CORE_X + 880, y: YARD_CORE_Y + 8, scale: 1, sortY: YARD_CORE_Y + 97 },
  { x: YARD_CORE_X + 866, y: YARD_CORE_Y + 420, scale: 1, sortY: YARD_CORE_Y + 509 },
  { x: YARD_CORE_X - 22, y: YARD_CORE_Y + 430, scale: 1, sortY: YARD_CORE_Y + 519 },
  { x: 1770, y: 360, scale: 1.05, sortY: 454 },
  { x: 1850, y: 760, scale: 1.15, sortY: 863 },
  { x: 1990, y: 250, scale: 1, sortY: 339 },
  { x: 2250, y: 690, scale: 1.2, sortY: 798 },
  { x: 2440, y: 760, scale: 1.1, sortY: 859 },
  { x: 2700, y: 880, scale: 1.25, sortY: 991 },
  { x: 1880, y: 1190, scale: 1.15, sortY: 1294 },
  { x: 2340, y: 1180, scale: 1, sortY: 1269 },
  { x: 2760, y: 1250, scale: 1.2, sortY: 1358 },
];

function drawWorldGround(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 0, 0, YARD_WORLD_WIDTH, YARD_WORLD_HEIGHT, P.grass);

  const patches = [
    [30, 30, 300, 80, P.grassLight], [420, 40, 280, 62, P.grassDark], [930, 24, 360, 82, P.grassLight],
    [1320, 40, 390, 90, P.grassDark], [20, 440, 280, 90, P.grassDark], [1420, 410, 310, 110, P.grassLight],
    [20, 810, 400, 120, P.grassLight], [560, 930, 350, 110, P.grassDark], [1040, 900, 500, 120, P.grassLight],
    [1740, 90, 430, 120, P.grassDark], [2260, 40, 520, 120, P.grassLight], [1740, 1040, 420, 130, P.grassLight],
    [2360, 930, 500, 150, P.grassDark], [1640, 1420, 430, 130, P.grassDark], [2480, 1450, 380, 100, P.grassLight],
  ] as const;
  for (const [x, y, w, h, colour] of patches) rect(ctx, x, y, w, h, colour);

  for (let x = 24; x < YARD_WORLD_WIDTH; x += 116) {
    const y = 28 + ((x * 17) % 1500);
    grassTuft(ctx, x, y);
  }
  for (let x = 88; x < YARD_WORLD_WIDTH; x += 190) {
    const y = 86 + ((x * 11) % 1400);
    flower(ctx, x, y, x % 380 === 88 ? P.pink : P.purple);
  }
}

function drawOldYardPaths(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 730, 0, 200, 300, P.dirtDark);
  rect(ctx, 744, 0, 172, 310, P.dirt);
  rect(ctx, 758, 0, 144, 316, P.dirtLight);

  rect(ctx, 260, 500, 410, 92, P.dirtDark);
  rect(ctx, 270, 508, 400, 76, P.dirt);
  rect(ctx, 282, 516, 388, 60, P.dirtLight);

  rect(ctx, 1050, 620, 520, 94, P.dirtDark);
  rect(ctx, 1050, 630, 520, 74, P.dirt);
  rect(ctx, 1050, 640, 520, 54, P.dirtLight);

  rect(ctx, 760, 740, 182, 340, P.dirtDark);
  rect(ctx, 774, 732, 154, 348, P.dirt);
  rect(ctx, 788, 726, 126, 354, P.dirtLight);
}

function drawOpeningRoute(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 1550, 606, 640, 112, P.roadDark);
  rect(ctx, 1560, 616, 620, 92, P.road);
  rect(ctx, 1572, 628, 596, 68, P.roadLight);

  rect(ctx, 2074, 430, 124, 288, P.roadDark);
  rect(ctx, 2086, 418, 100, 300, P.road);
  rect(ctx, 2100, 410, 72, 304, P.roadLight);

  rect(ctx, 2148, 512, 330, 108, P.roadDark);
  rect(ctx, 2148, 522, 330, 88, P.road);
  rect(ctx, 2148, 534, 330, 64, P.roadLight);

  rect(ctx, 2052, 680, 154, 770, P.roadDark);
  rect(ctx, 2064, 680, 130, 760, P.road);
  rect(ctx, 2078, 680, 102, 752, P.roadLight);

  rect(ctx, 2120, 1364, 800, 126, P.roadDark);
  rect(ctx, 2120, 1376, 800, 102, P.road);
  rect(ctx, 2120, 1390, 800, 74, P.roadLight);

  for (let x = 1640; x < 2040; x += 80) {
    rect(ctx, x, 648, 34, 5, P.dirtDark);
    rect(ctx, x + 42, 676, 22, 4, P.dirtDark);
  }
  for (let y = 750; y < 1320; y += 86) {
    rect(ctx, 2100, y, 38, 4, P.dirtDark);
  }
}

function drawWestQuarantine(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 74, y: 570, width: 226, height: 184 }, P.wall, P.woodDark, 5);
  rect(ctx, 86, 586, 202, 150, P.plaster);
  rect(ctx, 64, 552, 246, 30, P.roofDark);
  rect(ctx, 76, 540, 222, 20, P.roof);
  rect(ctx, 98, 532, 178, 12, P.roofLight);
  outlineRect(ctx, { x: 142, y: 656, width: 62, height: 80 }, '#735542', '#4e3b30', 4);
  rect(ctx, 210, 604, 56, 42, P.glass);
  rect(ctx, 218, 612, 40, 26, Math.floor(now / 700) % 2 ? '#9ecb7a' : '#8bbd72');
  rect(ctx, 96, 602, 28, 74, P.tealDark);
  rect(ctx, 100, 608, 20, 54, P.teal);
  rect(ctx, 106, 614, 8, 40, P.red);
  routeLabel(ctx, 'QUARANTINE', 187, 574);
  for (const [x, y] of [[330, 616], [366, 638], [322, 670]] as const) {
    outlineRect(ctx, { x, y, width: 30, height: 28 }, P.wood, P.woodDark, 3);
  }
}

function drawSouthNursery(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 1010, y: 804, width: 330, height: 176 }, P.glass, P.tealDark, 5);
  rect(ctx, 1022, 816, 306, 150, '#b8d7b0');
  for (let x = 1044; x < 1320; x += 42) rect(ctx, x, 814, 3, 152, P.teal);
  rect(ctx, 1020, 874, 310, 4, P.tealDark);
  rect(ctx, 1036, 924, 276, 20, P.wood);
  for (const x of [1052, 1102, 1152, 1202, 1252]) {
    rect(ctx, x, 890, 7, 34, P.grassDeep);
    rect(ctx, x - 8, 880, 23, 16, x % 100 === 52 ? P.purple : P.orange);
  }
  if (Math.floor(now / 650) % 2 === 0) rect(ctx, 1294, 856, 12, 12, P.pink);
}

function drawEastStream(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 1460, 240, 250, 570, P.grassDeep);
  rect(ctx, 1480, 226, 216, 600, P.waterDark);
  rect(ctx, 1492, 220, 192, 610, P.water);
  for (let y = 260; y < 810; y += 64) {
    const shift = Math.floor(now / 500) % 2 ? 8 : 0;
    rect(ctx, 1510 + shift, y, 56, 3, P.waterLight);
    rect(ctx, 1610 - shift, y + 28, 42, 3, P.waterLight);
  }
  rect(ctx, 1438, 646, 274, 18, P.woodDark);
  for (let x = 1450; x < 1700; x += 22) {
    rect(ctx, x, 638, 16, 34, P.woodLight);
    rect(ctx, x + 3, 642, 13, 26, P.wood);
  }
}

function drawCoreGround(ctx: CanvasRenderingContext2D): void {
  const ox = YARD_CORE_X;
  const oy = YARD_CORE_Y;
  rect(ctx, ox, oy, 960, 540, P.grass);
  rect(ctx, ox + 404, oy + 450, 172, 90, P.dirtDark);
  rect(ctx, ox + 414, oy + 440, 154, 100, P.dirtLight);
  rect(ctx, ox + 356, oy + 344, 198, 110, P.dirtDark);
  rect(ctx, ox + 366, oy + 350, 184, 104, P.dirt);
  rect(ctx, ox + 300, oy + 248, 178, 118, P.dirtDark);
  rect(ctx, ox + 312, oy + 252, 164, 110, P.dirtLight);
  rect(ctx, ox + 454, oy + 300, 260, 70, P.dirtDark);
  rect(ctx, ox + 464, oy + 310, 242, 50, P.dirtLight);
  rect(ctx, ox + 664, oy + 324, 122, 46, P.dirtDark);
  rect(ctx, ox + 674, oy + 334, 106, 28, P.dirtLight);
  for (const [x, y] of [[16, 104], [46, 214], [198, 272], [328, 460], [430, 224], [586, 32], [790, 238], [902, 446]] as const) {
    grassTuft(ctx, ox + x, oy + y);
  }
  flower(ctx, ox + 202, oy + 38, P.pink);
  flower(ctx, ox + 230, oy + 54, P.purple);
  flower(ctx, ox + 694, oy + 468, '#ece6b0');
}

function drawCoreWorkshop(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  rect(ctx, x + 54, y + 122, 390, 132, '#567246');
  outlineRect(ctx, { x: x + 64, y: y + 82, width: 330, height: 156 }, P.wall, P.woodDark, 4);
  rect(ctx, x + 76, y + 96, 306, 126, P.plaster);
  rect(ctx, x + 76, y + 188, 306, 34, P.wallShade);
  rect(ctx, x + 48, y + 66, 362, 26, P.roofDark);
  rect(ctx, x + 58, y + 52, 342, 24, P.roof);
  rect(ctx, x + 74, y + 42, 310, 18, P.roofLight);
  rect(ctx, x + 94, y + 36, 272, 12, P.roof);
  outlineRect(ctx, { x: x + 274, y: y + 144, width: 62, height: 78 }, '#705440', '#4e3b30', 4);
  rect(ctx, x + 284, y + 154, 42, 58, P.wood);
  rect(ctx, x + 288, y + 160, 30, 16, P.yellow);
  rect(ctx, x + 294, y + 164, 18, 4, P.ink);
  for (const wx of [94, 186]) {
    outlineRect(ctx, { x: x + wx, y: y + 118, width: 62, height: 46 }, P.glass, P.woodDark, 4);
    rect(ctx, x + wx + 8, y + 126, 46, 30, P.glassLight);
    rect(ctx, x + wx + 29, y + 124, 4, 34, P.tealDark);
  }
  outlineRect(ctx, { x: x + 366, y: y + 104, width: 116, height: 116 }, P.glass, P.tealDark, 4);
  rect(ctx, x + 374, y + 114, 100, 98, '#b9d6b1');
  for (let gx = 384; gx <= 456; gx += 24) rect(ctx, x + gx, y + 112, 3, 100, P.teal);
  rect(ctx, x + 386, y + 184, 72, 18, P.wood);
  rect(ctx, x + 394, y + 164, 6, 24, '#5c8752');
  rect(ctx, x + 388, y + 158, 18, 12, '#97c768');
  rect(ctx, x + 430, y + 168, 6, 16, '#5c8752');
  rect(ctx, x + 422, y + 158, 22, 14, P.purple);
  rect(ctx, x + 116, y + 12, 34, 38, P.woodDark);
  rect(ctx, x + 122, y + 6, 22, 42, '#705c48');
  rect(ctx, x + 330, y + 8, 14, 36, P.tealDark);
  rect(ctx, x + 340, y + 8, 44, 10, P.tealDark);
  rect(ctx, x + 376, y + 14, 10, 30, P.tealDark);
  if (Math.floor(now / 600) % 2 === 0) {
    rect(ctx, x + 408, y + 26, 8, 8, '#d6d9b2');
    rect(ctx, x + 416, y + 18, 10, 10, '#c4ceb0');
  }
  rect(ctx, x + 112, y + 194, 104, 26, P.woodDark);
  rect(ctx, x + 118, y + 198, 92, 18, P.woodLight);
  routeLabel(ctx, 'APPRENTICES', x + 164, y + 207);
}

function drawCoreProps(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  for (const [cx, cy] of [[70, 244], [106, 252], [142, 242]] as const) {
    outlineRect(ctx, { x: x + cx, y: y + cy, width: 30, height: 26 }, P.wood, P.woodDark, 3);
    rect(ctx, x + cx + 12, y + cy + 3, 4, 20, P.woodDark);
  }
  outlineRect(ctx, { x: x + 220, y: y + 240, width: 22, height: 34 }, P.teal, P.tealDark, 3);
  rect(ctx, x + 226, y + 246, 10, 18, Math.floor(now / 450) % 2 ? P.slime : '#b6d978');
  rect(ctx, x + 456, y + 244, 150, 12, P.woodDark);
  rect(ctx, x + 462, y + 234, 138, 14, P.woodLight);
  rect(ctx, x + 470, y + 256, 10, 42, P.woodDark);
  rect(ctx, x + 582, y + 256, 10, 42, P.woodDark);
  outlineRect(ctx, { x: x + 478, y: y + 202, width: 26, height: 34 }, P.glass, P.tealDark, 3);
  rect(ctx, x + 484, y + 214, 14, 16, '#a6c875');
  rect(ctx, x + 548, y + 216, 28, 20, P.bone);
  rect(ctx, x + 554, y + 210, 16, 8, P.bone);
  rect(ctx, x + 558, y + 214, 8, 4, P.pink);

  rect(ctx, x + 512, y + 62, 194, 132, '#87aa5d');
  for (const px of [510, 554, 598, 642, 686]) {
    rect(ctx, x + px, y + 60, 8, 28, P.fenceDark);
    rect(ctx, x + px, y + 174, 8, 28, P.fenceDark);
  }
  rect(ctx, x + 510, y + 70, 184, 7, P.fence);
  rect(ctx, x + 510, y + 178, 184, 7, P.fence);
  rect(ctx, x + 510, y + 74, 7, 108, P.fence);
  rect(ctx, x + 690, y + 74, 7, 108, P.fence);
  const blink = Math.floor(now / 1000) % 4 === 0;
  rect(ctx, x + 596, y + 112, 42, 24, '#ded3aa');
  rect(ctx, x + 612, y + 98, 24, 24, '#e7dbb6');
  rect(ctx, x + 612, y + 84, 7, 20, '#bcae87');
  rect(ctx, x + 628, y + 82, 7, 22, '#bcae87');
  rect(ctx, x + 602, y + 132, 8, 12, '#bcae87');
  rect(ctx, x + 626, y + 132, 8, 12, '#bcae87');
  rect(ctx, x + 592, y + 116, 8, 6, P.pink);
  rect(ctx, x + 622, y + 104, blink ? 6 : 3, blink ? 2 : 4, P.ink);

  outlineRect(ctx, { x: x + 72, y: y + 302, width: 92, height: 128 }, P.tealDark, '#32453d', 4);
  rect(ctx, x + 82, y + 312, 72, 102, P.glass);
  rect(ctx, x + 88, y + 354, 60, 54, '#8fc692');
  rect(ctx, x + 108, y + 354, 26, 24, P.pink);
  const bubbleOffset = Math.floor(now / 180) % 38;
  for (const [bx, base] of [[96, 390], [140, 378], [126, 404]] as const) {
    const by = 320 + ((base - bubbleOffset - 320 + 88) % 88);
    rect(ctx, x + bx, y + by, 5, 5, P.glassLight);
  }

  outlineRect(ctx, { x: x + 238, y: y + 392, width: 106, height: 74 }, '#8ca86d', P.fenceDark, 3);
  for (let gx = 246; gx < 336; gx += 14) rect(ctx, x + gx, y + 398, 2, 58, P.fence);
  rect(ctx, x + 274, y + 420, 26, 18, P.bone);
  rect(ctx, x + 292, y + 414, 16, 16, P.bone);
  rect(ctx, x + 300, y + 408, 5, 8, P.pink);
}

function drawCorePond(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  rect(ctx, x + 714, y + 286, 190, 160, P.grassDeep);
  rect(ctx, x + 698, y + 304, 222, 126, P.grassDeep);
  rect(ctx, x + 724, y + 294, 172, 142, P.waterDark);
  rect(ctx, x + 708, y + 314, 204, 104, P.waterDark);
  rect(ctx, x + 732, y + 300, 156, 126, P.water);
  rect(ctx, x + 716, y + 320, 188, 88, P.water);
  const shift = Math.floor(now / 500) % 2 ? 6 : 0;
  for (const [wx, wy, w] of [[748, 314, 34], [824, 330, 46], [770, 382, 40], [852, 398, 24]] as const) {
    rect(ctx, x + wx + shift, y + wy, w, 3, P.waterLight);
  }
  rect(ctx, x + 684, y + 344, 96, 14, P.woodDark);
  for (let bx = 690; bx < 776; bx += 14) {
    rect(ctx, x + bx, y + 338, 10, 26, P.woodLight);
    rect(ctx, x + bx + 2, y + 340, 8, 20, P.wood);
  }
}

function drawCorePlants(ctx: CanvasRenderingContext2D, now: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  rect(ctx, x + 836, y + 172, 86, 48, P.grassDeep);
  for (const px of [850, 870, 892]) {
    rect(ctx, x + px, y + 178, 5, 34, P.purple);
    rect(ctx, x + px - 5, y + 182, 10, 6, '#9a6f9d');
    rect(ctx, x + px + 2, y + 194, 12, 6, '#9a6f9d');
  }
  if (Math.floor(now / 700) % 2 === 0) rect(ctx, x + 898, y + 168, 12, 10, P.pink);
  rect(ctx, x + 620, y + 394, 6, 30, P.grassDeep);
  rect(ctx, x + 608, y + 382, 30, 20, '#7fa652');
  rect(ctx, x + 614, y + 374, 18, 14, P.orange);
  rect(ctx, x + 620, y + 370, 6, 8, P.yellow);
}

function drawAmbientDetail(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y] of [[420, 126], [488, 154], [1340, 240], [1376, 268], [434, 874], [474, 908], [1760, 520], [1870, 470], [2290, 810], [2540, 1080], [2680, 1120]] as const) {
    bush(ctx, x, y);
  }
  outlineRect(ctx, { x: 1240, y: 130, width: 124, height: 78 }, '#92ad68', P.fenceDark, 3);
  for (let x = 1250; x < 1350; x += 18) rect(ctx, x, 138, 2, 60, P.fence);
  rect(ctx, 1280, 160, 30, 22, P.bone);
  rect(ctx, 1302, 150, 18, 16, P.bone);
  if (Math.floor(now / 820) % 2 === 0) rect(ctx, 1312, 154, 3, 3, P.ink);
  for (const [x, y, colour] of [[548, 942, P.purple], [588, 962, P.orange], [1374, 842, P.pink], [1420, 864, P.yellow], [1810, 735, P.purple], [1990, 790, P.orange], [2390, 1070, P.pink], [2660, 1330, P.yellow]] as const) {
    flower(ctx, x, y, colour);
  }
}

function drawRouteFurniture(ctx: CanvasRenderingContext2D): void {
  for (const x of [1740, 1900, 2010]) {
    rect(ctx, x, 574, 8, 58, P.fenceDark);
    rect(ctx, x + 4, 574, 5, 58, P.fence);
    rect(ctx, x + 8, 584, 72, 5, P.fence);
  }
  outlineRect(ctx, { x: 1826, y: 568, width: 118, height: 48 }, P.roof, P.woodDark, 3);
  routeLabel(ctx, 'LAB  →', 1885, 592);

  for (const y of [760, 930, 1100, 1270]) {
    rect(ctx, 2014, y, 8, 74, P.woodDark);
    rect(ctx, 2200, y, 8, 74, P.woodDark);
    rect(ctx, 2020, y + 12, 180, 5, P.fence);
    rect(ctx, 2020, y + 48, 180, 5, P.fence);
  }

  outlineRect(ctx, { x: 2190, y: 1308, width: 146, height: 54 }, P.red, P.woodDark, 4);
  routeLabel(ctx, 'LOCAL PIT  →', 2263, 1335);
}

function drawMasterLabExterior(ctx: CanvasRenderingContext2D, now: number): void {
  const x = 2240;
  const y = 174;
  rect(ctx, x + 22, y + 62, 474, 300, '#597359');
  outlineRect(ctx, { x, y: y + 30, width: 520, height: 320 }, P.wallShade, P.woodDark, 6);
  rect(ctx, x + 12, y + 44, 496, 292, P.plaster);
  rect(ctx, x - 18, y + 10, 556, 40, P.roofDark);
  rect(ctx, x, y - 4, 520, 28, P.roof);
  rect(ctx, x + 32, y - 16, 456, 18, P.roofLight);

  rect(ctx, x + 74, y - 58, 38, 54, P.woodDark);
  rect(ctx, x + 84, y - 68, 20, 58, '#6f604c');
  rect(ctx, x + 382, y - 36, 18, 30, P.tealDark);
  rect(ctx, x + 398, y - 34, 54, 12, P.tealDark);
  rect(ctx, x + 442, y - 26, 12, 30, P.tealDark);
  if (Math.floor(now / 650) % 2 === 0) {
    rect(ctx, x + 462, y - 62, 8, 8, '#cdd7bb');
    rect(ctx, x + 474, y - 76, 11, 11, '#b6c9b0');
  }

  for (const wx of [48, 158, 352, 430]) {
    outlineRect(ctx, { x: x + wx, y: y + 92, width: 72, height: 68 }, P.glass, P.tealDark, 4);
    rect(ctx, x + wx + 8, y + 100, 56, 52, P.glassLight);
    rect(ctx, x + wx + 34, y + 98, 4, 56, P.tealDark);
  }

  outlineRect(ctx, { x: x + 214, y: y + 160, width: 104, height: 176 }, '#76513e', '#4a382f', 6);
  rect(ctx, x + 226, y + 172, 80, 152, P.wood);
  rect(ctx, x + 240, y + 188, 52, 30, P.yellow);
  routeLabel(ctx, 'MASTER', x + 266, y + 203);
  rect(ctx, x + 292, y + 252, 7, 7, P.ink);

  outlineRect(ctx, { x: x + 44, y: y + 192, width: 122, height: 118 }, P.tealDark, '#32453d', 4);
  rect(ctx, x + 54, y + 202, 102, 98, P.glass);
  rect(ctx, x + 64, y + 258, 82, 32, Math.floor(now / 520) % 2 ? '#88bc79' : '#98c985');
  rect(ctx, x + 86, y + 226, 32, 40, P.pink);

  outlineRect(ctx, { x: x + 360, y: y + 194, width: 112, height: 116 }, P.glass, P.tealDark, 4);
  rect(ctx, x + 370, y + 204, 92, 96, '#a8cfad');
  for (let gx = x + 378; gx < x + 460; gx += 18) rect(ctx, gx, y + 204, 2, 96, P.teal);

  outlineRect(ctx, { x: x + 164, y: y + 44, width: 192, height: 36 }, P.roof, P.woodDark, 4);
  routeLabel(ctx, "SPLICENSTEIN LAB", x + 260, y + 62);
}

function drawDebtEncounterLayby(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 1840, y: 842, width: 466, height: 250 }, P.stone, P.stoneDark, 6);
  rect(ctx, 1852, 854, 442, 226, P.stoneLight);
  for (let x = 1870; x < 2280; x += 54) {
    rect(ctx, x, 878 + ((x / 54) % 3) * 46, 20, 4, P.stone);
  }
  rect(ctx, 1940, 916, 250, 8, P.stoneDark);
  rect(ctx, 1940, 1012, 250, 8, P.stoneDark);

  for (const x of [1880, 2252]) {
    rect(ctx, x, 884, 12, 122, P.woodDark);
    rect(ctx, x + 4, 884, 8, 122, P.wood);
    rect(ctx, x - 12, 884, 38, 10, P.roofDark);
    rect(ctx, x - 8, 996, 30, 12, P.stoneDark);
  }

  outlineRect(ctx, { x: 1958, y: 940, width: 72, height: 46 }, P.wood, P.woodDark, 4);
  rect(ctx, 1968, 950, 52, 26, P.red);
  rect(ctx, 2068, 944, 128, 18, P.woodDark);
  rect(ctx, 2078, 962, 10, 34, P.woodDark);
  rect(ctx, 2176, 962, 10, 34, P.woodDark);
  if (Math.floor(now / 900) % 2 === 0) rect(ctx, 1884, 908, 4, 8, P.yellow);

  outlineRect(ctx, { x: 2038, y: 866, width: 126, height: 40 }, P.stoneDark, P.woodDark, 3);
  routeLabel(ctx, 'OLD TOLL', 2101, 886);
}

function drawPitRoadApproach(ctx: CanvasRenderingContext2D, now: number): void {
  for (let x = 2340; x < 2900; x += 54) {
    rect(ctx, x, 1324, 8, 50, P.fenceDark);
    rect(ctx, x + 3, 1324, 5, 50, P.fence);
    rect(ctx, x, 1482, 8, 50, P.fenceDark);
    rect(ctx, x + 3, 1482, 5, 50, P.fence);
  }
  rect(ctx, 2360, 1336, 500, 5, P.fence);
  rect(ctx, 2360, 1518, 500, 5, P.fence);

  outlineRect(ctx, { x: 2544, y: 1300, width: 172, height: 56 }, P.red, P.woodDark, 5);
  routeLabel(ctx, 'LOCAL PIT  0.4 km', 2630, 1328);

  rect(ctx, 2820, 1386, 18, 82, P.woodDark);
  rect(ctx, 2860, 1386, 18, 82, P.woodDark);
  rect(ctx, 2820, 1392, 58, 10, P.red);
  rect(ctx, 2820, 1454, 58, 10, P.red);
  if (Math.floor(now / 600) % 2 === 0) {
    rect(ctx, 2830, 1406, 8, 8, P.yellow);
    rect(ctx, 2860, 1406, 8, 8, P.yellow);
  }
}

export const YARD_COLLIDERS: readonly YardRect[] = [
  { x: YARD_CORE_X + 54, y: YARD_CORE_Y + 74, width: 430, height: 172 },
  { x: YARD_CORE_X + 60, y: YARD_CORE_Y + 234, width: 190, height: 50 },
  { x: YARD_CORE_X + 452, y: YARD_CORE_Y + 228, width: 158, height: 76 },
  { x: YARD_CORE_X + 506, y: YARD_CORE_Y + 54, width: 198, height: 136 },
  { x: YARD_CORE_X + 68, y: YARD_CORE_Y + 298, width: 164, height: 148 },
  { x: YARD_CORE_X + 234, y: YARD_CORE_Y + 388, width: 114, height: 82 },
  { x: YARD_CORE_X + 720, y: YARD_CORE_Y + 286, width: 190, height: 52 },
  { x: YARD_CORE_X + 780, y: YARD_CORE_Y + 336, width: 130, height: 36 },
  { x: YARD_CORE_X + 720, y: YARD_CORE_Y + 372, width: 190, height: 70 },
  { x: 70, y: 548, width: 236, height: 210 },
  { x: 1006, y: 800, width: 338, height: 184 },
  { x: 1236, y: 126, width: 132, height: 86 },
  { x: 1480, y: 220, width: 216, height: 410 },
  { x: 1480, y: 674, width: 216, height: 156 },
  { x: 2234, y: 150, width: 532, height: 372 },
  { x: 1834, y: 836, width: 472, height: 24 },
  { x: 1834, y: 1074, width: 472, height: 24 },
  { x: 1834, y: 860, width: 26, height: 214 },
  { x: 2280, y: 860, width: 26, height: 214 },
  { x: 1952, y: 934, width: 84, height: 58 },
  { x: 2062, y: 938, width: 138, height: 66 },
  { x: 2810, y: 1378, width: 78, height: 98 },
];

function overlaps(a: YardRect, b: YardRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function isYardPositionBlocked(feetX: number, feetY: number): boolean {
  const hitbox: YardRect = { x: feetX - 11, y: feetY - 13, width: 22, height: 15 };
  if (hitbox.x < 12 || hitbox.y < 12 || hitbox.x + hitbox.width > YARD_WORLD_WIDTH - 12 || hitbox.y + hitbox.height > YARD_WORLD_HEIGHT - 12) {
    return true;
  }
  if (YARD_COLLIDERS.some((collider) => overlaps(hitbox, collider))) return true;
  for (const tree of TREES) {
    const s = tree.scale;
    const trunk: YardRect = { x: tree.x + 26 * s, y: tree.y + 60 * s, width: 26 * s, height: 30 * s };
    if (overlaps(hitbox, trunk)) return true;
  }
  return false;
}

export function nearestOpeningRouteLandmark(feetX: number, feetY: number): OpeningRouteLandmark | null {
  let nearest: OpeningRouteLandmark | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const landmark of OPENING_ROUTE_LANDMARKS) {
    const distance = Math.hypot(feetX - landmark.x, feetY - landmark.y);
    if (distance <= landmark.radius && distance < nearestDistance) {
      nearest = landmark;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function drawApprenticeSplicerYardBase(ctx: CanvasRenderingContext2D, now: number, playerFeetY: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawWorldGround(ctx);
  drawOldYardPaths(ctx);
  drawOpeningRoute(ctx);
  drawEastStream(ctx, now);
  drawWestQuarantine(ctx, now);
  drawSouthNursery(ctx, now);
  drawCoreGround(ctx);
  drawCoreWorkshop(ctx, now);
  drawCoreProps(ctx, now);
  drawCorePond(ctx, now);
  drawCorePlants(ctx, now);
  drawAmbientDetail(ctx, now);
  drawRouteFurniture(ctx);
  drawMasterLabExterior(ctx, now);
  drawDebtEncounterLayby(ctx, now);
  drawPitRoadApproach(ctx, now);

  for (const tree of TREES) treeTrunk(ctx, tree);
  for (const tree of TREES) {
    if (tree.sortY <= playerFeetY) treeCanopy(ctx, tree);
  }
  ctx.restore();
}

export function drawApprenticeSplicerYardForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const tree of TREES) {
    if (tree.sortY > playerFeetY) treeCanopy(ctx, tree);
  }
  rect(ctx, 0, YARD_WORLD_HEIGHT - 20, YARD_WORLD_WIDTH, 20, P.grassDeep);
  ctx.restore();
}
