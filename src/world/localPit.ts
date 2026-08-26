export const LOCAL_PIT_VIEW_WIDTH = 1280;
export const LOCAL_PIT_VIEW_HEIGHT = 720;
export const LOCAL_PIT_WORLD_WIDTH = 2360;
export const LOCAL_PIT_WORLD_HEIGHT = 1480;

export type LocalPitRect = { x: number; y: number; width: number; height: number };
export type LocalPitZone = 'exterior' | 'interior';
export type LocalPitStageId =
  | 'arrival-gate'
  | 'reception'
  | 'prep-bay'
  | 'arena-gate'
  | 'tutorial-battle-floor'
  | 'result-desk';

export interface LocalPitStage {
  readonly id: LocalPitStageId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

export const LOCAL_PIT_ENTRY_SPAWN = { x: 1180, y: 1320 } as const;
export const LOCAL_PIT_EXIT_ZONE: LocalPitRect = { x: 1090, y: 1370, width: 180, height: 82 };
export const LOCAL_PIT_YARD_RETURN = { x: 2768, y: 1432 } as const;
export const LOCAL_PIT_YARD_ENTRY_ZONE: LocalPitRect = { x: 2700, y: 1360, width: 128, height: 144 };

export const LOCAL_PIT_STAGES: readonly LocalPitStage[] = [
  { id: 'arrival-gate', label: 'Local Pit Arrival Gate', x: 1180, y: 1260, radius: 150 },
  { id: 'reception', label: 'Reception and Registration', x: 1120, y: 810, radius: 170 },
  { id: 'prep-bay', label: 'Creature Prep and Weigh Bay', x: 680, y: 620, radius: 180 },
  { id: 'arena-gate', label: 'Tutorial Arena Gate', x: 1450, y: 540, radius: 150 },
  { id: 'tutorial-battle-floor', label: 'Tutorial Battle Floor', x: 1800, y: 430, radius: 220 },
  { id: 'result-desk', label: 'Results and Payout Desk', x: 1160, y: 490, radius: 150 },
] as const;

const P = {
  void: '#21332d',
  grass: '#83aa5c', grassLight: '#9dc46c', grassDark: '#668b4c', grassDeep: '#4f7040',
  dirt: '#c49a61', dirtLight: '#d8b879', dirtDark: '#916f4d',
  brick: '#b56d52', brickLight: '#cb8568', brickDark: '#784c43',
  plaster: '#e4d29b', plasterShade: '#c4aa74', cream: '#f2dfae', ink: '#26382f',
  teal: '#4a8d83', tealLight: '#79b0a1', tealDark: '#315f5b',
  red: '#b95443', redDark: '#7b3d38', orange: '#d47a45', yellow: '#e4bd58',
  wood: '#8d6646', woodLight: '#b48858', woodDark: '#604735',
  steel: '#747d75', steelLight: '#aab2a5', steelDark: '#4c5751',
  glass: '#9dc8bc', glassLight: '#d4e3cf',
  sand: '#c8b47b', sandLight: '#dbc98f', sandDark: '#a28b61',
  purple: '#795b7e', pink: '#c97b86', bone: '#dfd0aa', blood: '#8f3f3f',
} as const;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function outlineRect(ctx: CanvasRenderingContext2D, box: LocalPitRect, fill: string, border: string, thickness = 3): void {
  rect(ctx, box.x, box.y, box.width, box.height, border);
  rect(ctx, box.x + thickness, box.y + thickness, box.width - thickness * 2, box.height - thickness * 2, fill);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, colour: string = P.cream, size = 12): void {
  ctx.fillStyle = colour;
  ctx.font = `700 ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, Math.round(x), Math.round(y));
}

function drawExterior(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 0, 940, LOCAL_PIT_WORLD_WIDTH, 540, P.grass);
  for (const [x, y, w, h, colour] of [
    [30, 980, 420, 120, P.grassLight], [470, 1120, 360, 140, P.grassDark],
    [1490, 1040, 420, 120, P.grassLight], [1900, 1210, 410, 170, P.grassDark],
  ] as const) rect(ctx, x, y, w, h, colour);

  rect(ctx, 1028, 920, 304, 560, P.dirtDark);
  rect(ctx, 1040, 920, 280, 560, P.dirt);
  rect(ctx, 1056, 920, 248, 560, P.dirtLight);
  for (let y = 1000; y < 1450; y += 78) {
    rect(ctx, 1084, y, 46, 5, P.dirtDark);
    rect(ctx, 1230, y + 28, 38, 5, P.dirtDark);
  }

  for (const x of [120, 330, 560, 1770, 2000, 2220]) {
    rect(ctx, x, 1120, 10, 180, P.woodDark);
    rect(ctx, x + 4, 1120, 6, 180, P.wood);
    rect(ctx, x, 1140, 140, 6, P.wood);
    rect(ctx, x, 1244, 140, 6, P.wood);
  }

  outlineRect(ctx, { x: 742, y: 1090, width: 220, height: 82 }, P.redDark, P.woodDark, 5);
  label(ctx, 'THE BRAMBLE PIT', 852, 1118, '#f6dbc8', 15);
  label(ctx, 'LOCAL LEAGUE · ARENA 1', 852, 1146, '#f0c5ae', 10);
  outlineRect(ctx, { x: 1398, y: 1100, width: 212, height: 70 }, P.tealDark, P.woodDark, 4);
  label(ctx, 'CREATURES THIS WAY', 1504, 1124, P.cream, 10);
  label(ctx, 'OWNERS: TRY TO KEEP UP', 1504, 1148, '#d8d2a4', 9);

  for (const x of [1010, 1334]) {
    rect(ctx, x, 1214, 22, 128, P.brickDark);
    rect(ctx, x + 4, 1218, 14, 120, P.brick);
    rect(ctx, x - 12, 1204, 46, 14, P.steelDark);
  }
  rect(ctx, 1010, 1228, 346, 14, P.redDark);
  rect(ctx, 1010, 1282, 346, 14, P.red);
  const light = Math.floor(now / 620) % 2 === 0;
  rect(ctx, 1036, 1248, 12, 12, light ? P.yellow : P.redDark);
  rect(ctx, 1318, 1248, 12, 12, light ? P.yellow : P.redDark);

  for (let x = 80; x < 2280; x += 146) {
    const y = 1000 + ((x * 13) % 330);
    rect(ctx, x, y, 3, 12, P.grassDeep);
    rect(ctx, x + 6, y + 4, 3, 8, P.grassDeep);
  }
}

function drawBuildingShell(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 120, 90, 2120, 870, P.brickDark);
  rect(ctx, 142, 112, 2076, 818, P.plaster);
  rect(ctx, 162, 132, 2036, 778, '#d7c68f');

  for (let y = 158; y < 900; y += 56) {
    for (let x = 184; x < 2170; x += 56) {
      const light = ((x / 56) + (y / 56)) % 2 === 0;
      rect(ctx, x, y, 52, 52, light ? '#d9d29f' : '#c7c391');
      rect(ctx, x, y + 49, 52, 3, '#aba778');
      rect(ctx, x + 49, y, 3, 52, '#aba778');
    }
  }

  rect(ctx, 142, 900, 928, 34, P.brickDark);
  rect(ctx, 1290, 900, 928, 34, P.brickDark);
  rect(ctx, 156, 906, 900, 18, P.brick);
  rect(ctx, 1304, 906, 900, 18, P.brick);
  outlineRect(ctx, { x: 1010, y: 862, width: 340, height: 56 }, P.tealDark, P.brickDark, 4);
  label(ctx, 'THE BRAMBLE PIT · FIGHTERS ENTRANCE', 1180, 890, P.cream, 13);

  rect(ctx, 120, 90, 2120, 34, P.tealDark);
  rect(ctx, 170, 76, 2020, 20, P.teal);
  outlineRect(ctx, { x: 860, y: 102, width: 640, height: 74 }, P.redDark, P.woodDark, 5);
  label(ctx, 'THE BRAMBLE PIT', 1180, 132, '#f6dbc8', 22);
  label(ctx, 'GENETIC SPORT · FAMILY ENTERTAINMENT', 1180, 156, '#e8baa7', 10);
}

function drawReception(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 520, y: 696, width: 500, height: 106 }, P.wood, P.woodDark, 5);
  rect(ctx, 534, 710, 472, 54, P.woodLight);
  rect(ctx, 548, 720, 126, 30, P.redDark);
  label(ctx, 'REGISTRATION', 611, 735, '#f4d0bc', 10);
  for (const x of [716, 766, 816]) {
    outlineRect(ctx, { x, y: 716, width: 38, height: 42 }, P.glass, P.tealDark, 3);
    rect(ctx, x + 7, 728, 24, 22, x === 766 ? P.pink : '#8fc278');
  }
  outlineRect(ctx, { x: 534, y: 654, width: 472, height: 34 }, P.tealDark, P.woodDark, 3);
  label(ctx, 'RECEPTION · REGISTRATION · WAIVERS (MOSTLY OPTIONAL)', 770, 671, P.cream, 10);
  if (Math.floor(now / 720) % 2 === 0) rect(ctx, 978, 720, 10, 10, P.yellow);

  outlineRect(ctx, { x: 1062, y: 718, width: 230, height: 76 }, '#b7c795', P.steelDark, 4);
  label(ctx, 'NEXT FIGHT', 1177, 739, P.ink, 10);
  label(ctx, 'ARENA 1 · TUTORIAL SLOT', 1177, 765, P.redDark, 11);
}

function drawPrepBay(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 286, y: 286, width: 620, height: 260 }, '#bbb88d', P.steelDark, 5);
  outlineRect(ctx, { x: 308, y: 308, width: 576, height: 44 }, P.tealDark, P.steelDark, 3);
  label(ctx, 'PREP · WEIGH · LAST-MINUTE REGRETS', 596, 330, P.cream, 11);
  outlineRect(ctx, { x: 344, y: 380, width: 492, height: 94 }, P.steel, P.steelDark, 5);
  rect(ctx, 360, 396, 460, 62, P.steelLight);
  rect(ctx, 390, 412, 146, 32, '#d8d3aa');
  label(ctx, 'WEIGH BED', 463, 428, P.ink, 10);
  for (const x of [586, 632, 678, 724, 770]) rect(ctx, x, 420, 12, 12, x === 678 && Math.floor(now / 500) % 2 === 0 ? P.yellow : P.tealDark);

  outlineRect(ctx, { x: 306, y: 574, width: 218, height: 120 }, '#91a66d', P.woodDark, 4);
  for (let x = 320; x < 510; x += 24) rect(ctx, x, 586, 3, 96, P.wood);
  rect(ctx, 366, 626, 74, 26, P.bone);
  rect(ctx, 424, 612, 40, 32, P.bone);
  rect(ctx, 450, 602, 14, 18, P.pink);
  label(ctx, 'HOLDING PEN', 415, 682, P.ink, 9);

  outlineRect(ctx, { x: 742, y: 570, width: 164, height: 126 }, P.glass, P.tealDark, 4);
  rect(ctx, 756, 586, 136, 94, '#93c394');
  for (let x = 770; x < 890; x += 28) rect(ctx, x, 588, 3, 90, P.tealDark);
  label(ctx, 'DECON-ish', 824, 682, P.ink, 9);
}

function drawResultDesk(ctx: CanvasRenderingContext2D): void {
  outlineRect(ctx, { x: 990, y: 286, width: 350, height: 98 }, P.wood, P.woodDark, 5);
  rect(ctx, 1006, 302, 318, 48, P.woodLight);
  outlineRect(ctx, { x: 1030, y: 240, width: 270, height: 38 }, P.redDark, P.woodDark, 3);
  label(ctx, 'RESULTS · PAYOUTS · MEDICAL FORMS', 1165, 259, '#f5d1bc', 10);
  rect(ctx, 1030, 324, 78, 14, P.yellow);
  rect(ctx, 1128, 324, 78, 14, P.tealDark);
  rect(ctx, 1226, 324, 78, 14, P.purple);
}

function drawArena(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 1488, 206, 638, 458, P.steelDark);
  rect(ctx, 1512, 230, 590, 410, P.sandDark);
  rect(ctx, 1530, 248, 554, 374, P.sand);
  for (let y = 270; y < 600; y += 68) {
    const offset = ((y / 68) % 2) * 30;
    for (let x = 1550 + offset; x < 2050; x += 96) rect(ctx, x, y, 44, 5, P.sandLight);
  }
  rect(ctx, 1738, 396, 124, 18, P.blood);
  rect(ctx, 1770, 414, 72, 10, '#a5524d');

  for (let x = 1510; x < 2110; x += 44) {
    if (x >= 1498 && x <= 1536) continue;
    rect(ctx, x, 214, 8, 32, P.steelLight);
    rect(ctx, x, 628, 8, 34, P.steelLight);
  }
  for (let y = 226; y < 650; y += 44) rect(ctx, 2090, y, 8, 34, P.steelLight);
  for (const y of [240, 284, 328, 372, 596]) rect(ctx, 1492, y, 8, 32, P.steelLight);

  outlineRect(ctx, { x: 1420, y: 488, width: 120, height: 104 }, P.redDark, P.steelDark, 4);
  label(ctx, 'ARENA 1', 1480, 512, '#f3c6b0', 12);
  label(ctx, 'GATE', 1480, 536, '#f3c6b0', 10);
  if (Math.floor(now / 600) % 2 === 0) rect(ctx, 1468, 558, 24, 10, P.yellow);

  outlineRect(ctx, { x: 1640, y: 166, width: 324, height: 44 }, P.tealDark, P.steelDark, 4);
  label(ctx, 'FIRST FIGHT / TRAINING SLOT', 1802, 188, P.cream, 11);

  for (const [x, y] of [[1540, 680], [1760, 680], [1980, 680]] as const) {
    outlineRect(ctx, { x, y, width: 170, height: 70 }, P.brick, P.brickDark, 4);
    for (let row = 0; row < 3; row += 1) rect(ctx, x + 12, y + 12 + row * 17, 146, 10, row % 2 ? P.brickLight : P.plasterShade);
  }
}

function drawAmbientInterior(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 1870, y: 760, width: 210, height: 92 }, P.tealDark, P.steelDark, 4);
  label(ctx, 'GENE TONIC', 1975, 785, P.cream, 12);
  label(ctx, '“Probably legal”', 1975, 812, '#d6d0a1', 9);
  rect(ctx, 1900, 824, 28, 12, P.yellow);
  rect(ctx, 1942, 824, 28, 12, P.pink);
  rect(ctx, 1984, 824, 28, 12, P.orange);
  rect(ctx, 2026, 824, 28, 12, P.purple);

  outlineRect(ctx, { x: 1530, y: 788, width: 252, height: 74 }, P.redDark, P.woodDark, 4);
  label(ctx, 'PIT RULES', 1656, 808, '#f4c9b4', 10);
  label(ctx, '1. Sign waiver', 1656, 830, '#f0d5c5', 9);
  label(ctx, '2. Try not to die', 1656, 848, '#f0d5c5', 9);

  const pulse = Math.floor(now / 420) % 6;
  for (let i = 0; i < 6; i += 1) rect(ctx, 330 + i * 46, 192, 26, 12, i === pulse ? P.yellow : P.tealDark);
}

function drawHappyLayerGrime(ctx: CanvasRenderingContext2D): void {
  const grime = '#5b5847';
  const grimeDark = '#45463b';
  const rust = '#8e553f';
  const rustDark = '#68443a';
  const damp = '#657356';
  const oldBlood = '#744044';
  const oil = '#3d4741';

  // Exterior: churned mud, old tyre tracks, patched boards and rust bleed.
  for (const [x, y, w] of [[1058, 1018, 96], [1160, 1088, 112], [1098, 1180, 136], [1148, 1358, 94]] as const) {
    rect(ctx, x, y, w, 9, grime);
    rect(ctx, x + 18, y + 8, Math.max(18, w - 38), 5, grimeDark);
  }
  for (const [x, y] of [[996, 1210], [1334, 1210], [120, 1134], [330, 1134], [2000, 1134]] as const) {
    rect(ctx, x, y, 10, 34, rustDark);
    rect(ctx, x + 3, y + 12, 7, 24, rust);
  }
  for (const [x, y, w] of [[748, 1162, 198], [1408, 1160, 188]] as const) {
    rect(ctx, x, y, w, 4, grimeDark);
    rect(ctx, x + 22, y + 5, 42, 3, rust);
    rect(ctx, x + w - 68, y + 6, 46, 3, rustDark);
  }

  // Interior floor: damp staining and scuffs around the traffic lanes.
  for (const [x, y, w, h] of [
    [188, 830, 250, 24], [1040, 820, 320, 20], [1310, 720, 124, 22],
    [934, 560, 180, 18], [1178, 424, 174, 18], [516, 574, 194, 16],
  ] as const) {
    rect(ctx, x, y, w, h, damp);
    rect(ctx, x + 18, y + h - 5, Math.max(20, w - 42), 5, grimeDark);
  }
  for (const [x, y, w] of [[228, 742, 108], [400, 812, 88], [1010, 610, 122], [1260, 684, 96], [1820, 872, 138]] as const) {
    rect(ctx, x, y, w, 5, grimeDark);
    rect(ctx, x + 16, y + 7, Math.max(14, w - 44), 3, grime);
  }

  // Prep bay: dirty machinery, cage runoff and old stains nobody has cleaned properly.
  rect(ctx, 348, 462, 486, 8, oil);
  rect(ctx, 390, 456, 118, 5, oldBlood);
  rect(ctx, 446, 468, 44, 4, oldBlood);
  for (const x of [330, 378, 426, 474, 770, 826, 876]) {
    rect(ctx, x, 686, 8, 14, grimeDark);
    rect(ctx, x + 2, 686, 5, 9, damp);
  }
  rect(ctx, 748, 576, 10, 110, grimeDark);
  rect(ctx, 752, 616, 7, 70, damp);
  rect(ctx, 820, 674, 58, 7, '#7f805e');

  // Reception and results: sticky counter edges and badly wiped surfaces.
  rect(ctx, 538, 758, 462, 8, grimeDark);
  rect(ctx, 578, 752, 142, 5, grime);
  rect(ctx, 842, 752, 96, 4, oldBlood);
  rect(ctx, 1008, 344, 314, 8, grimeDark);
  rect(ctx, 1190, 339, 82, 5, rustDark);

  // Arena: rusted rails, filthy sand edges, drain-like dark patches and historic blood.
  for (const x of [1512, 1600, 1732, 1864, 1996, 2088]) {
    rect(ctx, x, 212, 8, 30, rustDark);
    rect(ctx, x + 2, 222, 6, 19, rust);
  }
  rect(ctx, 1532, 612, 548, 9, grimeDark);
  rect(ctx, 1580, 604, 168, 6, oil);
  rect(ctx, 1938, 602, 104, 6, oldBlood);
  rect(ctx, 1678, 456, 72, 10, oldBlood);
  rect(ctx, 1694, 466, 42, 6, '#663b3e');
  rect(ctx, 1886, 328, 86, 7, grime);
  rect(ctx, 1904, 335, 48, 5, grimeDark);

  // Wall damage: small cracks and damp streaks, visible but still readable as the bright layer.
  for (const [x, y] of [[210, 224], [458, 166], [970, 198], [1360, 168], [2110, 256], [2060, 704]] as const) {
    rect(ctx, x, y, 4, 34, grimeDark);
    rect(ctx, x + 4, y + 20, 18, 4, grimeDark);
    rect(ctx, x + 18, y + 20, 4, 16, grimeDark);
  }
  for (const [x, y, h] of [[174, 286, 118], [2168, 326, 164], [146, 720, 124], [2190, 742, 108]] as const) {
    rect(ctx, x, y, 7, h, damp);
    rect(ctx, x + 5, y + 36, 4, Math.max(18, h - 52), grime);
  }
}

export const LOCAL_PIT_COLLIDERS: readonly LocalPitRect[] = [
  { x: 120, y: 90, width: 2120, height: 34 },
  { x: 120, y: 90, width: 34, height: 844 },
  { x: 2206, y: 90, width: 34, height: 844 },
  { x: 120, y: 900, width: 950, height: 34 },
  { x: 1290, y: 900, width: 950, height: 34 },
  { x: 520, y: 696, width: 500, height: 106 },
  { x: 286, y: 286, width: 620, height: 260 },
  { x: 306, y: 574, width: 218, height: 120 },
  { x: 742, y: 570, width: 164, height: 126 },
  { x: 990, y: 286, width: 350, height: 98 },
  { x: 1488, y: 206, width: 638, height: 24 },
  { x: 2088, y: 206, width: 38, height: 458 },
  { x: 1488, y: 640, width: 638, height: 24 },
  { x: 1488, y: 206, width: 36, height: 282 },
  { x: 1488, y: 592, width: 36, height: 72 },
  { x: 1870, y: 760, width: 210, height: 92 },
  { x: 1530, y: 788, width: 252, height: 74 },
  { x: 1000, y: 1200, width: 38, height: 154 },
  { x: 1328, y: 1200, width: 38, height: 154 },
];

function overlaps(a: LocalPitRect, b: LocalPitRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function pointInsideLocalPitRect(x: number, y: number, box: LocalPitRect): boolean {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

export function localPitZoneAt(_x: number, y: number): LocalPitZone {
  return y >= 940 ? 'exterior' : 'interior';
}

export function isLocalPitPositionBlocked(feetX: number, feetY: number): boolean {
  const hitbox: LocalPitRect = { x: feetX - 11, y: feetY - 13, width: 22, height: 15 };
  if (hitbox.x < 18 || hitbox.y < 18 || hitbox.x + hitbox.width > LOCAL_PIT_WORLD_WIDTH - 18 || hitbox.y + hitbox.height > LOCAL_PIT_WORLD_HEIGHT - 18) return true;
  return LOCAL_PIT_COLLIDERS.some((collider) => overlaps(hitbox, collider));
}

export function nearestLocalPitStage(feetX: number, feetY: number): LocalPitStage | null {
  let nearest: LocalPitStage | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const stage of LOCAL_PIT_STAGES) {
    const distance = Math.hypot(feetX - stage.x, feetY - stage.y);
    if (distance <= stage.radius && distance < nearestDistance) {
      nearest = stage;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function drawLocalPitBase(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  rect(ctx, 0, 0, LOCAL_PIT_WORLD_WIDTH, LOCAL_PIT_WORLD_HEIGHT, P.void);
  drawExterior(ctx, now);
  drawBuildingShell(ctx);
  drawReception(ctx, now);
  drawPrepBay(ctx, now);
  drawResultDesk(ctx);
  drawArena(ctx, now);
  drawAmbientInterior(ctx, now);
  drawHappyLayerGrime(ctx);
  ctx.restore();
}

export function drawLocalPitForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (playerFeetY >= 900) {
    rect(ctx, 1038, 898, 284, 20, P.tealDark);
    rect(ctx, 1060, 918, 240, 14, P.teal);
    for (const x of [1070, 1278]) rect(ctx, x, 916, 12, 82, P.brickDark);
  }
  ctx.restore();
}
