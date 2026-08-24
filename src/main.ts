import miloDown from './assets/frames/milo-down.txt?raw';
import theoDown from './assets/frames/theo-down.txt?raw';
import adaDown from './assets/frames/ada-down.txt?raw';
import pipDown from './assets/frames/pip-down.txt?raw';
import { normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from './player/identity.js';
import { PROTAGONIST_IDS, PROTAGONIST_SPRITES, type ProtagonistId } from './player/protagonists.js';
import { gameState } from './state/GameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';

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

type ResetPhase = 'select' | 'name';

type VisualResetDebug = {
  ready: boolean;
  error: string | null;
  phase: ResetPhase;
  selectedAvatarId: ProtagonistId;
  playerName: string;
  loadedFromSave: boolean;
  saved: boolean;
  frame: number;
};

const root = document.getElementById('game') as HTMLElement | null;
if (!root) throw new Error('Missing #game root');

const loadedSave = loadGame();
let selectedAvatarId: ProtagonistId = gameState.avatarId ?? 'milo';
let phase: ResetPhase = 'select';
let lastPointerSelection: ProtagonistId | null = null;
let saved = Boolean(loadedSave && gameState.avatarId && gameState.playerName);

root.innerHTML = `
  <canvas id="visual-reset-stage" width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" aria-label="SplicePit protagonist visual reset stage"></canvas>
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

const canvas = root.querySelector<HTMLCanvasElement>('#visual-reset-stage');
const nameInput = root.querySelector<HTMLInputElement>('#player-name-capture');
if (!canvas || !nameInput) throw new Error('Visual reset stage failed to mount');

const maybeContext = canvas.getContext('2d', { alpha: false });
if (!maybeContext) throw new Error('Canvas 2D context unavailable');
const context: CanvasRenderingContext2D = maybeContext;
context.imageSmoothingEnabled = false;

nameInput.value = gameState.playerName ?? '';

const frames = {} as Record<ProtagonistId, HTMLImageElement>;
const debug: VisualResetDebug = {
  ready: false,
  error: null,
  phase,
  selectedAvatarId,
  playerName: nameInput.value,
  loadedFromSave: saved,
  saved,
  frame: 0,
};

(globalThis as typeof globalThis & { __SPLICEPIT_VISUAL_RESET__?: VisualResetDebug }).__SPLICEPIT_VISUAL_RESET__ = debug;

function drawPixelRect(x: number, y: number, width: number, height: number, fill: string): void {
  context.fillStyle = fill;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawBackground(): void {
  drawPixelRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT, '#dfe6b6');
  drawPixelRect(0, 0, VIEW_WIDTH, 158, '#c8d7a0');
  drawPixelRect(0, 158, VIEW_WIDTH, 14, '#657b57');
  drawPixelRect(0, 172, VIEW_WIDTH, VIEW_HEIGHT - 172, '#d7c691');

  for (let y = 188; y < VIEW_HEIGHT; y += 28) {
    drawPixelRect(0, y, VIEW_WIDTH, 2, y % 56 === 20 ? '#c7b681' : '#cebE88');
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

function drawCharacter(id: ProtagonistId, now: number): void {
  const centreX = CHARACTER_X[id];
  const destX = centreX - (FRAME_WIDTH * DISPLAY_SCALE) / 2;
  const selected = id === selectedAvatarId;
  const faded = phase === 'name' && !selected;

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

function drawFooter(now: number): void {
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  if (phase === 'name') {
    context.fillStyle = '#f3e8b9';
    context.fillRect(258, 472, 444, 48);
    context.fillStyle = '#6c795b';
    context.fillRect(258, 472, 444, 3);
    context.fillStyle = '#26382f';
    context.font = '700 13px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillText(`Name ${PROTAGONIST_SPRITES[selectedAvatarId].name}`, VIEW_WIDTH / 2, 487);
    const caret = Math.floor(now / 450) % 2 === 0 ? '▌' : '';
    context.font = '800 18px "Trebuchet MS", "Segoe UI", sans-serif';
    context.fillText(`${nameInput.value}${caret}`, VIEW_WIDTH / 2, 505);
    return;
  }

  context.fillStyle = '#485846';
  context.font = '600 12px "Trebuchet MS", "Segoe UI", sans-serif';
  const savedName = saved && gameState.playerName
    ? `${gameState.playerName} is saved as ${PROTAGONIST_SPRITES[selectedAvatarId].name}. `
    : '';
  context.fillText(`${savedName}← / → or A / D to choose · Enter to name · mouse/touch: tap a character twice`, VIEW_WIDTH / 2, 500);
}

function render(now: number): void {
  drawBackground();
  for (const id of PROTAGONIST_IDS) drawCharacter(id, now);
  drawFooter(now);
  requestAnimationFrame(render);
}

function setSelection(id: ProtagonistId): void {
  selectedAvatarId = id;
  saved = false;
  debug.selectedAvatarId = id;
  debug.saved = false;
}

function moveSelection(delta: number): void {
  const current = PROTAGONIST_IDS.indexOf(selectedAvatarId);
  const next = (current + delta + PROTAGONIST_IDS.length) % PROTAGONIST_IDS.length;
  setSelection(PROTAGONIST_IDS[next]);
}

function beginNaming(): void {
  phase = 'name';
  debug.phase = phase;
  nameInput.value = gameState.avatarId === selectedAvatarId && gameState.playerName ? gameState.playerName : '';
  debug.playerName = nameInput.value;
  nameInput.focus({ preventScroll: true });
}

function finishNaming(): void {
  const playerName = normalisePlayerName(nameInput.value);
  if (!playerName) return;

  nameInput.value = playerName;
  if (!gameState.setPlayerIdentity(selectedAvatarId, playerName)) return;
  if (!saveGame()) return;

  saved = true;
  phase = 'select';
  debug.phase = phase;
  debug.playerName = playerName;
  debug.saved = true;
  nameInput.blur();
}

window.addEventListener('keydown', (event) => {
  if (!debug.ready || phase !== 'select') return;

  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    event.preventDefault();
    moveSelection(1);
  } else if (event.code === 'Enter' || event.code === 'Space') {
    event.preventDefault();
    beginNaming();
  }
});

nameInput.addEventListener('input', () => {
  debug.playerName = nameInput.value;
  debug.saved = false;
});

nameInput.addEventListener('keydown', (event) => {
  if (event.code === 'Enter') {
    event.preventDefault();
    finishNaming();
  } else if (event.code === 'Escape') {
    event.preventDefault();
    phase = 'select';
    debug.phase = phase;
    nameInput.blur();
  }
});

canvas.addEventListener('pointerdown', (event) => {
  if (!debug.ready) return;
  if (phase === 'name') {
    nameInput.focus({ preventScroll: true });
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
  if (y < 190 || y > 462) return;

  let hit: ProtagonistId | null = null;
  for (const id of PROTAGONIST_IDS) {
    if (Math.abs(x - CHARACTER_X[id]) <= 78) {
      hit = id;
      break;
    }
  }
  if (!hit) return;

  if (hit === selectedAvatarId && lastPointerSelection === hit) {
    beginNaming();
    lastPointerSelection = null;
    return;
  }

  setSelection(hit);
  lastPointerSelection = hit;
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
