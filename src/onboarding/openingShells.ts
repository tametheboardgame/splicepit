import { postDeathLabState } from '../story/postDeathLabState.js';

export type OpeningShellId = 'bag' | 'map';

export type OpeningInventoryKind = 'gear' | 'supplies';

export interface OpeningInventoryEntry {
  readonly id: string;
  readonly label: string;
  readonly kind: OpeningInventoryKind;
  readonly quantity: number;
  readonly description: string;
}

export type OpeningObjectiveId = 'yard-orientation' | 'find-master' | 'use-splice-bench';

export interface OpeningObjectiveDefinition {
  readonly id: OpeningObjectiveId;
  readonly title: string;
  readonly detail: string;
  readonly trackerText?: string;
}

export const OPENING_INVENTORY: readonly OpeningInventoryEntry[] = [
  {
    id: 'apprentice-kit',
    label: 'Apprentice Kit',
    kind: 'gear',
    quantity: 1,
    description: 'Basic Yard tools issued to every new splice apprentice.',
  },
  {
    id: 'sample-vials',
    label: 'Empty Sample Vials',
    kind: 'supplies',
    quantity: 3,
    description: 'Clean containers for biological samples you have not collected yet.',
  },
] as const;

export const OPENING_OBJECTIVES: readonly OpeningObjectiveDefinition[] = [
  {
    id: 'yard-orientation',
    title: 'Get your bearings',
    detail: 'Learn movement, interaction, your Bag and the Map before leaving the Apprentice Splicer Yard.',
    trackerText: 'Learn the Yard controls before you leave.',
  },
  {
    id: 'find-master',
    title: 'Find your Master',
    detail: 'Your Master is waiting for you. The splice fight of his life is about to start, and he owes some very bad people a great deal of money. Follow the marked LAB route and get to him before this gets worse.',
    trackerText: 'His make-or-break fight is starting. Follow the LAB route.',
  },
] as const;

export const POST_DEATH_LAB_OBJECTIVE: OpeningObjectiveDefinition = {
  id: 'use-splice-bench',
  title: 'Use the splice bench',
  detail: 'Viktor is dead, the lab is wrecked, and tonight’s Pit booking is still active. Get to the Primary Splice Bench. You need something that can fight.',
  trackerText: 'Get to the Primary Splice Bench.',
};

export class OpeningShellController {
  private shell: OpeningShellId | null = null;
  private objectiveIndex = 0;

  constructor(
    private readonly objectives: readonly OpeningObjectiveDefinition[] = OPENING_OBJECTIVES,
    private readonly inventoryEntries: readonly OpeningInventoryEntry[] = OPENING_INVENTORY,
  ) {
    if (objectives.length === 0) throw new Error('Opening objective catalogue cannot be empty.');
    if (new Set(objectives.map((objective) => objective.id)).size !== objectives.length) {
      throw new Error('Opening objective ids must be unique.');
    }
    if (new Set(inventoryEntries.map((entry) => entry.id)).size !== inventoryEntries.length) {
      throw new Error('Opening inventory ids must be unique.');
    }
  }

  activeShell(): OpeningShellId | null {
    return this.shell;
  }

  isOpen(): boolean {
    return this.shell !== null;
  }

  toggle(shell: OpeningShellId): OpeningShellId | null {
    this.shell = this.shell === shell ? null : shell;
    return this.shell;
  }

  closeShell(): void {
    this.shell = null;
  }

  inventory(): readonly OpeningInventoryEntry[] {
    return this.inventoryEntries;
  }

  currentObjective(): OpeningObjectiveDefinition {
    if (postDeathLabState.isActive()) return POST_DEATH_LAB_OBJECTIVE;
    return this.objectives[this.objectiveIndex];
  }

  objectiveStep(): number {
    return postDeathLabState.isActive() ? this.objectives.length + 1 : this.objectiveIndex + 1;
  }

  objectiveCount(): number {
    return this.objectives.length + (postDeathLabState.isActive() ? 1 : 0);
  }

  advanceObjective(): boolean {
    if (postDeathLabState.isActive() || this.objectiveIndex >= this.objectives.length - 1) return false;
    this.objectiveIndex += 1;
    return true;
  }

  setObjective(id: OpeningObjectiveId): boolean {
    if (id === POST_DEATH_LAB_OBJECTIVE.id) return postDeathLabState.isActive();
    const nextIndex = this.objectives.findIndex((objective) => objective.id === id);
    if (nextIndex < 0 || nextIndex === this.objectiveIndex) return false;
    this.objectiveIndex = nextIndex;
    return true;
  }

  reset(): void {
    this.shell = null;
    this.objectiveIndex = 0;
  }
}
