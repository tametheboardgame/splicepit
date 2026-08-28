import {
  ENVIRONMENT_MATERIALS,
  drawEnvironmentContactShadow,
  drawPixelRect,
} from '../environment/environmentArtLanguage.js';

export const LOCAL_PIT_PRODUCTION_ART_CONTRACT = {
  locationId: 'local-pit',
  geometryId: 'local-pit-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  brightDetailGroups: [
    'exterior-facade-fencing-signage',
    'reception-registration-payout-clutter',
    'prep-weigh-cages-decon',
    'drains-stains-patching-rust-tape',
    'arena-construction-and-worn-rails',
    'spectator-and-business-clutter',
    'local-league-personality',
    'cheap-venue-lighting-and-depth',
  ] as const,
  darkStoryGroups: [
    'old-blood-organic-residue',
    'failed-cleanup-and-nasty-drains',
    'warped-cages-and-equipment',
    'crowd-and-arena-silhouettes',
    'prep-bay-biological-wrongness',
    'fight-floor-brutality-evidence',
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
  brick: M.brick.dark,
  plaster: M.plaster.dark,
  steel: M.steel.dark,
  glass: M.glass.dark,
  dirt: M.dirt.dark,
  grass: M.grass.dark,
  cage: M.cage.dark,
  machinery: M.machinery.dark,
  residue: M['biological-residue'].dark,
} as const;

const C = {
  cream: '#f2dfae',
  ink: '#26382f',
  paper: '#eadcae',
  paperShade: '#bda875',
  yellow: '#e1bd5b',
  orange: '#d47a45',
  red: '#b95443',
  redDark: '#743b3c',
  teal: '#4b8b81',
  tealLight: '#78aaa0',
  blue: '#7299a5',
  pink: '#c77b85',
  purple: '#795b7e',
  green: '#90be70',
  rust: '#9a5d42',
  rustDark: '#684239',
  grease: '#3d4741',
  damp: '#66735a',
  oldBlood: '#6f3439',
  blood: '#914047',
  tissue: '#80505a',
  tissuePale: '#ad7880',
  badFluid: '#44574d',
  blackTissue: '#342e33',
  bone: '#cbbd99',
  darkVoid: '#27272b',
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

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colour: string = C.cream,
  size = 9,
): void {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.font = `700 ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, Math.round(x), Math.round(y));
  ctx.restore();
}

function drawDrain(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, dark = false): void {
  const steel = dark ? D.steel : B.steel;
  rect(ctx, x, y, width, 16, steel.shadow);
  rect(ctx, x + 3, y + 3, width - 6, 10, dark ? '#242c2c' : '#58645c');
  for (let gx = x + 8; gx < x + width - 6; gx += 13) rect(ctx, gx, y + 4, 4, 8, steel.highlight);
}

function drawPaperStack(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, rows: number): void {
  for (let row = 0; row < rows; row += 1) {
    rect(ctx, x + row * 2, y - row * 3, width - row * 3, 4, row % 2 ? C.paperShade : C.paper);
  }
}

function drawBrightExterior(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y, w] of [[196, 902, 174], [438, 902, 128], [1740, 902, 152], [1960, 902, 168]] as const) {
    rect(ctx, x, y, w, 12, B.brick.shadow);
    rect(ctx, x + 12, y + 3, w - 24, 5, B.brick.highlight);
    for (let bolt = x + 20; bolt < x + w - 12; bolt += 42) rect(ctx, bolt, y + 4, 4, 4, B.steel.highlight);
  }
  for (const [x, y] of [[252, 120], [468, 120], [1882, 120], [2098, 120]] as const) {
    line(ctx, x, y, x - 14, y + 52, '#46524c', 3);
    rect(ctx, x - 20, y + 46, 18, 12, B.steel.shadow);
    rect(ctx, x - 16, y + 49, 10, 6, Math.floor(now / 520 + x) % 3 === 0 ? C.yellow : '#9d8650');
  }
  rect(ctx, 878, 80, 604, 8, B.steel.shadow);
  for (let x = 900; x < 1460; x += 56) {
    const colour = (Math.floor(x / 56) + Math.floor(now / 700)) % 3 === 0 ? C.yellow : C.red;
    rect(ctx, x, 74, 8, 8, colour);
  }

  for (const x of [160, 344, 528, 1660, 1844, 2028, 2212]) {
    rect(ctx, x, 1058, 8, 222, B.wood.shadow);
    rect(ctx, x + 3, 1062, 4, 214, B.wood.highlight);
    rect(ctx, x - 12, 1138, 112, 5, B.cage.base);
    rect(ctx, x - 12, 1228, 112, 5, B.cage.base);
    if (x === 528 || x === 1844) {
      line(ctx, x - 4, 1140, x + 80, 1228, C.rustDark, 4);
      rect(ctx, x + 36, 1177, 34, 5, C.yellow);
    }
  }
  rect(ctx, 680, 1182, 254, 52, B.wood.shadow);
  rect(ctx, 686, 1188, 242, 40, C.orange);
  label(ctx, 'BRAMBLE FEEDS', 807, 1202, C.cream, 11);
  label(ctx, 'BULK PROTEIN · NO QUESTIONS', 807, 1218, C.ink, 8);

  rect(ctx, 1436, 1180, 236, 54, B.steel.shadow);
  rect(ctx, 1442, 1186, 224, 42, C.teal);
  label(ctx, 'MUM’S GENE TONIC', 1554, 1201, C.cream, 10);
  label(ctx, 'OFFICIAL-ish SPONSOR', 1554, 1218, C.ink, 8);

  for (const [x, y, colour] of [
    [920, 1316, C.paper], [990, 1268, C.red], [1376, 1304, C.yellow], [1460, 1262, C.paper],
    [654, 1360, C.blue], [1746, 1370, C.paper],
  ] as const) {
    rect(ctx, x, y, 18, 5, colour);
    rect(ctx, x + 5, y + 5, 12, 3, B.dirt.shadow);
  }
  for (const [x, y, w, h] of [[1008, 1036, 116, 26], [1190, 1118, 112, 24], [1072, 1260, 174, 28], [1160, 1392, 126, 24]] as const) {
    rect(ctx, x, y, w, h, B.dirt.shadow);
    rect(ctx, x + 8, y + 5, w - 16, h - 10, B.dirt.base);
    for (let bolt = x + 16; bolt < x + w - 10; bolt += 34) rect(ctx, bolt, y + 7, 4, 4, C.grease);
  }
}

function drawBrightReceptionAndPayout(ctx: CanvasRenderingContext2D, now: number): void {
  drawEnvironmentContactShadow(ctx, 768, 810, 250, 12);
  drawPaperStack(ctx, 566, 704, 72, 5);
  drawPaperStack(ctx, 646, 708, 54, 4);
  rect(ctx, 710, 696, 28, 20, B.machinery.shadow);
  rect(ctx, 716, 700, 16, 9, Math.floor(now / 460) % 2 ? C.yellow : C.red);
  rect(ctx, 882, 690, 62, 26, B.steel.shadow);
  rect(ctx, 888, 694, 50, 16, C.paperShade);
  label(ctx, 'PAID?', 913, 703, C.ink, 7);
  for (const [x, fluid] of [[758, C.green], [792, C.pink], [826, C.blue]] as const) {
    rect(ctx, x, 688, 22, 30, B.glass.shadow);
    rect(ctx, x + 4, 692, 14, 22, B.glass.base);
    rect(ctx, x + 5, 703, 12, 10, fluid);
  }

  drawEnvironmentContactShadow(ctx, 1164, 390, 174, 11);
  for (const x of [1018, 1066, 1114]) {
    drawPaperStack(ctx, x, 286, 40, 3);
    rect(ctx, x + 10, 272, 18, 12, C.redDark);
  }
  for (const [x, colour] of [[1178, C.yellow], [1210, C.teal], [1242, C.purple]] as const) {
    rect(ctx, x, 282, 26, 28, B.steel.shadow);
    rect(ctx, x + 4, 286, 18, 20, colour);
  }
  rect(ctx, 1008, 360, 318, 10, B.wood.shadow);
  for (let x = 1024; x < 1300; x += 38) rect(ctx, x, 364, 22, 3, x % 76 ? C.paper : C.paperShade);
  label(ctx, 'CASH · VOUCHERS · “EXPOSURE”', 1164, 376, C.cream, 8);

  rect(ctx, 1080, 622, 274, 82, B.wood.shadow);
  rect(ctx, 1086, 628, 262, 70, '#b9ad79');
  for (const [x, y, w, colour] of [
    [1098, 638, 70, C.paper], [1178, 636, 62, '#d7c889'], [1250, 642, 82, C.paper],
    [1108, 668, 92, '#d8b878'], [1212, 666, 108, C.paper],
  ] as const) {
    rect(ctx, x, y, w, 22, colour);
    rect(ctx, x + 8, y + 7, w - 16, 2, C.ink);
    rect(ctx, x + 8, y + 13, Math.max(18, w - 28), 2, C.redDark);
  }
}

function drawBrightPrep(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 326, 356, 548, 16, B.steel.shadow);
  for (let x = 344; x < 858; x += 46) {
    rect(ctx, x, 360, 28, 8, B.steel.base);
    rect(ctx, x + 10, 362, 6, 4, x === 666 && Math.floor(now / 440) % 2 === 0 ? C.yellow : C.tealLight);
  }
  rect(ctx, 826, 384, 52, 82, B.machinery.shadow);
  rect(ctx, 834, 394, 36, 54, B.machinery.base);
  rect(ctx, 842, 402, 20, 18, C.cream);
  line(ctx, 852, 412, 860, 404, C.redDark, 2);
  label(ctx, 'KG-ish', 852, 438, C.cream, 7);

  for (const x of [314, 350, 386, 422, 458, 494]) rect(ctx, x, 580, 4, 112, B.cage.shadow);
  line(ctx, 312, 592, 510, 676, B.cage.highlight, 3);
  line(ctx, 510, 592, 312, 676, B.cage.base, 3);
  rect(ctx, 480, 620, 34, 22, B.steel.shadow);
  rect(ctx, 486, 626, 22, 10, C.rust);
  rect(ctx, 334, 598, 76, 26, C.paperShade);
  label(ctx, 'BITEY / 14', 372, 611, C.ink, 7);

  rect(ctx, 724, 552, 202, 12, B.steel.shadow);
  line(ctx, 762, 556, 762, 638, C.grease, 5);
  line(ctx, 762, 560, 840, 560, C.grease, 5);
  for (const x of [792, 820, 848]) {
    line(ctx, x, 560, x, 594, B.steel.shadow, 3);
    rect(ctx, x - 4, 594, 10, 6, B.steel.highlight);
  }
  rect(ctx, 752, 648, 136, 30, B.steel.shadow);
  rect(ctx, 760, 654, 120, 18, C.damp);
  drawDrain(ctx, 768, 674, 104);
  rect(ctx, 880, 584, 28, 78, C.orange);
  rect(ctx, 884, 590, 20, 12, C.yellow);
  label(ctx, 'SOAP?', 894, 596, C.ink, 6);

  rect(ctx, 228, 522, 94, 72, B.steel.shadow);
  rect(ctx, 234, 528, 82, 54, B.steel.base);
  for (const [x, colour] of [[244, C.pink], [264, C.blue], [284, C.green]] as const) {
    rect(ctx, x, 536, 14, 28, B.glass.shadow);
    rect(ctx, x + 3, 540, 8, 20, colour);
  }
  rect(ctx, 242, 578, 10, 10, C.grease);
  rect(ctx, 296, 578, 10, 10, C.grease);
}

function drawBrightFloorAndMaintenance(ctx: CanvasRenderingContext2D): void {
  drawDrain(ctx, 930, 836, 190);
  drawDrain(ctx, 1320, 744, 136);
  drawDrain(ctx, 1580, 620, 220);
  drawDrain(ctx, 1860, 620, 184);

  for (const [x, y, w, h] of [
    [244, 820, 116, 54], [440, 842, 142, 44], [1180, 768, 94, 54], [1370, 804, 120, 52],
    [920, 526, 132, 44], [1166, 418, 124, 42],
  ] as const) {
    rect(ctx, x, y, w, h, B.steel.shadow);
    rect(ctx, x + 5, y + 5, w - 10, h - 10, '#8a886f');
    for (const [bx, by] of [[x + 8, y + 8], [x + w - 12, y + 8], [x + 8, y + h - 12], [x + w - 12, y + h - 12]] as const) rect(ctx, bx, by, 4, 4, C.rustDark);
  }
  for (const [x, y, w] of [[208, 894, 260], [1044, 892, 258], [1346, 708, 128], [918, 600, 142]] as const) {
    for (let tx = x; tx < x + w; tx += 24) rect(ctx, tx, y, 14, 5, C.yellow);
  }
  for (const [x, y] of [[354, 864], [1106, 858], [1436, 760], [944, 642]] as const) {
    rect(ctx, x, y, 42, 5, C.grease);
    rect(ctx, x + 10, y + 6, 28, 3, C.damp);
  }
}

function drawBrightArena(ctx: CanvasRenderingContext2D, now: number): void {
  for (const x of [1496, 1586, 1680, 1774, 1868, 1962, 2056]) {
    rect(ctx, x, 224, 8, 418, B.steel.shadow);
    rect(ctx, x + 3, 228, 3, 410, B.steel.highlight);
  }
  for (const y of [266, 356, 446, 536, 626]) {
    rect(ctx, 1502, y, 594, 6, B.cage.shadow);
    for (let x = 1520; x < 2088; x += 64) rect(ctx, x, y + 2, 32, 3, B.cage.highlight);
  }
  line(ctx, 1508, 238, 2080, 628, B.cage.base, 3);
  line(ctx, 2080, 238, 1508, 628, B.cage.base, 3);

  rect(ctx, 1452, 474, 64, 118, B.machinery.shadow);
  rect(ctx, 1460, 486, 48, 82, B.machinery.base);
  rect(ctx, 1470, 500, 28, 28, B.steel.shadow);
  rect(ctx, 1476, 506, 16, 16, C.yellow);
  line(ctx, 1498, 548, 1516, 580, C.grease, 5);
  for (const y of [490, 520, 550]) rect(ctx, 1458, y, 8, 18, C.rust);

  for (const [x, text, colour] of [
    [1548, 'BRAMBLE FEEDS', C.orange], [1718, 'GENE TONIC', C.teal], [1888, 'PATCH & PRAY VETS', C.red],
  ] as const) {
    rect(ctx, x, 236, 154, 44, B.wood.shadow);
    rect(ctx, x + 5, 241, 144, 34, colour);
    label(ctx, text, x + 77, 258, C.cream, 8);
  }

  for (const [x, y, w] of [[1582, 330, 86], [1742, 294, 116], [1924, 404, 104], [1662, 510, 130], [1846, 548, 122]] as const) {
    rect(ctx, x, y, w, 5, B.dirt.shadow);
    rect(ctx, x + 14, y + 6, Math.max(18, w - 34), 3, '#8f7654');
  }
  rect(ctx, 1760, 384, 98, 8, C.redDark);
  rect(ctx, 1780, 392, 58, 5, '#7b4240');
  for (const [x, y] of [[1610, 560], [1994, 316], [1876, 486]] as const) {
    rect(ctx, x, y, 24, 16, B.steel.shadow);
    rect(ctx, x + 5, y + 4, 14, 8, Math.floor(now / 500 + x) % 2 ? C.yellow : C.teal);
  }

  for (const [bx, by] of [[1538, 680], [1758, 680], [1978, 680]] as const) {
    rect(ctx, bx, by - 14, 174, 10, B.wood.shadow);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const colours = [C.red, C.teal, C.yellow, C.purple, C.blue, C.orange];
        const cx = bx + 20 + col * 24;
        const cy = by + 8 + row * 17;
        rect(ctx, cx, cy, 10, 9, colours[(row + col + Math.floor(now / 1200)) % colours.length]);
        rect(ctx, cx + 2, cy - 7, 6, 6, '#d0a17a');
      }
    }
  }
}

function drawBrightVenuePersonality(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 1448, 778, 98, 86, B.wood.shadow);
  rect(ctx, 1454, 784, 86, 74, '#bfae78');
  label(ctx, 'ODDS', 1497, 797, C.redDark, 9);
  label(ctx, 'RABBIT  3/1', 1497, 817, C.ink, 7);
  label(ctx, 'GOAT    5/2', 1497, 833, C.ink, 7);
  label(ctx, 'PIG     EVENS', 1497, 849, C.ink, 7);

  rect(ctx, 2090, 746, 90, 120, B.steel.shadow);
  rect(ctx, 2098, 754, 74, 104, '#9d8d67');
  label(ctx, 'LOST', 2135, 770, C.cream, 8);
  label(ctx, 'TEETH', 2135, 784, C.cream, 8);
  for (let y = 798; y < 850; y += 14) {
    rect(ctx, 2110, y, 9, 5, C.bone);
    rect(ctx, 2130, y + 2, 12, 4, C.bone);
    rect(ctx, 2150, y - 1, 7, 6, C.bone);
  }

  const pulse = Math.floor(now / 360) % 4;
  for (let i = 0; i < 4; i += 1) rect(ctx, 1858 + i * 44, 872, 28, 9, i === pulse ? C.yellow : B.machinery.shadow);
  label(ctx, 'NEXT BOUT', 1928, 890, C.cream, 8);
}

function drawBrightLighting(ctx: CanvasRenderingContext2D): void {
  for (const [x, y, w] of [[320, 182, 188], [1000, 182, 188], [1668, 182, 204]] as const) {
    rect(ctx, x, y, w, 14, B.steel.shadow);
    rect(ctx, x + 8, y + 3, w - 16, 7, '#d8c982');
    ctx.save();
    ctx.fillStyle = 'rgba(240,220,153,0.06)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 104, w * 0.72, 92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawLocalPitBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawBrightExterior(ctx, now);
  drawBrightReceptionAndPayout(ctx, now);
  drawBrightPrep(ctx, now);
  drawBrightFloorAndMaintenance(ctx);
  drawBrightArena(ctx, now);
  drawBrightVenuePersonality(ctx, now);
  drawBrightLighting(ctx);
  ctx.restore();
}

function drawDarkFacadeAndCrowd(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 850, 98, 660, 82, D.wood.shadow);
  rect(ctx, 860, 108, 640, 60, '#54373a');
  rect(ctx, 910, 122, 540, 10, C.oldBlood);
  rect(ctx, 990, 136, 376, 8, D.residue.shadow);
  for (const [x, y, w] of [[186, 900, 232], [1748, 900, 286], [2080, 900, 118]] as const) {
    rect(ctx, x, y, w, 18, D.brick.shadow);
    rect(ctx, x + 18, y + 7, w - 36, 7, C.oldBlood);
  }

  for (const [x, y] of [[352, 1112], [530, 1170], [1848, 1142], [2032, 1210]] as const) {
    line(ctx, x, y, x + 32, y + 56, D.cage.shadow, 6);
    rect(ctx, x + 10, y + 18, 18, 10, C.tissue);
    rect(ctx, x + 18, y + 12, 6, 8, C.tissuePale);
  }

  const twitch = Math.floor(now / 260) % 2 ? 2 : 0;
  for (const [bx, by] of [[1538, 680], [1758, 680], [1978, 680]] as const) {
    rect(ctx, bx - 2, by - 18, 178, 76, '#313036');
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const cx = bx + 10 + col * 23 + ((row + col) % 2 ? twitch : -twitch);
        const cy = by + 3 + row * 17;
        rect(ctx, cx, cy, 12, 14, '#29292e');
        rect(ctx, cx + 2, cy - 8, 8, 9, '#25252a');
        if ((row * 7 + col) % 5 === 0) rect(ctx, cx + 4, cy - 4, 3, 3, '#7c393f');
      }
    }
  }
}

function drawDarkPrepWrongness(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 336, 374, 516, 106, D.steel.base);
  rect(ctx, 352, 390, 484, 70, '#5f5a4c');
  for (const [x, y, w] of [[376, 410, 126], [520, 438, 164], [690, 404, 96]] as const) {
    rect(ctx, x, y, w, 8, C.oldBlood);
    rect(ctx, x + 18, y + 7, Math.max(16, w - 42), 5, C.tissue);
  }
  for (const x of [410, 610, 782]) {
    rect(ctx, x, 380, 18, 82, D.cage.shadow);
    rect(ctx, x + 5, 396, 8, 46, C.rustDark);
  }
  line(ctx, 414, 400, 608, 454, C.blackTissue, 5);
  line(ctx, 782, 402, 666, 452, C.blackTissue, 5);

  rect(ctx, 300, 566, 230, 136, D.cage.shadow);
  rect(ctx, 310, 576, 210, 116, '#353735');
  for (let x = 318; x < 516; x += 30) {
    const skew = x % 60 === 0 ? 8 : -5;
    line(ctx, x, 580, x + skew, 686, D.cage.highlight, 5);
  }
  rect(ctx, 338, 654, 98, 12, C.oldBlood);
  rect(ctx, 360, 642, 64, 18, C.tissue);
  rect(ctx, 392, 626, 24, 20, C.tissuePale);
  rect(ctx, 414, 633, 5, 5, '#9c4147');
  rect(ctx, 438, 660, 42, 8, C.bone);

  drawDrain(ctx, 756, 674, 126, true);
  for (const [x, y, w] of [[738, 662, 78], [802, 668, 102], [824, 650, 54]] as const) {
    rect(ctx, x, y, w, 7, D.residue.shadow);
    rect(ctx, x + 10, y - 6, Math.max(12, w - 24), 11, C.tissue);
  }
  for (const x of [792, 820, 848]) {
    line(ctx, x, 558, x + (x === 820 ? 12 : -7), 614, C.blackTissue, 4);
    rect(ctx, x - 5, 606, 14, 9, C.tissuePale);
  }
  if (Math.floor(now / 180) % 5 === 0) rect(ctx, 842, 606, 7, 7, '#9f4749');
}

function drawDarkReceptionAndCleanup(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 530, 690, 482, 78, D.wood.base);
  rect(ctx, 548, 710, 448, 44, '#6a5a45');
  for (const [x, y, w] of [[570, 738, 96], [690, 724, 128], [832, 742, 118]] as const) {
    rect(ctx, x, y, w, 7, C.oldBlood);
    rect(ctx, x + 14, y + 6, Math.max(14, w - 32), 4, '#8a6553');
  }
  rect(ctx, 904, 696, 58, 38, D.steel.shadow);
  rect(ctx, 914, 706, 38, 18, C.tissue);
  rect(ctx, 936, 700, 12, 9, C.tissuePale);

  rect(ctx, 982, 276, 366, 106, D.wood.shadow);
  rect(ctx, 996, 292, 338, 66, '#61523f');
  rect(ctx, 1020, 332, 286, 12, C.oldBlood);
  rect(ctx, 1082, 314, 76, 17, C.tissue);
  rect(ctx, 1146, 304, 26, 15, C.tissuePale);
  rect(ctx, 1214, 300, 62, 8, C.bone);
  drawPaperStack(ctx, 1030, 286, 82, 4);
}

function drawDarkDrainsAndFloor(ctx: CanvasRenderingContext2D): void {
  for (const [x, y, w] of [[914, 830, 220], [1308, 736, 160], [1568, 612, 244], [1846, 612, 214]] as const) {
    drawDrain(ctx, x, y, w, true);
    rect(ctx, x + 12, y - 9, Math.max(24, w - 28), 10, C.oldBlood);
    rect(ctx, x + 30, y - 15, Math.max(14, w - 74), 7, D.residue.base);
  }

  for (const [x, y, w] of [
    [884, 796, 138], [1036, 814, 112], [1250, 710, 126], [1458, 662, 92],
    [1166, 400, 130], [926, 502, 118],
  ] as const) {
    rect(ctx, x, y, w, 8, C.oldBlood);
    rect(ctx, x + 22, y + 7, Math.max(18, w - 48), 5, '#5f3438');
  }
  for (const [x, y] of [[972, 782], [1014, 772], [1204, 720], [1408, 692], [1152, 430]] as const) {
    rect(ctx, x, y, 18, 8, '#563438');
    rect(ctx, x + 24, y + 10, 16, 7, '#563438');
  }
  for (const [x, y] of [[1098, 812], [1358, 724], [1602, 598], [1912, 602]] as const) {
    rect(ctx, x, y, 22, 11, C.tissue);
    rect(ctx, x + 8, y - 7, 12, 11, C.tissuePale);
    rect(ctx, x + 15, y - 12, 5, 7, C.blackTissue);
  }
}

function drawDarkArena(ctx: CanvasRenderingContext2D, now: number): void {
  for (const x of [1496, 1586, 1680, 1774, 1868, 1962, 2056]) {
    rect(ctx, x, 224, 10, 418, D.steel.shadow);
    rect(ctx, x + 4, 250, 5, 314, C.rustDark);
    if (x === 1680 || x === 1962) line(ctx, x - 2, 322, x + 18, 438, D.cage.highlight, 6);
  }
  for (const y of [266, 356, 446, 536, 626]) {
    rect(ctx, 1502, y, 594, 8, D.cage.shadow);
    for (let x = 1518; x < 2088; x += 72) rect(ctx, x, y + 3, 34, 4, x % 144 ? C.rustDark : D.cage.highlight);
  }

  for (const [x, y, w, h] of [
    [1640, 326, 150, 18], [1770, 384, 184, 24], [1876, 446, 142, 16], [1608, 520, 120, 15],
  ] as const) {
    rect(ctx, x, y, w, h, C.oldBlood);
    rect(ctx, x + 22, y + h - 2, Math.max(16, w - 48), 8, '#583338');
  }
  rect(ctx, 1764, 350, 78, 22, C.tissue);
  rect(ctx, 1790, 338, 34, 18, C.tissuePale);
  rect(ctx, 1816, 345, 7, 7, '#a24649');
  rect(ctx, 1938, 492, 48, 12, C.bone);
  rect(ctx, 1968, 484, 16, 12, C.tissue);
  for (const [x, y, w] of [[1564, 598, 92], [1692, 604, 148], [1868, 596, 110], [2010, 602, 66]] as const) {
    rect(ctx, x, y, w, 10, D.residue.shadow);
    rect(ctx, x + 12, y - 6, Math.max(12, w - 26), 11, C.badFluid);
  }

  rect(ctx, 1450, 472, 70, 124, D.machinery.shadow);
  rect(ctx, 1460, 486, 50, 88, D.machinery.base);
  line(ctx, 1472, 516, 1518, 570, C.blackTissue, 6);
  line(ctx, 1502, 490, 1492, 570, C.tissue, 5);
  rect(ctx, 1474, 536, 18, 14, C.tissuePale);
  const spark = Math.floor(now / 150) % 6 === 0;
  rect(ctx, 1468, 494, 28, 16, spark ? '#a34a48' : '#4f3538');
  if (spark) rect(ctx, 1498, 490, 5, 8, C.yellow);
}

function drawDarkBiologicalIntrusion(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y, dx, dy] of [
    [748, 682, -72, 62], [884, 680, 54, 78], [1600, 620, -46, 74], [1974, 620, 62, 60],
    [1322, 748, -78, 54],
  ] as const) {
    line(ctx, x, y, x + dx, y + dy, D.residue.shadow, 8);
    line(ctx, x + dx * 0.45, y + dy * 0.45, x + dx * 0.8 + 26, y + dy * 0.8 - 20, C.blackTissue, 4);
    rect(ctx, x + dx - 7, y + dy - 7, 16, 14, C.tissue);
  }
  for (const [x, y] of [[688, 732], [936, 754], [1546, 690], [2044, 676], [1246, 796]] as const) {
    rect(ctx, x, y, 30, 10, D.residue.base);
    rect(ctx, x + 8, y - 9, 14, 13, C.tissuePale);
    if ((Math.floor(now / 330) + x) % 4 === 0) rect(ctx, x + 14, y - 12, 4, 4, '#994249');
  }
}

function drawDarkLighting(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(20,20,24,0.18)';
  for (const [x, y, rx, ry] of [[420, 490, 280, 210], [1110, 590, 304, 220], [1812, 448, 344, 256]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const [x, y, w] of [[320, 182, 188], [1000, 182, 188], [1668, 182, 204]] as const) {
    rect(ctx, x, y, w, 14, D.steel.shadow);
    rect(ctx, x + 8, y + 3, w - 16, 7, x === 1000 ? '#6e3d43' : '#6f705a');
  }
}

export function drawLocalPitDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawDarkFacadeAndCrowd(ctx, now);
  drawDarkPrepWrongness(ctx, now);
  drawDarkReceptionAndCleanup(ctx);
  drawDarkDrainsAndFloor(ctx);
  drawDarkArena(ctx, now);
  drawDarkBiologicalIntrusion(ctx, now);
  drawDarkLighting(ctx);
  ctx.restore();
}

export function drawLocalPitBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  ctx.save();
  if (playerFeetY < 760) {
    line(ctx, 936, 608, 936, 774, '#46524c', 5);
    rect(ctx, 930, 702, 18, 34, B.steel.shadow);
    rect(ctx, 934, 708, 10, 20, C.yellow);
    line(ctx, 1408, 612, 1408, 782, '#46524c', 5);
    rect(ctx, 1402, 720, 18, 36, B.steel.shadow);
    rect(ctx, 1406, 728, 10, 18, C.red);
  }
  if (playerFeetY < 930) {
    rect(ctx, 1084, 898, 192, 8, B.steel.shadow);
    for (let x = 1096; x < 1262; x += 32) rect(ctx, x, 900, 18, 4, C.rust);
  }
  ctx.restore();
}

export function drawLocalPitDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  now: number,
): void {
  const twitch = Math.floor(now / 180) % 2 ? 3 : 0;
  ctx.save();
  if (playerFeetY < 760) {
    line(ctx, 936 + twitch, 602, 936 + twitch, 786, C.blackTissue, 7);
    rect(ctx, 928 + twitch, 704, 22, 36, D.machinery.shadow);
    rect(ctx, 934 + twitch, 716, 10, 16, C.tissue);
    line(ctx, 1408 - twitch, 606, 1408 - twitch, 792, C.blackTissue, 7);
    rect(ctx, 1398 - twitch, 720, 24, 40, D.machinery.shadow);
    rect(ctx, 1404 - twitch, 732, 12, 18, C.oldBlood);
  }
  if (playerFeetY < 930) {
    rect(ctx, 1082, 896, 196, 10, D.steel.shadow);
    rect(ctx, 1128, 892, 82, 8, C.oldBlood);
    rect(ctx, 1202, 890, 46, 9, D.residue.base);
  }
  ctx.restore();
}
