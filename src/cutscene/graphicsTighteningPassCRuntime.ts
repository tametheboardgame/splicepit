import { OPENING_ROUTE_LANDMARKS } from '../world/yard.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const CANVAS_ID = 'graphics-tightening-pass-c-stage';
const STYLE_ID = 'graphics-tightening-pass-c-style';
const READY_CLASS = 'splicepit-pass-c-ready';

type Facing = 'up' | 'down' | 'left' | 'right';
type ActorState = { x?: number; y?: number; facing?: Facing };
type MasterLabDebug = { active?: boolean; rendered?: boolean; postDeath?: boolean; cameraX?: number; cameraY?: number };
type DisasterState = {
  status?: string;
  breachStarted?: boolean;
  masterDead?: boolean;
  rinocowDead?: boolean;
  actorPositions?: { viktor?: ActorState; rinocow?: ActorState };
};
type DebtEncounterState = { representativeVisible?: boolean };
type YardDebug = { cameraX?: number; cameraY?: number };
type PassCDebug = {
  ready: true;
  renderCount: number;
  labBenchmarkRendered: boolean;
  containedRinoCowRendered: boolean;
  viktorHeroRendered: boolean;
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

function requireDebtLandmark() {
  const landmark = OPENING_ROUTE_LANDMARKS.find((entry) => entry.id === 'debt-encounter');
  if (!landmark) throw new Error('Graphics Tightening Pass C requires the debt encounter route landmark.');
  return landmark;
}

const DEBT_LANDMARK = requireDebtLandmark();
const debug: PassCDebug = {
  ready: true,
  renderCount: 0,
  labBenchmarkRendered: false,
  containedRinoCowRendered: false,
  viktorHeroRendered: false,
  cutsceneHeroRendered: false,
  aftermathRendered: false,
  creditorRendered: false,
  legacyRinoCowStageSuperseded: false,
  legacyCreditorStageSuperseded: false,
  qualityReference: 'approved-protagonist-sprites',
};
(globalThis as PassCGlobal).__SPLICEPIT_GRAPHICS_PASS_C__ = debug;

const P = {
  ink: '#26382f', deep: '#1b2522', steelDark: '#46514c', steel: '#68736c', steelLight: '#a4ad9b',
  cream: '#f2dfae', paper: '#ded2aa', warning: '#d4b44f', copper: '#b56b45', copperLight: '#d18b5b',
  glass: 'rgba(157,200,188,.44)', glassBright: 'rgba(214,235,219,.76)', glassDark: 'rgba(67,99,90,.72)',
  cow: '#7f7158', cowLight: '#a49470', cowDark: '#5d5648', cowPatch: '#484941', rhino: '#747468',
  rhinoLight: '#999681', horn: '#dfcfaa', hornShade: '#b2a17f', splice: '#b85f70', spliceLight: '#d58a92',
  reagent: '#83b56f', reagentDark: '#41584b', blood: '#8e3941', bloodDark: '#612d35', bloodOld: '#542f33',
  coat: '#e5e2d3', coatShade: '#b9b9aa', skin: '#d5b78f', skinShade: '#a98468', hair: '#d2c7a4', hairShade: '#8f856e',
  creditor: '#59615d', creditorLight: '#737c76', creditorDark: '#383f3c', leather: '#584638', leatherLight: '#7b6049',
} as const;

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, colour: string, width = 2): void {
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

function poly(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[], colour: string): void {
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

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, colour: string): void {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha = .28): void {
  ellipse(ctx, x, y, w / 2, h / 2, `rgba(25,34,31,${alpha})`);
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    body.${READY_CLASS} #rinocow-disaster-stage,
    body.${READY_CLASS} #debt-collector-stage { opacity: 0 !important; }
    #${CANVAS_ID} {
      position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      width:min(100vw,calc(100vh * 16 / 9)); height:auto; max-height:100vh;
      aspect-ratio:16/9; z-index:21; pointer-events:none; image-rendering:pixelated;
    }
  `;
  document.head.append(style);
}

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!canvas || canvas.parentElement !== root) {
    canvas?.remove();
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;
    canvas.setAttribute('aria-hidden', 'true');
    root.style.position = 'relative';
    root.append(canvas);
  }
  document.body.classList.add(READY_CLASS);
  return canvas;
}

function drawLabBenchmarkAccents(ctx: CanvasRenderingContext2D, now: number, postDeath: boolean): void {
  const pulse = Math.floor(now / 420) % 2 === 0;
  for (const [x, y, w] of [[1282,295,5],[1336,300,4],[1696,300,4],[1750,296,5],[1282,432,4],[1750,472,4],[1402,246,58],[1580,246,62]] as const) {
    rect(ctx, x, y, w, 3, P.steelLight);
  }
  for (const [x, y] of [[1378,330],[1448,330],[1518,330],[1588,330],[1658,330]] as const) {
    rect(ctx, x, y, 18, 5, P.deep);
    rect(ctx, x + 3, y + 1, 5, 3, pulse ? P.warning : P.copper);
    rect(ctx, x + 11, y + 1, 4, 3, P.steelLight);
  }
  ctx.save();
  ctx.globalAlpha = postDeath ? .07 : .11;
  poly(ctx, [[1328,282],[1698,282],[1610,650],[1412,650]], postDeath ? P.bloodOld : P.cream);
  ctx.restore();
  for (const [x, y] of [[1314,370],[1314,452],[1732,386],[1732,516],[1450,274],[1606,274]] as const) {
    rect(ctx, x, y, 7, 7, P.deep);
    rect(ctx, x + 2, y + 1, 3, 3, P.steelLight);
  }
  line(ctx, 1320, 354, 1362, 342, P.copper, 3);
  line(ctx, 1718, 354, 1680, 342, P.copper, 3);
}

function drawContainedRinoCow(ctx: CanvasRenderingContext2D, now: number): void {
  // Wash out the old prototype animal inside the tank without flattening the
  // containment frame, then replace it with the authored hero silhouette.
  rect(ctx, 1338, 338, 338, 232, 'rgba(112,157,130,.88)');
  for (let x = 1360; x <= 1640; x += 44) rect(ctx, x, 342, 3, 224, 'rgba(49,95,91,.42)');
  drawRinoCow(ctx, { x: 1500, y: 536, facing: 'left' }, false, now, .82);
  rect(ctx, 1342, 348, 8, 176, P.glassBright);
  rect(ctx, 1658, 360, 6, 154, 'rgba(214,235,219,.52)');
  line(ctx, 1370, 354, 1424, 338, 'rgba(214,235,219,.44)', 3);
  debug.containedRinoCowRendered = true;
}

function drawBrokenContainment(ctx: CanvasRenderingContext2D): void {
  shadow(ctx, 1508, 612, 280, 22, .23);
  rect(ctx, 1368, 392, 270, 10, P.deep);
  rect(ctx, 1368, 402, 12, 204, P.steelDark);
  rect(ctx, 1626, 402, 12, 204, P.steelDark);
  rect(ctx, 1380, 586, 246, 20, P.steelDark);
  rect(ctx, 1372, 408, 5, 174, P.steelLight);
  rect(ctx, 1630, 410, 4, 160, P.steelLight);
  poly(ctx, [[1384,410],[1480,410],[1452,482],[1398,520]], P.glass);
  poly(ctx, [[1516,410],[1620,410],[1600,494],[1544,456]], P.glass);
  poly(ctx, [[1464,500],[1536,470],[1588,576],[1490,580]], P.glassDark);
  line(ctx, 1430, 412, 1456, 476, P.glassBright, 3);
  line(ctx, 1586, 414, 1552, 458, P.glassBright, 3);
  line(ctx, 1494, 392, 1460, 532, P.steelLight, 7);
  line(ctx, 1503, 394, 1540, 520, P.steelDark, 5);
  line(ctx, 1414, 402, 1410, 512, P.copper, 4);
  line(ctx, 1596, 402, 1606, 534, P.reagent, 4);
  ellipse(ctx, 1574, 596, 64, 13, 'rgba(65,88,75,.64)');
  for (const [x, y, w, h] of [[1402,550,10,4],[1424,574,16,5],[1450,590,7,4],[1478,562,13,4],[1512,596,9,3],[1540,572,17,5],[1588,558,8,4],[1608,580,12,4]] as const) {
    poly(ctx, [[x,y],[x + w,y + 1],[x + Math.floor(w / 2),y + h]], P.glassBright);
  }
  rect(ctx, 1378, 414, 46, 14, P.warning);
  rect(ctx, 1384, 417, 34, 3, P.deep);
  rect(ctx, 1384, 422, 24, 2, P.deep);
}

function drawViktor(ctx: CanvasRenderingContext2D, actor: ActorState, dead: boolean, now: number): void {
  const x = actor.x ?? 980;
  const y = actor.y ?? 620;
  if (dead) {
    shadow(ctx, x + 8, y + 10, 108, 20, .32);
    rect(ctx, x - 46, y - 6, 68, 18, P.coatShade);
    rect(ctx, x - 42, y - 12, 64, 16, P.coat);
    rect(ctx, x - 34, y - 9, 9, 4, P.blood);
    rect(ctx, x - 20, y - 6, 18, 3, P.bloodDark);
    rect(ctx, x + 14, y - 16, 34, 16, P.skinShade);
    rect(ctx, x + 20, y - 21, 28, 17, P.skin);
    rect(ctx, x + 23, y - 24, 25, 5, P.hairShade);
    rect(ctx, x + 45, y - 17, 4, 4, P.ink);
    rect(ctx, x - 40, y + 9, 19, 6, P.creditorDark);
    rect(ctx, x + 34, y + 2, 27, 7, P.creditorDark);
    return;
  }

  shadow(ctx, x, y + 2, 50, 14, .27);
  const mirror = actor.facing === 'right' ? -1 : 1;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(mirror, 1);
  rect(ctx, -15, -16, 11, 18, P.creditorDark);
  rect(ctx, 4, -16, 11, 18, P.creditorDark);
  rect(ctx, -18, 0, 15, 6, P.deep);
  rect(ctx, 3, 0, 17, 6, P.deep);
  poly(ctx, [[-22,-58],[20,-58],[24,-18],[14,-11],[-15,-11],[-25,-20]], P.coatShade);
  poly(ctx, [[-18,-56],[17,-56],[19,-21],[10,-15],[-11,-15],[-20,-22]], P.coat);
  rect(ctx, -2, -55, 4, 39, '#a4aa9c');
  rect(ctx, -27, -50, 8, 31, P.coatShade);
  rect(ctx, 18, -50, 8, 30, P.coatShade);
  rect(ctx, -27, -22, 8, 8, P.skinShade);
  rect(ctx, 19, -23, 8, 8, P.skinShade);
  rect(ctx, 25, -27, 18, 5, P.steelDark);
  rect(ctx, 39, -29, 5, 9, P.steelLight);
  rect(ctx, 29, -26, 6, 3, P.splice);
  rect(ctx, -14, -78, 28, 23, P.skinShade);
  rect(ctx, -11, -80, 25, 22, P.skin);
  poly(ctx, [[-16,-82],[-8,-89],[14,-87],[18,-79],[12,-75],[-12,-76]], P.hairShade);
  rect(ctx, -7, -90, 8, 6, P.hair);
  rect(ctx, 4, -91, 9, 7, P.hair);
  rect(ctx, -12, -75, 10, 7, P.steelDark);
  rect(ctx, 3, -75, 10, 7, P.steelDark);
  rect(ctx, -9, -73, 5, 3, '#b5d4c7');
  rect(ctx, 6, -73, 5, 3, '#b5d4c7');
  rect(ctx, -2, -73, 5, 2, P.steelLight);
  rect(ctx, -13, -49, 7, 8, P.deep);
  rect(ctx, -11, -47, 3, 3, Math.floor(now / 360) % 2 === 0 ? P.reagent : P.warning);
  ctx.restore();
  debug.viktorHeroRendered = true;
}

function drawRinoCow(ctx: CanvasRenderingContext2D, actor: ActorState, dead: boolean, now: number, scale = 1): void {
  const x = actor.x ?? 1500;
  const y = actor.y ?? 700;
  const mirror = actor.facing === 'right' ? -1 : 1;
  const breath = dead ? 0 : Math.floor(now / 320) % 2;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(mirror * scale, scale);

  if (dead) {
    shadow(ctx, 5, 10, 190, 24, .35);
    poly(ctx, [[-82,-31],[42,-31],[68,-21],[76,-4],[54,8],[-72,8],[-91,-4]], P.cowDark);
    poly(ctx, [[-73,-36],[39,-36],[61,-26],[63,-12],[45,1],[-69,1],[-84,-11]], P.cow);
    rect(ctx, -50, -31, 24, 11, P.cowPatch);
    poly(ctx, [[49,-29],[92,-26],[109,-16],[99,-3],[58,-7]], P.rhino);
    poly(ctx, [[108,-35],[144,-39],[119,-29]], P.horn);
    rect(ctx, 49, -13, 9, 6, P.blood);
    ctx.restore();
    return;
  }

  shadow(ctx, -4, 9, 176, 22, .31);
  for (const legX of [-59,-20,24,52]) {
    rect(ctx, legX, -5, 18, 35, legX < 0 ? P.cowDark : P.rhino);
    rect(ctx, legX + 3, 20, 14, 17, P.cowDark);
    rect(ctx, legX + 1, 35, 18, 8, P.deep);
  }
  poly(ctx, [[-78,-65-breath],[27,-65-breath],[51,-55],[61,-31],[49,-9],[21,0],[-62,-2],[-86,-23],[-88,-48]], P.cowDark);
  poly(ctx, [[-70,-62-breath],[22,-62-breath],[44,-52],[50,-31],[39,-13],[16,-7],[-57,-9],[-79,-27],[-79,-48]], P.cow);
  poly(ctx, [[-66,-59-breath],[-18,-60-breath],[-9,-17],[-54,-16],[-73,-32]], P.cowLight);
  poly(ctx, [[-15,-61-breath],[19,-59-breath],[41,-48],[45,-33],[30,-27],[0,-33]], P.cowPatch);
  rect(ctx, -43, -50, 19, 13, P.cowPatch);
  line(ctx, -5, -61, -2, -13, P.splice, 3);
  for (const sy of [-53,-43,-33,-23]) {
    rect(ctx, -10, sy, 13, 2, P.steelLight);
    rect(ctx, -8, sy - 2, 2, 6, P.deep);
    rect(ctx, 0, sy - 2, 2, 6, P.deep);
  }
  rect(ctx, -34, -21, 18, 15, P.steelDark);
  rect(ctx, -30, -18, 10, 8, P.reagentDark);
  rect(ctx, -27, -16, 4, 4, Math.floor(now / 260) % 3 === 0 ? P.warning : P.reagent);
  poly(ctx, [[-12,-12],[19,-12],[25,0],[18,12],[-5,12],[-16,2]], P.splice);
  rect(ctx, -7, 9, 5, 10, P.spliceLight);
  rect(ctx, 7, 9, 5, 11, P.spliceLight);
  poly(ctx, [[29,-64],[59,-68],[79,-55],[83,-25],[58,-13],[42,-31]], P.rhino);
  poly(ctx, [[53,-66],[94,-64],[116,-49],[113,-25],[88,-14],[61,-19]], P.rhino);
  poly(ctx, [[60,-62],[91,-60],[106,-48],[103,-37],[73,-39]], P.rhinoLight);
  poly(ctx, [[94,-61],[123,-56],[137,-43],[131,-25],[106,-20],[101,-39]], P.rhino);
  rect(ctx, 121, -39, 18, 13, P.rhinoLight);
  rect(ctx, 126, -33, 6, 4, P.deep);
  rect(ctx, 106, -48, 7, 7, P.blood);
  poly(ctx, [[119,-55],[139,-73],[136,-53]], P.hornShade);
  poly(ctx, [[132,-64],[176,-78],[142,-53]], P.horn);
  poly(ctx, [[105,-58],[116,-70],[117,-55]], P.horn);
  rect(ctx, 43, -62, 10, 49, P.deep);
  rect(ctx, 46, -58, 5, 39, P.steelLight);
  rect(ctx, 37, -49, 21, 8, P.steelDark);
  rect(ctx, 42, -47, 11, 4, P.warning);
  line(ctx, 42, -56, 22, -82, P.copper, 4);
  line(ctx, 22, -82, -8, -82, P.copperLight, 3);
  line(ctx, -78, -50, -104, -60, P.cowDark, 4);
  line(ctx, -104, -60, -112, -48, P.cowDark, 4);
  rect(ctx, -118, -50, 13, 10, P.cowPatch);
  ctx.restore();
}

function drawAftermath(ctx: CanvasRenderingContext2D, now: number): void {
  ellipse(ctx, 1018, 652, 66, 13, 'rgba(84,47,51,.52)');
  rect(ctx, 966, 646, 36, 5, P.bloodDark);
  rect(ctx, 1010, 652, 27, 4, P.blood);
  rect(ctx, 1047, 657, 18, 3, P.bloodOld);
  for (const [x, y, w] of [[1082,642,22],[1122,652,18],[1160,660,15],[1190,668,11]] as const) rect(ctx, x, y, w, 4, P.bloodOld);
  for (const [x, y] of [[1218,646],[1248,662],[1282,676]] as const) {
    line(ctx, x, y, x + 18, y + 7, '#665e4d', 3);
    line(ctx, x + 5, y - 5, x + 23, y + 2, '#81745a', 2);
  }
  ctx.save();
  ctx.translate(1342, 642);
  ctx.rotate(-.12);
  rect(ctx, -28, -10, 56, 20, P.warning);
  rect(ctx, -22, -6, 44, 3, P.deep);
  rect(ctx, -16, 0, 31, 2, P.deep);
  ctx.restore();
  rect(ctx, 1294, 626, 22, 14, P.paper);
  rect(ctx, 1300, 629, 12, 8, P.bloodOld);
  rect(ctx, 1600, 510, 22, 12, P.steelDark);
  rect(ctx, 1605, 514, 9, 4, Math.floor(now / 620) % 4 === 0 ? P.blood : P.steelLight);
}

function drawCreditor(ctx: CanvasRenderingContext2D, x: number, y: number, now: number): void {
  shadow(ctx, x, y - 2, 50, 14, .3);
  rect(ctx, x - 15, y - 18, 11, 19, P.creditorDark);
  rect(ctx, x + 4, y - 18, 11, 19, P.creditorDark);
  rect(ctx, x - 18, y - 1, 15, 6, P.deep);
  rect(ctx, x + 3, y - 1, 18, 6, P.deep);
  poly(ctx, [[x-23,y-63],[x+21,y-63],[x+25,y-20],[x+15,y-12],[x-15,y-12],[x-27,y-23]], P.creditorDark);
  poly(ctx, [[x-18,y-61],[x+17,y-61],[x+19,y-23],[x+10,y-17],[x-11,y-17],[x-21,y-25]], P.creditor);
  poly(ctx, [[x-4,y-61],[x+14,y-58],[x+3,y-39],[x-1,y-42]], P.creditorLight);
  rect(ctx, x - 2, y - 54, 4, 34, P.paper);
  rect(ctx, x - 18, y - 48, 6, 29, P.creditorDark);
  rect(ctx, x + 16, y - 48, 6, 29, P.creditorDark);
  rect(ctx, x - 13, y - 83, 27, 23, P.skinShade);
  rect(ctx, x - 10, y - 84, 24, 21, P.skin);
  rect(ctx, x - 18, y - 89, 36, 7, P.creditorDark);
  rect(ctx, x - 11, y - 94, 24, 7, P.deep);
  rect(ctx, x - 7, y - 75, 4, 4, P.deep);
  rect(ctx, x + 6, y - 75, 4, 4, P.deep);
  rect(ctx, x + 13, y - 78, 4, 9, P.steelDark);
  rect(ctx, x + 15, y - 76, 3, 3, Math.floor(now / 560) % 2 === 0 ? P.warning : P.steelLight);
  rect(ctx, x + 20, y - 42, 31, 30, '#44372f');
  rect(ctx, x + 24, y - 39, 24, 23, P.leather);
  rect(ctx, x + 28, y - 46, 17, 8, P.paper);
  rect(ctx, x + 30, y - 44, 13, 2, P.steelDark);
  rect(ctx, x + 34, y - 29, 6, 6, P.warning);
}

function render(now: number): void {
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
  const labVisible = Boolean(lab?.active && lab.rendered);
  const debtVisible = Boolean(debt?.representativeVisible);
  canvas.style.display = labVisible || debtVisible ? 'block' : 'none';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.imageSmoothingEnabled = false;

  if (labVisible) {
    const cameraX = lab?.cameraX ?? 0;
    const cameraY = lab?.cameraY ?? 0;
    const postDeath = Boolean(lab?.postDeath);
    const breach = Boolean(disaster?.breachStarted);
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    drawLabBenchmarkAccents(ctx, now, postDeath);
    debug.labBenchmarkRendered = true;

    if (postDeath) {
      drawBrokenContainment(ctx);
      drawAftermath(ctx, now);
      debug.aftermathRendered = true;
    } else if (breach) {
      drawBrokenContainment(ctx);
      drawViktor(ctx, disaster?.actorPositions?.viktor ?? {}, Boolean(disaster?.masterDead), now);
      drawRinoCow(ctx, disaster?.actorPositions?.rinocow ?? {}, Boolean(disaster?.rinocowDead), now);
      debug.cutsceneHeroRendered = true;
    } else {
      drawContainedRinoCow(ctx, now);
      drawViktor(ctx, disaster?.actorPositions?.viktor ?? {}, false, now);
    }
    ctx.restore();
  }

  if (debtVisible) {
    const yard = global.__SPLICEPIT_VISUAL_RESET__;
    drawCreditor(ctx, DEBT_LANDMARK.x - (yard?.cameraX ?? 0), DEBT_LANDMARK.y - (yard?.cameraY ?? 0), now);
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
