import {
  browserCutsceneRuntime,
  CUTSCENE_DIALOGUE_EVENT,
  CUTSCENE_FLAG_EVENT,
  type CutsceneDialogueEventDetail,
  type CutsceneFlagEventDetail,
} from './browserCutsceneRuntime.js';
import {
  DEBT_COLLECTOR_CUTSCENE,
  DEBT_COLLECTOR_DIALOGUE,
  DEBT_COLLECTOR_FLAGS,
} from './debtCollectorEncounter.js';
import {
  debtEncounterState,
  type DebtEncounterSnapshot,
} from '../story/debtEncounterState.js';
import { OPENING_ROUTE_LANDMARKS } from '../world/yard.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const OVERLAY_CANVAS_ID = 'debt-collector-stage';
const DIALOGUE_ID = 'debt-collector-dialogue';
const STYLE_ID = 'wp07e-debt-collector-style';
const ACTIVE_BODY_CLASS = 'wp07e-debt-encounter-active';

const DEBT_LANDMARK = OPENING_ROUTE_LANDMARKS.find((landmark) => landmark.id === 'debt-encounter');
if (!DEBT_LANDMARK) throw new Error('WP0.7E requires the authored debt-encounter route landmark.');
const TRIGGER_RADIUS = Math.min(150, DEBT_LANDMARK.radius);

type YardDebug = {
  ready?: boolean;
  phase?: string;
  playerX?: number;
  playerY?: number;
  cameraX?: number;
  cameraY?: number;
};

type LayerDebug = {
  active?: boolean;
};

type DebtEncounterDebugState = DebtEncounterSnapshot & {
  ready: true;
  status: 'locked' | 'armed' | 'running' | 'completed' | 'failed';
  error: string | null;
  landmarkId: 'debt-encounter';
  landmarkLabel: string;
  triggerRadius: number;
  distanceToPlayer: number | null;
  representativeVisible: boolean;
  currentCueId: string | null;
  flags: Record<string, boolean | number | string | null>;
};

type DebtEncounterDebugControl = {
  state: DebtEncounterDebugState;
  armForPitRoute: () => boolean;
  start: () => Promise<boolean>;
};

type DebtEncounterGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_MASTER_LAB__?: LayerDebug;
  __SPLICEPIT_LOCAL_PIT__?: LayerDebug;
  __SPLICEPIT_DEBT_ENCOUNTER__?: DebtEncounterDebugControl;
};

const debugState: DebtEncounterDebugState = {
  ready: true,
  ...debtEncounterState.snapshot(),
  status: 'locked',
  error: null,
  landmarkId: 'debt-encounter',
  landmarkLabel: DEBT_LANDMARK.label,
  triggerRadius: TRIGGER_RADIUS,
  distanceToPlayer: null,
  representativeVisible: false,
  currentCueId: null,
  flags: {},
};

let startPromise: Promise<boolean> | null = null;

function runtimeGlobal(): DebtEncounterGlobal {
  return globalThis as DebtEncounterGlobal;
}

function syncStoryState(snapshot = debtEncounterState.snapshot()): void {
  debugState.phase = snapshot.phase;
  debugState.armed = snapshot.armed;
  debugState.running = snapshot.running;
  debugState.completed = snapshot.completed;
  debugState.inheritedDebtConfirmed = snapshot.inheritedDebtConfirmed;
  debugState.encounterCount = snapshot.encounterCount;
  if (debugState.status !== 'failed') debugState.status = snapshot.phase;
}

debtEncounterState.subscribe(syncStoryState);

function yardDebug(): YardDebug | undefined {
  return runtimeGlobal().__SPLICEPIT_VISUAL_RESET__;
}

function routeGameplayVisible(): boolean {
  const global = runtimeGlobal();
  const yard = global.__SPLICEPIT_VISUAL_RESET__;
  return Boolean(
    yard?.ready
    && yard.phase === 'confirmed'
    && !global.__SPLICEPIT_MASTER_LAB__?.active
    && !global.__SPLICEPIT_LOCAL_PIT__?.active
  );
}

function distanceToPlayer(): number | null {
  const yard = yardDebug();
  if (typeof yard?.playerX !== 'number' || typeof yard.playerY !== 'number') return null;
  return Math.hypot(yard.playerX - DEBT_LANDMARK.x, yard.playerY - DEBT_LANDMARK.y);
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${DIALOGUE_ID} {
      position: fixed;
      z-index: 70;
      top: calc(18px + env(safe-area-inset-top));
      left: 50%;
      width: min(760px, calc(100vw - 28px));
      transform: translateX(-50%);
      box-sizing: border-box;
      padding: 14px 17px 13px;
      border: 3px solid #c8bd99;
      outline: 4px solid rgba(42, 47, 45, .96);
      background: rgba(53, 59, 57, .97);
      color: #f0e5c4;
      box-shadow: 0 9px 0 rgba(20, 25, 24, .38);
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      pointer-events: none;
    }
    #${DIALOGUE_ID}[hidden] { display: none; }
    #${DIALOGUE_ID} .wp07e-speaker {
      color: #d1c7a6;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    #${DIALOGUE_ID} .wp07e-text {
      font-size: clamp(16px, 2vw, 20px);
      font-weight: 700;
      line-height: 1.34;
    }
    #${DIALOGUE_ID} .wp07e-hint {
      margin-top: 8px;
      color: #b9d0bd;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .1em;
      text-align: right;
    }
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-hud [data-mobile-hud="objective"],
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-hud [data-mobile-hud="tutorial"],
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-dpad,
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-utility-row,
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-back-button {
      display: none !important;
    }
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-action-cluster {
      right: calc(14px + env(safe-area-inset-right));
      bottom: calc(14px + env(safe-area-inset-bottom));
    }
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-primary-row,
    body.${ACTIVE_BODY_CLASS} #mobile-gameplay-controls .mobile-action-button {
      display: flex !important;
    }
    @media (pointer: coarse) {
      #${DIALOGUE_ID} {
        top: calc(12px + env(safe-area-inset-top));
        padding: 11px 13px 10px;
        border-width: 2px;
        outline-width: 2px;
        max-height: min(44vh, 290px);
        overflow: auto;
      }
      #${DIALOGUE_ID} .wp07e-speaker { font-size: 10px; margin-bottom: 4px; }
      #${DIALOGUE_ID} .wp07e-text { font-size: clamp(14px, 4vw, 18px); line-height: 1.24; }
      #${DIALOGUE_ID} .wp07e-hint { margin-top: 5px; font-size: 9px; }
    }
  `;
  document.head.append(style);
}

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas && canvas.parentElement === root) return canvas;
  canvas?.remove();
  canvas = document.createElement('canvas');
  canvas.id = OVERLAY_CANVAS_ID;
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.width = 'min(100vw, calc(100vh * 16 / 9))';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '100vh';
  canvas.style.aspectRatio = '16 / 9';
  canvas.style.zIndex = '20';
  canvas.style.pointerEvents = 'none';
  canvas.style.imageRendering = 'pixelated';
  root.style.position = 'relative';
  root.append(canvas);
  return canvas;
}

function ensureDialogue(): HTMLDivElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let dialogue = document.getElementById(DIALOGUE_ID) as HTMLDivElement | null;
  if (!dialogue) {
    dialogue = document.createElement('div');
    dialogue.id = DIALOGUE_ID;
    dialogue.hidden = true;
    dialogue.setAttribute('role', 'status');
    dialogue.setAttribute('aria-live', 'polite');
    dialogue.innerHTML = '<div class="wp07e-speaker"></div><div class="wp07e-text"></div><div class="wp07e-hint">ACTION / CONFIRM</div>';
    root.append(dialogue);
  }
  return dialogue;
}

function showDialogue(detail: CutsceneDialogueEventDetail): void {
  const cue = DEBT_COLLECTOR_DIALOGUE[detail.cueId];
  if (!cue) return;
  const dialogue = ensureDialogue();
  if (!dialogue) return;
  const speaker = dialogue.querySelector('.wp07e-speaker');
  const text = dialogue.querySelector('.wp07e-text');
  if (speaker) speaker.textContent = cue.speaker;
  if (text) text.textContent = cue.text;
  dialogue.hidden = false;
  debugState.currentCueId = detail.cueId;
}

function hideDialogue(): void {
  const dialogue = document.getElementById(DIALOGUE_ID) as HTMLDivElement | null;
  if (dialogue) dialogue.hidden = true;
  debugState.currentCueId = null;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawRepresentative(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(35, 43, 39, .26)';
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y - 3), 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  rect(ctx, x - 12, y - 76, 24, 22, '#cdbfa3');
  rect(ctx, x - 16, y - 82, 32, 8, '#4a504d');
  rect(ctx, x - 11, y - 86, 22, 6, '#343a38');
  rect(ctx, x - 5, y - 68, 4, 4, '#303634');
  rect(ctx, x + 5, y - 68, 4, 4, '#303634');

  rect(ctx, x - 19, y - 54, 38, 44, '#555d5b');
  rect(ctx, x - 14, y - 50, 28, 36, '#69716e');
  rect(ctx, x - 3, y - 50, 6, 30, '#d8cfb5');
  rect(ctx, x - 19, y - 48, 6, 34, '#434a48');
  rect(ctx, x + 13, y - 48, 6, 34, '#434a48');
  rect(ctx, x - 15, y - 10, 11, 15, '#343a38');
  rect(ctx, x + 4, y - 10, 11, 15, '#343a38');

  rect(ctx, x + 18, y - 33, 28, 25, '#443b34');
  rect(ctx, x + 21, y - 30, 22, 19, '#5b4c3e');
  rect(ctx, x + 30, y - 25, 5, 5, '#c4a85d');
  rect(ctx, x + 20, y - 43, 24, 12, '#e4dcc3');
  rect(ctx, x + 23, y - 40, 18, 2, '#737a75');
  rect(ctx, x + 23, y - 35, 14, 2, '#737a75');
  ctx.restore();
}

function render(): void {
  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  const story = debtEncounterState.snapshot();
  const visible = routeGameplayVisible() && (story.armed || story.running);
  debugState.representativeVisible = visible;
  if (canvas) canvas.style.display = visible ? 'block' : 'none';

  if (canvas && ctx) {
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    if (visible) {
      const yard = yardDebug();
      const cameraX = yard?.cameraX ?? 0;
      const cameraY = yard?.cameraY ?? 0;
      drawRepresentative(ctx, DEBT_LANDMARK.x - cameraX, DEBT_LANDMARK.y - cameraY);
    }
  }
  requestAnimationFrame(render);
}

async function startEncounter(): Promise<boolean> {
  if (startPromise) return startPromise;
  if (!routeGameplayVisible() || browserCutsceneRuntime.isRunning()) return false;
  if (!debtEncounterState.beginEncounter()) return false;

  debugState.error = null;
  debugState.status = 'running';
  document.body.classList.add(ACTIVE_BODY_CLASS);
  startPromise = (async () => {
    try {
      await browserCutsceneRuntime.play(DEBT_COLLECTOR_CUTSCENE);
      if (!debtEncounterState.snapshot().completed) debtEncounterState.completeEncounter();
      debugState.status = 'completed';
      return true;
    } catch (error) {
      debtEncounterState.cancelEncounter();
      debugState.status = 'failed';
      debugState.error = error instanceof Error ? error.message : String(error);
      return false;
    } finally {
      hideDialogue();
      document.body.classList.remove(ACTIVE_BODY_CLASS);
      startPromise = null;
      syncStoryState();
    }
  })();
  return startPromise;
}

function checkTrigger(): void {
  const distance = distanceToPlayer();
  debugState.distanceToPlayer = distance === null ? null : Math.round(distance * 10) / 10;
  const story = debtEncounterState.snapshot();
  if (
    story.armed
    && distance !== null
    && distance <= TRIGGER_RADIUS
    && routeGameplayVisible()
    && !browserCutsceneRuntime.isRunning()
  ) {
    void startEncounter();
  }
  window.setTimeout(checkTrigger, 60);
}

window.addEventListener(CUTSCENE_DIALOGUE_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneDialogueEventDetail>).detail;
  if (detail && DEBT_COLLECTOR_DIALOGUE[detail.cueId]) showDialogue(detail);
});

window.addEventListener(CUTSCENE_FLAG_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneFlagEventDetail>).detail;
  if (!detail || !Object.values(DEBT_COLLECTOR_FLAGS).includes(detail.flag as typeof DEBT_COLLECTOR_FLAGS[keyof typeof DEBT_COLLECTOR_FLAGS])) return;
  debugState.flags[detail.flag] = detail.value;
  if (detail.flag === DEBT_COLLECTOR_FLAGS.COMPLETE && detail.value === true) {
    debtEncounterState.completeEncounter();
  }
});

ensureStyles();
ensureCanvas();
ensureDialogue();
syncStoryState();

const debugControl: DebtEncounterDebugControl = {
  state: debugState,
  armForPitRoute(): boolean {
    return debtEncounterState.armForPitRoute();
  },
  start: startEncounter,
};

runtimeGlobal().__SPLICEPIT_DEBT_ENCOUNTER__ = debugControl;
requestAnimationFrame(render);
checkTrigger();
