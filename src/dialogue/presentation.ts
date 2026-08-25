export type DialogueTextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export type DialoguePortraitDefinition = {
  readonly src: string;
  readonly alt: string;
  readonly corruptedSrc?: string;
};

export type DialogueCorruptionEvent = {
  readonly startMs: number;
  readonly durationMs: number;
  readonly strength: number;
};

export type DialoguePageDefinition = {
  readonly id: string;
  readonly text: string;
  readonly speaker?: string;
  readonly portrait?: DialoguePortraitDefinition;
  readonly corruption?: readonly DialogueCorruptionEvent[];
};

export type DialogueSequenceDefinition = {
  readonly id: string;
  readonly pages: readonly DialoguePageDefinition[];
};

export type DialoguePageVisualState = {
  readonly visibleCharacters: number;
  readonly textComplete: boolean;
  readonly corruption: number;
  readonly corruptionEventsPassed: number;
};

const CHARACTERS_PER_SECOND: Readonly<Record<Exclude<DialogueTextSpeed, 'instant'>, number>> = {
  slow: 24,
  normal: 42,
  fast: 76,
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function eventAmount(elapsedMs: number, event: DialogueCorruptionEvent): number {
  if (event.durationMs <= 0 || elapsedMs < event.startMs || elapsedMs >= event.startMs + event.durationMs) return 0;
  const phase = (elapsedMs - event.startMs) / event.durationMs;
  return clamp01(Math.sin(Math.PI * phase) * event.strength);
}

export function dialogueRevealDurationMs(text: string, speed: DialogueTextSpeed): number {
  if (speed === 'instant' || text.length === 0) return 0;
  return Math.ceil((text.length / CHARACTERS_PER_SECOND[speed]) * 1000);
}

export function dialogueVisibleCharacters(text: string, elapsedMs: number, speed: DialogueTextSpeed): number {
  if (speed === 'instant') return text.length;
  const characters = Math.floor(Math.max(0, elapsedMs) * CHARACTERS_PER_SECOND[speed] / 1000);
  return Math.max(0, Math.min(text.length, characters));
}

export function dialogueCorruptionAmount(page: DialoguePageDefinition, elapsedMs: number): number {
  let amount = 0;
  for (const event of page.corruption ?? []) {
    amount = Math.max(amount, eventAmount(Math.max(0, elapsedMs), event));
  }
  return amount;
}

export function dialogueCorruptionEventsPassed(page: DialoguePageDefinition, elapsedMs: number): number {
  return (page.corruption ?? []).filter((event) => elapsedMs >= event.startMs).length;
}

export function dialoguePageVisualState(
  page: DialoguePageDefinition,
  elapsedMs: number,
  speed: DialogueTextSpeed,
): DialoguePageVisualState {
  const visibleCharacters = dialogueVisibleCharacters(page.text, elapsedMs, speed);
  return {
    visibleCharacters,
    textComplete: visibleCharacters >= page.text.length,
    corruption: dialogueCorruptionAmount(page, elapsedMs),
    corruptionEventsPassed: dialogueCorruptionEventsPassed(page, elapsedMs),
  };
}

export function isDialogueTextSpeed(value: string | null): value is DialogueTextSpeed {
  return value === 'slow' || value === 'normal' || value === 'fast' || value === 'instant';
}
