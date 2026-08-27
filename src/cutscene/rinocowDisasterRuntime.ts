import { browserCutsceneRegistry, type BrowserCutsceneActor, type BrowserCutsceneCamera } from './browserCutsceneRegistry.js';
import {
  browserCutsceneRuntime,
  CUTSCENE_DIALOGUE_EVENT,
  CUTSCENE_FLAG_EVENT,
  CUTSCENE_TRANSITION_EVENT,
  type CutsceneDialogueEventDetail,
  type CutsceneFlagEventDetail,
  type CutsceneTransitionEventDetail,
} from './browserCutsceneRuntime.js';
import type { CutsceneFacing, CutscenePoint } from './cutsceneRuntime.js';
import {
  RINOCOW_DISASTER_CUTSCENE,
  RINOCOW_DISASTER_DIALOGUE,
  RINOCOW_DISASTER_FLAGS,
  RINOCOW_DISASTER_TRANSITIONS,
} from './rinocowDisaster.js';

const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const OVERLAY_CANVAS_ID = 'rinocow-disaster-stage';
const EFFECT_LAYER_ID = 'rinocow-disaster-effect';
const DIALOGUE_ID = 'rinocow-disaster-dialogue';
const STYLE_ID = 'rinocow-disaster-style';

type MasterLabDebug = {
  ready?: boolean;
  active?: boolean;
  rendered?: boolean;
  state?: string;
  playerX?: number;
  playerY?: number;
  cameraX?: number;
  cameraY?: number;
  stageId?: string | null;
};

type ActorState = {
  x: number;
  y: number;
  facing: CutsceneFacing;
};

type DisasterDebugState = {
  ready: true;
  status: 'idle' | 'running' | 'completed' | 'failed';
  started: boolean;
  completed: boolean;
  error: string | null;
  currentCueId: string | null;
  currentTransitionId: string | null;
  transitions: string[];
  flags: Record<string, boolean | number | string | null>;
  breachStarted: boolean;
  masterDead: boolean;
  gasReleased: boolean;
  rinocowDead: boolean;
  playerAlone: boolean;
  playerSurvived: boolean;
  actorPositions: {
    viktor: ActorState;
    rinocow: ActorState;
  };
};

type DisasterDebugControl = {
  state: DisasterDebugState;
  start: () => Promise<void>;
};

type DisasterGlobal = typeof globalThis & {
  __SPLICEPIT_MASTER_LAB__?: MasterLabDebug;
  __SPLICEPIT_RINOCOW_DISASTER__?: DisasterDebugControl;
};

const viktor: ActorState = { x: 980, y: 620, facing: 'right' };
const rinocow: ActorState = { x: 1500, y: 700, facing: 'left' };
const debugState: DisasterDebugState = {
  ready: true,
  status: 'idle',
  started: false,
  completed: false,
  error: null,
  currentCueId: null,
  currentTransitionId: null,
  transitions: [],
  flags: {},
  breachStarted: false,
  masterDead: false,
  gasReleased: false,
  rinocowDead: false,
  playerAlone: false,
  playerSurvived: false,
  actorPositions: { viktor, rinocow },
};

let cameraShiftX = 0;
let cameraShiftY = 0;
let cameraScale = 1;
let blackoutActive = false;
let gasHazeActive = false;
let startPromise: Promise<void> | null = null;

function masterLab(): MasterLabDebug | undefined {
  return (globalThis as DisasterGlobal).__SPLICEPIT_MASTER_LAB__;
}

function wait(durationMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new DOMException('Cutscene cancelled', 'AbortError'));
  if (durationMs <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const handle = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, durationMs);
    const onAbort = (): void => {
      window.clearTimeout(handle);
      reject(new DOMException('Cutscene cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function facingForTravel(from: ActorState, target: CutscenePoint, requested?: CutsceneFacing): CutsceneFacing {
  if (requested) return requested;
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

function actorAdapter(actor: ActorState): BrowserCutsceneActor {
  return {
    async moveTo(target, options, signal): Promise<void> {
      const startX = actor.x;
      const startY = actor.y;
      const distance = Math.hypot(target.x - startX, target.y - startY);
      const speed = Math.max(1, options.speed ?? 280);
      const duration = Math.max(70, distance / speed * 1000);
      const startedAt = performance.now();
      actor.facing = facingForTravel(actor, target, options.facing);

      await new Promise<void>((resolve, reject) => {
        const onAbort = (): void => reject(new DOMException('Cutscene cancelled', 'AbortError'));
        signal.addEventListener('abort', onAbort, { once: true });
        const frame = (now: number): void => {
          if (signal.aborted) return;
          const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
          const eased = 1 - Math.pow(1 - progress, 2);
          actor.x = startX + (target.x - startX) * eased;
          actor.y = startY + (target.y - startY) * eased;
          if (progress >= 1) {
            signal.removeEventListener('abort', onAbort);
            actor.x = target.x;
            actor.y = target.y;
            resolve();
            return;
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    },
    face(facing): void {
      actor.facing = facing;
    },
  };
}

function applyCameraTransform(durationMs: number): void {
  const transform = `translate(calc(-50% + ${cameraShiftX}px), calc(-50% + ${cameraShiftY}px)) scale(${cameraScale})`;
  for (const id of ['master-lab-stage', OVERLAY_CANVAS_ID]) {
    const element = document.getElementById(id) as HTMLElement | null;
    if (!element) continue;
    element.style.transition = `transform ${Math.max(0, durationMs)}ms cubic-bezier(.2,.8,.2,1)`;
    element.style.transform = transform;
  }
}

function restoreCamera(durationMs = 0): void {
  cameraShiftX = 0;
  cameraShiftY = 0;
  cameraScale = 1;
  applyCameraTransform(durationMs);
}

const cameraAdapter: BrowserCutsceneCamera = {
  async focus(target, durationMs, signal): Promise<void> {
    const lab = masterLab();
    const cameraX = lab?.cameraX ?? 0;
    const cameraY = lab?.cameraY ?? 0;
    const screenX = target.x - cameraX;
    const screenY = target.y - cameraY;
    cameraShiftX = Math.round(Math.max(-110, Math.min(110, VIEW_WIDTH / 2 - screenX)));
    cameraShiftY = Math.round(Math.max(-72, Math.min(72, VIEW_HEIGHT / 2 - screenY)));
    cameraScale = 1.035;
    applyCameraTransform(durationMs);
    await wait(durationMs, signal);
  },
  async release(durationMs, signal): Promise<void> {
    restoreCamera(durationMs);
    await wait(durationMs, signal);
  },
};

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${EFFECT_LAYER_ID} {
      position: absolute;
      inset: 0;
      z-index: 22;
      pointer-events: none;
      opacity: 0;
      background: rgba(18, 24, 22, 0);
      transition: opacity 180ms linear, background 260ms linear;
    }
    #${EFFECT_LAYER_ID}.wp07b-flash { opacity: .78; background: rgba(236, 223, 174, .88); }
    #${EFFECT_LAYER_ID}.wp07b-impact { opacity: .9; background: rgba(103, 30, 33, .58); }
    #${EFFECT_LAYER_ID}.wp07b-gas { opacity: .72; background: rgba(119, 151, 93, .6); }
    #${EFFECT_LAYER_ID}.wp07b-blackout { opacity: 1; background: rgba(8, 12, 11, .98); transition-duration: 420ms; }
    #${DIALOGUE_ID} {
      position: absolute;
      left: 50%;
      bottom: max(26px, env(safe-area-inset-bottom));
      width: min(760px, calc(100% - 36px));
      transform: translateX(-50%);
      z-index: 24;
      box-sizing: border-box;
      padding: 15px 18px 14px;
      border: 3px solid #f2dfae;
      outline: 4px solid rgba(37, 54, 47, .94);
      background: rgba(28, 43, 37, .96);
      color: #f2dfae;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      box-shadow: 0 9px 0 rgba(20, 29, 26, .45);
      pointer-events: none;
    }
    #${DIALOGUE_ID}[hidden] { display: none; }
    #${DIALOGUE_ID} .wp07b-speaker {
      color: #9fcbb6;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    #${DIALOGUE_ID} .wp07b-text { font-size: clamp(16px, 2vw, 20px); font-weight: 700; line-height: 1.34; }
    #${DIALOGUE_ID} .wp07b-hint { margin-top: 8px; color: #d9c78f; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-align: right; }
    @keyframes wp07b-shudder { 0%,100% { translate: 0 0; } 25% { translate: -7px 3px; } 50% { translate: 6px -2px; } 75% { translate: -3px -4px; } }
    #game.wp07b-shudder { animation: wp07b-shudder 220ms steps(2, jump-none); }
  `;
  document.head.append(style);
}

function ensureCanvas(): HTMLCanvasElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let canvas = document.getElementById(OVERLAY_CANVAS_ID) as HTMLCanvasElement | null;
  if (canvas) return canvas;
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
  canvas.style.zIndex = '21';
  canvas.style.pointerEvents = 'none';
  canvas.style.imageRendering = 'pixelated';
  root.append(canvas);
  return canvas;
}

function ensureEffectLayer(): HTMLDivElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let layer = document.getElementById(EFFECT_LAYER_ID) as HTMLDivElement | null;
  if (!layer) {
    layer = document.createElement('div');
    layer.id = EFFECT_LAYER_ID;
    layer.setAttribute('aria-hidden', 'true');
    root.append(layer);
  }
  return layer;
}

function ensureDialogue(): HTMLDivElement | null {
  const root = document.getElementById('game');
  if (!root) return null;
  let box = document.getElementById(DIALOGUE_ID) as HTMLDivElement | null;
  if (!box) {
    box = document.createElement('div');
    box.id = DIALOGUE_ID;
    box.hidden = true;
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="wp07b-speaker"></div><div class="wp07b-text"></div><div class="wp07b-hint"></div>';
    root.append(box);
  }
  return box;
}

function showDialogue(detail: CutsceneDialogueEventDetail): void {
  const cue = RINOCOW_DISASTER_DIALOGUE[detail.cueId];
  if (!cue) return;
  const box = ensureDialogue();
  if (!box) return;
  const speaker = box.querySelector('.wp07b-speaker');
  const text = box.querySelector('.wp07b-text');
  const hint = box.querySelector('.wp07b-hint');
  if (speaker) speaker.textContent = cue.speaker;
  if (text) text.textContent = cue.text;
  if (hint) hint.textContent = detail.timed ? '' : 'ACTION / CONFIRM';
  box.hidden = false;
  debugState.currentCueId = detail.cueId;
}

function hideDialogue(): void {
  const box = document.getElementById(DIALOGUE_ID) as HTMLDivElement | null;
  if (box) box.hidden = true;
  debugState.currentCueId = null;
}

function pulseEffect(className: string, durationMs: number): void {
  const layer = ensureEffectLayer();
  if (!layer) return;
  layer.className = className;
  window.setTimeout(() => {
    if (blackoutActive) layer.className = 'wp07b-blackout';
    else if (gasHazeActive) layer.className = 'wp07b-gas';
    else layer.className = '';
  }, durationMs);
}

function shudder(): void {
  const root = document.getElementById('game');
  if (!root) return;
  root.classList.remove('wp07b-shudder');
  void root.offsetWidth;
  root.classList.add('wp07b-shudder');
  window.setTimeout(() => root.classList.remove('wp07b-shudder'), 260);
}

function handleTransition(detail: CutsceneTransitionEventDetail): void {
  debugState.currentTransitionId = detail.transitionId;
  debugState.transitions.push(detail.transitionId);
  if (detail.transitionId === RINOCOW_DISASTER_TRANSITIONS.BREACH) {
    pulseEffect('wp07b-flash', Math.max(180, detail.durationMs));
    shudder();
  } else if (detail.transitionId === RINOCOW_DISASTER_TRANSITIONS.IMPACT) {
    pulseEffect('wp07b-impact', Math.max(180, detail.durationMs));
    shudder();
  } else if (detail.transitionId === RINOCOW_DISASTER_TRANSITIONS.GAS) {
    gasHazeActive = true;
    ensureEffectLayer()?.setAttribute('class', 'wp07b-gas');
  } else if (detail.transitionId === RINOCOW_DISASTER_TRANSITIONS.BLACKOUT) {
    blackoutActive = true;
    ensureEffectLayer()?.setAttribute('class', 'wp07b-blackout');
  } else if (detail.transitionId === RINOCOW_DISASTER_TRANSITIONS.BLACKOUT_RELEASE) {
    blackoutActive = false;
    gasHazeActive = false;
    ensureEffectLayer()?.setAttribute('class', '');
  }
  window.setTimeout(() => {
    if (debugState.currentTransitionId === detail.transitionId) debugState.currentTransitionId = null;
  }, Math.max(0, detail.durationMs));
}

function handleFlag(detail: CutsceneFlagEventDetail): void {
  debugState.flags[detail.flag] = detail.value;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.BREACH_STARTED) debugState.breachStarted = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.MASTER_DEAD) debugState.masterDead = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.GAS_RELEASED) debugState.gasReleased = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.RINOCOW_DEAD) debugState.rinocowDead = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.PLAYER_ALONE) debugState.playerAlone = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.PLAYER_SURVIVED) debugState.playerSurvived = detail.value === true;
  if (detail.flag === RINOCOW_DISASTER_FLAGS.COMPLETE) debugState.completed = detail.value === true;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawViktor(ctx: CanvasRenderingContext2D): void {
  const x = viktor.x;
  const y = viktor.y;
  rect(ctx, x - 15, y - 66, 30, 36, '#eee1b9');
  rect(ctx, x - 19, y - 33, 38, 38, '#d9d6bd');
  rect(ctx, x - 16, y - 29, 32, 26, '#f0eee1');
  rect(ctx, x - 14, y + 3, 10, 22, '#3f4b46');
  rect(ctx, x + 4, y + 3, 10, 22, '#3f4b46');
  rect(ctx, x - 20, y - 27, 6, 30, '#f0eee1');
  rect(ctx, x + 14, y - 27, 6, 30, '#f0eee1');
  rect(ctx, x - 9, y - 59, 5, 5, '#26382f');
  rect(ctx, x + 5, y - 59, 5, 5, '#26382f');
  rect(ctx, x - 18, y - 72, 36, 8, '#d3cfb3');
  rect(ctx, x - 11, y - 79, 22, 9, '#e4e0c7');
  rect(ctx, x + 18, y - 19, 11, 7, '#c95a52');
}

function drawDeadViktor(ctx: CanvasRenderingContext2D): void {
  const x = 984;
  const y = 650;
  ctx.fillStyle = 'rgba(27, 38, 34, .32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 7, 45, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  rect(ctx, x - 42, y - 4, 68, 15, '#eee9d8');
  rect(ctx, x + 18, y - 9, 34, 12, '#d9d6bd');
  rect(ctx, x - 36, y + 8, 18, 7, '#3f4b46');
  rect(ctx, x + 36, y + 2, 22, 7, '#3f4b46');
  rect(ctx, x + 47, y - 13, 15, 14, '#e6d6ae');
  rect(ctx, x + 52, y - 9, 4, 4, '#26382f');
}

function drawRinoCow(ctx: CanvasRenderingContext2D, dead: boolean): void {
  const x = rinocow.x;
  const y = rinocow.y;
  if (dead) {
    rect(ctx, x - 76, y - 24, 142, 32, '#625b4b');
    rect(ctx, x + 48, y - 20, 54, 26, '#756d58');
    rect(ctx, x + 84, y - 28, 34, 8, '#ddcfaa');
    rect(ctx, x - 50, y + 7, 22, 9, '#514c42');
    rect(ctx, x + 20, y + 7, 22, 9, '#514c42');
    return;
  }
  rect(ctx, x - 64, y - 54, 126, 58, '#756d58');
  rect(ctx, x - 86, y - 43, 48, 42, '#857a61');
  rect(ctx, x + 48, y - 63, 56, 49, '#756d58');
  rect(ctx, x + 74, y - 78, 34, 24, '#8d8065');
  rect(ctx, x + 93, y - 83, 29, 11, '#ddcfaa');
  rect(ctx, x + 116, y - 88, 38, 7, '#ddcfaa');
  rect(ctx, x - 50, y, 18, 47, '#625b4b');
  rect(ctx, x + 26, y, 18, 47, '#625b4b');
  rect(ctx, x + 80, y - 69, 6, 6, '#c95a52');
  rect(ctx, x - 77, y - 27, 13, 9, '#c77b85');
}

function drawBrokenContainment(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 1368, 394, 270, 212, 'rgba(40, 61, 56, .92)');
  rect(ctx, 1390, 408, 226, 176, 'rgba(103, 123, 102, .88)');
  for (const [x, y, w, h] of [
    [1382, 430, 58, 18], [1440, 472, 92, 25], [1518, 420, 70, 20], [1482, 548, 108, 19], [1582, 506, 44, 24],
  ] as const) rect(ctx, x, y, w, h, 'rgba(55, 75, 68, .92)');
  rect(ctx, 1492, 388, 9, 218, '#26382f');
  rect(ctx, 1503, 456, 42, 8, '#9dc8bc');
  rect(ctx, 1450, 518, 37, 7, '#9dc8bc');
}

function renderOverlay(): void {
  const canvas = ensureCanvas();
  const ctx = canvas?.getContext('2d', { alpha: true }) ?? null;
  const lab = masterLab();
  const active = Boolean(lab?.active && lab?.rendered);
  if (canvas) canvas.style.display = active ? 'block' : 'none';
  const dialogue = document.getElementById(DIALOGUE_ID) as HTMLDivElement | null;
  if (!active && dialogue) dialogue.hidden = true;
  if (!active || !canvas || !ctx) {
    requestAnimationFrame(renderOverlay);
    return;
  }

  if (debugState.currentCueId !== null) {
    const cutsceneDebug = (globalThis as unknown as { __SPLICEPIT_CUTSCENE__?: { state?: { dialogueCueId?: string | null } } }).__SPLICEPIT_CUTSCENE__;
    if (cutsceneDebug?.state?.dialogueCueId == null) hideDialogue();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(-(lab?.cameraX ?? 0), -(lab?.cameraY ?? 0));

  if (debugState.breachStarted) drawBrokenContainment(ctx);
  if (!debugState.masterDead) drawViktor(ctx);
  else drawDeadViktor(ctx);
  if (debugState.breachStarted) drawRinoCow(ctx, debugState.rinocowDead);

  ctx.restore();
  requestAnimationFrame(renderOverlay);
}

async function startDisaster(): Promise<void> {
  if (startPromise) return startPromise;
  const lab = masterLab();
  if (!lab?.active) throw new Error('WP0.7B RinoCow disaster requires the active Master Lab.');
  if (debugState.completed) return;

  debugState.started = true;
  debugState.status = 'running';
  debugState.error = null;
  const unregisterViktor = browserCutsceneRegistry.registerActor('viktor', actorAdapter(viktor));
  const unregisterRinoCow = browserCutsceneRegistry.registerActor('rinocow', actorAdapter(rinocow));
  const unregisterCamera = browserCutsceneRegistry.setCamera(cameraAdapter);

  startPromise = (async () => {
    try {
      await browserCutsceneRuntime.play(RINOCOW_DISASTER_CUTSCENE);
      debugState.completed = true;
      debugState.status = 'completed';
    } catch (error) {
      debugState.status = 'failed';
      debugState.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      hideDialogue();
      restoreCamera(0);
      unregisterCamera();
      unregisterRinoCow();
      unregisterViktor();
    }
  })();
  return startPromise;
}

function autoStart(): void {
  if (!debugState.started && !debugState.completed) {
    const lab = masterLab();
    if (lab?.active && lab.stageId === 'master-stage') void startDisaster();
  }
  window.setTimeout(autoStart, 80);
}

window.addEventListener(CUTSCENE_DIALOGUE_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneDialogueEventDetail>).detail;
  if (RINOCOW_DISASTER_DIALOGUE[detail?.cueId]) showDialogue(detail);
});
window.addEventListener(CUTSCENE_FLAG_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneFlagEventDetail>).detail;
  if (detail) handleFlag(detail);
});
window.addEventListener(CUTSCENE_TRANSITION_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneTransitionEventDetail>).detail;
  if (detail) handleTransition(detail);
});

ensureStyles();
ensureCanvas();
ensureEffectLayer();
ensureDialogue();
(globalThis as DisasterGlobal).__SPLICEPIT_RINOCOW_DISASTER__ = { state: debugState, start: startDisaster };
requestAnimationFrame(renderOverlay);
autoStart();
