export type CutsceneFacing = 'down' | 'left' | 'right' | 'up';
export type CutsceneCorruptionIntensity = 'blink' | 'rupture' | 'linger';
export type CutsceneFlagValue = boolean | number | string | null;

export interface CutscenePoint {
  readonly x: number;
  readonly y: number;
}

export type CutsceneStep =
  | { readonly kind: 'wait'; readonly durationMs: number }
  | { readonly kind: 'control'; readonly locked: boolean }
  | { readonly kind: 'camera-focus'; readonly target: CutscenePoint; readonly durationMs?: number }
  | { readonly kind: 'camera-release'; readonly durationMs?: number }
  | { readonly kind: 'move'; readonly actorId: string; readonly target: CutscenePoint; readonly speed?: number; readonly facing?: CutsceneFacing }
  | { readonly kind: 'face'; readonly actorId: string; readonly facing: CutsceneFacing }
  | { readonly kind: 'dialogue'; readonly cueId: string; readonly durationMs?: number }
  | { readonly kind: 'flag'; readonly flag: string; readonly value: CutsceneFlagValue }
  | { readonly kind: 'transition'; readonly transitionId: string; readonly durationMs?: number }
  | { readonly kind: 'corruption'; readonly intensity: CutsceneCorruptionIntensity };

export interface CutsceneDefinition {
  readonly id: string;
  readonly steps: readonly CutsceneStep[];
  readonly lockPlayer?: boolean;
  readonly suppressAmbientCorruption?: boolean;
}

export interface CutsceneRuntimeAdapter {
  readonly now: () => number;
  readonly wait: (durationMs: number, signal: AbortSignal) => Promise<void>;
  readonly setPlayerControlLocked: (locked: boolean) => void | Promise<void>;
  readonly focusCamera: (target: CutscenePoint, durationMs: number, signal: AbortSignal) => Promise<void>;
  readonly releaseCamera: (durationMs: number, signal: AbortSignal) => Promise<void>;
  readonly moveActor: (
    actorId: string,
    target: CutscenePoint,
    options: { readonly speed?: number; readonly facing?: CutsceneFacing },
    signal: AbortSignal,
  ) => Promise<void>;
  readonly faceActor: (actorId: string, facing: CutsceneFacing) => void | Promise<void>;
  readonly showDialogue: (cueId: string, durationMs: number | undefined, signal: AbortSignal) => Promise<void>;
  readonly setEventFlag: (flag: string, value: CutsceneFlagValue) => void | Promise<void>;
  readonly transition: (transitionId: string, durationMs: number, signal: AbortSignal) => Promise<void>;
  readonly triggerCorruption: (intensity: CutsceneCorruptionIntensity) => void | Promise<void>;
  readonly setAmbientCorruptionSuppressed: (suppressed: boolean) => void | Promise<void>;
}

export type CutsceneRuntimeStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'failed';

export interface CutsceneRuntimeSnapshot {
  readonly status: CutsceneRuntimeStatus;
  readonly sceneId: string | null;
  readonly stepIndex: number;
  readonly stepKind: CutsceneStep['kind'] | null;
  readonly startedAt: number | null;
  readonly completedSceneId: string | null;
  readonly error: string | null;
}

const DEFAULT_CAMERA_DURATION_MS = 320;
const DEFAULT_TRANSITION_DURATION_MS = 180;

function safeDuration(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class CutsceneRuntime {
  private readonly adapter: CutsceneRuntimeAdapter;
  private status: CutsceneRuntimeStatus = 'idle';
  private sceneId: string | null = null;
  private stepIndex = -1;
  private stepKind: CutsceneStep['kind'] | null = null;
  private startedAt: number | null = null;
  private completedSceneId: string | null = null;
  private error: string | null = null;
  private abortController: AbortController | null = null;
  private controlLocked = false;
  private ambientSuppressed = false;
  private cameraFocused = false;

  constructor(adapter: CutsceneRuntimeAdapter) {
    this.adapter = adapter;
  }

  snapshot(): CutsceneRuntimeSnapshot {
    return {
      status: this.status,
      sceneId: this.sceneId,
      stepIndex: this.stepIndex,
      stepKind: this.stepKind,
      startedAt: this.startedAt,
      completedSceneId: this.completedSceneId,
      error: this.error,
    };
  }

  isRunning(): boolean {
    return this.status === 'running';
  }

  cancel(): boolean {
    if (!this.abortController || this.status !== 'running') return false;
    this.abortController.abort();
    return true;
  }

  async play(definition: CutsceneDefinition): Promise<void> {
    if (!definition.id.trim()) throw new Error('Cutscene definitions require an id.');
    if (this.isRunning()) throw new Error(`Cutscene ${this.sceneId ?? 'unknown'} is already running.`);

    const abortController = new AbortController();
    this.abortController = abortController;
    this.status = 'running';
    this.sceneId = definition.id;
    this.stepIndex = -1;
    this.stepKind = null;
    this.startedAt = this.adapter.now();
    this.completedSceneId = null;
    this.error = null;
    this.controlLocked = false;
    this.ambientSuppressed = false;
    this.cameraFocused = false;

    try {
      if (definition.lockPlayer !== false) await this.setControlLocked(true);
      if (definition.suppressAmbientCorruption !== false) await this.setAmbientSuppressed(true);

      for (let index = 0; index < definition.steps.length; index += 1) {
        if (abortController.signal.aborted) throw new DOMException('Cutscene cancelled', 'AbortError');
        const step = definition.steps[index];
        this.stepIndex = index;
        this.stepKind = step.kind;
        await this.executeStep(step, abortController.signal);
      }

      this.status = 'completed';
      this.completedSceneId = definition.id;
    } catch (error) {
      if (abortController.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        this.status = 'cancelled';
      } else {
        this.status = 'failed';
        this.error = errorMessage(error);
        throw error;
      }
    } finally {
      await this.cleanup(abortController.signal);
      if (this.abortController === abortController) this.abortController = null;
      this.sceneId = null;
      this.stepKind = null;
    }
  }

  private async executeStep(step: CutsceneStep, signal: AbortSignal): Promise<void> {
    switch (step.kind) {
      case 'wait':
        await this.adapter.wait(safeDuration(step.durationMs, 0), signal);
        return;
      case 'control':
        await this.setControlLocked(step.locked);
        return;
      case 'camera-focus':
        await this.adapter.focusCamera(step.target, safeDuration(step.durationMs, DEFAULT_CAMERA_DURATION_MS), signal);
        this.cameraFocused = true;
        return;
      case 'camera-release':
        await this.adapter.releaseCamera(safeDuration(step.durationMs, DEFAULT_CAMERA_DURATION_MS), signal);
        this.cameraFocused = false;
        return;
      case 'move':
        await this.adapter.moveActor(step.actorId, step.target, { speed: step.speed, facing: step.facing }, signal);
        return;
      case 'face':
        await this.adapter.faceActor(step.actorId, step.facing);
        return;
      case 'dialogue':
        await this.adapter.showDialogue(step.cueId, step.durationMs === undefined ? undefined : safeDuration(step.durationMs, 0), signal);
        return;
      case 'flag':
        await this.adapter.setEventFlag(step.flag, step.value);
        return;
      case 'transition':
        await this.adapter.transition(step.transitionId, safeDuration(step.durationMs, DEFAULT_TRANSITION_DURATION_MS), signal);
        return;
      case 'corruption':
        await this.adapter.triggerCorruption(step.intensity);
        return;
    }
  }

  private async setControlLocked(locked: boolean): Promise<void> {
    if (this.controlLocked === locked) return;
    await this.adapter.setPlayerControlLocked(locked);
    this.controlLocked = locked;
  }

  private async setAmbientSuppressed(suppressed: boolean): Promise<void> {
    if (this.ambientSuppressed === suppressed) return;
    await this.adapter.setAmbientCorruptionSuppressed(suppressed);
    this.ambientSuppressed = suppressed;
  }

  private async cleanup(signal: AbortSignal): Promise<void> {
    const cleanupSignal = signal.aborted ? new AbortController().signal : signal;
    if (this.cameraFocused) {
      try {
        await this.adapter.releaseCamera(0, cleanupSignal);
      } catch {
        // Cleanup must continue so player control and ambient corruption are restored.
      }
      this.cameraFocused = false;
    }
    if (this.ambientSuppressed) {
      try {
        await this.setAmbientSuppressed(false);
      } catch {
        this.ambientSuppressed = false;
      }
    }
    if (this.controlLocked) {
      try {
        await this.setControlLocked(false);
      } catch {
        this.controlLocked = false;
      }
    }
  }
}
