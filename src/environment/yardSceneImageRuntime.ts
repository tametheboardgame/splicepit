import yardSceneBase from '../assets/ysp0/yard-scene-spike-base.png.base64.txt?raw';
import yardSceneForeground from '../assets/ysp0/yard-scene-spike-foreground.png.base64.txt?raw';
import { YSP0_YARD_SCENE_PACK } from '../world/yardScenePack.js';

type YardSceneImageDebug = {
  requested: boolean;
  ready: boolean;
  active: boolean;
  fallback: boolean;
  error: string | null;
  scenePackId: string;
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
  scenePackId: YSP0_YARD_SCENE_PACK.id,
  sourceWidth: YSP0_YARD_SCENE_PACK.source.width,
  sourceHeight: YSP0_YARD_SCENE_PACK.source.height,
  worldWidth: YSP0_YARD_SCENE_PACK.world.width,
  worldHeight: YSP0_YARD_SCENE_PACK.world.height,
  baseRendered: false,
  foregroundRendered: false,
  legacyRendererRendered: false,
  renderCount: 0,
};

(globalThis as YardSceneImageGlobal).__SPLICEPIT_YARD_SCENE_IMAGE__ = debug;

let baseImage: HTMLImageElement | null = null;
let foregroundImage: HTMLImageElement | null = null;

async function decodeRaster(base64: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64.trim()}`;
  await image.decode();
  if (image.naturalWidth !== YSP0_YARD_SCENE_PACK.source.width || image.naturalHeight !== YSP0_YARD_SCENE_PACK.source.height) {
    throw new Error(`${label} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`);
  }
  return image;
}

export async function prepareYardSceneImageRuntime(): Promise<boolean> {
  try {
    [baseImage, foregroundImage] = await Promise.all([
      decodeRaster(yardSceneBase, 'YSP-0 Yard base raster'),
      decodeRaster(yardSceneForeground, 'YSP-0 Yard foreground raster'),
    ]);
    debug.ready = true;
    debug.active = true;
    return true;
  } catch (error) {
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
    YSP0_YARD_SCENE_PACK.source.width,
    YSP0_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP0_YARD_SCENE_PACK.world.width,
    YSP0_YARD_SCENE_PACK.world.height,
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
    YSP0_YARD_SCENE_PACK.source.width,
    YSP0_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP0_YARD_SCENE_PACK.world.width,
    YSP0_YARD_SCENE_PACK.world.height,
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
