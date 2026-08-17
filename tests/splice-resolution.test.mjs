import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSpliceOutcomeDistribution,
  calculateSpliceRiskContext,
  resolveSplice,
} from '../src/domain/spliceResolution.js';
import { SPLICE_OUTCOME_BANDS } from '../src/domain/model.js';
import { SeededRandom } from '../src/random/RandomSource.js';

const requirements = { allOfTags: [], anyOfTags: [], noneOfTags: [] };
const source = (id, level = 'moderate', expressionCount = 3) => ({
  id,
  status: 'canon',
  revision: 1,
  name: id,
  description: id,
  sourceSpecies: 'Fixture',
  biologicalClassTags: ['anatomical'],
  expressions: Array.from({ length: expressionCount }, (_, index) => ({
    id: `${id}.expression.${index}`,
    name: `Expression ${index}`,
    description: 'Fixture expression.',
    biologicalClass: 'anatomical',
    requirements,
    compatibilityTags: [],
    createsBiologicalTags: [],
    phenotypeHooks: [],
    capabilityHooks: [],
  })),
  requirements,
  compatibilityTags: [],
  complexity: {
    integration: level,
    structuralDemand: level,
    metabolicDemand: level,
    regulatoryVolatility: level,
  },
  phenotypeHooks: [],
  capabilityHooks: [],
  potentialCapabilityIds: [],
  potentialActionIds: [],
});

const compatibility = (incomingSourceIds, netScore = 0, failedRequirements = []) => ({
  baseAnimalId: 'fixture_base',
  incomingSourceIds,
  existingSourceIds: [],
  subjectTags: [],
  incomingTags: [],
  requirements: failedRequirements,
  signals: [],
  netScore,
  profile: 'mixed',
});

const normalInput = () => {
  const incoming = source('fixture_source');
  return {
    incomingSources: [incoming],
    compatibility: compatibility([incoming.id]),
    currentStability: 0.9,
    accumulatedComplexity: 0,
    facilitySafety: 0.8,
    facilityPrecision: 0.7,
    materialQuality: 0.85,
  };
};

const extremeInput = () => {
  const incoming = source('extreme_source', 'extreme', 4);
  return {
    incomingSources: [incoming],
    compatibility: compatibility([incoming.id], -8, [{
      scope: 'source',
      sourcePackageId: incoming.id,
      satisfied: false,
      missingAllOfTags: ['fixture.missing'],
      missingAnyOf: false,
      forbiddenTagsPresent: [],
    }]),
    currentStability: 0.05,
    accumulatedComplexity: 1000,
    facilitySafety: 0.05,
    facilityPrecision: 0.2,
    materialQuality: 0.1,
  };
};

test('distribution contains all eight locked bands and only enables catastrophe at extreme risk', () => {
  const ordinary = buildSpliceOutcomeDistribution(normalInput());
  assert.deepEqual(ordinary.map((entry) => entry.band), SPLICE_OUTCOME_BANDS);
  assert.ok(Math.abs(ordinary.reduce((sum, entry) => sum + entry.probability, 0) - 1) < 1e-12);
  assert.equal(ordinary.find((entry) => entry.band === 'catastrophic_result')?.probability, 0);

  const extreme = buildSpliceOutcomeDistribution(extremeInput());
  assert.ok((extreme.find((entry) => entry.band === 'catastrophic_result')?.probability ?? 0) > 0);
  assert.equal(calculateSpliceRiskContext(extremeInput()).catastrophicEligible, true);
});

test('same nominal recipe across seeds produces several legitimate outcomes', () => {
  const input = normalInput();
  const bands = new Set();
  for (let index = 0; index < 250; index += 1) {
    bands.add(resolveSplice(input, new SeededRandom(`variance-${index}`)).outcomeBand);
  }
  assert.ok(bands.size >= 5, `Expected at least five outcome bands, got ${[...bands].join(', ')}`);
});

test('replaying the same seed reproduces band, expression and stability exactly', () => {
  const input = normalInput();
  const left = resolveSplice(input, new SeededRandom('replay-fixture'));
  const right = resolveSplice(input, new SeededRandom('replay-fixture'));
  assert.deepEqual(left, right);
  assert.ok(left.randomAfter.calls > left.randomBefore.calls);
});

test('normal successes retain independent expression selection and material strength variance', () => {
  const input = normalInput();
  const normalResults = [];
  for (let index = 0; index < 400 && normalResults.length < 2; index += 1) {
    const result = resolveSplice(input, new SeededRandom(`normal-${index}`));
    if (result.outcomeBand === 'normal_success') normalResults.push(result);
  }
  assert.equal(normalResults.length, 2);
  const [left, right] = normalResults;
  assert.ok(left.expressions.some((expression) => expression.expressed));
  assert.ok(right.expressions.some((expression) => expression.expressed));
  assert.notDeepEqual(
    left.expressions.map(({ expressed, magnitude, reliability }) => ({ expressed, magnitude, reliability })),
    right.expressions.map(({ expressed, magnitude, reliability }) => ({ expressed, magnitude, reliability })),
  );
});

test('accumulated complexity and low stability increase danger without imposing a gene-count ceiling', () => {
  const stable = normalInput();
  const burdened = { ...stable, currentStability: 0.25, accumulatedComplexity: 50 };
  const stableRisk = calculateSpliceRiskContext(stable);
  const burdenedRisk = calculateSpliceRiskContext(burdened);
  assert.ok(burdenedRisk.riskPressure > stableRisk.riskPressure);
  assert.doesNotThrow(() => resolveSplice(
    { ...stable, currentStability: 0.1, accumulatedComplexity: 1_000_000 },
    new SeededRandom('no-ceiling'),
  ));
});

test('death can only occur inside an eligible catastrophic result', () => {
  for (let index = 0; index < 500; index += 1) {
    const result = resolveSplice(normalInput(), new SeededRandom(`safe-${index}`));
    assert.equal(result.consequences.death, false);
    assert.notEqual(result.outcomeBand, 'catastrophic_result');
  }

  let sawCatastrophe = false;
  for (let index = 0; index < 1500; index += 1) {
    const result = resolveSplice(extremeInput(), new SeededRandom(`danger-${index}`));
    if (result.outcomeBand === 'catastrophic_result') {
      sawCatastrophe = true;
      if (result.consequences.death) {
        assert.equal(result.risk.catastrophicEligible, true);
        assert.equal(result.consequences.injurySeverity, 'lethal');
      }
    } else {
      assert.equal(result.consequences.death, false);
    }
  }
  assert.equal(sawCatastrophe, true);
});
