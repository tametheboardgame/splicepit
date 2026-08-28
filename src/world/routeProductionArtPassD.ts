import { drawPixelRect } from '../environment/environmentArtLanguage.js';

export const ROUTE_PRODUCTION_ART_CONTRACT = {
  locationId: 'route',
  geometryId: 'opening-world-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  activeArtGeneration: 'graphics-tightening-pass-d' as const,
  qualityReference: 'master-lab-and-approved-protagonists' as const,
  replacementMode: 'authored-route-plates-not-legacy-overlay-stack' as const,
  brightDetailGroups: [
    'authored-road-surface',
    'lab-approach',
    'old-toll-debt-layby',
    'pit-approach',
    'drainage-and-verges',
    'animal-transport-remnants',
    'utility-infrastructure',
    'foreground-depth',
  ] as const,
  darkStoryGroups: [
    'contaminated-drainage',
    'organic-road-intrusion',
    'wrong-toll-shadow',
    'dead-verges',
    'damaged-route-signage',
    'pit-bound-residue',
    'foreground-tissue',
  ] as const,
} as const;

interface Palette {
  grass: string;
  grassLight: string;
  grassDark: string;
  grassDeep: string;
  road: string;
  roadLight: string;
  roadDark: string;
  dirt: string;
  dirtLight: string;
  dirtDark: string;
  steel: string;
  steelLight: string;
  steelDark: string;
  timber: string;
  timberLight: string;
  timberDark: string;
  concrete: string;
  concreteLight: string;
  concreteDark: string;
  warning: string;
  cream: string;
  ink: string;
  rust: string;
  water: string;
  waterLight: string;
  organic: string;
  organicLight: string;
  blood: string;
}

const BRIGHT: Palette = {
  grass: '#708d53', grassLight: '#8eaa65', grassDark: '#506843', grassDeep: '#3b5240',
  road: '#7b7567', roadLight: '#958c79', roadDark: '#57554d',
  dirt: '#a8875e', dirtLight: '#c4a06e', dirtDark: '#765d47',
  steel: '#687671', steelLight: '#899890', steelDark: '#3f4c49',
  timber: '#7b5d43', timberLight: '#9d7650', timberDark: '#4b3a31',
  concrete: '#938e79', concreteLight: '#aaa58d', concreteDark: '#656256',
  warning: '#d4ad50', cream: '#ead7a7', ink: '#26342f', rust: '#a35f45',
  water: '#547d78', waterLight: '#7fa69a',
  organic: '#7b4655', organicLight: '#a45f6c', blood: '#78363e',
};

const DARK: Palette = {
  grass: '#35443a', grassLight: '#435144', grassDark: '#25342f', grassDeep: '#1a2927',
  road: '#4b4944', roadLight: '#5b5750', roadDark: '#303234',
  dirt: '#5e5044', dirtLight: '#756354', dirtDark: '#3b3432',
  steel: '#495651', steelLight: '#657069', steelDark: '#29332f',
  timber: '#59443d', timberLight: '#705449', timberDark: '#2d2928',
  concrete: '#625f57', concreteLight: '#777268', concreteDark: '#3e3d3a',
  warning: '#82684a', cream: '#9e927d', ink: '#1d2726', rust: '#71453f',
  water: '#3b5555', waterLight: '#55716a',
  organic: '#6d3847', organicLight: '#985666', blood: '#632f38',
};

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
  ctx.fillStyle = dark ? 'rgba(17,18,20,0.5)' : 'rgba(30,38,35,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEastRoad(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // Yard -> Lab approach. Irregular shoulders deliberately obscure the old generic road rectangle.
  polygon(ctx, [
    [1510, 566], [1600, 552], [1700, 562], [1810, 548], [1930, 558], [2046, 552],
    [2062, 612], [2052, 714], [1940, 724], [1832, 716], [1720, 730], [1608, 716], [1510, 724],
  ], p.grassDark);
  polygon(ctx, [
    [1530, 600], [1624, 586], [1718, 594], [1814, 582], [1934, 590], [2040, 586],
    [2048, 620], [2038, 686], [1932, 696], [1824, 688], [1714, 702], [1610, 690], [1530, 698],
  ], p.roadDark);
  polygon(ctx, [
    [1540, 616], [1630, 604], [1720, 612], [1816, 600], [1932, 608], [2028, 604],
    [2034, 626], [2026, 672], [1928, 680], [1822, 672], [1712, 686], [1614, 674], [1540, 682],
  ], p.road);

  // Wheel wear and repair scars follow the road direction rather than forming repeated tiles.
  for (const [x, y, w] of [[1572, 635, 76], [1662, 650, 48], [1750, 626, 94], [1866, 653, 68], [1950, 628, 58]] as const) {
    rect(ctx, x, y, w, 4, p.roadLight);
    rect(ctx, x + 14, y + 9, Math.max(18, w - 30), 3, p.roadDark);
  }

  // Drainage ditch along south shoulder.
  polygon(ctx, [[1548, 700], [1660, 696], [1780, 708], [1904, 698], [2042, 700], [2040, 718], [1900, 714], [1774, 724], [1654, 712], [1548, 718]], p.dirtDark);
  line(ctx, 1562, 708, 2028, 708, dark ? p.organic : p.water, 6);
  for (const x of [1600, 1692, 1808, 1932] as const) rect(ctx, x, 704, 34, 3, dark ? p.organicLight : p.waterLight);

  // North-side hedges are grouped into authored masses, keeping the playable road readable.
  for (const [x, y, w] of [[1540, 548, 92], [1652, 544, 70], [1770, 538, 104], [1908, 544, 86]] as const) {
    rect(ctx, x, y, w, 18, p.grassDeep);
    rect(ctx, x + 8, y - 8, Math.max(20, w - 18), 18, dark ? p.grassDark : p.grass);
    rect(ctx, x + 18, y - 13, Math.max(14, w - 42), 9, dark ? p.grassDeep : p.grassLight);
  }

  if (dark) {
    polygon(ctx, [[1684, 620], [1732, 608], [1790, 624], [1784, 648], [1720, 652]], p.organic);
    line(ctx, 1724, 624, 1742, 596, p.organicLight, 4);
    line(ctx, 1750, 628, 1772, 600, p.organicLight, 4);
    rect(ctx, 1970, 694, 52, 7, p.blood);
  }
}

function drawLabApproach(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  // A deliberate utility checkpoint gives the Lab approach an identity separate from the Yard.
  shadow(ctx, 1814, 584, 94, 8, dark);
  rect(ctx, 1760, 548, 8, 54, p.timberDark);
  rect(ctx, 1864, 548, 8, 54, p.timberDark);
  rect(ctx, 1766, 550, 100, 8, p.timber);
  rect(ctx, 1772, 557, 88, 26, p.warning);
  rect(ctx, 1778, 563, 76, 4, p.ink);
  rect(ctx, 1790, 572, 52, 3, p.ink);
  rect(ctx, 1807, 583, 6, 18, p.steelDark);

  // Cable/pipe run and transformer cabinet.
  line(ctx, 1894, 542, 1894, 602, p.steelDark, 5);
  line(ctx, 1894, 545, 1980, 545, p.steelDark, 5);
  rect(ctx, 1956, 552, 48, 56, p.steelDark);
  rect(ctx, 1962, 558, 36, 44, p.steel);
  rect(ctx, 1968, 565, 24, 13, p.steelLight);
  rect(ctx, 1975, 588, 10, 6, Math.floor(now / 440) % 2 === 0 ? p.warning : p.rust);
  line(ctx, 1980, 603, 2008, 621, p.rust, 4);

  if (dark) {
    line(ctx, 1895, 546, 1906, 584, p.organic, 5);
    line(ctx, 1906, 584, 1934, 602, p.organicLight, 4);
    polygon(ctx, [[1956, 586], [1982, 572], [2008, 586], [1998, 610], [1968, 608]], p.organic);
    rect(ctx, 1788, 562, 44, 6, p.blood);
  }
}

function drawSouthRoad(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // Lab approach -> Old Toll -> lower junction.
  polygon(ctx, [[2030, 690], [2136, 682], [2244, 700], [2254, 1320], [2140, 1332], [2056, 1308], [2048, 1122], [2062, 962], [2040, 820]], p.grassDark);
  polygon(ctx, [[2070, 704], [2204, 706], [2214, 1298], [2152, 1306], [2090, 1288], [2086, 1120], [2098, 964], [2078, 824]], p.roadDark);
  polygon(ctx, [[2090, 718], [2184, 720], [2192, 1280], [2158, 1288], [2110, 1274], [2106, 1118], [2118, 966], [2098, 824]], p.road);

  // Deep east drainage channel gives a consistent navigational edge.
  rect(ctx, 2214, 720, 14, 596, p.dirtDark);
  rect(ctx, 2218, 730, 6, 576, dark ? p.organic : p.water);
  for (const y of [770, 864, 958, 1052, 1150, 1244] as const) rect(ctx, 2218, y, 5, 26, dark ? p.organicLight : p.waterLight);

  // Road scars and hand-patched surfaces.
  for (const [x, y, w, h] of [[2110, 762, 54, 5], [2130, 850, 42, 4], [2102, 1032, 74, 5], [2122, 1164, 50, 4], [2106, 1248, 64, 5]] as const) {
    rect(ctx, x, y, w, h, p.roadLight);
    rect(ctx, x + 10, y + 8, Math.max(16, w - 24), 3, p.roadDark);
  }

  if (dark) {
    line(ctx, 2160, 878, 2186, 902, p.organic, 6);
    line(ctx, 2186, 902, 2172, 934, p.organicLight, 4);
    polygon(ctx, [[2096, 1180], [2144, 1168], [2186, 1188], [2174, 1212], [2124, 1208]], p.blood);
  }
}

function drawOldToll(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  // Landmark is shaped around the accepted booth collider and leaves the west inspection bay open.
  const x = 1880;
  const y = 906;
  shadow(ctx, 1960, 1000, 86, 10, dark);

  // Lay-by surface is visibly distinct from the through road and frames the creditor scene.
  polygon(ctx, [[1846, 884], [1984, 878], [2050, 914], [2058, 1022], [1998, 1060], [1852, 1048], [1818, 992], [1822, 924]], p.dirtDark);
  polygon(ctx, [[1858, 900], [1976, 894], [2036, 924], [2040, 1008], [1990, 1042], [1866, 1032], [1836, 984], [1838, 930]], p.dirt);
  for (const [px, py, w] of [[1848, 958, 58], [1882, 1012, 76], [1996, 918, 34]] as const) rect(ctx, px, py, w, 4, p.dirtLight);

  // Crooked shelter roof and booth.
  polygon(ctx, [[x, y + 20], [x + 22, y], [x + 138, y + 2], [x + 164, y + 22], [x + 154, y + 34], [x + 10, y + 32]], p.steelDark);
  polygon(ctx, [[x + 10, y + 18], [x + 30, y + 8], [x + 132, y + 10], [x + 150, y + 22], [x + 144, y + 27], [x + 18, y + 26]], p.steel);
  rect(ctx, x + 12, y + 28, 12, 104, p.timberDark);
  rect(ctx, x + 17, y + 32, 7, 96, p.timberLight);
  rect(ctx, x + 78, y + 36, 82, 70, p.timberDark);
  rect(ctx, x + 85, y + 43, 68, 56, p.concrete);
  rect(ctx, x + 91, y + 50, 42, 31, p.steelDark);
  rect(ctx, x + 96, y + 55, 32, 21, dark ? '#5a4b53' : '#91aaa0');
  rect(ctx, x + 100, y + 58, 12, 7, p.steelLight);
  rect(ctx, x + 86, y + 40, 66, 8, p.cream);
  rect(ctx, x + 94, y + 42, 50, 3, p.ink);

  // Ledger kiosk / abandoned toll mechanism becomes a story prop for the debt collector.
  rect(ctx, x + 122, y + 108, 34, 28, p.steelDark);
  rect(ctx, x + 127, y + 112, 24, 18, p.steel);
  rect(ctx, x + 131, y + 115, 15, 6, Math.floor(now / 560) % 2 === 0 ? p.warning : p.rust);
  rect(ctx, x + 42, y + 92, 42, 7, p.timberDark);
  rect(ctx, x + 46, y + 87, 34, 7, p.cream);
  rect(ctx, x + 50, y + 89, 26, 3, p.ink);
  rect(ctx, x + 49, y + 102, 5, 22, p.rust);

  // Crashed animal transport cage off the active inspection bay.
  shadow(ctx, 1856, 1044, 68, 7, dark);
  polygon(ctx, [[1792, 1006], [1902, 1012], [1914, 1054], [1808, 1064]], p.steelDark);
  for (let gx = 1804; gx < 1904; gx += 16) line(ctx, gx, 1014, gx + 8, 1054, p.steelLight, 3);
  line(ctx, 1798, 1020, 1908, 1028, p.steel, 4);
  rect(ctx, 1812, 1048, 32, 8, p.rust);

  if (dark) {
    // The booth's shadow is anatomically wrong: it leans against the light and grows limb-like forks.
    polygon(ctx, [[1962, 1000], [2034, 1008], [2074, 1056], [2048, 1072], [1990, 1038]], 'rgba(34,23,31,0.78)');
    line(ctx, 2030, 1032, 2066, 1014, '#3a2530', 9);
    line(ctx, 2040, 1044, 2078, 1068, '#3a2530', 8);
    line(ctx, 1844, 1038, 1884, 1018, p.organic, 5);
    line(ctx, 1884, 1018, 1912, 1038, p.organicLight, 4);
    rect(ctx, 1984, 1028, 38, 7, p.blood);
  }
}

function drawPitRoad(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // Lower junction -> Local Pit approach.
  polygon(ctx, [[2076, 1284], [2200, 1274], [2312, 1310], [2434, 1296], [2548, 1320], [2672, 1302], [2804, 1322], [2918, 1312], [2920, 1540], [2788, 1532], [2650, 1540], [2522, 1528], [2392, 1542], [2262, 1528], [2160, 1544], [2076, 1516]], p.grassDark);
  polygon(ctx, [[2142, 1330], [2242, 1322], [2334, 1350], [2440, 1338], [2548, 1360], [2660, 1344], [2784, 1364], [2918, 1352], [2920, 1498], [2780, 1492], [2650, 1502], [2530, 1492], [2400, 1504], [2280, 1492], [2172, 1506], [2126, 1464]], p.roadDark);
  polygon(ctx, [[2160, 1350], [2248, 1342], [2338, 1370], [2444, 1358], [2550, 1380], [2662, 1364], [2784, 1384], [2918, 1374], [2920, 1478], [2780, 1472], [2650, 1482], [2530, 1472], [2400, 1484], [2284, 1472], [2188, 1486], [2148, 1450]], p.road);

  // Southern runoff trench and rusted gratings.
  line(ctx, 2190, 1510, 2890, 1510, dark ? p.organic : p.water, 7);
  for (const x of [2260, 2392, 2520, 2660, 2800] as const) {
    rect(ctx, x, 1502, 58, 16, p.steelDark);
    for (let gx = x + 5; gx < x + 52; gx += 10) rect(ctx, gx, 1505, 4, 10, p.steelLight);
  }

  for (const [x, y, w] of [[2210, 1408, 74], [2338, 1446, 54], [2468, 1404, 82], [2600, 1444, 64], [2758, 1408, 86]] as const) {
    rect(ctx, x, y, w, 4, p.roadLight);
    rect(ctx, x + 16, y + 8, Math.max(18, w - 32), 3, p.roadDark);
  }

  if (dark) {
    for (const [x, y] of [[2310, 1392], [2528, 1452], [2730, 1418]] as const) {
      polygon(ctx, [[x, y], [x + 38, y - 8], [x + 72, y + 8], [x + 60, y + 24], [x + 18, y + 20]], p.organic);
      line(ctx, x + 34, y + 2, x + 48, y - 24, p.organicLight, 4);
    }
    rect(ctx, 2810, 1498, 58, 7, p.blood);
  }
}

function drawPitApproach(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // The Pit announces itself through improvised animal-haulage infrastructure, not generic roadside clutter.
  for (const [x, y] of [[2310, 1320], [2460, 1312], [2638, 1326], [2810, 1314]] as const) {
    rect(ctx, x, y, 8, 52, p.timberDark);
    rect(ctx, x + 3, y + 2, 4, 46, p.timberLight);
    rect(ctx, x - 8, y + 7, 24, 8, p.warning);
    rect(ctx, x - 4, y + 10, 16, 3, p.ink);
  }

  // Local Pit billboard has a strong silhouette and reads before the venue itself appears.
  shadow(ctx, 2700, 1346, 78, 8, dark);
  rect(ctx, 2638, 1278, 10, 72, p.timberDark);
  rect(ctx, 2752, 1278, 10, 72, p.timberDark);
  polygon(ctx, [[2624, 1272], [2768, 1264], [2782, 1322], [2632, 1330]], p.timberDark);
  polygon(ctx, [[2632, 1278], [2760, 1272], [2772, 1316], [2640, 1322]], dark ? '#6e4b46' : '#a4614e');
  rect(ctx, 2650, 1288, 100, 5, p.cream);
  rect(ctx, 2664, 1300, 72, 4, p.warning);
  rect(ctx, 2680, 1310, 42, 3, p.cream);

  // Broken livestock trailer / cage stack.
  shadow(ctx, 2448, 1530, 90, 7, dark);
  polygon(ctx, [[2372, 1468], [2510, 1460], [2530, 1512], [2390, 1520]], p.steelDark);
  for (let gx = 2390; gx < 2510; gx += 18) line(ctx, gx, 1468, gx + 8, 1514, p.steelLight, 3);
  line(ctx, 2382, 1492, 2520, 1484, p.steel, 4);
  rect(ctx, 2404, 1512, 36, 8, p.rust);
  rect(ctx, 2478, 1504, 32, 7, p.rust);

  if (dark) {
    line(ctx, 2678, 1322, 2692, 1350, p.organic, 5);
    line(ctx, 2692, 1350, 2720, 1362, p.organicLight, 4);
    polygon(ctx, [[2396, 1500], [2440, 1482], [2484, 1498], [2472, 1522], [2424, 1522]], p.organic);
  }
}

function drawVergeClusters(ctx: CanvasRenderingContext2D, p: Palette, dark: boolean): void {
  // Sparse clusters preserve route readability and avoid the repeated-tuft problem from the old pass.
  for (const [x, y, w] of [
    [1560, 738, 74], [1688, 742, 94], [1842, 736, 72], [1990, 744, 58],
    [2250, 760, 62], [2254, 918, 78], [2250, 1110, 66], [2248, 1256, 82],
    [2178, 1550, 86], [2350, 1544, 64], [2580, 1542, 92], [2790, 1544, 72],
  ] as const) {
    rect(ctx, x, y, w, 12, p.grassDeep);
    rect(ctx, x + 8, y - 8, Math.max(20, w - 20), 15, p.grassDark);
    if (!dark) rect(ctx, x + 18, y - 13, Math.max(12, w - 44), 8, p.grassLight);
  }

  if (!dark) {
    for (const [x, y] of [[1680, 748], [2260, 1120], [2584, 1540]] as const) {
      rect(ctx, x, y, 4, 10, p.grassDark);
      rect(ctx, x - 3, y - 4, 10, 7, '#c77986');
      rect(ctx, x + 14, y + 2, 3, 8, p.grassDark);
      rect(ctx, x + 11, y - 2, 9, 6, p.warning);
    }
  } else {
    for (const [x, y] of [[1680, 748], [2260, 1120], [2584, 1540]] as const) {
      line(ctx, x, y + 12, x + 5, y - 6, p.grassDark, 3);
      line(ctx, x + 12, y + 12, x + 8, y - 5, p.grassDeep, 3);
      rect(ctx, x + 2, y + 6, 14, 4, '#59423f');
    }
  }
}

function drawScene(ctx: CanvasRenderingContext2D, now: number, p: Palette, dark: boolean): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawEastRoad(ctx, p, dark);
  drawSouthRoad(ctx, p, dark);
  drawPitRoad(ctx, p, dark);
  drawLabApproach(ctx, now, p, dark);
  drawOldToll(ctx, now, p, dark);
  drawPitApproach(ctx, p, dark);
  drawVergeClusters(ctx, p, dark);
  ctx.restore();
}

export function drawPassDRouteBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawScene(ctx, now, BRIGHT, false);
}

export function drawPassDRouteDark(ctx: CanvasRenderingContext2D, now: number): void {
  drawScene(ctx, now, DARK, true);
}

function drawForeground(ctx: CanvasRenderingContext2D, playerFeetY: number, p: Palette, dark: boolean): void {
  // Roadside barriers and hanging cage foregrounds only draw while the player is physically behind them.
  if (playerFeetY < 1180) {
    shadow(ctx, 2238, 1198, 88, 6, dark);
    rect(ctx, 2250, 1168, 8, 78, p.timberDark);
    rect(ctx, 2312, 1168, 8, 78, p.timberDark);
    rect(ctx, 2256, 1172, 58, 7, p.steelDark);
    for (let x = 2264; x < 2310; x += 11) rect(ctx, x, 1178, 3, 44, p.steelLight);
    rect(ctx, 2260, 1222, 50, 5, p.steelDark);
    if (dark) line(ctx, 2282, 1222, 2302, 1244, p.organicLight, 4);
  }

  if (playerFeetY < 1510) {
    rect(ctx, 2690, 1472, 208, 8, p.steelDark);
    rect(ctx, 2698, 1475, 192, 3, p.steelLight);
    for (const x of [2710, 2790, 2870] as const) rect(ctx, x, 1460, 8, 30, p.steelDark);
    if (dark) polygon(ctx, [[2796, 1470], [2840, 1464], [2872, 1484], [2830, 1494]], p.organic);
  }
}

export function drawPassDRouteBrightForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawForeground(ctx, playerFeetY, BRIGHT, false);
}

export function drawPassDRouteDarkForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawForeground(ctx, playerFeetY, DARK, true);
}
