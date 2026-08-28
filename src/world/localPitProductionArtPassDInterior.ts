import { drawPixelRect } from '../environment/environmentArtLanguage.js';

interface PitInteriorPalette {
  wall: string;
  wallLight: string;
  wallDark: string;
  floor: string;
  floorLight: string;
  floorDark: string;
  steel: string;
  steelLight: string;
  steelDark: string;
  timber: string;
  timberLight: string;
  timberDark: string;
  sand: string;
  sandLight: string;
  sandDark: string;
  red: string;
  redDark: string;
  teal: string;
  tealLight: string;
  tealDark: string;
  warning: string;
  cream: string;
  ink: string;
  rust: string;
  glass: string;
  fluid: string;
  organic: string;
  organicLight: string;
  blood: string;
  grime: string;
}

const BRIGHT: PitInteriorPalette = {
  wall: '#b5a87d', wallLight: '#d0c18e', wallDark: '#766d58',
  floor: '#858170', floorLight: '#9d9780', floorDark: '#5d5b52',
  steel: '#616c67', steelLight: '#8c958b', steelDark: '#394540',
  timber: '#79583f', timberLight: '#9c724c', timberDark: '#49372d',
  sand: '#b5a16e', sandLight: '#ccba82', sandDark: '#877552',
  red: '#a94b42', redDark: '#713631', teal: '#46776f', tealLight: '#739b8e', tealDark: '#2f514e',
  warning: '#d1ac4f', cream: '#e9d6a3', ink: '#26322e', rust: '#975840',
  glass: '#83aaa0', fluid: '#779d76', organic: '#794554', organicLight: '#a45f6c', blood: '#74343b', grime: '#4d4c45',
};

const DARK: PitInteriorPalette = {
  wall: '#5e594e', wallLight: '#716b5c', wallDark: '#3a3835',
  floor: '#4a4945', floorLight: '#5b5952', floorDark: '#2e3030',
  steel: '#46514c', steelLight: '#626c64', steelDark: '#28312e',
  timber: '#554039', timberLight: '#6e5145', timberDark: '#2c2827',
  sand: '#6f6451', sandLight: '#80735c', sandDark: '#48423b',
  red: '#6f3540', redDark: '#482a30', teal: '#354f4c', tealLight: '#4d6860', tealDark: '#263b3b',
  warning: '#7d674a', cream: '#9d927d', ink: '#1c2524', rust: '#65403b',
  glass: '#526d69', fluid: '#654c5a', organic: '#6b3746', organicLight: '#985666', blood: '#5d2c34', grime: '#282d2c',
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  drawPixelRect(ctx, x, y, width, height, colour);
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[], colour: string): void {
  const first = points[0];
  if (!first) return;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point) ctx.lineTo(point[0], point[1]);
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
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, dark: boolean): void {
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(14,16,18,0.54)' : 'rgba(32,35,33,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawInteriorShell(ctx: CanvasRenderingContext2D, p: PitInteriorPalette, dark: boolean): void {
  // Opaque interior plate removes the tiled/pass-stacked look while preserving the exact floorplan.
  rect(ctx, 120, 90, 2120, 844, p.wallDark);
  rect(ctx, 154, 124, 2052, 776, p.floor);

  // Large floor zones instead of repeated checker tiles.
  polygon(ctx, [[164, 740], [1090, 730], [1260, 756], [1450, 730], [2196, 742], [2196, 894], [1300, 894], [1180, 870], [1060, 894], [164, 894]], p.floorLight);
  polygon(ctx, [[174, 148], [956, 148], [1030, 186], [1362, 174], [1450, 152], [2192, 152], [2192, 240], [1500, 244], [1400, 224], [1050, 232], [930, 214], [174, 226]], p.wall);
  polygon(ctx, [[160, 548], [1000, 548], [1080, 576], [1388, 562], [1458, 584], [1458, 700], [1300, 686], [1130, 704], [958, 678], [160, 694]], p.floorDark);

  // Traffic scuffs establish flow from entry -> reception -> prep / arena.
  for (const [x, y, w] of [[1038, 846, 300], [920, 790, 246], [1020, 630, 230], [1184, 528, 194], [1328, 514, 116], [924, 450, 168]] as const) {
    rect(ctx, x, y, w, 5, p.grime);
    rect(ctx, x + 22, y + 8, Math.max(20, w - 52), 3, p.floorDark);
  }

  // Exposed service runs tie the venue together visually.
  line(ctx, 188, 188, 1370, 188, p.steelDark, 7);
  for (const x of [280, 546, 824, 1104, 1334] as const) {
    rect(ctx, x, 174, 18, 18, p.steel);
    rect(ctx, x + 5, 178, 8, 7, p.warning);
  }
  line(ctx, 1380, 184, 1380, 660, p.steelDark, 6);
  line(ctx, 1380, 660, 1460, 660, p.steelDark, 6);

  if (dark) {
    line(ctx, 546, 188, 570, 220, p.organic, 6);
    line(ctx, 570, 220, 608, 230, p.organicLight, 4);
    line(ctx, 1380, 378, 1350, 404, p.organic, 6);
    line(ctx, 1350, 404, 1322, 394, p.organicLight, 4);
    polygon(ctx, [[938, 842], [1010, 824], [1086, 842], [1058, 870], [974, 868]], p.blood);
  }
}

function drawReception(ctx: CanvasRenderingContext2D, now: number, p: PitInteriorPalette, dark: boolean): void {
  shadow(ctx, 770, 800, 248, 12, dark);
  rect(ctx, 520, 696, 500, 106, p.timberDark);
  rect(ctx, 532, 706, 476, 84, p.timber);
  rect(ctx, 544, 716, 452, 22, p.timberLight);
  rect(ctx, 548, 748, 116, 30, p.redDark);
  rect(ctx, 556, 754, 100, 5, p.cream);
  rect(ctx, 574, 765, 64, 4, p.warning);

  // Intake jars, cheap terminal and piles of forms create business function without random clutter.
  for (const [x, fluid] of [[704, p.fluid], [754, '#a9777e'], [804, '#789176']] as const) {
    rect(ctx, x, 718, 38, 48, p.steelDark);
    rect(ctx, x + 5, 723, 28, 36, p.glass);
    rect(ctx, x + 9, 740, 20, 15, dark ? p.organic : fluid);
    rect(ctx, x + 11, 726, 10, 7, p.cream);
  }
  rect(ctx, 868, 718, 72, 52, p.steelDark);
  rect(ctx, 876, 725, 56, 36, dark ? '#55464e' : '#739287');
  rect(ctx, 886, 733, 36, 6, Math.floor(now / 460) % 2 === 0 ? p.warning : p.tealLight);
  rect(ctx, 950, 718, 42, 8, p.cream);
  rect(ctx, 946, 732, 48, 7, p.cream);
  rect(ctx, 954, 745, 38, 6, p.cream);

  // Queue board and payout odds board on the wall behind reception.
  rect(ctx, 550, 626, 446, 50, p.steelDark);
  rect(ctx, 560, 636, 426, 30, p.tealDark);
  for (const [x, w, colour] of [[574, 90, p.cream], [686, 124, p.warning], [832, 136, p.cream]] as const) rect(ctx, x, 646, w, 5, colour);

  if (dark) {
    polygon(ctx, [[826, 772], [874, 758], [926, 776], [914, 798], [854, 796]], p.organic);
    line(ctx, 892, 774, 918, 744, p.organicLight, 4);
    rect(ctx, 620, 784, 84, 8, p.blood);
  }
}

function drawPrepBay(ctx: CanvasRenderingContext2D, now: number, p: PitInteriorPalette, dark: boolean): void {
  // Main prep/weigh machinery follows the locked 286,286,620x260 collider.
  shadow(ctx, 596, 548, 300, 14, dark);
  rect(ctx, 286, 286, 620, 260, p.steelDark);
  rect(ctx, 298, 298, 596, 236, p.wall);
  polygon(ctx, [[306, 316], [884, 316], [866, 350], [324, 350]], p.tealDark);
  rect(ctx, 344, 378, 492, 96, p.steelDark);
  rect(ctx, 356, 390, 468, 72, p.steel);
  rect(ctx, 382, 406, 170, 38, p.floorLight);
  rect(ctx, 396, 418, 142, 9, p.cream);

  // Scale indicator and surgical/repair tools.
  for (const [x, colour] of [[594, p.teal], [634, p.warning], [674, p.red], [714, p.teal], [754, p.warning]] as const) {
    rect(ctx, x, 412, 18, 18, p.steelDark);
    rect(ctx, x + 4, 416, 10, 10, Math.floor(now / 520) % 2 === 0 ? colour : p.steelLight);
  }
  line(ctx, 404, 366, 404, 322, p.steelDark, 5);
  line(ctx, 404, 324, 470, 324, p.steelDark, 5);
  line(ctx, 470, 324, 488, 352, p.rust, 4);
  rect(ctx, 496, 336, 66, 12, p.cream);
  rect(ctx, 512, 351, 34, 7, p.rust);

  // Holding pen and decon tank remain separate operational zones.
  rect(ctx, 306, 574, 218, 120, p.timberDark);
  rect(ctx, 316, 584, 198, 100, p.steelDark);
  for (let x = 328; x < 510; x += 24) rect(ctx, x, 590, 3, 88, p.steelLight);
  rect(ctx, 330, 658, 170, 5, p.timber);
  if (!dark) {
    rect(ctx, 382, 630, 64, 26, '#b9ab86');
    rect(ctx, 430, 614, 34, 26, '#b9ab86');
    line(ctx, 446, 618, 458, 598, '#8d775e', 4);
    rect(ctx, 452, 622, 4, 4, p.ink);
  } else {
    polygon(ctx, [[366, 642], [410, 614], [464, 626], [480, 660], [404, 672]], p.organic);
    line(ctx, 410, 620, 394, 592, p.organicLight, 5);
    line(ctx, 446, 622, 474, 590, p.organicLight, 5);
  }

  rect(ctx, 742, 570, 164, 126, p.steelDark);
  rect(ctx, 752, 580, 144, 106, p.glass);
  rect(ctx, 764, 592, 120, 80, dark ? p.organic : p.fluid);
  for (const x of [772, 800, 828, 856] as const) rect(ctx, x, 588, 3, 88, p.steelDark);
  rect(ctx, 782, 600, 30, 9, p.cream);
  if (dark) {
    polygon(ctx, [[786, 634], [822, 616], [866, 636], [854, 662], [808, 660]], p.organicLight);
    line(ctx, 826, 628, 840, 602, p.organicLight, 4);
  }
}

function drawResultDesk(ctx: CanvasRenderingContext2D, p: PitInteriorPalette, dark: boolean): void {
  shadow(ctx, 1165, 390, 172, 9, dark);
  rect(ctx, 990, 286, 350, 98, p.timberDark);
  rect(ctx, 1002, 298, 326, 74, p.timber);
  rect(ctx, 1014, 308, 302, 20, p.timberLight);
  rect(ctx, 1028, 340, 78, 16, p.warning);
  rect(ctx, 1126, 340, 78, 16, p.tealDark);
  rect(ctx, 1224, 340, 78, 16, p.redDark);
  rect(ctx, 1040, 252, 250, 28, p.steelDark);
  rect(ctx, 1050, 260, 230, 10, p.redDark);
  rect(ctx, 1072, 263, 186, 4, p.cream);
  // Cash/medical detritus stays clustered on the counter.
  rect(ctx, 1034, 318, 42, 8, p.cream);
  rect(ctx, 1082, 314, 28, 10, p.cream);
  rect(ctx, 1242, 314, 52, 8, p.cream);
  if (dark) {
    rect(ctx, 1168, 362, 84, 8, p.blood);
    line(ctx, 1260, 340, 1280, 370, p.organic, 4);
  }
}

function drawArena(ctx: CanvasRenderingContext2D, now: number, p: PitInteriorPalette, dark: boolean): void {
  // Arena becomes the clear interior hero composition.
  shadow(ctx, 1807, 668, 330, 16, dark);
  rect(ctx, 1488, 206, 638, 24, p.steelDark);
  rect(ctx, 2088, 206, 38, 458, p.steelDark);
  rect(ctx, 1488, 640, 638, 24, p.steelDark);
  rect(ctx, 1488, 206, 36, 282, p.steelDark);
  rect(ctx, 1488, 592, 36, 72, p.steelDark);

  // Worn rails and posts around the locked battle floor with the gate gap left clear.
  for (const x of [1512, 1600, 1700, 1800, 1900, 2000, 2098] as const) {
    rect(ctx, x, 214, 9, 40, p.steel);
    rect(ctx, x + 3, 218, 3, 30, p.steelLight);
  }
  for (const y of [260, 350, 470, 570] as const) {
    rect(ctx, 2094, y, 26, 8, p.steel);
    rect(ctx, 2098, y + 2, 18, 3, p.steelLight);
  }

  polygon(ctx, [[1530, 246], [2078, 246], [2078, 620], [1530, 620]], p.sandDark);
  polygon(ctx, [[1548, 264], [2060, 264], [2052, 602], [1554, 606]], p.sand);
  polygon(ctx, [[1572, 286], [2038, 282], [2028, 578], [1580, 584]], p.sandLight);

  // Blood/scuff evidence is concentrated around believable impact points.
  for (const [x, y, w] of [[1650, 434, 58], [1840, 332, 72], [1934, 510, 46], [1768, 560, 38]] as const) {
    rect(ctx, x, y, w, 6, dark ? p.blood : '#875447');
    rect(ctx, x + 12, y + 8, Math.max(10, w - 26), 4, p.sandDark);
  }

  // Overhead fight lights create the strongest lighting hierarchy in the venue.
  line(ctx, 1580, 176, 2040, 176, p.steelDark, 8);
  for (const x of [1620, 1770, 1920] as const) {
    rect(ctx, x, 166, 66, 22, p.steelDark);
    rect(ctx, x + 8, 172, 50, 10, Math.floor(now / 460) % 2 === 0 ? p.warning : p.cream);
    ctx.save();
    ctx.globalAlpha = dark ? 0.07 : 0.1;
    polygon(ctx, [[x + 12, 188], [x + 54, 188], [x + 112, 584], [x - 46, 584]], dark ? '#a75b65' : '#ffe2a4');
    ctx.restore();
  }

  // Crowd/business architecture sits outside the floor and reads as a functioning cheap venue.
  rect(ctx, 1870, 760, 210, 92, p.timberDark);
  rect(ctx, 1882, 772, 186, 68, p.timber);
  for (const y of [782, 808, 832] as const) rect(ctx, 1892, y, 166, 8, p.timberLight);
  rect(ctx, 1530, 788, 252, 74, p.steelDark);
  rect(ctx, 1540, 798, 232, 54, p.redDark);
  for (const x of [1554, 1612, 1670, 1728] as const) {
    rect(ctx, x, 810, 38, 6, p.cream);
    rect(ctx, x, 828, 30, 5, p.warning);
  }

  // Crowd silhouettes are grouped and low-detail, deliberately subordinate to combatants.
  for (const [x, y, h] of [[1600, 748, 28], [1640, 742, 34], [1684, 752, 24], [1920, 734, 42], [1962, 744, 32], [2004, 738, 38]] as const) {
    rect(ctx, x, y, 16, h, dark ? '#28252a' : '#5c554d');
    rect(ctx, x + 3, y - 10, 10, 10, dark ? '#302833' : '#8b765e');
  }

  if (dark) {
    // Rails and floor are physically infiltrated rather than just recoloured.
    line(ctx, 1512, 470, 1542, 450, p.organic, 7);
    line(ctx, 1542, 450, 1568, 466, p.organicLight, 5);
    line(ctx, 2098, 386, 2066, 404, p.organic, 7);
    polygon(ctx, [[1784, 408], [1832, 386], [1888, 408], [1870, 440], [1814, 442]], p.organic);
    line(ctx, 1832, 398, 1848, 366, p.organicLight, 5);
    polygon(ctx, [[1588, 590], [1660, 574], [1728, 596], [1696, 618], [1620, 614]], p.blood);
  }
}

function drawInteriorStory(ctx: CanvasRenderingContext2D, p: PitInteriorPalette, dark: boolean): void {
  // Deliberately clustered operational clutter: medical trolley, wash station, fight scrap.
  rect(ctx, 1080, 570, 116, 62, p.steelDark);
  rect(ctx, 1090, 580, 96, 42, p.steel);
  rect(ctx, 1102, 590, 28, 14, p.cream);
  rect(ctx, 1144, 590, 28, 14, p.redDark);
  rect(ctx, 1088, 632, 8, 18, p.steelDark);
  rect(ctx, 1178, 632, 8, 18, p.steelDark);

  rect(ctx, 1240, 694, 106, 38, p.timberDark);
  rect(ctx, 1250, 704, 86, 18, p.timber);
  rect(ctx, 1260, 708, 26, 7, p.rust);
  rect(ctx, 1298, 708, 28, 7, p.steelLight);

  // Small grime patches support material wear without returning to uniform noise.
  for (const [x, y, w] of [[188, 846, 180], [406, 832, 122], [1040, 850, 140], [1320, 746, 88], [1160, 430, 118]] as const) {
    rect(ctx, x, y, w, 6, p.grime);
    rect(ctx, x + 16, y + 8, Math.max(14, w - 42), 3, p.floorDark);
  }

  if (dark) {
    polygon(ctx, [[1096, 612], [1138, 594], [1182, 612], [1170, 636], [1120, 634]], p.organic);
    line(ctx, 1142, 606, 1162, 578, p.organicLight, 4);
    rect(ctx, 1260, 722, 66, 7, p.blood);
  }
}

function drawInterior(ctx: CanvasRenderingContext2D, now: number, p: PitInteriorPalette, dark: boolean): void {
  drawInteriorShell(ctx, p, dark);
  drawReception(ctx, now, p, dark);
  drawPrepBay(ctx, now, p, dark);
  drawResultDesk(ctx, p, dark);
  drawArena(ctx, now, p, dark);
  drawInteriorStory(ctx, p, dark);
}

export function drawPassDLocalPitInteriorBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawInterior(ctx, now, BRIGHT, false);
}

export function drawPassDLocalPitInteriorDark(ctx: CanvasRenderingContext2D, now: number): void {
  drawInterior(ctx, now, DARK, true);
}

function drawInteriorForeground(ctx: CanvasRenderingContext2D, playerFeetY: number, p: PitInteriorPalette, dark: boolean): void {
  // Overhead gantry across reception corridor.
  if (playerFeetY < 760) {
    rect(ctx, 1030, 744, 356, 10, p.steelDark);
    rect(ctx, 1040, 747, 336, 4, p.steelLight);
    for (const x of [1048, 1180, 1362] as const) rect(ctx, x, 730, 9, 38, p.steelDark);
    if (dark) line(ctx, 1188, 750, 1214, 774, p.organicLight, 4);
  }

  // Arena foreground rail only occludes players physically north of it.
  if (playerFeetY < 640) {
    rect(ctx, 1520, 620, 574, 10, p.steelDark);
    rect(ctx, 1530, 623, 554, 4, p.steelLight);
    for (const x of [1540, 1690, 1840, 1990, 2080] as const) rect(ctx, x, 608, 9, 34, p.steelDark);
    if (dark) polygon(ctx, [[1810, 620], [1860, 612], [1896, 630], [1850, 640]], p.organic);
  }
}

export function drawPassDLocalPitInteriorBrightForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawInteriorForeground(ctx, playerFeetY, BRIGHT, false);
}

export function drawPassDLocalPitInteriorDarkForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawInteriorForeground(ctx, playerFeetY, DARK, true);
}
