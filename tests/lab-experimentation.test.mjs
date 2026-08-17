import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_CATALOG } from '../src/content/contentCatalog.js';
import { ids } from '../src/domain/ids.js';
import {
  LabExperimentError,
  buildLabSplicePlan,
  compareExperimentRecords,
  executeLabSplice,
} from '../src/domain/labExperimentation.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { PROTOTYPE_GENERAL_REAGENT_ID } from '../src/domain/research.js';
import { SeededRandom } from '../src/random/RandomSource.js';

const SOURCE = ids.sourcePackage('gecko_regeneration');
const RABBIT = ids.baseAnimal('rabbit');
const GOAT = ids.baseAnimal('goat');

function creature(id, baseAnimalId, role) {
  return {
    id: ids.creature(id),
    name: id,
    baseAnimalId,
    role,
    lifeState: 'living',
    createdAt: '2026-08-17T12:00:00.000Z',
    estimatedAgeDays: 100,
    phenotypeSeed: `${id}.seed`,
    spliceHistory: [],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: emptyArenaCapabilities(),
  };
}

function stateFixture({ materialQuantity = 8, reagentQuantity = 8, observationCount = 0 } = {}) {
  const rabbit = creature('test.rabbit.h', RABBIT, 'test');
  const goat = creature('test.goat.h', GOAT, 'test');
  const main = creature('main.rabbit.h', RABBIT, 'main');
  return {
    creatures: [rabbit, goat, main],
    mainCreatureIds: [main.id],
    testAnimalIds: [rabbit.id, goat.id],
    materialStock: materialQuantity > 0 ? [{
      id: ids.materialLot('lot.gecko.h'),
      sourcePackageId: SOURCE,
      quantity: materialQuantity,
      quality: 0.82,
      acquisitionChannel: 'prototype',
      acquiredAt: '2026-08-17T11:00:00.000Z',
      notes: 'WP0.3H acceptance stock.',
    }] : [],
    reagentStock: reagentQuantity > 0 ? [{ reagentId: PROTOTYPE_GENERAL_REAGENT_ID, quantity: reagentQuantity, notes: 'WP0.3H reagent.' }] : [],
    researchKnowledge: observationCount > 0 ? [{
      sourcePackageId: SOURCE,
      baseAnimalId: RABBIT,
      contextKey: 'base:rabbit|context:default',
      contextTags: [],
      observationCount,
      notes: Array.from({ length: observationCount }, (_, index) => `Observation ${index + 1}`),
    }] : [],
    experimentHistory: [],
    progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
  };
}

function execute(state, subjectCreatureId, ordinal, seed = `wp03h-${ordinal}`) {
  return executeLabSplice(state, CONTENT_CATALOG, {
    subjectCreatureId,
    sourcePackageId: SOURCE,
    attemptId: ids.spliceAttempt(`h.attempt.${ordinal}`),
    observationId: ids.experimentObservation(`h.observation.${ordinal}`),
    mutationInstanceId: ids.mutationInstance(`h.mutation.${ordinal}`),
    attemptedAt: `2026-08-17T12:${String(ordinal).padStart(2, '0')}:00.000Z`,
  }, new SeededRandom(seed));
}

test('player forecast exposes ranges and uncertainty rather than exact outcome probabilities', () => {
  const state = stateFixture();
  const plan = buildLabSplicePlan(state, CONTENT_CATALOG, state.testAnimalIds[0], SOURCE);

  assert.equal(plan.researchConfidence, 'untested');
  assert.equal(plan.observationCount, 0);
  assert.ok(plan.viableExpressionRange.upper > plan.viableExpressionRange.lower);
  assert.ok(plan.adversityRange.upper > plan.adversityRange.lower);
  assert.equal('distribution' in plan, false);
  assert.equal(plan.irreversible, true);
  assert.equal(plan.unknownFactorsRemain, true);
});

test('research narrows confidence ranges without turning the forecast into certainty', () => {
  const untested = stateFixture({ observationCount: 0 });
  const observed = stateFixture({ observationCount: 9 });
  const before = buildLabSplicePlan(untested, CONTENT_CATALOG, untested.testAnimalIds[0], SOURCE);
  const after = buildLabSplicePlan(observed, CONTENT_CATALOG, observed.testAnimalIds[0], SOURCE);

  const beforeWidth = before.viableExpressionRange.upper - before.viableExpressionRange.lower;
  const afterWidth = after.viableExpressionRange.upper - after.viableExpressionRange.lower;
  assert.equal(after.researchConfidence, 'well_observed');
  assert.ok(afterWidth < beforeWidth);
  assert.ok(afterWidth >= 10);
});

test('test splice consumes finite stock, records research and permanently appends only the test animal history', () => {
  const initial = stateFixture();
  const testId = initial.testAnimalIds[0];
  const mainId = initial.mainCreatureIds[0];
  const result = execute(initial, testId, 1);

  assert.equal(result.state.materialStock[0].quantity, 7);
  assert.equal(result.state.reagentStock[0].quantity, 7);
  assert.equal(result.state.experimentHistory.length, 1);
  assert.equal(result.knowledge.observationCount, 1);
  assert.equal(result.creature.spliceHistory.length, 1);
  assert.equal(result.state.creatures.find((candidate) => candidate.id === mainId).spliceHistory.length, 0);
  assert.equal(result.observation.subjectRole, 'test');
  assert.equal(result.observation.resultCode, result.resolution.outcomeBand);
});

test('comparison records preserve different base-animal evidence for the same source package', () => {
  const initial = stateFixture();
  const rabbit = execute(initial, initial.testAnimalIds[0], 2, 'rabbit-evidence');
  const goat = execute(rabbit.state, initial.testAnimalIds[1], 3, 'goat-evidence');
  const rows = compareExperimentRecords(goat.state, SOURCE);

  assert.equal(rows.length, 2);
  assert.deepEqual(new Set(rows.map((row) => row.baseAnimalId)), new Set(['rabbit', 'goat']));
  assert.ok(rows.every((row) => row.subjectRole === 'test'));
});

test('main-creature splice uses the same uncertain transaction and becomes irreversible history', () => {
  const initial = stateFixture();
  const testResult = execute(initial, initial.testAnimalIds[0], 4, 'learn-first');
  const mainResult = execute(testResult.state, initial.mainCreatureIds[0], 5, 'risk-main');
  const main = mainResult.state.creatures.find((candidate) => candidate.id === initial.mainCreatureIds[0]);

  assert.equal(main.spliceHistory.length, 1);
  assert.equal(mainResult.observation.subjectRole, 'main');
  assert.equal(mainResult.state.experimentHistory.length, 2);
  assert.equal(mainResult.state.materialStock[0].quantity, 6);
});

test('depleted physical stock blocks another attempt even when research knowledge remains', () => {
  const initial = stateFixture({ materialQuantity: 1, reagentQuantity: 2 });
  const first = execute(initial, initial.testAnimalIds[0], 6, 'consume-last');
  const plan = buildLabSplicePlan(first.state, CONTENT_CATALOG, initial.testAnimalIds[0], SOURCE);

  assert.equal(plan.availableMaterial, 0);
  assert.equal(plan.canAttempt, false);
  assert.throws(
    () => execute(first.state, initial.testAnimalIds[0], 7, 'no-free-knowledge'),
    (error) => error instanceof LabExperimentError && error.code === 'insufficient_material',
  );
});

test('seeded lab transaction is reproducible from the same starting state', () => {
  const initial = stateFixture();
  const left = execute(structuredClone(initial), initial.testAnimalIds[0], 8, 'repeatable-lab');
  const right = execute(structuredClone(initial), initial.testAnimalIds[0], 8, 'repeatable-lab');

  assert.equal(left.resolution.outcomeBand, right.resolution.outcomeBand);
  assert.deepEqual(left.resolution.expressions, right.resolution.expressions);
  assert.deepEqual(left.resolution.consequences, right.resolution.consequences);
  assert.equal(left.creature.spliceHistory[0].stabilityAfter, right.creature.spliceHistory[0].stabilityAfter);
});

test('mutation-triggering result materialises persistent follow-up research state', () => {
  const initial = stateFixture();
  let mutationResult = null;
  for (let index = 0; index < 300 && !mutationResult; index += 1) {
    const candidate = execute(structuredClone(initial), initial.testAnimalIds[0], 9, `mutation-search-${index}`);
    if (candidate.resolution.consequences.mutationTriggered) mutationResult = candidate;
  }

  assert.ok(mutationResult, 'expected to find a seeded mutation-triggering outcome');
  assert.equal(mutationResult.creature.mutations.length, 1);
  assert.equal(mutationResult.mutationInstanceId, ids.mutationInstance('h.mutation.9'));
  assert.equal(mutationResult.creature.mutations[0].acquiredFromSpliceAttemptId, ids.spliceAttempt('h.attempt.9'));
});
