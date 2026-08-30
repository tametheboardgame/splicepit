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
  drawRouteBrightProductionArt,
  drawRouteBrightProductionArtForeground,
} from './world/routeProductionArt.js';
import {
  drawApprenticeSplicerYardBase,
  drawApprenticeSplicerYardForeground,
  isYardPositionBlocked,
  YARD_WORLD_HEIGHT,
  YARD_WORLD_WIDTH,
  type YardFacing,
} from './world/yard.js';
import {
  isYardScenePositionBlocked,
  yardSceneCameraLimits,
  yardSceneExitAt,
  YSP5_YARD_SCENE_PACK,
  type YardSceneExit,
  type YardSceneInteractionAnchor,
} from './world/yardScenePack.js';

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

type YardSceneMode = 'yard' | 'master-lab-route';

type SpikeDebug = {
  ready: boolean;
  error: string | null;
  phase: 'confirmed';
  selectedAvatarId: 'milo';
  playerName: 'Milo';
  yardRendered: boolean;
  routeRendered: boolean;
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
  sceneMode: YardSceneMode;
  interactionCount: number;
  lastInteractionAnchor: string | null;
  routeHandoffCount: number;
  routeHandoffExitId: string | null;
  routeHandoffTarget: string | null;
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
  for (const anchor of YSP5_YARD_SCENE_PACK.anchors) {
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

  root.innerHTML = `<canvas id="visual-reset-stage" width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" aria-label="SplicePit Yard scene-image proof"></canvas>`;
  const canvas = root.querySelector<HTMLCanvasElement>('#visual-reset-stage');
  const context = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !context) {
    markYardSceneImageFallback();
    root.replaceChildren();
    return false;
  }

  const stageContext: CanvasRenderingContext2D = context;
  const miloFrames: Record<YardFacing, HTMLImageElement> = frames;
  stageContext.imageSmoothingEnabled = false;
  const input = new BrowserSemanticInput();
  input.setEnabled(true);
  const tutorial = new TutorialPromptController();
  const openingSequence = new OpeningObjectiveSequenceController();
  const openingShells = new OpeningShellController();
  const player: { x: number; y: number; facing: YardFacing; moving: boolean } = {
    x: YSP5_YARD_SCENE_PACK.spawn.x,
    y: YSP5_YARD_SCENE_PACK.spawn.y,
    facing: 'down',
    moving: false,
  };
  const camera = { x: 0, y: 0 };
  let sceneMode: YardSceneMode = 'yard';
  let lastRenderNow = performance.now();
  let collisionCount = 0;
  let lastCollision = false;
  let interactionCount = 0;
  let lastInteractionAnchor: string | null = null;
  let routeHandoffCount = 0;
  let routeHandoffExitId: string | null = null;
  let routeHandoffTarget: string | null = null;
  const initialObjective = openingShells.currentObjective();

  const debug: SpikeDebug = {
    ready: true,
    error: null,
    phase: 'confirmed',
    selectedAvatarId: 'milo',
    playerName: 'Milo',
    yardRendered: false,
    routeRendered: false,
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
    worldWidth: YSP5_YARD_SCENE_PACK.world.width,
    worldHeight: YSP5_YARD_SCENE_PACK.world.height,
    yardRenderer: 'scene-image',
    scenePackId: YSP5_YARD_SCENE_PACK.id,
    sceneMode,
    interactionCount: 0,
    lastInteractionAnchor: null,
    routeHandoffCount: 0,
    routeHandoffExitId: null,
    routeHandoffTarget: null,
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

  function currentCameraLimits(): { x: number; y: number; width: number; height: number } {
    if (sceneMode === 'yard') return yardSceneCameraLimits(YSP5_YARD_SCENE_PACK, VIEW_WIDTH, VIEW_HEIGHT);
    return {
      x: 0,
      y: 0,
      width: Math.max(0, YARD_WORLD_WIDTH - VIEW_WIDTH),
      height: Math.max(0, YARD_WORLD_HEIGHT - VIEW_HEIGHT),
    };
  }

  function enterMasterLabRoute(exit: YardSceneExit): void {
    if (sceneMode !== 'yard' || !exit.targetEntry) return;
    sceneMode = 'master-lab-route';
    routeHandoffCount += 1;
    routeHandoffExitId = exit.id;
    routeHandoffTarget = exit.target;
    player.x = exit.targetEntry.x;
    player.y = exit.targetEntry.y;
    player.facing = 'right';
    player.moving = false;
    const limits = currentCameraLimits();
    camera.x = clamp(player.x - VIEW_WIDTH / 2, limits.x, limits.x + limits.width);
    camera.y = clamp(player.y - VIEW_HEIGHT / 2, limits.y, limits.y + limits.height);
    debug.sceneMode = sceneMode;
    debug.routeHandoffCount = routeHandoffCount;
    debug.routeHandoffExitId = routeHandoffExitId;
    debug.routeHandoffTarget = routeHandoffTarget;
    debug.worldWidth = YARD_WORLD_WIDTH;
    debug.worldHeight = YARD_WORLD_HEIGHT;
    debug.playerX = player.x;
    debug.playerY = player.y;
    debug.cameraX = camera.x;
    debug.cameraY = camera.y;
  }

  function update(now: number): void {
    const dt = Math.min(0.032, Math.max(0, (now - lastRenderNow) / 1000));
    lastRenderNow = now;

    if (input.justDown(ACTIONS.INTERACT)) {
      tutorial.observeAction(ACTIONS.INTERACT, now);
      interactionCount += 1;
      lastInteractionAnchor = sceneMode === 'yard' ? nearestAnchor(player.x, player.y)?.id ?? null : null;
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
      const xBlocked = sceneMode === 'yard'
        ? isYardScenePositionBlocked(YSP5_YARD_SCENE_PACK, nextX, player.y)
        : isYardPositionBlocked(nextX, player.y);
      if (!xBlocked) player.x = nextX;
      else { collisionCount += 1; lastCollision = true; }
      const nextY = player.y + dy * distance;
      const yBlocked = sceneMode === 'yard'
        ? isYardScenePositionBlocked(YSP5_YARD_SCENE_PACK, player.x, nextY)
        : isYardPositionBlocked(player.x, nextY);
      if (!yBlocked) player.y = nextY;
      else { collisionCount += 1; lastCollision = true; }
    }

    if (sceneMode === 'yard' && openingShells.currentObjective().id === 'find-master') {
      const exit = yardSceneExitAt(YSP5_YARD_SCENE_PACK, player.x, player.y);
      if (exit?.targetEntry) enterMasterLabRoute(exit);
    }

    const limits = currentCameraLimits();
    const targetX = clamp(player.x - VIEW_WIDTH / 2, limits.x, limits.x + limits.width);
    const targetY = clamp(player.y - VIEW_HEIGHT / 2, limits.y, limits.y + limits.height);
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
    debug.sceneMode = sceneMode;
  }

  function drawPlayer(): void {
    stageContext.fillStyle = 'rgba(38,56,47,0.28)';
    stageContext.beginPath();
    stageContext.ellipse(Math.round(player.x), Math.round(player.y - 4), 22, 7, 0, 0, Math.PI * 2);
    stageContext.fill();
    stageContext.drawImage(miloFrames[player.facing], Math.round(player.x - FRAME_WIDTH / 2), Math.round(player.y - 88), FRAME_WIDTH, FRAME_HEIGHT);
  }

  function renderWorld(now: number): void {
    if (sceneMode === 'yard') {
      drawYardSceneImageBase(stageContext);
      drawPlayer();
      drawYardSceneImageForeground(stageContext);
      debug.yardRendered = true;
      debug.routeRendered = false;
      return;
    }

    drawApprenticeSplicerYardBase(stageContext, now, player.y);
    drawRouteBrightProductionArt(stageContext, now);
    drawPlayer();
    drawRouteBrightProductionArtForeground(stageContext, player.y);
    drawApprenticeSplicerYardForeground(stageContext, player.y);
    debug.yardRendered = false;
    debug.routeRendered = true;
  }

  function render(now: number): void {
    update(now);
    const tutorialPrompt = progressOpening(now);
    const objective = openingShells.currentObjective();
    const renderCameraX = Math.round(camera.x);
    const renderCameraY = Math.round(camera.y);

    stageContext.setTransform(1, 0, 0, 1, 0, 0);
    stageContext.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    stageContext.save();
    stageContext.translate(-renderCameraX, -renderCameraY);
    renderWorld(now);
    stageContext.restore();

    drawOpeningObjectiveTracker(stageContext, objective, openingShells.objectiveStep(), openingShells.objectiveCount());
    if (tutorialPrompt) drawTutorialPrompt(stageContext, tutorialPrompt, VIEW_WIDTH, VIEW_HEIGHT);
    drawOpeningShell(stageContext, {
      activeShell: openingShells.activeShell(),
      inventory: openingShells.inventory(),
      objective,
      objectiveStep: openingShells.objectiveStep(),
      objectiveCount: openingShells.objectiveCount(),
      playerX: player.x,
      playerY: player.y,
      worldWidth: sceneMode === 'yard' ? YSP5_YARD_SCENE_PACK.world.width : YARD_WORLD_WIDTH,
      worldHeight: sceneMode === 'yard' ? YSP5_YARD_SCENE_PACK.world.height : YARD_WORLD_HEIGHT,
    }, VIEW_WIDTH, VIEW_HEIGHT);
    syncTutorialDebug(tutorialPrompt);
    syncOpeningDebug();
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
