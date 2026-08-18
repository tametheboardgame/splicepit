import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_CATALOG } from '../src/content/contentCatalog.js';
import { ids } from '../src/domain/ids.js';
import { executeLabSplice } from '../src/domain/labExperimentation.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { PROTOTYPE_GENERAL_REAGENT_ID } from '../src/domain/research.js';
import { SeededRandom } from '../src/random/RandomSource.js';
import {
  normaliseDisposableTestRoster,
  restoreMainCommitReserve,
  retireDisposableTestSubject,
} from '../src/systems/labPlaytestSystem.js';

const SOURCE = ids.sourcePackage('gecko_regeneration');
const RABBIT = ids.baseAnimal('rabbit');

function creature(id, role) {
  return {
    id: ids.creature(id),
    name: id,
    baseAnimalId: RABBIT,
    role,
    lifeState: 'living',
    createdAt: '2026-08-18T07:00:00.000Z',
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

function stateFixture(materialQuantity = 3) {
  const disposable = creature('wp04c.test.rabbit', 'test');
  const main = creature('wp04c.main.rabbit', 'main');
  return {
    creatures: [disposable, main],
    mainCreatureIds: [main.id],
    testAnimalIds: [disposable.id],
    materialStock: materialQuantity > 0 ? [{
      id: ids.materialLot('wp04c.lot.gecko'),
      sourcePackageId: SOURCE,
      quantity: materialQuantity,
      quality: 0.82,
      acquisitionChannel: 'prototype',
      acquiredAt: '2026-08-18T07:00:00.000Z',
      notes: 'WP0.4C disposable-flow fixture.',
    }] : [],
    reagentStock: [{ reagentId: PROTOTYPE_GENERAL_REAGENT_ID, quantity: 8, notes: 'WP0.4C fixture reagent.' }],
    researchKnowledge: [],
    experimentHistory: [],
    progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
  };
}

function execute(state, subjectCreatureId, ordinal, seed) {
  return executeLabSplice(state, CONTENT_CATALOG, {
    subjectCreatureId,
    sourcePackageId: SOURCE,
    attemptId: ids.spliceAttempt(`wp04c.attempt.${ordinal}`),
    observationId: ids.experimentObservation(`wp04c.observation.${ordinal}`),
    mutationInstanceId: ids.mutationInstance(`wp04c.mutation.${ordinal}`),
    attemptedAt: `2026-08-18T07:${String(ordinal).padStart(2, '0')}:00.000Z`,
  }, new SeededRandom(seed));
}

function remainingMaterial(state) {
  return state.materialStock
    .filter((lot) => lot.sourcePackageId === SOURCE)
    .reduce((total, lot) => total + lot.quantity, 0);
}

test('a disposable subject is retired after one experiment and a fresh clean animal replaces it', () => {
  const initial = stateFixture();
  const originalId = initial.testAnimalIds[0];
  const result = execute(initial, originalId, 1, 'wp04c-disposable');
  const retired = retireDisposableTestSubject(result.state, originalId, '2026-08-18T07:10:00.000Z');

  const historical = retired.creatures.find((candidate) => candidate.id === originalId);
  const activeRabbit = retired.testAnimalIds
    .map((id) => retired.creatures.find((candidate) => candidate.id === id))
    .find((candidate) => candidate?.baseAnimalId === RABBIT && candidate.lifeState === 'living' && candidate.spliceHistory.length === 0);

  assert.ok(historical);
  assert.equal(historical.spliceHistory.length, 1);
  assert.equal(retired.testAnimalIds.includes(originalId), false);
  assert.ok(activeRabbit);
  assert.notEqual(activeRabbit.id, originalId);
  assert.equal(activeRabbit.spliceHistory.length, 0);
});

test('old saves with an already-used disposable subject are normalised to fresh active stock', () => {
  const initial = stateFixture();
  const originalId = initial.testAnimalIds[0];
  const result = execute(initial, originalId, 2, 'wp04c-old-save');
  const normalised = normaliseDisposableTestRoster(result.state, '2026-08-18T07:11:00.000Z');

  assert.equal(normalised.testAnimalIds.includes(originalId), false);
  assert.ok(normalised.testAnimalIds.some((id) => {
    const candidate = normalised.creatures.find((creatureValue) => creatureValue.id === id);
    return candidate?.baseAnimalId === RABBIT && candidate.spliceHistory.length === 0 && candidate.lifeState === 'living';
  }));
});

test('a depleted pre-fix save receives one main commit reserve and never regenerates it after a main attempt', () => {
  const initial = stateFixture(1);
  const testResult = execute(initial, initial.testAnimalIds[0], 3, 'wp04c-spend-last-test');
  assert.equal(remainingMaterial(testResult.state), 0);
  assert.equal(testResult.observation.subjectRole, 'test');

  const recovered = restoreMainCommitReserve(testResult.state, '2026-08-18T07:12:00.000Z');
  assert.equal(remainingMaterial(recovered), 1);

  const recoveredAgain = restoreMainCommitReserve(recovered, '2026-08-18T07:13:00.000Z');
  assert.equal(remainingMaterial(recoveredAgain), 1, 'recovery bridge must not duplicate the reserve');

  const mainResult = execute(recoveredAgain, initial.mainCreatureIds[0], 4, 'wp04c-main-commit');
  assert.equal(mainResult.observation.subjectRole, 'main');
  assert.equal(remainingMaterial(mainResult.state), 0);

  const afterMain = restoreMainCommitReserve(mainResult.state, '2026-08-18T07:14:00.000Z');
  assert.equal(remainingMaterial(afterMain), 0, 'a real main attempt permanently closes the recovery bridge');
});
