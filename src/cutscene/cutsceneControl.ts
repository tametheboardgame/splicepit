export class CutsceneControlGate {
  private readonly locks = new Set<string>();

  lock(reason: string): void {
    if (!reason) throw new Error('Cutscene control locks require a reason.');
    this.locks.add(reason);
  }

  unlock(reason: string): void {
    this.locks.delete(reason);
  }

  isLocked(): boolean {
    return this.locks.size > 0;
  }

  reasons(): readonly string[] {
    return [...this.locks].sort();
  }

  reset(): void {
    this.locks.clear();
  }
}

export const cutsceneControlGate = new CutsceneControlGate();
