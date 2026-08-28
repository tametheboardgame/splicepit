import type { PostDeathLabSnapshot } from './postDeathLabState.js';

export type DebtEncounterPhase = 'locked' | 'armed' | 'running' | 'completed';

export interface DebtEncounterSnapshot {
  readonly phase: DebtEncounterPhase;
  readonly armed: boolean;
  readonly running: boolean;
  readonly completed: boolean;
  readonly inheritedDebtConfirmed: boolean;
  readonly encounterCount: number;
}

type DebtEncounterListener = (snapshot: DebtEncounterSnapshot) => void;

export function shouldArmDebtEncounter(postDeath: Pick<PostDeathLabSnapshot, 'active' | 'spliceBenchInteractionCount'>): boolean {
  return postDeath.active && postDeath.spliceBenchInteractionCount > 0;
}

export class DebtEncounterStateController {
  private phase: DebtEncounterPhase = 'locked';
  private encounterCount = 0;
  private readonly listeners = new Set<DebtEncounterListener>();

  snapshot(): DebtEncounterSnapshot {
    return {
      phase: this.phase,
      armed: this.phase === 'armed',
      running: this.phase === 'running',
      completed: this.phase === 'completed',
      inheritedDebtConfirmed: this.phase === 'completed',
      encounterCount: this.encounterCount,
    };
  }

  armForPitRoute(): boolean {
    if (this.phase !== 'locked') return false;
    this.phase = 'armed';
    this.emit();
    return true;
  }

  beginEncounter(): boolean {
    if (this.phase !== 'armed') return false;
    this.phase = 'running';
    this.encounterCount += 1;
    this.emit();
    return true;
  }

  completeEncounter(): boolean {
    if (this.phase !== 'running') return false;
    this.phase = 'completed';
    this.emit();
    return true;
  }

  cancelEncounter(): boolean {
    if (this.phase !== 'running') return false;
    this.phase = 'armed';
    this.emit();
    return true;
  }

  resetForNewGame(): void {
    if (this.phase === 'locked' && this.encounterCount === 0) return;
    this.phase = 'locked';
    this.encounterCount = 0;
    this.emit();
  }

  subscribe(listener: DebtEncounterListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

export const debtEncounterState = new DebtEncounterStateController();
