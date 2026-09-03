import {
  environmentVisualController,
  type EnvironmentVisualSample,
} from './environment/environmentVisualContract.js';
import {
  drawRouteBrightSceneImageBase,
  drawRouteBrightSceneImagePlayerLayer,
  markRouteSceneImageFallback,
  prepareRouteSceneImageRuntime,
  routeSceneProductionCutoverReady,
} from './environment/routeSceneImageRuntime.js';
import {
  drawYardSceneImageBase,
  drawYardSceneImageForeground,
  markYardSceneImageFallback,
  prepareYardSceneImageRuntime,
} from './environment/yardSceneImageRuntime.js';
import { syncRouteProductionArtDebug } from './environment/routeProductionArtRuntime.js';
import { syncYardProductionArtDebug } from './environment/yardProductionArtRuntime.js';
import { ACTIONS } from './input/actions.js';
import { BrowserSemanticInput } from './input/BrowserSemanticInput.js';
import { OpeningObjectiveSequenceController } from './onboarding/openingObjectiveSequence.js';
import {
  OpeningShellController,
  type OpeningObjectiveId,
  type OpeningShellId,
} from './onboarding/openingShells.js';
import type { ProtagonistId } from './player/protagonists.js';
import {
  TutorialPromptController,
  type TutorialPromptId,
  type TutorialPromptView,
} from './tutorial/tutorialFramework.js';
import { drawOpeningObjectiveTracker, drawOpeningShell } from './ui/openingShells.js';
import { drawTutorialPrompt } from './ui/tutorialPrompt.js';
import { RSP6_ROUTE_SCENE_PACK } from './world/routeDepthGrounding.js';
import {
  RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT,
  isRouteProductionPositionBlocked,
  routeProductionCameraLimits,
  routeProductionEntryFromYard,
  routeProductionInteractionAt,
  routeProductionReturnFromInterior,
  yardProductionReturnFromRoute,
} from './world/routeProductionCutover.js';
import {
  ROUTE_INTERIOR_RETURN_EVENT,
  routeInteriorReturnDetail,
} from './world/routeRuntimeBridge.js';
import type { RouteInteractionTarget } from './world/routeStoryIntegration.js';
import {
  drawRouteBrightProductionArt,
  drawRouteBrightProductionArtForeground,
  drawRouteDarkProductionArt,
  drawRouteDarkProductionArtForeground,
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
  YSP6_YARD_SCENE_PACK,
  type YardSceneExit,
  type YardSceneInteractionAnchor,
} from './world/yardScenePack.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
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

type YardSceneMode = 'yard' | 'master-lab-route';

export type ProductionYardRuntimeOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly selectedAvatarId: ProtagonistId;
  readonly playerName: string;
  readonly frames: Record<YardFacing, HTMLImageElement>;
  readonly loadedFromSave: boolean;
  readonly saved: boolean;
  readonly onExitToSelection: () => void;
};

export type ProductionYardRuntimeHandle = {
  stop(): void;
};

type ProductionYardDebug = {
  ready: boolean;
  error: string | null;
  phase: 'confirmed';
  selectedAvatarId: ProtagonistId;
  playerName: string;
  loadedFromSave: boolean;
  saved: boolean;
  frame: number;
  yardRendered: boolean;
  routeRendered: boolean;
  selectionRendered: false;
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
  yardRenderer: 'scene-image';
  scenePackId: string;
  sceneMode: YardSceneMode;
  routeRenderer: 'legacy' | 'scene-image';
  routeScenePackId: string | null;
  routeProductionCutoverReady: boolean;
  routeInteractionTarget: RouteInteractionTarget | null;
  routeInteractionPrompt: string | null;
  interactionCount: number;
  lastInteractionAnchor: string | null;
  routeHandoffCount: number;
  routeHandoffExitId: string | null;
  routeHandoffTarget: string | null;
  groundShadowAlpha: number;
  groundShadowRadiusX: number;
  groundShadowRadiusY: number;
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

type ProductionYardGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: ProductionYardDebug;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function nearestAnchor(x: number, y: number): YardSceneInteractionAnchor | null {
  let nearest: YardSceneInteractionAnchor | null = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const anchor of YSP6_YARD_SCENE_PACK.anchors) {
    const next = Math.hypot(anchor.position.x - x, anchor.position.y - y);
    if (next <= anchor.radius && next < distance) {
      nearest = anchor;
      distance = next;
    }
  }
  return nearest;
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
  ctx.drawImage(
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

function drawAnimatedCharacter(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  destX: number,
  destY: number,
  animationFrame: number,
): void {
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
  drawSection(
    ctx,
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
  drawSection(ctx, image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
}

export async function startProductionYardRuntime(
  options: ProductionYardRuntimeOptions,
): Promise<ProductionYardRuntimeHandle | null> {
  const sceneReady = await prepareYardSceneImageRuntime();
  if (!sceneReady) {
    markYardSceneImageFallback();
    return null;
  }

  const routeScenePrepared = await prepareRouteSceneImageRuntime();
  const useAuthoredRoute = routeScenePrepared && routeSceneProductionCutoverReady();
  if (!useAuthoredRoute) markRouteSceneImageFallback();

  const stageContext = options.context;
  const stageCanvas = options.canvas;
  stageCanvas.width = VIEW_WIDTH;
  stageCanvas.height = VIEW_HEIGHT;
  stageCanvas.setAttribute('aria-label', 'SplicePit Apprentice Splicer Yard');
  stageContext.imageSmoothingEnabled = false;

  const input = new BrowserSemanticInput();
  input.setEnabled(true);
  const tutorial = new TutorialPromptController();
  const openingSequence = new OpeningObjectiveSequenceController();
  const openingShells = new OpeningShellController();
  const player: { x: number; y: number; facing: YardFacing; moving: boolean } = {
    x: YSP6_YARD_SCENE_PACK.spawn.x,
    y: YSP6_YARD_SCENE_PACK.spawn.y,
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
  let active = true;
  let frameHandle = 0;
  const initialObjective = openingShells.currentObjective();
  const yardShadow = YSP6_YARD_SCENE_PACK.grounding?.shadow ?? {
    offsetY: -4,
    radiusX: 20,
    radiusY: 6,
    alpha: 0.24,
  };

  const debug: ProductionYardDebug = {
    ready: true,
    error: null,
    phase: 'confirmed',
    selectedAvatarId: options.selectedAvatarId,
    playerName: options.playerName,
    loadedFromSave: options.loadedFromSave,
    saved: options.saved,
    frame: 0,
    yardRendered: false,
    routeRendered: false,
    selectionRendered: false,
    selectionPresentation: 'yard-arrival',
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
    worldWidth: YSP6_YARD_SCENE_PACK.world.width,
    worldHeight: YSP6_YARD_SCENE_PACK.world.height,
    yardRenderer: 'scene-image',
    scenePackId: YSP6_YARD_SCENE_PACK.id,
    sceneMode,
    routeRenderer: useAuthoredRoute ? 'scene-image' : 'legacy',
    routeScenePackId: useAuthoredRoute ? RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT.scenePackId : null,
    routeProductionCutoverReady: useAuthoredRoute,
    routeInteractionTarget: null,
    routeInteractionPrompt: null,
    interactionCount: 0,
    lastInteractionAnchor: null,
    routeHandoffCount: 0,
    routeHandoffExitId: null,
    routeHandoffTarget: null,
    groundShadowAlpha: yardShadow.alpha,
    groundShadowRadiusX: yardShadow.radiusX,
    groundShadowRadiusY: yardShadow.radiusY,
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
  (globalThis as ProductionYardGlobal).__SPLICEPIT_VISUAL_RESET__ = debug;

  function syncRouteInteractionDebug(): void {
    if (!useAuthoredRoute || sceneMode !== 'master-lab-route') {
      debug.routeInteractionTarget = null;
      debug.routeInteractionPrompt = null;
      return;
    }
    const interaction = routeProductionInteractionAt(player.x, player.y);
    debug.routeInteractionTarget = interaction?.target ?? null;
    debug.routeInteractionPrompt = interaction?.prompt ?? null;
  }

  function currentCameraLimits(): { x: number; y: number; width: number; height: number } {
    if (sceneMode === 'yard') return yardSceneCameraLimits(YSP6_YARD_SCENE_PACK, VIEW_WIDTH, VIEW_HEIGHT);
    if (useAuthoredRoute) return routeProductionCameraLimits(VIEW_WIDTH, VIEW_HEIGHT);
    return {
      x: 0,
      y: 0,
      width: Math.max(0, YARD_WORLD_WIDTH - VIEW_WIDTH),
      height: Math.max(0, YARD_WORLD_HEIGHT - VIEW_HEIGHT),
    };
  }

  function snapCameraToPlayer(): void {
    const limits = currentCameraLimits();
    camera.x = clamp(player.x - VIEW_WIDTH / 2, limits.x, limits.x + limits.width);
    camera.y = clamp(player.y - VIEW_HEIGHT / 2, limits.y, limits.y + limits.height);
  }

  function syncSceneDebug(): void {
    debug.sceneMode = sceneMode;
    debug.scenePackId = sceneMode === 'yard' ? YSP6_YARD_SCENE_PACK.id : useAuthoredRoute ? RSP6_ROUTE_SCENE_PACK.id : YSP6_YARD_SCENE_PACK.id;
    debug.worldWidth = sceneMode === 'yard'
      ? YSP6_YARD_SCENE_PACK.world.width
      : useAuthoredRoute
        ? RSP6_ROUTE_SCENE_PACK.world.width
        : YARD_WORLD_WIDTH;
    debug.worldHeight = sceneMode === 'yard'
      ? YSP6_YARD_SCENE_PACK.world.height
      : useAuthoredRoute
        ? RSP6_ROUTE_SCENE_PACK.world.height
        : YARD_WORLD_HEIGHT;
    debug.playerX = Math.round(player.x * 10) / 10;
    debug.playerY = Math.round(player.y * 10) / 10;
    debug.cameraX = Math.round(camera.x * 10) / 10;
    debug.cameraY = Math.round(camera.y * 10) / 10;
    syncRouteInteractionDebug();
  }

  function stop(): void {
    if (!active) return;
    active = false;
    input.setEnabled(false);
    window.removeEventListener(ROUTE_INTERIOR_RETURN_EVENT, onRouteInteriorReturn);
    cancelAnimationFrame(frameHandle);
  }

  function exitToSelection(): void {
    stop();
    options.onExitToSelection();
  }

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
    debug.openingInventory = openingShells.inventory().map((entry) => ({
      id: entry.id,
      label: entry.label,
      quantity: entry.quantity,
    }));
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
    if (openingSequence.isComplete() && openingShells.currentObjective().id !== 'find-master') {
      openingShells.setObjective('find-master');
    }
    return prompt;
  }

  function enterMasterLabRoute(exit: YardSceneExit): void {
    if (sceneMode !== 'yard') return;
    const targetEntry = useAuthoredRoute ? routeProductionEntryFromYard() : exit.targetEntry;
    if (!targetEntry) return;
    sceneMode = 'master-lab-route';
    routeHandoffCount += 1;
    routeHandoffExitId = exit.id;
    routeHandoffTarget = exit.target;
    player.x = targetEntry.x;
    player.y = targetEntry.y;
    player.facing = 'right';
    player.moving = false;
    snapCameraToPlayer();
    debug.routeHandoffCount = routeHandoffCount;
    debug.routeHandoffExitId = routeHandoffExitId;
    debug.routeHandoffTarget = routeHandoffTarget;
    syncSceneDebug();
  }

  function returnToYardFromRoute(): void {
    if (sceneMode !== 'master-lab-route') return;
    const returnPosition = yardProductionReturnFromRoute();
    sceneMode = 'yard';
    player.x = returnPosition.x;
    player.y = returnPosition.y;
    player.facing = 'up';
    player.moving = false;
    snapCameraToPlayer();
    syncSceneDebug();
  }

  function onRouteInteriorReturn(event: Event): void {
    if (!active || !useAuthoredRoute || sceneMode !== 'master-lab-route') return;
    const detail = routeInteriorReturnDetail(event);
    if (!detail) return;
    const returnPosition = routeProductionReturnFromInterior(detail.target);
    player.x = returnPosition.x;
    player.y = returnPosition.y;
    player.facing = detail.target === 'master-lab' ? 'down' : 'up';
    player.moving = false;
    snapCameraToPlayer();
    syncSceneDebug();
  }

  function update(now: number): void {
    const dt = Math.min(0.032, Math.max(0, (now - lastRenderNow) / 1000));
    lastRenderNow = now;

    if (input.justDown(ACTIONS.INTERACT)) {
      tutorial.observeAction(ACTIONS.INTERACT, now);
      interactionCount += 1;
      const routeInteraction = useAuthoredRoute && sceneMode === 'master-lab-route'
        ? routeProductionInteractionAt(player.x, player.y)
        : null;
      lastInteractionAnchor = sceneMode === 'yard'
        ? nearestAnchor(player.x, player.y)?.id ?? null
        : routeInteraction?.id ?? null;
      debug.interactionCount = interactionCount;
      debug.lastInteractionAnchor = lastInteractionAnchor;
      if (openingSequence.currentPromptId() === 'interact') {
        player.moving = false;
        debug.moving = false;
        return;
      }
      if (routeInteraction?.target === 'apprentice-yard') {
        returnToYardFromRoute();
        return;
      }
    }
    if (input.justDown(ACTIONS.CONFIRM)) {
      tutorial.observeAction(ACTIONS.CONFIRM, now);
      if (openingSequence.currentPromptId() === 'confirm-cancel') {
        player.moving = false;
        debug.moving = false;
        return;
      }
    }
    if (input.justDown(ACTIONS.BAG)) {
      tutorial.observeAction(ACTIONS.BAG, now);
      openingShells.toggle('bag');
      player.moving = false;
      syncOpeningDebug();
      return;
    }
    if (input.justDown(ACTIONS.MAP)) {
      tutorial.observeAction(ACTIONS.MAP, now);
      openingShells.toggle('map');
      player.moving = false;
      syncOpeningDebug();
      return;
    }
    if (input.justDown(ACTIONS.CANCEL)) {
      tutorial.observeAction(ACTIONS.CANCEL, now);
      const teachingConfirmCancel = openingSequence.currentPromptId() === 'confirm-cancel';
      if (openingShells.isOpen()) {
        openingShells.closeShell();
        player.moving = false;
        syncOpeningDebug();
        return;
      }
      if (teachingConfirmCancel) {
        player.moving = false;
        return;
      }
      exitToSelection();
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
        ? isYardScenePositionBlocked(YSP6_YARD_SCENE_PACK, nextX, player.y)
        : useAuthoredRoute
          ? isRouteProductionPositionBlocked(nextX, player.y)
          : isYardPositionBlocked(nextX, player.y);
      if (!xBlocked) player.x = nextX;
      else {
        collisionCount += 1;
        lastCollision = true;
      }

      const nextY = player.y + dy * distance;
      const yBlocked = sceneMode === 'yard'
        ? isYardScenePositionBlocked(YSP6_YARD_SCENE_PACK, player.x, nextY)
        : useAuthoredRoute
          ? isRouteProductionPositionBlocked(player.x, nextY)
          : isYardPositionBlocked(player.x, nextY);
      if (!yBlocked) player.y = nextY;
      else {
        collisionCount += 1;
        lastCollision = true;
      }
    }

    if (sceneMode === 'yard' && openingShells.currentObjective().id === 'find-master') {
      const exit = yardSceneExitAt(YSP6_YARD_SCENE_PACK, player.x, player.y);
      if (exit && (useAuthoredRoute || exit.targetEntry)) enterMasterLabRoute(exit);
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
    syncRouteInteractionDebug();
  }

  function drawPlayer(now: number, includeGroundShadow = true): void {
    if (includeGroundShadow) {
      const shadow = sceneMode === 'yard'
        ? yardShadow
        : { offsetY: -4, radiusX: 22, radiusY: 7, alpha: 0.28 };
      stageContext.fillStyle = `rgba(31, 42, 36, ${shadow.alpha})`;
      stageContext.beginPath();
      stageContext.ellipse(
        Math.round(player.x),
        Math.round(player.y + shadow.offsetY),
        shadow.radiusX,
        shadow.radiusY,
        0,
        0,
        Math.PI * 2,
      );
      stageContext.fill();
    }

    const animationFrame = player.moving
      ? WALK_SEQUENCE[Math.floor(now / WALK_FRAME_MS) % WALK_SEQUENCE.length]
      : 0;
    debug.frame = animationFrame;
    drawAnimatedCharacter(
      stageContext,
      options.frames[player.facing],
      Math.round(player.x - FRAME_WIDTH / 2),
      Math.round(player.y - 88),
      animationFrame,
    );
  }

  function drawRouteProductionBase(now: number, sample: EnvironmentVisualSample): void {
    drawRouteBrightProductionArt(stageContext, now);
    if (sample.darkMix <= 0) return;
    stageContext.save();
    stageContext.globalAlpha = sample.darkMix;
    drawRouteDarkProductionArt(stageContext, now);
    stageContext.restore();
  }

  function drawRouteProductionForeground(sample: EnvironmentVisualSample): void {
    drawRouteBrightProductionArtForeground(stageContext, player.y);
    if (sample.darkMix <= 0) return;
    stageContext.save();
    stageContext.globalAlpha = sample.darkMix;
    drawRouteDarkProductionArtForeground(stageContext, player.y);
    stageContext.restore();
  }

  function renderWorld(now: number): void {
    if (sceneMode === 'yard') {
      const yardSample = environmentVisualController.sample('yard', now);
      drawYardSceneImageBase(stageContext);
      drawPlayer(now);
      drawYardSceneImageForeground(stageContext, player.y);
      syncYardProductionArtDebug(yardSample, true);
      syncRouteProductionArtDebug(environmentVisualController.sample('route', now), false);
      debug.yardRendered = true;
      debug.routeRendered = false;
      return;
    }

    const routeSample = environmentVisualController.sample('route', now);
    if (useAuthoredRoute) {
      drawRouteBrightSceneImageBase(stageContext);
      drawRouteBrightSceneImagePlayerLayer(stageContext, player.x, player.y, () => drawPlayer(now, false));
      syncYardProductionArtDebug(environmentVisualController.sample('yard', now), false);
      syncRouteProductionArtDebug(routeSample, false);
      debug.yardRendered = false;
      debug.routeRendered = true;
      return;
    }

    drawApprenticeSplicerYardBase(stageContext, now, player.y);
    drawRouteProductionBase(now, routeSample);
    drawPlayer(now);
    drawRouteProductionForeground(routeSample);
    drawApprenticeSplicerYardForeground(stageContext, player.y);
    syncYardProductionArtDebug(environmentVisualController.sample('yard', now), false);
    syncRouteProductionArtDebug(routeSample, true);
    debug.yardRendered = false;
    debug.routeRendered = true;
  }

  function render(now: number): void {
    if (!active) return;
    update(now);
    if (!active) return;

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

    drawOpeningObjectiveTracker(
      stageContext,
      objective,
      openingShells.objectiveStep(),
      openingShells.objectiveCount(),
    );
    if (tutorialPrompt) drawTutorialPrompt(stageContext, tutorialPrompt, VIEW_WIDTH, VIEW_HEIGHT);
    drawOpeningShell(stageContext, {
      activeShell: openingShells.activeShell(),
      inventory: openingShells.inventory(),
      objective,
      objectiveStep: openingShells.objectiveStep(),
      objectiveCount: openingShells.objectiveCount(),
      playerX: player.x,
      playerY: player.y,
      worldWidth: sceneMode === 'yard'
        ? YSP6_YARD_SCENE_PACK.world.width
        : useAuthoredRoute
          ? RSP6_ROUTE_SCENE_PACK.world.width
          : YARD_WORLD_WIDTH,
      worldHeight: sceneMode === 'yard'
        ? YSP6_YARD_SCENE_PACK.world.height
        : useAuthoredRoute
          ? RSP6_ROUTE_SCENE_PACK.world.height
          : YARD_WORLD_HEIGHT,
    }, VIEW_WIDTH, VIEW_HEIGHT);
    syncTutorialDebug(tutorialPrompt);
    syncOpeningDebug();
    frameHandle = requestAnimationFrame(render);
  }

  window.addEventListener(ROUTE_INTERIOR_RETURN_EVENT, onRouteInteriorReturn);
  const now = performance.now();
  tutorial.resetProgress();
  openingShells.reset();
  openingSequence.reset(now);
  activateReadyPrompt(now);
  syncTutorialDebug(tutorial.current(now));
  syncOpeningDebug();
  frameHandle = requestAnimationFrame(render);

  return { stop };
}
