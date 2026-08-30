import type { OpeningObjectiveId } from './openingShells.js';
import type { TutorialPromptId } from '../tutorial/tutorialFramework.js';

export const OPENING_ONBOARDING_PROMPTS = [
  'movement',
  'interact',
  'bag',
  'confirm-cancel',
  'map',
] as const satisfies readonly TutorialPromptId[];

export const OPENING_TUTORIAL_GAP_MS = 240;

export class OpeningObjectiveSequenceController {
  private promptIndex = 0;
  private awaitingActivation = true;
  private promptAvailableAt = 0;

  reset(now = 0): void {
    this.promptIndex = 0;
    this.awaitingActivation = true;
    this.promptAvailableAt = now;
  }

  complete(): void {
    this.promptIndex = OPENING_ONBOARDING_PROMPTS.length;
    this.awaitingActivation = false;
    this.promptAvailableAt = 0;
  }

  currentPromptId(): TutorialPromptId | null {
    return OPENING_ONBOARDING_PROMPTS[this.promptIndex] ?? null;
  }

  takeReadyPrompt(now: number): TutorialPromptId | null {
    const prompt = this.currentPromptId();
    if (prompt === null || !this.awaitingActivation || now < this.promptAvailableAt) return null;
    this.awaitingActivation = false;
    return prompt;
  }

  acknowledgeCompletedPrompt(id: TutorialPromptId, now: number): boolean {
    const current = this.currentPromptId();
    if (current === null || current !== id || this.awaitingActivation) return false;

    this.promptIndex += 1;
    this.awaitingActivation = true;
    this.promptAvailableAt = now + OPENING_TUTORIAL_GAP_MS;
    return true;
  }

  completedPromptIds(): readonly TutorialPromptId[] {
    return OPENING_ONBOARDING_PROMPTS.slice(0, this.promptIndex);
  }

  isComplete(): boolean {
    return this.currentPromptId() === null;
  }

  objectiveId(): OpeningObjectiveId {
    return this.isComplete() ? 'find-master' : 'yard-orientation';
  }
}
