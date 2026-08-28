import { resolveDarkLayerStoryCue, type DarkLayerStoryCue } from '../environment/darkLayerStoryLanguage.js';
import { ACTIONS, SEMANTIC_INPUT_EVENT, type SemanticInputEventDetail } from '../input/actions.js';
import { browserCutsceneRegistry } from './browserCutsceneRegistry.js';
import { cutsceneControlGate } from './cutsceneControl.js';
import {
  CutsceneRuntime,
  type CutsceneDefinition,
  type CutsceneFlagValue,
  type CutsceneRuntimeAdapter,
  type CutsceneRuntimeSnapshot,
} from './cutsceneRuntime.js';

export const CUTSCENE_DIALOGUE_EVENT = 'splicepit:cutscene-dialogue';
export const CUTSCENE_FLAG_EVENT = 'splicepit:cutscene-flag';
export const CUTSCENE_TRANSITION_EVENT = 'splicepit:cutscene-transition';
const CONTROL_LOCK_REASON = 'wp0.7a-cutscene-runtime';
const CORRUPTION_SUPPRESSION_REASON = 'cutscene-runtime';

type CorruptionGlobal = {
  triggerAuthored?: (locationId?: never, intensity?: 'blink' | 'rupture' | 'linger') => void;
  triggerStory?: (cue: DarkLayerStoryCue, locationId?: never) => void;
  suppress?: (reason?: string) => void;
  resume?: (reason?: string) => void;
};

type RuntimeGlobal = typeof globalThis & {
  __SPLICEPIT_CORRUPTION__?: CorruptionGlobal;
  __SPLICEPIT_CUTSCENE__?: BrowserCutsceneDebugControl;
};

export interface CutsceneDialogueEventDetail {
  readonly cueId: string;
  readonly timed: boolean;
  readonly durationMs: number | null;
}

export interface CutsceneFlagEventDetail {
  readonly flag: string;
  readonly value: CutsceneFlagValue;
}

export interface CutsceneTransitionEventDetail {
  readonly transitionId: string;
  readonly durationMs: number;
}

export type BrowserCutsceneDebugState = CutsceneRuntimeSnapshot & {
  ready: true;
  controlLocked: boolean;
  controlLockReasons: readonly string[];
  ambientSuppressed: boolean;
  dialogueCueId: string | null;
  actorIds: readonly string[];
  cameraRegistered: boolean;
  flags: Readonly<Record<string, CutsceneFlagValue>>;
};

export type BrowserCutsceneDebugControl = {
  state: BrowserCutsceneDebugState;
  play: (definition: CutsceneDefinition) => Promise<void>;
  cancel: () => boolean;
  advanceDialogue: () => boolean;
  clearFlags: () => void;
};

const flags = new Map<string, CutsceneFlagValue>();
let ambientSuppressed = false;
let dialogueAdvance: (() => void) | null = null;
let dialogueCueId: string | null = null;

function wait(durationMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new DOMException('Cutscene cancelled', 'AbortError'));
  if (durationMs <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const handle = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, durationMs);
    const onAbort = (): void => {
      window.clearTimeout(handle);
      reject(new DOMException('Cutscene cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function showDialogue(cueId: string, durationMs: number | undefined, signal: AbortSignal): Promise<void> {
  if (!cueId.trim()) throw new Error('Cutscene dialogue cues require an id.');
  dialogueCueId = cueId;
  window.dispatchEvent(new CustomEvent<CutsceneDialogueEventDetail>(CUTSCENE_DIALOGUE_EVENT, {
    detail: { cueId, timed: durationMs !== undefined, durationMs: durationMs ?? null },
  }));

  try {
    if (durationMs !== undefined) {
      await wait(durationMs, signal);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const onAbort = (): void => {
        dialogueAdvance = null;
        reject(new DOMException('Cutscene cancelled', 'AbortError'));
      };
      dialogueAdvance = () => {
        signal.removeEventListener('abort', onAbort);
        dialogueAdvance = null;
        resolve();
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });
  } finally {
    dialogueCueId = null;
  }
}

const adapter: CutsceneRuntimeAdapter = {
  now: () => performance.now(),
  wait,
  setPlayerControlLocked(locked): void {
    if (locked) cutsceneControlGate.lock(CONTROL_LOCK_REASON);
    else cutsceneControlGate.unlock(CONTROL_LOCK_REASON);
  },
  focusCamera(target, durationMs, signal): Promise<void> {
    return browserCutsceneRegistry.activeCamera().focus(target, durationMs, signal);
  },
  releaseCamera(durationMs, signal): Promise<void> {
    return browserCutsceneRegistry.activeCamera().release(durationMs, signal);
  },
  moveActor(actorId, target, options, signal): Promise<void> {
    return browserCutsceneRegistry.actor(actorId).moveTo(target, options, signal);
  },
  faceActor(actorId, facing): void | Promise<void> {
    return browserCutsceneRegistry.actor(actorId).face(facing);
  },
  showDialogue,
  setEventFlag(flag, value): void {
    if (!flag.trim()) throw new Error('Cutscene event flags require an id.');
    flags.set(flag, value);
    window.dispatchEvent(new CustomEvent<CutsceneFlagEventDetail>(CUTSCENE_FLAG_EVENT, { detail: { flag, value } }));
  },
  async transition(transitionId, durationMs, signal): Promise<void> {
    if (!transitionId.trim()) throw new Error('Cutscene transitions require an id.');
    window.dispatchEvent(new CustomEvent<CutsceneTransitionEventDetail>(CUTSCENE_TRANSITION_EVENT, {
      detail: { transitionId, durationMs },
    }));
    await wait(durationMs, signal);
  },
  async triggerCorruption(cue, signal): Promise<void> {
    const corruption = (globalThis as RuntimeGlobal).__SPLICEPIT_CORRUPTION__;
    const preset = resolveDarkLayerStoryCue(cue);
    if (corruption?.triggerStory) corruption.triggerStory(cue, undefined as never);
    else corruption?.triggerAuthored?.(undefined as never, preset.intensity);
    await wait(preset.durationMs, signal);
  },
  setAmbientCorruptionSuppressed(suppressed): void {
    const corruption = (globalThis as RuntimeGlobal).__SPLICEPIT_CORRUPTION__;
    if (suppressed) corruption?.suppress?.(CORRUPTION_SUPPRESSION_REASON);
    else corruption?.resume?.(CORRUPTION_SUPPRESSION_REASON);
    ambientSuppressed = suppressed;
  },
};

export const browserCutsceneRuntime = new CutsceneRuntime(adapter);

const debugState: BrowserCutsceneDebugState = {
  ready: true,
  ...browserCutsceneRuntime.snapshot(),
  controlLocked: false,
  controlLockReasons: [],
  ambientSuppressed: false,
  dialogueCueId: null,
  actorIds: [],
  cameraRegistered: false,
  flags: {},
};

function syncDebug(): void {
  Object.assign(debugState, browserCutsceneRuntime.snapshot());
  const registry = browserCutsceneRegistry.snapshot();
  debugState.controlLocked = cutsceneControlGate.isLocked();
  debugState.controlLockReasons = cutsceneControlGate.reasons();
  debugState.ambientSuppressed = ambientSuppressed;
  debugState.dialogueCueId = dialogueCueId;
  debugState.actorIds = registry.actorIds;
  debugState.cameraRegistered = registry.cameraRegistered;
  debugState.flags = Object.fromEntries(flags);
}

const debugControl: BrowserCutsceneDebugControl = {
  state: debugState,
  async play(definition): Promise<void> {
    syncDebug();
    try {
      const run = browserCutsceneRuntime.play(definition);
      const monitor = (): void => {
        syncDebug();
        if (browserCutsceneRuntime.isRunning()) requestAnimationFrame(monitor);
      };
      requestAnimationFrame(monitor);
      await run;
    } finally {
      syncDebug();
    }
  },
  cancel(): boolean {
    const cancelled = browserCutsceneRuntime.cancel();
    syncDebug();
    return cancelled;
  },
  advanceDialogue(): boolean {
    if (!dialogueAdvance) return false;
    const advance = dialogueAdvance;
    advance();
    syncDebug();
    return true;
  },
  clearFlags(): void {
    flags.clear();
    syncDebug();
  },
};

function interceptKeyboard(event: KeyboardEvent): void {
  if (!cutsceneControlGate.isLocked()) return;
  if (dialogueAdvance && (event.code === 'Enter' || event.code === 'Space')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const advance = dialogueAdvance;
    advance();
    syncDebug();
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}

function interceptSemanticInput(event: Event): void {
  if (!cutsceneControlGate.isLocked()) return;
  const semantic = event as CustomEvent<SemanticInputEventDetail>;
  if (semantic.detail?.pressed === false) return;
  if (dialogueAdvance && semantic.detail?.pressed && (semantic.detail.action === ACTIONS.CONFIRM || semantic.detail.action === ACTIONS.INTERACT)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const advance = dialogueAdvance;
    advance();
    syncDebug();
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}

window.addEventListener('keydown', interceptKeyboard, { capture: true });
window.addEventListener(SEMANTIC_INPUT_EVENT, interceptSemanticInput, { capture: true });

(globalThis as RuntimeGlobal).__SPLICEPIT_CUTSCENE__ = debugControl;
requestAnimationFrame(function monitorDebug(): void {
  syncDebug();
  requestAnimationFrame(monitorDebug);
});
