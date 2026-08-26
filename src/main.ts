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
import { OpeningObjectiveSequenceController } from './onboarding/openingObjectiveSequence.js';
import {
  OpeningShellController,
  type OpeningObjectiveId,
  type OpeningShellId,
} from './onboarding/openingShells.js';
import { normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from './player/identity.js';
import { PROTAGONIST_IDS, PROTAGONIST_SPRITES, type ProtagonistId } from './player/protagonists.js';
import { gameState } from './state/GameState.js';
import { loadGame, saveGame } from './systems/saveSystem.js';
import {
  TutorialPromptController,
  type TutorialPromptId,
  type TutorialPromptView,
} from './tutorial/tutorialFramework.js';
import {
  drawApprenticeSelection,
  pointInsideSelectionBox,
  SELECT_RENAME_BUTTON,
  SELECT_USE_BUTTON,
  SELECT_VIEW_HEIGHT,
  SELECT_VIEW_WIDTH,
  selectionCharacterAt,
} from './ui/apprenticeSelection.js';
import { drawOpeningObjectiveTracker, drawOpeningShell } from './ui/openingShells.js';
import { drawTutorialPrompt } from './ui/tutorialPrompt.js';
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

const FRAME_BASE64: Record<ProtagonistId, Record<YardFacing, string>> = {
  milo: { down: miloDown, left: miloLeft, right: miloRight, up: miloUp },
  theo: { down: theoDown, left: theoLeft, right: theoRight, up: theoUp },
  ada: { down: adaDown, left: adaLeft, right: adaRight, up: adaUp },
  pip: { down: pipDown, left: pipLeft, right: pipRight, up: pipUp },
};

type GamePhase = 'select' | 'name' | 'confirmed';

type VisualResetDebug = {
  ready: boolean;
  error: string | null;
  phase: GamePhase;
  selectedAvatarId: ProtagonistId;
  playerName: string;
  loadedFromSave: boolean;
  saved: boolean;
  frame: number;
  yardRendered: boolean;
  selectionRendered: boolean;
  selectionPresentation: 'yard-arrival';
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
  tutorialPromptId: TutorialPromptId | null;
  tutorialPromptVisible: boolean;
  tutorialPromptCompleting: boolean;
  tutorialPromptAlpha: number;
  tutorialHintLabels: string[];
  tutorialCompleted: TutorialPromptId[];
  openingSequencePromptId: TutorialPromptId | null;
  openingSequenceComplete: boolean;
  activeOpeningShell: OpeningShellId | null;
  objectiveId: OpeningObjectiveId;
  objectiveTitle: string;
  objectiveDetail: string;
  objectiveStep: number;
  objectiveCount: number;
  openingInventory: Array<{ id: string; label: string; quantity: number }>;
};

const root = document.getElementById('game') as HTMLElement | null;
if (!root) throw new Error('Missing #game root');

const loadedSave = loadGame();
let selectedAvatarId: ProtagonistId = gameState.avatarId ?? 'milo';
let phase: GamePhase = 'select';
let saved = Boolean(loadedSave && gameState.avatarId && gameState.playerName);

root.innerHTML = `
  <canvas id="visual-reset-stage" width="${SELECT_VIEW_WIDTH}" height="${SELECT_VIEW_HEIGHT}" aria-label="SplicePit apprentice selection and Yard"></canvas>
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
if (!canvas || !nameInput) throw new Error('SplicePit stage failed to mount');
const stageCanvas: HTMLCanvasElement = canvas;
const playerNameInput: HTMLInputElement = nameInput;

const maybeContext = stageCanvas.getContext('2d', { alpha: false });
if (!maybeContext) throw new Error('Canvas 2D context unavailable');
const context: CanvasRenderingContext2D = maybeContext;
context.imageSmoothingEnabled = false;

const worldInput = new BrowserSemanticInput();
worldInput.setEnabled(false);
const tutorial = new TutorialPromptController();
const openingSequence = new OpeningObjectiveSequenceController();
const openingShells = new OpeningShellController();

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
const initialObjective = openingShells.currentObjective();

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
  selectionRendered: false,
  selectionPresentation: 'yard-arrival',
  playerX: player.x,
  playerY: player.y,
  cameraX: 0,
  cameraY: 0,
  facing: player.facing,
  moving: false,
  collisionCount: 0,
  lastCollision: false,
  viewportWidth: SELECT_VIEW_WIDTH,
  viewportHeight: SELECT_VIEW_HEIGHT,
  worldWidth: YARD_WORLD_WIDTH,
  worldHeight: YARD_WORLD_HEIGHT,
  tutorialPromptId: null,
  tutorialPromptVisible: false,
  tutorialPromptCompleting: false,
  tutorialPromptAlpha: 0,
  tutorialHintLabels: [],
  tutorialCompleted: [],
  openingSequencePromptId: openingSequence.currentPromptId(),
  openingSequenceComplete: false,
  activeOpeningShell: null,
  objectiveId: initialObjective.id,
  objectiveTitle: initialObjective.title,
  objectiveDetail: initialObjective.detail,
  objectiveStep: openingShells.objectiveStep(),
  objectiveCount: openingShells.objectiveCount(),
  openingInventory: openingShells.inventory().map((entry) => ({
    id: entry.id,
    label: entry.label,
    quantity: entry.quantity,
  })),
};

(globalThis as typeof globalThis & { __SPLICEPIT_VISUAL_RESET__?: VisualResetDebug }).__SPLICEPIT_VISUAL_RESET__ = debug;

function syncTutorialDebug(prompt: TutorialPromptView | null): void {
  debug.tutorialPromptId = prompt?.id ?? null;
  debug.tutorialPromptVisible = prompt !== null;
  debug.tutorialPromptCompleting = prompt?.completing ?? false;
  debug.tutorialPromptAlpha = prompt ? Math.round(prompt.alpha * 1000) / 1000 : 0;
  debug.tutorialHintLabels = prompt?.hints.map((hint) => hint.label) ?? [];
  debug.tutorialCompleted = tutorial.completedIds();
}

function syncOpeningShellDebug(): void {
  const objective = openingShells.currentObjective();
  debug.openingSequencePromptId = openingSequence.currentPromptId();
  debug.openingSequenceComplete = openingSequence.isComplete();
  debug.activeOpeningShell = openingShells.activeShell();
  debug.objectiveId = objective.id;
  debug.objectiveTitle = objective.title;
  debug.objectiveDetail = objective.detail;
  debug.objectiveStep = openingShells.objectiveStep();
  debug.objectiveCount = openingShells.objectiveCount();
  debug.openingInventory = openingShells.inventory().map((entry) => ({
    id: entry.id,
    label: entry.label,
    quantity: entry.quantity,
  }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
    destX + offsetX,
    destY + offsetY,
    sourceWidth,
    sourceHeight,
  );
}

function drawAnimatedCharacter(image: HTMLImageElement, destX: number, destY: number, animationFrame: number): void {
  if (animationFrame === 0) {
    context.drawImage(image, destX, destY, FRAME_WIDTH, FRAME_HEIGHT);
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

  drawSection(image, 0, lowerSourceY, HALF_WIDTH, lowerHeight, destX, lowerDestY, stride, leftY);
  drawSection(
    image,
    HALF_WIDTH,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX + HALF_WIDTH,
    lowerDestY,
    -stride,
    rightY,
  );
  drawSection(image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
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
  debug.playerX = player.x;
  debug.playerY = player.y;
  debug.cameraX = camera.x;
  debug.cameraY = camera.y;
  debug.facing = player.facing;
  debug.moving = false;
  debug.collisionCount = 0;
  debug.lastCollision = false;
}

function activateReadyOpeningPrompt(now: number): void {
  const promptId = openingSequence.takeReadyPrompt(now);
  if (promptId) tutorial.activate(promptId);
}

function progressOpeningObjectiveSequence(now: number): TutorialPromptView | null {
  let prompt = tutorial.current(now);
  const expectedPrompt = openingSequence.currentPromptId();

  if (prompt === null && expectedPrompt && tutorial.isCompleted(expectedPrompt)) {
    openingSequence.acknowledgeCompletedPrompt(expectedPrompt, now);
    const objectiveId = openingSequence.objectiveId();
    if (openingShells.currentObjective().id !== objectiveId) openingShells.setObjective(objectiveId);
  }

  activateReadyOpeningPrompt(now);
  if (prompt === null) prompt = tutorial.current(now);

  if (openingSequence.isComplete() && openingShells.currentObjective().id !== 'find-master') {
    openingShells.setObjective('find-master');
  }

  return prompt;
}

function enterYard(): void {
  phase = 'confirmed';
  debug.phase = phase;
  debug.selectionRendered = false;
  resetYardRuntime();
  const now = performance.now();
  tutorial.resetProgress();
  openingShells.reset();
  openingSequence.reset(now);
  activateReadyOpeningPrompt(now);
  syncTutorialDebug(tutorial.current(now));
  syncOpeningShellDebug();
  worldInput.setEnabled(true);
  playerNameInput.blur();
}

function exitYardToSelection(): void {
  phase = 'select';
  debug.phase = phase;
  debug.yardRendered = false;
  tutorial.clearActive();
  openingSequence.reset();
  openingShells.closeShell();
  syncTutorialDebug(null);
  syncOpeningShellDebug();
  worldInput.setEnabled(false);
  syncPreferredName();
}

function updateYard(now: number): void {
  const dt = Math.min(0.032, Math.max(0, (now - lastRenderNow) / 1000));
  lastRenderNow = now;

  if (worldInput.justDown(ACTIONS.INTERACT)) {
    tutorial.observeAction(ACTIONS.INTERACT, now);
    if (openingSequence.currentPromptId() === 'interact') {
      player.moving = false;
      debug.moving = false;
      return;
    }
  }

  if (worldInput.justDown(ACTIONS.CONFIRM)) {
    tutorial.observeAction(ACTIONS.CONFIRM, now);
    if (openingSequence.currentPromptId() === 'confirm-cancel') {
      player.moving = false;
      debug.moving = false;
      return;
    }
  }

  if (worldInput.justDown(ACTIONS.BAG)) {
    tutorial.observeAction(ACTIONS.BAG, now);
    openingShells.toggle('bag');
    player.moving = false;
    debug.moving = false;
    syncOpeningShellDebug();
    return;
  }

  if (worldInput.justDown(ACTIONS.MAP)) {
    tutorial.observeAction(ACTIONS.MAP, now);
    openingShells.toggle('map');
    player.moving = false;
    debug.moving = false;
    syncOpeningShellDebug();
    return;
  }

  if (worldInput.justDown(ACTIONS.CANCEL)) {
    tutorial.observeAction(ACTIONS.CANCEL, now);
    const teachingConfirmCancel = openingSequence.currentPromptId() === 'confirm-cancel';
    if (openingShells.isOpen()) {
      openingShells.closeShell();
      player.moving = false;
      debug.moving = false;
      syncOpeningShellDebug();
      return;
    }
    if (teachingConfirmCancel) {
      player.moving = false;
      debug.moving = false;
      return;
    }
    exitYardToSelection();
    return;
  }

  if (openingShells.isOpen()) {
    player.moving = false;
    debug.moving = false;
    lastCollision = false;
    debug.lastCollision = false;
    return;
  }

  let dx = 0;
  let dy = 0;
  if (worldInput.isDown(ACTIONS.MOVE_LEFT)) dx -= 1;
  if (worldInput.isDown(ACTIONS.MOVE_RIGHT)) dx += 1;
  if (worldInput.isDown(ACTIONS.MOVE_UP)) dy -= 1;
  if (worldInput.isDown(ACTIONS.MOVE_DOWN)) dy += 1;

  if (dx < 0) tutorial.observeAction(ACTIONS.MOVE_LEFT, now);
  else if (dx > 0) tutorial.observeAction(ACTIONS.MOVE_RIGHT, now);
  if (dy < 0) tutorial.observeAction(ACTIONS.MOVE_UP, now);
  else if (dy > 0) tutorial.observeAction(ACTIONS.MOVE_DOWN, now);

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

    const speedMultiplier = worldInput.isDown(ACTIONS.RUN) ? RUN_SPEED_MULTIPLIER : 1;
    const distance = PLAYER_SPEED * speedMultiplier * dt;
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
  drawAnimatedCharacter(frames[selectedAvatarId][player.facing], topX, topY, frame);
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

  const tutorialPrompt = progressOpeningObjectiveSequence(now);
  const objective = openingShells.currentObjective();
  drawOpeningObjectiveTracker(
    context,
    objective,
    openingShells.objectiveStep(),
    openingShells.objectiveCount(),
  );

  if (tutorialPrompt) drawTutorialPrompt(context, tutorialPrompt, YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT);
  syncTutorialDebug(tutorialPrompt);

  drawOpeningShell(context, {
    activeShell: openingShells.activeShell(),
    inventory: openingShells.inventory(),
    objective,
    objectiveStep: openingShells.objectiveStep(),
    objectiveCount: openingShells.objectiveCount(),
    playerX: player.x,
    playerY: player.y,
    worldWidth: YARD_WORLD_WIDTH,
    worldHeight: YARD_WORLD_HEIGHT,
  }, YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT);
  syncOpeningShellDebug();

  debug.yardRendered = true;
  debug.selectionRendered = false;
}

function renderSelection(now: number): void {
  drawApprenticeSelection(context, {
    frames,
    selectedAvatarId,
    playerName: playerNameInput.value || preferredNameFor(selectedAvatarId),
    phase: phase === 'name' ? 'name' : 'select',
    now,
  });
  debug.yardRendered = false;
  debug.selectionRendered = true;
  debug.viewportWidth = SELECT_VIEW_WIDTH;
  debug.viewportHeight = SELECT_VIEW_HEIGHT;
  syncTutorialDebug(null);
  lastRenderNow = now;
}

function render(now: number): void {
  if (phase === 'confirmed') renderYard(now);
  else renderSelection(now);
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
  debug.selectionRendered = true;
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
  commitIdentity(playerNameInput.value || preferredNameFor(selectedAvatarId));
}

function beginNaming(): void {
  phase = 'name';
  debug.phase = phase;
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
  syncPreferredName();
  playerNameInput.blur();
}

window.addEventListener('keydown', (event) => {
  if (!debug.ready || phase === 'confirmed' || phase !== 'select') return;

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

stageCanvas.addEventListener('pointerdown', (event) => {
  if (!debug.ready || phase === 'confirmed') return;
  const rect = stageCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SELECT_VIEW_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * SELECT_VIEW_HEIGHT;

  if (phase === 'name') {
    playerNameInput.focus({ preventScroll: true });
    return;
  }

  if (pointInsideSelectionBox(x, y, SELECT_USE_BUTTON)) {
    confirmSelection();
    return;
  }
  if (pointInsideSelectionBox(x, y, SELECT_RENAME_BUTTON)) {
    beginNaming();
    return;
  }

  const character = selectionCharacterAt(x, y);
  if (character) setSelection(character);
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
