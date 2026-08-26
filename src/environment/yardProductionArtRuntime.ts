import {
  environmentVisualController,
  openingWorldEnvironmentAt,
  refreshEnvironmentVisualDebug,
} from './environmentVisualContract.js';
import {
  drawYardBrightProductionArt,
  drawYardDarkProductionArt,
  YARD_PRODUCTION_ART_CONTRACT,
} from '../world/yardProductionArt.js';
import { YARD_VIEW_HEIGHT, YARD_VIEW_WIDTH } from '../world/yard.js';

type YardRuntimeDebug = {
  ready?: boolean;
  phase?: string;
  playerX?: number;
  cameraX?: number;
  cameraY?: number;
  tutorialPromptVisible?: boolean;
  activeOpeningShell?: string | null;
};

type OverlayRuntimeDebug = { active?: boolean };

type YardArtDebug = {
  ready: boolean;
  active: boolean;
  overlayAttached: boolean;
  renderCount: number;
  brightRendered: boolean;
  darkRendered: boolean;
  darkMix: number;
  visualState: 'bright' | 'dark';
  geometryId: string;
  collisionTopology: 'unchanged';
  brightDetailGroups: readonly string[];
  darkStoryGroups: readonly string[];
};

type YardArtGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardRuntimeDebug;
  __SPLICEPIT_MASTER_LAB__?: OverlayRuntimeDebug;
  __SPLICEPIT_LOCAL_PIT__?: OverlayRuntimeDebug;
  __SPLICEPIT_YARD_ART__?: YardArtDebug;
};

const OVERLAY_ID = 'yard-production-art-stage';
const debug: YardArtDebug = {
  ready: true,
  active: false,
  overlayAttached: false,
  renderCount: 0,
  brightRendered: false,
  darkRendered: false,
  darkMix: 0,
  visualState: 'bright',
  geometryId: YARD_PRODUCTION_ART_CONTRACT.geometryId,
  collisionTopology: YARD_PRODUCTION_ART_CONTRACT.collisionTopology,
  brightDetailGroups: YARD_PRODUCTION_ART_CONTRACT.brightDetailGroups,
  darkStoryGroups: YARD_PRODUCTION_ART_CONTRACT.darkStoryGroups,
};
(globalThis as YardArtGlobal).__SPLICEPIT_YARD_ART__ = debug;

function ensureOverlay(source: HTMLCanvasElement): HTMLCanvasElement {
  let overlay = document.getElementById(OVERLAY_ID) as HTMLCanvasElement | null;
  if (!overlay) {
    overlay = document.createElement('canvas');
    overlay.id = OVERLAY_ID;
    overlay.width = YARD_VIEW_WIDTH;
    overlay.height = YARD_VIEW_HEIGHT;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '4';
    overlay.style.imageRendering = 'pixelated';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }
  const bounds = source.getBoundingClientRect();
  overlay.style.left = `${bounds.left}px`;
  overlay.style.top = `${bounds.top}px`;
  overlay.style.width = `${bounds.width}px`;
  overlay.style.height = `${bounds.height}px`;
  debug.overlayAttached = true;
  return overlay;
}

function copyDesktopHud(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, yard: YardRuntimeDebug): void {
  const coarsePointer = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;
  if (coarsePointer) return;
  ctx.drawImage(source, 14, 14, 430, 102, 14, 14, 430, 102);
  if (yard.tutorialPromptVisible) ctx.drawImage(source, 14, 588, 620, 128, 14, 588, 620, 128);
}

function hideOverlay(overlay: HTMLCanvasElement | null): void {
  if (overlay) {
    overlay.getContext('2d')?.clearRect(0, 0, overlay.width, overlay.height);
    overlay.style.display = 'none';
  }
  debug.active = false;
  debug.darkMix = 0;
  debug.visualState = 'bright';
}

function render(now: number): void {
  const globals = globalThis as YardArtGlobal;
  const yard = globals.__SPLICEPIT_VISUAL_RESET__;
  const source = document.getElementById('visual-reset-stage') as HTMLCanvasElement | null;
  const existingOverlay = document.getElementById(OVERLAY_ID) as HTMLCanvasElement | null;
  const blockedByInterior = Boolean(globals.__SPLICEPIT_MASTER_LAB__?.active || globals.__SPLICEPIT_LOCAL_PIT__?.active);
  const isYard = typeof yard?.playerX === 'number' && openingWorldEnvironmentAt(yard.playerX) === 'yard';
  const canRender = Boolean(source && yard?.ready && yard.phase === 'confirmed' && isYard && !blockedByInterior && !yard.activeOpeningShell);

  if (!canRender || !source || !yard || typeof yard.cameraX !== 'number' || typeof yard.cameraY !== 'number') {
    hideOverlay(existingOverlay);
    requestAnimationFrame(render);
    return;
  }

  const overlay = ensureOverlay(source);
  const ctx = overlay.getContext('2d');
  if (!ctx) {
    hideOverlay(overlay);
    requestAnimationFrame(render);
    return;
  }

  const sample = environmentVisualController.sample('yard', now);
  refreshEnvironmentVisualDebug(now);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(-Math.round(yard.cameraX), -Math.round(yard.cameraY));
  drawYardBrightProductionArt(ctx, now);
  if (sample.darkMix > 0) {
    ctx.save();
    ctx.globalAlpha = sample.darkMix;
    drawYardDarkProductionArt(ctx, now);
    ctx.restore();
  }
  ctx.restore();
  copyDesktopHud(ctx, source, yard);

  overlay.style.display = 'block';
  debug.active = true;
  debug.renderCount += 1;
  debug.brightRendered = true;
  debug.darkRendered = debug.darkRendered || sample.darkMix > 0;
  debug.darkMix = Math.round(sample.darkMix * 1000) / 1000;
  debug.visualState = sample.visualState;
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
