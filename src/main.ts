import miloDown from './assets/frames/milo-down.txt?raw';
import theoDown from './assets/frames/theo-down.txt?raw';
import adaDown from './assets/frames/ada-down.txt?raw';
import pipDown from './assets/frames/pip-down.txt?raw';
import { normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from './player/identity.js';
import { PROTAGONIST_IDS, PROTAGONIST_SPRITES, type ProtagonistId } from './player/protagonists.js';
import { gameState } from './state/GameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';
import { drawApprenticeSplicerYard } from './world/yard.js';

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const DISPLAY_SCALE = 2;
const WALK_FRAME_MS = 180;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;
const LOWER_BODY_Y = 64;
const LOWER_BODY_OVERLAP = 2;
const HALF_WIDTH = FRAME_WIDTH / 2;
const CHARACTER_Y = 230;
const USE_BUTTON = { x: 316, y: 492, width: 154, height: 34 } as const;
const RENAME_BUTTON = { x: 490, y: 492, width: 154, height: 34 } as const;

const CHARACTER_X: Record<ProtagonistId, number> = {
  milo: 150,
  theo: 360,
  ada: 600,
  pip: 810,
};

const DOWN_FRAME_BASE64: Record<ProtagonistId, string> = {
  milo: miloDown,
  theo: theoDown,
  ada: adaDown,
  pip: pipDown,
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
};

const root = document.getElementById('game') as HTMLElement | null;
if (!root) throw new Error('Missing #game root');

const loadedSave = loadGame();
let selectedAvatarId: ProtagonistId = gameState.avatarId ?? 'milo';
let phase: ResetPhase = 'select';
let saved = Boolean(loadedSave && gameState.avatarId && gameState.playerName);

root.innerHTML = `
  <canvas id="visual-reset-stage" width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" aria-label="SplicePit visual review stage"></canvas>
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

function preferredNameFor(id: ProtagonistId): string {
  if (gameState.avatarId === id && gameState.playerName) return gameState.playerName;
  return PROTAGONIST_SPRITES[id].name;
}

playerNameInput.value = preferredNameFor(selectedAvatarId);

const frames = {} as Record<ProtagonistId, HTMLImageElement>;
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
};

(globalThis as typeof globalThis & { __SPLICEPIT_VISUAL_RESET__?: VisualResetDebug }).__SPLICEPIT_VISUAL_RESET__ = debug;

function drawPixelRect(x: number, y: number, width: number, height: number, fill: string): void {
  context.fillStyle = fill;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawSelectionBackground(): void {
  drawPixelRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT, '#dfe6b6');
  drawPixelRect(0, 0, VIEW_WIDTH, 158, '#c8d7a0');
  drawPixelRect(0, 158, VIEW_WIDTH, 14, '#657b57');
  drawPixelRect(0, 172, VIEW_WIDTH, VIEW_HEIGHT - 172, '#d7c691');

  for (let y = 188; y < VIEW_HEIGHT; y += 28) {
    drawPixelRect(0, y, VIEW_WIDTH, 2, y % 56 === 20 ? '#c7b681' : '#cebe88');
  }

  for (let x = 24; x < VIEW_WIDTH; x += 74) {
    drawPixelRect(x, 190, 2, VIEW_HEIGHT - 190, '#c2ae78');
  }

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
  context.fillText('Choose your apprentice', VIEW_WIDTH / 2, 138);

  context.fillStyle = '#53624d';
  context.font = '600 13px "Trebuchet MS", "Segoe UI", sans-serif';
  context.fillText('No classes. No bonuses. Just four different histories of terrible judgement.', VIEW_WIDTH / 2, 112);
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
): void {
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX + offsetX * DISPLAY_SCALE,
    destY + offsetY * DISPLAY_SCALE,
    sourceWidth * DISPLAY_SCALE,
    sourceHeight * DISPLAY_SCALE,
  );
}

function drawAnimatedCharacter(image: HTMLImageElement, destX: number, destY: number, animationFrame: number): void {
  if (animationFrame === 0) {
    context.drawImage(image, destX, destY, FRAME_WIDTH * DISPLAY_SCALE, FRAME_HEIGHT * DISPLAY_SCALE);
    return;
  }

  const stride = animationFrame === 1 ? -2 : animationFrame === 3 ? 2 : 0;
  const torsoX = animationFrame === 1 ? -1 : animationFrame === 3 ? 1 : 0;
  const torsoY = animationFrame === 2 ? -1 : 0;
  const leftY = animationFrame === 1 ? 1 : animationFrame === 3 ? -1 : 0;
  const rightY = -leftY;
  const lowerSourceY = LOWER_BODY_Y - LOWER_BODY_OVERLAP;
  const lowerHeight = FRAME_HEIGHT - lowerSourceY;
  const lowerDestY = destY + lowerSourceY * DISPLAY_SCALE;

  drawSection(image, 0, lowerSourceY, HALF_WIDTH, lowerHeight, destX, lowerDestY, stride, leftY);
  drawSection(
    image,
    HALF_WIDTH,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX + HALF_WIDTH * DISPLAY_SCALE,
    lowerDestY,
    -stride,
    rightY,
  );
  drawSection(image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
}

function drawSelectionCharacter(id: ProtagonistId, now: number): void {
  const centreX = CHARACTER_X[id];
  const destX = centreX - (FRAME_WIDTH * DISPLAY_SCALE) / 2;
  const selected = id === selectedAvatarId;
  const faded = phase !== 'select' && !selected;

  context.save();
  if (faded) context.globalAlpha = 0.28;

  context.fillStyle = faded ? 'rgba(57,72,52,0.12)' : 'rgba(57,72,52,0.24)';
  context.beginPath();
  context.ellipse(centreX, CHARACTER_Y + FRAME_HEIGHT * DISPLAY_SCALE - 7, 43, 12, 0, 0, Math.PI * 2);
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
  drawAnimatedCharacter(frames[id], destX, CHARACTER_Y, frame);

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
    context.fillText('Change name?', VIEW_WIDTH / 2, 479);
    const caret = Math.floor(now / 450) % 2 === 0 ? '▌' : '';
    context.font = '800 18px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillText(`${playerNameInput.value}${caret}`, VIEW_WIDTH / 2, 500);
    context.font = '600 10px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillStyle = '#53624d';
    context.fillText(`Enter: use this name · Esc: keep ${protagonistName}`, VIEW_WIDTH / 2, 518);
    return;
  }

  context.fillStyle = '#314339';
  context.font = '700 13px "Trebuchet MS", "Segoe UI", sans-serif';
  context.fillText(`Name: ${currentName}`, VIEW_WIDTH / 2, 478);
  drawActionButton(USE_BUTTON.x, USE_BUTTON.y, USE_BUTTON.width, USE_BUTTON.height, `Use ${currentName}`, true);
  drawActionButton(RENAME_BUTTON.x, RENAME_BUTTON.y, RENAME_BUTTON.width, RENAME_BUTTON.height, 'Change name?', false);
}

function render(now: number): void {
  if (phase === 'confirmed') {
    drawApprenticeSplicerYard(context, {
      protagonistImage: frames[selectedAvatarId],
      playerName: playerNameInput.value || preferredNameFor(selectedAvatarId),
      now,
    });
    debug.yardRendered = true;
  } else {
    debug.yardRendered = false;
    drawSelectionBackground();
    for (const id of PROTAGONIST_IDS) drawSelectionCharacter(id, now);
    drawSelectionFooter(now);
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
  phase = 'confirmed';
  debug.phase = phase;
  debug.playerName = playerName;
  debug.saved = true;
  playerNameInput.blur();
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
  if (!debug.ready) return;

  if (phase === 'confirmed') {
    if (event.code === 'Escape' || event.code === 'Backspace') {
      event.preventDefault();
      phase = 'select';
      debug.phase = phase;
      debug.yardRendered = false;
    }
    return;
  }

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
  if (!debug.ready) return;

  const rect = stageCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;

  if (phase === 'name') {
    playerNameInput.focus({ preventScroll: true });
    return;
  }

  if (phase === 'confirmed') {
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
    await Promise.all(PROTAGONIST_IDS.map(async (id) => {
      frames[id] = await decodeFrame(DOWN_FRAME_BASE64[id], `${id}-down`);
    }));
    debug.ready = true;
    requestAnimationFrame(render);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    console.error('Failed to load approved protagonist frames', error);
  }
}

void start();
