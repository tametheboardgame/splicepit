import test from 'node:test';
import assert from 'node:assert/strict';
import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { validateContentCatalog, validateDomainState } from '../src/domain/validation.js';
import { PROTOTYPE_CONTENT_CATALOG } from '../src/content/prototypeCatalog.js';

function cloneCatalog() {
  return structuredClone(PROTOTYPE_CONTENT_CATALOG);
}

function representativeState() {
  const mainCreatureId = ids.creature('creature_main_001');
  const testCreatureId = ids.creature('creature_test_001');
  const spliceAttemptId = ids.spliceAttempt('splice_001');
  const landCapabilityId = ids.capability('arena_land_function');
  const airCapabilityId = ids.capability('arena_air_function');
  const arena = emptyArenaCapabilities();
  arena.land = { functional: true, supportingCapabilityIds: [landCapabilityId] };
  arena.air = { functional: true, supportingCapabilityIds: [airCapabilityId] };

  return {
    creatures: [
      {
        id: mainCreatureId,
        name: 'Mabel',
        baseAnimalId: ids.baseAnimal('rabbit'),
        role: 'main',
        createdAt: '2026-08-17T10:00:00.000Z',
        estimatedAgeDays: 420,
        phenotypeSeed: 'phenotype-seed-001',
        spliceHistory: [
          {
            id: spliceAttemptId,
            sequence: 1,
            attemptedAt: '2026-08-17T10:05:00.000Z',
            sourcePackageIds: [ids.sourcePackage('gecko_regeneration')],
            consumedMaterialLotIds: [ids.materialLot('material_gecko_001')],
            outcomeBand: 'normal_success',
            expressions: [
              {
                sourcePackageId: ids.sourcePackage('gecko_regeneration'),
                capabilityIds: [ids.capability('trait_regenerate')],
                actionIds: [ids.action('trait_regenerate')],
                functional: true,
                notes: 'Representative foundation record only.',
              },
            ],
          },
        ],
        mutations: [],
        injuries: [],
        training: [],
        capabilityIds: [landCapabilityId, airCapabilityId, ids.capability('trait_regenerate')],
        arenaCapabilities: arena,
      },
      {
        id: testCreatureId,
        name: 'Test Rabbit 1',
        baseAnimalId: ids.baseAnimal('rabbit'),
        role: 'test',
        createdAt: '2026-08-17T10:00:00.000Z',
        estimatedAgeDays: null,
        phenotypeSeed: 'test-seed-001',
        spliceHistory: [],
        mutations: [],
        injuries: [],
        training: [],
        capabilityIds: [],
        arenaCapabilities: emptyArenaCapabilities(),
      },
    ],
    mainCreatureIds: [mainCreatureId],
    testAnimalIds: [testCreatureId],
    materialStock: [
      {
        id: ids.materialLot('material_gecko_001'),
        sourcePackageId: ids.sourcePackage('gecko_regeneration'),
        quantity: 2,
        acquiredAt: '2026-08-17T09:30:00.000Z',
        notes: 'Physical stock remains separate from learned knowledge.',
      },
    ],
    researchKnowledge: [
      {
        sourcePackageId: ids.sourcePackage('gecko_regeneration'),
        baseAnimalId: ids.baseAnimal('rabbit'),
        observationCount: 3,
        notes: ['Three observations recorded; no material is created by knowing this.'],
      },
    ],
    progression: {
      activeStateIds: [ids.progressionState('fight')],
      activeQuestIds: [ids.quest('r0_1_slice')],
      completedQuestIds: [],
    },
  };
}

test('prototype content catalog validates with explicit statuses and references', () => {
  assert.deepEqual(validateContentCatalog(PROTOTYPE_CONTENT_CATALOG), []);
});

test('content validation rejects duplicate IDs, broken references and invalid revisions', () => {
  const catalog = cloneCatalog();
  catalog.baseAnimals.push({ ...catalog.baseAnimals[0] });
  catalog.actions[0].requiredCapabilityIds = [ids.capability('missing_capability')];
  catalog.locations[0].revision = 0;

  const issues = validateContentCatalog(catalog);
  assert.ok(issues.some((issue) => issue.code === 'duplicate_id'));
  assert.ok(issues.some((issue) => issue.code === 'broken_reference'));
  assert.ok(issues.some((issue) => issue.code === 'invalid_range'));
});

test('representative Phaser-independent state supports main roster, test stock, material, knowledge and multi-arena capability', () => {
  const state = representativeState();
  assert.equal(state.creatures[0].arenaCapabilities.land.functional, true);
  assert.equal(state.creatures[0].arenaCapabilities.water.functional, false);
  assert.equal(state.creatures[0].arenaCapabilities.air.functional, true);
  assert.equal(state.materialStock[0].quantity, 2);
  assert.equal(state.researchKnowledge[0].observationCount, 3);
  assert.deepEqual(validateDomainState(state, PROTOTYPE_CONTENT_CATALOG), []);
});

test('domain validation rejects negative stock, over-sized main roster and unordered splice history', () => {
  const state = representativeState();
  const extra = state.creatures[0];
  state.creatures.push(
    { ...structuredClone(extra), id: ids.creature('creature_main_002'), name: 'Two', spliceHistory: [] },
    { ...structuredClone(extra), id: ids.creature('creature_main_003'), name: 'Three', spliceHistory: [] },
    { ...structuredClone(extra), id: ids.creature('creature_main_004'), name: 'Four', spliceHistory: [] },
  );
  state.mainCreatureIds.push(ids.creature('creature_main_002'), ids.creature('creature_main_003'), ids.creature('creature_main_004'));
  state.materialStock[0].quantity = -1;
  state.creatures[0].spliceHistory.push({
    ...structuredClone(state.creatures[0].spliceHistory[0]),
    id: ids.spliceAttempt('splice_002'),
    sequence: 1,
  });

  const issues = validateDomainState(state, PROTOTYPE_CONTENT_CATALOG);
  assert.ok(issues.some((issue) => issue.code === 'roster_limit'));
  assert.ok(issues.some((issue) => issue.code === 'invalid_range' && issue.path.includes('quantity')));
  assert.ok(issues.some((issue) => issue.code === 'invalid_order'));
});
