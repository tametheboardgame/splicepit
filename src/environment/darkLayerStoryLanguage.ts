export const DARK_LAYER_STORY_ROLES = ['omen', 'rupture', 'consequence'] as const;
export type DarkLayerStoryRole = (typeof DARK_LAYER_STORY_ROLES)[number];

export type DarkLayerStoryIntensity = 'blink' | 'rupture' | 'linger';

export interface DarkLayerStoryCue {
  readonly cueId: string;
  readonly role: DarkLayerStoryRole;
}

export interface DarkLayerStoryPreset {
  readonly intensity: DarkLayerStoryIntensity;
  readonly durationMs: number;
}

export const DARK_LAYER_STORY_PRESETS: Readonly<Record<DarkLayerStoryRole, DarkLayerStoryPreset>> = {
  omen: { intensity: 'blink', durationMs: 360 },
  rupture: { intensity: 'rupture', durationMs: 760 },
  consequence: { intensity: 'linger', durationMs: 1320 },
} as const;

export const DARK_LAYER_STORY_RULES = {
  maxCuesPerScene: 3,
  minimumNonFlickerStepsBetweenCues: 2,
  ambientSuppressedDuringAuthoredScenes: true,
  authoredCuesOverrideOrdinarySuppression: true,
  avoidImmediateTransitionStacking: true,
  brightLayerMustRecoverBetweenCues: true,
} as const;

type StorySequenceStep = {
  readonly kind: string;
  readonly cueId?: string;
  readonly role?: string;
};

export function isDarkLayerStoryRole(value: string): value is DarkLayerStoryRole {
  return (DARK_LAYER_STORY_ROLES as readonly string[]).includes(value);
}

export function resolveDarkLayerStoryCue(cue: DarkLayerStoryCue): DarkLayerStoryPreset {
  return DARK_LAYER_STORY_PRESETS[cue.role];
}

export function validateDarkLayerStorySequence(steps: readonly StorySequenceStep[]): string[] {
  const issues: string[] = [];
  const cues = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.kind === 'corruption');

  if (cues.length > DARK_LAYER_STORY_RULES.maxCuesPerScene) {
    issues.push(`Too many authored dark-layer cues: ${cues.length}.`);
  }

  const seenCueIds = new Set<string>();
  for (const { step, index } of cues) {
    const cueId = step.cueId?.trim() ?? '';
    if (!cueId) issues.push(`Corruption step ${index} requires cueId.`);
    else if (seenCueIds.has(cueId)) issues.push(`Duplicate dark-layer cueId: ${cueId}.`);
    else seenCueIds.add(cueId);

    const role = step.role ?? '';
    if (!isDarkLayerStoryRole(role)) issues.push(`Corruption step ${index} requires a valid role.`);

    if (steps[index - 1]?.kind === 'transition' || steps[index + 1]?.kind === 'transition') {
      issues.push(`Dark-layer cue ${cueId || index} is adjacent to a transition.`);
    }
  }

  for (let index = 1; index < cues.length; index += 1) {
    const previous = cues[index - 1];
    const current = cues[index];
    const ordinarySteps = current.index - previous.index - 1;
    if (ordinarySteps < DARK_LAYER_STORY_RULES.minimumNonFlickerStepsBetweenCues) {
      issues.push(`Dark-layer cues at steps ${previous.index} and ${current.index} are too close together.`);
    }
  }

  return issues;
}
