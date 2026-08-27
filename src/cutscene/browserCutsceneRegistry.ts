import type { CutsceneFacing, CutscenePoint } from './cutsceneRuntime.js';

export interface BrowserCutsceneActor {
  moveTo: (
    target: CutscenePoint,
    options: { readonly speed?: number; readonly facing?: CutsceneFacing },
    signal: AbortSignal,
  ) => Promise<void>;
  face: (facing: CutsceneFacing) => void | Promise<void>;
}

export interface BrowserCutsceneCamera {
  focus: (target: CutscenePoint, durationMs: number, signal: AbortSignal) => Promise<void>;
  release: (durationMs: number, signal: AbortSignal) => Promise<void>;
}

export class BrowserCutsceneRegistry {
  private readonly actors = new Map<string, BrowserCutsceneActor>();
  private camera: BrowserCutsceneCamera | null = null;

  registerActor(actorId: string, actor: BrowserCutsceneActor): () => void {
    if (!actorId.trim()) throw new Error('Cutscene actor ids cannot be blank.');
    this.actors.set(actorId, actor);
    return () => {
      if (this.actors.get(actorId) === actor) this.actors.delete(actorId);
    };
  }

  actor(actorId: string): BrowserCutsceneActor {
    const actor = this.actors.get(actorId);
    if (!actor) throw new Error(`Cutscene actor is not registered: ${actorId}`);
    return actor;
  }

  setCamera(camera: BrowserCutsceneCamera): () => void {
    this.camera = camera;
    return () => {
      if (this.camera === camera) this.camera = null;
    };
  }

  activeCamera(): BrowserCutsceneCamera {
    if (!this.camera) throw new Error('No cutscene camera is registered for the active scene.');
    return this.camera;
  }

  snapshot(): { readonly actorIds: readonly string[]; readonly cameraRegistered: boolean } {
    return {
      actorIds: [...this.actors.keys()].sort(),
      cameraRegistered: this.camera !== null,
    };
  }
}

export const browserCutsceneRegistry = new BrowserCutsceneRegistry();
