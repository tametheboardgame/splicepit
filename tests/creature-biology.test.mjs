import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySpliceResolution,
  buildCreatureSpliceResolutionInput,
  deriveCreatureBiology,
  evaluateCreatureCompatibility,
  isResolvedExpressionFunctional,
} from '../src/domain/creatureBiology.js';
import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { resolveSplice } from '../src/domain/spliceResolution.js';
import { createSaveEnvelope, decodeSave, domainStateFromSave } from '../src/persistence/saveSchema.js';
import { SeededRandom } from '../src/random/RandomSource.js';

const requirements = { allOfTags: [], anyOfTags: [], noneOfTags: [] };
const complexity = {
  integration: 'moderate',
  structuralDemand: 'moderate',
  metabolicDemand: 'moderate',
  regulatoryVolatility: 'moderate',
};

const baseAnimal = {
  id: ids.baseAnimal('fixture_rabbit'),
  status: 'prototype',
  revision: 1,
  name: 'Fixture Rabbit',
  description: 'WP0.3E cumulative biology fixture.',
  species: 'Rabbit',
  bodyPlanTags: ['body.mammal', 'body.quadruped', 'body.limbs'],
  biologicalTags: ['frame.light'],
  baselinePhenotypeHooks: ['base.rabbit'],
  baselineCapabilityHooks: ['movement.land'],
};

function source(id, expressionId, capabilityHook, biologicalTag) {
  return {
    id: ids.sourcePackage(id),
    status: 'prototype',
    revision: 1,
    name: id,
    description: id,
    sourceSpecies: 'Fixture',
    biologicalClassTags: ['anatomical'],
    expressions: [{
      id: expressionId,
      name: expressionId,
      description: expressionId,
      biologicalClass: 'anatomical',
      requirements,
      compatibilityTags: [],
      createsBiologicalTags: [biologicalTag],
      phenotypeHooks: [`phenotype.${expressionId}`],
      capabilityHooks: [capabilityHook],
    }],
    requirements,
    compatibilityTags: [`source.${id}`],
    complexity,
    phenotypeHooks: [],
    capabilityHooks: [],
    potentialCapabilityIds: [],
    potentialActionIds: [],
  };
}

const wingSource = source('fixture_wings', 'wing_growth', 'movement.flight', 'anatomy.wings');
const swimSource = source('fixture_swim', 'aquatic_propulsion', 'movement.swim', 'anatomy.aquatic_propulsion');
const probeSource = source('fixture_probe', 'probe_expression', 'sense.probe', 'biology.probe');

const catalog = {
  baseAnimals: [baseAnimal],
  sourcePackages: [wingSource, swimSource, probeSource],
  mutations: [],
  capabilities: [],
  actions: [],
  items: [],
  locations: [],
  quests: [],
  progressionStates: [],
};

function creatureFixture(overrides = {}) {
  const arenaCapabilities = emptyArenaCapabilities();
  arenaCapabilities.land = { functional: true, supportingCapabilityIds: [ids.capability('movement.land')] };
  return {
    id: ids.creature('fixture_creature'),
    name: 'Mabel',
    baseAnimalId: baseAnimal.id,
    role: 'main',
    lifeState: 'living',
    createdAt: '2026-08-17T12:00:00.000Z',
    estimatedAgeDays: 500,
    phenotypeSeed: 'fixture-phenotype',
    spliceHistory: [],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [ids.capability('movement.land')],
    arenaCapabilities,
    ...overrides,
  };
}

function resolveFunctional(creature, incomingSource, seedPrefix) {
  const input = buildCreatureSpliceResolutionInput({
    creature,
    catalog,
    incomingSources: [incomingSource],
    facilitySafety: 0.9,
    facilityPrecision: 0.9,
    materialQuality: 0.9,
  });
  for (let index = 0; index < 1000; index += 1) {
    const result = resolveSplice(input, new SeededRandom(`${seedPrefix}-${index}`));
    if (result.expressions.some((expression) => isResolvedExpressionFunctional(expression))) return result;
  }
  throw new Error(`Could not find a functional seeded result for ${incomingSource.id}.`);
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
    questStage: 'fixture',
    seenIntro: true,
  };
}

function domainFor(creature) {
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

test('sequential splices accumulate irreversible history and independent functional arena capability', () => {
  const original = creatureFixture();
  const flightResult = resolveFunctional(original, wingSource, 'flight');
  const flying = applySpliceResolution({
    creature: original,
    catalog,
    incomingSources: [wingSource],
    resolution: flightResult,
    attemptId: ids.spliceAttempt('fixture_splice_1'),
    attemptedAt: '2026-08-17T12:10:00.000Z',
  });
  const flightBiology = deriveCreatureBiology(flying, catalog);
  assert.equal(flying.spliceHistory.length, 1);
  assert.equal(flightBiology.arenaCapabilities.land.functional, true);
  assert.equal(flightBiology.arenaCapabilities.air.functional, true);
  assert.equal(flightBiology.arenaCapabilities.water.functional, false);
  assert.ok(flightBiology.capabilityIds.includes(ids.capability('movement.flight')));

  const swimResult = resolveFunctional(flying, swimSource, 'swim');
  const amphibiousFlier = applySpliceResolution({
    creature: flying,
    catalog,
    incomingSources: [swimSource],
    resolution: swimResult,
    attemptId: ids.spliceAttempt('fixture_splice_2'),
    attemptedAt: '2026-08-17T12:20:00.000Z',
  });
  const biology = deriveCreatureBiology(amphibiousFlier, catalog);
  assert.equal(amphibiousFlier.spliceHistory.length, 2);
  assert.deepEqual(amphibiousFlier.spliceHistory.map((attempt) => attempt.sequence), [1, 2]);
  assert.equal(biology.arenaCapabilities.land.functional, true);
  assert.equal(biology.arenaCapabilities.water.functional, true);
  assert.equal(biology.arenaCapabilities.air.functional, true);
  assert.ok(biology.accumulatedComplexity > flightBiology.accumulatedComplexity);
  assert.equal(amphibiousFlier.estimatedAgeDays, 500);
});

test('attempted or visibly expressed biology grants no capability when the resolved expression is non-functional', () => {
  const creature = creatureFixture();
  const context = buildCreatureSpliceResolutionInput({
    creature,
    catalog,
    incomingSources: [wingSource],
    facilitySafety: 0.8,
    facilityPrecision: 0.8,
    materialQuality: 0.8,
  });
  const weakResolution = {
    outcomeBand: 'partial_expression',
    distribution: [],
    risk: {
      incomingComplexity: 0.5,
      incomingComplexityPressure: 0.2,
      accumulatedComplexityPressure: 0,
      compatibilityFactor: 0,
      requirementFailureRatio: 0,
      instabilityPressure: 0,
      riskPressure: 0.2,
      catastrophicEligible: false,
    },
    expressions: [{
      sourcePackageId: wingSource.id,
      expressionId: 'wing_growth',
      expressed: true,
      selectionChance: 1,
      magnitude: 0.8,
      completeness: 0.8,
      efficiency: 0.8,
      reliability: 0.1,
      stability: 0.8,
    }],
    stabilityBefore: context.currentStability,
    stabilityDelta: -0.05,
    stabilityAfter: context.currentStability - 0.05,
    consequences: { mutationTriggered: false, permanentDamage: false, death: false, injurySeverity: 'none' },
    randomBefore: { seed: 'fixture', state: 1, calls: 0 },
    randomAfter: { seed: 'fixture', state: 2, calls: 1 },
  };
  const result = applySpliceResolution({
    creature,
    catalog,
    incomingSources: [wingSource],
    resolution: weakResolution,
    attemptId: ids.spliceAttempt('fixture_weak_wings'),
    attemptedAt: '2026-08-17T12:10:00.000Z',
  });
  const biology = deriveCreatureBiology(result, catalog);
  assert.equal(result.spliceHistory[0].expressions[0].expressed, true);
  assert.equal(result.spliceHistory[0].expressions[0].functional, false);
  assert.equal(result.spliceHistory[0].expressions[0].phenotypeHooks.includes('phenotype.wing_growth'), true);
  assert.equal(biology.capabilityIds.includes(ids.capability('movement.flight')), false);
  assert.equal(biology.arenaCapabilities.air.functional, false);
});

test('active injury can suppress a real capability without deleting the biological history', () => {
  const original = creatureFixture();
  const result = resolveFunctional(original, wingSource, 'injury-flight');
  const flying = applySpliceResolution({
    creature: original,
    catalog,
    incomingSources: [wingSource],
    resolution: result,
    attemptId: ids.spliceAttempt('fixture_injury_splice'),
    attemptedAt: '2026-08-17T12:10:00.000Z',
  });
  const injured = {
    ...flying,
    injuries: [...flying.injuries, {
      id: 'fixture_wing_injury',
      recordedAt: '2026-08-17T12:30:00.000Z',
      status: 'active',
      notes: 'Wing function temporarily lost.',
      affectedCapabilityIds: [ids.capability('movement.flight')],
      affectedExpressionIds: ['wing_growth'],
    }],
  };
  const injuredBiology = deriveCreatureBiology(injured, catalog);
  assert.equal(injuredBiology.arenaCapabilities.air.functional, false);
  assert.equal(injured.spliceHistory[0].expressions[0].expressed, true);

  const healed = {
    ...injured,
    injuries: injured.injuries.map((entry) => entry.id === 'fixture_wing_injury' ? { ...entry, status: 'healed' } : entry),
  };
  assert.equal(deriveCreatureBiology(healed, catalog).arenaCapabilities.air.functional, true);
});

test('later compatibility sees prior expression, mutation and injury context rather than source labels alone', () => {
  const original = creatureFixture();
  const result = resolveFunctional(original, wingSource, 'context-flight');
  const flying = applySpliceResolution({
    creature: original,
    catalog,
    incomingSources: [wingSource],
    resolution: result,
    attemptId: ids.spliceAttempt('fixture_context_splice'),
    attemptedAt: '2026-08-17T12:10:00.000Z',
  });
  const contextual = {
    ...flying,
    mutations: [{
      id: ids.mutationInstance('fixture_mutation_instance'),
      definitionId: ids.mutationDefinition('fixture_mutation'),
      acquiredFromSpliceAttemptId: ids.spliceAttempt('fixture_context_splice'),
      recordedAt: '2026-08-17T12:20:00.000Z',
    }],
    injuries: [{
      id: 'fixture_permanent_injury',
      recordedAt: '2026-08-17T12:25:00.000Z',
      status: 'permanent',
      notes: 'Fixture injury.',
      affectedCapabilityIds: [],
      affectedExpressionIds: [],
    }],
  };
  const rules = [
    {
      id: 'fixture.prior_expression',
      kind: 'synergy',
      incoming: { allOf: [], anyOf: ['biology.probe'], noneOf: [] },
      subject: { allOf: ['anatomy.wings'], anyOf: [], noneOf: [] },
      scoreDelta: 1,
      visibility: 'diagnostic',
      explanation: 'Prior expressed wings participate.',
    },
    {
      id: 'fixture.mutation',
      kind: 'conflict',
      incoming: { allOf: [], anyOf: ['biology.probe'], noneOf: [] },
      subject: { allOf: ['mutation.fixture_mutation'], anyOf: [], noneOf: [] },
      scoreDelta: -1,
      visibility: 'diagnostic',
      explanation: 'Mutation context participates.',
    },
    {
      id: 'fixture.injury',
      kind: 'conflict',
      incoming: { allOf: [], anyOf: ['biology.probe'], noneOf: [] },
      subject: { allOf: ['injury.permanent'], anyOf: [], noneOf: [] },
      scoreDelta: -1,
      visibility: 'diagnostic',
      explanation: 'Injury context participates.',
    },
  ];
  const assessment = evaluateCreatureCompatibility(contextual, catalog, [probeSource], { rules });
  const signalIds = new Set(assessment.signals.map((signal) => signal.ruleId));
  assert.ok(assessment.existingSourceIds.includes(wingSource.id));
  assert.ok(signalIds.has('fixture.prior_expression'));
  assert.ok(signalIds.has('fixture.mutation'));
  assert.ok(signalIds.has('fixture.injury'));
});

test('cumulative biology survives save/load with history and derived capability unchanged', () => {
  const original = creatureFixture();
  const result = resolveFunctional(original, wingSource, 'save-flight');
  const flying = applySpliceResolution({
    creature: original,
    catalog,
    incomingSources: [wingSource],
    resolution: result,
    attemptId: ids.spliceAttempt('fixture_save_splice'),
    attemptedAt: '2026-08-17T12:10:00.000Z',
  });
  const before = deriveCreatureBiology(flying, catalog);
  const envelope = createSaveEnvelope(gameplayFixture(), domainFor(flying), '2026-08-17T13:00:00.000Z');
  const loaded = domainStateFromSave(decodeSave(JSON.stringify(envelope))).creatures[0];
  const after = deriveCreatureBiology(loaded, catalog);

  assert.deepEqual(loaded.spliceHistory, flying.spliceHistory);
  assert.deepEqual(after, before);
  assert.equal(after.arenaCapabilities.air.functional, true);
});
