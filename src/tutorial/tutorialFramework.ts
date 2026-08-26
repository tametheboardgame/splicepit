import {
  ACTIONS,
  DEFAULT_BINDINGS,
  preferredInputHint,
  type SemanticAction,
  type SemanticBindingProfile,
} from '../input/actions.js';

export type TutorialPromptId =
  | 'movement'
  | 'interact'
  | 'confirm-cancel'
  | 'bag'
  | 'map'
  | 'splice'
  | 'battle';

export type TutorialCompletionMode = 'any' | 'all' | 'manual';

export interface TutorialPromptDefinition {
  readonly id: TutorialPromptId;
  readonly title: string;
  readonly body: string;
  readonly actions: readonly SemanticAction[];
  readonly completion: {
    readonly mode: TutorialCompletionMode;
    readonly actions?: readonly SemanticAction[];
  };
}

export interface TutorialPromptHint {
  readonly action: SemanticAction;
  readonly label: string;
}

export interface TutorialPromptView {
  readonly id: TutorialPromptId;
  readonly title: string;
  readonly body: string;
  readonly hints: readonly TutorialPromptHint[];
  readonly alpha: number;
  readonly completing: boolean;
}

export const TUTORIAL_PROMPT_FADE_MS = 320;

export const OPENING_TUTORIAL_PROMPTS: readonly TutorialPromptDefinition[] = [
  {
    id: 'movement',
    title: 'Move',
    body: 'Have a look around the Apprentice Yard.',
    actions: [ACTIONS.MOVE_UP, ACTIONS.MOVE_LEFT, ACTIONS.MOVE_DOWN, ACTIONS.MOVE_RIGHT],
    completion: {
      mode: 'any',
      actions: [ACTIONS.MOVE_UP, ACTIONS.MOVE_LEFT, ACTIONS.MOVE_DOWN, ACTIONS.MOVE_RIGHT],
    },
  },
  {
    id: 'interact',
    title: 'Interact',
    body: 'Use Interact to talk, inspect and operate nearby equipment. Try it once now.',
    actions: [ACTIONS.INTERACT],
    completion: { mode: 'any', actions: [ACTIONS.INTERACT] },
  },
  {
    id: 'confirm-cancel',
    title: 'Choose / Back',
    body: 'Try Confirm, then Back to close the Bag and return to the Yard.',
    actions: [ACTIONS.CONFIRM, ACTIONS.CANCEL],
    completion: { mode: 'all', actions: [ACTIONS.CONFIRM, ACTIONS.CANCEL] },
  },
  {
    id: 'bag',
    title: 'Bag',
    body: 'Open your Bag now to check the kit you are carrying.',
    actions: [ACTIONS.BAG],
    completion: { mode: 'any', actions: [ACTIONS.BAG] },
  },
  {
    id: 'map',
    title: 'Map',
    body: 'Open the Map to check your route and current objective.',
    actions: [ACTIONS.MAP],
    completion: { mode: 'any', actions: [ACTIONS.MAP] },
  },
  {
    id: 'splice',
    title: 'Splice',
    body: 'Contextual splice guidance can use this same prompt surface later.',
    actions: [ACTIONS.INTERACT, ACTIONS.CONFIRM, ACTIONS.CANCEL],
    completion: { mode: 'manual' },
  },
  {
    id: 'battle',
    title: 'Pit controls',
    body: 'Battle tutorials can reuse the same non-modal prompt surface.',
    actions: [ACTIONS.BATTLE_PRIMARY, ACTIONS.BATTLE_SECONDARY, ACTIONS.BATTLE_TERTIARY, ACTIONS.CANCEL],
    completion: { mode: 'manual' },
  },
] as const;

export class TutorialPromptController {
  private readonly definitions = new Map<TutorialPromptId, TutorialPromptDefinition>();
  private readonly completed = new Set<TutorialPromptId>();
  private readonly seenActions = new Set<SemanticAction>();
  private activeId: TutorialPromptId | null = null;
  private completedAt: number | null = null;

  constructor(
    definitions: readonly TutorialPromptDefinition[] = OPENING_TUTORIAL_PROMPTS,
    private readonly bindings: SemanticBindingProfile = DEFAULT_BINDINGS,
  ) {
    for (const definition of definitions) {
      if (this.definitions.has(definition.id)) throw new Error(`Duplicate tutorial prompt id: ${definition.id}`);
      this.definitions.set(definition.id, definition);
    }
  }

  activate(id: TutorialPromptId): boolean {
    if (!this.definitions.has(id)) throw new Error(`Unknown tutorial prompt id: ${id}`);
    if (this.completed.has(id)) return false;
    this.activeId = id;
    this.completedAt = null;
    this.seenActions.clear();
    return true;
  }

  clearActive(): void {
    this.activeId = null;
    this.completedAt = null;
    this.seenActions.clear();
  }

  resetProgress(): void {
    this.clearActive();
    this.completed.clear();
  }

  completeActive(now: number): void {
    if (this.activeId === null || this.completedAt !== null) return;
    this.completed.add(this.activeId);
    this.completedAt = now;
  }

  observeAction(action: SemanticAction, now: number): void {
    if (this.activeId === null || this.completedAt !== null) return;
    const definition = this.definitions.get(this.activeId);
    if (!definition || definition.completion.mode === 'manual') return;

    const completionActions = definition.completion.actions ?? definition.actions;
    if (!completionActions.includes(action)) return;
    this.seenActions.add(action);

    if (definition.completion.mode === 'any') {
      this.completeActive(now);
      return;
    }

    if (completionActions.every((requiredAction) => this.seenActions.has(requiredAction))) {
      this.completeActive(now);
    }
  }

  current(now: number): TutorialPromptView | null {
    if (this.activeId === null) return null;
    const definition = this.definitions.get(this.activeId);
    if (!definition) return null;

    let alpha = 1;
    if (this.completedAt !== null) {
      const elapsed = Math.max(0, now - this.completedAt);
      if (elapsed >= TUTORIAL_PROMPT_FADE_MS) {
        this.clearActive();
        return null;
      }
      alpha = 1 - elapsed / TUTORIAL_PROMPT_FADE_MS;
    }

    return {
      id: definition.id,
      title: definition.title,
      body: definition.body,
      hints: definition.actions.map((action) => ({ action, label: preferredInputHint(action, this.bindings) })),
      alpha,
      completing: this.completedAt !== null,
    };
  }

  isCompleted(id: TutorialPromptId): boolean {
    return this.completed.has(id);
  }

  completedIds(): TutorialPromptId[] {
    return [...this.completed];
  }
}
