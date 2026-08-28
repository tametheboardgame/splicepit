import viktorSheetRaw from '../assets/pass-c/viktor-sheet.txt?raw';
import rinocowSheetRaw from '../assets/pass-c/rinocow-sheet.txt?raw';
import creditorRaw from '../assets/pass-c/creditor.txt?raw';
import brokenContainmentRaw from '../assets/pass-c/broken-containment.txt?raw';
import { OPENING_ROUTE_LANDMARKS } from '../world/yard.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const CANVAS_ID = 'graphics-tightening-pass-c-stage';
const STYLE_ID = 'graphics-tightening-pass-c-style';
const READY_CLASS = 'splicepit-pass-c-ready';

const VIKTOR_FRAME_WIDTH = 64;
const VIKTOR_FRAME_HEIGHT = 96;
const RINOCOW_FRAME_WIDTH = 288;
const RINOCOW_FRAME_HEIGHT = 128;
const CREDITOR_WIDTH = 64;
const CREDITOR_HEIGHT = 96;
const CONTAINMENT_WIDTH = 320;
const CONTAINMENT_HEIGHT = 240;

type Facing = 'up' | 'down' | 'left' | 'right';
type ActorState = { x?: number; y?: number; facing?: Facing };
type MasterLabDebug = {
  active?: boolean;
  rendered?: boolean;
  postDeath?: boolean;
  cameraX?: number;
  cameraY?: number;
};
type DisasterState = {
  status?: string;
  breachStarted?: boolean;
  masterDead?: boolean;
  rinocowDead?: boolean;
  actorPositions?: {
    viktor?: ActorState;
    rinocow?: ActorState;
  };
};
type DebtEncounterState = { representativeVisible?: boolean };
type YardDebug = { cameraX?: number; cameraY?: number };
type PassCDebug = {
  ready: boolean;
  assetsReady: boolean;
  renderCount: number;
  labBenchmarkRendered: boolean;
  containedRinoCowRendered: boolean;
  viktorHeroRendered: boolean;
  cutsceneHeroRendered: boolean;
  aftermathRendered: boolean;
  creditorRendered: boolean;
  legacyRinoCowStageSuperseded: boolean;
  legacyCreditorStageSuperseded: boolean;
  assetMode: 'authored-pixel-assets';
  qualityReference: 'approved-protagonist-sprites';
};
type PassCGlobal = typeof globalThis & {
  __SPLICEPIT_MASTER_LAB__?: MasterLabDebug;
  __SPLICEPIT_RINOCOW_DISASTER__?: { state?: DisasterState };
  __SPLICEPIT_DEBT_ENCOUNTER__?: { state?: DebtEncounterState };
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_GRAPHICS_PASS_C__?: PassCDebug;
};

type HeroAssets = {
  viktor: HTMLImageElement;
  rinocow: HTMLImageElement;
  creditor: HTMLImageElement;
  containment: HTMLImageElement;
};

function requireDebtLandmark() {
  const landmark = OPENING_ROUTE_LANDMARKS.find((entry) => entry.id === 'debt-encounter');
  if (!landmark) throw new Error('Graphics Tightening Pass C requires the debt encounter route landmark.');
  return landmark;
}

const DEBT_LANDMARK = requireDebtLandmark();
const debug: PassCDebug = {
  ready: false,
  assetsReady: false,
  renderCount: 0,
  labBenchmarkRendered: false,
  containedRinoCowRendered: false,
  viktorHeroRendered: false,
  cutsceneHeroRendered: false,
  aftermathRendered: false,
  creditorRendered: false,
  legacyRinoCowStageSuperseded: false,
  legacyCreditorStageSuperseded: false,
  assetMode: 'authored-pixel-assets',
  qualityReference: 'approved-protagonist-sprites',
};
(globalThis as PassCGlobal).__SPLICEPIT_GRAPHICS_PASS_C__ = debug;

let assets: HeroAssets | null = null;
let assetPromise: Promise<HeroAssets> | null = null;

function imageFromBase64(raw: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Pass C pixel-art asset failed to decode.'));
    image.src = `data:image/png;base64,${raw.trim()}`;
  });
}

function ensureAssets(): Promise<HeroAssets> {
  if (assets) return Promise.resolve(assets);
  if (assetPromise) return assetPromise;
  assetPromise = Promise.all([
    imageFromBase64(viktorSheetRaw),
    imageFromBase64(rinocowSheetRaw),
    imageFromBase64(creditorRaw),
    imageFromBase64(brokenContainmentRaw),
  ]).then(([viktor, rinocow, creditor, containment]) => {
    assets = { viktor, rinocow, creditor, containment };
    debug.assetsReady = true;
    debug.ready = true;
    document.body.classList.add(READY_CLASS);
    return assets;
  });
  return assetPromise;
}

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

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, colour: string): void {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  return canvas;
}

function drawLabBenchmarkAccents(ctx: CanvasRenderingContext2D, now: number, postDeath: boolean): void {
  const pulse = Math.floor(now / 420) % 2 === 0;
  const steelLight = '#a4ad9b';
  const deep = '#1b2522';
  const warning = '#d4b44f';
  const copper = '#b56b45';

  for (const [x, y, width] of [
    [1282, 295, 5], [1336, 300, 4], [1696, 300, 4], [1750, 296, 5],
    [1282, 432, 4], [1750, 472, 4], [1402, 246, 58], [1580, 246, 62],
  ] as const) {
    rect(ctx, x, y, width, 3, steelLight);
  }

  for (const [x, y] of [[1378, 330], [1448, 330], [1518, 330], [1588, 330], [1658, 330]] as const) {
    rect(ctx, x, y, 18, 5, deep);
    rect(ctx, x + 3, y + 1, 5, 3, pulse ? warning : copper);
    rect(ctx, x + 11, y + 1, 4, 3, steelLight);
  }

  for (const [x, y] of [[1314, 370], [1314, 452], [1732, 386], [1732, 516], [1450, 274], [1606, 274]] as const) {
    rect(ctx, x, y, 7, 7, deep);
    rect(ctx, x + 2, y + 1, 3, 3, steelLight);
  }

  line(ctx, 1320, 354, 1362, 342, copper, 3);
  line(ctx, 1718, 354, 1680, 342, copper, 3);

  ctx.save();
  ctx.globalAlpha = postDeath ? .06 : .08;
  ctx.fillStyle = postDeath ? '#542f33' : '#f2dfae';
  ctx.beginPath();
  ctx.moveTo(1328, 282);
  ctx.lineTo(1698, 282);
  ctx.lineTo(1610, 650);
  ctx.lineTo(1412, 650);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawViktorAsset(ctx: CanvasRenderingContext2D, actor: ActorState, dead: boolean): void {
  if (!assets) return;
  const x = Math.round(actor.x ?? 980);
  const y = Math.round(actor.y ?? 620);
  const sourceX = dead ? VIKTOR_FRAME_WIDTH : 0;
  const mirror = actor.facing === 'right';

  ctx.save();
  if (mirror) {
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      assets.viktor,
      sourceX, 0, VIKTOR_FRAME_WIDTH, VIKTOR_FRAME_HEIGHT,
      -VIKTOR_FRAME_WIDTH / 2, y - VIKTOR_FRAME_HEIGHT,
      VIKTOR_FRAME_WIDTH, VIKTOR_FRAME_HEIGHT,
    );
  } else {
    ctx.drawImage(
      assets.viktor,
      sourceX, 0, VIKTOR_FRAME_WIDTH, VIKTOR_FRAME_HEIGHT,
      x - VIKTOR_FRAME_WIDTH / 2, y - VIKTOR_FRAME_HEIGHT,
      VIKTOR_FRAME_WIDTH, VIKTOR_FRAME_HEIGHT,
    );
  }
  ctx.restore();
  debug.viktorHeroRendered = true;
}

function drawRinoCowAsset(
  ctx: CanvasRenderingContext2D,
  actor: ActorState,
  dead: boolean,
  scale = 1,
): void {
  if (!assets) return;
  const x = Math.round(actor.x ?? 1500);
  const y = Math.round(actor.y ?? 700);
  const sourceX = dead ? RINOCOW_FRAME_WIDTH : 0;
  const width = RINOCOW_FRAME_WIDTH * scale;
  const height = RINOCOW_FRAME_HEIGHT * scale;
  const mirror = actor.facing === 'right';

  ctx.save();
  if (mirror) {
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      assets.rinocow,
      sourceX, 0, RINOCOW_FRAME_WIDTH, RINOCOW_FRAME_HEIGHT,
      -width / 2, y - height,
      width, height,
    );
  } else {
    ctx.drawImage(
      assets.rinocow,
      sourceX, 0, RINOCOW_FRAME_WIDTH, RINOCOW_FRAME_HEIGHT,
      x - width / 2, y - height,
      width, height,
    );
  }
  ctx.restore();
}

function drawContainedRinoCow(ctx: CanvasRenderingContext2D): void {
  // The original containment animal was deliberately a placeholder. Cover only
  // the tank interior, preserving its authored frame, glass and production-art shell.
  rect(ctx, 1338, 338, 338, 232, 'rgba(111,157,130,.88)');
  for (let x = 1360; x <= 1640; x += 44) rect(ctx, x, 342, 3, 224, 'rgba(49,95,91,.42)');
  drawRinoCowAsset(ctx, { x: 1505, y: 536, facing: 'left' }, false, 1);
  rect(ctx, 1342, 350, 8, 174, 'rgba(214,235,219,.68)');
  rect(ctx, 1658, 362, 6, 150, 'rgba(214,235,219,.46)');
  line(ctx, 1370, 354, 1424, 338, 'rgba(214,235,219,.48)', 3);
  debug.containedRinoCowRendered = true;
}

function drawBrokenContainmentAsset(ctx: CanvasRenderingContext2D): void {
  if (!assets) return;
  ctx.drawImage(
    assets.containment,
    0, 0, CONTAINMENT_WIDTH, CONTAINMENT_HEIGHT,
    1348, 380, CONTAINMENT_WIDTH, CONTAINMENT_HEIGHT,
  );
}

function drawAftermath(ctx: CanvasRenderingContext2D, now: number): void {
  ellipse(ctx, 1018, 652, 66, 13, 'rgba(84,47,51,.52)');
  rect(ctx, 966, 646, 36, 5, '#612d35');
  rect(ctx, 1010, 652, 27, 4, '#8e3941');
  rect(ctx, 1047, 657, 18, 3, '#542f33');

  for (const [x, y, width] of [[1082, 642, 22], [1122, 652, 18], [1160, 660, 15], [1190, 668, 11]] as const) {
    rect(ctx, x, y, width, 4, '#542f33');
  }

  for (const [x, y] of [[1218, 646], [1248, 662], [1282, 676]] as const) {
    line(ctx, x, y, x + 18, y + 7, '#665e4d', 3);
    line(ctx, x + 5, y - 5, x + 23, y + 2, '#81745a', 2);
  }

  ctx.save();
  ctx.translate(1342, 642);
  ctx.rotate(-.12);
  rect(ctx, -28, -10, 56, 20, '#d4b44f');
  rect(ctx, -22, -6, 44, 3, '#1b2522');
  rect(ctx, -16, 0, 31, 2, '#1b2522');
  ctx.restore();

  rect(ctx, 1294, 626, 22, 14, '#ded2aa');
  rect(ctx, 1300, 629, 12, 8, '#542f33');
  rect(ctx, 1600, 510, 22, 12, '#46514c');
  rect(ctx, 1605, 514, 9, 4, Math.floor(now / 620) % 4 === 0 ? '#8e3941' : '#a4ad9b');
}

function drawCreditorAsset(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  if (!assets) return;
  ctx.drawImage(
    assets.creditor,
    0, 0, CREDITOR_WIDTH, CREDITOR_HEIGHT,
    Math.round(x - CREDITOR_WIDTH / 2), Math.round(y - CREDITOR_HEIGHT),
    CREDITOR_WIDTH, CREDITOR_HEIGHT,
  );
  debug.creditorRendered = true;
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
  canvas.style.display = assets && (labVisible || debtVisible) ? 'block' : 'none';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.imageSmoothingEnabled = false;

  if (assets && labVisible) {
    const cameraX = lab?.cameraX ?? 0;
    const cameraY = lab?.cameraY ?? 0;
    const postDeath = Boolean(lab?.postDeath);
    const breach = Boolean(disaster?.breachStarted);

    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    drawLabBenchmarkAccents(ctx, now, postDeath);
    debug.labBenchmarkRendered = true;

    if (postDeath) {
      drawBrokenContainmentAsset(ctx);
      drawAftermath(ctx, now);
      debug.aftermathRendered = true;
    } else if (breach) {
      drawBrokenContainmentAsset(ctx);
      drawViktorAsset(ctx, disaster?.actorPositions?.viktor ?? {}, Boolean(disaster?.masterDead));
      drawRinoCowAsset(ctx, disaster?.actorPositions?.rinocow ?? {}, Boolean(disaster?.rinocowDead));
      debug.cutsceneHeroRendered = true;
    } else {
      drawContainedRinoCow(ctx);
      drawViktorAsset(ctx, disaster?.actorPositions?.viktor ?? {}, false);
    }
    ctx.restore();
  }

  if (assets && debtVisible) {
    const yard = global.__SPLICEPIT_VISUAL_RESET__;
    drawCreditorAsset(
      ctx,
      DEBT_LANDMARK.x - (yard?.cameraX ?? 0),
      DEBT_LANDMARK.y - (yard?.cameraY ?? 0),
    );
  }

  debug.renderCount += 1;
  debug.legacyRinoCowStageSuperseded = document.getElementById('rinocow-disaster-stage') !== null && debug.assetsReady;
  debug.legacyCreditorStageSuperseded = document.getElementById('debt-collector-stage') !== null && debug.assetsReady;
  requestAnimationFrame(render);
}

ensureStyles();
ensureCanvas();
void ensureAssets();
requestAnimationFrame(render);

export {};
