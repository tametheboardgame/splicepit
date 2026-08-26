export const MASTER_LAB_VIEW_WIDTH = 1280;
export const MASTER_LAB_VIEW_HEIGHT = 720;
export const MASTER_LAB_WORLD_WIDTH = 1960;
export const MASTER_LAB_WORLD_HEIGHT = 1200;

export type MasterLabState = 'pre-disaster' | 'aftermath';
export type MasterLabRect = { x: number; y: number; width: number; height: number };
export type MasterLabStageId = 'entry' | 'master-stage' | 'rinocow-containment' | 'splice-bench' | 'aftermath-focus';

export interface MasterLabStage {
  readonly id: MasterLabStageId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

export const MASTER_LAB_ENTRY_SPAWN = { x: 980, y: 1040 } as const;
export const MASTER_LAB_EXIT_ZONE: MasterLabRect = { x: 900, y: 1060, width: 160, height: 76 };
export const MASTER_LAB_EXTERIOR_RETURN = { x: 2506, y: 566 } as const;
export const MASTER_LAB_EXTERIOR_ENTRY_ZONE: MasterLabRect = { x: 2446, y: 522, width: 120, height: 92 };

export const MASTER_LAB_STAGES: readonly MasterLabStage[] = [
  { id: 'entry', label: 'Lab Entrance', x: 980, y: 1040, radius: 110 },
  { id: 'master-stage', label: "Viktor's Demonstration Floor", x: 980, y: 620, radius: 170 },
  { id: 'rinocow-containment', label: 'RinoCow Containment', x: 1500, y: 760, radius: 170 },
  { id: 'splice-bench', label: 'Primary Splice Bench', x: 650, y: 600, radius: 160 },
  { id: 'aftermath-focus', label: 'Disaster Focus', x: 1160, y: 620, radius: 190 },
] as const;

const FLOOR: MasterLabRect = { x: 82, y: 78, width: 1796, height: 1036 };

const P = {
  void: '#1e2e2a', wall: '#d9c78f', wallShade: '#ae9668', wallDark: '#665849',
  tile: '#c9c69e', tileLight: '#dfdcb7', tileDark: '#a7a47f',
  teal: '#4d8e84', tealDark: '#315f5b', tealLight: '#77afa1',
  glass: '#9dc8bc', glassLight: '#d0e4cf',
  wood: '#896443', woodDark: '#554234', woodLight: '#b18a58',
  steel: '#727b75', steelDark: '#4d5752', steelLight: '#a6ada0',
  cream: '#f2dfae', ink: '#25362f', red: '#b95546', redDark: '#783c39',
  orange: '#d47a45', yellow: '#e1bd5b', purple: '#795b7e', pink: '#c77b85',
  slime: '#91c673', fluid: '#79b88f', fluidDark: '#53866e', bone: '#ddcfaa',
  bloodDark: '#7f3438', bloodBright: '#a34543',
} as const;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function outlineRect(ctx: CanvasRenderingContext2D, box: MasterLabRect, fill: string, border: string, thickness = 3): void {
  rect(ctx, box.x, box.y, box.width, box.height, border);
  rect(ctx, box.x + thickness, box.y + thickness, box.width - thickness * 2, box.height - thickness * 2, fill);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, colour: string = P.cream, size = 13): void {
  ctx.fillStyle = colour;
  ctx.font = `700 ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, Math.round(x), Math.round(y));
}

function drawFloor(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 0, 0, MASTER_LAB_WORLD_WIDTH, MASTER_LAB_WORLD_HEIGHT, P.void);
  outlineRect(ctx, FLOOR, P.tile, P.wallDark, 8);
  rect(ctx, 92, 88, 1776, 76, P.wall);
  rect(ctx, 92, 164, 1776, 18, P.wallShade);
  for (let y = 186; y < 1080; y += 56) {
    for (let x = 112; x < 1840; x += 56) {
      const light = ((x / 56) + (y / 56)) % 2 === 0;
      rect(ctx, x, y, 52, 52, light ? P.tileLight : P.tile);
      rect(ctx, x, y + 49, 52, 3, P.tileDark);
      rect(ctx, x + 49, y, 3, 52, P.tileDark);
    }
  }
  rect(ctx, 860, 994, 240, 116, P.tileDark);
  rect(ctx, 882, 994, 196, 116, P.tileLight);
  rect(ctx, 936, 1076, 88, 34, P.wood);
}

function drawPipesAndWall(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 128, 150, 704, 14, P.steelDark);
  rect(ctx, 142, 154, 676, 6, P.steelLight);
  rect(ctx, 1160, 150, 650, 14, P.steelDark);
  rect(ctx, 1172, 154, 626, 6, P.steelLight);
  for (const x of [270, 520, 742, 1260, 1490, 1720]) {
    rect(ctx, x, 146, 10, 34, P.steelDark);
    rect(ctx, x + 3, 148, 4, 30, P.steelLight);
  }
  const pulse = Math.floor(now / 380) % 5;
  for (let i = 0; i < 5; i += 1) rect(ctx, 874 + i * 42, 146, 22, 18, i === pulse ? P.yellow : P.tealDark);

  outlineRect(ctx, { x: 760, y: 96, width: 440, height: 74 }, P.wood, P.woodDark, 4);
  label(ctx, "DR VIKTOR SPLICENSTEIN'S MASTER LAB", 980, 133, P.cream, 15);
  for (const x of [160, 430, 1460, 1730]) {
    outlineRect(ctx, { x, y: 102, width: 126, height: 62 }, P.glass, P.tealDark, 3);
    rect(ctx, x + 8, 110, 110, 46, P.glassLight);
    rect(ctx, x + 60, 108, 4, 50, P.tealDark);
  }
  outlineRect(ctx, { x: 104, y: 202, width: 114, height: 64 }, P.tealDark, P.wallDark, 3);
  label(ctx, 'BIOHAZARD', 161, 225, P.cream, 10);
  label(ctx, 'LEVEL: MOSTLY', 161, 245, '#d7c87f', 9);
  outlineRect(ctx, { x: 1736, y: 202, width: 114, height: 64 }, P.redDark, P.wallDark, 3);
  label(ctx, 'DON’T OPEN', 1793, 225, '#f2d3c2', 10);
  label(ctx, 'THE RED ONE', 1793, 245, '#f2d3c2', 9);
  if (Math.floor(now / 800) % 2 === 0) {
    rect(ctx, 110, 276, 12, 12, P.yellow);
    rect(ctx, 1832, 276, 12, 12, P.yellow);
  }
}

function drawSpliceBench(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 236;
  const y = 310;
  rect(ctx, 198, 256, 448, 400, '#b9b68e');
  outlineRect(ctx, { x: 216, y: 274, width: 412, height: 364 }, '#c7c49b', P.steelDark, 5);
  rect(ctx, x, y - 14, 372, 22, P.tealDark);
  label(ctx, 'PRIMARY SPLICE BAY', x + 186, y - 3, P.cream, 12);
  outlineRect(ctx, { x: x + 34, y: y + 104, width: 300, height: 108 }, P.steel, P.steelDark, 5);
  rect(ctx, x + 46, y + 116, 276, 76, P.steelLight);
  rect(ctx, x + 62, y + 132, 244, 32, '#d6d2aa');
  rect(ctx, x + 84, y + 174, 200, 9, P.steelDark);
  for (const lx of [72, 118, 164, 210, 256, 296]) {
    rect(ctx, x + lx, y + 122, 10, 7, lx === 164 && Math.floor(now / 520) % 2 === 0 ? P.yellow : P.tealDark);
  }
  outlineRect(ctx, { x: x + 320, y: y + 28, width: 54, height: 174 }, P.glass, P.tealDark, 4);
  rect(ctx, x + 330, y + 40, 34, 148, P.fluid);
  const bubble = Math.floor(now / 180) % 100;
  for (const [bx, base] of [[337, 160], [350, 132], [342, 100]] as const) {
    const by = y + 54 + ((base - bubble + 100) % 100);
    rect(ctx, bx, by, 5, 5, P.glassLight);
  }
  outlineRect(ctx, { x: x + 26, y: y + 236, width: 128, height: 70 }, P.wood, P.woodDark, 4);
  for (const sx of [48, 80, 112]) {
    outlineRect(ctx, { x: x + sx, y: y + 270, width: 18, height: 28 }, P.glass, P.tealDark, 2);
    rect(ctx, x + sx + 4, y + 282, 10, 12, sx === 80 ? P.pink : P.slime);
  }
  rect(ctx, x + 190, y + 248, 140, 12, P.woodDark);
  rect(ctx, x + 202, y + 234, 116, 16, P.woodLight);
  rect(ctx, x + 226, y + 212, 58, 20, P.bone);
  rect(ctx, x + 240, y + 198, 32, 16, P.bone);
  rect(ctx, x + 254, y + 204, 8, 6, P.pink);
  if (state === 'aftermath') {
    rect(ctx, x + 86, y + 152, 126, 8, P.bloodDark);
    rect(ctx, x + 132, y + 162, 74, 6, P.bloodBright);
    rect(ctx, x + 340, y + 76, 12, 76, P.void);
  }
}

function drawViktorStage(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 768;
  const y = 428;
  rect(ctx, x, y, 436, 332, P.tileDark);
  rect(ctx, x + 14, y + 14, 408, 304, '#d8d5ac');
  for (let gx = x + 30; gx < x + 410; gx += 46) rect(ctx, gx, y + 24, 2, 280, '#b1ae88');
  for (let gy = y + 38; gy < y + 306; gy += 46) rect(ctx, x + 24, gy, 384, 2, '#b1ae88');
  outlineRect(ctx, { x: x + 114, y: y + 30, width: 208, height: 54 }, P.wood, P.woodDark, 4);
  label(ctx, state === 'pre-disaster' ? 'DEMONSTRATION FLOOR' : 'INCIDENT AREA', x + 218, y + 57, state === 'pre-disaster' ? P.cream : '#f0c2b4', 12);
  for (const sx of [54, 362]) {
    rect(ctx, x + sx, y + 112, 20, 126, P.steelDark);
    rect(ctx, x + sx + 5, y + 116, 10, 118, P.steelLight);
    rect(ctx, x + sx - 12, y + 98, 44, 18, P.tealDark);
    if (Math.floor(now / 700) % 2 === 0) rect(ctx, x + sx + 2, y + 102, 16, 8, P.yellow);
  }
  outlineRect(ctx, { x: x + 40, y: y + 254, width: 142, height: 54 }, P.steel, P.steelDark, 4);
  for (const px of [64, 94, 124, 154]) rect(ctx, x + px, y + 286, 10, 9, px === 124 ? P.red : P.tealDark);
  if (state === 'aftermath') {
    rect(ctx, x + 182, y + 126, 94, 20, P.bloodDark);
    rect(ctx, x + 152, y + 146, 156, 15, P.bloodBright);
    rect(ctx, x + 128, y + 161, 194, 11, P.bloodDark);
    rect(ctx, x + 292, y + 176, 48, 8, P.bloodBright);
    rect(ctx, x + 58, y + 212, 14, 54, P.void);
  }
}

function drawRinoCow(ctx: CanvasRenderingContext2D, x: number, y: number, state: MasterLabState, now: number): void {
  const shift = state === 'pre-disaster' && Math.floor(now / 900) % 5 === 0 ? 2 : 0;
  rect(ctx, x + 26 + shift, y + 34, 112, 58, '#756d58');
  rect(ctx, x + 2 + shift, y + 48, 50, 42, '#857a61');
  rect(ctx, x + 118 + shift, y + 24, 54, 50, '#756d58');
  rect(ctx, x + 142 + shift, y + 8, 34, 24, '#8d8065');
  rect(ctx, x + 154 + shift, y, 28, 12, P.bone);
  rect(ctx, x + 172 + shift, y - 6, 36, 8, P.bone);
  rect(ctx, x + 38 + shift, y + 86, 18, 48, '#625b4b');
  rect(ctx, x + 104 + shift, y + 86, 18, 48, '#625b4b');
  rect(ctx, x + 14 + shift, y + 64, 14, 10, P.pink);
  rect(ctx, x + 151 + shift, y + 34, 6, 5, state === 'aftermath' ? P.red : P.ink);
  rect(ctx, x + 62 + shift, y + 42, 16, 10, '#d7c8a5');
  rect(ctx, x + 84 + shift, y + 60, 18, 12, '#d7c8a5');
}

function drawContainment(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 1288;
  const y = 264;
  rect(ctx, x - 44, y - 60, 530, 500, '#9e9b79');
  outlineRect(ctx, { x: x - 28, y: y - 44, width: 498, height: 468 }, '#bdbb91', P.steelDark, 6);
  outlineRect(ctx, { x: x + 36, y: y + 42, width: 370, height: 280 }, P.glass, P.tealDark, 6);
  rect(ctx, x + 50, y + 56, 342, 252, '#9ec7ac');
  for (let gx = x + 66; gx < x + 390; gx += 44) rect(ctx, gx, y + 56, 3, 252, P.tealDark);
  rect(ctx, x + 50, y + 268, 342, 40, state === 'pre-disaster' ? P.fluidDark : '#687c6a');
  drawRinoCow(ctx, x + 118, y + 108, state, now);
  rect(ctx, x + 10, y - 22, 420, 42, P.tealDark);
  label(ctx, 'RINOCOW // CONTAINMENT 03', x + 220, y - 1, P.cream, 12);
  outlineRect(ctx, { x: x + 134, y: y + 346, width: 174, height: 70 }, P.steel, P.steelDark, 4);
  for (const bx of [162, 198, 234, 270]) rect(ctx, x + bx, y + 390, 12, 10, bx === 234 && Math.floor(now / 420) % 2 === 0 ? P.red : P.tealDark);
  if (state === 'aftermath') {
    rect(ctx, x + 178, y + 42, 12, 280, P.void);
    rect(ctx, x + 182, y + 80, 34, 18, '#64756d');
    rect(ctx, x + 74, y + 292, 202, 10, P.bloodDark);
    rect(ctx, x + 120, y + 302, 132, 8, P.bloodBright);
  }
}

function drawSpecimenPrep(ctx: CanvasRenderingContext2D, now: number): void {
  const x = 220;
  const y = 820;
  outlineRect(ctx, { x, y, width: 500, height: 180 }, '#c3c096', P.wallDark, 5);
  rect(ctx, x + 20, y + 18, 460, 20, P.tealDark);
  label(ctx, 'SPECIMEN PREP // IF IT TWITCHES, LABEL IT', x + 250, y + 28, P.cream, 11);
  for (const cx of [256, 368, 480, 592]) {
    outlineRect(ctx, { x: cx, y: y + 58, width: 66, height: 78 }, P.glass, P.tealDark, 3);
    rect(ctx, cx + 8, y + 68, 50, 58, '#9bc59e');
    const fill = cx === 368 ? P.pink : cx === 480 ? P.purple : P.slime;
    rect(ctx, cx + 18, y + 100, 30, 20, fill);
    if ((Math.floor(now / 640) + cx) % 3 === 0) rect(ctx, cx + 28, y + 84, 7, 7, P.glassLight);
  }
}

function drawColdStorage(ctx: CanvasRenderingContext2D): void {
  const x = 1260;
  const y = 830;
  outlineRect(ctx, { x, y, width: 470, height: 170 }, '#c7c6a0', P.steelDark, 5);
  rect(ctx, x + 18, y + 18, 434, 26, P.steelDark);
  label(ctx, 'SOURCE LIBRARY // COLD STORAGE', x + 235, y + 31, P.cream, 11);
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const bx = x + 22 + column * 70;
      const by = y + 58 + row * 48;
      outlineRect(ctx, { x: bx, y: by, width: 56, height: 36 }, P.tealDark, P.steelDark, 2);
      rect(ctx, bx + 8, by + 8, 40, 20, column % 3 === 0 ? P.purple : column % 3 === 1 ? P.pink : P.slime);
    }
  }
}

function drawFloorTanks(ctx: CanvasRenderingContext2D, now: number): void {
  for (const [x, fill] of [[760, P.pink], [1120, P.slime]] as const) {
    outlineRect(ctx, { x, y: 870, width: 80, height: 112 }, P.tealDark, P.steelDark, 4);
    rect(ctx, x + 10, 882, 60, 84, '#95c395');
    rect(ctx, x + 22, 922, 36, 30, fill);
    if ((Math.floor(now / 520) + x) % 2 === 0) rect(ctx, x + 34, 900, 7, 7, P.glassLight);
  }
}

function drawAftermath(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 1060, 694, 116, 12, P.bloodDark);
  rect(ctx, 1132, 706, 86, 10, P.bloodBright);
  rect(ctx, 1198, 716, 64, 8, P.bloodDark);
  rect(ctx, 1256, 726, 30, 8, P.bloodBright);
  rect(ctx, 1328, 684, 76, 8, P.bloodDark);
  rect(ctx, 1390, 676, 36, 8, P.bloodBright);
  rect(ctx, 1112, 650, 18, 12, P.bone);
  rect(ctx, 1126, 646, 12, 8, P.bone);
  rect(ctx, 1048, 566, 8, 42, P.steelDark);
  rect(ctx, 1052, 570, 4, 32, P.void);
}

function drawForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  if (playerFeetY < 280) rect(ctx, 82, 78, 1796, 76, 'rgba(42,55,48,0.18)');
  if (playerFeetY < 820) {
    rect(ctx, 1244, 792, 486, 10, P.steelDark);
    for (const x of [1270, 1408, 1546, 1684]) rect(ctx, x, 794, 8, 34, P.steelDark);
  }
}

export const MASTER_LAB_COLLIDERS: readonly MasterLabRect[] = [
  { x: 82, y: 78, width: 1796, height: 72 },
  { x: 82, y: 78, width: 34, height: 1036 },
  { x: 1844, y: 78, width: 34, height: 1036 },
  { x: 82, y: 1082, width: 818, height: 32 },
  { x: 1060, y: 1082, width: 818, height: 32 },
  { x: 270, y: 414, width: 300, height: 108 },
  { x: 556, y: 338, width: 54, height: 174 },
  { x: 822, y: 540, width: 20, height: 126 },
  { x: 1130, y: 540, width: 20, height: 126 },
  { x: 808, y: 682, width: 142, height: 54 },
  { x: 1296, y: 306, width: 370, height: 280 },
  { x: 1422, y: 610, width: 174, height: 70 },
  { x: 220, y: 820, width: 500, height: 180 },
  { x: 1260, y: 830, width: 470, height: 170 },
  { x: 760, y: 870, width: 80, height: 112 },
  { x: 1120, y: 870, width: 80, height: 112 },
];

function overlaps(a: MasterLabRect, b: MasterLabRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function isMasterLabPositionBlocked(feetX: number, feetY: number): boolean {
  const hitbox: MasterLabRect = { x: feetX - 11, y: feetY - 13, width: 22, height: 15 };
  if (
    hitbox.x < FLOOR.x + 8
    || hitbox.y < FLOOR.y + 8
    || hitbox.x + hitbox.width > FLOOR.x + FLOOR.width - 8
    || hitbox.y + hitbox.height > FLOOR.y + FLOOR.height - 8
  ) return true;
  return MASTER_LAB_COLLIDERS.some((collider) => overlaps(hitbox, collider));
}

export function pointInsideMasterLabRect(x: number, y: number, box: MasterLabRect): boolean {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

export function nearestMasterLabStage(feetX: number, feetY: number): MasterLabStage | null {
  let nearest: MasterLabStage | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const stage of MASTER_LAB_STAGES) {
    const distance = Math.hypot(feetX - stage.x, feetY - stage.y);
    if (distance <= stage.radius && distance < nearestDistance) {
      nearest = stage;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function drawMasterLabBase(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState = 'pre-disaster'): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawFloor(ctx);
  drawPipesAndWall(ctx, now);
  drawSpliceBench(ctx, now, state);
  drawViktorStage(ctx, now, state);
  drawContainment(ctx, now, state);
  drawSpecimenPrep(ctx, now);
  drawColdStorage(ctx);
  drawFloorTanks(ctx, now);
  if (state === 'aftermath') drawAftermath(ctx);
  ctx.restore();
}

export function drawMasterLabForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawForeground(ctx, playerFeetY);
  ctx.restore();
}
