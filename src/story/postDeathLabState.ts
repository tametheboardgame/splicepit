export type PostDeathLabPhase = 'pre-disaster' | 'post-death';
export type PostDeathMasterLabState = 'pre-disaster' | 'aftermath';

export interface PostDeathLabSnapshot {
  readonly phase: PostDeathLabPhase;
  readonly active: boolean;
  readonly masterPresent: boolean;
  readonly masterLabState: PostDeathMasterLabState;
  readonly spliceBenchReady: boolean;
  readonly spliceBenchInteractionCount: number;
}

type PostDeathLabListener = (snapshot: PostDeathLabSnapshot) => void;

export class PostDeathLabStateController {
  private phase: PostDeathLabPhase = 'pre-disaster';
  private spliceBenchInteractionCount = 0;
  private readonly listeners = new Set<PostDeathLabListener>();

  snapshot(): PostDeathLabSnapshot {
    const active = this.phase === 'post-death';
    return {
      phase: this.phase,
      active,
      masterPresent: !active,
      masterLabState: active ? 'aftermath' : 'pre-disaster',
      spliceBenchReady: active,
      spliceBenchInteractionCount: this.spliceBenchInteractionCount,
    };
  }

  isActive(): boolean {
    return this.phase === 'post-death';
  }

  activateAfterDisaster(): boolean {
    if (this.phase === 'post-death') return false;
    this.phase = 'post-death';
    this.emit();
    return true;
  }

  requestSpliceBench(): boolean {
    if (!this.isActive()) return false;
    this.spliceBenchInteractionCount += 1;
    this.emit();
    return true;
  }

  resetForNewGame(): void {
    if (this.phase === 'pre-disaster' && this.spliceBenchInteractionCount === 0) return;
    this.phase = 'pre-disaster';
    this.spliceBenchInteractionCount = 0;
    this.emit();
  }

  subscribe(listener: PostDeathLabListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

export const postDeathLabState = new PostDeathLabStateController();
