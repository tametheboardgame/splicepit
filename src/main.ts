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
import { normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from './player/identity.js';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_IDS,
  PROTAGONIST_SPRITES,
  type ProtagonistDirection,
  type ProtagonistId,
} from './player/protagonists.js';
import { gameState } from './state/GameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const PREVIEW_SCALE = 1;
const WALK_FRAME_MS = 170;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;
const LOWER_BODY_Y = 64;
const LOWER_BODY_OVERLAP = 2;
const HALF_WIDTH = FRAME_WIDTH / 2;

const FRAME_BASE64: Record<ProtagonistId, Record<ProtagonistDirection, string>> = {
  milo: { down: miloDown, left: miloLeft, right: miloRight, up: miloUp },
  theo: { down: theoDown, left: theoLeft, right: theoRight, up: theoUp },
  ada: { down: adaDown, left: adaLeft, right: adaRight, up: adaUp },
  pip: { down: pipDown, left: pipLeft, right: pipRight, up: pipUp },
};

const CHARACTER_NOTES: Record<ProtagonistId, string> = {
  milo: 'Biotech tinkerer',
  theo: 'Scavenger field collector',
  ada: 'Obsessive field scientist',
  pip: 'Chaos experimenter',
};

type CharacterSelectDebug = {
  ready: boolean;
  error: string | null;
  selectedAvatarId: ProtagonistId;
  playerName: string;
  loadedFromSave: boolean;
  saved: boolean;
  previewFrame: number;
};

const root = document.getElementById('game');
if (!root) throw new Error('Missing #game root');

const loadedSave = loadGame();
let selectedAvatarId: ProtagonistId = gameState.avatarId ?? 'milo';
const loadedIdentity = loadedSave && gameState.avatarId !== null && gameState.playerName !== null;

root.innerHTML = `
  <div class="character-select-shell">
    <main class="character-select" aria-labelledby="character-select-title">
      <header class="select-heading">
        <p class="select-kicker">APPRENTICE REGISTRATION</p>
        <h1 id="character-select-title">Choose your splicer</h1>
        <p class="select-subtitle">Same odds. Same rules. Different history of bad decisions.</p>
      </header>

      <div class="select-body">
        <section class="preview-column" aria-live="polite">
          <div class="preview-frame">
            <canvas id="character-preview" width="190" height="180" aria-label="Live protagonist preview"></canvas>
            <div class="preview-caption">
              <strong id="preview-name"></strong>
              <span id="preview-note"></span>
            </div>
          </div>
        </section>

        <section class="identity-column" aria-label="Player identity">
          <div class="character-tabs" role="listbox" aria-label="Choose an apprentice">
            ${PROTAGONIST_IDS.map((id) => `<button type="button" class="character-tab" data-avatar="${id}" role="option">${PROTAGONIST_SPRITES[id].name}</button>`).join('')}
          </div>

          <form id="identity-form" novalidate>
            <label class="name-label" for="player-name">Your name</label>
            <input
              id="player-name"
              name="playerName"
              type="text"
              maxlength="${PLAYER_NAME_MAX_LENGTH}"
              autocomplete="off"
              spellcheck="false"
              aria-describedby="identity-status"
            />
            <p class="name-help">1–${PLAYER_NAME_MAX_LENGTH} characters. Letters such as W, A, S and D stay in the name field.</p>
            <button id="save-identity" class="save-identity" type="submit">Save identity</button>
            <p id="identity-status" class="identity-status" role="status"></p>
          </form>
        </section>
      </div>
    </main>
  </div>
`;

function requireElement<T extends Element>(selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing character-select element: ${selector}`);
  return element;
}

const previewCanvas = requireElement<HTMLCanvasElement>('#character-preview');
const previewContext = previewCanvas.getContext('2d', { alpha: false });
if (!previewContext) throw new Error('Character preview canvas is unavailable');
previewContext.imageSmoothingEnabled = false;

const previewName = requireElement<HTMLElement>('#preview-name');
const previewNote = requireElement<HTMLElement>('#preview-note');
const nameInput = requireElement<HTMLInputElement>('#player-name');
const identityForm = requireElement<HTMLFormElement>('#identity-form');
const statusText = requireElement<HTMLParagraphElement>('#identity-status');
const characterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.character-tab'));

nameInput.value = gameState.playerName ?? '';

const frames = {} as Record<ProtagonistId, Record<ProtagonistDirection, HTMLImageElement>>;
const debug: CharacterSelectDebug = {
  ready: false,
  error: null,
  selectedAvatarId,
  playerName: nameInput.value,
  loadedFromSave: loadedIdentity,
  saved: loadedIdentity,
  previewFrame: 0,
};
(globalThis as typeof globalThis & { __SPLICEPIT_CHARACTER_SELECT__?: CharacterSelectDebug }).__SPLICEPIT_CHARACTER_SELECT__ = debug;

function setStatus(message: string, state: 'neutral' | 'success' | 'error' = 'neutral'): void {
  statusText.textContent = message;
  statusText.dataset.state = state;
}

function setSelection(id: ProtagonistId, announce = true): void {
  selectedAvatarId = id;
  debug.selectedAvatarId = id;
  debug.saved = false;
  previewName.textContent = PROTAGONIST_SPRITES[id].name;
  previewNote.textContent = CHARACTER_NOTES[id];

  for (const button of characterButtons) {
    const active = button.dataset.avatar === id;
    button.classList.toggle('is-selected', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  }

  if (announce) setStatus(`${PROTAGONIST_SPRITES[id].name} selected.`);
}

for (const button of characterButtons) {
  button.addEventListener('click', () => {
    const id = button.dataset.avatar;
    if (id && PROTAGONIST_IDS.includes(id as ProtagonistId)) setSelection(id as ProtagonistId);
  });
}

nameInput.addEventListener('input', () => {
  debug.playerName = nameInput.value;
  debug.saved = false;
  nameInput.removeAttribute('aria-invalid');
  if (statusText.dataset.state === 'error') setStatus('');
});

identityForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const playerName = normalisePlayerName(nameInput.value);
  if (!playerName) {
    nameInput.setAttribute('aria-invalid', 'true');
    setStatus(`Enter a name between 1 and ${PLAYER_NAME_MAX_LENGTH} characters.`, 'error');
    nameInput.focus();
    return;
  }

  nameInput.value = playerName;
  debug.playerName = playerName;
  if (!gameState.setPlayerIdentity(selectedAvatarId, playerName)) {
    setStatus('That identity could not be registered.', 'error');
    return;
  }

  if (!saveGame()) {
    setStatus('The identity could not be saved in this browser.', 'error');
    return;
  }

  debug.saved = true;
  setStatus(`${playerName} registered as ${PROTAGONIST_SPRITES[selectedAvatarId].name}.`, 'success');
});

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
  previewContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX + offsetX * PREVIEW_SCALE,
    destY + offsetY * PREVIEW_SCALE,
    sourceWidth * PREVIEW_SCALE,
    sourceHeight * PREVIEW_SCALE,
  );
}

function drawAnimatedCharacter(image: HTMLImageElement, destX: number, destY: number, animationFrame: number): void {
  if (animationFrame === 0) {
    previewContext.drawImage(image, destX, destY, FRAME_WIDTH * PREVIEW_SCALE, FRAME_HEIGHT * PREVIEW_SCALE);
    return;
  }

  const stride = animationFrame === 1 ? -2 : animationFrame === 3 ? 2 : 0;
  const torsoX = animationFrame === 1 ? -1 : animationFrame === 3 ? 1 : 0;
  const torsoY = animationFrame === 2 ? -1 : 0;
  const leftY = animationFrame === 1 ? 1 : animationFrame === 3 ? -1 : 0;
  const rightY = -leftY;
  const lowerSourceY = LOWER_BODY_Y - LOWER_BODY_OVERLAP;
  const lowerHeight = FRAME_HEIGHT - lowerSourceY;
  const lowerDestY = destY + lowerSourceY * PREVIEW_SCALE;

  drawSection(image, 0, lowerSourceY, HALF_WIDTH, lowerHeight, destX, lowerDestY, stride, leftY);
  drawSection(
    image,
    HALF_WIDTH,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX + HALF_WIDTH * PREVIEW_SCALE,
    lowerDestY,
    -stride,
    rightY,
  );
  drawSection(image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
}

function drawPreview(now: number): void {
  previewContext.fillStyle = '#211f18';
  previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

  previewContext.fillStyle = '#2a3024';
  previewContext.fillRect(0, 136, previewCanvas.width, 44);
  previewContext.fillStyle = '#343a2c';
  for (let x = 0; x < previewCanvas.width; x += 16) previewContext.fillRect(x, 136, 8, 44);

  previewContext.strokeStyle = '#4d4a3a';
  previewContext.lineWidth = 1;
  for (let x = 14; x < previewCanvas.width; x += 24) {
    previewContext.beginPath();
    previewContext.moveTo(x + 0.5, 0);
    previewContext.lineTo(x + 0.5, 136);
    previewContext.stroke();
  }

  if (debug.ready) {
    const sequenceIndex = Math.floor(now / WALK_FRAME_MS) % WALK_SEQUENCE.length;
    const animationFrame = WALK_SEQUENCE[sequenceIndex];
    debug.previewFrame = animationFrame;
    const image = frames[selectedAvatarId].down;
    const destX = Math.round((previewCanvas.width - FRAME_WIDTH * PREVIEW_SCALE) / 2);
    const destY = 38;
    drawAnimatedCharacter(image, destX, destY, animationFrame);
  }

  requestAnimationFrame(drawPreview);
}

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
    await Promise.all(
      PROTAGONIST_IDS.flatMap((id) =>
        PROTAGONIST_DIRECTIONS.map(async (direction) => {
          frames[id] ??= {} as Record<ProtagonistDirection, HTMLImageElement>;
          frames[id][direction] = await decodeFrame(FRAME_BASE64[id][direction], `${id}-${direction}`);
        }),
      ),
    );

    debug.ready = true;
    setSelection(selectedAvatarId, false);
    if (loadedIdentity && gameState.playerName) {
      setStatus(`${gameState.playerName} loaded as ${PROTAGONIST_SPRITES[selectedAvatarId].name}.`, 'success');
      debug.saved = true;
    } else {
      setStatus(`${PROTAGONIST_SPRITES[selectedAvatarId].name} selected.`);
    }
    requestAnimationFrame(drawPreview);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    setStatus('The protagonist preview could not be loaded.', 'error');
    console.error('Failed to load approved protagonist frames', error);
  }
}

void start();
