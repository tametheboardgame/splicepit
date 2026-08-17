import { projectCompatibilityInformation } from './compatibility.js';
import {
  applySpliceResolution,
  buildCreatureSpliceResolutionInput,
  deriveCreatureBiology,
} from './creatureBiology.js';
import type {
  CreatureId,
  ExperimentObservationId,
  MutationDefinitionId,
  MutationInstanceId,
  SourcePackageId,
  SpliceAttemptId,
} from './ids.js';
import { materialiseMutationFromSplice } from './mutationResearch.js';
import type {
  CreatureState,
  DomainContentCatalog,
  ExperimentObservationRecord,
  GameDomainState,
  ResearchKnowledgeRecord,
  SourcePackageDefinition,
  SpliceOutcomeBand,
} from './model.js';
import {
  availableMaterialQuantity,
  executeResearchExperiment,
  PROTOTYPE_GENERAL_REAGENT_ID,
  prototypeResearchAttemptCost,
  researchKnowledgeFor,
} from './research.js';
import {
  buildSpliceOutcomeDistribution,
  resolveSplice,
  type SpliceResolutionInput,
  type SpliceResolutionResult,
} from './spliceResolution.js';
import type { RandomSource } from '../random/RandomSource.js';

export interface PrototypeLabFacilitySettings {
  safety: number;
  precision: number;
}

/**
 * PROTOTYPE / TUNABLE. WP0.3H needs one consistent bench for playtesting, not
 * production upgrade values. Facility progression remains WP0.5F and balance
 * remains subject to later playtest/R3 tuning.
 */
export const PROTOTYPE_R03_LAB_FACILITY: Readonly<PrototypeLabFacilitySettings> = {
  safety: 0.72,
  precision: 0.68,
};

export type LabResearchConfidence = 'untested' | 'tentative' | 'informed' | 'well_observed';

export interface ProbabilityRange {
  lower: number;
  upper: number;
}

export interface LabSpliceForecast {
  subjectCreatureId: CreatureId;
  sourcePackageId: SourcePackageId;
  researchConfidence: LabResearchConfidence;
  observationCount: number;
  viableExpressionRange: ProbabilityRange;
  adversityRange: ProbabilityRange;
  compatibilityProfile: string;
  knownWarnings: readonly string[];
  unknownFactorsRemain: boolean;
  availableMaterial: number;
  availableReagent: number;
  canAttempt: boolean;
  irreversible: true;
}

export interface LabSplicePlan extends LabSpliceForecast {
  resolutionInput: SpliceResolutionInput;
  source: SourcePackageDefinition;
  subject: CreatureState;
  materialQuality: number;
}

export interface ExecuteLabSpliceInput {
  subjectCreatureId: CreatureId;
  sourcePackageId: SourcePackageId;
  attemptId: SpliceAttemptId;
  observationId: ExperimentObservationId;
  attemptedAt: string;
  facility?: PrototypeLabFacilitySettings;
  mutationDefinitionId?: MutationDefinitionId;
  mutationInstanceId?: MutationInstanceId;
}

export interface LabExperimentResult {
  state: GameDomainState;
  creature: CreatureState;
  resolution: SpliceResolutionResult;
  knowledge: ResearchKnowledgeRecord;
  observation: ExperimentObservationRecord;
  mutationInstanceId: MutationInstanceId | null;
}

export interface ExperimentComparisonRow {
  observationId: ExperimentObservationId;
  observedAt: string;
  baseAnimalId: string;
  subjectRole: 'main' | 'test';
  sourcePackageId: SourcePackageId;
  resultCode: string;
  subjectCreatureId: CreatureId;
}

export class LabExperimentError extends Error {
  constructor(
    public readonly code:
      | 'unknown_subject'
      | 'dead_subject'
      | 'unknown_source'
      | 'insufficient_material'
      | 'insufficient_reagent'
      | 'mutation_identity_required'
      | 'unknown_mutation_definition',
    message: string,
  ) {
    super(message);
  }
}

const VIABLE_EXPRESSION_BANDS: ReadonlySet<SpliceOutcomeBand> = new Set([
  'partial_expression',
  'unstable_viable',
  'normal_success',
  'mutated_success',
  'exceptional_synergy',
]);

const ADVERSITY_BANDS: ReadonlySet<SpliceOutcomeBand> = new Set([
  'damaging_failure',
  'unstable_viable',
  'catastrophic_result',
]);

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundFive(value: number): number {
  return Math.round(value / 5) * 5;
}

function probabilityRange(probability: number, observationCount: number): ProbabilityRange {
  const centre = probability * 100;
  const halfWidth = observationCount === 0
    ? 30
    : observationCount === 1
      ? 25
      : observationCount <= 3
        ? 20
        : observationCount <= 7
          ? 15
          : 10;
  let lower = roundFive(clamp(centre - halfWidth, 0, 100));
  let upper = roundFive(clamp(centre + halfWidth, 0, 100));
  if (upper - lower < 10) {
    lower = clamp(lower - 5, 0, 100);
    upper = clamp(upper + 5, 0, 100);
  }
  return { lower, upper };
}

function confidenceFor(observationCount: number): LabResearchConfidence {
  if (observationCount === 0) return 'untested';
  if (observationCount === 1) return 'tentative';
  if (observationCount <= 3) return 'informed';
  return 'well_observed';
}

function findSubject(state: GameDomainState, creatureId: CreatureId): CreatureState {
  const creature = state.creatures.find((candidate) => candidate.id === creatureId);
  if (!creature) throw new LabExperimentError('unknown_subject', `Unknown lab subject ${creatureId}.`);
  if (creature.lifeState === 'deceased') {
    throw new LabExperimentError('dead_subject', `${creature.name} cannot undergo another splice.`);
  }
  return creature;
}

function findSource(catalog: DomainContentCatalog, sourcePackageId: SourcePackageId): SourcePackageDefinition {
  const source = catalog.sourcePackages.find((candidate) => candidate.id === sourcePackageId);
  if (!source) throw new LabExperimentError('unknown_source', `Unknown source package ${sourcePackageId}.`);
  return source;
}

function nextMaterialQuality(state: GameDomainState, sourcePackageId: SourcePackageId): number {
  const lot = state.materialStock
    .filter((candidate) => candidate.sourcePackageId === sourcePackageId && candidate.quantity > 0)
    .sort((left, right) => (left.quality ?? 1) - (right.quality ?? 1) || left.acquiredAt.localeCompare(right.acquiredAt))[0];
  return lot?.quality ?? 1;
}

function reagentQuantity(state: GameDomainState): number {
  return state.reagentStock.find((entry) => entry.reagentId === PROTOTYPE_GENERAL_REAGENT_ID)?.quantity ?? 0;
}

function probabilityForBands(
  distribution: ReturnType<typeof buildSpliceOutcomeDistribution>,
  bands: ReadonlySet<SpliceOutcomeBand>,
): number {
  return distribution
    .filter((entry) => bands.has(entry.band))
    .reduce((total, entry) => total + entry.probability, 0);
}

export function buildLabSplicePlan(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  subjectCreatureId: CreatureId,
  sourcePackageId: SourcePackageId,
  facility: PrototypeLabFacilitySettings = PROTOTYPE_R03_LAB_FACILITY,
): LabSplicePlan {
  const subject = findSubject(state, subjectCreatureId);
  const source = findSource(catalog, sourcePackageId);
  const availableMaterial = availableMaterialQuantity(state, sourcePackageId);
  const availableReagent = reagentQuantity(state);
  const materialQuality = nextMaterialQuality(state, sourcePackageId);
  const resolutionInput = buildCreatureSpliceResolutionInput({
    creature: subject,
    catalog,
    incomingSources: [source],
    facilitySafety: facility.safety,
    facilityPrecision: facility.precision,
    materialQuality,
  });
  const distribution = buildSpliceOutcomeDistribution(resolutionInput);
  const knowledge = researchKnowledgeFor(state, sourcePackageId, subject.baseAnimalId);
  const observationCount = knowledge?.observationCount ?? 0;
  const information = projectCompatibilityInformation(resolutionInput.compatibility, 'observable');
  const biology = deriveCreatureBiology(subject, catalog);
  const knownWarnings = [...information.explanations];
  if (biology.stability < 0.75) knownWarnings.push('Existing biological stability is already reduced; another splice carries extra uncertainty.');
  if (subject.spliceHistory.length >= 3) knownWarnings.push('This creature already carries several irreversible splice attempts; accumulated complexity is increasing.');
  if (availableMaterial < 1) knownWarnings.push('No usable physical material remains for this source package.');
  if (availableReagent < 1) knownWarnings.push('No general lab reagent remains for another attempt.');

  return {
    subjectCreatureId,
    sourcePackageId,
    researchConfidence: confidenceFor(observationCount),
    observationCount,
    viableExpressionRange: probabilityRange(probabilityForBands(distribution, VIABLE_EXPRESSION_BANDS), observationCount),
    adversityRange: probabilityRange(probabilityForBands(distribution, ADVERSITY_BANDS), observationCount),
    compatibilityProfile: information.displayProfile,
    knownWarnings,
    unknownFactorsRemain: information.incomplete || observationCount < 8,
    availableMaterial,
    availableReagent,
    canAttempt: availableMaterial >= 1 && availableReagent >= 1,
    irreversible: true,
    resolutionInput,
    source,
    subject,
    materialQuality,
  };
}

function replaceCreature(state: GameDomainState, creature: CreatureState): GameDomainState {
  return {
    ...state,
    creatures: state.creatures.map((candidate) => candidate.id === creature.id ? creature : candidate),
  };
}

function mutationDefinitionFor(
  catalog: DomainContentCatalog,
  requested: MutationDefinitionId | undefined,
  random: RandomSource,
): MutationDefinitionId {
  if (requested) {
    if (!catalog.mutations.some((definition) => definition.id === requested)) {
      throw new LabExperimentError('unknown_mutation_definition', `Unknown mutation definition ${requested}.`);
    }
    return requested;
  }
  if (catalog.mutations.length === 0) {
    throw new LabExperimentError('unknown_mutation_definition', 'No mutation definitions are available.');
  }
  const index = Math.min(catalog.mutations.length - 1, Math.floor(random.next() * catalog.mutations.length));
  return catalog.mutations[index].id;
}

export function executeLabSplice(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  input: ExecuteLabSpliceInput,
  random: RandomSource,
): LabExperimentResult {
  const plan = buildLabSplicePlan(
    state,
    catalog,
    input.subjectCreatureId,
    input.sourcePackageId,
    input.facility ?? PROTOTYPE_R03_LAB_FACILITY,
  );
  if (plan.availableMaterial < 1) {
    throw new LabExperimentError('insufficient_material', `No ${plan.source.name} material remains.`);
  }
  if (plan.availableReagent < 1) {
    throw new LabExperimentError('insufficient_reagent', 'No general lab reagent remains.');
  }

  const resolution = resolveSplice(plan.resolutionInput, random);
  const cost = prototypeResearchAttemptCost(input.sourcePackageId);
  const research = executeResearchExperiment(state, {
    observationId: input.observationId,
    subjectCreatureId: input.subjectCreatureId,
    sourcePackageId: input.sourcePackageId,
    cost,
    observedAt: input.attemptedAt,
    resultCode: resolution.outcomeBand,
    notes: `${plan.source.name} splice resolved as ${resolution.outcomeBand.replaceAll('_', ' ')}.`,
  });

  const consumedLotIds = research.consumedMaterials.map((record) => record.materialLotId);
  const subjectAfterResearch = findSubject(research.state, input.subjectCreatureId);
  const splicedCreature = applySpliceResolution({
    creature: subjectAfterResearch,
    catalog,
    incomingSources: [plan.source],
    resolution,
    attemptId: input.attemptId,
    attemptedAt: input.attemptedAt,
    consumedMaterialLotIds: consumedLotIds,
  });
  let nextState = replaceCreature(research.state, splicedCreature);
  let mutationInstanceId: MutationInstanceId | null = null;

  if (resolution.consequences.mutationTriggered) {
    if (!input.mutationInstanceId) {
      throw new LabExperimentError('mutation_identity_required', 'Mutation-triggering splice requires a stable mutation instance ID.');
    }
    const mutationDefinitionId = mutationDefinitionFor(catalog, input.mutationDefinitionId, random);
    nextState = materialiseMutationFromSplice(nextState, catalog, {
      creatureId: splicedCreature.id,
      spliceAttemptId: input.attemptId,
      mutationDefinitionId,
      mutationInstanceId: input.mutationInstanceId,
      recordedAt: input.attemptedAt,
    });
    mutationInstanceId = input.mutationInstanceId;
  }

  const creature = findSubjectOrDeceased(nextState, input.subjectCreatureId);
  const observation = nextState.experimentHistory.find((candidate) => candidate.id === input.observationId);
  if (!observation) throw new Error(`Experiment observation ${input.observationId} was not persisted.`);
  return {
    state: nextState,
    creature,
    resolution,
    knowledge: research.knowledge,
    observation,
    mutationInstanceId,
  };
}

function findSubjectOrDeceased(state: GameDomainState, creatureId: CreatureId): CreatureState {
  const creature = state.creatures.find((candidate) => candidate.id === creatureId);
  if (!creature) throw new LabExperimentError('unknown_subject', `Unknown lab subject ${creatureId}.`);
  return creature;
}

export function compareExperimentRecords(
  state: GameDomainState,
  sourcePackageId?: SourcePackageId,
  limit = 8,
): ExperimentComparisonRow[] {
  return state.experimentHistory
    .filter((observation) => sourcePackageId === undefined || observation.sourcePackageId === sourcePackageId)
    .slice()
    .sort((left, right) => right.observedAt.localeCompare(left.observedAt))
    .slice(0, limit)
    .map((observation) => ({
      observationId: observation.id,
      observedAt: observation.observedAt,
      baseAnimalId: observation.baseAnimalId,
      subjectRole: observation.subjectRole,
      sourcePackageId: observation.sourcePackageId,
      resultCode: observation.resultCode,
      subjectCreatureId: observation.subjectCreatureId,
    }));
}
