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
  { id: 'entry', label: 'Lab Entrance', x: MASTER_LAB_ENTRY_SPAWN.x, y: MASTER_LAB_ENTRY_SPAWN.y, radius: 110 },
  { id: 'master-stage', label: "Viktor's Demonstration Floor", x: 990, y: 650, radius: 180 },
  { id: 'rinocow-containment', label: 'RinoCow Containment', x: 1500, y: 470, radius: 190 },
  { id: 'splice-bench', label: 'Primary Splice Bench', x: 450, y: 520, radius: 170 },
  { id: 'aftermath-focus', label: 'Disaster Focus', x: 1220, y: 600, radius: 210 },
] as const;

const FLOOR: MasterLabRect = { x: 82, y: 78, width: 1796, height: 1036 };

const P = {
  void: '#1e2e2a',
  wall: '#d9c78f',
  wallShade: '#ae9668',
  wallDark: '#665849',
  tile: '#c9c69e',
  tileLight: '#dfdcb7',
  tileDark: '#a7a47f',
  teal: '#4d8e84',
  tealDark: '#315f5b',
  tealLight: '#77afa1',
  glass: '#9dc8bc',
  glassLight: '#d0e4cf',
  wood: '#896443',
  woodDark: '#554234',
  woodLight: '#b18a58',
  steel: '#727b75',
  steelDark: '#4d5752',
  steelLight: '#a6ada0',
  cream: '#f2dfae',
  ink: '#25362f',
  red: '#b95546',
  redDark: '#783c39',
  orange: '#d47a45',
  yellow: '#e1bd5b',
  purple: '#795b7e',
  pink: '#c77b85',
  slime: '#91c673',
  fluid: '#79b88f',
  fluidDark: '#53866e',
  bone: '#ddcfaa',
  blood: '#7f3438',
  bloodBright: '#a34543',
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function outlineRect(ctx: CanvasRenderingContext2D, box: MasterLabRect, fill: string, border: string, thickness = 3): void {
  rect(ctx, box.x, box.y, box.width, box.height, border);
  rect(ctx, box.x + thickness, box.y + thickness, box.width - thickness * 2, box.height - thickness * 2, fill);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, colour = P.cream, size = 13): void {
  ctx.fillStyle = colour;
  ctx.font = `700 ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, Math.round(x), Math.round(y));
}

function drawFloor(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 0, 0, MASTER_LAB_WORLD_WIDTH, MASTER_LAB_WORLD_HEIGHT, P.void);
  outlineRect(ctx, FLOOR, P.tile, P.wallDark, 8);
  rect(ctx, FLOOR.x + 10, FLOOR.y + 10, FLOOR.width - 20, 76, P.wall);
  rect(ctx, FLOOR.x + 10, FLOOR.y + 86, FLOOR.width - 20, 18, P.wallShade);

  for (let y = 186; y < 1080; y += 56) {
    for (let x = 112; x < 1840; x += 56) {
      const alternate = ((x / 56) + (y / 56)) % 2 === 0;
      rect(ctx, x, y, 52, 52, alternate ? P.tileLight : P.tile);
      rect(ctx, x, y + 49, 52, 3, P.tileDark);
      rect(ctx, x + 49, y, 3, 52, P.tileDark);
    }
  }

  rect(ctx, 860, 994, 240, 116, P.tileDark);
  rect(ctx, 882, 994, 196, 116, P.tileLight);
  rect(ctx, 936, 1076, 88, 34, P.wood);

  for (let x = 160; x < 1800; x += 212) {
    rect(ctx, x, 110, 124, 12, P.tealDark);
    rect(ctx, x + 10, 114, 104, 5, P.tealLight);
  }
}

function drawOverheadPipes(ctx: CanvasRenderingContext2D, now: number): void {
  rect(ctx, 128, 150, 704, 14, P.steelDark);
  rect(ctx, 142, 154, 676, 6, P.steelLight);
  rect(ctx, 1160, 150, 650, 14, P.steelDark);
  rect(ctx, 1172, 154, 626, 6, P.steelLight);
  for (const x of [270, 520, 742, 1260, 1490, 1720]) {
    rect(ctx, x, 146, 10, 34, P.steelDark);
    rect(ctx, x + 3, 148, 4, 30, P.steelLight);
  }
  const pulse = Math.floor(now / 380) % 4;
  for (let index = 0; index < 5; index += 1) {
    rect(ctx, 874 + index * 42, 146, 22, 18, index === pulse ? P.yellow : P.tealDark);
  }
}

function drawSpliceBench(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 260;
  const y = 330;
  rect(ctx, x - 42, y - 72, 410, 410, '#b9b68e');
  outlineRect(ctx, { x: x - 24, y: y - 50, width: 374, height: 366 }, '#c7c49b', P.steelDark, 5);
  rect(ctx, x - 6, y - 26, 338, 22, P.tealDark);
  label(ctx, 'PRIMARY SPLICE BAY', x + 162, y - 15, P.cream, 12);

  outlineRect(ctx, { x: x + 16, y: y + 58, width: 244, height: 108 }, P.steel, P.steelDark, 5);
  rect(ctx, x + 28, y + 70, 220, 76, P.steelLight);
  rect(ctx, x + 42, y + 88, 192, 30, '#d6d2aa');
  rect(ctx, x + 60, y + 126, 158, 10, P.steelDark);
  for (const lx of [52, 96, 140, 184, 228]) rect(ctx, x + lx, y + 78, 10, 8, lx === 140 && Math.floor(now / 520) % 2 === 0 ? P.yellow : P.tealDark);

  outlineRect(ctx, { x: x + 274, y: y + 18, width: 58, height: 176 }, P.glass, P.tealDark, 4);
  rect(ctx, x + 284, y + 30, 38, 150, P.fluid);
  const bubble = Math.floor(now / 180) % 94;
  for (const [bx, base] of [[292, 164], [310, 142], [302, 118]] as const) {
    const by = y + 42 + ((base - bubble + 94) % 94);
    rect(ctx, x + bx - x, by, 5, 5, P.glassLight);
  }

  outlineRect(ctx, { x: x + 18, y: y + 198, width: 118, height: 88 }, P.wood, P.woodDark, 4);
  rect(ctx, x + 28, y + 208, 98, 18, P.woodLight);
  for (const sx of [38, 66, 94]) {
    outlineRect(ctx, { x: x + sx, y: y + 236, width: 18, height: 34 }, P.glass, P.tealDark, 2);
    rect(ctx, x + sx + 4, y + 250, 10, 16, sx === 66 ? P.pink : P.slime);
  }
  rect(ctx, x + 154, y + 216, 144, 14, P.woodDark);
  rect(ctx, x + 164, y + 202, 124, 18, P.woodLight);
  rect(ctx, x + 170, y + 230, 10, 52, P.woodDark);
  rect(ctx, x + 278, y + 230, 10, 52, P.woodDark);
  rect(ctx, x + 190, y + 180, 62, 20, P.bone);
  rect(ctx, x + 204, y + 166, 34, 16, P.bone);
  rect(ctx, x + 218, y + 172, 8, 6, P.pink);

  if (state === 'aftermath') {
    rect(ctx, x + 52, y + 110, 142, 8, P.bloodDark);
    rect(ctx, x + 82, y + 118, 76, 6, P.bloodBright);
    rect(ctx, x + 298, y + 82, 18, 62, P.steelDark);
    rect(ctx, x + 302, y + 86, 9, 52, P.void);
  }
}

function drawViktorStage(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 780;
  const y = 444;
  rect(ctx, x, y, 430, 322, P.tileDark);
  rect(ctx, x + 14, y + 14, 402, 294, '#d8d5ac');
  for (let gx = x + 30; gx < x + 400; gx += 46) rect(ctx, gx, y + 24, 2, 272, '#b1ae88');
  for (let gy = y + 38; gy < y + 292; gy += 46) rect(ctx, x + 24, gy, 378, 2, '#b1ae88');
  outlineRect(ctx, { x: x + 118, y: y + 36, width: 194, height: 62 }, P.wood, P.woodDark, 4);
  label(ctx, state === 'pre-disaster' ? 'DEMONSTRATION FLOOR' : 'INCIDENT AREA', x + 215, y + 67, state === 'pre-disaster' ? P.cream : '#f0c2b4', 12);
  for (const sx of [46, 362]) {
    rect(ctx, x + sx, y + 114, 20, 128, P.steelDark);
    rect(ctx, x + sx + 5, y + 118, 10, 120, P.steelLight);
    rect(ctx, x + sx - 12, y + 100, 44, 18, P.tealDark);
    if (Math.floor(now / 700) % 2 === 0) rect(ctx, x + sx + 2, y + 104, 16, 8, P.yellow);
  }
  outlineRect(ctx, { x: x + 132, y: y + 218, width: 166, height: 56 }, P.steel, P.steelDark, 4);
  rect(ctx, x + 148, y + 232, 134, 10, P.tealLight);
  for (const px of [166, 204, 242, 270]) rect(ctx, x + px, y + 248, 10, 10, px === 204 ? P.red : P.tealDark);

  if (state === 'aftermath') {
    rect(ctx, x + 184, y + 124, 92, 20, P.bloodDark);
    rect(ctx, x + 154, y + 142, 154, 16, P.bloodBright);
    rect(ctx, x + 128, y + 156, 194, 12, P.bloodDark);
    rect(ctx, x + 288, y + 168, 46, 8, P.bloodBright);
    rect(ctx, x + 318, y + 176, 26, 8, P.bloodDark);
    rect(ctx, x + 50, y + 214, 16, 56, P.steelDark);
    rect(ctx, x + 54, y + 216, 8, 50, P.void);
  }
}

function drawRinoCowSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, state: MasterLabState, now: number): void {
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

function drawRinoCowContainment(ctx: CanvasRenderingContext2D, now: number, state: MasterLabState): void {
  const x = 1284;
  const y = 274;
  rect(ctx, x - 52, y - 70, 552, 510, '#9e9b79');
  outlineRect(ctx, { x: x - 34, y: y - 52, width: 516, height: 474 }, '#bdbb91', P.steelDark, 6);
  outlineRect(ctx, { x: x + 34, y: y + 38, width: 378, height: 280 }, P.glass, P.tealDark, 6);
  rect(ctx, x + 48, y + 52, 350, 252, '#9ec7ac');
  for (let gx = x + 66; gx < x + 396; gx += 44) rect(ctx, gx, y + 52, 3, 252, P.tealDark);
  rect(ctx, x + 48, y + 264, 350, 40, state === 'pre-disaster' ? P.fluidDark : '#687c6a');
  drawRinoCowSilhouette(ctx, x + 120, y + 104, state, now);

  rect(ctx, x + 12, y - 24, 422, 42, P.tealDark);
  label(ctx, 'RINOCOW // CONTAINMENT 03', x + 222, y - 3, P.cream, 12);
  for (const [lx, colour] of [[60, P.tealLight], [96, P.yellow], [350, P.red]] as const) {
    rect(ctx, x + lx, y + 334, 24, 16, P.steelDark);
    rect(ctx, x + lx + 6, y + 338, 12, 8, colour);
  }
  outlineRect(ctx, { x: x + 142, y: y + 328, width: 150, height: 68 }, P.steel, P.steelDark, 4);
  rect(ctx, x + 154, y + 340, 126, 18, '#d0cda3');
  for (const bx of [168, 202, 236, 264]) rect(ctx, x + bx, y + 370, 12, 10, bx === 236 && Math.floor(now / 420) % 2 === 0 ? P.red : P.tealDark);

  if (state === 'aftermath') {
    rect(ctx, x + 178, y + 38, 12, 280, P.void);
    rect(ctx, x + 182, y + 74, 34, 18, '#64756d');
    rect(ctx, x + 70, y + 288, 204, 10, P.bloodDark);
    rect(ctx, x + 118, y + 298, 132, 8, P.bloodBright);
  }
}

function drawSpecimenPrep(ctx: CanvasRenderingContext2D, now: number): void {
  const x = 230;
  const y = 790;
  outlineRect(ctx, { x, y, width: 520, height: 220 }, '#c3c096', P.wallDark, 5);
  rect(ctx, x + 20, y + 22, 480, 20, P.tealDark);
  label(ctx, 'SPECIMEN PREP // IF IT TWITCHES, LABEL IT', x + 260, y + 32, P.cream, 11);
  for (const cx of [270, 390, 510, 630]) {
    outlineRect(ctx, { x: cx, y: y + 72, width: 72, height: 92 }, P.glass, P.tealDark, 3);
    rect(ctx, cx + 8, y + 82, 56, 72, '#9bc59e');
    const fill = cx === 390 ? P.pink : cx === 510 ? P.purple : P.slime;
    rect(ctx, cx + 20, y + 120, 32, 26, fill);
    if ((Math.floor(now / 640) + cx) % 3 === 0) rect(ctx, cx + 30, y + 104, 8, 8, P.glassLight);
  }
  rect(ctx, x + 54, y + 176, 412, 10, P.woodDark);
  rect(ctx, x + 66, y + 166, 388, 12, P.woodLight);
}

function drawColdStorage(ctx: CanvasRenderingContext2D): void {
  const x = 1250;
  const y = 804;
  outlineRect(ctx, { x, y, width: 480, height: 202 }, '#c7c6a0', P.steelDark, 5);
  rect(ctx, x + 18, y + 18, 444, 28, P.steelDark);
  label(ctx, 'SOURCE LIBRARY // COLD STORAGE', x + 240, y + 32, P.cream, 11);
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const bx = x + 24 + column * 72;
      const by = y + 66 + row * 56;
      outlineRect(ctx, { x: bx, y: by, width: 58, height: 42 }, P.tealDark, P.steelDark, 2);
      rect(ctx, bx + 8, by + 8, 42, 26, column % 3 === 0 ? P.purple : column % 3 === 1 ? P.pink : P.slime);
    }
  }
}

function drawWallDetails(ctx: CanvasRenderingContext2D, now: number): void {
  outlineRect(ctx, { x: 760, y: 100, width: 440, height: 78 }, P.wood, P.woodDark, 4);
  label(ctx, "DR VIKTOR SPLICENSTEIN'S MASTER LAB", 980, 139, P.cream, 15);
  for (const x of [160, 430, 1460, 1730]) {
    outlineRect(ctx, { x, y: 106, width: 126, height: 62 }, P.glass, P.tealDark, 3);
    rect(ctx, x + 8, 114, 110, 46, P.glassLight);
    rect(ctx, x + 60, 112, 4, 50, P.tealDark);
  }
  for (const x of [735, 1210]) {
    outlineRect(ctx, { x, y: 862, width: 92, height: 120 }, P.tealDark, P.steelDark, 4);
    rect(ctx, x + 12, y: 0, width: 0, height: 0, colour: P.tealDark);
    rect(ctx, x + 12, 874, 68, 94, '#95c395');
    rect(ctx, x + 26, 918, 40, 34, x === 735 ? P.pink : P.slime);
  }
  if (Math.floor(now / 800) % 2 === 0) {
    rect(ctx, 104, 228, 12, 12, P.yellow);
    rect(ctx, 1844, 228, 12, 12, P.yellow);
  }
}

function drawAftermath(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 1070, 704, 112, 12, P.bloodDark);
  rect(ctx, 1138, 716, 84, 10, P.bloodBright);
  rect(ctx, 1200, 726, 62, 8, P.bloodDark);
  rect(ctx, 1260, 736, 28, 8, P.bloodBright);
  rect(ctx, 1330, 684, 74, 8, P.bloodDark);
  rect(ctx, 1392, 676, 34, 8, P.bloodBright);
  rect(ctx, 1114, 650, 18, 12, P.bone);
  rect(ctx, 1128, 646, 12, 8, P.bone);
  rect(ctx, 1058, 566, 8, 42, P.steelDark);
  rect(ctx, 1062, 570, 4, 32, P.void);
}

function drawForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  if (playerFeetY < 280) {
    rect(ctx, 82, 78, 1796, 76, 'rgba(42,55,48,0.18)');
  }
  if (playerFeetY < 810) {
    rect(ctx, 1284, 734, 448, 12, P.steelDark);
    for (const x of [1304, 1440, 1576, 1712]) rect(ctx, x, 738, 9, 68, P.steelDark);
  }
}

export const MASTER_LAB_COLLIDERS: readonly MasterLabRect[] = [
  { x: 82, y: 78, width: 1796, height: 72 },
  { x: 82, y: 78, width: 34, height: 1036 },
  { x: 1844, y: 78, width: 34, height: 1036 },
  { x: 82, y: 1082, width: 818, height: 32 },
  { x: 1060, y: 1082, width: 818, height: 32 },
  { x: 218, y: 258, width: 410, height: 410 },
  { x: 780, y: 444, width: 430, height: 112 },
  { x: 780, y: 696, width: 430, height: 70 },
  { x: 1232, y: 204, width: 552, height: 510 },
  { x: 230, y: 790, width: 520, height: 220 },
  { x: 1250, y: 804, width: 480, height: 202 },
  { x: 735, y: 862, width: 92, height: 120 },
  { x: 1210, y: 862, width: 92, height: 120 },
];

function overlaps(a: MasterLabRect, b: MasterLabRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function isMasterLabPositionBlocked(feetX: number, feetY: number): boolean {
  const hitbox: MasterLabRect = { x: feetX - 11, y: feetY - 13, width: 22, height: 15 };
  if (hitbox.x < FLOOR.x + 8 || hitbox.y < FLOOR.y + 8 || hitbox.x + hitbox.width > FLOOR.x + FLOOR.width - 8 || hitbox.y + hitbox.height > FLOOR.y + FLOOR.height - 8) return true;
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
  drawOverheadPipes(ctx, now);
  drawWallDetails(ctx, now);
  drawSpliceBench(ctx, now, state);
  drawViktorStage(ctx, now, state);
  drawRinoCowContainment(ctx, now, state);
  drawSpecimenPrep(ctx, now);
  drawColdStorage(ctx);
  if (state === 'aftermath') drawAftermath(ctx);
  ctx.restore();
}

export function drawMasterLabForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawForeground(ctx, playerFeetY);
  ctx.restore();
}
