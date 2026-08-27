import miloDown from './assets/frames/milo-down.txt?raw';
import miloLeft from './assets/frames/milo-left.txt?raw';
import miloRight from './assets/frames/milo-right.txt?raw';
import miloUp from './assets/frames/milo-up.txt?raw';
import theoDown from './assets/frames/theo-down.txt?raw';
import theoLeft from './assets/frames/theo-left.txt?raw';
import theoRight from './assets/frames/theo-right.txt?raw';
import theoUp from './assets/frames/theo-up.txt?raw';
import adaDown from './assets/frames/ada-down.txt?raw';
import adaLeft from './assets/frames/ada-left.txt?raw';
import adaRight from './assets/frames/ada-right.txt?raw';
import adaUp from './assets/frames/ada-up.txt?raw';
import pipDown from './assets/frames/pip-down.txt?raw';
import pipLeft from './assets/frames/pip-left.txt?raw';
import pipRight from './assets/frames/pip-right.txt?raw';
import pipUp from './assets/frames/pip-up.txt?raw';
import {
  environmentVisualController,
  type EnvironmentVisualSample,
} from './environment/environmentVisualContract.js';
import { syncLocalPitProductionArtDebug } from './environment/localPitProductionArtRuntime.js';
import {
  ACTIONS,
  DEFAULT_BINDINGS,
  SEMANTIC_INPUT_EVENT,
  type SemanticAction,
  type SemanticInputEventDetail,
} from './input/actions.js';
import {
  OPENING_INVENTORY,
  OPENING_OBJECTIVES,
  type OpeningShellId,
} from './onboarding/openingShells.js';
import { PROTAGONIST_IDS, type ProtagonistId } from './player/protagonists.js';
import { drawOpeningObjectiveTracker, drawOpeningShell } from './ui/openingShells.js';
import {
  drawLocalPitBase,
  drawLocalPitForeground,
  isLocalPitPositionBlocked,
  localPitZoneAt,
  LOCAL_PIT_ENTRY_SPAWN,
  LOCAL_PIT_EXIT_ZONE,
  LOCAL_PIT_VIEW_HEIGHT,
  LOCAL_PIT_VIEW_WIDTH,
  LOCAL_PIT_WORLD_HEIGHT,
  LOCAL_PIT_WORLD_WIDTH,
  LOCAL_PIT_YARD_ENTRY_ZONE,
  nearestLocalPitStage,
  pointInsideLocalPitRect,
  type LocalPitStageId,
  type LocalPitZone,
} from './world/localPit.js';
import {
  drawLocalPitBrightProductionArt,
  drawLocalPitBrightProductionArtForeground,
  drawLocalPitDarkProductionArt,
  drawLocalPitDarkProductionArtForeground,
} from './world/localPitProductionArt.js';

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const WALK_FRAME_MS = 180;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;
const LOWER_BODY_Y = 64;
const LOWER_BODY_OVERLAP = 2;
const HALF_WIDTH = FRAME_WIDTH / 2;
const PLAYER_SPEED = 180;
const RUN_SPEED_MULTIPLIER = 1.8;
const CAMERA_RESPONSE = 8;
const PIT_CANVAS_ID = 'local-pit-stage';

type Facing = 'down' | 'left' | 'right' | 'up';
type PitPlayer = { x: number; y: number; facing: Facing; moving: boolean };

type YardDebug = {
  ready?: boolean;
  phase?: string;
  selectedAvatarId?: ProtagonistId;
  playerX?: number;
  playerY?: number;
  activeOpeningShell?: OpeningShellId | null;
};

type LocalPitDebug = {
  ready: boolean;
  active: boolean;
  rendered: boolean;
  playerX: number;
  playerY: number;
  cameraX: number;
  cameraY: number;
  facing: Facing;
  moving: boolean;
  collisionCount: number;
  lastCollision: boolean;
  nearYardGate: boolean;
  nearExit: boolean;
  zone: LocalPitZone;
  stageId: LocalPitStageId | null;
  activeShell: OpeningShellId | null;
  framesReady: boolean;
};

type DebugGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_LOCAL_PIT__?: LocalPitDebug;
};

const FRAME_BASE64: Record<ProtagonistId, Record<Facing, string>> = {
  milo: { down: miloDown, left: miloLeft, right: miloRight, up: miloUp },
  theo: { down: theoDown, left: theoLeft, right: theoRight, up: theoUp },
  ada: { down: adaDown, left: adaLeft, right: adaRight, up: adaUp },
  pip: { down: pipDown, left: pipLeft, right: pipRight, up: pipUp },
};

const frames = {} as Record<ProtagonistId, Record<Facing, HTMLImageElement>>;
const pressed = new Set<SemanticAction>();
const player: PitPlayer = {
  x: LOCAL_PIT_ENTRY_SPAWN.x,
  y: LOCAL_PIT_ENTRY_SPAWN.y,
  facing: 'up',
  moving: false,
};
const camera = { x: 0, y: 0 };
let active = false;
let framesPromise: Promise<void> | null = null;
let framesReady = false;
let lastNow = performance.now();
let collisionCount = 0;
let lastCollision = false;
let suppressSemanticUntil = 0;

const objective = OPENING_OBJECTIVES.find((entry) => entry.id === 'find-master') ?? OPENING_OBJECTIVES[OPENING_OBJECTIVES.length - 1];
if (!objective) throw new Error('WP0.6F requires the opening objective shell contract.');

const debug: LocalPitDebug = {
  ready: true,
  active: false,
  rendered: false,
  playerX: player.x,
  playerY: player.y,
  cameraX: 0,
  cameraY: 0,
  facing: player.facing,
  moving: false,
  collisionCount: 0,
  lastCollision: false,
  nearYardGate: false,
  nearExit: false,
  zone: 'exterior',
  stageId: null,
  activeShell: null,
  framesReady: false,
};
(globalThis as DebugGlobal).__SPLICEPIT_LOCAL_PIT__ = debug;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function yardDebug(): YardDebug | undefined {
  return (globalThis as DebugGlobal).__SPLICEPIT_VISUAL_RESET__;
}

function currentShell(): OpeningShellId | null {
  return yardDebug()?.activeOpeningShell ?? null;
}

function gameplayReady(): boolean {
  const yard = yardDebug();
  return Boolean(yard?.ready && yard.phase === 'confirmed');
}

function nearYardGate(): boolean {
  const yard = yardDebug();
  if (!yard || typeof yard.playerX !== 'number' || typeof yard.playerY !== 'number') return false;
  return pointInsideLocalPitRect(yard.playerX, yard.playerY, LOCAL_PIT_YARD_ENTRY_ZONE);
}

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(PIT_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas && canvas.parentElement === root) return canvas;
  canvas?.remove();
  canvas = document.createElement('canvas');
  canvas.id = PIT_CANVAS_ID;
  canvas.width = LOCAL_PIT_VIEW_WIDTH;
  canvas.height = LOCAL_PIT_VIEW_HEIGHT;
  canvas.setAttribute('aria-label', 'The Bramble Pit local arena');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.width = 'min(100vw, calc(100vh * 16 / 9))';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '100vh';
  canvas.style.aspectRatio = '16 / 9';
  canvas.style.zIndex = '21';
  canvas.style.pointerEvents = 'none';
  canvas.style.imageRendering = 'pixelated';
  root.style.position = 'relative';
  root.append(canvas);
  return canvas;
}

async function decodeFrame(base64: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64.trim()}`;
  await image.decode();
  return image;
}

function ensureFrames(): Promise<void> {
  if (framesPromise) return framesPromise;
  framesPromise = Promise.all(PROTAGONIST_IDS.flatMap((id) =>
    (['down', 'left', 'right', 'up'] as Facing[]).map(async (facing) => {
      frames[id] ??= {} as Record<Facing, HTMLImageElement>;
      frames[id][facing] = await decodeFrame(FRAME_BASE64[id][facing]);
    })))
    .then(() => {
      framesReady = true;
      debug.framesReady = true;
    });
  return framesPromise;
}

function resetPitRuntime(): void {
  player.x = LOCAL_PIT_ENTRY_SPAWN.x;
  player.y = LOCAL_PIT_ENTRY_SPAWN.y;
  player.facing = 'up';
  player.moving = false;
  camera.x = clamp(player.x - LOCAL_PIT_VIEW_WIDTH / 2, 0, LOCAL_PIT_WORLD_WIDTH - LOCAL_PIT_VIEW_WIDTH);
  camera.y = clamp(player.y - LOCAL_PIT_VIEW_HEIGHT / 2, 0, LOCAL_PIT_WORLD_HEIGHT - LOCAL_PIT_VIEW_HEIGHT);
  collisionCount = 0;
  lastCollision = false;
  pressed.clear();
  lastNow = performance.now();
}

function enterPit(): void {
  if (active || !gameplayReady()) return;
  active = true;
  resetPitRuntime();
  debug.active = true;
  debug.rendered = false;
  suppressSemanticUntil = performance.now() + 80;
  void ensureFrames();
  ensureCanvas()?.setAttribute('aria-hidden', 'false');
}

function exitPit(): void {
  active = false;
  pressed.clear();
  debug.active = false;
  debug.rendered = false;
  debug.activeShell = null;
  suppressSemanticUntil = performance.now() + 100;
  syncLocalPitProductionArtDebug(environmentVisualController.sample('local-pit'), false);
  const canvas = document.getElementById(PIT_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas) {
    canvas.setAttribute('aria-hidden', 'true');
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function actionsForKeyboard(code: string): SemanticAction[] {
  const matches: SemanticAction[] = [];
  for (const action of Object.values(ACTIONS) as SemanticAction[]) {
    if ((DEFAULT_BINDINGS.keyboard[action] as readonly string[]).includes(code)) matches.push(action);
  }
  return matches;
}

function handlePitAction(action: SemanticAction): void {
  if (action === ACTIONS.CANCEL || action === ACTIONS.LAB_CANCEL) {
    if (pointInsideLocalPitRect(player.x, player.y, LOCAL_PIT_EXIT_ZONE)) exitPit();
    return;
  }
  if (action === ACTIONS.INTERACT || action === ACTIONS.LAB_INTERACT || action === ACTIONS.CONFIRM) {
    if (pointInsideLocalPitRect(player.x, player.y, LOCAL_PIT_EXIT_ZONE)) exitPit();
  }
}

function shouldPassToYard(actions: readonly SemanticAction[]): boolean {
  if (actions.includes(ACTIONS.BAG) || actions.includes(ACTIONS.MAP)) return true;
  return currentShell() !== null && (actions.includes(ACTIONS.CANCEL) || actions.includes(ACTIONS.LAB_CANCEL));
}

function onKeyDown(event: KeyboardEvent): void {
  const actions = actionsForKeyboard(event.code);
  if (!active) {
    if (gameplayReady() && nearYardGate() && (actions.includes(ACTIONS.INTERACT) || actions.includes(ACTIONS.LAB_INTERACT))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      enterPit();
    }
    return;
  }

  if (actions.length === 0 || shouldPassToYard(actions)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  for (const action of actions) {
    const wasPressed = pressed.has(action);
    pressed.add(action);
    if (!wasPressed) handlePitAction(action);
  }
}

function onKeyUp(event: KeyboardEvent): void {
  if (!active) return;
  const actions = actionsForKeyboard(event.code);
  if (actions.length === 0 || shouldPassToYard(actions)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  for (const action of actions) pressed.delete(action);
}

function onSemanticInput(event: Event): void {
  const semantic = event as CustomEvent<SemanticInputEventDetail>;
  const detail = semantic.detail;
  if (!detail) return;
  const now = performance.now();

  if (!active) {
    if (now < suppressSemanticUntil) {
      event.stopImmediatePropagation();
      return;
    }
    if (detail.pressed && gameplayReady() && nearYardGate() && (detail.action === ACTIONS.INTERACT || detail.action === ACTIONS.LAB_INTERACT)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      enterPit();
    }
    return;
  }

  if (detail.action === ACTIONS.BAG || detail.action === ACTIONS.MAP) return;
  if (currentShell() !== null && (detail.action === ACTIONS.CANCEL || detail.action === ACTIONS.LAB_CANCEL)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  if (detail.pressed) {
    const wasPressed = pressed.has(detail.action);
    pressed.add(detail.action);
    if (!wasPressed) handlePitAction(detail.action);
  } else {
    pressed.delete(detail.action);
  }
}

function update(now: number): void {
  const dt = Math.min(0.032, Math.max(0, (now - lastNow) / 1000));
  lastNow = now;
  if (!active || currentShell() !== null) {
    player.moving = false;
    lastCollision = false;
    return;
  }

  let dx = 0;
  let dy = 0;
  if (pressed.has(ACTIONS.MOVE_LEFT)) dx -= 1;
  if (pressed.has(ACTIONS.MOVE_RIGHT)) dx += 1;
  if (pressed.has(ACTIONS.MOVE_UP)) dy -= 1;
  if (pressed.has(ACTIONS.MOVE_DOWN)) dy += 1;
  player.moving = dx !== 0 || dy !== 0;
  lastCollision = false;

  if (player.moving) {
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) player.facing = dx < 0 ? 'left' : 'right';
    else if (dy !== 0) player.facing = dy < 0 ? 'up' : 'down';

    const speedMultiplier = pressed.has(ACTIONS.RUN) ? RUN_SPEED_MULTIPLIER : 1;
    const distance = PLAYER_SPEED * speedMultiplier * dt;
    const nextX = player.x + dx * distance;
    if (!isLocalPitPositionBlocked(nextX, player.y)) player.x = nextX;
    else {
      collisionCount += 1;
      lastCollision = true;
    }
    const nextY = player.y + dy * distance;
    if (!isLocalPitPositionBlocked(player.x, nextY)) player.y = nextY;
    else {
      collisionCount += 1;
      lastCollision = true;
    }
  }

  const targetX = clamp(player.x - LOCAL_PIT_VIEW_WIDTH / 2, 0, LOCAL_PIT_WORLD_WIDTH - LOCAL_PIT_VIEW_WIDTH);
  const targetY = clamp(player.y - LOCAL_PIT_VIEW_HEIGHT / 2, 0, LOCAL_PIT_WORLD_HEIGHT - LOCAL_PIT_VIEW_HEIGHT);
  const follow = 1 - Math.exp(-CAMERA_RESPONSE * dt);
  camera.x += (targetX - camera.x) * follow;
  camera.y += (targetY - camera.y) * follow;
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  destX: number,
  destY: number,
  offsetX: number,
  offsetY: number,
): void {
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX + offsetX, destY + offsetY, sourceWidth, sourceHeight);
}

function drawAnimatedCharacter(ctx: CanvasRenderingContext2D, image: HTMLImageElement, destX: number, destY: number, animationFrame: number): void {
  if (animationFrame === 0) {
    ctx.drawImage(image, destX, destY, FRAME_WIDTH, FRAME_HEIGHT);
    return;
  }
  const stride = animationFrame === 1 ? -2 : animationFrame === 3 ? 2 : 0;
  const torsoX = animationFrame === 1 ? -1 : animationFrame === 3 ? 1 : 0;
  const torsoY = animationFrame === 2 ? -1 : 0;
  const leftY = animationFrame === 1 ? 1 : animationFrame === 3 ? -1 : 0;
  const rightY = -leftY;
  const lowerSourceY = LOWER_BODY_Y - LOWER_BODY_OVERLAP;
  const lowerHeight = FRAME_HEIGHT - lowerSourceY;
  const lowerDestY = destY + lowerSourceY;
  drawSection(ctx, image, 0, lowerSourceY, HALF_WIDTH, lowerHeight, destX, lowerDestY, stride, leftY);
  drawSection(ctx, image, HALF_WIDTH, lowerSourceY, HALF_WIDTH, lowerHeight, destX + HALF_WIDTH, lowerDestY, -stride, rightY);
  drawSection(ctx, image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
}

function drawPlayer(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.fillStyle = 'rgba(37,54,47,0.3)';
  ctx.beginPath();
  ctx.ellipse(Math.round(player.x), Math.round(player.y - 4), 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const avatar = yardDebug()?.selectedAvatarId ?? 'milo';
  const image = framesReady ? frames[avatar]?.[player.facing] : undefined;
  if (!image) {
    ctx.fillStyle = '#26382f';
    ctx.fillRect(Math.round(player.x - 12), Math.round(player.y - 54), 24, 48);
    ctx.fillStyle = '#f2dfae';
    ctx.fillRect(Math.round(player.x - 8), Math.round(player.y - 70), 16, 18);
    return;
  }
  const frame = player.moving ? WALK_SEQUENCE[Math.floor(now / WALK_FRAME_MS) % WALK_SEQUENCE.length] : 0;
  drawAnimatedCharacter(ctx, image, Math.round(player.x - FRAME_WIDTH / 2), Math.round(player.y - 88), frame);
}

function drawLocalPitProductionBase(ctx: CanvasRenderingContext2D, now: number, sample: EnvironmentVisualSample): void {
  drawLocalPitBrightProductionArt(ctx, now);
  if (sample.darkMix <= 0) return;
  ctx.save();
  ctx.globalAlpha = sample.darkMix;
  drawLocalPitDarkProductionArt(ctx, now);
  ctx.restore();
}

function drawLocalPitProductionForeground(ctx: CanvasRenderingContext2D, now: number, sample: EnvironmentVisualSample): void {
  drawLocalPitBrightProductionArtForeground(ctx, player.y);
  if (sample.darkMix <= 0) return;
  ctx.save();
  ctx.globalAlpha = sample.darkMix;
  drawLocalPitDarkProductionArtForeground(ctx, player.y, now);
  ctx.restore();
}

function drawInteractionPrompt(ctx: CanvasRenderingContext2D, text: string): void {
  const width = 460;
  const x = (LOCAL_PIT_VIEW_WIDTH - width) / 2;
  const y = LOCAL_PIT_VIEW_HEIGHT - 82;
  ctx.fillStyle = 'rgba(38,56,47,0.92)';
  ctx.fillRect(x, y, width, 48);
  ctx.strokeStyle = '#f2dfae';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, width - 2, 46);
  ctx.fillStyle = '#f2dfae';
  ctx.font = '700 16px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, LOCAL_PIT_VIEW_WIDTH / 2, y + 24);
}

function renderInactiveGatePrompt(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, LOCAL_PIT_VIEW_WIDTH, LOCAL_PIT_VIEW_HEIGHT);
  const near = gameplayReady() && nearYardGate();
  debug.nearYardGate = near;
  syncLocalPitProductionArtDebug(environmentVisualController.sample('local-pit'), false);
  canvas.setAttribute('aria-hidden', near ? 'false' : 'true');
  if (near) drawInteractionPrompt(ctx, 'ACTION  Travel to The Bramble Pit');
}

function renderPit(ctx: CanvasRenderingContext2D, now: number): void {
  update(now);
  const renderCameraX = Math.round(camera.x);
  const renderCameraY = Math.round(camera.y);
  const artSample = environmentVisualController.sample('local-pit', now);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(-renderCameraX, -renderCameraY);
  drawLocalPitBase(ctx, now);
  drawLocalPitProductionBase(ctx, now, artSample);
  drawPlayer(ctx, now);
  drawLocalPitProductionForeground(ctx, now, artSample);
  drawLocalPitForeground(ctx, player.y);
  ctx.restore();
  syncLocalPitProductionArtDebug(artSample, true);

  drawOpeningObjectiveTracker(ctx, objective, 2, 2);
  const shell = currentShell();
  if (pointInsideLocalPitRect(player.x, player.y, LOCAL_PIT_EXIT_ZONE) && shell === null) {
    drawInteractionPrompt(ctx, 'ACTION / BACK  Return to the Local Pit Road');
  }
  drawOpeningShell(ctx, {
    activeShell: shell,
    inventory: OPENING_INVENTORY,
    objective,
    objectiveStep: 2,
    objectiveCount: 2,
    playerX: player.x,
    playerY: player.y,
    worldWidth: LOCAL_PIT_WORLD_WIDTH,
    worldHeight: LOCAL_PIT_WORLD_HEIGHT,
  }, LOCAL_PIT_VIEW_WIDTH, LOCAL_PIT_VIEW_HEIGHT);

  const stage = nearestLocalPitStage(player.x, player.y);
  debug.active = true;
  debug.rendered = true;
  debug.playerX = Math.round(player.x * 10) / 10;
  debug.playerY = Math.round(player.y * 10) / 10;
  debug.cameraX = Math.round(camera.x * 10) / 10;
  debug.cameraY = Math.round(camera.y * 10) / 10;
  debug.facing = player.facing;
  debug.moving = player.moving;
  debug.collisionCount = collisionCount;
  debug.lastCollision = lastCollision;
  debug.nearExit = pointInsideLocalPitRect(player.x, player.y, LOCAL_PIT_EXIT_ZONE);
  debug.zone = localPitZoneAt(player.x, player.y);
  debug.stageId = stage?.id ?? null;
  debug.activeShell = shell;
}

function render(now: number): void {
  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  if (canvas && ctx) {
    if (active) {
      canvas.setAttribute('aria-hidden', 'false');
      renderPit(ctx, now);
    } else {
      renderInactiveGatePrompt(canvas, ctx);
    }
  }
  requestAnimationFrame(render);
}

function autoActivateTestMode(): void {
  if (new URLSearchParams(window.location.search).get('pitTest') !== '1') return;
  const poll = (): void => {
    if (!active && gameplayReady()) {
      enterPit();
      return;
    }
    window.setTimeout(poll, 60);
  };
  poll();
}

window.addEventListener('keydown', onKeyDown, { capture: true });
window.addEventListener('keyup', onKeyUp, { capture: true });
window.addEventListener(SEMANTIC_INPUT_EVENT, onSemanticInput, { capture: true });
window.addEventListener('blur', () => pressed.clear());

void ensureFrames();
autoActivateTestMode();
requestAnimationFrame(render);
