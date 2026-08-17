import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateCompatibility,
  projectCompatibilityInformation,
  validateAuthoredCompatibilityInteractions,
} from '../src/domain/compatibility.js';
import {
  CANONICAL_BASE_ANIMALS,
  CANONICAL_SOURCE_PACKAGES,
} from '../src/content/biologyCatalog.js';
import { PROTOTYPE_AUTHORED_COMPATIBILITY_INTERACTIONS } from '../src/content/compatibilityInteractions.js';

const base = (id) => {
  const value = CANONICAL_BASE_ANIMALS.find((entry) => entry.id === id);
  assert.ok(value);
  return value;
};

const source = (id) => {
  const value = CANONICAL_SOURCE_PACKAGES.find((entry) => entry.id === id);
  assert.ok(value);
  return value;
};

const hasRule = (assessment, id) => assessment.signals.some((signal) => signal.ruleId === id);

test('systemic structural context creates synergy and conflict across canonical base animals', () => {
  const elephant = source('elephant_growth_mass_regulation');
  const goat = evaluateCompatibility({ baseAnimal: base('goat'), incomingSources: [elephant] });
  const rabbit = evaluateCompatibility({ baseAnimal: base('rabbit'), incomingSources: [elephant] });
  const pig = evaluateCompatibility({ baseAnimal: base('pig'), incomingSources: [elephant] });

  assert.equal(hasRule(goat, 'system.structural_demand_supported'), true);
  assert.equal(hasRule(rabbit, 'system.structural_demand_light_frame'), true);
  assert.equal(hasRule(pig, 'system.structural_demand_supported'), true);
  assert.ok(goat.netScore > rabbit.netScore);
  assert.ok(pig.netScore > rabbit.netScore);

  const observable = projectCompatibilityInformation(goat, 'observable');
  assert.ok(observable.explanations.some((text) => text.includes('structural support')));
});

test('multi-source attempts detect systemic surface competition without a pair table', () => {
  const assessment = evaluateCompatibility({
    baseAnimal: base('rabbit'),
    incomingSources: [source('toad_toxin_gland_suite'), source('pangolin_dermal_plate_suite')],
  });

  assert.equal(hasRule(assessment, 'system.surface_space_competition'), true);
  assert.ok(assessment.signals.some((signal) => signal.kind === 'conflict'));
});

test('existing expressed biology changes later compatibility context', () => {
  const eel = source('electric_eel_electrocyte_suite');
  const plainRabbit = evaluateCompatibility({ baseAnimal: base('rabbit'), incomingSources: [eel] });
  const repairedRabbit = evaluateCompatibility({
    baseAnimal: base('rabbit'),
    incomingSources: [eel],
    existingBiologicalTags: ['healing.rapid'],
  });
  const pig = evaluateCompatibility({ baseAnimal: base('pig'), incomingSources: [eel] });

  assert.equal(hasRule(repairedRabbit, 'system.repair_mitigates_self_harm'), true);
  assert.equal(hasRule(pig, 'system.metabolic_load_stacking'), true);
  assert.ok(repairedRabbit.netScore > plainRabbit.netScore);
  assert.ok(pig.netScore < plainRabbit.netScore);
});

test('redundancy and regulatory interactions are represented separately', () => {
  const redundant = evaluateCompatibility({
    baseAnimal: base('goat'),
    incomingSources: [source('pangolin_dermal_plate_suite')],
    existingBiologicalTags: ['surface.keratin'],
  });
  const regulatory = evaluateCompatibility({
    baseAnimal: base('rabbit'),
    incomingSources: [source('gecko_regeneration')],
    existingBiologicalTags: ['regulation.growth'],
  });

  assert.ok(redundant.signals.some((signal) => signal.kind === 'redundancy'));
  assert.ok(regulatory.signals.some((signal) => signal.kind === 'regulatory'));
});

test('authored interactions can augment or override systemic rules', () => {
  const rhino = source('rhinoceros_impact_suite');
  const augmented = evaluateCompatibility({
    baseAnimal: base('goat'),
    incomingSources: [rhino],
    authoredInteractions: PROTOTYPE_AUTHORED_COMPATIBILITY_INTERACTIONS,
  });

  assert.ok(augmented.signals.some((signal) => signal.id === 'authored.prototype.goat_rhino_horn_bed'));
  assert.equal(hasRule(augmented, 'system.structural_demand_supported'), true);

  const override = {
    id: 'test.override_goat_rhino',
    status: 'prototype',
    kind: 'synergy',
    scoreDelta: 5,
    visibility: 'diagnostic',
    baseAnimalId: base('goat').id,
    incomingSourceIds: [rhino.id],
    suppressesRuleIds: ['system.structural_demand_supported'],
    explanation: 'Fixture override.',
  };
  assert.deepEqual(validateAuthoredCompatibilityInteractions([override]), []);

  const overridden = evaluateCompatibility({
    baseAnimal: base('goat'),
    incomingSources: [rhino],
    authoredInteractions: [override],
  });
  assert.equal(hasRule(overridden, 'system.structural_demand_supported'), false);
  assert.ok(overridden.signals.some((signal) => signal.id === 'authored.test.override_goat_rhino'));
});

test('observable and diagnostic views reveal different information without changing biology', () => {
  const assessment = evaluateCompatibility({
    baseAnimal: base('pig'),
    incomingSources: [source('electric_eel_electrocyte_suite')],
  });
  const originalScore = assessment.netScore;
  const observable = projectCompatibilityInformation(assessment, 'observable');
  const diagnostic = projectCompatibilityInformation(assessment, 'diagnostic');

  assert.equal(assessment.netScore, originalScore);
  assert.equal(observable.incomplete, true);
  assert.equal(observable.signals.some((signal) => signal.ruleId === 'system.metabolic_load_stacking'), false);
  assert.equal(diagnostic.signals.some((signal) => signal.ruleId === 'system.metabolic_load_stacking'), true);
  assert.equal(diagnostic.displayScore, assessment.netScore);
  assert.notEqual(observable.displayScore, diagnostic.displayScore);
});
