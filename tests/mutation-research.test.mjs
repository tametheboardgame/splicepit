import test from 'node:test';
import assert from 'node:assert/strict';

import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import {
  analyseMutation,
  attemptMutationExtraction,
  attemptMutationStabilisation,
  materialiseMutationFromSplice,
  MutationResearchError,
} from '../src/domain/mutationResearch.js';
import { createSaveEnvelope, decodeSave, domainStateFromSave } from '../src/persistence/saveSchema.js';
import { SeededRandom } from '../src/random/RandomSource.js';

const baseAnimal = {
  id: ids.baseAnimal('fixture_rabbit'),
  status: 'prototype',
  revision: 1,
  name: 'Fixture Rabbit',
  description: 'Mutation research fixture.',
  species: 'Rabbit',
  bodyPlanTags: ['body.mammal'],
  biologicalTags: ['frame.light'],
  baselinePhenotypeHooks: ['base.rabbit'],
  baselineCapabilityHooks: ['movement.land'],
};

const sourcePackage = {
  id: ids.sourcePackage('fixture_mutation_sample'),
  status: 'prototype',
  revision: 1,
  name: 'Fixture Mutation Sample',
  description: 'Physical carrier used to prove finite mutation-derived material.',
  sourceSpecies: 'Fixture',
  biologicalClassTags: ['regulatory'],
  expressions: [{
    id: 'fixture_expression',
    name: 'Fixture Expression',
    description: 'Fixture.',
    biologicalClass: 'regulatory',
    requirements: { allOfTags: [], anyOfTags: [], noneOfTags: [] },
    compatibilityTags: [],
    createsBiologicalTags: ['mutation.fixture_expression'],
    phenotypeHooks: [],
    capabilityHooks: [],
  }],
  requirements: { allOfTags: [], anyOfTags: [], noneOfTags: [] },
  compatibilityTags: ['mutation.fixture_sample'],
  complexity: {
    integration: 'moderate',
    structuralDemand: 'low',
    metabolicDemand: 'moderate',
    regulatoryVolatility: 'high',
  },
  phenotypeHooks: [],
  capabilityHooks: [],
  potentialCapabilityIds: [],
  potentialActionIds: [],
};

const mutationDefinition = {
  id: ids.mutationDefinition('fixture_overgrowth'),
  status: 'prototype',
  revision: 1,
  name: 'Fixture Overgrowth',
  description: 'Unexpected growth pattern used by WP0.3F acceptance coverage.',
  tags: ['mutation.overgrowth', 'effect.mixed'],
};

const catalog = {
  baseAnimals: [baseAnimal],
  sourcePackages: [sourcePackage],
  mutations: [mutationDefinition],
  capabilities: [],
  actions: [],
  items: [],
  locations: [],
  quests: [],
  progressionStates: [],
};

const spliceAttemptId = ids.spliceAttempt('fixture_mutating_splice');
const mutationInstanceId = ids.mutationInstance('fixture_mutation_instance');

function creatureFixture() {
  const arenaCapabilities = emptyArenaCapabilities();
  arenaCapabilities.land = { functional: true, supportingCapabilityIds: [ids.capability('movement.land')] };
  return {
    id: ids.creature('fixture_creature'),
    name: 'Mabel',
    baseAnimalId: baseAnimal.id,
    role: 'main',
    lifeState: 'living',
    createdAt: '2026-08-17T14:00:00.000Z',
    estimatedAgeDays: 400,
    phenotypeSeed: 'mutation-fixture',
    spliceHistory: [{
      id: spliceAttemptId,
      sequence: 1,
      attemptedAt: '2026-08-17T14:10:00.000Z',
      sourcePackageIds: [sourcePackage.id],
      consumedMaterialLotIds: [],
      outcomeBand: 'mutated_success',
      stabilityBefore: 1,
      stabilityAfter: 0.78,
      complexityAdded: 0.8,
      consequences: {
        mutationTriggered: true,
        permanentDamage: false,
        death: false,
        injurySeverity: 'none',
      },
      expressions: [],
    }],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [ids.capability('movement.land')],
    arenaCapabilities,
  };
}

function stateFixture() {
  const creature = creatureFixture();
  return {
    creatures: [creature],
    mainCreatureIds: [creature.id],
    testAnimalIds: [],
    materialStock: [],
    reagentStock: [],
    researchKnowledge: [],
    experimentHistory: [],
    progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
  };
}

function materialisedState(settings = {}) {
  return materialiseMutationFromSplice(stateFixture(), catalog, {
    creatureId: ids.creature('fixture_creature'),
    spliceAttemptId,
    mutationDefinitionId: mutationDefinition.id,
    mutationInstanceId,
    recordedAt: '2026-08-17T14:11:00.000Z',
    settings,
  });
}

function analysedState(settings = {}) {
  return analyseMutation(materialisedState(settings), catalog, {
    creatureId: ids.creature('fixture_creature'),
    mutationInstanceId,
    operationId: 'mutation_analysis_1',
    performedAt: '2026-08-17T14:20:00.000Z',
    settings,
  });
}

function mutationFrom(state) {
  return state.creatures[0].mutations.find((mutation) => mutation.id === mutationInstanceId);
}

function gameplayFixture() {
  return {
    hasBaseAnimal: true,
    baseAnimalId: baseAnimal.id,
    collectedGenes: [],
    currentCreature: null,
    coins: 0,
    debt: 0,
    fitPitWins: 0,
    questStage: 'mutation_fixture',
    seenIntro: true,
  };
}

function findSeedFor(operation, wantedSuccess) {
  for (let index = 0; index < 1000; index += 1) {
    const seed = `mutation-seed-${index}`;
    const result = operation(new SeededRandom(seed));
    if (result.success === wantedSuccess) return { seed, result };
  }
  throw new Error(`Unable to find seeded mutation outcome success=${wantedSuccess}.`);
}

test('a triggered splice can materialise a persistent mutation which analysis turns into recorded knowledge', () => {
  const materialised = materialisedState();
  const mutation = mutationFrom(materialised);
  assert.equal(mutation.definitionId, mutationDefinition.id);
  assert.equal(mutation.acquiredFromSpliceAttemptId, spliceAttemptId);
  assert.equal(mutation.analysisState, 'unanalysed');
  assert.equal(mutation.stabilisationState, 'unstable');
  assert.equal(mutation.researchHistory.length, 0);

  const analysed = analyseMutation(materialised, catalog, {
    creatureId: ids.creature('fixture_creature'),
    mutationInstanceId,
    operationId: 'mutation_analysis_first',
    performedAt: '2026-08-17T14:20:00.000Z',
  });
  const analysedMutation = mutationFrom(analysed);
  assert.equal(analysedMutation.analysisState, 'analysed');
  assert.equal(analysedMutation.analysedAt, '2026-08-17T14:20:00.000Z');
  assert.equal(analysedMutation.researchHistory.length, 1);
  assert.deepEqual(analysedMutation.researchHistory[0].observedTags, mutationDefinition.tags);
  assert.equal(analysedMutation.researchHistory[0].outcome, 'analysis_complete');
});

test('mutation instances cannot be invented from splice attempts which did not generate a mutation', () => {
  const state = stateFixture();
  state.creatures[0].spliceHistory[0].consequences.mutationTriggered = false;
  assert.throws(
    () => materialiseMutationFromSplice(state, catalog, {
      creatureId: state.creatures[0].id,
      spliceAttemptId,
      mutationDefinitionId: mutationDefinition.id,
      mutationInstanceId,
      recordedAt: '2026-08-17T14:11:00.000Z',
    }),
    (error) => error instanceof MutationResearchError && error.code === 'mutation_not_triggered',
  );
});

test('seeded stabilisation can succeed or fail and replays with identical RNG evidence', () => {
  const state = analysedState();
  const input = {
    creatureId: ids.creature('fixture_creature'),
    mutationInstanceId,
    operationId: 'stabilisation_attempt_1',
    performedAt: '2026-08-17T14:30:00.000Z',
    labSafety: 0.5,
    labPrecision: 0.5,
  };
  const operation = (random) => attemptMutationStabilisation(state, catalog, input, random);
  const successful = findSeedFor(operation, true);
  const failed = findSeedFor(operation, false);
  assert.notEqual(successful.seed, failed.seed);

  const replay = operation(new SeededRandom(successful.seed));
  assert.equal(replay.success, true);
  assert.equal(replay.roll, successful.result.roll);
  assert.equal(replay.probability, successful.result.probability);
  assert.deepEqual(replay.mutation.researchHistory.at(-1), successful.result.mutation.researchHistory.at(-1));
  assert.equal(replay.mutation.stabilisationState, 'stabilised');
  assert.equal(failed.result.mutation.stabilisationState, 'unstable');
  assert.equal(failed.result.mutation.researchHistory.at(-1).outcome, 'stabilisation_failed');
  assert.equal(failed.result.mutation.stabilisationAttemptsRemaining, 2);
});

test('extraction is uncertain, produces finite physical material on success and cannot become an infinite-copy source', () => {
  const settings = { maxExtractionAttempts: 1 };
  const state = analysedState(settings);
  const baseInput = {
    creatureId: ids.creature('fixture_creature'),
    mutationInstanceId,
    operationId: 'extraction_attempt_1',
    performedAt: '2026-08-17T14:40:00.000Z',
    labSafety: 0.8,
    labPrecision: 0.8,
    settings,
    derivedSourcePackageId: sourcePackage.id,
    outputMaterialLotId: ids.materialLot('mutation_extract_1'),
  };
  const operation = (random) => attemptMutationExtraction(state, catalog, baseInput, random);
  const successful = findSeedFor(operation, true).result;
  const failed = findSeedFor(operation, false).result;

  assert.equal(successful.state.materialStock.length, 1);
  const lot = successful.state.materialStock[0];
  assert.equal(lot.quantity, 1);
  assert.equal(lot.acquisitionChannel, 'extract');
  assert.equal(lot.sourcePackageId, sourcePackage.id);
  assert.equal(lot.derivedFromMutationInstanceId, mutationInstanceId);
  assert.equal(successful.mutation.extractionAttemptsRemaining, 0);
  assert.equal(successful.mutation.successfulExtractions, 1);
  assert.equal(successful.mutation.researchHistory.at(-1).producedMaterialLotId, lot.id);

  assert.equal(failed.state.materialStock.length, 0);
  assert.equal(failed.mutation.extractionAttemptsRemaining, 0);
  assert.equal(failed.mutation.successfulExtractions, 0);
  assert.equal(failed.mutation.researchHistory.at(-1).outcome, 'extraction_failed');

  assert.throws(
    () => attemptMutationExtraction(successful.state, catalog, {
      ...baseInput,
      operationId: 'extraction_attempt_2',
      outputMaterialLotId: ids.materialLot('mutation_extract_2'),
    }, new SeededRandom('second-extraction')),
    (error) => error instanceof MutationResearchError && error.code === 'no_attempts_remaining',
  );
});

test('mutation follow-up outcome, RNG audit trail and derived material survive save/load', () => {
  const settings = { maxExtractionAttempts: 1 };
  const state = analysedState(settings);
  const input = {
    creatureId: ids.creature('fixture_creature'),
    mutationInstanceId,
    operationId: 'persisted_extraction',
    performedAt: '2026-08-17T14:50:00.000Z',
    labSafety: 0.9,
    labPrecision: 0.9,
    settings,
    derivedSourcePackageId: sourcePackage.id,
    outputMaterialLotId: ids.materialLot('persisted_mutation_extract'),
  };
  const successful = findSeedFor(
    (random) => attemptMutationExtraction(state, catalog, input, random),
    true,
  ).result;

  const envelope = createSaveEnvelope(gameplayFixture(), successful.state, '2026-08-17T15:00:00.000Z');
  const loaded = domainStateFromSave(decodeSave(JSON.stringify(envelope)));
  const loadedMutation = mutationFrom(loaded);
  const loadedRecord = loadedMutation.researchHistory.at(-1);

  assert.equal(loadedMutation.analysisState, 'analysed');
  assert.equal(loadedMutation.extractionAttemptsRemaining, 0);
  assert.equal(loadedMutation.successfulExtractions, 1);
  assert.equal(loadedRecord.outcome, 'extracted');
  assert.equal(loadedRecord.success, true);
  assert.equal(loadedRecord.randomBefore.seed, successful.mutation.researchHistory.at(-1).randomBefore.seed);
  assert.equal(loadedRecord.randomAfter.calls, successful.mutation.researchHistory.at(-1).randomAfter.calls);
  assert.equal(loaded.materialStock[0].derivedFromMutationInstanceId, mutationInstanceId);
  assert.equal(loaded.materialStock[0].quantity, 1);
});
