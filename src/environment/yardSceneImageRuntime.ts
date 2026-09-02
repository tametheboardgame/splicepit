import { environmentVisualController } from './environmentVisualContract.js';
import {
  preloadYsp8YardAssets,
  ysp9YardAssetLifecycleDebug,
  YSP3_BRIGHT_YARD_ASSET_PACK,
  YSP8_DARK_YARD_ASSET_PACK,
} from './yardSceneAssetPack.js';
import {
  yardSceneForegroundOccluders,
  YSP10_YARD_SCENE_PACK,
  type YardSceneRect,
} from '../world/yardScenePack.js';
import type { ProtagonistId } from '../player/protagonists.js';

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
  locatorVisible: boolean;
  locatorColour: string | null;
  locatorOccluderIds: string[];
  exitGuidanceVisible: boolean;
  exitGuidanceExitId: string | null;
  legacyRendererRendered: boolean;
  renderCount: number;
  imageSmoothingDisabled: boolean;
  preloadRequests: number;
  assetCacheHits: number;
  decodeStarts: number;
  successfulLoads: number;
  failedLoads: number;
  lastLoadDurationMs: number | null;
  compressedAuthoredBasesBytes: number;
  decodedRgbaBytes: number;
  decodedRgbaBudgetBytes: number;
};

type YardGameplayDebug = {
  selectedAvatarId?: ProtagonistId;
  playerX?: number;
  playerY?: number;
  objectiveId?: string;
  sceneMode?: string;
};

type YardSceneImageGlobal = typeof globalThis & {
  __SPLICEPIT_YARD_SCENE_IMAGE__?: YardSceneImageDebug;
  __SPLICEPIT_VISUAL_RESET__?: YardGameplayDebug;
};

const PROTAGONIST_LOCATOR_COLOURS: Record<ProtagonistId, string> = {
  milo: '#db634b',
  theo: '#e2a64d',
  ada: '#8b63cf',
  pip: '#d84f82',
};
const MIN_LOCATOR_OCCLUSION_AREA = 64 * 18;

const initialLifecycle = ysp9YardAssetLifecycleDebug();
const debug: YardSceneImageDebug = {
  requested: true,
  ready: false,
  active: false,
  fallback: false,
  error: null,
  scenePackId: YSP10_YARD_SCENE_PACK.id,
  assetPackId: YSP3_BRIGHT_YARD_ASSET_PACK.id,
  darkAssetPackId: YSP8_DARK_YARD_ASSET_PACK.id,
  sourceWidth: YSP10_YARD_SCENE_PACK.source.width,
  sourceHeight: YSP10_YARD_SCENE_PACK.source.height,
  worldWidth: YSP10_YARD_SCENE_PACK.world.width,
  worldHeight: YSP10_YARD_SCENE_PACK.world.height,
  baseRendered: false,
  darkBaseRendered: false,
  darkMix: 0,
  foregroundRendered: false,
  foregroundMode: YSP10_YARD_SCENE_PACK.foreground?.mode ?? 'none',
  activeOccluderIds: [],
  occluderRenderCount: 0,
  darkOccluderRenderCount: 0,
  locatorVisible: false,
  locatorColour: null,
  locatorOccluderIds: [],
  exitGuidanceVisible: false,
  exitGuidanceExitId: null,
  legacyRendererRendered: false,
  renderCount: 0,
  imageSmoothingDisabled: false,
  preloadRequests: initialLifecycle.preloadRequests,
  assetCacheHits: initialLifecycle.cacheHits,
  decodeStarts: initialLifecycle.decodeStarts,
  successfulLoads: initialLifecycle.successfulLoads,
  failedLoads: initialLifecycle.failedLoads,
  lastLoadDurationMs: initialLifecycle.lastLoadDurationMs,
  compressedAuthoredBasesBytes: initialLifecycle.compressedAuthoredBasesBytes,
  decodedRgbaBytes: initialLifecycle.decodedRgbaBytes,
  decodedRgbaBudgetBytes: initialLifecycle.decodedRgbaBudgetBytes,
};

(globalThis as YardSceneImageGlobal).__SPLICEPIT_YARD_SCENE_IMAGE__ = debug;

let baseImage: HTMLImageElement | null = null;
let foregroundImage: HTMLImageElement | null = null;
let darkBaseImage: HTMLImageElement | null = null;

function clampMix(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function overlapArea(a: YardSceneRect, b: YardSceneRect): number {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

function currentGameplayDebug(): YardGameplayDebug | null {
  return (globalThis as YardSceneImageGlobal).__SPLICEPIT_VISUAL_RESET__ ?? null;
}

function currentLocatorColour(gameplay: YardGameplayDebug | null): string {
  const id = gameplay?.selectedAvatarId ?? 'milo';
  return PROTAGONIST_LOCATOR_COLOURS[id];
}

function drawPlayerLocator(ctx: CanvasRenderingContext2D, x: number, feetY: number, colour: string): void {
  const now = performance.now();
  const bob = Math.round(Math.sin(now / 150) * 3);
  const markerY = Math.max(24, Math.round(feetY - 112 + bob));
  const markerX = Math.round(x);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(24, 31, 28, 0.9)';
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(markerX - 11, markerY - 7);
  ctx.lineTo(markerX + 11, markerY - 7);
  ctx.lineTo(markerX, markerY + 8);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawSouthLabGuidance(ctx: CanvasRenderingContext2D, colour: string): boolean {
  const exit = YSP10_YARD_SCENE_PACK.exits.find((candidate) => candidate.id === 'master-lab-south-path');
  if (!exit) return false;
  const now = performance.now();
  const pulse = 0.82 + ((Math.sin(now / 220) + 1) * 0.09);
  const x = Math.round(exit.bounds.x + exit.bounds.width / 2);
  const y = Math.round(exit.bounds.y - 18);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = pulse;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '800 16px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(24, 31, 28, 0.92)';
  ctx.fillStyle = colour;
  ctx.strokeText('LAB', x, y - 8);
  ctx.fillText('LAB', x, y - 8);
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 3);
  ctx.lineTo(x + 12, y - 3);
  ctx.lineTo(x, y + 12);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
  return true;
}

function syncLifecycleDebug(): void {
  const lifecycle = ysp9YardAssetLifecycleDebug();
  debug.preloadRequests = lifecycle.preloadRequests;
  debug.assetCacheHits = lifecycle.cacheHits;
  debug.decodeStarts = lifecycle.decodeStarts;
  debug.successfulLoads = lifecycle.successfulLoads;
  debug.failedLoads = lifecycle.failedLoads;
  debug.lastLoadDurationMs = lifecycle.lastLoadDurationMs;
  debug.compressedAuthoredBasesBytes = lifecycle.compressedAuthoredBasesBytes;
  debug.decodedRgbaBytes = lifecycle.decodedRgbaBytes;
  debug.decodedRgbaBudgetBytes = lifecycle.decodedRgbaBudgetBytes;
}

export async function prepareYardSceneImageRuntime(): Promise<boolean> {
  try {
    const prepared = await preloadYsp8YardAssets();
    baseImage = prepared.base;
    foregroundImage = prepared.foreground;
    darkBaseImage = prepared.darkBase;
    syncLifecycleDebug();
    debug.ready = true;
    debug.active = true;
    debug.fallback = false;
    debug.error = null;
    return true;
  } catch (error) {
    baseImage = null;
    foregroundImage = null;
    darkBaseImage = null;
    syncLifecycleDebug();
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
    YSP10_YARD_SCENE_PACK.source.width,
    YSP10_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP10_YARD_SCENE_PACK.world.width,
    YSP10_YARD_SCENE_PACK.world.height,
  );
  if (mix > 0) {
    ctx.globalAlpha = mix;
    ctx.drawImage(
      darkBaseImage,
      0,
      0,
      YSP10_YARD_SCENE_PACK.source.width,
      YSP10_YARD_SCENE_PACK.source.height,
      0,
      0,
      YSP10_YARD_SCENE_PACK.world.width,
      YSP10_YARD_SCENE_PACK.world.height,
    );
  }
  ctx.restore();
  debug.baseRendered = true;
  debug.darkBaseRendered = mix > 0;
  debug.darkMix = mix;
  debug.imageSmoothingDisabled = true;
  debug.renderCount += 1;
}

/**
 * Redraw authored occluder crops from the same Bright/Dark bases used below the
 * protagonist. YSP-10B keeps those crops tight to actual object surfaces so a
 * walk-behind region never redraws ordinary ground over the character.
 */
export function drawYardSceneImageForeground(
  ctx: CanvasRenderingContext2D,
  playerFeetY: number,
  darkMix?: number,
): void {
  if (!foregroundImage || !baseImage || !darkBaseImage || !debug.active) return;
  const mix = clampMix(darkMix ?? debug.darkMix);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    foregroundImage,
    0,
    0,
    YSP10_YARD_SCENE_PACK.source.width,
    YSP10_YARD_SCENE_PACK.source.height,
    0,
    0,
    YSP10_YARD_SCENE_PACK.world.width,
    YSP10_YARD_SCENE_PACK.world.height,
  );

  const activeOccluders = yardSceneForegroundOccluders(YSP10_YARD_SCENE_PACK, playerFeetY);
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

  const gameplay = currentGameplayDebug();
  const playerX = typeof gameplay?.playerX === 'number' ? gameplay.playerX : null;
  const spriteBounds: YardSceneRect | null = playerX === null ? null : {
    x: playerX - 32,
    y: playerFeetY - 88,
    width: 64,
    height: 96,
  };
  const locatorOccluders = spriteBounds
    ? activeOccluders.filter((occluder) => overlapArea(spriteBounds, occluder.bounds) >= MIN_LOCATOR_OCCLUSION_AREA)
    : [];
  const colour = currentLocatorColour(gameplay);
  if (playerX !== null && locatorOccluders.length > 0) {
    drawPlayerLocator(ctx, playerX, playerFeetY, colour);
  }

  const shouldGuideExit = gameplay?.sceneMode === 'yard' && gameplay.objectiveId === 'find-master';
  const exitGuidanceVisible = shouldGuideExit ? drawSouthLabGuidance(ctx, colour) : false;

  debug.foregroundRendered = true;
  debug.activeOccluderIds = activeOccluders.map((occluder) => occluder.id);
  debug.occluderRenderCount += activeOccluders.length;
  if (mix > 0) debug.darkOccluderRenderCount += activeOccluders.length;
  debug.locatorVisible = locatorOccluders.length > 0;
  debug.locatorColour = locatorOccluders.length > 0 ? colour : null;
  debug.locatorOccluderIds = locatorOccluders.map((occluder) => occluder.id);
  debug.exitGuidanceVisible = exitGuidanceVisible;
  debug.exitGuidanceExitId = exitGuidanceVisible ? 'master-lab-south-path' : null;
  debug.darkMix = mix;
  debug.imageSmoothingDisabled = true;
}

export function markYardSceneImageFallback(): void {
  debug.active = false;
  debug.fallback = true;
}

export function markLegacyYardRendererRendered(): void {
  debug.legacyRendererRendered = true;
}
