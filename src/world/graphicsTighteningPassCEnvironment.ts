import { YARD_CORE_X, YARD_CORE_Y, OPENING_ROUTE_LANDMARKS } from './yard.js';

export const GRAPHICS_TIGHTENING_PASS_C_ENVIRONMENT_CONTRACT = {
  qualityReference: 'approved-protagonist-sprites',
  treatment: 'focal-composition-depth-and-hero-object-pass',
  geometryChange: false,
  collisionChange: false,
  locations: ['yard', 'route', 'master-lab', 'local-pit'] as const,
  rules: [
    'preserve-pass-b-material-detail',
    'strengthen-focal-hierarchy',
    'add-stepped-light-and-contact-depth',
    'use-irregular-authored-silhouettes',
    'dark-state-changes-objects-not-only-colour',
    'keep-navigation-and-player-readability-clear',
  ] as const,
} as const;

const debtLandmark = OPENING_ROUTE_LANDMARKS.find((entry) => entry.id === 'debt-encounter');
if (!debtLandmark) throw new Error('Pass C environment art requires the debt encounter landmark.');

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
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

function polygon(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  colour: string,
): void {
  const first = points[0];
  if (!first || points.length < 3) return;
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(Math.round(first[0]), Math.round(first[1]));
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    if (point) ctx.lineTo(Math.round(point[0]), Math.round(point[1]));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function alpha(ctx: CanvasRenderingContext2D, value: number, draw: () => void): void {
  ctx.save();
  ctx.globalAlpha = value;
  draw();
  ctx.restore();
}

function steppedPool(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  colour: string,
  strength: number,
): void {
  alpha(ctx, strength, () => {
    rect(ctx, x + width * 0.24, y, width * 0.52, 8, colour);
    rect(ctx, x + width * 0.15, y + 8, width * 0.70, 9, colour);
    rect(ctx, x + width * 0.08, y + 17, width * 0.84, 10, colour);
    rect(ctx, x, y + 27, width, 10, colour);
  });
}

function drawYardWorkshopHero(ctx: CanvasRenderingContext2D, now: number, darkMix: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  // Uneven corrugated canopy and deep under-eave shadow give the workshop a
  // hand-built silhouette rather than a clean level-editor rectangle.
  polygon(ctx, [
    [x + 48, y + 64], [x + 392, y + 64], [x + 386, y + 81],
    [x + 336, y + 78], [x + 302, y + 86], [x + 240, y + 80],
    [x + 188, y + 89], [x + 126, y + 82], [x + 72, y + 88],
  ], '#4a5149');
  rect(ctx, x + 58, y + 82, 322, 10, '#2f3a36');
  for (let sx = x + 70; sx < x + 370; sx += 36) {
    rect(ctx, sx, y + 67 + ((sx / 36) % 2 ? 2 : 0), 18, 4, '#7d8174');
    rect(ctx, sx + 4, y + 71, 3, 12, '#5a625a');
  }

  // Purposeful hero workbench silhouette with tools, hanging cable and lamp.
  rect(ctx, x + 118, y + 198, 218, 12, '#563f31');
  rect(ctx, x + 132, y + 210, 12, 46, '#47352b');
  rect(ctx, x + 306, y + 210, 12, 46, '#47352b');
  rect(ctx, x + 154, y + 187, 30, 11, '#6a7169');
  rect(ctx, x + 194, y + 184, 7, 14, '#b16c45');
  rect(ctx, x + 213, y + 181, 5, 17, '#9ea990');
  rect(ctx, x + 238, y + 188, 42, 8, '#445b56');
  line(ctx, x + 272, y + 91, x + 264, y + 154, '#3f4945', 4);
  line(ctx, x + 264, y + 154, x + 286, y + 179, '#3f4945', 3);
  rect(ctx, x + 250, y + 148, 30, 14, '#26382f');
  rect(ctx, x + 256, y + 151, 18, 7, Math.floor(now / 520) % 2 === 0 ? '#e2bd5d' : '#9a844f');

  steppedPool(ctx, x + 182, y + 260, 164, '#f2dfae', darkMix > 0.45 ? 0.025 : 0.085);

  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      // The dark counterpart changes the workbench story: cable becomes a
      // root/vein intrusion and the light pool becomes a wrong body-like shadow.
      line(ctx, x + 272, y + 91, x + 270, y + 142, '#5f3740', 5);
      line(ctx, x + 270, y + 142, x + 242, y + 172, '#6d3d48', 4);
      line(ctx, x + 242, y + 172, x + 222, y + 194, '#4e3239', 3);
      polygon(ctx, [
        [x + 188, y + 286], [x + 318, y + 274], [x + 344, y + 293],
        [x + 304, y + 305], [x + 244, y + 301], [x + 206, y + 313],
      ], 'rgba(47,27,36,.55)');
      rect(ctx, x + 236, y + 197, 30, 5, '#793d48');
      rect(ctx, x + 242, y + 202, 18, 4, '#9a6570');
    });
  }
}

function drawYardContainmentHero(ctx: CanvasRenderingContext2D, now: number, darkMix: number): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;

  rect(ctx, x + 498, y + 68, 210, 10, '#4a5149');
  rect(ctx, x + 510, y + 77, 188, 5, '#8f927f');
  line(ctx, x + 520, y + 80, x + 552, y + 112, '#5a625b', 5);
  line(ctx, x + 684, y + 80, x + 652, y + 112, '#5a625b', 5);
  line(ctx, x + 602, y + 78, x + 602, y + 132, '#4a5149', 4);
  rect(ctx, x + 586, y + 126, 32, 14, '#37433e');
  rect(ctx, x + 592, y + 130, 20, 6, Math.floor(now / 420) % 2 === 0 ? '#e2bd5d' : '#9e7750');

  // Irregular lower cage shadow and service tray give the containment area mass.
  polygon(ctx, [
    [x + 502, y + 218], [x + 690, y + 218], [x + 704, y + 238],
    [x + 676, y + 248], [x + 530, y + 246], [x + 492, y + 234],
  ], 'rgba(37,54,47,.24)');
  rect(ctx, x + 546, y + 190, 118, 9, '#535d57');
  rect(ctx, x + 554, y + 193, 102, 4, '#a4aa91');
  for (const bx of [x + 562, x + 602, x + 642]) rect(ctx, bx, y + 190, 4, 8, '#2f3935');

  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      line(ctx, x + 602, y + 78, x + 606, y + 126, '#713a45', 5);
      line(ctx, x + 606, y + 126, x + 632, y + 151, '#713a45', 4);
      rect(ctx, x + 624, y + 148, 18, 8, '#874e57');
      rect(ctx, x + 630, y + 155, 10, 6, '#a87478');
    });
  }
}

export function drawPassCYardBase(
  ctx: CanvasRenderingContext2D,
  now: number,
  darkMix: number,
): void {
  drawYardWorkshopHero(ctx, now, darkMix);
  drawYardContainmentHero(ctx, now, darkMix);
}

export function drawPassCYardForeground(
  ctx: CanvasRenderingContext2D,
  playerY: number,
  darkMix: number,
): void {
  const x = YARD_CORE_X;
  const y = YARD_CORE_Y;
  if (playerY >= y + 330) return;

  // Foreground service pipes create a readable near plane only when the player
  // is spatially behind them.
  rect(ctx, x + 58, y + 332, 344, 8, '#3e4944');
  rect(ctx, x + 58, y + 335, 344, 3, '#768177');
  for (const px of [x + 76, x + 194, x + 326]) {
    rect(ctx, px, y + 326, 9, 28, '#46514c');
    rect(ctx, px + 3, y + 328, 3, 22, '#899287');
  }
  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      line(ctx, x + 144, y + 338, x + 166, y + 360, '#5c3740', 4);
      line(ctx, x + 166, y + 360, x + 182, y + 352, '#7b4550', 3);
    });
  }
}

function drawDebtRoadsideSet(ctx: CanvasRenderingContext2D, now: number, darkMix: number): void {
  const x = debtLandmark.x;
  const y = debtLandmark.y;

  // A deliberately composed roadside collection point, so the creditor enters
  // a scene with visual hierarchy rather than appearing on empty road paint.
  polygon(ctx, [
    [x - 122, y + 30], [x + 118, y + 26], [x + 146, y + 50],
    [x + 82, y + 62], [x - 96, y + 60], [x - 142, y + 48],
  ], 'rgba(75,69,58,.20)');
  rect(ctx, x - 118, y - 86, 9, 108, '#604735');
  rect(ctx, x + 108, y - 82, 9, 104, '#604735');
  rect(ctx, x - 112, y - 62, 222, 6, '#805e42');
  rect(ctx, x - 112, y - 25, 222, 5, '#805e42');

  // Leaning collection notice, paper tags and a cheap blinking route lamp.
  ctx.save();
  ctx.translate(x - 84, y - 98);
  ctx.rotate(-0.055);
  rect(ctx, 0, 0, 96, 44, '#684638');
  rect(ctx, 5, 5, 86, 34, '#b9a46d');
  rect(ctx, 12, 12, 62, 3, '#423a31');
  rect(ctx, 12, 20, 70, 2, '#5b4738');
  rect(ctx, 12, 27, 50, 2, '#5b4738');
  ctx.restore();
  rect(ctx, x + 80, y - 56, 22, 18, '#48544f');
  rect(ctx, x + 86, y - 51, 10, 7, Math.floor(now / 580) % 2 === 0 ? '#d8b455' : '#846d49');

  for (const [ox, oy, w] of [[-74, 12, 18], [-42, 37, 14], [48, 22, 21], [76, 44, 16]] as const) {
    rect(ctx, x + ox, y + oy, w, 4, '#d4c18b');
    rect(ctx, x + ox + 4, y + oy + 4, Math.max(5, w - 8), 2, '#8e7a59');
  }

  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      polygon(ctx, [
        [x - 110, y + 43], [x - 44, y + 32], [x + 18, y + 40],
        [x + 96, y + 33], [x + 132, y + 54], [x + 20, y + 67],
        [x - 82, y + 62],
      ], 'rgba(55,31,37,.50)');
      rect(ctx, x - 22, y + 36, 42, 5, '#6f3439');
      rect(ctx, x - 12, y + 41, 20, 4, '#9a6670');
      line(ctx, x + 110, y - 76, x + 122, y - 42, '#663a44', 4);
      line(ctx, x + 122, y - 42, x + 110, y - 18, '#7c4650', 3);
    });
  }
}

export function drawPassCRouteBase(
  ctx: CanvasRenderingContext2D,
  now: number,
  darkMix: number,
): void {
  drawDebtRoadsideSet(ctx, now, darkMix);
}

export function drawPassCRouteForeground(
  ctx: CanvasRenderingContext2D,
  playerY: number,
  darkMix: number,
): void {
  const x = debtLandmark.x;
  const y = debtLandmark.y;
  if (playerY >= y + 70) return;
  rect(ctx, x - 148, y + 62, 296, 5, '#594536');
  for (const px of [x - 126, x + 126]) rect(ctx, px, y + 54, 7, 26, '#4b4035');
  if (darkMix > 0) {
    alpha(ctx, darkMix, () => rect(ctx, x - 58, y + 64, 116, 4, '#623640'));
  }
}

export function drawPassCMasterLabBase(
  ctx: CanvasRenderingContext2D,
  now: number,
  darkMix: number,
): void {
  // Stepped surgical-light pools and a hard shadow under the containment gantry
  // make the approved character sprites sit in the room rather than on top of it.
  steppedPool(ctx, 1324, 612, 356, '#f2dfae', darkMix > 0.45 ? 0.018 : 0.055);
  rect(ctx, 1278, 302, 492, 7, '#3c4742');
  rect(ctx, 1302, 309, 444, 4, '#798379');
  for (const lx of [1340, 1456, 1572, 1688]) {
    rect(ctx, lx, 310, 18, 12, '#343f3a');
    rect(ctx, lx + 4, 313, 10, 5, Math.floor(now / 620 + lx) % 3 === 0 ? '#d8b455' : '#809584');
  }
  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      polygon(ctx, [[1362, 630], [1450, 618], [1520, 626], [1608, 615], [1678, 636], [1598, 650], [1450, 648]], 'rgba(49,27,35,.42)');
      line(ctx, 1702, 310, 1688, 350, '#6e3a45', 4);
      line(ctx, 1688, 350, 1708, 376, '#7e4a54', 3);
    });
  }
}

export function drawPassCMasterLabForeground(
  ctx: CanvasRenderingContext2D,
  playerY: number,
  darkMix: number,
): void {
  if (playerY >= 860) return;
  rect(ctx, 1248, 842, 548, 8, '#3f4945');
  rect(ctx, 1260, 845, 524, 3, '#7f897e');
  for (const x of [1300, 1496, 1728]) rect(ctx, x, 838, 9, 30, '#46514c');
  if (darkMix > 0) {
    alpha(ctx, darkMix, () => line(ctx, 1542, 846, 1572, 870, '#673a45', 4));
  }
}

export function drawPassCLocalPitBase(
  ctx: CanvasRenderingContext2D,
  now: number,
  darkMix: number,
): void {
  // Arena hero gantry. The base arena already has strong material work from
  // Pass B; this adds a dominant focal silhouette and authored light hierarchy.
  rect(ctx, 1468, 176, 680, 12, '#3e4744');
  rect(ctx, 1482, 188, 652, 5, '#778179');
  for (const x of [1510, 1650, 1790, 1930, 2070]) {
    line(ctx, x, 188, x + 20, 218, '#4d5752', 4);
    rect(ctx, x + 10, 212, 34, 17, '#343d3a');
    rect(ctx, x + 17, 217, 20, 7, Math.floor(now / 520 + x) % 4 === 0 ? '#e2bd5d' : '#a88a50');
  }
  steppedPool(ctx, 1542, 568, 522, '#f2dfae', darkMix > 0.45 ? 0.018 : 0.075);

  // Uneven far-side spectators and hanging league scraps add depth without
  // turning the room into a uniform noise field.
  for (const [x, y, w, h] of [
    [1518, 274, 18, 30], [1544, 268, 22, 36], [1580, 278, 17, 26],
    [2010, 276, 19, 29], [2040, 266, 24, 39], [2074, 278, 17, 27],
  ] as const) {
    rect(ctx, x, y, w, h, '#3b403c');
    rect(ctx, x + Math.floor(w / 3), y - 9, Math.max(8, Math.floor(w * 0.55)), 10, '#4b5049');
  }
  rect(ctx, 1606, 194, 58, 30, '#6d4338');
  rect(ctx, 1612, 200, 46, 18, '#b5694d');
  rect(ctx, 1980, 194, 70, 30, '#365f5a');
  rect(ctx, 1986, 200, 58, 18, '#559187');

  // Reception light strip, intentionally uneven and locally shadowed.
  rect(ctx, 534, 630, 472, 8, '#3d4843');
  for (let x = 556; x < 986; x += 54) {
    rect(ctx, x, 638, 30, 5, '#747d73');
    rect(ctx, x + 7, 642, 16, 4, Math.floor(now / 680 + x) % 5 === 0 ? '#d5b151' : '#c9bf91');
  }

  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      polygon(ctx, [[1560, 598], [1640, 584], [1732, 595], [1830, 578], [1940, 596], [2034, 586], [2068, 612], [1910, 628], [1738, 624]], 'rgba(48,25,35,.48)');
      line(ctx, 1808, 188, 1806, 234, '#6f3945', 5);
      line(ctx, 1806, 234, 1776, 264, '#7f4652', 4);
      rect(ctx, 1767, 262, 22, 8, '#915a63');
    });
  }
}

export function drawPassCLocalPitForeground(
  ctx: CanvasRenderingContext2D,
  playerY: number,
  darkMix: number,
): void {
  // Near-side arena rail only occludes actors who are spatially behind it.
  if (playerY >= 684) return;
  rect(ctx, 1482, 674, 646, 9, '#414a46');
  rect(ctx, 1492, 677, 626, 3, '#858b7d');
  for (const x of [1510, 1660, 1810, 1960, 2110]) {
    rect(ctx, x, 666, 10, 36, '#39413e');
    rect(ctx, x + 3, 668, 4, 29, '#777f77');
  }
  if (darkMix > 0) {
    alpha(ctx, darkMix, () => {
      rect(ctx, 1690, 675, 122, 5, '#643843');
      line(ctx, 1740, 679, 1762, 700, '#7a4550', 4);
    });
  }
}
