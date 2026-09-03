import {
  drawRouteBrightForegroundDepth,
  drawRouteGroundingShadow,
} from './routeDepthGroundingRuntime.js';
import {
  preloadRsp3BrightRouteAsset,
  rsp7RouteAssetLifecycleDebug,
} from './routeSceneAssetPack.js';
import { RSP6_ROUTE_SCENE_PACK } from '../world/routeDepthGrounding.js';

export type RouteSceneCutoverBlocker = 'bright-route' | 'dark-route' | 'semantic-interior-bridge';

export interface RouteSceneImageRuntimeDebug {
  readonly ready: boolean;
  readonly brightReady: boolean;
  readonly darkReady: boolean;
  readonly semanticInteriorBridgeReady: boolean;
  readonly productionCutoverReady: boolean;
  readonly cutoverBlockers: readonly RouteSceneCutoverBlocker[];
  readonly fallback: boolean;
  readonly scenePackId: string;
  readonly baseRenderCount: number;
  readonly foregroundRenderCount: number;
  readonly activeOccluderIds: readonly string[];
}

type RouteSceneImageGlobal = typeof globalThis & {
  __SPLICEPIT_ROUTE_SCENE_IMAGE__?: RouteSceneImageRuntimeDebug;
};

let brightBaseImage: HTMLImageElement | null = null;
let preparePromise: Promise<boolean> | null = null;
let fallback = false;
let baseRenderCount = 0;
let foregroundRenderCount = 0;
let activeOccluderIds: readonly string[] = [];

// RSP-7 must not cut over merely because art becomes available. The existing
// Master Lab and Local Pit overlays still need to consume the semantic Route
// entry/return bridge before the authored Route can become production-active.
const semanticInteriorBridgeReady = false;

function cutoverBlockers(brightReady: boolean, darkReady: boolean): RouteSceneCutoverBlocker[] {
  const blockers: RouteSceneCutoverBlocker[] = [];
  if (!brightReady) blockers.push('bright-route');
  if (!darkReady) blockers.push('dark-route');
  if (!semanticInteriorBridgeReady) blockers.push('semantic-interior-bridge');
  return blockers;
}

function snapshot(): RouteSceneImageRuntimeDebug {
  const lifecycle = rsp7RouteAssetLifecycleDebug();
  const brightReady = Boolean(brightBaseImage);
  const blockers = cutoverBlockers(brightReady, lifecycle.darkReady);
  return {
    ready: brightReady,
    brightReady,
    darkReady: lifecycle.darkReady,
    semanticInteriorBridgeReady,
    productionCutoverReady: blockers.length === 0,
    cutoverBlockers: blockers,
    fallback,
    scenePackId: RSP6_ROUTE_SCENE_PACK.id,
    baseRenderCount,
    foregroundRenderCount,
    activeOccluderIds,
  };
}

function syncDebug(): void {
  (globalThis as RouteSceneImageGlobal).__SPLICEPIT_ROUTE_SCENE_IMAGE__ = snapshot();
}

/**
 * Bright-only staging preparation for RSP-7. This deliberately returns true as
 * soon as the approved Bright raster is decoded, but productionCutoverReady
 * remains false until the complete Dark asset and semantic interior bridge are
 * both ready as part of the same production replacement.
 */
export function prepareRouteSceneImageRuntime(): Promise<boolean> {
  if (preparePromise) return preparePromise;
  preparePromise = preloadRsp3BrightRouteAsset()
    .then(({ base }) => {
      brightBaseImage = base;
      fallback = false;
      syncDebug();
      return true;
    })
    .catch(() => {
      brightBaseImage = null;
      fallback = true;
      preparePromise = null;
      syncDebug();
      return false;
    });
  return preparePromise;
}

export function routeSceneProductionCutoverReady(): boolean {
  return snapshot().productionCutoverReady;
}

export function routeSceneProductionCutoverBlockers(): readonly RouteSceneCutoverBlocker[] {
  return snapshot().cutoverBlockers;
}

export function markRouteSceneImageFallback(): void {
  fallback = true;
  syncDebug();
}

export function drawRouteBrightSceneImageBase(ctx: CanvasRenderingContext2D): boolean {
  if (!brightBaseImage) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    brightBaseImage,
    0,
    0,
    RSP6_ROUTE_SCENE_PACK.source.width,
    RSP6_ROUTE_SCENE_PACK.source.height,
    0,
    0,
    RSP6_ROUTE_SCENE_PACK.world.width,
    RSP6_ROUTE_SCENE_PACK.world.height,
  );
  ctx.restore();
  baseRenderCount += 1;
  syncDebug();
  return true;
}

export function drawRouteBrightSceneImagePlayerLayer(
  ctx: CanvasRenderingContext2D,
  playerFeetX: number,
  playerFeetY: number,
  drawPlayer: () => void,
): boolean {
  if (!brightBaseImage) return false;
  drawRouteGroundingShadow(ctx, playerFeetX, playerFeetY);
  drawPlayer();
  activeOccluderIds = drawRouteBrightForegroundDepth(ctx, brightBaseImage, playerFeetY);
  foregroundRenderCount += 1;
  syncDebug();
  return true;
}

syncDebug();
