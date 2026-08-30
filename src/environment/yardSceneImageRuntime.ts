import {
  preloadYsp3BrightYardAssets,
  YSP3_BRIGHT_YARD_ASSET_PACK,
} from './yardSceneAssetPack.js';
import {
  yardSceneForegroundOccluders,
  YSP6_YARD_SCENE_PACK,
} from '../world/yardScenePack.js';

type YardSceneImageDebug = {
  requested: boolean;
  ready: boolean;
  active: boolean;
  fallback: boolean;
  error: string | null;
  scenePackId: string;
  assetPackId: string;
  sourceWidth: number;
  sourceHeight: number;
  worldWidth: number;
  worldHeight: number;
  baseRendered: boolean;
  foregroundRendered: boolean;
  foregroundMode: string;
  activeOccluderIds: string[];
  occluderRenderCount: number;
  legacyRendererRendered: boolean;
  renderCount: number;
};

type YardSceneImageGlobal = typeof globalThis & {
  __SPLICEPIT_YARD_SCENE_IMAGE__?: YardSceneImageDebug;
};

const debug: YardSceneImageDebug = {
  requested: true,
  ready: false,
  active: false,
  fallback: false,
  error: null,
  scenePackId: YSP6_YARD_SCENE_PACK.id,
  assetPackId: YSP3_BRIGHT_YARD_ASSET_PACK.id,
  sourceWidth: YSP6_YARD_SCENE_PACK.source.width,
  sourceHeight: YSP6_YARD_SCENE_PACK.source.height,
  worldWidth: YSP6_YARD_SCENE_PACK.world.width,
  worldHeight: YSP6_YARD_SCENE_PACK.world.height,
  baseRendered: false,
  foregroundRendered: false,
  foregroundMode: YSP6_YARD_SCENE_PACK.foreground?.mode ?? 'none',
  activeOccluderIds: [],
  occluderRenderCount: 0,
  legacyRendererRendered: false,
  renderCount: 0,
};

(globalThis as YardSceneImageGlobal).__SPLICEPIT_YARD_SCENE_IMAGE__ = debug;

let baseImage: HTMLImageElement | null = null;
let foregroundImage: HTMLImageElement | null = null;

export async function prepareYardSceneImageRuntime(): Promise<boolean> {
  try {
    const prepared = await preloadYsp3BrightYardAssets();
    baseImage = prepared.base;
    foregroundImage = prepared.foreground;
    debug.ready = true;
    debug.active = true;
    debug.fallback = false;
    debug.error = null;
    return true;
  } catch (error) {
    baseImage = null;
    foregroundImage = null;
    debug.error = error instanceof Error ? error.message : String(error);
    debug.fallback = true;
    debug.active = false;
    return false;
  }
}

export function drawYardSceneImageBase(ctx: CanvasRenderingContext2D): void {
  if (!baseImage || !debug.active) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    baseImage,
    0,
    0,
    YSP6_YARD_SCENE_PACK.source.width,
    YSP6_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP6_YARD_SCENE_PACK.world.width,
    YSP6_YARD_SCENE_PACK.world.height,
  );
  ctx.restore();
  debug.baseRendered = true;
  debug.renderCount += 1;
}

/**
 * Draw the transparent staging foreground first, then redraw authored crops from
 * the exact already-decoded Bright Yard base over the protagonist when their
 * feet are behind those features. No new foreground artwork is generated and
 * there is no colour/compression mismatch at the occlusion edge.
 */
export function drawYardSceneImageForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  if (!foregroundImage || !baseImage || !debug.active) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    foregroundImage,
    0,
    0,
    YSP6_YARD_SCENE_PACK.source.width,
    YSP6_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP6_YARD_SCENE_PACK.world.width,
    YSP6_YARD_SCENE_PACK.world.height,
  );

  const activeOccluders = yardSceneForegroundOccluders(YSP6_YARD_SCENE_PACK, playerFeetY);
  for (const occluder of activeOccluders) {
    const bounds = occluder.bounds;
    ctx.drawImage(
      baseImage,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
  }
  ctx.restore();

  debug.foregroundRendered = true;
  debug.activeOccluderIds = activeOccluders.map((occluder) => occluder.id);
  debug.occluderRenderCount += activeOccluders.length;
}

export function markYardSceneImageFallback(): void {
  debug.active = false;
  debug.fallback = true;
}

export function markLegacyYardRendererRendered(): void {
  debug.legacyRendererRendered = true;
}
