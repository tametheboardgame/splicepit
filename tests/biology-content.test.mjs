import test from 'node:test';
import assert from 'node:assert/strict';
import { BIOLOGICAL_CLASSES } from '../src/domain/model.js';
import { validateContentCatalog } from '../src/domain/validation.js';
import {
  BIOLOGY_CONTENT_CATALOG,
  CANONICAL_BASE_ANIMALS,
  CANONICAL_SOURCE_PACKAGES,
  OPENING_BASE_ANIMAL_IDS,
  OPENING_SOURCE_PACKAGE_IDS,
} from '../src/content/biologyCatalog.js';
import { CONTENT_CATALOG } from '../src/content/contentCatalog.js';

test('WP0.3A locks the exact six-class biological taxonomy and validates canonical biology', () => {
  assert.deepEqual(BIOLOGICAL_CLASSES, [
    'anatomical',
    'physiological',
    'sensory',
    'biochemical',
    'behavioural_neurological',
    'regulatory',
  ]);
  assert.deepEqual(validateContentCatalog(BIOLOGY_CONTENT_CATALOG), []);
});

test('Rabbit, Goat and Pig are canonical biological base definitions', () => {
  assert.equal(CANONICAL_BASE_ANIMALS.length, 3);
  assert.deepEqual(CANONICAL_BASE_ANIMALS.map((animal) => animal.id), [...OPENING_BASE_ANIMAL_IDS]);
  for (const animal of CANONICAL_BASE_ANIMALS) {
    assert.equal(animal.status, 'canon');
    assert.ok(animal.species.length > 0);
    assert.ok(animal.bodyPlanTags.length > 0);
    assert.ok(animal.biologicalTags.length > 0);
    assert.ok(animal.baselinePhenotypeHooks.length > 0);
    assert.ok(animal.baselineCapabilityHooks.length > 0);
  }
});

test('all ten opening source packages are canonical multi-expression bundles', () => {
  assert.equal(CANONICAL_SOURCE_PACKAGES.length, 10);
  assert.deepEqual(CANONICAL_SOURCE_PACKAGES.map((source) => source.id), [...OPENING_SOURCE_PACKAGE_IDS]);

  for (const source of CANONICAL_SOURCE_PACKAGES) {
    assert.equal(source.status, 'canon');
    assert.ok(source.expressions.length >= 2);
    assert.ok(source.compatibilityTags.length > 0);
    assert.ok(source.biologicalClassTags.length > 0);
    const representedClasses = new Set(source.expressions.map((expression) => expression.biologicalClass));
    for (const biologicalClass of source.biologicalClassTags) {
      assert.equal(representedClasses.has(biologicalClass), true, `${source.id} is missing ${biologicalClass} expression coverage`);
    }
  }
});

test('one source can describe several plausible results without a base-pairing table', () => {
  const lion = CANONICAL_SOURCE_PACKAGES.find((source) => source.id === 'lion_predatory_suite');
  assert.ok(lion);
  assert.deepEqual(
    new Set(lion.expressions.map((expression) => expression.biologicalClass)),
    new Set(['behavioural_neurological', 'anatomical', 'physiological']),
  );
  assert.ok(lion.expressions.some((expression) => expression.id === 'jaw_dentition'));
  assert.ok(lion.expressions.some((expression) => expression.id === 'claw_development'));
  assert.ok(lion.expressions.some((expression) => expression.id === 'burst_power'));
  assert.equal('baseAnimalId' in lion, false);
  assert.equal(lion.expressions.some((expression) => 'baseAnimalId' in expression), false);
});

test('combined catalogue promotes canonical Rabbit and Gecko while retaining R0.1 compatibility content', () => {
  assert.equal(CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === 'rabbit')?.status, 'canon');
  assert.equal(CONTENT_CATALOG.sourcePackages.find((source) => source.id === 'gecko_regeneration')?.status, 'canon');
  assert.equal(CONTENT_CATALOG.sourcePackages.find((source) => source.id === 'boar_muscle')?.status, 'prototype');
  assert.deepEqual(validateContentCatalog(CONTENT_CATALOG), []);
});

test('biological validation rejects invalid taxonomy coverage and duplicate expression IDs', () => {
  const catalog = structuredClone(BIOLOGY_CONTENT_CATALOG);
  const source = catalog.sourcePackages[0];
  source.expressions[1].id = source.expressions[0].id;
  source.biologicalClassTags.push('regulatory');

  const issues = validateContentCatalog(catalog);
  assert.ok(issues.some((issue) => issue.code === 'duplicate_id' && issue.path.includes('expressions')));
  assert.ok(issues.some((issue) => issue.code === 'invalid_schema' && issue.message.includes('without any expression')));
});
