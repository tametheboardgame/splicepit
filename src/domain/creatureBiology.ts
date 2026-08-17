import {
  evaluateCompatibility,
  type AuthoredCompatibilityInteraction,
  type CompatibilityAssessment,
  type CompatibilityRule,
} from './compatibility.js';
import { ids, type CapabilityId, type MaterialLotId, type SpliceAttemptId } from './ids.js';
import type {
  ArenaCapabilities,
  BaseAnimalDefinition,
  CreatureState,
  DomainContentCatalog,
  InjuryRecord,
  SourcePackageDefinition,
  SpliceAttemptRecord,
  SpliceExpressionRecord,
} from './model.js';
import type {
  ResolvedExpression,
  SpliceResolutionInput,
  SpliceResolutionResult,
} from './spliceResolution.js';

export interface FunctionalExpressionThresholds {
  magnitude: number;
  completeness: number;
  efficiency: number;
  reliability: number;
  stability: number;
}

/**
 * PROTOTYPE / TUNABLE. This is an R0.3 expression-function gate, not the final
 * Land / Water / Air qualification contract owned by WP0.4E.
 */
export const PROTOTYPE_FUNCTIONAL_EXPRESSION_THRESHOLDS: Readonly<FunctionalExpressionThresholds> = {
  magnitude: 0.2,
  completeness: 0.35,
  efficiency: 0.3,
  reliability: 0.35,
  stability: 0.25,
};

/**
 * PROTOTYPE / TUNABLE semantic bridge used only to prove independent arena
 * emergence in R0.3. Exact arena qualification remains CR-OPEN-01 / WP0.4E.
 */
export const PROTOTYPE_ARENA_CAPABILITY_HOOKS = {
  land: ['movement.land'],
  water: ['movement.swim', 'movement.water', 'movement.aquatic'],
  air: ['movement.flight', 'movement.sustained_flight'],
} as const;

export interface CurrentExpressionState extends SpliceExpressionRecord {
  spliceAttemptId: SpliceAttemptId;
  sequence: number;
  currentlyFunctional: boolean;
  suppressedByInjuryIds: readonly string[];
}

export interface CreatureBiologyState {
  stability: number;
  accumulatedComplexity: number;
  existingSourceIds: readonly SourcePackageDefinition['id'][];
  biologicalTags: readonly string[];
  phenotypeHooks: readonly string[];
  expressions: readonly CurrentExpressionState[];
  capabilityIds: readonly CapabilityId[];
  arenaCapabilities: ArenaCapabilities;
}

export interface CreatureSpliceContextInput {
  creature: CreatureState;
  catalog: DomainContentCatalog;
  incomingSources: readonly SourcePackageDefinition[];
  facilitySafety: number;
  facilityPrecision: number;
  materialQuality: number;
  compatibilityRules?: readonly CompatibilityRule[];
  authoredInteractions?: readonly AuthoredCompatibilityInteraction[];
}

export interface ApplySpliceResolutionInput {
  creature: CreatureState;
  catalog: DomainContentCatalog;
  incomingSources: readonly SourcePackageDefinition[];
  resolution: SpliceResolutionResult;
  attemptId: SpliceAttemptId;
  attemptedAt: string;
  consumedMaterialLotIds?: readonly MaterialLotId[];
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function findBaseAnimal(catalog: DomainContentCatalog, creature: CreatureState): BaseAnimalDefinition {
  const baseAnimal = catalog.baseAnimals.find((candidate) => candidate.id === creature.baseAnimalId);
  if (!baseAnimal) throw new Error(`Unknown base animal for creature ${creature.id}: ${creature.baseAnimalId}`);
  return baseAnimal;
}

function findSource(catalog: DomainContentCatalog, sourceId: SourcePackageDefinition['id']): SourcePackageDefinition {
  const source = catalog.sourcePackages.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error(`Unknown source package: ${sourceId}`);
  return source;
}

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be a finite number between 0 and 1.`);
  }
}

function validateThresholds(thresholds: FunctionalExpressionThresholds): void {
  for (const [name, value] of Object.entries(thresholds)) assertUnitInterval(`threshold.${name}`, value);
}

export function isResolvedExpressionFunctional(
  expression: ResolvedExpression,
  thresholds: FunctionalExpressionThresholds = PROTOTYPE_FUNCTIONAL_EXPRESSION_THRESHOLDS,
): boolean {
  validateThresholds(thresholds);
  return expression.expressed
    && expression.magnitude >= thresholds.magnitude
    && expression.completeness >= thresholds.completeness
    && expression.efficiency >= thresholds.efficiency
    && expression.reliability >= thresholds.reliability
    && expression.stability >= thresholds.stability;
}

function activeInjuries(creature: CreatureState): readonly InjuryRecord[] {
  return creature.injuries.filter((injury) => injury.status !== 'healed');
}

function suppressedExpressionInjuries(
  expression: SpliceExpressionRecord,
  injuries: readonly InjuryRecord[],
): InjuryRecord[] {
  return injuries.filter((injury) => (
    (injury.affectedExpressionIds ?? []).includes(expression.expressionId)
    || (injury.affectedCapabilityIds ?? []).some((capabilityId) => expression.capabilityIds.includes(capabilityId))
  ));
}

function deriveArenaCapabilities(capabilityIds: readonly CapabilityId[], living: boolean): ArenaCapabilities {
  const capabilities = new Set<string>(capabilityIds);
  const environment = (hooks: readonly string[]) => {
    const supportingCapabilityIds = hooks
      .filter((hook) => capabilities.has(hook))
      .map((hook) => ids.capability(hook));
    return { functional: living && supportingCapabilityIds.length > 0, supportingCapabilityIds };
  };
  return {
    land: environment(PROTOTYPE_ARENA_CAPABILITY_HOOKS.land),
    water: environment(PROTOTYPE_ARENA_CAPABILITY_HOOKS.water),
    air: environment(PROTOTYPE_ARENA_CAPABILITY_HOOKS.air),
  };
}

export function deriveCreatureBiology(creature: CreatureState, catalog: DomainContentCatalog): CreatureBiologyState {
  const baseAnimal = findBaseAnimal(catalog, creature);
  const injuries = activeInjuries(creature);
  const living = creature.lifeState !== 'deceased';
  const expressions: CurrentExpressionState[] = creature.spliceHistory.flatMap((attempt) => (
    attempt.expressions.map((expression) => {
      const suppressors = suppressedExpressionInjuries(expression, injuries);
      return {
        ...expression,
        spliceAttemptId: attempt.id,
        sequence: attempt.sequence,
        currentlyFunctional: living && expression.functional && suppressors.length === 0,
        suppressedByInjuryIds: suppressors.map((injury) => injury.id),
      };
    })
  ));

  const suppressedCapabilities = new Set<string>(
    injuries.flatMap((injury) => [...(injury.affectedCapabilityIds ?? [])]),
  );
  const baselineCapabilities = baseAnimal.baselineCapabilityHooks.map((hook) => ids.capability(hook));
  const expressionCapabilities = expressions
    .filter((expression) => expression.currentlyFunctional)
    .flatMap((expression) => [...expression.capabilityIds]);
  const capabilityIds = living
    ? unique([...baselineCapabilities, ...expressionCapabilities]).filter((id) => !suppressedCapabilities.has(id))
    : [];

  const existingSourceIds = unique(
    expressions.filter((expression) => expression.expressed).map((expression) => expression.sourcePackageId),
  );
  const biologicalTags = unique([
    ...baseAnimal.bodyPlanTags,
    ...baseAnimal.biologicalTags,
    ...expressions.filter((expression) => expression.expressed).flatMap((expression) => [...expression.biologicalTags]),
    ...creature.mutations.flatMap((mutation) => ['mutation.present', `mutation.${mutation.definitionId}`]),
    ...injuries.flatMap((injury) => [
      `injury.${injury.status}`,
      ...(injury.affectedCapabilityIds ?? []).map((id) => `injury.capability.${id}`),
    ]),
  ]);
  const phenotypeHooks = unique([
    ...baseAnimal.baselinePhenotypeHooks,
    ...expressions.filter((expression) => expression.expressed).flatMap((expression) => [...expression.phenotypeHooks]),
  ]);
  const lastAttempt = creature.spliceHistory[creature.spliceHistory.length - 1];

  return {
    stability: lastAttempt?.stabilityAfter ?? 1,
    accumulatedComplexity: creature.spliceHistory.reduce((total, attempt) => total + attempt.complexityAdded, 0),
    existingSourceIds,
    biologicalTags,
    phenotypeHooks,
    expressions,
    capabilityIds,
    arenaCapabilities: deriveArenaCapabilities(capabilityIds, living),
  };
}

export function evaluateCreatureCompatibility(
  creature: CreatureState,
  catalog: DomainContentCatalog,
  incomingSources: readonly SourcePackageDefinition[],
  options: {
    rules?: readonly CompatibilityRule[];
    authoredInteractions?: readonly AuthoredCompatibilityInteraction[];
  } = {},
): CompatibilityAssessment {
  const biology = deriveCreatureBiology(creature, catalog);
  return evaluateCompatibility({
    baseAnimal: findBaseAnimal(catalog, creature),
    incomingSources,
    existingSources: biology.existingSourceIds.map((sourceId) => findSource(catalog, sourceId)),
    existingBiologicalTags: biology.biologicalTags,
    rules: options.rules,
    authoredInteractions: options.authoredInteractions,
  });
}

export function buildCreatureSpliceResolutionInput(input: CreatureSpliceContextInput): SpliceResolutionInput {
  const biology = deriveCreatureBiology(input.creature, input.catalog);
  return {
    incomingSources: input.incomingSources,
    compatibility: evaluateCreatureCompatibility(input.creature, input.catalog, input.incomingSources, {
      rules: input.compatibilityRules,
      authoredInteractions: input.authoredInteractions,
    }),
    currentStability: biology.stability,
    accumulatedComplexity: biology.accumulatedComplexity,
    facilitySafety: input.facilitySafety,
    facilityPrecision: input.facilityPrecision,
    materialQuality: input.materialQuality,
  };
}

function recordExpression(
  resolved: ResolvedExpression,
  source: SourcePackageDefinition,
): SpliceExpressionRecord {
  const definition = source.expressions.find((candidate) => candidate.id === resolved.expressionId);
  if (!definition) {
    throw new Error(`Splice result references unknown expression ${resolved.expressionId} from ${source.id}.`);
  }
  const functional = isResolvedExpressionFunctional(resolved);
  return {
    sourcePackageId: source.id,
    expressionId: resolved.expressionId,
    expressed: resolved.expressed,
    magnitude: resolved.magnitude,
    completeness: resolved.completeness,
    efficiency: resolved.efficiency,
    reliability: resolved.reliability,
    stability: resolved.stability,
    biologicalTags: resolved.expressed ? [...definition.createsBiologicalTags] : [],
    phenotypeHooks: resolved.expressed ? [...definition.phenotypeHooks] : [],
    capabilityHooks: [...definition.capabilityHooks],
    capabilityIds: functional ? definition.capabilityHooks.map((hook) => ids.capability(hook)) : [],
    actionIds: [],
    functional,
    notes: functional
      ? 'Expression established above the R0.3 prototype functional gate.'
      : resolved.expressed
        ? 'Expression established but is not functionally capable at the R0.3 prototype gate.'
        : 'Expression did not establish.',
  };
}

function consequenceInjury(input: ApplySpliceResolutionInput): InjuryRecord | null {
  const { injurySeverity, permanentDamage } = input.resolution.consequences;
  if (injurySeverity === 'none') return null;
  return {
    id: `${input.attemptId}.splice_damage`,
    recordedAt: input.attemptedAt,
    status: permanentDamage || injurySeverity === 'permanent' || injurySeverity === 'lethal' ? 'permanent' : 'active',
    notes: `Splice consequence: ${injurySeverity.replaceAll('_', ' ')}.`,
    affectedCapabilityIds: [],
    affectedExpressionIds: [],
  };
}

export function applySpliceResolution(input: ApplySpliceResolutionInput): CreatureState {
  if (input.creature.spliceHistory.some((attempt) => attempt.id === input.attemptId)) {
    throw new Error(`Duplicate splice-attempt ID on creature ${input.creature.id}: ${input.attemptId}`);
  }
  const incomingIds = input.incomingSources.map((source) => source.id);
  const resultIds = unique(input.resolution.expressions.map((expression) => expression.sourcePackageId));
  if (resultIds.some((id) => !incomingIds.includes(id)) || incomingIds.some((id) => !resultIds.includes(id))) {
    throw new Error('Splice result source packages do not match the incoming source packages.');
  }

  const before = deriveCreatureBiology(input.creature, input.catalog);
  if (Math.abs(before.stability - input.resolution.stabilityBefore) > 1e-9) {
    throw new Error('Splice result stabilityBefore does not match the creature current biological state.');
  }

  const sequence = (input.creature.spliceHistory[input.creature.spliceHistory.length - 1]?.sequence ?? 0) + 1;
  const sourceById = new Map(input.incomingSources.map((source) => [source.id, source] as const));
  const expressions = input.resolution.expressions.map((resolved) => {
    const source = sourceById.get(resolved.sourcePackageId);
    if (!source) throw new Error(`Splice result references an incoming source that was not supplied: ${resolved.sourcePackageId}`);
    return recordExpression(resolved, source);
  });
  const attempt: SpliceAttemptRecord = {
    id: input.attemptId,
    sequence,
    attemptedAt: input.attemptedAt,
    sourcePackageIds: incomingIds,
    consumedMaterialLotIds: [...(input.consumedMaterialLotIds ?? [])],
    outcomeBand: input.resolution.outcomeBand,
    stabilityBefore: input.resolution.stabilityBefore,
    stabilityAfter: input.resolution.stabilityAfter,
    complexityAdded: input.resolution.risk.incomingComplexity,
    consequences: { ...input.resolution.consequences },
    expressions,
  };
  const injury = consequenceInjury(input);
  const updated: CreatureState = {
    ...input.creature,
    lifeState: input.resolution.consequences.death ? 'deceased' : input.creature.lifeState,
    spliceHistory: [...input.creature.spliceHistory, attempt],
    injuries: injury ? [...input.creature.injuries, injury] : [...input.creature.injuries],
  };
  const biology = deriveCreatureBiology(updated, input.catalog);
  return {
    ...updated,
    capabilityIds: biology.capabilityIds,
    arenaCapabilities: biology.arenaCapabilities,
  };
}
