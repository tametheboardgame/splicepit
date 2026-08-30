import {
  preloadYsp3BrightYardAssets,
  YSP3_BRIGHT_YARD_ASSET_PACK,
} from './yardSceneAssetPack.js';
import { YSP4_YARD_SCENE_PACK } from '../world/yardScenePack.js';

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
  scenePackId: YSP4_YARD_SCENE_PACK.id,
  assetPackId: YSP3_BRIGHT_YARD_ASSET_PACK.id,
  sourceWidth: YSP4_YARD_SCENE_PACK.source.width,
  sourceHeight: YSP4_YARD_SCENE_PACK.source.height,
  worldWidth: YSP4_YARD_SCENE_PACK.world.width,
  worldHeight: YSP4_YARD_SCENE_PACK.world.height,
  baseRendered: false,
  foregroundRendered: false,
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
    YSP4_YARD_SCENE_PACK.source.width,
    YSP4_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP4_YARD_SCENE_PACK.world.width,
    YSP4_YARD_SCENE_PACK.world.height,
  );
  ctx.restore();
  debug.baseRendered = true;
  debug.renderCount += 1;
}

export function drawYardSceneImageForeground(ctx: CanvasRenderingContext2D): void {
  if (!foregroundImage || !debug.active) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    foregroundImage,
    0,
    0,
    YSP4_YARD_SCENE_PACK.source.width,
    YSP4_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP4_YARD_SCENE_PACK.world.width,
    YSP4_YARD_SCENE_PACK.world.height,
  );
  ctx.restore();
  debug.foregroundRendered = true;
}

export function markYardSceneImageFallback(): void {
  debug.active = false;
  debug.fallback = true;
}

export function markLegacyYardRendererRendered(): void {
  debug.legacyRendererRendered = true;
}
