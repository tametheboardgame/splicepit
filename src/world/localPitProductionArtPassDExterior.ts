import { drawPixelRect } from '../environment/environmentArtLanguage.js';

interface PitExteriorPalette {
  grass: string;
  grassLight: string;
  grassDark: string;
  grassDeep: string;
  dirt: string;
  dirtLight: string;
  dirtDark: string;
  brick: string;
  brickLight: string;
  brickDark: string;
  plaster: string;
  plasterLight: string;
  plasterDark: string;
  steel: string;
  steelLight: string;
  steelDark: string;
  timber: string;
  timberLight: string;
  timberDark: string;
  red: string;
  redDark: string;
  warning: string;
  cream: string;
  ink: string;
  rust: string;
  organic: string;
  organicLight: string;
  blood: string;
}

const BRIGHT: PitExteriorPalette = {
  grass: '#728c50', grassLight: '#8aa65e', grassDark: '#52683f', grassDeep: '#3b5039',
  dirt: '#a78359', dirtLight: '#c09c69', dirtDark: '#735a43',
  brick: '#9d5f4b', brickLight: '#bd785c', brickDark: '#623f39',
  plaster: '#cbbd8c', plasterLight: '#ded09d', plasterDark: '#95875f',
  steel: '#626f69', steelLight: '#89958a', steelDark: '#394640',
  timber: '#74573e', timberLight: '#97714d', timberDark: '#44352c',
  red: '#a84940', redDark: '#703632', warning: '#d2ab4d', cream: '#ead6a4', ink: '#24322d', rust: '#9c5942',
  organic: '#7b4555', organicLight: '#a3606c', blood: '#74333a',
};

const DARK: PitExteriorPalette = {
  grass: '#334138', grassLight: '#404e40', grassDark: '#25332e', grassDeep: '#192825',
  dirt: '#5b4c40', dirtLight: '#725f50', dirtDark: '#393130',
  brick: '#65443f', brickLight: '#795047', brickDark: '#392d2f',
  plaster: '#71695a', plasterLight: '#857b67', plasterDark: '#49443f',
  steel: '#45514c', steelLight: '#626d65', steelDark: '#28312e',
  timber: '#554039', timberLight: '#6d5145', timberDark: '#2b2727',
  red: '#71343d', redDark: '#492b31', warning: '#7b6247', cream: '#9e917c', ink: '#1d2625', rust: '#68403b',
  organic: '#6b3746', organicLight: '#955464', blood: '#5d2c34',
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

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, dark: boolean): void {
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(15,17,19,0.52)' : 'rgba(31,37,33,0.24)';
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawExteriorGround(ctx: CanvasRenderingContext2D, p: PitExteriorPalette, dark: boolean): void {
  // Opaque exterior plate supersedes the old generic grass/path frontage.
  rect(ctx, 0, 934, 2360, 546, p.grass);
  polygon(ctx, [[0, 940], [420, 950], [690, 928], [1010, 958], [1340, 940], [1640, 966], [1940, 946], [2360, 962], [2360, 1100], [0, 1080]], p.grassLight);
  polygon(ctx, [[0, 1290], [370, 1260], [660, 1308], [980, 1278], [1320, 1324], [1650, 1284], [1990, 1320], [2360, 1288], [2360, 1480], [0, 1480]], p.grassDark);

  // Arrival road widens into a battered loading apron before the gate.
  polygon(ctx, [[1036, 1480], [1012, 1392], [1008, 1280], [990, 1190], [1006, 1074], [1060, 996], [1180, 968], [1300, 996], [1354, 1074], [1370, 1190], [1352, 1282], [1350, 1394], [1324, 1480]], p.dirtDark);
  polygon(ctx, [[1060, 1480], [1038, 1390], [1036, 1284], [1018, 1190], [1032, 1088], [1082, 1020], [1180, 996], [1278, 1020], [1328, 1088], [1342, 1190], [1324, 1284], [1322, 1390], [1300, 1480]], p.dirt);
  polygon(ctx, [[1090, 1480], [1070, 1390], [1072, 1288], [1056, 1192], [1070, 1102], [1110, 1046], [1180, 1028], [1250, 1046], [1290, 1102], [1306, 1192], [1290, 1288], [1290, 1390], [1270, 1480]], p.dirtLight);

  for (const [x, y, w] of [[1082, 1360, 64], [1210, 1328, 48], [1108, 1220, 78], [1248, 1168, 42], [1082, 1092, 54]] as const) {
    rect(ctx, x, y, w, 4, p.dirtDark);
    rect(ctx, x + 10, y + 8, Math.max(16, w - 26), 3, p.rust);
  }

  if (dark) {
    polygon(ctx, [[1160, 1128], [1204, 1114], [1250, 1134], [1238, 1162], [1188, 1160]], p.organic);
    line(ctx, 1200, 1130, 1218, 1100, p.organicLight, 4);
    rect(ctx, 1280, 1288, 34, 7, p.blood);
  }
}

function drawVenueFacade(ctx: CanvasRenderingContext2D, now: number, p: PitExteriorPalette, dark: boolean): void {
  // Strong single silhouette. Existing gate colliders at x=1000 and x=1328 remain visually represented.
  shadow(ctx, 1180, 1220, 250, 14, dark);
  polygon(ctx, [[814, 932], [858, 894], [1502, 894], [1546, 932], [1518, 1012], [842, 1012]], p.brickDark);
  polygon(ctx, [[842, 932], [878, 912], [1482, 912], [1518, 934], [1498, 992], [862, 992]], p.brick);
  rect(ctx, 872, 952, 616, 42, p.plasterDark);
  rect(ctx, 888, 956, 584, 28, p.plaster);

  // Giant venue sign reads as the architectural focal point rather than one of many signs.
  polygon(ctx, [[930, 876], [1430, 868], [1460, 934], [908, 938]], p.timberDark);
  polygon(ctx, [[944, 886], [1418, 880], [1444, 924], [924, 928]], p.redDark);
  rect(ctx, 1004, 895, 358, 7, p.cream);
  rect(ctx, 1062, 910, 242, 5, p.warning);
  rect(ctx, 1128, 920, 108, 3, p.cream);

  // Brick gate towers and patched overhead bar exactly bracket the traversable entrance.
  for (const x of [1000, 1328] as const) {
    rect(ctx, x, 1188, 38, 166, p.brickDark);
    rect(ctx, x + 6, 1194, 26, 154, p.brick);
    for (let y = 1208; y < 1342; y += 30) rect(ctx, x + 8, y, 22, 4, p.brickLight);
    rect(ctx, x - 8, 1180, 54, 14, p.steelDark);
    rect(ctx, x, 1183, 38, 5, p.steelLight);
  }
  rect(ctx, 1038, 1200, 290, 16, p.steelDark);
  rect(ctx, 1050, 1204, 266, 7, p.red);
  for (const x of [1070, 1286] as const) rect(ctx, x, 1226, 14, 14, Math.floor(now / 560) % 2 === 0 ? p.warning : p.redDark);

  // Queue/loading fence runs are irregular and purposeful.
  for (const [x, y, h] of [[732, 1088, 240], [1588, 1074, 256]] as const) {
    for (let py = y; py < y + h; py += 54) {
      rect(ctx, x, py, 8, 38, p.timberDark);
      rect(ctx, x + 3, py + 3, 4, 32, p.timberLight);
    }
    line(ctx, x + 4, y + 10, x + 4, y + h - 12, p.steelDark, 4);
  }

  // Ticket/waiver hatch and fight-board make the place feel operational.
  rect(ctx, 770, 1046, 190, 94, p.timberDark);
  rect(ctx, 780, 1056, 170, 74, p.plaster);
  rect(ctx, 796, 1070, 76, 38, p.steelDark);
  rect(ctx, 802, 1076, 64, 26, dark ? '#594850' : '#88a89e');
  rect(ctx, 890, 1070, 44, 12, p.warning);
  rect(ctx, 892, 1090, 40, 4, p.ink);
  rect(ctx, 896, 1102, 32, 4, p.redDark);

  rect(ctx, 1428, 1038, 222, 108, p.timberDark);
  rect(ctx, 1438, 1048, 202, 88, dark ? '#5b4642' : '#a3624e');
  for (const [yy, ww] of [[1060, 138], [1078, 166], [1096, 118], [1114, 152]] as const) rect(ctx, 1458, yy, ww, 5, yy % 36 ? p.cream : p.warning);

  if (dark) {
    // Entrance sign sags and grows tissue through the supports.
    line(ctx, 1034, 930, 1060, 964, p.organic, 7);
    line(ctx, 1060, 964, 1094, 978, p.organicLight, 5);
    line(ctx, 1330, 930, 1308, 966, p.organic, 7);
    line(ctx, 1308, 966, 1274, 980, p.organicLight, 5);
    polygon(ctx, [[1170, 1188], [1212, 1178], [1250, 1194], [1236, 1212], [1188, 1212]], p.organic);
    rect(ctx, 1438, 1118, 86, 8, p.blood);
  }
}

function drawAnimalHandling(ctx: CanvasRenderingContext2D, p: PitExteriorPalette, dark: boolean): void {
  // Left arrival holding stack.
  shadow(ctx, 466, 1288, 186, 10, dark);
  polygon(ctx, [[286, 1160], [622, 1146], [650, 1320], [310, 1338]], p.steelDark);
  for (let x = 314; x < 622; x += 42) line(ctx, x, 1164, x + 12, 1328, p.steelLight, 4);
  line(ctx, 300, 1210, 636, 1198, p.steel, 5);
  line(ctx, 306, 1270, 644, 1258, p.steel, 5);
  rect(ctx, 338, 1304, 62, 12, p.rust);
  rect(ctx, 532, 1288, 72, 12, p.rust);

  // Specimen silhouette is secondary, not a blocky hero substitute.
  if (!dark) {
    rect(ctx, 412, 1242, 84, 34, '#b6aa86');
    rect(ctx, 470, 1218, 42, 28, '#b6aa86');
    line(ctx, 486, 1222, 500, 1198, '#8b745d', 5);
    line(ctx, 498, 1224, 518, 1204, '#8b745d', 5);
    rect(ctx, 502, 1228, 4, 4, p.ink);
  } else {
    polygon(ctx, [[398, 1250], [454, 1222], [510, 1238], [530, 1274], [444, 1290]], p.organic);
    line(ctx, 452, 1230, 430, 1198, p.organicLight, 6);
    line(ctx, 486, 1230, 518, 1192, p.organicLight, 5);
    rect(ctx, 516, 1250, 5, 5, '#b86d73');
  }

  // Loading gear cluster to the right, including cheap wash-down and crates.
  shadow(ctx, 1890, 1260, 250, 12, dark);
  rect(ctx, 1720, 1150, 216, 112, p.timberDark);
  rect(ctx, 1730, 1160, 196, 92, p.timber);
  for (const y of [1180, 1210, 1240] as const) rect(ctx, 1742, y, 172, 5, p.timberLight);
  rect(ctx, 1962, 1170, 90, 118, p.steelDark);
  rect(ctx, 1970, 1178, 74, 102, p.steel);
  rect(ctx, 1980, 1188, 54, 58, dark ? '#5d4854' : '#79a08e');
  rect(ctx, 1988, 1196, 20, 12, p.steelLight);
  line(ctx, 2020, 1246, 2056, 1272, dark ? p.organic : p.rust, 5);
  line(ctx, 2056, 1272, 2092, 1264, dark ? p.organicLight : p.rust, 4);

  if (dark) {
    polygon(ctx, [[1770, 1248], [1816, 1232], [1874, 1254], [1856, 1280], [1798, 1278]], p.blood);
    line(ctx, 2010, 1228, 2040, 1210, p.organic, 5);
  }
}

function drawExteriorStory(ctx: CanvasRenderingContext2D, p: PitExteriorPalette, dark: boolean): void {
  // Rubbish/repair clusters are concentrated near service areas rather than sprayed across the lawn.
  for (const [x, y, w, h] of [[664, 1334, 42, 36], [706, 1350, 30, 24], [1640, 1342, 38, 34], [1682, 1358, 26, 22]] as const) {
    rect(ctx, x, y, w, h, p.steelDark);
    rect(ctx, x + 6, y + 6, w - 12, h - 12, p.steel);
  }
  rect(ctx, 626, 1380, 116, 8, p.timberDark);
  rect(ctx, 1598, 1384, 126, 8, p.timberDark);
  rect(ctx, 650, 1390, 54, 5, p.rust);
  rect(ctx, 1622, 1394, 62, 5, p.rust);

  // Security floodlights define the playable gate at night.
  for (const x of [956, 1396] as const) {
    rect(ctx, x, 1010, 8, 130, p.steelDark);
    rect(ctx, x - 12, 1006, 32, 12, p.steel);
    rect(ctx, x - 5, 1009, 18, 6, p.warning);
  }

  ctx.save();
  ctx.globalAlpha = dark ? 0.09 : 0.12;
  polygon(ctx, [[960, 1020], [1100, 1188], [1180, 1230], [1040, 1060]], dark ? '#ad5c67' : '#ffe0a0');
  polygon(ctx, [[1400, 1020], [1260, 1188], [1180, 1230], [1320, 1060]], dark ? '#ad5c67' : '#ffe0a0');
  ctx.restore();

  if (dark) {
    polygon(ctx, [[620, 1404], [690, 1392], [752, 1414], [728, 1440], [648, 1436]], p.organic);
    line(ctx, 690, 1404, 712, 1374, p.organicLight, 4);
    polygon(ctx, [[1640, 1408], [1694, 1396], [1750, 1414], [1734, 1442], [1660, 1436]], p.organic);
  }
}

function drawExterior(ctx: CanvasRenderingContext2D, now: number, p: PitExteriorPalette, dark: boolean): void {
  drawExteriorGround(ctx, p, dark);
  drawVenueFacade(ctx, now, p, dark);
  drawAnimalHandling(ctx, p, dark);
  drawExteriorStory(ctx, p, dark);
}

export function drawPassDLocalPitExteriorBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawExterior(ctx, now, BRIGHT, false);
}

export function drawPassDLocalPitExteriorDark(ctx: CanvasRenderingContext2D, now: number): void {
  drawExterior(ctx, now, DARK, true);
}

function drawExteriorForeground(ctx: CanvasRenderingContext2D, playerFeetY: number, p: PitExteriorPalette, dark: boolean): void {
  if (playerFeetY < 1280) {
    // Low queue rail provides depth but only when the player is behind it.
    rect(ctx, 770, 1262, 180, 8, p.steelDark);
    rect(ctx, 778, 1265, 164, 3, p.steelLight);
    for (const x of [784, 858, 932] as const) rect(ctx, x, 1250, 8, 32, p.steelDark);
    if (dark) line(ctx, 852, 1266, 876, 1284, p.organicLight, 4);
  }
  if (playerFeetY < 1390) {
    rect(ctx, 1748, 1368, 260, 8, p.steelDark);
    rect(ctx, 1756, 1371, 244, 3, p.steelLight);
    for (const x of [1764, 1880, 1988] as const) rect(ctx, x, 1356, 8, 32, p.steelDark);
  }
}

export function drawPassDLocalPitExteriorBrightForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawExteriorForeground(ctx, playerFeetY, BRIGHT, false);
}

export function drawPassDLocalPitExteriorDarkForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawExteriorForeground(ctx, playerFeetY, DARK, true);
}
