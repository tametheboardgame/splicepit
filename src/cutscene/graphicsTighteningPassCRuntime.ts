import { OPENING_ROUTE_LANDMARKS } from '../world/yard.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const CANVAS_ID = 'graphics-tightening-pass-c-stage';
const STYLE_ID = 'graphics-tightening-pass-c-style';
const READY_CLASS = 'splicepit-pass-c-ready';

type Facing = 'up' | 'down' | 'left' | 'right';

type ActorState = {
  x?: number;
  y?: number;
  facing?: Facing;
};

type MasterLabDebug = {
  active?: boolean;
  rendered?: boolean;
  postDeath?: boolean;
  cameraX?: number;
  cameraY?: number;
};

type DisasterState = {
  status?: string;
  started?: boolean;
  completed?: boolean;
  breachStarted?: boolean;
  masterDead?: boolean;
  rinocowDead?: boolean;
  actorPositions?: {
    viktor?: ActorState;
    rinocow?: ActorState;
  };
};

type DebtEncounterState = {
  representativeVisible?: boolean;
};

type YardDebug = {
  cameraX?: number;
  cameraY?: number;
};

type PassCDebug = {
  ready: true;
  renderCount: number;
  labBenchmarkRendered: boolean;
  cutsceneHeroRendered: boolean;
  aftermathRendered: boolean;
  creditorRendered: boolean;
  legacyRinoCowStageSuperseded: boolean;
  legacyCreditorStageSuperseded: boolean;
  qualityReference: 'approved-protagonist-sprites';
};

type PassCGlobal = typeof globalThis & {
  __SPLICEPIT_MASTER_LAB__?: MasterLabDebug;
  __SPLICEPIT_RINOCOW_DISASTER__?: { state?: DisasterState };
  __SPLICEPIT_DEBT_ENCOUNTER__?: { state?: DebtEncounterState };
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_GRAPHICS_PASS_C__?: PassCDebug;
};

const debtLandmark = OPENING_ROUTE_LANDMARKS.find((entry) => entry.id === 'debt-encounter');
if (!debtLandmark) throw new Error('Graphics Tightening Pass C requires the debt encounter route landmark.');

const debug: PassCDebug = {
  ready: true,
  renderCount: 0,
  labBenchmarkRendered: false,
  cutsceneHeroRendered: false,
  aftermathRendered: false,
  creditorRendered: false,
  legacyRinoCowStageSuperseded: false,
  legacyCreditorStageSuperseded: false,
  qualityReference: 'approved-protagonist-sprites',
};

(globalThis as PassCGlobal).__SPLICEPIT_GRAPHICS_PASS_C__ = debug;

const P = {
  ink: '#26382f',
  deepest: '#1b2522',
  steelDark: '#46514c',
  steel: '#66736b',
  steelLight: '#9eaa98',
  steelGlint: '#d2d3b6',
  cream: '#f2dfae',
  paper: '#dfd3aa',
  leather: '#6e513b',
  leatherDark: '#46372e',
  warning: '#d4b44f',
  copper: '#b56b45',
  copperLight: '#d18b5b',
  glass: 'rgba(157, 200, 188, .42)',
  glassBright: 'rgba(201, 229, 213, .74)',
  glassDark: 'rgba(72, 105, 96, .72)',
  cowBase: '#7f7158',
  cowLight: '#a1926d',
  cowShade: '#5d5648',
  cowPatch: '#4d4a42',
  rhino: '#777568',
  rhinoLight: '#9b9781',
  horn: '#dfcfaa',
  hornShade: '#b1a07f',
  splicePink: '#b45f70',
  splicePale: '#d58a92',
  reagent: '#83b56f',
  reagentDark: '#41584b',
  blood: '#8e3941',
  bloodDark: '#632c35',
  bloodOld: '#542f33',
  tissue: '#83505b',
  tissuePale: '#b77b83',
  labCoat: '#e5e2d3',
  labCoatShade: '#b9b9aa',
  skin: '#d5b78f',
  skinShade: '#a98468',
  hair: '#d2c7a4',
  hairShade: '#8f856e',
  creditorCoat: '#59615d',
  creditorCoatLight: '#737c76',
  creditorCoatDark: '#383f3c',
  ledger: '#584638',
  ledgerLight: '#7b6049',
} as const;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colour: string,
  width = 2,
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

function polygon(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[], colour: string): void {
  if (points.length < 3) return;
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(Math.round(points[0][0]), Math.round(points[0][1]));
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(Math.round(points[index][0]), Math.round(points[index][1]));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, colour: string): void {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawContactShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, alpha = .28): void {
  ellipse(ctx, x, y, width / 2, height / 2, `rgba(25, 34, 31, ${alpha})`);
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    body.${READY_CLASS} #rinocow-disaster-stage,
    body.${READY_CLASS} #debt-collector-stage {
      opacity: 0 !important;
    }

    #${CANVAS_ID} {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: min(100vw, calc(100vh * 16 / 9));
      height: auto;
      max-height: 100vh;
      aspect-ratio: 16 / 9;
      z-index: 21;
      pointer-events: none;
      image-rendering: pixelated;
    }
  `;
  document.head.append(style);
}

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas && canvas.parentElement === root) return canvas;
  canvas?.remove();
  canvas = document.createElement('canvas');
  canvas.id = CANVAS_ID;
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;
  canvas.setAttribute('aria-hidden', 'true');
  root.style.position = 'relative';
  root.append(canvas);
  document.body.classList.add(READY_CLASS);
  return canvas;
}

function drawLabBenchmarkAccents(ctx: CanvasRenderingContext2D, now: number, postDeath: boolean): void {
  const pulse = Math.floor(now / 420) % 2 === 0;

  // Hand-authored specular accents break up long procedural surfaces and make
  // the containment bay read as metal/glass rather than flat coloured blocks.
  for (const [x, y, w] of [
    [1282, 295, 5], [1336, 300, 4], [1696, 300, 4], [1750, 296, 5],
    [1282, 432, 4], [1750, 472, 4], [1402, 246, 58], [1580, 246, 62],
  ] as const) {
    rect(ctx, x, y, w, 3, P.steelGlint);
  }

  for (const [x, y] of [[1378, 330], [1448, 330], [1518, 330], [1588, 330], [1658, 330]] as const) {
    rect(ctx, x, y, 18, 5, P.deepest);
    rect(ctx, x + 3, y + 1, 5, 3, pulse ? P.warning : P.copper);
    rect(ctx, x + 11, y + 1, 4, 3, P.steelLight);
  }

  ctx.save();
  ctx.globalAlpha = postDeath ? .08 : .12;
  polygon(ctx, [[1328, 282], [1698, 282], [1610, 650], [1412, 650]], postDeath ? P.bloodOld : P.cream);
  ctx.restore();

  // Small cable clips, fasteners and maintenance marks give the machinery the
  // same intentional micro-detail density as the player sprites.
  for (const [x, y] of [[1314, 370], [1314, 452], [1732, 386], [1732, 516], [1450, 274], [1606, 274]] as const) {
    rect(ctx, x, y, 7, 7, P.deepest);
    rect(ctx, x + 2, y + 1, 3, 3, P.steelLight);
  }

  line(ctx, 1320, 354, 1362, 342, P.copper, 3);
  line(ctx, 1718, 354, 1680, 342, P.copper, 3);
  line(ctx, 1468, 292, 1468, 316, P.steelLight, 2);
  line(ctx, 1598, 292, 1598, 316, P.steelLight, 2);
}

function drawBrokenContainmentHero(ctx: CanvasRenderingContext2D): void {
  drawContactShadow(ctx, 1508, 612, 280, 22, .22);

  // Rear frame and damaged glass cavity.
  rect(ctx, 1368, 392, 270, 10, P.deepest);
  rect(ctx, 1368, 402, 12, 204, P.steelDark);
  rect(ctx, 1626, 402, 12, 204, P.steelDark);
  rect(ctx, 1380, 586, 246, 20, P.steelDark);
  rect(ctx, 1372, 408, 5, 174, P.steelLight);
  rect(ctx, 1630, 410, 4, 160, P.steelLight);

  polygon(ctx, [[1384, 410], [1480, 410], [1452, 482], [1398, 520]], P.glass);
  polygon(ctx, [[1516, 410], [1620, 410], [1600, 494], [1544, 456]], P.glass);
  polygon(ctx, [[1464, 500], [1536, 470], [1588, 576], [1490, 580]], P.glassDark);
  line(ctx, 1430, 412, 1456, 476, P.glassBright, 3);
  line(ctx, 1586, 414, 1552, 458, P.glassBright, 3);
  line(ctx, 1512, 480, 1560, 558, P.glassBright, 2);

  // Bent central restraint and torn cabling.
  line(ctx, 1494, 392, 1490, 474, P.steelLight, 7);
  line(ctx, 1490, 474, 1460, 532, P.steelLight, 7);
  line(ctx, 1503, 394, 1508, 458, P.steelDark, 5);
  line(ctx, 1508, 458, 1540, 520, P.steelDark, 5);
  line(ctx, 1414, 402, 1430, 446, P.copper, 4);
  line(ctx, 1430, 446, 1410, 512, P.copper, 4);
  line(ctx, 1596, 402, 1576, 448, P.reagent, 4);
  line(ctx, 1576, 448, 1606, 534, P.reagent, 4);

  // Broken fluid feed and puddle.
  rect(ctx, 1600, 510, 22, 12, P.steelDark);
  rect(ctx, 1604, 513, 12, 5, P.steelLight);
  line(ctx, 1614, 522, 1596, 568, P.reagentDark, 5);
  ellipse(ctx, 1574, 596, 64, 13, 'rgba(65, 88, 75, .64)');
  rect(ctx, 1544, 588, 28, 4, '#7aa06f');
  rect(ctx, 1580, 592, 36, 3, '#6a8f67');

  // Pixel-sized shards, deliberately irregular rather than evenly repeated.
  for (const [x, y, w, h] of [
    [1402, 550, 10, 4], [1424, 574, 16, 5], [1450, 590, 7, 4], [1478, 562, 13, 4],
    [1512, 596, 9, 3], [1540, 572, 17, 5], [1588, 558, 8, 4], [1608, 580, 12, 4],
  ] as const) {
    polygon(ctx, [[x, y], [x + w, y + 1], [x + Math.floor(w / 2), y + h]], P.glassBright);
  }

  rect(ctx, 1378, 414, 46, 14, P.warning);
  rect(ctx, 1384, 417, 34, 3, P.deepest);
  rect(ctx, 1384, 422, 24, 2, P.deepest);
}

function drawViktorHero(ctx: CanvasRenderingContext2D, actor: ActorState, dead: boolean, now: number): void {
  const x = actor.x ?? 980;
  const y = actor.y ?? 620;

  if (dead) {
    drawContactShadow(ctx, x + 8, y + 10, 108, 20, .32);
    rect(ctx, x - 46, y - 6, 68, 18, P.labCoatShade);
    rect(ctx, x - 42, y - 12, 64, 16, P.labCoat);
    rect(ctx, x - 34, y - 9, 9, 4, P.blood);
    rect(ctx, x - 20, y - 6, 18, 3, P.bloodDark);
    rect(ctx, x + 14, y - 16, 34, 16, P.skinShade);
    rect(ctx, x + 20, y - 21, 28, 17, P.skin);
    rect(ctx, x + 23, y - 24, 25, 5, P.hairShade);
    rect(ctx, x + 45, y - 17, 4, 4, P.ink);
    rect(ctx, x - 40, y + 9, 19, 6, P.creditorCoatDark);
    rect(ctx, x + 34, y + 2, 27, 7, P.creditorCoatDark);
    rect(ctx, x + 2, y - 5, 5, 5, P.warning);
    return;
  }

  drawContactShadow(ctx, x, y + 2, 50, 14, .27);
  const facingRight = actor.facing === 'right';
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facingRight ? -1 : 1, 1);

  // Legs and shoes.
  rect(ctx, -15, -16, 11, 18, P.creditorCoatDark);
  rect(ctx, 4, -16, 11, 18, P.creditorCoatDark);
  rect(ctx, -18, 0, 15, 6, P.deepest);
  rect(ctx, 3, 0, 17, 6, P.deepest);

  // Lab coat with stepped silhouette and seam detail.
  polygon(ctx, [[-22, -58], [20, -58], [24, -18], [14, -11], [-15, -11], [-25, -20]], P.labCoatShade);
  polygon(ctx, [[-18, -56], [17, -56], [19, -21], [10, -15], [-11, -15], [-20, -22]], P.labCoat);
  rect(ctx, -2, -55, 4, 39, '#a4aa9c');
  rect(ctx, -14, -39, 8, 5, '#d5d2c4');
  rect(ctx, 8, -39, 7, 5, '#d5d2c4');
  rect(ctx, 9, -31, 6, 3, P.copper);
  rect(ctx, -15, -27, 5, 5, P.warning);

  // Arms, gloves and handheld injector.
  rect(ctx, -27, -50, 8, 31, P.labCoatShade);
  rect(ctx, 18, -50, 8, 30, P.labCoatShade);
  rect(ctx, -27, -22, 8, 8, P.skinShade);
  rect(ctx, 19, -23, 8, 8, P.skinShade);
  rect(ctx, 25, -27, 18, 5, P.steelDark);
  rect(ctx, 39, -29, 5, 9, P.steelLight);
  rect(ctx, 29, -26, 6, 3, P.splicePink);

  // Head, hair, goggles and expression.
  rect(ctx, -14, -78, 28, 23, P.skinShade);
  rect(ctx, -11, -80, 25, 22, P.skin);
  polygon(ctx, [[-16, -82], [-8, -89], [14, -87], [18, -79], [12, -75], [-12, -76]], P.hairShade);
  rect(ctx, -7, -90, 8, 6, P.hair);
  rect(ctx, 4, -91, 9, 7, P.hair);
  rect(ctx, -12, -75, 10, 7, P.steelDark);
  rect(ctx, 3, -75, 10, 7, P.steelDark);
  rect(ctx, -9, -73, 5, 3, '#b5d4c7');
  rect(ctx, 6, -73, 5, 3, '#b5d4c7');
  rect(ctx, -2, -73, 5, 2, P.steelLight);
  rect(ctx, 10, -64, 5, 2, P.bloodOld);
  rect(ctx, -7, -62, 11, 2, P.skinShade);

  // Tiny coat badge flicker makes the sprite feel alive without full animation.
  rect(ctx, -13, -49, 7, 8, P.deepest);
  rect(ctx, -11, -47, 3, 3, Math.floor(now / 360) % 2 === 0 ? P.reagent : P.warning);

  ctx.restore();
}

function drawRinoCowHero(ctx: CanvasRenderingContext2D, actor: ActorState, dead: boolean, now: number): void {
  const x = actor.x ?? 1500;
  const y = actor.y ?? 700;
  const facingRight = actor.facing === 'right';
  const breath = dead ? 0 : Math.floor(now / 320) % 2;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facingRight ? -1 : 1, 1);

  if (dead) {
    drawContactShadow(ctx, 5, 10, 190, 24, .35);
    polygon(ctx, [[-82, -31], [42, -31], [68, -21], [76, -4], [54, 8], [-72, 8], [-91, -4]], P.cowShade);
    polygon(ctx, [[-73, -36], [39, -36], [61, -26], [63, -12], [45, 1], [-69, 1], [-84, -11]], P.cowBase);
    rect(ctx, -50, -31, 24, 11, P.cowPatch);
    rect(ctx, 2, -27, 30, 10, P.cowLight);
    polygon(ctx, [[49, -29], [92, -26], [109, -16], [99, -3], [58, -7]], P.rhino);
    polygon(ctx, [[89, -28], [119, -35], [110, -23]], P.hornShade);
    polygon(ctx, [[108, -35], [144, -39], [119, -29]], P.horn);
    rect(ctx, -62, 0, 20, 8, P.deepest);
    rect(ctx, 12, 0, 24, 8, P.deepest);
    rect(ctx, 49, -13, 9, 6, P.blood);
    return;
  }

  drawContactShadow(ctx, -4, 9, 176, 22, .31);

  // Four weighty legs with knee/hoof segmentation.
  for (const legX of [-59, -20, 24, 52]) {
    const rear = legX < 0;
    rect(ctx, legX, -5, 18, 35, rear ? P.cowShade : P.rhino);
    rect(ctx, legX + 3, 20, 14, 17, P.cowShade);
    rect(ctx, legX + 1, 35, 18, 8, P.deepest);
    rect(ctx, legX + 3, 35, 6, 4, P.steelDark);
  }

  // Cow barrel with deliberately stepped silhouette, not a single rectangle.
  polygon(ctx, [[-78, -65 - breath], [27, -65 - breath], [51, -55], [61, -31], [49, -9], [21, 0], [-62, -2], [-86, -23], [-88, -48]], P.cowShade);
  polygon(ctx, [[-70, -62 - breath], [22, -62 - breath], [44, -52], [50, -31], [39, -13], [16, -7], [-57, -9], [-79, -27], [-79, -48]], P.cowBase);
  polygon(ctx, [[-66, -59 - breath], [-18, -60 - breath], [-9, -17], [-54, -16], [-73, -32]], P.cowLight);
  polygon(ctx, [[-15, -61 - breath], [19, -59 - breath], [41, -48], [45, -33], [30, -27], [0, -33]], P.cowPatch);
  rect(ctx, -43, -50, 19, 13, P.cowPatch);
  rect(ctx, -57, -29, 14, 11, P.cowPatch);

  // Visible splice seam, staples and a small maintenance port.
  line(ctx, -5, -61, -2, -13, P.splicePink, 3);
  for (const sy of [-53, -43, -33, -23]) {
    rect(ctx, -10, sy, 13, 2, P.steelLight);
    rect(ctx, -8, sy - 2, 2, 6, P.deepest);
    rect(ctx, 0, sy - 2, 2, 6, P.deepest);
  }
  rect(ctx, -34, -21, 18, 15, P.steelDark);
  rect(ctx, -30, -18, 10, 8, P.reagentDark);
  rect(ctx, -27, -16, 4, 4, Math.floor(now / 260) % 3 === 0 ? P.warning : P.reagent);

  // Udder retained so the creature reads unmistakably as cow-derived.
  polygon(ctx, [[-12, -12], [19, -12], [25, 0], [18, 12], [-5, 12], [-16, 2]], P.splicePink);
  rect(ctx, -7, 9, 5, 10, P.splicePale);
  rect(ctx, 7, 9, 5, 11, P.splicePale);

  // Rhino shoulder, neck and head graft.
  polygon(ctx, [[29, -64], [59, -68], [79, -55], [83, -25], [58, -13], [42, -31]], P.rhino);
  polygon(ctx, [[53, -66], [94, -64], [116, -49], [113, -25], [88, -14], [61, -19]], P.rhino);
  polygon(ctx, [[60, -62], [91, -60], [106, -48], [103, -37], [73, -39]], P.rhinoLight);
  polygon(ctx, [[94, -61], [123, -56], [137, -43], [131, -25], [106, -20], [101, -39]], P.rhino);
  rect(ctx, 121, -39, 18, 13, P.rhinoLight);
  rect(ctx, 126, -33, 6, 4, P.deepest);
  rect(ctx, 106, -48, 7, 7, P.blood);
  rect(ctx, 108, -46, 3, 3, '#e59a7a');

  // Primary and secondary horns with shaded bases.
  polygon(ctx, [[119, -55], [139, -73], [136, -53]], P.hornShade);
  polygon(ctx, [[132, -64], [176, -78], [142, -53]], P.horn);
  polygon(ctx, [[105, -58], [116, -70], [117, -55]], P.horn);

  // Ear, jaw, nostril and teeth pixels.
  polygon(ctx, [[87, -62], [83, -76], [98, -67]], P.cowShade);
  rect(ctx, 126, -24, 13, 5, P.cowShade);
  rect(ctx, 139, -29, 5, 3, P.deepest);
  rect(ctx, 125, -18, 5, 5, P.horn);
  rect(ctx, 133, -18, 5, 4, P.horn);

  // Heavy containment collar and cable feed help sell engineered mass.
  rect(ctx, 43, -62, 10, 49, P.deepest);
  rect(ctx, 46, -58, 5, 39, P.steelLight);
  rect(ctx, 37, -49, 21, 8, P.steelDark);
  rect(ctx, 42, -47, 11, 4, P.warning);
  line(ctx, 42, -56, 22, -82, P.copper, 4);
  line(ctx, 22, -82, -8, -82, P.copperLight, 3);

  // Tail with tuft and a few stressed hairs.
  line(ctx, -78, -50, -104, -60, P.cowShade, 4);
  line(ctx, -104, -60, -112, -48, P.cowShade, 4);
  rect(ctx, -118, -50, 13, 10, P.cowPatch);
  rect(ctx, -119, -53, 4, 5, P.deepest);

  ctx.restore();
}

function drawAftermath(ctx: CanvasRenderingContext2D, now: number): void {
  // Blood is kept localised and textural, readable as aftermath rather than a
  // flat red overlay across the room.
  ellipse(ctx, 1018, 652, 66, 13, 'rgba(84, 47, 51, .52)');
  rect(ctx, 966, 646, 36, 5, P.bloodDark);
  rect(ctx, 1010, 652, 27, 4, P.blood);
  rect(ctx, 1047, 657, 18, 3, P.bloodOld);

  for (const [x, y, w] of [[1082, 642, 22], [1122, 652, 18], [1160, 660, 15], [1190, 668, 11]] as const) {
    rect(ctx, x, y, w, 4, P.bloodOld);
  }

  // Hoof gouges and dragged equipment marks.
  for (const [x, y] of [[1218, 646], [1248, 662], [1282, 676]] as const) {
    line(ctx, x, y, x + 18, y + 7, '#665e4d', 3);
    line(ctx, x + 5, y - 5, x + 23, y + 2, '#81745a', 2);
  }

  // Fallen emergency placard and discarded clean-up roll.
  ctx.save();
  ctx.translate(1342, 642);
  ctx.rotate(-.12);
  rect(ctx, -28, -10, 56, 20, P.warning);
  rect(ctx, -22, -6, 44, 3, P.deepest);
  rect(ctx, -16, 0, 31, 2, P.deepest);
  ctx.restore();
  rect(ctx, 1294, 626, 22, 14, P.paper);
  rect(ctx, 1300, 629, 12, 8, P.bloodOld);

  // Residual containment leak and intermittent failed warning light.
  ellipse(ctx, 1574, 596, 58, 10, 'rgba(64, 82, 72, .48)');
  rect(ctx, 1600, 510, 22, 12, P.steelDark);
  rect(ctx, 1605, 514, 9, 4, Math.floor(now / 620) % 4 === 0 ? P.blood : P.steelLight);
}

function drawCreditorRepresentative(ctx: CanvasRenderingContext2D, x: number, y: number, now: number): void {
  drawContactShadow(ctx, x, y - 2, 50, 14, .3);

  // Shoes and narrow trousers keep the silhouette in the protagonist scale.
  rect(ctx, x - 15, y - 18, 11, 19, P.creditorCoatDark);
  rect(ctx, x + 4, y - 18, 11, 19, P.creditorCoatDark);
  rect(ctx, x - 18, y - 1, 15, 6, P.deepest);
  rect(ctx, x + 3, y - 1, 18, 6, P.deepest);

  // Long coat with asymmetric lapel, seams and pocket pixels.
  polygon(ctx, [[x - 23, y - 63], [x + 21, y - 63], [x + 25, y - 20], [x + 15, y - 12], [x - 15, y - 12], [x - 27, y - 23]], P.creditorCoatDark);
  polygon(ctx, [[x - 18, y - 61], [x + 17, y - 61], [x + 19, y - 23], [x + 10, y - 17], [x - 11, y - 17], [x - 21, y - 25]], P.creditorCoat);
  polygon(ctx, [[x - 4, y - 61], [x + 14, y - 58], [x + 3, y - 39], [x - 1, y - 42]], P.creditorCoatLight);
  rect(ctx, x - 2, y - 54, 4, 34, P.paper);
  rect(ctx, x - 14, y - 33, 8, 5, P.creditorCoatLight);
  rect(ctx, x + 8, y - 33, 7, 5, P.creditorCoatLight);
  rect(ctx, x - 18, y - 48, 6, 29, P.creditorCoatDark);
  rect(ctx, x + 16, y - 48, 6, 29, P.creditorCoatDark);

  // Head, brimmed cap, hard expression and ear piece.
  rect(ctx, x - 13, y - 83, 27, 23, P.skinShade);
  rect(ctx, x - 10, y - 84, 24, 21, P.skin);
  rect(ctx, x - 18, y - 89, 36, 7, P.creditorCoatDark);
  rect(ctx, x - 11, y - 94, 24, 7, P.deepest);
  rect(ctx, x - 7, y - 75, 4, 4, P.deepest);
  rect(ctx, x + 6, y - 75, 4, 4, P.deepest);
  rect(ctx, x - 2, y - 67, 11, 2, P.skinShade);
  rect(ctx, x + 13, y - 78, 4, 9, P.steelDark);
  rect(ctx, x + 15, y - 76, 3, 3, Math.floor(now / 560) % 2 === 0 ? P.warning : P.steelLight);

  // Ledger case, paper tab and brass lock are the encounter's visual story prop.
  rect(ctx, x + 20, y - 42, 31, 30, P.leatherDark);
  rect(ctx, x + 24, y - 39, 24, 23, P.ledger);
  rect(ctx, x + 28, y - 46, 17, 8, P.paper);
  rect(ctx, x + 30, y - 44, 13, 2, P.steelDark);
  rect(ctx, x + 30, y - 40, 10, 2, P.steelDark);
  rect(ctx, x + 34, y - 29, 6, 6, P.warning);
  rect(ctx, x + 19, y - 31, 6, 17, P.creditorCoatDark);
}

function render(): void {
  const global = globalThis as PassCGlobal;
  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  if (!canvas || !ctx) {
    requestAnimationFrame(render);
    return;
  }

  const lab = global.__SPLICEPIT_MASTER_LAB__;
  const disaster = global.__SPLICEPIT_RINOCOW_DISASTER__?.state;
  const debt = global.__SPLICEPIT_DEBT_ENCOUNTER__?.state;
  const labVisible = Boolean(lab?.active && lab?.rendered);
  const debtVisible = Boolean(debt?.representativeVisible);
  canvas.style.display = labVisible || debtVisible ? 'block' : 'none';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.imageSmoothingEnabled = false;

  if (labVisible) {
    const cameraX = lab?.cameraX ?? 0;
    const cameraY = lab?.cameraY ?? 0;
    const running = disaster?.status === 'running';
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    drawLabBenchmarkAccents(ctx, performance.now(), Boolean(lab?.postDeath));
    debug.labBenchmarkRendered = true;

    if (running && disaster?.breachStarted) {
      drawBrokenContainmentHero(ctx);
      const viktor = disaster.actorPositions?.viktor ?? {};
      const rinocow = disaster.actorPositions?.rinocow ?? {};
      drawViktorHero(ctx, viktor, Boolean(disaster.masterDead), performance.now());
      drawRinoCowHero(ctx, rinocow, Boolean(disaster.rinocowDead), performance.now());
      debug.cutsceneHeroRendered = true;
    } else if (lab?.postDeath) {
      drawBrokenContainmentHero(ctx);
      drawAftermath(ctx, performance.now());
      debug.aftermathRendered = true;
    }
    ctx.restore();
  }

  if (debtVisible) {
    const yard = global.__SPLICEPIT_VISUAL_RESET__;
    const x = debtLandmark.x - (yard?.cameraX ?? 0);
    const y = debtLandmark.y - (yard?.cameraY ?? 0);
    drawCreditorRepresentative(ctx, x, y, performance.now());
    debug.creditorRendered = true;
  }

  debug.renderCount += 1;
  debug.legacyRinoCowStageSuperseded = document.getElementById('rinocow-disaster-stage') !== null;
  debug.legacyCreditorStageSuperseded = document.getElementById('debt-collector-stage') !== null;
  requestAnimationFrame(render);
}

ensureStyles();
ensureCanvas();
requestAnimationFrame(render);

export {};
