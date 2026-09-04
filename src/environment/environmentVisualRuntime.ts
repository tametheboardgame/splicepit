import { drawDarkLayerFlickerOverlay } from '../render/darkLayerFlicker.js';
import {
  environmentVisualController,
  openingWorldEnvironmentAt,
  refreshEnvironmentVisualDebug,
  type EnvironmentLocationId,
} from './environmentVisualContract.js';
import {
  AMBIENT_CORRUPTION_INTENSITIES,
  AmbientWorldCorruptionScheduler,
  type AmbientCorruptionEvent,
  type AmbientCorruptionIntensity,
} from './ambientWorldCorruption.js';
import {
  resolveDarkLayerStoryCue,
  type DarkLayerStoryCue,
  type DarkLayerStoryRole,
} from './darkLayerStoryLanguage.js';

type YardDebug = {
  ready?: boolean;
  phase?: string;
  playerX?: number;
  sceneMode?: 'yard' | 'master-lab-route';
  activeOpeningShell?: string | null;
};

type OverlayDebug = {
  active?: boolean;
};

type DialogueDebug = {
  ready?: boolean;
  completed?: boolean;
  handedOffToSelector?: boolean;
};

type RuntimeGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_MASTER_LAB__?: OverlayDebug;
  __SPLICEPIT_LOCAL_PIT__?: OverlayDebug;
  __SPLICEPIT_DIALOGUE__?: DialogueDebug;
  __SPLICEPIT_CORRUPTION__?: AmbientWorldCorruptionDebugControl;
};

type AmbientWorldCorruptionDebugState = {
  ready: true;
  enabled: boolean;
  exploring: boolean;
  locationId: EnvironmentLocationId;
  eventCount: number;
  ambientEventCount: number;
  authoredEventCount: number;
  activeEventId: number | null;
  activeSource: AmbientCorruptionEvent['source'] | null;
  intensity: AmbientCorruptionIntensity | null;
  storyCueId: string | null;
  storyRole: DarkLayerStoryRole | null;
  nextDueInMs: number | null;
  overlayVisible: boolean;
  suppressionReasons: string[];
};

type AmbientWorldCorruptionDebugControl = {
  state: AmbientWorldCorruptionDebugState;
  intensities: typeof AMBIENT_CORRUPTION_INTENSITIES;
  forceAmbient: (locationId?: EnvironmentLocationId, intensity?: AmbientCorruptionIntensity) => void;
  triggerAuthored: (locationId?: EnvironmentLocationId, intensity?: AmbientCorruptionIntensity) => void;
  triggerStory: (cue: DarkLayerStoryCue, locationId?: EnvironmentLocationId) => void;
  suppress: (reason?: string) => void;
  resume: (reason?: string) => void;
  setEnabled: (enabled: boolean) => void;
  reschedule: () => void;
};

const scheduler = new AmbientWorldCorruptionScheduler();
const OVERLAY_CANVAS_ID = 'ambient-world-corruption';
let activeStoryEventId: number | null = null;
let activeStoryCue: DarkLayerStoryCue | null = null;

const corruptionDebugState: AmbientWorldCorruptionDebugState = {
  ready: true,
  enabled: true,
  exploring: false,
  locationId: 'yard',
  eventCount: 0,
  ambientEventCount: 0,
  authoredEventCount: 0,
  activeEventId: null,
  activeSource: null,
  intensity: null,
  storyCueId: null,
  storyRole: null,
  nextDueInMs: null,
  overlayVisible: false,
  suppressionReasons: [],
};

function runtimeNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function activeLocation(): EnvironmentLocationId {
  const globals = globalThis as RuntimeGlobal;
  if (globals.__SPLICEPIT_LOCAL_PIT__?.active) return 'local-pit';
  if (globals.__SPLICEPIT_MASTER_LAB__?.active) return 'master-lab';

  const yard = globals.__SPLICEPIT_VISUAL_RESET__;
  if (yard?.phase === 'confirmed') {
    // RSP-7 authored Route ownership is semantic rather than tied to the
    // retired opening-world X split. Prefer the production scene mode when it
    // is available, while preserving the old coordinate resolver for legacy
    // runtimes that do not expose sceneMode.
    if (yard.sceneMode === 'master-lab-route') return 'route';
    if (yard.sceneMode === 'yard') return 'yard';
    if (typeof yard.playerX === 'number') return openingWorldEnvironmentAt(yard.playerX);
  }
  return 'yard';
}

function explorationActive(): boolean {
  const globals = globalThis as RuntimeGlobal;
  if (globals.__SPLICEPIT_LOCAL_PIT__?.active || globals.__SPLICEPIT_MASTER_LAB__?.active) return true;
  return globals.__SPLICEPIT_VISUAL_RESET__?.phase === 'confirmed';
}

function syncSuppression(): void {
  const globals = globalThis as RuntimeGlobal;
  const dialogue = globals.__SPLICEPIT_DIALOGUE__;
  const dialogueActive = Boolean(dialogue?.ready && !dialogue.completed && !dialogue.handedOffToSelector);
  environmentVisualController.setSuppressed('opening-dialogue', dialogueActive);
  environmentVisualController.setSuppressed('opening-shell', Boolean(globals.__SPLICEPIT_VISUAL_RESET__?.activeOpeningShell));
}

function ensureOverlayCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas && canvas.parentElement === root) return canvas;
  canvas?.remove();
  canvas = document.createElement('canvas');
  canvas.id = OVERLAY_CANVAS_ID;
  canvas.width = 1280;
  canvas.height = 720;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.width = 'min(100vw, calc(100vh * 16 / 9))';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '100vh';
  canvas.style.aspectRatio = '16 / 9';
  canvas.style.zIndex = '29';
  canvas.style.pointerEvents = 'none';
  canvas.style.imageRendering = 'pixelated';
  root.style.position = 'relative';
  root.append(canvas);
  return canvas;
}

function sourceCanvasFor(locationId: EnvironmentLocationId): HTMLCanvasElement | null {
  const id = locationId === 'master-lab'
    ? 'master-lab-stage'
    : locationId === 'local-pit'
      ? 'local-pit-stage'
      : 'visual-reset-stage';
  return document.getElementById(id) as HTMLCanvasElement | null;
}

function locationSeed(locationId: EnvironmentLocationId): number {
  if (locationId === 'yard') return 4919;
  if (locationId === 'route') return 7127;
  if (locationId === 'master-lab') return 9341;
  return 11549;
}

function drawCorruptionOverlay(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  event: AmbientCorruptionEvent,
  now: number,
): void {
  const elapsed = Math.max(0, now - event.startedAt);
  const progress = Math.max(0, Math.min(1, elapsed / event.durationMs));
  const edge = progress < 0.2 ? progress / 0.2 : progress > 0.72 ? (1 - progress) / 0.28 : 1;
  const strength = Math.max(0, edge) * event.overlayStrength;
  const tick = Math.floor(elapsed / 36);

  ctx.clearRect(0, 0, 1280, 720);
  ctx.save();
  ctx.globalAlpha = 0.16 + strength * 0.26;
  ctx.drawImage(source, 0, 0, 1280, 720);

  for (let y = 28; y < 704; y += 54) {
    const sliceHeight = 5 + ((tick + y) % 10);
    const shift = ((((tick + 3) * 17 + y * 5) % 58) - 29) * strength;
    ctx.globalAlpha = 0.18 + strength * 0.42;
    ctx.drawImage(source, 0, y, 1280, sliceHeight, shift, y, 1280, sliceHeight);
  }
  ctx.restore();

  drawDarkLayerFlickerOverlay(ctx, {
    amount: strength,
    elapsedMs: elapsed,
    width: 1280,
    height: 720,
    seed: locationSeed(event.locationId) + event.id * 37,
  });
}

function renderOverlay(now: number, event: AmbientCorruptionEvent | null): void {
  const canvas = ensureOverlayCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  if (!canvas || !ctx) {
    corruptionDebugState.overlayVisible = false;
    return;
  }

  const source = event ? sourceCanvasFor(event.locationId) : null;
  const visible = Boolean(event && source && now < event.startedAt + event.durationMs);
  corruptionDebugState.overlayVisible = visible;
  canvas.setAttribute('aria-hidden', visible ? 'false' : 'true');
  if (visible && event && source) drawCorruptionOverlay(ctx, source, event, now);
  else ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startEvent(event: AmbientCorruptionEvent): void {
  environmentVisualController.forceTransition(
    event.locationId,
    event.startedAt,
    event.durationMs,
    { ignoreSuppression: event.ignoreSuppression },
  );
}

function clearStoryMetadata(): void {
  activeStoryEventId = null;
  activeStoryCue = null;
}

function syncCorruptionDebug(now: number, locationId: EnvironmentLocationId, exploring: boolean): void {
  const snapshot = scheduler.snapshot();
  const active = snapshot.activeEvent;
  const environment = environmentVisualController.snapshot(now);
  const storyActive = Boolean(active && active.id === activeStoryEventId && activeStoryCue);
  if (!storyActive) clearStoryMetadata();

  corruptionDebugState.enabled = snapshot.enabled;
  corruptionDebugState.exploring = exploring;
  corruptionDebugState.locationId = locationId;
  corruptionDebugState.eventCount = snapshot.eventCount;
  corruptionDebugState.ambientEventCount = snapshot.ambientEventCount;
  corruptionDebugState.authoredEventCount = snapshot.authoredEventCount;
  corruptionDebugState.activeEventId = active?.id ?? null;
  corruptionDebugState.activeSource = active?.source ?? null;
  corruptionDebugState.intensity = active?.intensity ?? null;
  corruptionDebugState.storyCueId = storyActive ? activeStoryCue?.cueId ?? null : null;
  corruptionDebugState.storyRole = storyActive ? activeStoryCue?.role ?? null : null;
  corruptionDebugState.nextDueInMs = snapshot.nextDueAt === null ? null : Math.max(0, Math.round(snapshot.nextDueAt - now));
  corruptionDebugState.suppressionReasons = [...environment.suppressionReasons];
}

const corruptionDebugControl: AmbientWorldCorruptionDebugControl = {
  state: corruptionDebugState,
  intensities: AMBIENT_CORRUPTION_INTENSITIES,
  forceAmbient(locationId = activeLocation(), intensity = 'rupture'): void {
    clearStoryMetadata();
    const now = runtimeNow();
    const event = scheduler.force(locationId, now, intensity, 'debug', false);
    startEvent(event);
    refreshEnvironmentVisualDebug(now);
    syncCorruptionDebug(now, locationId, explorationActive());
  },
  triggerAuthored(locationId = activeLocation(), intensity = 'rupture'): void {
    clearStoryMetadata();
    const now = runtimeNow();
    const event = scheduler.force(locationId, now, intensity, 'authored', true);
    startEvent(event);
    refreshEnvironmentVisualDebug(now);
    syncCorruptionDebug(now, locationId, explorationActive());
  },
  triggerStory(cue, locationId = activeLocation()): void {
    const cueId = cue.cueId.trim();
    if (!cueId) throw new Error('Dark-layer story cues require an id.');
    const preset = resolveDarkLayerStoryCue({ cueId, role: cue.role });
    const now = runtimeNow();
    const event = scheduler.force(locationId, now, preset.intensity, 'authored', true);
    activeStoryEventId = event.id;
    activeStoryCue = { cueId, role: cue.role };
    startEvent(event);
    refreshEnvironmentVisualDebug(now);
    syncCorruptionDebug(now, locationId, explorationActive());
  },
  suppress(reason = 'external'): void {
    environmentVisualController.setSuppressed(`corruption:${reason}`, true);
    refreshEnvironmentVisualDebug();
  },
  resume(reason = 'external'): void {
    environmentVisualController.setSuppressed(`corruption:${reason}`, false);
    refreshEnvironmentVisualDebug();
  },
  setEnabled(enabled: boolean): void {
    const now = runtimeNow();
    const cancelled = scheduler.setEnabled(enabled, now);
    if (cancelled) {
      environmentVisualController.clearTransition();
      clearStoryMetadata();
    }
    refreshEnvironmentVisualDebug(now);
    syncCorruptionDebug(now, activeLocation(), explorationActive());
  },
  reschedule(): void {
    const now = runtimeNow();
    scheduler.reschedule(now);
    syncCorruptionDebug(now, activeLocation(), explorationActive());
  },
};

(globalThis as RuntimeGlobal).__SPLICEPIT_CORRUPTION__ = corruptionDebugControl;

function tick(now: number): void {
  const locationId = activeLocation();
  const exploring = explorationActive();
  environmentVisualController.setActiveLocation(locationId);
  syncSuppression();

  const activeBefore = scheduler.activeEvent();
  const environmentBefore = environmentVisualController.snapshot(now);
  const schedulerOwnsTransition = Boolean(
    activeBefore && environmentBefore.transitionLocation === activeBefore.locationId,
  );
  const blocked = environmentBefore.forcedState !== null
    || environmentBefore.suppressed
    || (environmentBefore.transitionLocation !== null && !schedulerOwnsTransition);

  const update = scheduler.update({ now, locationId, exploring, blocked });
  if (update.cancelled && schedulerOwnsTransition) {
    environmentVisualController.clearTransition();
    if (update.cancelled.id === activeStoryEventId) clearStoryMetadata();
  }
  if (update.ended?.id === activeStoryEventId) clearStoryMetadata();
  if (update.started) startEvent(update.started);

  refreshEnvironmentVisualDebug(now);
  renderOverlay(now, update.active);
  syncCorruptionDebug(now, locationId, exploring);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
