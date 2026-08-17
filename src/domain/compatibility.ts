import type { BaseAnimalId, SourcePackageId } from './ids.js';
import type {
  BaseAnimalDefinition,
  BiologicalRequirementSet,
  SourcePackageDefinition,
} from './model.js';

export type CompatibilityInteractionKind = 'synergy' | 'conflict' | 'redundancy' | 'regulatory';
export type CompatibilityVisibility = 'observable' | 'diagnostic';
export type CompatibilityProfile = 'strongly_favourable' | 'favourable' | 'mixed' | 'strained' | 'hostile';

export interface CompatibilityTagCondition {
  allOf?: readonly string[];
  anyOf?: readonly string[];
  noneOf?: readonly string[];
}

export interface CompatibilityRule {
  id: string;
  kind: CompatibilityInteractionKind;
  incoming: CompatibilityTagCondition;
  subject: CompatibilityTagCondition;
  scoreDelta: number;
  visibility: CompatibilityVisibility;
  explanation: string;
  diagnosticExplanation?: string;
}

export interface AuthoredCompatibilityInteraction {
  id: string;
  status: 'prototype' | 'draft' | 'canon';
  kind: CompatibilityInteractionKind;
  scoreDelta: number;
  visibility: CompatibilityVisibility;
  explanation: string;
  diagnosticExplanation?: string;
  baseAnimalId?: BaseAnimalId;
  incomingSourceIds?: readonly SourcePackageId[];
  existingSourceIds?: readonly SourcePackageId[];
  requiredSubjectTags?: readonly string[];
  requiredIncomingTags?: readonly string[];
  suppressesRuleIds?: readonly string[];
}

export interface CompatibilityAssessmentInput {
  baseAnimal: BaseAnimalDefinition;
  incomingSources: readonly SourcePackageDefinition[];
  existingSources?: readonly SourcePackageDefinition[];
  existingBiologicalTags?: readonly string[];
  rules?: readonly CompatibilityRule[];
  authoredInteractions?: readonly AuthoredCompatibilityInteraction[];
}

export interface CompatibilitySignal {
  id: string;
  origin: 'requirement' | 'systemic' | 'authored';
  kind: CompatibilityInteractionKind;
  scoreDelta: number;
  visibility: CompatibilityVisibility;
  explanation: string;
  diagnosticExplanation?: string;
  incomingSourceIds: readonly SourcePackageId[];
  affectedExpressionId?: string;
  ruleId?: string;
}

export interface RequirementAssessment {
  scope: 'source' | 'expression';
  sourcePackageId: SourcePackageId;
  expressionId?: string;
  satisfied: boolean;
  missingAllOfTags: readonly string[];
  missingAnyOf: boolean;
  forbiddenTagsPresent: readonly string[];
}

export interface CompatibilityAssessment {
  baseAnimalId: BaseAnimalId;
  incomingSourceIds: readonly SourcePackageId[];
  existingSourceIds: readonly SourcePackageId[];
  subjectTags: readonly string[];
  incomingTags: readonly string[];
  requirements: readonly RequirementAssessment[];
  signals: readonly CompatibilitySignal[];
  netScore: number;
  profile: CompatibilityProfile;
}

export interface CompatibilityInformationView {
  access: CompatibilityVisibility;
  signals: readonly CompatibilitySignal[];
  explanations: readonly string[];
  displayScore: number;
  displayProfile: CompatibilityProfile;
  incomplete: boolean;
}

const condition = (
  allOf: readonly string[] = [],
  anyOf: readonly string[] = [],
  noneOf: readonly string[] = [],
): CompatibilityTagCondition => ({ allOf, anyOf, noneOf });

export const DEFAULT_COMPATIBILITY_RULES: readonly CompatibilityRule[] = [
  {
    id: 'system.structural_demand_supported',
    kind: 'synergy',
    incoming: condition([], ['demand.structure', 'risk.structural_strain', 'structure.impact']),
    subject: condition([], ['structure.robust', 'frame.heavy', 'footing.stable', 'structure.load_bearing']),
    scoreDelta: 2,
    visibility: 'observable',
    explanation: 'Existing structural support should make demanding load-bearing expression easier to integrate.',
  },
  {
    id: 'system.structural_demand_light_frame',
    kind: 'conflict',
    incoming: condition([], ['demand.structure', 'risk.structural_strain', 'structure.impact']),
    subject: condition([], ['frame.light', 'vitality.fragile']),
    scoreDelta: -3,
    visibility: 'observable',
    explanation: 'The host frame looks poorly matched to the incoming structural load.',
  },
  {
    id: 'system.sprint_light_frame',
    kind: 'synergy',
    incoming: condition([], ['muscle.fast_twitch', 'regulation.proportion']),
    subject: condition([], ['frame.light', 'mobility.high']),
    scoreDelta: 2,
    visibility: 'observable',
    explanation: 'A light, mobile frame gives sprint-biased expression a favourable mechanical context.',
  },
  {
    id: 'system.sprint_heavy_frame',
    kind: 'conflict',
    incoming: condition([], ['muscle.fast_twitch', 'regulation.proportion']),
    subject: condition([], ['frame.heavy', 'mass.high']),
    scoreDelta: -2,
    visibility: 'observable',
    explanation: 'Sprint-biased expression is fighting a heavy existing frame.',
  },
  {
    id: 'system.metabolic_load_stacking',
    kind: 'conflict',
    incoming: condition([], ['demand.high_energy', 'demand.extreme_energy']),
    subject: condition([], ['metabolism.high_demand']),
    scoreDelta: -2,
    visibility: 'diagnostic',
    explanation: 'The incoming system carries a substantial metabolic burden.',
    diagnosticExplanation: 'Diagnostics show the host is already metabolically expensive; stacking another high-demand system increases integration stress.',
  },
  {
    id: 'system.surface_space_competition',
    kind: 'conflict',
    incoming: condition([], ['surface.competition']),
    subject: condition([], ['surface.plates', 'surface.glands', 'surface.chromatophore', 'surface.adhesive']),
    scoreDelta: -3,
    visibility: 'diagnostic',
    explanation: 'Two surface systems may be competing for the same biological real estate.',
    diagnosticExplanation: 'Diagnostics identify overlapping surface-development programmes competing for placement and tissue support.',
  },
  {
    id: 'system.keratin_redundancy',
    kind: 'redundancy',
    incoming: condition([], ['surface.keratin']),
    subject: condition([], ['surface.keratin']),
    scoreDelta: -1,
    visibility: 'diagnostic',
    explanation: 'Some of the incoming keratin programme overlaps biology already present.',
  },
  {
    id: 'system.sensory_integration',
    kind: 'synergy',
    incoming: condition([], ['sense.integration']),
    subject: condition([], ['sense.vision', 'sense.hearing', 'sense.smell', 'sense.electric_field']),
    scoreDelta: 1,
    visibility: 'observable',
    explanation: 'Existing sensory pathways provide useful integration targets.',
  },
  {
    id: 'system.repair_mitigates_self_harm',
    kind: 'synergy',
    incoming: condition([], ['risk.self_damage', 'risk.self_toxicity']),
    subject: condition([], ['healing.rapid', 'healing.scarless', 'regulation.regeneration']),
    scoreDelta: 2,
    visibility: 'diagnostic',
    explanation: 'Existing repair biology may buffer some self-inflicted tissue damage.',
  },
  {
    id: 'system.developmental_reset_regulation',
    kind: 'regulatory',
    incoming: condition([], ['development.reset']),
    subject: condition([], ['regulation.growth', 'regulation.proportion', 'regulation.keratin_growth', 'regulation.surface_pattern']),
    scoreDelta: -2,
    visibility: 'diagnostic',
    explanation: 'Regenerative developmental reset may interfere with an established regulatory programme.',
  },
  {
    id: 'system.growth_proportion_competition',
    kind: 'regulatory',
    incoming: condition([], ['regulation.growth']),
    subject: condition([], ['regulation.proportion']),
    scoreDelta: -2,
    visibility: 'diagnostic',
    explanation: 'Two regulatory programmes are pushing body development in different directions.',
  },
] as const;

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function collectSourceTags(source: SourcePackageDefinition): string[] {
  return unique([
    ...source.compatibilityTags,
    ...source.expressions.flatMap((expression) => [...expression.compatibilityTags, ...expression.createsBiologicalTags]),
  ]);
}

function collectExistingSourceTags(source: SourcePackageDefinition): string[] {
  // Existing source records do not prove every potential expression took hold. Their
  // package-level tags are safe context; actual expressed tags are supplied separately.
  return unique(source.compatibilityTags);
}

function matchesCondition(tags: ReadonlySet<string>, tagCondition: CompatibilityTagCondition): boolean {
  const allOf = tagCondition.allOf ?? [];
  const anyOf = tagCondition.anyOf ?? [];
  const noneOf = tagCondition.noneOf ?? [];
  return allOf.every((tag) => tags.has(tag))
    && (anyOf.length === 0 || anyOf.some((tag) => tags.has(tag)))
    && noneOf.every((tag) => !tags.has(tag));
}

function evaluateRequirements(
  requirements: BiologicalRequirementSet,
  tags: ReadonlySet<string>,
): Omit<RequirementAssessment, 'scope' | 'sourcePackageId' | 'expressionId'> {
  const missingAllOfTags = requirements.allOfTags.filter((tag) => !tags.has(tag));
  const missingAnyOf = requirements.anyOfTags.length > 0 && !requirements.anyOfTags.some((tag) => tags.has(tag));
  const forbiddenTagsPresent = requirements.noneOfTags.filter((tag) => tags.has(tag));
  return {
    satisfied: missingAllOfTags.length === 0 && !missingAnyOf && forbiddenTagsPresent.length === 0,
    missingAllOfTags,
    missingAnyOf,
    forbiddenTagsPresent,
  };
}

function requirementSignal(requirement: RequirementAssessment): CompatibilitySignal | null {
  if (requirement.satisfied) return null;
  const missing = [
    ...requirement.missingAllOfTags,
    ...(requirement.missingAnyOf ? ['one compatible prerequisite'] : []),
    ...requirement.forbiddenTagsPresent.map((tag) => `absence of ${tag}`),
  ];
  const expression = requirement.scope === 'expression' ? ` expression ${requirement.expressionId}` : '';
  return {
    id: `requirement.${requirement.sourcePackageId}${requirement.expressionId ? `.${requirement.expressionId}` : ''}`,
    origin: 'requirement',
    kind: 'conflict',
    scoreDelta: requirement.scope === 'source' ? -4 : -1,
    visibility: requirement.scope === 'source' ? 'observable' : 'diagnostic',
    explanation: `Host prerequisites are incomplete for${expression}: ${missing.join(', ')}.`,
    incomingSourceIds: [requirement.sourcePackageId],
    affectedExpressionId: requirement.expressionId,
  };
}

function classify(score: number): CompatibilityProfile {
  if (score >= 5) return 'strongly_favourable';
  if (score >= 2) return 'favourable';
  if (score <= -5) return 'hostile';
  if (score <= -2) return 'strained';
  return 'mixed';
}

function ruleSignal(
  rule: CompatibilityRule,
  incomingSourceIds: readonly SourcePackageId[],
  suffix: string,
): CompatibilitySignal {
  return {
    id: `rule.${rule.id}.${suffix}`,
    origin: 'systemic',
    kind: rule.kind,
    scoreDelta: rule.scoreDelta,
    visibility: rule.visibility,
    explanation: rule.explanation,
    diagnosticExplanation: rule.diagnosticExplanation,
    incomingSourceIds,
    ruleId: rule.id,
  };
}

function authoredMatches(
  interaction: AuthoredCompatibilityInteraction,
  baseAnimal: BaseAnimalDefinition,
  incomingSourceIds: ReadonlySet<SourcePackageId>,
  existingSourceIds: ReadonlySet<SourcePackageId>,
  incomingTags: ReadonlySet<string>,
  subjectTags: ReadonlySet<string>,
): boolean {
  return (interaction.baseAnimalId === undefined || interaction.baseAnimalId === baseAnimal.id)
    && (interaction.incomingSourceIds ?? []).every((id) => incomingSourceIds.has(id))
    && (interaction.existingSourceIds ?? []).every((id) => existingSourceIds.has(id))
    && (interaction.requiredIncomingTags ?? []).every((tag) => incomingTags.has(tag))
    && (interaction.requiredSubjectTags ?? []).every((tag) => subjectTags.has(tag));
}

export function validateAuthoredCompatibilityInteractions(
  interactions: readonly AuthoredCompatibilityInteraction[],
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const interaction of interactions) {
    if (!interaction.id || seen.has(interaction.id)) {
      errors.push(`Duplicate or empty authored compatibility interaction ID: ${interaction.id || '<empty>'}.`);
    }
    seen.add(interaction.id);
    if (!Number.isFinite(interaction.scoreDelta)) {
      errors.push(`Interaction ${interaction.id} has a non-finite score delta.`);
    }
    if (
      (interaction.incomingSourceIds?.length ?? 0) === 0
      && interaction.baseAnimalId === undefined
      && (interaction.requiredIncomingTags?.length ?? 0) === 0
    ) {
      errors.push(`Interaction ${interaction.id} does not constrain the incoming biology.`);
    }
  }
  return errors;
}

export function evaluateCompatibility(input: CompatibilityAssessmentInput): CompatibilityAssessment {
  if (input.incomingSources.length === 0) {
    throw new Error('Compatibility assessment requires at least one incoming source package.');
  }
  if (new Set(input.incomingSources.map((source) => source.id)).size !== input.incomingSources.length) {
    throw new Error('Compatibility assessment contains the same incoming source package more than once.');
  }

  const existingSources = input.existingSources ?? [];
  const rules = input.rules ?? DEFAULT_COMPATIBILITY_RULES;
  const authoredInteractions = input.authoredInteractions ?? [];
  const authoredErrors = validateAuthoredCompatibilityInteractions(authoredInteractions);
  if (authoredErrors.length > 0) {
    throw new Error(`Invalid authored compatibility interactions:\n- ${authoredErrors.join('\n- ')}`);
  }

  const incomingSourceIds = new Set(input.incomingSources.map((source) => source.id));
  const existingSourceIds = new Set(existingSources.map((source) => source.id));
  const subjectTags = new Set(unique([
    ...input.baseAnimal.bodyPlanTags,
    ...input.baseAnimal.biologicalTags,
    ...(input.existingBiologicalTags ?? []),
    ...existingSources.flatMap(collectExistingSourceTags),
  ]));
  const incomingTags = new Set(unique(input.incomingSources.flatMap(collectSourceTags)));

  const requirements: RequirementAssessment[] = [];
  for (const source of input.incomingSources) {
    requirements.push({
      scope: 'source',
      sourcePackageId: source.id,
      ...evaluateRequirements(source.requirements, subjectTags),
    });
    for (const expression of source.expressions) {
      requirements.push({
        scope: 'expression',
        sourcePackageId: source.id,
        expressionId: expression.id,
        ...evaluateRequirements(expression.requirements, subjectTags),
      });
    }
  }

  const signals: CompatibilitySignal[] = requirements
    .map(requirementSignal)
    .filter((signal): signal is CompatibilitySignal => signal !== null);
  const seenRuleContexts = new Set<string>();

  const applyRules = (
    source: SourcePackageDefinition,
    comparedTags: ReadonlySet<string>,
    context: string,
    relatedSourceIds: readonly SourcePackageId[],
  ): void => {
    const sourceTags = new Set(collectSourceTags(source));
    for (const rule of rules) {
      if (!matchesCondition(sourceTags, rule.incoming) || !matchesCondition(comparedTags, rule.subject)) continue;
      const dedupeKey = `${rule.id}|${context}`;
      if (seenRuleContexts.has(dedupeKey)) continue;
      seenRuleContexts.add(dedupeKey);
      signals.push(ruleSignal(
        rule,
        unique([source.id, ...relatedSourceIds]) as SourcePackageId[],
        context,
      ));
    }
  };

  for (const source of input.incomingSources) {
    applyRules(source, subjectTags, `subject.${source.id}`, []);
  }

  for (let i = 0; i < input.incomingSources.length; i += 1) {
    for (let j = i + 1; j < input.incomingSources.length; j += 1) {
      const left = input.incomingSources[i];
      const right = input.incomingSources[j];
      if (!left || !right) continue;
      const pairKey = [left.id, right.id].sort().join('+');
      applyRules(left, new Set(collectSourceTags(right)), `incoming.${pairKey}`, [right.id]);
      applyRules(right, new Set(collectSourceTags(left)), `incoming.${pairKey}`, [left.id]);
    }
  }

  const matchingAuthored = authoredInteractions.filter((interaction) => authoredMatches(
    interaction,
    input.baseAnimal,
    incomingSourceIds,
    existingSourceIds,
    incomingTags,
    subjectTags,
  ));
  const suppressedRuleIds = new Set(matchingAuthored.flatMap((interaction) => interaction.suppressesRuleIds ?? []));
  const unsuppressedSignals = signals.filter(
    (signal) => signal.ruleId === undefined || !suppressedRuleIds.has(signal.ruleId),
  );

  for (const interaction of matchingAuthored) {
    unsuppressedSignals.push({
      id: `authored.${interaction.id}`,
      origin: 'authored',
      kind: interaction.kind,
      scoreDelta: interaction.scoreDelta,
      visibility: interaction.visibility,
      explanation: interaction.explanation,
      diagnosticExplanation: interaction.diagnosticExplanation,
      incomingSourceIds: [...incomingSourceIds],
    });
  }

  const netScore = unsuppressedSignals.reduce((total, signal) => total + signal.scoreDelta, 0);
  return {
    baseAnimalId: input.baseAnimal.id,
    incomingSourceIds: [...incomingSourceIds],
    existingSourceIds: [...existingSourceIds],
    subjectTags: [...subjectTags].sort(),
    incomingTags: [...incomingTags].sort(),
    requirements,
    signals: unsuppressedSignals,
    netScore,
    profile: classify(netScore),
  };
}

export function projectCompatibilityInformation(
  assessment: CompatibilityAssessment,
  access: CompatibilityVisibility = 'observable',
): CompatibilityInformationView {
  const signals = access === 'diagnostic'
    ? [...assessment.signals]
    : assessment.signals.filter((signal) => signal.visibility === 'observable');
  const displayScore = signals.reduce((total, signal) => total + signal.scoreDelta, 0);
  const explanations = signals
    .filter((signal) => (
      Math.abs(signal.scoreDelta) >= 2
      && (signal.kind === 'synergy' || signal.kind === 'conflict' || signal.kind === 'regulatory')
    ))
    .map((signal) => (
      access === 'diagnostic' && signal.diagnosticExplanation
        ? signal.diagnosticExplanation
        : signal.explanation
    ));
  return {
    access,
    signals,
    explanations,
    displayScore,
    displayProfile: classify(displayScore),
    incomplete: access === 'observable' && signals.length !== assessment.signals.length,
  };
}
