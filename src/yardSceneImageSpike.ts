import miloDown from './assets/frames/milo-down.txt?raw';
import miloLeft from './assets/frames/milo-left.txt?raw';
import miloRight from './assets/frames/milo-right.txt?raw';
import miloUp from './assets/frames/milo-up.txt?raw';
import {
  drawYardSceneImageBase,
  drawYardSceneImageForeground,
  markYardSceneImageFallback,
  prepareYardSceneImageRuntime,
} from './environment/yardSceneImageRuntime.js';
import { ACTIONS } from './input/actions.js';
import { BrowserSemanticInput } from './input/BrowserSemanticInput.js';
import { OpeningObjectiveSequenceController } from './onboarding/openingObjectiveSequence.js';
import {
  OpeningShellController,
  type OpeningObjectiveId,
  type OpeningShellId,
} from './onboarding/openingShells.js';
import {
  TutorialPromptController,
  type TutorialPromptId,
  type TutorialPromptView,
} from './tutorial/tutorialFramework.js';
import { drawOpeningObjectiveTracker, drawOpeningShell } from './ui/openingShells.js';
import { drawTutorialPrompt } from './ui/tutorialPrompt.js';
import {
  isYardScenePositionBlocked,
  yardSceneCameraLimits,
  YSP0_YARD_SCENE_PACK,
  type YardSceneInteractionAnchor,
} from './world/yardScenePack.js';
import type { YardFacing } from './world/yard.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const PLAYER_SPEED = 180;
const RUN_SPEED_MULTIPLIER = 1.8;
const CAMERA_RESPONSE = 8;

const MILO_BASE64: Record<YardFacing, string> = {
  down: miloDown,
  left: miloLeft,
  right: miloRight,
  up: miloUp,
};

type SpikeDebug = {
  ready: boolean;
  error: string | null;
  phase: 'confirmed';
  selectedAvatarId: 'milo';
  playerName: 'Milo';
  yardRendered: boolean;
  selectionRendered: false;
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
  yardRenderer: 'scene-image';
  scenePackId: string;
  interactionCount: number;
  lastInteractionAnchor: string | null;
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

type SpikeGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: SpikeDebug;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function decodeMiloFrames(): Promise<Record<YardFacing, HTMLImageElement>> {
  const result = {} as Record<YardFacing, HTMLImageElement>;
  await Promise.all((Object.keys(MILO_BASE64) as YardFacing[]).map(async (facing) => {
    const image = new Image();
    image.src = `data:image/png;base64,${MILO_BASE64[facing].trim()}`;
    await image.decode();
    if (image.naturalWidth !== FRAME_WIDTH || image.naturalHeight !== FRAME_HEIGHT) {
      throw new Error(`Milo ${facing} frame has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`);
    }
    result[facing] = image;
  }));
  return result;
}

function nearestAnchor(x: number, y: number): YardSceneInteractionAnchor | null {
  let nearest: YardSceneInteractionAnchor | null = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const anchor of YSP0_YARD_SCENE_PACK.anchors) {
    const next = Math.hypot(anchor.position.x - x, anchor.position.y - y);
    if (next <= anchor.radius && next < distance) {
      nearest = anchor;
      distance = next;
    }
  }
  return nearest;
}

export async function startYardSceneImageSpike(): Promise<boolean> {
  const [sceneReady, frames] = await Promise.all([
    prepareYardSceneImageRuntime(),
    decodeMiloFrames().catch(() => null),
  ]);
  if (!sceneReady || !frames) {
    markYardSceneImageFallback();
    return false;
  }

  const root = document.getElementById('game') as HTMLElement | null;
  if (!root) {
    markYardSceneImageFallback();
    return false;
  }

  root.innerHTML = `<canvas id="visual-reset-stage" width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" aria-label="SplicePit YSP-0 Yard scene-image spike"></canvas>`;
  const canvas = root.querySelector<HTMLCanvasElement>('#visual-reset-stage');
  const context = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !context) {
    markYardSceneImageFallback();
    root.replaceChildren();
    return false;
  }

  context.imageSmoothingEnabled = false;
  const input = new BrowserSemanticInput();
  input.setEnabled(true);
  const tutorial = new TutorialPromptController();
  const openingSequence = new OpeningObjectiveSequenceController();
  const openingShells = new OpeningShellController();
  const player = {
    x: YSP0_YARD_SCENE_PACK.spawn.x,
    y: YSP0_YARD_SCENE_PACK.spawn.y,
    facing: 'down' as YardFacing,
    moving: false,
  };
  const camera = { x: 0, y: 0 };
  const cameraLimits = yardSceneCameraLimits(YSP0_YARD_SCENE_PACK, VIEW_WIDTH, VIEW_HEIGHT);
  camera.x = clamp(player.x - VIEW_WIDTH / 2, cameraLimits.x, cameraLimits.x + cameraLimits.width);
  camera.y = clamp(player.y - VIEW_HEIGHT / 2, cameraLimits.y, cameraLimits.y + cameraLimits.height);
  let lastRenderNow = performance.now();
  let collisionCount = 0;
  let lastCollision = false;
  let interactionCount = 0;
  let lastInteractionAnchor: string | null = null;
  const initialObjective = openingShells.currentObjective();

  const debug: SpikeDebug = {
    ready: true,
    error: null,
    phase: 'confirmed',
    selectedAvatarId: 'milo',
    playerName: 'Milo',
    yardRendered: false,
    selectionRendered: false,
    playerX: player.x,
    playerY: player.y,
    cameraX: camera.x,
    cameraY: camera.y,
    facing: player.facing,
    moving: false,
    collisionCount: 0,
    lastCollision: false,
    viewportWidth: VIEW_WIDTH,
    viewportHeight: VIEW_HEIGHT,
    worldWidth: YSP0_YARD_SCENE_PACK.world.width,
    worldHeight: YSP0_YARD_SCENE_PACK.world.height,
    yardRenderer: 'scene-image',
    scenePackId: YSP0_YARD_SCENE_PACK.id,
    interactionCount: 0,
    lastInteractionAnchor: null,
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
    openingInventory: openingShells.inventory().map((entry) => ({ id: entry.id, label: entry.label, quantity: entry.quantity })),
  };
  (globalThis as SpikeGlobal).__SPLICEPIT_VISUAL_RESET__ = debug;

  function syncTutorialDebug(prompt: TutorialPromptView | null): void {
    debug.tutorialPromptId = prompt?.id ?? null;
    debug.tutorialPromptVisible = prompt !== null;
    debug.tutorialPromptCompleting = prompt?.completing ?? false;
    debug.tutorialPromptAlpha = prompt ? Math.round(prompt.alpha * 1000) / 1000 : 0;
    debug.tutorialHintLabels = prompt?.hints.map((hint) => hint.label) ?? [];
    debug.tutorialCompleted = tutorial.completedIds();
  }

  function syncOpeningDebug(): void {
    const objective = openingShells.currentObjective();
    debug.openingSequencePromptId = openingSequence.currentPromptId();
    debug.openingSequenceComplete = openingSequence.isComplete();
    debug.activeOpeningShell = openingShells.activeShell();
    debug.objectiveId = objective.id;
    debug.objectiveTitle = objective.title;
    debug.objectiveDetail = objective.detail;
    debug.objectiveStep = openingShells.objectiveStep();
    debug.objectiveCount = openingShells.objectiveCount();
    debug.openingInventory = openingShells.inventory().map((entry) => ({ id: entry.id, label: entry.label, quantity: entry.quantity }));
  }

  function activateReadyPrompt(now: number): void {
    const promptId = openingSequence.takeReadyPrompt(now);
    if (promptId) tutorial.activate(promptId);
  }

  function progressOpening(now: number): TutorialPromptView | null {
    let prompt = tutorial.current(now);
    const expected = openingSequence.currentPromptId();
    if (prompt === null && expected && tutorial.isCompleted(expected)) {
      openingSequence.acknowledgeCompletedPrompt(expected, now);
      const objectiveId = openingSequence.objectiveId();
      if (openingShells.currentObjective().id !== objectiveId) openingShells.setObjective(objectiveId);
    }
    activateReadyPrompt(now);
    if (prompt === null) prompt = tutorial.current(now);
    if (openingSequence.isComplete() && openingShells.currentObjective().id !== 'find-master') openingShells.setObjective('find-master');
    return prompt;
  }

  function update(now: number): void {
    const dt = Math.min(0.032, Math.max(0, (now - lastRenderNow) / 1000));
    lastRenderNow = now;

    if (input.justDown(ACTIONS.INTERACT)) {
      tutorial.observeAction(ACTIONS.INTERACT, now);
      interactionCount += 1;
      lastInteractionAnchor = nearestAnchor(player.x, player.y)?.id ?? null;
      debug.interactionCount = interactionCount;
      debug.lastInteractionAnchor = lastInteractionAnchor;
    }
    if (input.justDown(ACTIONS.CONFIRM)) tutorial.observeAction(ACTIONS.CONFIRM, now);
    if (input.justDown(ACTIONS.BAG)) {
      tutorial.observeAction(ACTIONS.BAG, now);
      openingShells.toggle('bag');
      syncOpeningDebug();
      return;
    }
    if (input.justDown(ACTIONS.MAP)) {
      tutorial.observeAction(ACTIONS.MAP, now);
      openingShells.toggle('map');
      syncOpeningDebug();
      return;
    }
    if (input.justDown(ACTIONS.CANCEL) && openingShells.isOpen()) {
      tutorial.observeAction(ACTIONS.CANCEL, now);
      openingShells.closeShell();
      syncOpeningDebug();
      return;
    }
    if (openingShells.isOpen()) {
      player.moving = false;
      debug.moving = false;
      return;
    }

    let dx = 0;
    let dy = 0;
    if (input.isDown(ACTIONS.MOVE_LEFT)) dx -= 1;
    if (input.isDown(ACTIONS.MOVE_RIGHT)) dx += 1;
    if (input.isDown(ACTIONS.MOVE_UP)) dy -= 1;
    if (input.isDown(ACTIONS.MOVE_DOWN)) dy += 1;
    if (dx < 0) tutorial.observeAction(ACTIONS.MOVE_LEFT, now);
    else if (dx > 0) tutorial.observeAction(ACTIONS.MOVE_RIGHT, now);
    if (dy < 0) tutorial.observeAction(ACTIONS.MOVE_UP, now);
    else if (dy > 0) tutorial.observeAction(ACTIONS.MOVE_DOWN, now);

    player.moving = dx !== 0 || dy !== 0;
    lastCollision = false;
    if (player.moving) {
      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }
      if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) player.facing = dx < 0 ? 'left' : 'right';
      else if (dy !== 0) player.facing = dy < 0 ? 'up' : 'down';
      const distance = PLAYER_SPEED * (input.isDown(ACTIONS.RUN) ? RUN_SPEED_MULTIPLIER : 1) * dt;
      const nextX = player.x + dx * distance;
      if (!isYardScenePositionBlocked(YSP0_YARD_SCENE_PACK, nextX, player.y)) player.x = nextX;
      else { collisionCount += 1; lastCollision = true; }
      const nextY = player.y + dy * distance;
      if (!isYardScenePositionBlocked(YSP0_YARD_SCENE_PACK, player.x, nextY)) player.y = nextY;
      else { collisionCount += 1; lastCollision = true; }
    }

    const targetX = clamp(player.x - VIEW_WIDTH / 2, cameraLimits.x, cameraLimits.x + cameraLimits.width);
    const targetY = clamp(player.y - VIEW_HEIGHT / 2, cameraLimits.y, cameraLimits.y + cameraLimits.height);
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

  function drawPlayer(): void {
    context.fillStyle = 'rgba(38,56,47,0.28)';
    context.beginPath();
    context.ellipse(Math.round(player.x), Math.round(player.y - 4), 22, 7, 0, 0, Math.PI * 2);
    context.fill();
    context.drawImage(frames[player.facing], Math.round(player.x - FRAME_WIDTH / 2), Math.round(player.y - 88), FRAME_WIDTH, FRAME_HEIGHT);
  }

  function render(now: number): void {
    update(now);
    const tutorialPrompt = progressOpening(now);
    const objective = openingShells.currentObjective();
    const renderCameraX = Math.round(camera.x);
    const renderCameraY = Math.round(camera.y);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    context.save();
    context.translate(-renderCameraX, -renderCameraY);
    drawYardSceneImageBase(context);
    drawPlayer();
    drawYardSceneImageForeground(context);
    context.restore();

    drawOpeningObjectiveTracker(context, objective, openingShells.objectiveStep(), openingShells.objectiveCount());
    if (tutorialPrompt) drawTutorialPrompt(context, tutorialPrompt, VIEW_WIDTH, VIEW_HEIGHT);
    drawOpeningShell(context, {
      activeShell: openingShells.activeShell(),
      inventory: openingShells.inventory(),
      objective,
      objectiveStep: openingShells.objectiveStep(),
      objectiveCount: openingShells.objectiveCount(),
      playerX: player.x,
      playerY: player.y,
      worldWidth: YSP0_YARD_SCENE_PACK.world.width,
      worldHeight: YSP0_YARD_SCENE_PACK.world.height,
    }, VIEW_WIDTH, VIEW_HEIGHT);
    syncTutorialDebug(tutorialPrompt);
    syncOpeningDebug();
    debug.yardRendered = true;
    requestAnimationFrame(render);
  }

  const now = performance.now();
  tutorial.resetProgress();
  openingShells.reset();
  openingSequence.reset(now);
  activateReadyPrompt(now);
  syncTutorialDebug(tutorial.current(now));
  syncOpeningDebug();
  requestAnimationFrame(render);
  return true;
}
