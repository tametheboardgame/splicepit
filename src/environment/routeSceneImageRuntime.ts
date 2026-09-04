import { environmentVisualController } from './environmentVisualContract.js';
import {
  drawRouteForegroundDepth,
  drawRouteGroundingShadow,
} from './routeDepthGroundingRuntime.js';
import { installRouteInteriorBridgeRuntime } from './routeInteriorBridgeRuntime.js';
import {
  preloadRsp7RouteAssets,
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
  readonly darkMix: number;
  readonly darkBaseRendered: boolean;
  readonly baseRenderCount: number;
  readonly foregroundRenderCount: number;
  readonly activeOccluderIds: readonly string[];
}

type RouteSceneImageGlobal = typeof globalThis & {
  __SPLICEPIT_ROUTE_SCENE_IMAGE__?: RouteSceneImageRuntimeDebug;
};

let brightBaseImage: HTMLImageElement | null = null;
let darkBaseImage: HTMLImageElement | null = null;
let preparePromise: Promise<boolean> | null = null;
let fallback = false;
let darkMix = 0;
let darkBaseRendered = false;
let baseRenderCount = 0;
let foregroundRenderCount = 0;
let activeOccluderIds: readonly string[] = [];

const semanticInteriorBridgeReady = true;

function clampMix(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function currentRouteDarkMix(): number {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return clampMix(environmentVisualController.sample('route', now).darkMix);
}

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
  const darkReady = Boolean(darkBaseImage) && lifecycle.darkReady;
  const blockers = cutoverBlockers(brightReady, darkReady);
  return {
    ready: brightReady && darkReady,
    brightReady,
    darkReady,
    semanticInteriorBridgeReady,
    productionCutoverReady: blockers.length === 0,
    cutoverBlockers: blockers,
    fallback,
    scenePackId: RSP6_ROUTE_SCENE_PACK.id,
    darkMix,
    darkBaseRendered,
    baseRenderCount,
    foregroundRenderCount,
    activeOccluderIds,
  };
}

function syncDebug(): void {
  (globalThis as RouteSceneImageGlobal).__SPLICEPIT_ROUTE_SCENE_IMAGE__ = snapshot();
}

/** RSP-7 production preparation is atomic: both aligned bases decode or neither activates. */
export function prepareRouteSceneImageRuntime(): Promise<boolean> {
  if (preparePromise) return preparePromise;
  preparePromise = preloadRsp7RouteAssets()
    .then(({ base, darkBase }) => {
      brightBaseImage = base;
      darkBaseImage = darkBase;
      fallback = false;
      syncDebug();
      return true;
    })
    .catch(() => {
      brightBaseImage = null;
      darkBaseImage = null;
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

export function drawRouteBrightSceneImageBase(
  ctx: CanvasRenderingContext2D,
  nextDarkMix?: number,
): boolean {
  if (!brightBaseImage || !darkBaseImage) return false;
  const mix = nextDarkMix === undefined ? currentRouteDarkMix() : clampMix(nextDarkMix);
  darkMix = mix;
  darkBaseRendered = mix > 0;
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
  if (mix > 0) {
    ctx.globalAlpha = mix;
    ctx.drawImage(
      darkBaseImage,
      0,
      0,
      RSP6_ROUTE_SCENE_PACK.source.width,
      RSP6_ROUTE_SCENE_PACK.source.height,
      0,
      0,
      RSP6_ROUTE_SCENE_PACK.world.width,
      RSP6_ROUTE_SCENE_PACK.world.height,
    );
  }
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
  nextDarkMix = darkMix,
): boolean {
  if (!brightBaseImage || !darkBaseImage) return false;
  const mix = clampMix(nextDarkMix);
  darkMix = mix;
  drawRouteGroundingShadow(ctx, playerFeetX, playerFeetY);
  drawPlayer();
  activeOccluderIds = drawRouteForegroundDepth(ctx, brightBaseImage, darkBaseImage, playerFeetY, mix);
  foregroundRenderCount += 1;
  syncDebug();
  return true;
}

installRouteInteriorBridgeRuntime();
syncDebug();
