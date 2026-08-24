export const YARD_WIDTH = 960;
export const YARD_HEIGHT = 540;

type YardRenderOptions = {
  protagonistImage: HTMLImageElement;
  playerName: string;
  now: number;
};

type Rect = { x: number; y: number; width: number; height: number };

const P = {
  grass: '#8fb562',
  grassLight: '#a4c873',
  grassDark: '#769853',
  grassDeep: '#5f7f47',
  dirt: '#c7a66d',
  dirtLight: '#d5bb82',
  dirtDark: '#a98758',
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

function outlineRect(ctx: CanvasRenderingContext2D, box: Rect, fill: string, border: string, thickness = 2): void {
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

function tree(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
  const s = scale;
  rect(ctx, x + 30 * s, y + 55 * s, 14 * s, 34 * s, P.woodDark);
  rect(ctx, x + 34 * s, y + 55 * s, 10 * s, 32 * s, P.wood);
  rect(ctx, x + 8 * s, y + 24 * s, 58 * s, 46 * s, P.grassDeep);
  rect(ctx, x, y + 34 * s, 74 * s, 30 * s, P.grassDeep);
  rect(ctx, x + 16 * s, y + 10 * s, 44 * s, 48 * s, P.grassDark);
  rect(ctx, x + 10 * s, y + 24 * s, 24 * s, 22 * s, P.grassLight);
  rect(ctx, x + 38 * s, y + 16 * s, 18 * s, 18 * s, P.grassLight);
  rect(ctx, x + 48 * s, y + 36 * s, 14 * s, 12 * s, '#85aa59');
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 0, 0, YARD_WIDTH, YARD_HEIGHT, P.grass);

  const lightPatches = [
    [24, 40, 86, 26], [412, 18, 130, 24], [706, 28, 122, 26], [810, 210, 124, 22],
    [40, 250, 104, 28], [246, 408, 138, 20], [594, 442, 126, 26], [752, 472, 146, 20],
  ] as const;
  for (const [x, y, w, h] of lightPatches) rect(ctx, x, y, w, h, P.grassLight);

  const darkPatches = [
    [0, 188, 118, 20], [350, 246, 116, 20], [590, 202, 96, 22], [834, 96, 126, 28],
    [78, 472, 132, 24], [416, 494, 134, 24], [670, 232, 90, 18],
  ] as const;
  for (const [x, y, w, h] of darkPatches) rect(ctx, x, y, w, h, P.grassDark);

  const tufts = [
    [16, 104], [46, 214], [150, 28], [198, 272], [272, 32], [328, 460], [430, 224],
    [528, 278], [586, 32], [644, 250], [732, 74], [790, 238], [910, 176], [902, 446],
    [210, 500], [564, 478], [746, 500], [386, 370],
  ] as const;
  for (const [x, y] of tufts) grassTuft(ctx, x, y);

  flower(ctx, 202, 38, P.pink);
  flower(ctx, 230, 54, P.purple);
  flower(ctx, 694, 468, '#ece6b0');
  flower(ctx, 716, 482, P.pink);
  flower(ctx, 872, 238, P.purple);
  flower(ctx, 112, 276, '#d9e48b');
}

function drawPath(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 404, 450, 172, 90, P.dirtDark);
  rect(ctx, 414, 440, 154, 100, P.dirt);
  rect(ctx, 424, 438, 134, 102, P.dirtLight);

  rect(ctx, 356, 344, 198, 110, P.dirtDark);
  rect(ctx, 366, 350, 184, 104, P.dirt);
  rect(ctx, 380, 356, 158, 92, P.dirtLight);

  rect(ctx, 300, 248, 178, 118, P.dirtDark);
  rect(ctx, 312, 252, 164, 110, P.dirt);
  rect(ctx, 326, 256, 138, 102, P.dirtLight);

  rect(ctx, 454, 300, 260, 70, P.dirtDark);
  rect(ctx, 460, 306, 252, 58, P.dirt);
  rect(ctx, 468, 312, 238, 46, P.dirtLight);

  rect(ctx, 664, 324, 122, 46, P.dirtDark);
  rect(ctx, 670, 330, 116, 34, P.dirt);
  rect(ctx, 676, 334, 104, 26, P.dirtLight);

  const stones = [
    [440, 474], [512, 462], [398, 416], [482, 390], [346, 322], [424, 282],
    [528, 326], [616, 338], [696, 348],
  ] as const;
  for (const [x, y] of stones) {
    rect(ctx, x, y, 12, 6, '#b19463');
    rect(ctx, x + 2, y, 8, 2, '#d9c490');
  }
}

function drawWorkshop(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 54, 122, 390, 132, '#567246');
  outlineRect(ctx, { x: 64, y: 82, width: 330, height: 156 }, P.wall, P.woodDark, 4);
  rect(ctx, 76, 96, 306, 126, P.plaster);
  rect(ctx, 76, 188, 306, 34, P.wallShade);

  rect(ctx, 48, 66, 362, 26, P.roofDark);
  rect(ctx, 58, 52, 342, 24, P.roof);
  rect(ctx, 74, 42, 310, 18, P.roofLight);
  rect(ctx, 94, 36, 272, 12, P.roof);
  rect(ctx, 118, 32, 224, 8, P.roofDark);
  for (let x = 74; x < 386; x += 30) rect(ctx, x, 58, 18, 3, '#6f9184');

  rect(ctx, 116, 12, 34, 38, P.woodDark);
  rect(ctx, 122, 6, 22, 42, '#705c48');
  rect(ctx, 118, 4, 30, 8, '#493e35');
  rect(ctx, 330, 8, 14, 36, P.tealDark);
  rect(ctx, 340, 8, 44, 10, P.tealDark);
  rect(ctx, 376, 14, 10, 30, P.tealDark);
  rect(ctx, 380, 38, 28, 8, P.teal);
  rect(ctx, 402, 36, 8, 18, P.tealDark);
  if (Math.floor(now / 600) % 2 === 0) {
    rect(ctx, 408, 26, 8, 8, '#d6d9b2');
    rect(ctx, 416, 18, 10, 10, '#c4ceb0');
  }

  outlineRect(ctx, { x: 274, y: 144, width: 62, height: 78 }, '#705440', '#4e3b30', 4);
  rect(ctx, 284, 154, 42, 58, '#8f6846');
  rect(ctx, 318, 182, 5, 5, P.yellow);
  rect(ctx, 288, 160, 30, 16, P.yellow);
  rect(ctx, 294, 164, 18, 4, P.ink);
  rect(ctx, 302, 160, 4, 16, P.ink);

  for (const x of [94, 186]) {
    outlineRect(ctx, { x, y: 118, width: 62, height: 46 }, P.glass, P.woodDark, 4);
    rect(ctx, x + 8, 126, 46, 30, P.glassLight);
    rect(ctx, x + 29, 124, 4, 34, P.tealDark);
    rect(ctx, x + 6, 139, 50, 4, P.tealDark);
  }

  outlineRect(ctx, { x: 366, y: 104, width: 116, height: 116 }, P.glass, P.tealDark, 4);
  rect(ctx, 374, 114, 100, 98, '#b9d6b1');
  for (let x = 384; x <= 456; x += 24) rect(ctx, x, 112, 3, 100, P.teal);
  rect(ctx, 374, 154, 100, 3, P.teal);
  rect(ctx, 386, 184, 72, 18, P.wood);
  rect(ctx, 394, 164, 6, 24, '#5c8752');
  rect(ctx, 388, 158, 18, 12, '#97c768');
  rect(ctx, 430, 168, 6, 16, '#5c8752');
  rect(ctx, 422, 158, 22, 14, P.purple);
  rect(ctx, 454, 174, 5, 12, '#5c8752');
  rect(ctx, 448, 166, 18, 12, P.pink);

  rect(ctx, 452, 216, 6, 28, P.tealDark);
  rect(ctx, 458, 238, 34, 6, P.tealDark);
  outlineRect(ctx, { x: 486, y: 226, width: 34, height: 30 }, '#7e7354', '#574b38', 3);
  rect(ctx, 494, 232, 6, 18, P.yellow);
  rect(ctx, 504, 232, 8, 8, P.red);

  rect(ctx, 112, 194, 104, 26, P.woodDark);
  rect(ctx, 118, 198, 92, 18, P.woodLight);
  ctx.fillStyle = P.ink;
  ctx.font = '700 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('APPRENTICES', 164, 207);
}

function drawCratesAndBench(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y] of [[70, 244], [106, 252], [142, 242]] as const) {
    outlineRect(ctx, { x, y, width: 30, height: 26 }, P.wood, P.woodDark, 3);
    rect(ctx, x + 5, y + 6, 20, 3, P.woodLight);
    rect(ctx, x + 12, y + 3, 4, 20, P.woodDark);
  }

  outlineRect(ctx, { x: 184, y: 238, width: 28, height: 38 }, '#8d7251', P.woodDark, 3);
  rect(ctx, 184, 247, 28, 4, P.woodDark);
  rect(ctx, 184, 264, 28, 4, P.woodDark);
  outlineRect(ctx, { x: 220, y: 240, width: 22, height: 34 }, P.teal, P.tealDark, 3);
  rect(ctx, 226, 246, 10, 18, Math.floor(now / 450) % 2 ? P.slime : '#b6d978');

  rect(ctx, 456, 244, 150, 12, P.woodDark);
  rect(ctx, 462, 234, 138, 14, P.woodLight);
  rect(ctx, 470, 256, 10, 42, P.woodDark);
  rect(ctx, 582, 256, 10, 42, P.woodDark);
  outlineRect(ctx, { x: 478, y: 202, width: 26, height: 34 }, P.glass, P.tealDark, 3);
  rect(ctx, 484, 214, 14, 16, '#a6c875');
  rect(ctx, 488, 206, 6, 8, P.pink);
  outlineRect(ctx, { x: 514, y: 208, width: 24, height: 28 }, P.glassLight, P.tealDark, 3);
  rect(ctx, 520, 218, 12, 12, P.purple);
  rect(ctx, 548, 216, 28, 20, P.bone);
  rect(ctx, 554, 210, 16, 8, P.bone);
  rect(ctx, 558, 214, 8, 4, P.pink);
  rect(ctx, 572, 232, 18, 4, '#f1e8c4');
}

function drawPen(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 512, 62, 194, 132, '#87aa5d');

  const posts = [
    [510, 60], [554, 60], [598, 60], [642, 60], [686, 60],
    [510, 174], [554, 174], [598, 174], [642, 174], [686, 174],
  ] as const;
  for (const [x, y] of posts) {
    rect(ctx, x, y, 8, 28, P.fenceDark);
    rect(ctx, x + 2, y - 4, 4, 8, P.fence);
  }
  rect(ctx, 510, 70, 184, 7, P.fence);
  rect(ctx, 510, 178, 184, 7, P.fence);
  for (const x of [510, 690]) {
    rect(ctx, x, 74, 7, 108, P.fence);
    rect(ctx, x + (x === 510 ? 7 : -2), 112, 2, 32, P.fenceDark);
  }

  outlineRect(ctx, { x: 526, y: 134, width: 52, height: 24 }, '#796047', P.woodDark, 3);
  rect(ctx, 532, 140, 40, 10, P.dirtLight);
  outlineRect(ctx, { x: 654, y: 142, width: 22, height: 12 }, P.water, P.waterDark, 2);

  const blink = Math.floor(now / 1000) % 4 === 0;
  rect(ctx, 596, 112, 42, 24, '#ded3aa');
  rect(ctx, 612, 98, 24, 24, '#e7dbb6');
  rect(ctx, 612, 84, 7, 20, '#bcae87');
  rect(ctx, 628, 82, 7, 22, '#bcae87');
  rect(ctx, 602, 132, 8, 12, '#bcae87');
  rect(ctx, 626, 132, 8, 12, '#bcae87');
  rect(ctx, 592, 116, 8, 6, P.pink);
  rect(ctx, 588, 108, 8, 6, '#ded3aa');
  rect(ctx, 584, 102, 8, 6, '#ded3aa');
  rect(ctx, 636, 116, 8, 6, '#ded3aa');
  rect(ctx, 642, 108, 8, 6, '#ded3aa');
  rect(ctx, 622, 104, blink ? 6 : 3, blink ? 2 : 4, P.ink);
  rect(ctx, 632, 106, 4, 3, P.pink);

  rect(ctx, 520, 86, 34, 34, P.cream);
  rect(ctx, 528, 82, 18, 6, P.woodDark);
  for (let i = 0; i < 4; i += 1) rect(ctx, 526 + i * 6, 94, 2, 16, P.red);
  rect(ctx, 522, 116, 30, 3, P.wood);
}

function drawTank(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 72, y: 302, width: 92, height: 128 }, P.tealDark, '#32453d', 4);
  rect(ctx, 82, 312, 72, 102, P.glass);
  rect(ctx, 88, 318, 60, 90, '#7eb6a3');
  rect(ctx, 88, 354, 60, 54, '#8fc692');

  rect(ctx, 108, 354, 26, 24, P.pink);
  rect(ctx, 102, 362, 14, 14, '#d3979b');
  rect(ctx, 126, 348, 10, 10, '#d3979b');
  rect(ctx, 114, 374, 8, 12, '#aa6c78');

  const bubbleOffset = Math.floor(now / 180) % 38;
  for (const [x, base] of [[96, 390], [140, 378], [126, 404]] as const) {
    const y = 320 + ((base - bubbleOffset - 320 + 88) % 88);
    rect(ctx, x, y, 5, 5, P.glassLight);
  }

  rect(ctx, 84, 420, 68, 12, '#4d5b4c');
  rect(ctx, 92, 428, 14, 14, P.woodDark);
  rect(ctx, 132, 428, 14, 14, P.woodDark);

  rect(ctx, 164, 330, 32, 6, P.purple);
  rect(ctx, 190, 330, 6, 48, P.purple);
  outlineRect(ctx, { x: 184, y: 374, width: 42, height: 34 }, '#7f7557', P.woodDark, 3);
  rect(ctx, 194, 382, 12, 12, Math.floor(now / 320) % 2 ? P.yellow : P.orange);
}

function drawPondAndBridge(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 714, 286, 190, 160, P.grassDeep);
  rect(ctx, 698, 304, 222, 126, P.grassDeep);
  rect(ctx, 726, 274, 154, 174, P.grassDeep);

  rect(ctx, 724, 294, 172, 142, P.waterDark);
  rect(ctx, 708, 314, 204, 104, P.waterDark);
  rect(ctx, 736, 286, 132, 154, P.waterDark);

  rect(ctx, 732, 300, 156, 126, P.water);
  rect(ctx, 716, 320, 188, 88, P.water);
  rect(ctx, 744, 292, 116, 140, P.water);

  const shift = Math.floor(now / 500) % 2 === 0 ? 0 : 6;
  for (const [x, y, w] of [[748, 314, 34], [824, 330, 46], [770, 382, 40], [852, 398, 24]] as const) {
    rect(ctx, x + shift, y, w, 3, P.waterLight);
  }

  rect(ctx, 848, 360, 28, 8, P.grassDeep);
  rect(ctx, 854, 354, 18, 8, P.grassDark);
  rect(ctx, 858, 346, 8, 10, P.purple);
  rect(ctx, 862, 342, 8, 8, P.pink);
  rect(ctx, 780, 404, 24, 8, P.grassDark);
  rect(ctx, 786, 398, 12, 6, P.grassLight);

  rect(ctx, 684, 344, 96, 14, P.woodDark);
  for (let x = 690; x < 776; x += 14) {
    rect(ctx, x, 338, 10, 26, P.woodLight);
    rect(ctx, x + 2, 340, 8, 20, P.wood);
  }
  rect(ctx, 684, 336, 6, 32, P.fenceDark);
  rect(ctx, 776, 336, 6, 32, P.fenceDark);
}

function drawStrangePlants(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 836, 172, 86, 48, P.grassDeep);
  for (const x of [850, 870, 892]) {
    rect(ctx, x, 178, 5, 34, P.purple);
    rect(ctx, x - 5, 182, 10, 6, '#9a6f9d');
    rect(ctx, x + 2, 194, 12, 6, '#9a6f9d');
  }
  if (Math.floor(now / 700) % 2 === 0) rect(ctx, 898, 168, 12, 10, P.pink);

  rect(ctx, 620, 394, 6, 30, P.grassDeep);
  rect(ctx, 608, 382, 30, 20, '#7fa652');
  rect(ctx, 614, 374, 18, 14, P.orange);
  rect(ctx, 620, 370, 6, 8, P.yellow);
  rect(ctx, 603, 398, 14, 6, P.grassDark);
  rect(ctx, 629, 400, 16, 6, P.grassDark);
}

function drawBoundaryVegetation(ctx: CanvasRenderingContext2D): void {
  tree(ctx, -18, -4, 1);
  tree(ctx, 880, 8, 1);
  tree(ctx, 866, 420, 1);
  tree(ctx, -18, 432, 1);
  bush(ctx, 4, 178, 1);
  bush(ctx, 870, 246, 1);
  bush(ctx, 248, 484, 1);
  bush(ctx, 640, 496, 1);
}

function drawSmallContainmentCage(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 238, y: 392, width: 106, height: 74 }, '#8ca86d', P.fenceDark, 3);
  for (let x = 246; x < 336; x += 14) rect(ctx, x, 398, 2, 58, P.fence);
  for (let y = 408; y < 458; y += 14) rect(ctx, 244, y, 94, 2, P.fence);
  rect(ctx, 274, 420, 26, 18, P.bone);
  rect(ctx, 292, 414, 16, 16, P.bone);
  rect(ctx, 300, 408, 5, 8, P.pink);
  rect(ctx, 306, 410, 5, 6, P.pink);
  if (Math.floor(now / 850) % 2 === 0) rect(ctx, 298, 420, 3, 3, P.ink);
  rect(ctx, 320, 438, 12, 12, P.red);
  rect(ctx, 323, 441, 6, 6, P.yellow);
}

function drawPlayer(ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerName: string): void {
  const x = 508;
  const y = 382;
  const width = 64;
  const height = 96;

  ctx.fillStyle = 'rgba(38,56,47,0.28)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height - 8, 23, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, x, y, width, height);

  rect(ctx, 574, 430, 82, 28, P.woodDark);
  rect(ctx, 578, 434, 74, 20, P.cream);
  ctx.fillStyle = P.ink;
  ctx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(playerName.slice(0, 12), 615, 444);
  rect(ctx, 612, 454, 5, 18, P.woodDark);
}

function drawForegroundBits(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 0, 510, 128, 30, P.grassDeep);
  rect(ctx, 832, 514, 128, 26, P.grassDeep);
  rect(ctx, 20, 500, 74, 28, P.grassDark);
  rect(ctx, 866, 500, 72, 30, P.grassDark);
}

export function drawApprenticeSplicerYard(
  ctx: CanvasRenderingContext2D,
  options: YardRenderOptions,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  drawGround(ctx);
  drawPath(ctx);
  drawWorkshop(ctx, options.now);
  drawCratesAndBench(ctx, options.now);
  drawPen(ctx, options.now);
  drawTank(ctx, options.now);
  drawPondAndBridge(ctx, options.now);
  drawStrangePlants(ctx, options.now);
  drawSmallContainmentCage(ctx, options.now);
  drawBoundaryVegetation(ctx);
  drawPlayer(ctx, options.protagonistImage, options.playerName);
  drawForegroundBits(ctx);

  ctx.restore();
}
