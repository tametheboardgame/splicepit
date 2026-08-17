import test from 'node:test';
import assert from 'node:assert/strict';
import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import {
  PROTOTYPE_GENERAL_REAGENT_ID,
  ResearchExperimentError,
  executeResearchExperiment,
  prototypeResearchAttemptCost,
  researchKnowledgeFor,
} from '../src/domain/research.js';

const SOURCE = ids.sourcePackage('gecko_regeneration');
const RABBIT = ids.baseAnimal('rabbit');
const GOAT = ids.baseAnimal('goat');

function creature(id, baseAnimalId, role) {
  return {
    id: ids.creature(id),
    name: id,
    baseAnimalId,
    role,
    createdAt: '2026-08-17T12:00:00.000Z',
    estimatedAgeDays: 100,
    phenotypeSeed: `${id}-seed`,
    spliceHistory: [],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: emptyArenaCapabilities(),
  };
}

function stateFixture({ materialQuantity = 2, reagentQuantity = 2 } = {}) {
  const testRabbit = creature('test_rabbit_001', RABBIT, 'test');
  const mainGoat = creature('main_goat_001', GOAT, 'main');
  return {
    creatures: [testRabbit, mainGoat],
    mainCreatureIds: [mainGoat.id],
    testAnimalIds: [testRabbit.id],
    materialStock: materialQuantity > 0 ? [{
      id: ids.materialLot('gecko_lot_001'),
      sourcePackageId: SOURCE,
      quantity: materialQuantity,
      quality: 0.8,
      acquisitionChannel: 'prototype',
      acquiredAt: '2026-08-17T11:00:00.000Z',
      notes: 'WP0.3B test lot.',
    }] : [],
    reagentStock: reagentQuantity > 0 ? [{ reagentId: PROTOTYPE_GENERAL_REAGENT_ID, quantity: reagentQuantity, notes: 'WP0.3B prototype reagent.' }] : [],
    researchKnowledge: [],
    experimentHistory: [],
    progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
  };
}

function run(state, observationId, subjectCreatureId, contextTags = []) {
  return executeResearchExperiment(state, {
    observationId: ids.experimentObservation(observationId),
    subjectCreatureId,
    sourcePackageId: SOURCE,
    cost: prototypeResearchAttemptCost(SOURCE),
    observedAt: '2026-08-17T12:30:00.000Z',
    resultCode: 'observed_expression',
    notes: `Observation ${observationId}`,
    contextTags,
  });
}

test('repeated test-animal experiments consume physical stock and increase contextual knowledge', () => {
  const initial = stateFixture();
  const testRabbitId = initial.testAnimalIds[0];

  const first = run(initial, 'obs_001', testRabbitId);
  const second = run(first.state, 'obs_002', testRabbitId);

  assert.equal(first.state.materialStock[0].quantity, 1);
  assert.equal(first.state.reagentStock[0].quantity, 1);
  assert.equal(second.state.materialStock.length, 0);
  assert.equal(second.state.reagentStock.length, 0);
  assert.equal(second.knowledge.observationCount, 2);
  assert.equal(second.state.experimentHistory.length, 2);
  assert.equal(second.state.experimentHistory[0].subjectRole, 'test');
  assert.deepEqual(second.state.mainCreatureIds, initial.mainCreatureIds);
  assert.deepEqual(second.state.testAnimalIds, initial.testAnimalIds);
});

test('learned knowledge never creates replacement source material', () => {
  const initial = stateFixture({ materialQuantity: 1, reagentQuantity: 3 });
  const testRabbitId = initial.testAnimalIds[0];
  const first = run(initial, 'obs_003', testRabbitId);

  assert.equal(first.knowledge.observationCount, 1);
  assert.equal(first.state.materialStock.length, 0);
  assert.throws(
    () => run(first.state, 'obs_004', testRabbitId),
    (error) => error instanceof ResearchExperimentError && error.code === 'insufficient_material',
  );
  assert.equal(first.state.researchKnowledge[0].observationCount, 1);
  assert.equal(first.state.materialStock.length, 0);
});

test('research is stored separately for relevant base and experiment context', () => {
  const initial = stateFixture({ materialQuantity: 4, reagentQuantity: 4 });
  const rabbitId = initial.testAnimalIds[0];
  const goatId = initial.mainCreatureIds[0];

  const rabbitDefault = run(initial, 'obs_005', rabbitId);
  const rabbitStressed = run(rabbitDefault.state, 'obs_006', rabbitId, ['condition.metabolic_stress']);
  const goatDefault = run(rabbitStressed.state, 'obs_007', goatId);

  assert.equal(goatDefault.state.researchKnowledge.length, 3);
  assert.equal(researchKnowledgeFor(goatDefault.state, SOURCE, RABBIT)?.observationCount, 1);
  assert.equal(researchKnowledgeFor(goatDefault.state, SOURCE, RABBIT, ['condition.metabolic_stress'])?.observationCount, 1);
  assert.equal(researchKnowledgeFor(goatDefault.state, SOURCE, GOAT)?.observationCount, 1);
});

test('attempt costs are atomic when reagent stock is insufficient', () => {
  const initial = stateFixture({ materialQuantity: 2, reagentQuantity: 0 });
  const snapshot = structuredClone(initial);

  assert.throws(
    () => run(initial, 'obs_008', initial.testAnimalIds[0]),
    (error) => error instanceof ResearchExperimentError && error.code === 'insufficient_reagent',
  );
  assert.deepEqual(initial, snapshot);
});

test('material quality threshold can make physically present stock ineligible', () => {
  const initial = stateFixture({ materialQuantity: 2, reagentQuantity: 2 });
  const cost = {
    materials: [{ sourcePackageId: SOURCE, quantity: 1, minimumQuality: 0.9 }],
    reagents: [{ reagentId: PROTOTYPE_GENERAL_REAGENT_ID, quantity: 1 }],
  };

  assert.throws(
    () => executeResearchExperiment(initial, {
      observationId: ids.experimentObservation('obs_009'),
      subjectCreatureId: initial.testAnimalIds[0],
      sourcePackageId: SOURCE,
      cost,
      observedAt: '2026-08-17T12:30:00.000Z',
      resultCode: 'no_attempt',
      notes: 'Stock exists but is below the required quality threshold.',
    }),
    (error) => error instanceof ResearchExperimentError && error.code === 'insufficient_material',
  );
});
