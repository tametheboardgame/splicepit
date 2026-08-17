import { isStableId, type CreatureId, type MaterialLotId, type MutationInstanceId, type SourcePackageId, type SpliceAttemptId } from './ids.js';
import type {
  DomainContentCatalog,
  GameDomainState,
  MaterialLot,
  MutationInstance,
} from './model.js';
import type { RandomSnapshot, RandomSource } from '../random/RandomSource.js';

export type MutationAnalysisState = 'unanalysed' | 'analysed';
export type MutationStabilisationState = 'unstable' | 'stabilised';
export type MutationResearchOperationKind = 'analysis' | 'stabilisation' | 'extraction';
export type MutationResearchOutcome =
  | 'analysis_complete'
  | 'stabilised'
  | 'stabilisation_failed'
  | 'extracted'
  | 'extraction_failed';

export interface MutationResearchRecord {
  id: string;
  operation: MutationResearchOperationKind;
  performedAt: string;
  outcome: MutationResearchOutcome;
  success: boolean;
  probability: number | null;
  roll: number | null;
  randomBefore: RandomSnapshot | null;
  randomAfter: RandomSnapshot | null;
  producedMaterialLotId: MaterialLotId | null;
  observedTags: readonly string[];
  notes: string;
}

/**
 * Additive WP0.3F state stored on a mutation instance. The base MutationInstance
 * fields remain compatible with existing schema-v2 saves; older instances are
 * normalised when mutation research first touches them.
 */
export interface ResearchableMutationInstance extends MutationInstance {
  analysisState?: MutationAnalysisState;
  analysedAt?: string | null;
  stabilisationState?: MutationStabilisationState;
  stabilisationAttemptsRemaining?: number;
  extractionAttemptsRemaining?: number;
  successfulExtractions?: number;
  researchHistory?: readonly MutationResearchRecord[];
}

export interface MutationDerivedMaterialLot extends MaterialLot {
  derivedFromMutationInstanceId: MutationInstanceId;
}

export interface MutationResearchSettings {
  stabilisationDifficulty: number;
  extractionDifficulty: number;
  maxStabilisationAttempts: number;
  maxExtractionAttempts: number;
}

/**
 * PROTOTYPE / TUNABLE under S-OPEN-05. These values prove that follow-up work
 * is uncertain and finite; they are not production balance decisions.
 */
export const PROTOTYPE_MUTATION_RESEARCH_SETTINGS: Readonly<MutationResearchSettings> = {
  stabilisationDifficulty: 0.55,
  extractionDifficulty: 0.65,
  maxStabilisationAttempts: 3,
  maxExtractionAttempts: 2,
};

export class MutationResearchError extends Error {
  constructor(
    public readonly code:
      | 'invalid_input'
      | 'unknown_creature'
      | 'unknown_mutation_definition'
      | 'unknown_mutation_instance'
      | 'unknown_splice_attempt'
      | 'mutation_not_triggered'
      | 'duplicate_mutation_instance'
      | 'duplicate_operation'
      | 'already_analysed'
      | 'analysis_required'
      | 'already_stabilised'
      | 'no_attempts_remaining'
      | 'unknown_derived_source'
      | 'duplicate_material_lot',
    message: string,
  ) {
    super(message);
  }
}

export interface MaterialiseMutationInput {
  creatureId: CreatureId;
  spliceAttemptId: SpliceAttemptId;
  mutationDefinitionId: MutationInstance['definitionId'];
  mutationInstanceId: MutationInstanceId;
  recordedAt: string;
  settings?: Partial<MutationResearchSettings>;
}

export interface AnalyseMutationInput {
  creatureId: CreatureId;
  mutationInstanceId: MutationInstanceId;
  operationId: string;
  performedAt: string;
  settings?: Partial<MutationResearchSettings>;
}

export interface MutationFollowUpInput {
  creatureId: CreatureId;
  mutationInstanceId: MutationInstanceId;
  operationId: string;
  performedAt: string;
  labSafety: number;
  labPrecision: number;
  settings?: Partial<MutationResearchSettings>;
}

export interface MutationExtractionInput extends MutationFollowUpInput {
  derivedSourcePackageId: SourcePackageId;
  outputMaterialLotId: MaterialLotId;
}

export interface MutationFollowUpResult {
  state: GameDomainState;
  mutation: ResearchableMutationInstance;
  success: boolean;
  probability: number;
  roll: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new MutationResearchError('invalid_input', `${name} must be a finite number between 0 and 1.`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new MutationResearchError('invalid_input', `${name} must be a positive safe integer.`);
  }
}

function assertOperationId(operationId: string): void {
  if (!isStableId(operationId)) {
    throw new MutationResearchError('invalid_input', `Mutation research operation ID must be stable: ${operationId}`);
  }
}

function resolveSettings(overrides: Partial<MutationResearchSettings> = {}): MutationResearchSettings {
  const settings = { ...PROTOTYPE_MUTATION_RESEARCH_SETTINGS, ...overrides };
  assertUnitInterval('stabilisationDifficulty', settings.stabilisationDifficulty);
  assertUnitInterval('extractionDifficulty', settings.extractionDifficulty);
  assertPositiveInteger('maxStabilisationAttempts', settings.maxStabilisationAttempts);
  assertPositiveInteger('maxExtractionAttempts', settings.maxExtractionAttempts);
  return settings;
}

function findCreature(state: GameDomainState, creatureId: CreatureId) {
  const creature = state.creatures.find((candidate) => candidate.id === creatureId);
  if (!creature) throw new MutationResearchError('unknown_creature', `Unknown creature ${creatureId}.`);
  return creature;
}

function findMutationDefinition(catalog: DomainContentCatalog, definitionId: MutationInstance['definitionId']) {
  const definition = catalog.mutations.find((candidate) => candidate.id === definitionId);
  if (!definition) {
    throw new MutationResearchError('unknown_mutation_definition', `Unknown mutation definition ${definitionId}.`);
  }
  return definition;
}

function normaliseMutation(
  mutation: MutationInstance,
  settings: MutationResearchSettings,
): ResearchableMutationInstance {
  const researchable = mutation as ResearchableMutationInstance;
  return {
    ...researchable,
    analysisState: researchable.analysisState ?? 'unanalysed',
    analysedAt: researchable.analysedAt ?? null,
    stabilisationState: researchable.stabilisationState ?? 'unstable',
    stabilisationAttemptsRemaining: researchable.stabilisationAttemptsRemaining ?? settings.maxStabilisationAttempts,
    extractionAttemptsRemaining: researchable.extractionAttemptsRemaining ?? settings.maxExtractionAttempts,
    successfulExtractions: researchable.successfulExtractions ?? 0,
    researchHistory: [...(researchable.researchHistory ?? [])],
  };
}

function mutationFor(
  state: GameDomainState,
  creatureId: CreatureId,
  mutationInstanceId: MutationInstanceId,
  settings: MutationResearchSettings,
): ResearchableMutationInstance {
  const creature = findCreature(state, creatureId);
  const mutation = creature.mutations.find((candidate) => candidate.id === mutationInstanceId);
  if (!mutation) {
    throw new MutationResearchError('unknown_mutation_instance', `Creature ${creatureId} has no mutation ${mutationInstanceId}.`);
  }
  return normaliseMutation(mutation, settings);
}

function assertUniqueOperation(mutation: ResearchableMutationInstance, operationId: string): void {
  assertOperationId(operationId);
  if ((mutation.researchHistory ?? []).some((record) => record.id === operationId)) {
    throw new MutationResearchError('duplicate_operation', `Mutation research operation ${operationId} already exists.`);
  }
}

function replaceMutation(
  state: GameDomainState,
  creatureId: CreatureId,
  mutation: ResearchableMutationInstance,
): GameDomainState {
  return {
    ...state,
    creatures: state.creatures.map((creature) => creature.id === creatureId
      ? {
        ...creature,
        mutations: creature.mutations.map((candidate) => candidate.id === mutation.id ? mutation : candidate),
      }
      : creature),
  };
}

function appendRecord(
  mutation: ResearchableMutationInstance,
  record: MutationResearchRecord,
): ResearchableMutationInstance {
  return {
    ...mutation,
    researchHistory: [...(mutation.researchHistory ?? []), record],
  };
}

export function materialiseMutationFromSplice(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  input: MaterialiseMutationInput,
): GameDomainState {
  const settings = resolveSettings(input.settings);
  const creature = findCreature(state, input.creatureId);
  findMutationDefinition(catalog, input.mutationDefinitionId);

  if (state.creatures.some((candidate) => candidate.mutations.some((mutation) => mutation.id === input.mutationInstanceId))) {
    throw new MutationResearchError('duplicate_mutation_instance', `Mutation instance ${input.mutationInstanceId} already exists.`);
  }

  const attempt = creature.spliceHistory.find((candidate) => candidate.id === input.spliceAttemptId);
  if (!attempt) {
    throw new MutationResearchError('unknown_splice_attempt', `Unknown splice attempt ${input.spliceAttemptId} on creature ${creature.id}.`);
  }
  if (!attempt.consequences.mutationTriggered) {
    throw new MutationResearchError('mutation_not_triggered', `Splice attempt ${input.spliceAttemptId} did not trigger a mutation.`);
  }

  const mutation: ResearchableMutationInstance = {
    id: input.mutationInstanceId,
    definitionId: input.mutationDefinitionId,
    acquiredFromSpliceAttemptId: input.spliceAttemptId,
    recordedAt: input.recordedAt,
    analysisState: 'unanalysed',
    analysedAt: null,
    stabilisationState: 'unstable',
    stabilisationAttemptsRemaining: settings.maxStabilisationAttempts,
    extractionAttemptsRemaining: settings.maxExtractionAttempts,
    successfulExtractions: 0,
    researchHistory: [],
  };

  return {
    ...state,
    creatures: state.creatures.map((candidate) => candidate.id === creature.id
      ? { ...candidate, mutations: [...candidate.mutations, mutation] }
      : candidate),
  };
}

export function analyseMutation(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  input: AnalyseMutationInput,
): GameDomainState {
  const settings = resolveSettings(input.settings);
  const mutation = mutationFor(state, input.creatureId, input.mutationInstanceId, settings);
  assertUniqueOperation(mutation, input.operationId);
  if (mutation.analysisState === 'analysed') {
    throw new MutationResearchError('already_analysed', `Mutation ${mutation.id} has already been analysed.`);
  }
  const definition = findMutationDefinition(catalog, mutation.definitionId);
  const updated = appendRecord({ ...mutation, analysisState: 'analysed', analysedAt: input.performedAt }, {
    id: input.operationId,
    operation: 'analysis',
    performedAt: input.performedAt,
    outcome: 'analysis_complete',
    success: true,
    probability: null,
    roll: null,
    randomBefore: null,
    randomAfter: null,
    producedMaterialLotId: null,
    observedTags: [...definition.tags],
    notes: `Mutation analysed: ${definition.name}.`,
  });
  return replaceMutation(state, input.creatureId, updated);
}

function requireAnalysed(mutation: ResearchableMutationInstance): void {
  if (mutation.analysisState !== 'analysed') {
    throw new MutationResearchError('analysis_required', `Mutation ${mutation.id} must be analysed before follow-up work.`);
  }
}

export function attemptMutationStabilisation(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  input: MutationFollowUpInput,
  random: RandomSource,
): MutationFollowUpResult {
  const settings = resolveSettings(input.settings);
  assertUnitInterval('labSafety', input.labSafety);
  assertUnitInterval('labPrecision', input.labPrecision);
  const mutation = mutationFor(state, input.creatureId, input.mutationInstanceId, settings);
  assertUniqueOperation(mutation, input.operationId);
  requireAnalysed(mutation);
  findMutationDefinition(catalog, mutation.definitionId);
  if (mutation.stabilisationState === 'stabilised') {
    throw new MutationResearchError('already_stabilised', `Mutation ${mutation.id} is already stabilised.`);
  }
  const attemptsRemaining = mutation.stabilisationAttemptsRemaining ?? settings.maxStabilisationAttempts;
  if (attemptsRemaining <= 0) {
    throw new MutationResearchError('no_attempts_remaining', `Mutation ${mutation.id} has no stabilisation attempts remaining.`);
  }

  const probability = clamp(
    0.15 + (input.labPrecision * 0.45) + (input.labSafety * 0.25) - (settings.stabilisationDifficulty * 0.30),
    0.05,
    0.95,
  );
  const randomBefore = random.snapshot();
  const roll = random.next();
  const randomAfter = random.snapshot();
  const success = roll < probability;
  const updated = appendRecord({
    ...mutation,
    stabilisationState: success ? 'stabilised' : 'unstable',
    stabilisationAttemptsRemaining: attemptsRemaining - 1,
  }, {
    id: input.operationId,
    operation: 'stabilisation',
    performedAt: input.performedAt,
    outcome: success ? 'stabilised' : 'stabilisation_failed',
    success,
    probability,
    roll,
    randomBefore,
    randomAfter,
    producedMaterialLotId: null,
    observedTags: [],
    notes: success ? 'Mutation expression stabilised.' : 'Stabilisation attempt failed; the mutation remains unstable.',
  });

  return {
    state: replaceMutation(state, input.creatureId, updated),
    mutation: updated,
    success,
    probability,
    roll,
  };
}

export function attemptMutationExtraction(
  state: GameDomainState,
  catalog: DomainContentCatalog,
  input: MutationExtractionInput,
  random: RandomSource,
): MutationFollowUpResult {
  const settings = resolveSettings(input.settings);
  assertUnitInterval('labSafety', input.labSafety);
  assertUnitInterval('labPrecision', input.labPrecision);
  const mutation = mutationFor(state, input.creatureId, input.mutationInstanceId, settings);
  assertUniqueOperation(mutation, input.operationId);
  requireAnalysed(mutation);
  findMutationDefinition(catalog, mutation.definitionId);
  if (!catalog.sourcePackages.some((source) => source.id === input.derivedSourcePackageId)) {
    throw new MutationResearchError('unknown_derived_source', `Unknown derived source package ${input.derivedSourcePackageId}.`);
  }
  if (state.materialStock.some((lot) => lot.id === input.outputMaterialLotId)) {
    throw new MutationResearchError('duplicate_material_lot', `Material lot ${input.outputMaterialLotId} already exists.`);
  }
  const attemptsRemaining = mutation.extractionAttemptsRemaining ?? settings.maxExtractionAttempts;
  if (attemptsRemaining <= 0) {
    throw new MutationResearchError('no_attempts_remaining', `Mutation ${mutation.id} has no extraction attempts remaining.`);
  }

  const stabilisedBonus = mutation.stabilisationState === 'stabilised' ? 0.20 : 0;
  const probability = clamp(
    0.10 + (input.labPrecision * 0.40) + (input.labSafety * 0.15) + stabilisedBonus - (settings.extractionDifficulty * 0.30),
    0.05,
    0.90,
  );
  const randomBefore = random.snapshot();
  const roll = random.next();
  const randomAfter = random.snapshot();
  const success = roll < probability;
  const successfulExtractions = (mutation.successfulExtractions ?? 0) + (success ? 1 : 0);
  const updated = appendRecord({
    ...mutation,
    extractionAttemptsRemaining: attemptsRemaining - 1,
    successfulExtractions,
  }, {
    id: input.operationId,
    operation: 'extraction',
    performedAt: input.performedAt,
    outcome: success ? 'extracted' : 'extraction_failed',
    success,
    probability,
    roll,
    randomBefore,
    randomAfter,
    producedMaterialLotId: success ? input.outputMaterialLotId : null,
    observedTags: [],
    notes: success
      ? `Finite mutation-derived material extracted as ${input.outputMaterialLotId}.`
      : 'Extraction attempt failed; no material was produced.',
  });

  const mutationState = replaceMutation(state, input.creatureId, updated);
  if (!success) {
    return { state: mutationState, mutation: updated, success, probability, roll };
  }

  const quality = clamp(0.35 + (input.labPrecision * 0.45) + ((1 - roll) * 0.20), 0.1, 1);
  const material: MutationDerivedMaterialLot = {
    id: input.outputMaterialLotId,
    sourcePackageId: input.derivedSourcePackageId,
    quantity: 1,
    acquiredAt: input.performedAt,
    notes: `Finite extracted material from mutation ${mutation.id}; WP0.3F prototype representation.`,
    quality,
    acquisitionChannel: 'extract',
    derivedFromMutationInstanceId: mutation.id,
  };

  return {
    state: { ...mutationState, materialStock: [...mutationState.materialStock, material] },
    mutation: updated,
    success,
    probability,
    roll,
  };
}
