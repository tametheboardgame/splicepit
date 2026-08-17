import assert from 'node:assert/strict';
import test from 'node:test';

import { BIOLOGY_CONTENT_CATALOG } from '../src/content/biologyCatalog.js';
import { ids } from '../src/domain/ids.js';
import { composePhenotype, OPENING_AUTHORED_BASE_BODIES } from '../src/domain/phenotype.js';

function expression(source, id, hooks, strength = 0.85) {
  return {
    sourcePackageId: ids.sourcePackage(source),
    expressionId: id,
    expressed: true,
    magnitude: strength,
    completeness: strength,
    efficiency: strength,
    reliability: strength,
    stability: strength,
    biologicalTags: [],
    phenotypeHooks: hooks,
    capabilityHooks: [],
    capabilityIds: [],
    actionIds: [],
    functional: true,
    notes: 'phenotype test fixture',
  };
}

function attempt(sequence, source, expressions) {
  return {
    id: ids.spliceAttempt(`phenotype-attempt-${sequence}`),
    sequence,
    attemptedAt: `2026-08-17T15:${String(sequence).padStart(2, '0')}:00.000Z`,
    sourcePackageIds: [ids.sourcePackage(source)],
    consumedMaterialLotIds: [],
    outcomeBand: 'normal_success',
    stabilityBefore: 0.9,
    stabilityAfter: 0.86,
    complexityAdded: 1,
    consequences: {
      mutationTriggered: false,
      permanentDamage: false,
      death: false,
      injurySeverity: 'none',
    },
    expressions,
  };
}

function creature(base, seed = 'phenotype-seed-alpha', extraAttempts = []) {
  return {
    id: ids.creature(`phenotype-${base}-${seed.replaceAll('_', '-').replaceAll('.', '-')}`),
    name: `${base} phenotype fixture`,
    baseAnimalId: ids.baseAnimal(base),
    role: 'main',
    lifeState: 'living',
    createdAt: '2026-08-17T15:00:00.000Z',
    estimatedAgeDays: 400,
    phenotypeSeed: seed,
    spliceHistory: [
      attempt(1, 'rhinoceros_impact_suite', [
        expression('rhinoceros_impact_suite', 'horn_growth', ['head.horn', 'head.heavy_brow'], 0.78),
      ]),
      attempt(2, 'pangolin_dermal_plate_suite', [
        expression('pangolin_dermal_plate_suite', 'dermal_plates', ['surface.plates'], 0.83),
      ]),
      attempt(3, 'chameleon_visual_adaptation_suite', [
        expression('chameleon_visual_adaptation_suite', 'chromatophore_colour_change', ['surface.dynamic_colour', 'surface.pattern_zones'], 0.74),
      ]),
      attempt(4, 'elephant_growth_mass_regulation', [
        expression('elephant_growth_mass_regulation', 'growth_amplification', ['proportion.scale_up', 'proportion.thick_support'], 0.68),
      ]),
      ...extraAttempts,
    ],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: {
      land: { functional: true, supportingCapabilityIds: [] },
      water: { functional: false, supportingCapabilityIds: [] },
      air: { functional: false, supportingCapabilityIds: [] },
    },
  };
}

test('opening phenotype bodies author distinct Rabbit, Goat and Pig skeletons', () => {
  assert.deepEqual(
    OPENING_AUTHORED_BASE_BODIES.map((body) => body.baseAnimalId),
    ['rabbit', 'goat', 'pig'],
  );
  assert.equal(new Set(OPENING_AUTHORED_BASE_BODIES.map((body) => body.skeletonId)).size, 3);
});

test('representative Rabbit/Goat/Pig multi-splice matrix stays visually distinct', () => {
  const phenotypes = ['rabbit', 'goat', 'pig'].map((base) => composePhenotype(creature(base), BIOLOGY_CONTENT_CATALOG));

  assert.equal(new Set(phenotypes.map((entry) => entry.skeletonId)).size, 3);
  assert.equal(new Set(phenotypes.map((entry) => JSON.stringify(entry.proportions))).size, 3);
  for (const phenotype of phenotypes) {
    assert.ok(phenotype.components.some((entry) => entry.kind === 'horn_array'));
    assert.ok(phenotype.components.some((entry) => entry.kind === 'heavy_brow'));
    assert.ok(phenotype.surfaceLayers.some((entry) => entry.kind === 'dermal_plates'));
    assert.ok(phenotype.surfaceLayers.some((entry) => entry.kind === 'dynamic_colour'));
    assert.ok(phenotype.proportions.scale > 0.9);
  }
});

test('phenotype is reproduced exactly after save/load JSON round-trip', () => {
  const beforeCreature = creature('goat', 'stable-save-seed');
  const before = composePhenotype(beforeCreature, BIOLOGY_CONTENT_CATALOG);
  const loadedCreature = JSON.parse(JSON.stringify(beforeCreature));
  const after = composePhenotype(loadedCreature, BIOLOGY_CONTENT_CATALOG);

  assert.deepEqual(after, before);
  assert.equal(after.signature, before.signature);
});

test('same base and splice history can remain individually distinct through phenotype seed', () => {
  const first = composePhenotype(creature('pig', 'individual-seed-one'), BIOLOGY_CONTENT_CATALOG);
  const second = composePhenotype(creature('pig', 'individual-seed-two'), BIOLOGY_CONTENT_CATALOG);

  assert.equal(first.skeletonId, second.skeletonId);
  assert.notDeepEqual(first.proportions, second.proportions);
  assert.notEqual(first.signature, second.signature);
});

test('overlapping horn expressions compose into one modular horn slot', () => {
  const extra = attempt(5, 'rhinoceros_impact_suite', [
    expression('rhinoceros_impact_suite', 'horn_pattern_regulation', ['head.horn_pattern_variable'], 0.92),
  ]);
  const phenotype = composePhenotype(creature('goat', 'horn-overlap-seed', [extra]), BIOLOGY_CONTENT_CATALOG);
  const hornComponents = phenotype.components.filter((entry) => entry.slot === 'head.horns');

  assert.equal(hornComponents.length, 1);
  assert.equal(hornComponents[0].kind, 'horn_array');
  assert.ok(hornComponents[0].sourceHooks.includes('anatomy.horns'));
  assert.ok(hornComponents[0].sourceHooks.includes('head.horn'));
  assert.ok(hornComponents[0].sourceHooks.includes('head.horn_pattern_variable'));
});

test('unsupported visible expressions fall back safely without deleting biology', () => {
  const unsupported = attempt(5, 'gecko_regeneration', [
    expression('gecko_regeneration', 'future_visible_expression', ['future.unsupported.visible_hook'], 0.9),
  ]);
  const subject = creature('rabbit', 'fallback-seed', [unsupported]);
  const phenotype = composePhenotype(subject, BIOLOGY_CONTENT_CATALOG);

  assert.ok(phenotype.fallbacks.some((entry) => (
    entry.hook === 'future.unsupported.visible_hook' &&
    entry.reason === 'unsupported_hook' &&
    entry.retainedAs === 'diagnostic_only'
  )));
  assert.ok(subject.spliceHistory.at(-1).expressions[0].phenotypeHooks.includes('future.unsupported.visible_hook'));
});
