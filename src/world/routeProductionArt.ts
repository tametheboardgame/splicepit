import {
  ENVIRONMENT_MATERIALS,
  drawEnvironmentContactShadow,
  drawPixelRect,
} from '../environment/environmentArtLanguage.js';

export const ROUTE_PRODUCTION_ART_CONTRACT = {
  locationId: 'route',
  geometryId: 'opening-world-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  brightDetailGroups: [
    'road-edge-and-wear',
    'terrain-transitions',
    'drainage-and-verges',
    'fencing-and-signage',
    'local-infrastructure',
    'navigation-landmarks',
    'vegetation-clusters',
    'route-storytelling',
  ] as const,
  darkStoryGroups: [
    'contaminated-runoff',
    'dead-vegetation',
    'biological-intrusion',
    'damaged-signage',
    'wrong-shadow-pockets',
    'off-route-horror',
  ] as const,
} as const;

const M = ENVIRONMENT_MATERIALS;
const B = {
  wood: M.wood.bright,
  steel: M.steel.bright,
  dirt: M.dirt.bright,
  grass: M.grass.bright,
  machinery: M.machinery.bright,
  residue: M['biological-residue'].bright,
} as const;
const D = {
  wood: M.wood.dark,
  steel: M.steel.dark,
  dirt: M.dirt.dark,
  grass: M.grass.dark,
  machinery: M.machinery.dark,
  residue: M['biological-residue'].dark,
} as const;

const C = {
  cream: '#f2dfae',
  ink: '#26382f',
  warning: '#e2bd5d',
  rust: '#a55d42',
  copper: '#b66f47',
  water: '#527f7d',
  waterLight: '#78a39b',
  flower: '#c97c86',
  purple: '#795b7e',
  oldBlood: '#74333b',
  tissue: '#8b4b5b',
  tissuePale: '#a76d79',
  fungus: '#73515f',
  deadLeaf: '#74654e',
  wrongShadow: 'rgba(29,20,28,0.55)',
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

function vergeGrass(ctx: CanvasRenderingContext2D, x: number, y: number, dark = false): void {
  const grass = dark ? D.grass : B.grass;
  rect(ctx, x, y + 5, 3, 9, grass.shadow);
  rect(ctx, x + 5, y + 2, 3, 12, grass.base);
  rect(ctx, x + 10, y + 7, 3, 7, grass.highlight);
  rect(ctx, x + 4, y + 11, 8, 3, grass.shadow);
}

function flowerCluster(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  for (const [ox, oy, bloom] of [[0, 0, C.flower], [13, 5, C.purple], [25, 1, C.cream]] as const) {
    rect(ctx, x + ox + 4, y + oy + 7, 2, 9, B.grass.shadow);
    rect(ctx, x + ox, y + oy + 2, 5, 5, bloom);
    rect(ctx, x + ox + 5, y + oy, 5, 5, bloom);
    rect(ctx, x + ox + 3, y + oy + 4, 5, 5, C.warning);
  }
}

function fenceRun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  vertical = false,
  dark = false,
): void {
  const wood = dark ? D.wood : B.wood;
  const postCount = Math.max(2, Math.floor(length / 52));
  for (let i = 0; i <= postCount; i += 1) {
    const offset = (length * i) / postCount;
    const px = vertical ? x : x + offset;
    const py = vertical ? y + offset : y;
    rect(ctx, px - 3, py - 14, 7, 30, wood.shadow);
    rect(ctx, px - 1, py - 12, 4, 26, wood.base);
    rect(ctx, px, py - 10, 2, 8, wood.highlight);
  }
  if (vertical) {
    rect(ctx, x - 2, y - 7, 5, length + 14, wood.shadow);
    rect(ctx, x, y - 5, 2, length + 10, wood.highlight);
  } else {
    rect(ctx, x, y - 5, length, 5, wood.shadow);
    rect(ctx, x + 2, y - 3, length - 4, 2, wood.highlight);
  }
}

function routeSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  dark = false,
): void {
  const wood = dark ? D.wood : B.wood;
  const steel = dark ? D.steel : B.steel;
  rect(ctx, x + 8, y + 28, 7, 35, steel.shadow);
  rect(ctx, x + 10, y + 29, 4, 34, steel.base);
  rect(ctx, x, y, width, 31, wood.shadow);
  rect(ctx, x + 4, y + 4, width - 8, 23, wood.base);
  rect(ctx, x + 6, y + 5, width - 12, 3, wood.highlight);
  ctx.fillStyle = dark ? '#b39a83' : C.cream;
  ctx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + width / 2, y + 16);
}

function drawRoadWearBright(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.globalAlpha = 0.7;
  for (const [x, y, w] of [
    [1606, 634, 74], [1702, 682, 58], [1790, 646, 94], [1910, 686, 64], [2004, 640, 74],
    [2114, 748, 36], [2086, 836, 58], [2120, 930, 44], [2088, 1038, 62], [2112, 1168, 46],
    [2090, 1284, 66], [2190, 1404, 72], [2324, 1450, 54], [2482, 1408, 80], [2660, 1446, 72],
  ] as const) {
    rect(ctx, x, y, w, 4, B.dirt.shadow);
    rect(ctx, x + Math.round(w * 0.22), y + 7, Math.max(16, Math.round(w * 0.52)), 3, B.dirt.highlight);
  }
  ctx.restore();

  for (const [x, y] of [[1660, 620], [1850, 704], [2042, 614], [2070, 770], [2162, 1088], [2268, 1378], [2570, 1465]] as const) {
    rect(ctx, x, y, 18, 3, B.dirt.shadow);
    rect(ctx, x + 5, y + 3, 4, 6, B.dirt.shadow);
  }
}

function drawDrainageBright(ctx: CanvasRenderingContext2D, now: number): void {
  // Yard-side road ditch and stone-edged culvert.
  rect(ctx, 1584, 730, 474, 11, B.dirt.shadow);
  rect(ctx, 1592, 733, 458, 5, C.water);
  for (let x = 1610; x < 2030; x += 56) rect(ctx, x, 732, 24, 2, C.waterLight);
  rect(ctx, 2018, 724, 40, 22, B.steel.shadow);
  for (let x = 2023; x < 2054; x += 8) rect(ctx, x, 727, 4, 16, B.steel.highlight);

  // South-road open drain with intermittent flow.
  rect(ctx, 2214, 724, 12, 590, B.dirt.shadow);
  rect(ctx, 2217, 732, 6, 574, C.water);
  const shift = Math.floor(now / 480) % 2 ? 3 : 0;
  for (let y = 758; y < 1290; y += 72) rect(ctx, 2218, y + shift, 4, 22, C.waterLight);

  // Pit-road gutter and grated crossing.
  rect(ctx, 2190, 1510, 610, 10, B.dirt.shadow);
  rect(ctx, 2200, 1512, 592, 4, C.water);
  rect(ctx, 2460, 1490, 82, 22, B.steel.shadow);
  for (let x = 2466; x < 2536; x += 10) rect(ctx, x, 1493, 4, 16, B.steel.highlight);
}

function drawInfrastructureBright(ctx: CanvasRenderingContext2D, now: number): void {
  // Utility poles and a low service cable linking local sites.
  for (const [x, y] of [[1750, 560], [1960, 560], [2280, 452], [2290, 1230], [2710, 1320]] as const) {
    drawEnvironmentContactShadow(ctx, x + 4, y + 76, 12, 4);
    rect(ctx, x, y, 8, 80, B.wood.shadow);
    rect(ctx, x + 3, y, 5, 78, B.wood.base);
    rect(ctx, x - 8, y + 12, 25, 5, B.steel.shadow);
    rect(ctx, x - 5, y + 13, 19, 2, B.steel.highlight);
    rect(ctx, x - 4, y + 8, 5, 6, C.cream);
    rect(ctx, x + 11, y + 8, 5, 6, C.cream);
  }

  // Small roadside sample pump, visible but outside the path lane.
  drawEnvironmentContactShadow(ctx, 1988, 784, 34, 7);
  rect(ctx, 1968, 742, 48, 40, B.machinery.shadow);
  rect(ctx, 1973, 738, 38, 40, B.machinery.base);
  rect(ctx, 1978, 744, 18, 12, B.machinery.highlight);
  rect(ctx, 2002, 746, 5, 8, Math.floor(now / 420) % 2 === 0 ? C.warning : B.machinery.shadow);
  rect(ctx, 1982, 778, 5, 24, C.copper);
  rect(ctx, 1982, 798, 25, 5, C.copper);

  // Lab spur service markers.
  for (const x of [2228, 2318, 2408]) {
    rect(ctx, x, 616, 7, 34, B.steel.shadow);
    rect(ctx, x + 2, 616, 4, 30, B.steel.base);
    rect(ctx, x - 3, 614, 13, 7, C.warning);
    rect(ctx, x, 616, 7, 3, C.ink);
  }
}

function drawLandmarksBright(ctx: CanvasRenderingContext2D, now: number): void {
  routeSign(ctx, 1810, 566, 112, "MASTER'S LAB →");
  routeSign(ctx, 2290, 1322, 104, 'LOCAL PIT →');

  // Old Toll lay-by, a patched inspection shelter that can later host the debt encounter.
  drawEnvironmentContactShadow(ctx, 1950, 1024, 92, 10);
  rect(ctx, 1888, 920, 132, 100, B.wood.shadow);
  rect(ctx, 1895, 928, 118, 84, '#c6ad76');
  rect(ctx, 1880, 910, 148, 22, B.steel.shadow);
  rect(ctx, 1888, 904, 132, 18, '#668079');
  rect(ctx, 1906, 950, 42, 54, B.wood.shadow);
  rect(ctx, 1958, 948, 38, 28, '#88afa7');
  rect(ctx, 1962, 952, 30, 20, '#bfd4bc');
  rect(ctx, 1898, 934, 104, 9, C.cream);
  ctx.fillStyle = C.ink;
  ctx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OLD TOLL • INSPECTION', 1950, 941);
  rect(ctx, 2014, 988, 24, 14, B.machinery.shadow);
  rect(ctx, 2018, 990, 16, 10, Math.floor(now / 600) % 2 === 0 ? C.warning : '#8aae68');

  // Pit approach marker posts and cheap fight-night advertising board.
  for (const x of [2410, 2580, 2750]) {
    rect(ctx, x, 1332, 8, 46, B.wood.shadow);
    rect(ctx, x + 3, 1334, 4, 40, B.wood.base);
    rect(ctx, x - 4, 1330, 16, 9, C.warning);
  }
  rect(ctx, 2634, 1306, 116, 42, B.wood.shadow);
  rect(ctx, 2640, 1312, 104, 30, '#a86652');
  ctx.fillStyle = C.cream;
  ctx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('PIT NIGHT • CHEAP', 2692, 1327);
  ctx.fillText('ENTRY / WORSE ODDS', 2692, 1338);
}

function drawVegetationBright(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, y] of [
    [1580, 570], [1650, 744], [1736, 750], [1826, 574], [1990, 726],
    [2028, 810], [2240, 700], [2246, 850], [2244, 1120], [2022, 1240],
    [2250, 1350], [2370, 1518], [2540, 1348], [2780, 1512],
  ] as const) vergeGrass(ctx, x, y);

  flowerCluster(ctx, 1680, 746);
  flowerCluster(ctx, 2260, 1128);
  flowerCluster(ctx, 2590, 1350);

  // Deliberate shrub clusters rather than repeated filler.
  for (const [x, y, scale] of [[1820, 760, 1], [2280, 784, 1.2], [2290, 1180, 1], [2820, 1500, 1.1]] as const) {
    const s = scale;
    rect(ctx, x, y + 12 * s, 46 * s, 18 * s, B.grass.shadow);
    rect(ctx, x + 5 * s, y + 5 * s, 20 * s, 19 * s, B.grass.base);
    rect(ctx, x + 20 * s, y + 1 * s, 22 * s, 22 * s, B.grass.base);
    rect(ctx, x + 9 * s, y + 8 * s, 12 * s, 8 * s, B.grass.highlight);
    if (Math.floor(now / 800) % 2 === 0) rect(ctx, x + 29 * s, y + 7 * s, 5 * s, 5 * s, C.flower);
  }
}

export function drawRouteBrightProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawRoadWearBright(ctx);
  drawDrainageBright(ctx, now);
  drawInfrastructureBright(ctx, now);
  drawVegetationBright(ctx, now);
  drawLandmarksBright(ctx, now);
  fenceRun(ctx, 1608, 584, 210);
  fenceRun(ctx, 2250, 662, 168, true);
  fenceRun(ctx, 2246, 1288, 250);
  ctx.restore();
}

function drawDeadVegetation(ctx: CanvasRenderingContext2D): void {
  for (const [x, y] of [
    [1580, 570], [1650, 744], [1736, 750], [1826, 574], [1990, 726],
    [2028, 810], [2240, 700], [2246, 850], [2244, 1120], [2022, 1240],
    [2250, 1350], [2370, 1518], [2540, 1348], [2780, 1512],
  ] as const) {
    rect(ctx, x, y + 4, 3, 11, D.grass.shadow);
    rect(ctx, x + 5, y + 7, 3, 8, C.deadLeaf);
    rect(ctx, x + 10, y + 2, 3, 13, D.grass.base);
    rect(ctx, x + 3, y + 12, 9, 3, C.fungus);
  }
}

function drawContaminatedDrainage(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 1586, 729, 472, 14, D.dirt.shadow);
  rect(ctx, 1594, 733, 456, 7, '#4f5144');
  for (let x = 1604; x < 2044; x += 48) {
    rect(ctx, x, 734, 24, 3, x % 96 === 4 ? D.residue.base : C.oldBlood);
    rect(ctx, x + 10, 738, 12, 3, D.residue.highlight);
  }
  rect(ctx, 2018, 724, 40, 23, D.steel.shadow);
  rect(ctx, 2024, 728, 28, 8, D.residue.base);
  rect(ctx, 2034, 736, 16, 10, C.tissue);

  rect(ctx, 2212, 724, 16, 590, D.dirt.shadow);
  rect(ctx, 2216, 732, 8, 574, '#4b4e43');
  const pulse = Math.floor(now / 360) % 2;
  for (let y = 754; y < 1290; y += 62) {
    rect(ctx, 2217, y, 6, 28, pulse ? D.residue.base : C.oldBlood);
    rect(ctx, 2223, y + 14, 8, 5, C.tissue);
  }

  rect(ctx, 2188, 1508, 612, 14, D.dirt.shadow);
  rect(ctx, 2200, 1512, 590, 7, '#4c4e42');
  for (let x = 2240; x < 2780; x += 74) rect(ctx, x, 1512, 34, 5, D.residue.base);
  rect(ctx, 2460, 1490, 82, 24, D.steel.shadow);
  rect(ctx, 2472, 1493, 38, 15, C.oldBlood);
  rect(ctx, 2516, 1491, 20, 20, C.tissue);
}

function drawBiologicalIntrusion(ctx: CanvasRenderingContext2D, now: number): void {
  // Growth following fence joins and utility hardware, not free-floating decoration.
  for (const [x, y] of [[1660, 584], [1762, 584], [2248, 742], [2248, 1060], [2340, 1288], [2450, 1288]] as const) {
    rect(ctx, x, y - 9, 24, 8, D.residue.shadow);
    rect(ctx, x + 5, y - 14, 9, 15, D.residue.base);
    rect(ctx, x + 12, y - 18, 5, 11, C.tissuePale);
    rect(ctx, x + 18, y - 6, 10, 5, C.tissue);
  }

  // One roadside cable has become a vascular-looking conduit.
  rect(ctx, 1968, 740, 48, 42, D.machinery.shadow);
  rect(ctx, 1974, 744, 36, 32, D.machinery.base);
  rect(ctx, 1982, 776, 7, 28, C.tissue);
  rect(ctx, 1987, 798, 24, 7, C.tissuePale);
  rect(ctx, 2004, 750, 6, 10, Math.floor(now / 260) % 2 === 0 ? '#a34e5a' : D.machinery.accent ?? C.oldBlood);

  // Something has grown up through the cheap Pit advertising board.
  rect(ctx, 2634, 1306, 116, 43, D.wood.shadow);
  rect(ctx, 2640, 1312, 104, 30, '#5b4344');
  rect(ctx, 2660, 1300, 10, 46, D.residue.base);
  rect(ctx, 2668, 1305, 20, 8, C.tissue);
  rect(ctx, 2702, 1322, 34, 9, C.oldBlood);
}

function drawWrongShadows(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.fillStyle = C.wrongShadow;
  ctx.beginPath();
  ctx.ellipse(1812, 806, 88, 22, -0.2, 0, Math.PI * 2);
  ctx.ellipse(2308, 914, 70, 18, 0.35, 0, Math.PI * 2);
  ctx.ellipse(2770, 1284, 102, 24, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Silhouette glimpses sit off the traversable road and twitch by a pixel or two.
  const twitch = Math.floor(now / 240) % 2;
  rect(ctx, 1818 + twitch, 770, 18, 40, '#30262d');
  rect(ctx, 1810 + twitch, 782, 34, 12, '#30262d');
  rect(ctx, 1821 + twitch, 758, 11, 16, '#30262d');
  rect(ctx, 2774 - twitch, 1242, 16, 45, '#2e252b');
  rect(ctx, 2765 - twitch, 1250, 35, 11, '#2e252b');
}

function drawDamagedLandmarks(ctx: CanvasRenderingContext2D, now: number): void {
  routeSign(ctx, 1810, 566, 112, "MASTER'S LAB ?", true);
  rect(ctx, 1836, 570, 18, 4, C.oldBlood);
  rect(ctx, 1888, 584, 24, 5, D.residue.base);
  routeSign(ctx, 2290, 1322, 104, 'LOCAL PIT ↓', true);
  rect(ctx, 2302, 1331, 58, 5, C.oldBlood);
  rect(ctx, 2350, 1316, 30, 8, D.residue.shadow);

  // Old Toll is the same shelter, but its inspection purpose has become much less reassuring.
  rect(ctx, 1888, 920, 132, 100, D.wood.shadow);
  rect(ctx, 1895, 928, 118, 84, '#675d50');
  rect(ctx, 1880, 910, 148, 22, D.steel.shadow);
  rect(ctx, 1888, 904, 132, 18, '#46534e');
  rect(ctx, 1906, 950, 42, 54, '#423338');
  rect(ctx, 1958, 948, 38, 28, '#3b5653');
  rect(ctx, 1964, 954, 26, 17, '#5f454d');
  rect(ctx, 1898, 934, 104, 9, '#7e6f5b');
  ctx.fillStyle = '#c0a48d';
  ctx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OLD TOLL • HOLD', 1950, 941);
  rect(ctx, 1968, 992, 34, 8, C.oldBlood);
  rect(ctx, 1996, 978, 14, 22, D.residue.base);
  rect(ctx, 2018, 990, 16, 10, Math.floor(now / 210) % 3 === 0 ? '#9b4550' : '#3b3434');

  // Discarded evidence, outside the roadway but visible from it.
  rect(ctx, 2310, 1188, 72, 24, '#38323a');
  rect(ctx, 2318, 1184, 54, 23, '#5b4b52');
  rect(ctx, 2327, 1187, 9, 8, C.tissuePale);
  rect(ctx, 2370, 1195, 12, 6, C.oldBlood);
  rect(ctx, 2810, 1528, 44, 20, '#39323a');
  rect(ctx, 2817, 1523, 30, 21, '#594850');
}

export function drawRouteDarkProductionArt(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawContaminatedDrainage(ctx, now);
  drawDeadVegetation(ctx);
  fenceRun(ctx, 1608, 584, 210, false, true);
  fenceRun(ctx, 2250, 662, 168, true, true);
  fenceRun(ctx, 2246, 1288, 250, false, true);
  drawBiologicalIntrusion(ctx, now);
  drawWrongShadows(ctx, now);
  drawDamagedLandmarks(ctx, now);
  ctx.restore();
}

function ifBehind(playerFeetY: number, sortY: number, draw: () => void): void {
  if (sortY > playerFeetY) draw();
}

export function drawRouteBrightProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ifBehind(playerFeetY, 650, () => {
    rect(ctx, 1810, 597, 112, 5, B.wood.shadow);
    rect(ctx, 1818, 598, 96, 2, B.wood.highlight);
  });
  ifBehind(playerFeetY, 1020, () => {
    rect(ctx, 1888, 1012, 132, 8, B.wood.shadow);
    rect(ctx, 1898, 1012, 112, 3, B.wood.highlight);
  });
  ifBehind(playerFeetY, 1378, () => {
    rect(ctx, 2290, 1353, 104, 6, B.wood.shadow);
    rect(ctx, 2300, 1354, 84, 2, B.wood.highlight);
  });
  ctx.restore();
}

export function drawRouteDarkProductionArtForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ifBehind(playerFeetY, 650, () => {
    rect(ctx, 1810, 596, 112, 7, D.wood.shadow);
    rect(ctx, 1844, 592, 42, 10, D.residue.base);
  });
  ifBehind(playerFeetY, 1020, () => {
    rect(ctx, 1888, 1010, 132, 10, D.wood.shadow);
    rect(ctx, 1930, 1006, 54, 12, C.oldBlood);
  });
  ifBehind(playerFeetY, 1378, () => {
    rect(ctx, 2290, 1351, 104, 9, D.wood.shadow);
    rect(ctx, 2324, 1346, 48, 12, D.residue.shadow);
  });
  ctx.restore();
}
