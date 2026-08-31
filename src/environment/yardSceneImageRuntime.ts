import { environmentVisualController } from './environmentVisualContract.js';
import {
  preloadYsp8YardAssets,
  YSP3_BRIGHT_YARD_ASSET_PACK,
  YSP8_DARK_YARD_ASSET_PACK,
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
  darkAssetPackId: string;
  sourceWidth: number;
  sourceHeight: number;
  worldWidth: number;
  worldHeight: number;
  baseRendered: boolean;
  darkBaseRendered: boolean;
  darkMix: number;
  foregroundRendered: boolean;
  foregroundMode: string;
  activeOccluderIds: string[];
  occluderRenderCount: number;
  darkOccluderRenderCount: number;
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
  darkAssetPackId: YSP8_DARK_YARD_ASSET_PACK.id,
  sourceWidth: YSP6_YARD_SCENE_PACK.source.width,
  sourceHeight: YSP6_YARD_SCENE_PACK.source.height,
  worldWidth: YSP6_YARD_SCENE_PACK.world.width,
  worldHeight: YSP6_YARD_SCENE_PACK.world.height,
  baseRendered: false,
  darkBaseRendered: false,
  darkMix: 0,
  foregroundRendered: false,
  foregroundMode: YSP6_YARD_SCENE_PACK.foreground?.mode ?? 'none',
  activeOccluderIds: [],
  occluderRenderCount: 0,
  darkOccluderRenderCount: 0,
  legacyRendererRendered: false,
  renderCount: 0,
};

(globalThis as YardSceneImageGlobal).__SPLICEPIT_YARD_SCENE_IMAGE__ = debug;

let baseImage: HTMLImageElement | null = null;
let foregroundImage: HTMLImageElement | null = null;
let darkBaseImage: HTMLImageElement | null = null;

function clampMix(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export async function prepareYardSceneImageRuntime(): Promise<boolean> {
  try {
    const prepared = await preloadYsp8YardAssets();
    baseImage = prepared.base;
    foregroundImage = prepared.foreground;
    darkBaseImage = prepared.darkBase;
    debug.ready = true;
    debug.active = true;
    debug.fallback = false;
    debug.error = null;
    return true;
  } catch (error) {
    baseImage = null;
    foregroundImage = null;
    darkBaseImage = null;
    debug.error = error instanceof Error ? error.message : String(error);
    debug.fallback = true;
    debug.active = false;
    return false;
  }
}

export function drawYardSceneImageBase(ctx: CanvasRenderingContext2D, darkMix?: number): void {
  if (!baseImage || !darkBaseImage || !debug.active) return;
  const mix = clampMix(darkMix ?? environmentVisualController.sample('yard', performance.now()).darkMix);
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
  if (mix > 0) {
    ctx.globalAlpha = mix;
    ctx.drawImage(
      darkBaseImage,
      0,
      0,
      YSP6_YARD_SCENE_PACK.source.width,
      YSP6_YARD_SCENE_PACK.source.height,
      0,
      0,
      YSP6_YARD_SCENE_PACK.world.width,
      YSP6_YARD_SCENE_PACK.world.height,
    );
  }
  ctx.restore();
  debug.baseRendered = true;
  debug.darkBaseRendered = mix > 0;
  debug.darkMix = mix;
  debug.renderCount += 1;
}

/**
 * Redraw authored occluder crops from the same Bright/Dark bases used below the
 * protagonist. Using the identical blend removes bright seams during corruption
 * while preserving the YSP-6 feet-based depth contract.
 */
export function drawYardSceneImageForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  darkMix?: number,
): void {
  if (!foregroundImage || !baseImage || !darkBaseImage || !debug.active) return;
  // With the normal production call order, reuse the exact mix sampled by the
  // base pass so foreground pixels cannot drift by even one transition frame.
  const mix = clampMix(darkMix ?? debug.darkMix);
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
    ctx.globalAlpha = 1;
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
    if (mix > 0) {
      ctx.globalAlpha = mix;
      ctx.drawImage(
        darkBaseImage,
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
  }
  ctx.restore();

  debug.foregroundRendered = true;
  debug.activeOccluderIds = activeOccluders.map((occluder) => occluder.id);
  debug.occluderRenderCount += activeOccluders.length;
  if (mix > 0) debug.darkOccluderRenderCount += activeOccluders.length;
  debug.darkMix = mix;
}

export function markYardSceneImageFallback(): void {
  debug.active = false;
  debug.fallback = true;
}

export function markLegacyYardRendererRendered(): void {
  debug.legacyRendererRendered = true;
}
