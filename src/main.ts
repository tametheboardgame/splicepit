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
import { ACTIONS } from './input/actions.js';
import { BrowserSemanticInput } from './input/BrowserSemanticInput.js';
import { normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from './player/identity.js';
import { PROTAGONIST_IDS, PROTAGONIST_SPRITES, type ProtagonistId } from './player/protagonists.js';
import { gameState } from './state/GameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';
import {
  drawApprenticeSplicerYardBase,
  drawApprenticeSplicerYardForeground,
  isYardPositionBlocked,
  YARD_SPAWN,
  YARD_VIEW_HEIGHT,
  YARD_VIEW_WIDTH,
  YARD_WORLD_HEIGHT,
  YARD_WORLD_WIDTH,
  type YardFacing,
} from './world/yard.js';

const SELECT_WIDTH = 960;
const SELECT_HEIGHT = 540;
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SELECT_DISPLAY_SCALE = 2;
const WALK_FRAME_MS = 180;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;
const LOWER_BODY_Y = 64;
const LOWER_BODY_OVERLAP = 2;
const HALF_WIDTH = FRAME_WIDTH / 2;
const CHARACTER_Y = 230;
const USE_BUTTON = { x: 316, y: 492, width: 154, height: 34 } as const;
const RENAME_BUTTON = { x: 490, y: 492, width: 154, height: 34 } as const;
const PLAYER_SPEED = 180;
const CAMERA_RESPONSE = 8;

const CHARACTER_X: Record<ProtagonistId, number> = {
  milo: 150,
  theo: 360,
  ada: 600,
  pip: 810,
};

const FRAME_BASE64: Record<ProtagonistId, Record<YardFacing, string>> = {
  milo: { down: miloDown, left: miloLeft, right: miloRight, up: miloUp },
  theo: { down: theoDown, left: theoLeft, right: theoRight, up: theoUp },
  ada: { down: adaDown, left: adaLeft, right: adaRight, up: adaUp },
  pip: { down: pipDown, left: pipLeft, right: pipRight, up: pipUp },
};

type ResetPhase = 'select' | 'name' | 'confirmed';

type VisualResetDebug = {
  ready: boolean;
  error: string | null;
  phase: ResetPhase;
  selectedAvatarId: ProtagonistId;
  playerName: string;
  loadedFromSave: boolean;
  saved: boolean;
  frame: number;
  yardRendered: boolean;
  playerX: number;
  playerY: number;
  cameraX: number;
  cameraY: number;
  facing: YardFacing;
  moving: boolean;
  collisionCount: number;
  lastCollision: boolean;
  viewportWidth: number;
  viewportHeight: number;
  worldWidth: number;
  worldHeight: number;
};

const root = document.getElementById('game') as HTMLElement | null;
if (!root) throw new Error('Missing #game root');

const loadedSave = loadGame();
let selectedAvatarId: ProtagonistId = gameState.avatarId ?? 'milo';
let phase: ResetPhase = 'select';
let saved = Boolean(loadedSave && gameState.avatarId && gameState.playerName);

root.innerHTML = `
  <canvas id="visual-reset-stage" width="${SELECT_WIDTH}" height="${SELECT_HEIGHT}" aria-label="SplicePit visual review stage"></canvas>
  <input
    id="player-name-capture"
    class="player-name-capture"
    type="text"
    maxlength="${PLAYER_NAME_MAX_LENGTH}"
    autocomplete="off"
    spellcheck="false"
    aria-label="Player name"
  />
`;

const canvas = root.querySelector<HTMLCanvasElement>('#visual-reset-stage') as HTMLCanvasElement | null;
const nameInput = root.querySelector<HTMLInputElement>('#player-name-capture') as HTMLInputElement | null;
if (!canvas || !nameInput) throw new Error('Visual review stage failed to mount');
const stageCanvas: HTMLCanvasElement = canvas;
const playerNameInput: HTMLInputElement = nameInput;

const maybeContext = stageCanvas.getContext('2d', { alpha: false });
if (!maybeContext) throw new Error('Canvas 2D context unavailable');
const context: CanvasRenderingContext2D = maybeContext;
context.imageSmoothingEnabled = false;

const worldInput = new BrowserSemanticInput();
worldInput.setEnabled(false);

function preferredNameFor(id: ProtagonistId): string {
  if (gameState.avatarId === id && gameState.playerName) return gameState.playerName;
  return PROTAGONIST_SPRITES[id].name;
}

playerNameInput.value = preferredNameFor(selectedAvatarId);

const frames = {} as Record<ProtagonistId, Record<YardFacing, HTMLImageElement>>;
const player = { x: YARD_SPAWN.x, y: YARD_SPAWN.y, facing: 'down' as YardFacing, moving: false };
const camera = { x: 0, y: 0 };
let lastRenderNow = performance.now();
let collisionCount = 0;
let lastCollision = false;

const debug: VisualResetDebug = {
  ready: false,
  error: null,
  phase,
  selectedAvatarId,
  playerName: playerNameInput.value,
  loadedFromSave: saved,
  saved,
  frame: 0,
  yardRendered: false,
  playerX: player.x,
  playerY: player.y,
  cameraX: 0,
  cameraY: 0,
  facing: player.facing,
  moving: false,
  collisionCount: 0,
  lastCollision: false,
  viewportWidth: SELECT_WIDTH,
  viewportHeight: SELECT_HEIGHT,
  worldWidth: YARD_WORLD_WIDTH,
  worldHeight: YARD_WORLD_HEIGHT,
};

(globalThis as typeof globalThis & { __SPLICEPIT_VISUAL_RESET__?: VisualResetDebug }).__SPLICEPIT_VISUAL_RESET__ = debug;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function setCanvasSize(width: number, height: number): void {
  if (stageCanvas.width === width && stageCanvas.height === height) return;
  stageCanvas.width = width;
  stageCanvas.height = height;
  context.imageSmoothingEnabled = false;
  debug.viewportWidth = width;
  debug.viewportHeight = height;
}

function drawPixelRect(x: number, y: number, width: number, height: number, fill: string): void {
  context.fillStyle = fill;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawSelectionBackground(): void {
  drawPixelRect(0, 0, SELECT_WIDTH, SELECT_HEIGHT, '#dfe6b6');
  drawPixelRect(0, 0, SELECT_WIDTH, 158, '#c8d7a0');
  drawPixelRect(0, 158, SELECT_WIDTH, 14, '#657b57');
  drawPixelRect(0, 172, SELECT_WIDTH, SELECT_HEIGHT - 172, '#d7c691');

  for (let y = 188; y < SELECT_HEIGHT; y += 28) {
    drawPixelRect(0, y, SELECT_WIDTH, 2, y % 56 === 20 ? '#c7b681' : '#cebe88');
  }
  for (let x = 24; x < SELECT_WIDTH; x += 74) drawPixelRect(x, 190, 2, SELECT_HEIGHT - 190, '#c2ae78');

  const windowXs = [92, 350, 608, 866];
  for (const x of windowXs) {
    drawPixelRect(x - 48, 38, 96, 64, '#8cb6b3');
    drawPixelRect(x - 43, 43, 86, 54, '#b8ddd2');
    drawPixelRect(x - 2, 43, 4, 54, '#6d8980');
    drawPixelRect(x - 43, 69, 86, 4, '#6d8980');
  }

  drawPixelRect(24, 118, 912, 8, '#8d966d');
  for (let x = 58; x < 920; x += 92) {
    drawPixelRect(x, 126, 4, 28, '#768261');
    drawPixelRect(x - 7, 148, 18, 5, '#8d6d4e');
  }

  drawPixelRect(26, 452, 126, 58, '#879466');
  drawPixelRect(32, 446, 114, 10, '#657651');
  drawPixelRect(808, 458, 126, 52, '#879466');
  drawPixelRect(814, 452, 114, 10, '#657651');
  drawPixelRect(62, 422, 16, 24, '#58734f');
  drawPixelRect(55, 412, 30, 14, '#8ca967');
  drawPixelRect(872, 426, 12, 26, '#58734f');
  drawPixelRect(864, 414, 28, 16, '#96b36e');

  context.fillStyle = '#314339';
  context.font = '700 28px "Trebuchet MS", "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Choose your apprentice', SELECT_WIDTH / 2, 138);
  context.fillStyle = '#53624d';
  context.font = '600 13px "Trebuchet MS", "Segoe UI", sans-serif';
  context.fillText('No classes. No bonuses. Just four different histories of terrible judgement.', SELECT_WIDTH / 2, 112);
}

function drawSection(
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  destX: number,
  destY: number,
  offsetX: number,
  offsetY: number,
  scale: number,
): void {
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX + offsetX * scale,
    destY + offsetY * scale,
    sourceWidth * scale,
    sourceHeight * scale,
  );
}

function drawAnimatedCharacter(image: HTMLImageElement, destX: number, destY: number, animationFrame: number, scale: number): void {
  if (animationFrame === 0) {
    context.drawImage(image, destX, destY, FRAME_WIDTH * scale, FRAME_HEIGHT * scale);
    return;
  }

  const stride = animationFrame === 1 ? -2 : animationFrame === 3 ? 2 : 0;
  const torsoX = animationFrame === 1 ? -1 : animationFrame === 3 ? 1 : 0;
  const torsoY = animationFrame === 2 ? -1 : 0;
  const leftY = animationFrame === 1 ? 1 : animationFrame === 3 ? -1 : 0;
  const rightY = -leftY;
  const lowerSourceY = LOWER_BODY_Y - LOWER_BODY_OVERLAP;
  const lowerHeight = FRAME_HEIGHT - lowerSourceY;
  const lowerDestY = destY + lowerSourceY * scale;

  drawSection(image, 0, lowerSourceY, HALF_WIDTH, lowerHeight, destX, lowerDestY, stride, leftY, scale);
  drawSection(
    image,
    HALF_WIDTH,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX + HALF_WIDTH * scale,
    lowerDestY,
    -stride,
    rightY,
    scale,
  );
  drawSection(image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY, scale);
}

function drawSelectionCharacter(id: ProtagonistId, now: number): void {
  const centreX = CHARACTER_X[id];
  const destX = centreX - (FRAME_WIDTH * SELECT_DISPLAY_SCALE) / 2;
  const selected = id === selectedAvatarId;
  const faded = phase !== 'select' && !selected;

  context.save();
  if (faded) context.globalAlpha = 0.28;
  context.fillStyle = faded ? 'rgba(57,72,52,0.12)' : 'rgba(57,72,52,0.24)';
  context.beginPath();
  context.ellipse(centreX, CHARACTER_Y + FRAME_HEIGHT * SELECT_DISPLAY_SCALE - 7, 43, 12, 0, 0, Math.PI * 2);
  context.fill();

  if (selected) {
    const bob = Math.floor(now / 280) % 2;
    context.fillStyle = '#d96b3b';
    context.beginPath();
    context.moveTo(centreX, CHARACTER_Y - 18 - bob * 2);
    context.lineTo(centreX - 9, CHARACTER_Y - 34 - bob * 2);
    context.lineTo(centreX + 9, CHARACTER_Y - 34 - bob * 2);
    context.closePath();
    context.fill();
  }

  const frame = selected && phase === 'select'
    ? WALK_SEQUENCE[Math.floor(now / WALK_FRAME_MS) % WALK_SEQUENCE.length]
    : 0;
  if (selected) debug.frame = frame;
  drawAnimatedCharacter(frames[id].down, destX, CHARACTER_Y, frame, SELECT_DISPLAY_SCALE);

  context.fillStyle = selected ? '#26382f' : '#566452';
  context.font = selected
    ? '800 18px "Trebuchet MS", "Segoe UI", sans-serif'
    : '700 15px "Trebuchet MS", "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(PROTAGONIST_SPRITES[id].name, centreX, 448);
  context.restore();
}

function drawActionButton(x: number, y: number, width: number, height: number, label: string, primary: boolean): void {
  context.fillStyle = primary ? '#496448' : '#f0e3ad';
  context.fillRect(x, y, width, height);
  context.strokeStyle = primary ? '#273b2f' : '#6c795b';
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, width - 2, height - 2);
  context.fillStyle = primary ? '#fff5cf' : '#314339';
  context.font = '800 13px "Trebuchet MS", "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, x + width / 2, y + height / 2 + 1);
}

function drawSelectionFooter(now: number): void {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const protagonistName = PROTAGONIST_SPRITES[selectedAvatarId].name;
  const currentName = playerNameInput.value || preferredNameFor(selectedAvatarId);

  if (phase === 'name') {
    context.fillStyle = '#f3e8b9';
    context.fillRect(258, 466, 444, 62);
    context.fillStyle = '#6c795b';
    context.fillRect(258, 466, 444, 3);
    context.fillStyle = '#26382f';
    context.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillText('Change name?', SELECT_WIDTH / 2, 479);
    const caret = Math.floor(now / 450) % 2 === 0 ? '▌' : '';
    context.font = '800 18px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillText(`${playerNameInput.value}${caret}`, SELECT_WIDTH / 2, 500);
    context.font = '600 10px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillStyle = '#53624d';
    context.fillText(`Enter: use this name · Esc: keep ${protagonistName}`, SELECT_WIDTH / 2, 518);
    return;
  }

  context.fillStyle = '#314339';
  context.font = '700 13px "Trebuchet MS", "Segoe UI", sans-serif';
  context.fillText(`Name: ${currentName}`, SELECT_WIDTH / 2, 478);
  drawActionButton(USE_BUTTON.x, USE_BUTTON.y, USE_BUTTON.width, USE_BUTTON.height, `Use ${currentName}`, true);
  drawActionButton(RENAME_BUTTON.x, RENAME_BUTTON.y, RENAME_BUTTON.width, RENAME_BUTTON.height, 'Change name?', false);
}

function resetYardRuntime(): void {
  player.x = YARD_SPAWN.x;
  player.y = YARD_SPAWN.y;
  player.facing = 'down';
  player.moving = false;
  collisionCount = 0;
  lastCollision = false;
  camera.x = clamp(player.x - YARD_VIEW_WIDTH / 2, 0, YARD_WORLD_WIDTH - YARD_VIEW_WIDTH);
  camera.y = clamp(player.y - YARD_VIEW_HEIGHT / 2, 0, YARD_WORLD_HEIGHT - YARD_VIEW_HEIGHT);
  lastRenderNow = performance.now();
}

function enterYard(): void {
  phase = 'confirmed';
  debug.phase = phase;
  setCanvasSize(YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT);
  resetYardRuntime();
  worldInput.setEnabled(true);
  playerNameInput.blur();
}

function exitYardToSelection(): void {
  phase = 'select';
  debug.phase = phase;
  debug.yardRendered = false;
  worldInput.setEnabled(false);
  setCanvasSize(SELECT_WIDTH, SELECT_HEIGHT);
  syncPreferredName();
}

function updateYard(now: number): void {
  const dt = Math.min(0.032, Math.max(0, (now - lastRenderNow) / 1000));
  lastRenderNow = now;

  if (worldInput.justDown(ACTIONS.CANCEL)) {
    exitYardToSelection();
    return;
  }

  let dx = 0;
  let dy = 0;
  if (worldInput.isDown(ACTIONS.MOVE_LEFT)) dx -= 1;
  if (worldInput.isDown(ACTIONS.MOVE_RIGHT)) dx += 1;
  if (worldInput.isDown(ACTIONS.MOVE_UP)) dy -= 1;
  if (worldInput.isDown(ACTIONS.MOVE_DOWN)) dy += 1;

  player.moving = dx !== 0 || dy !== 0;
  lastCollision = false;

  if (player.moving) {
    if (dx !== 0 && dy !== 0) {
      const diagonal = Math.SQRT1_2;
      dx *= diagonal;
      dy *= diagonal;
    }

    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) player.facing = dx < 0 ? 'left' : 'right';
    else if (dy !== 0) player.facing = dy < 0 ? 'up' : 'down';

    const distance = PLAYER_SPEED * dt;
    const nextX = player.x + dx * distance;
    if (!isYardPositionBlocked(nextX, player.y)) player.x = nextX;
    else {
      collisionCount += 1;
      lastCollision = true;
    }

    const nextY = player.y + dy * distance;
    if (!isYardPositionBlocked(player.x, nextY)) player.y = nextY;
    else {
      collisionCount += 1;
      lastCollision = true;
    }
  }

  const targetX = clamp(player.x - YARD_VIEW_WIDTH / 2, 0, YARD_WORLD_WIDTH - YARD_VIEW_WIDTH);
  const targetY = clamp(player.y - YARD_VIEW_HEIGHT / 2, 0, YARD_WORLD_HEIGHT - YARD_VIEW_HEIGHT);
  const follow = 1 - Math.exp(-CAMERA_RESPONSE * dt);
  camera.x += (targetX - camera.x) * follow;
  camera.y += (targetY - camera.y) * follow;

  debug.playerX = Math.round(player.x * 10) / 10;
  debug.playerY = Math.round(player.y * 10) / 10;
  debug.cameraX = Math.round(camera.x * 10) / 10;
  debug.cameraY = Math.round(camera.y * 10) / 10;
  debug.facing = player.facing;
  debug.moving = player.moving;
  debug.collisionCount = collisionCount;
  debug.lastCollision = lastCollision;
}

function drawYardPlayer(now: number): void {
  const topX = Math.round(player.x - FRAME_WIDTH / 2);
  const topY = Math.round(player.y - 88);
  context.fillStyle = 'rgba(38,56,47,0.28)';
  context.beginPath();
  context.ellipse(Math.round(player.x), Math.round(player.y - 4), 22, 7, 0, 0, Math.PI * 2);
  context.fill();

  const frame = player.moving ? WALK_SEQUENCE[Math.floor(now / WALK_FRAME_MS) % WALK_SEQUENCE.length] : 0;
  debug.frame = frame;
  drawAnimatedCharacter(frames[selectedAvatarId][player.facing], topX, topY, frame, 1);
}

function renderYard(now: number): void {
  updateYard(now);
  if (phase !== 'confirmed') return;

  const renderCameraX = Math.round(camera.x);
  const renderCameraY = Math.round(camera.y);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.imageSmoothingEnabled = false;
  context.save();
  context.translate(-renderCameraX, -renderCameraY);
  drawApprenticeSplicerYardBase(context, now, player.y);
  drawYardPlayer(now);
  drawApprenticeSplicerYardForeground(context, player.y);
  context.restore();
  debug.yardRendered = true;
}

function render(now: number): void {
  if (phase === 'confirmed') {
    renderYard(now);
  } else {
    setCanvasSize(SELECT_WIDTH, SELECT_HEIGHT);
    debug.yardRendered = false;
    drawSelectionBackground();
    for (const id of PROTAGONIST_IDS) drawSelectionCharacter(id, now);
    drawSelectionFooter(now);
    lastRenderNow = now;
  }
  requestAnimationFrame(render);
}

function syncPreferredName(): void {
  playerNameInput.value = preferredNameFor(selectedAvatarId);
  debug.playerName = playerNameInput.value;
}

function setSelection(id: ProtagonistId): void {
  selectedAvatarId = id;
  phase = 'select';
  saved = Boolean(gameState.avatarId === id && gameState.playerName);
  debug.selectedAvatarId = id;
  debug.phase = phase;
  debug.saved = saved;
  debug.yardRendered = false;
  syncPreferredName();
}

function moveSelection(delta: number): void {
  const current = PROTAGONIST_IDS.indexOf(selectedAvatarId);
  const next = (current + delta + PROTAGONIST_IDS.length) % PROTAGONIST_IDS.length;
  setSelection(PROTAGONIST_IDS[next]);
}

function commitIdentity(rawName: string): void {
  const playerName = normalisePlayerName(rawName) ?? PROTAGONIST_SPRITES[selectedAvatarId].name;
  playerNameInput.value = playerName;
  if (!gameState.setPlayerIdentity(selectedAvatarId, playerName)) return;
  if (!saveGame()) return;

  saved = true;
  debug.playerName = playerName;
  debug.saved = true;
  enterYard();
}

function confirmSelection(): void {
  commitIdentity(preferredNameFor(selectedAvatarId));
}

function beginNaming(): void {
  phase = 'name';
  debug.phase = phase;
  debug.yardRendered = false;
  syncPreferredName();
  playerNameInput.focus({ preventScroll: true });
  playerNameInput.select();
}

function finishNaming(): void {
  commitIdentity(playerNameInput.value);
}

function cancelNaming(): void {
  phase = 'select';
  debug.phase = phase;
  debug.yardRendered = false;
  syncPreferredName();
  playerNameInput.blur();
}

window.addEventListener('keydown', (event) => {
  if (!debug.ready || phase === 'confirmed') return;
  if (phase !== 'select') return;

  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    event.preventDefault();
    moveSelection(1);
  } else if (event.code === 'KeyN') {
    event.preventDefault();
    beginNaming();
  } else if (event.code === 'Enter' || event.code === 'Space') {
    event.preventDefault();
    confirmSelection();
  }
});

playerNameInput.addEventListener('input', () => {
  debug.playerName = playerNameInput.value;
  debug.saved = false;
});

playerNameInput.addEventListener('keydown', (event) => {
  if (event.code === 'Enter') {
    event.preventDefault();
    finishNaming();
  } else if (event.code === 'Escape') {
    event.preventDefault();
    cancelNaming();
  }
});

function pointInside(x: number, y: number, box: { x: number; y: number; width: number; height: number }): boolean {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

stageCanvas.addEventListener('pointerdown', (event) => {
  if (!debug.ready || phase === 'confirmed') return;
  const rect = stageCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SELECT_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * SELECT_HEIGHT;

  if (phase === 'name') {
    playerNameInput.focus({ preventScroll: true });
    return;
  }
  if (pointInside(x, y, USE_BUTTON)) {
    confirmSelection();
    return;
  }
  if (pointInside(x, y, RENAME_BUTTON)) {
    beginNaming();
    return;
  }
  if (y < 190 || y > 462) return;
  for (const id of PROTAGONIST_IDS) {
    if (Math.abs(x - CHARACTER_X[id]) <= 78) {
      setSelection(id);
      return;
    }
  }
});

async function decodeFrame(base64: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64.trim()}`;
  await image.decode();
  if (image.naturalWidth !== FRAME_WIDTH || image.naturalHeight !== FRAME_HEIGHT) {
    throw new Error(`${label} frame has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`);
  }
  return image;
}

async function start(): Promise<void> {
  try {
    await Promise.all(PROTAGONIST_IDS.flatMap((id) =>
      (['down', 'left', 'right', 'up'] as YardFacing[]).map(async (facing) => {
        frames[id] ??= {} as Record<YardFacing, HTMLImageElement>;
        frames[id][facing] = await decodeFrame(FRAME_BASE64[id][facing], `${id}-${facing}`);
      })));
    debug.ready = true;
    requestAnimationFrame(render);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    console.error('Failed to load approved protagonist frames', error);
  }
}

void start();
