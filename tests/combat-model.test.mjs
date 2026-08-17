import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COMBAT_METRIC_KEYS,
  deriveCombatMetrics,
  deriveCreatureCombatProfile,
  deriveLegalCombatActions,
} from '../src/domain/combat.js';
import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { BIOLOGY_CONTENT_CATALOG } from '../src/content/biologyCatalog.js';
import { CONTENT_CATALOG } from '../src/content/contentCatalog.js';
import { validateContentCatalog } from '../src/domain/validation.js';

function expression(sourcePackageId, expressionId, capabilityHooks, functional = true) {
  return {
    sourcePackageId: ids.sourcePackage(sourcePackageId),
    expressionId,
    expressed: true,
    magnitude: functional ? 0.78 : 0.15,
    completeness: functional ? 0.8 : 0.2,
    efficiency: functional ? 0.74 : 0.18,
    reliability: functional ? 0.76 : 0.2,
    stability: functional ? 0.79 : 0.2,
    biologicalTags: [`fixture.${expressionId}`],
    phenotypeHooks: [],
    capabilityHooks,
    capabilityIds: functional ? capabilityHooks.map(ids.capability) : [],
    actionIds: [],
    functional,
    notes: 'WP0.4A combat fixture.',
  };
}

function creature(baseAnimalId, expressions = [], suffix = baseAnimalId) {
  const spliceHistory = expressions.length === 0 ? [] : [{
    id: ids.spliceAttempt(`combat_fixture_${suffix}`),
    sequence: 1,
    attemptedAt: '2026-08-17T20:00:00.000Z',
    sourcePackageIds: [...new Set(expressions.map((value) => value.sourcePackageId))],
    consumedMaterialLotIds: [],
    outcomeBand: 'normal_success',
    stabilityBefore: 1,
    stabilityAfter: 0.82,
    complexityAdded: 0.25,
    consequences: { mutationTriggered: false, permanentDamage: false, death: false, injurySeverity: 'none' },
    expressions,
  }];
  return {
    id: ids.creature(`combat_${suffix}`),
    name: `Combat ${suffix}`,
    baseAnimalId: ids.baseAnimal(baseAnimalId),
    role: 'main',
    lifeState: 'living',
    createdAt: '2026-08-17T19:00:00.000Z',
    estimatedAgeDays: 400,
    phenotypeSeed: `combat-${suffix}`,
    spliceHistory,
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: emptyArenaCapabilities(),
  };
}

function actionIds(value) {
  return value.legalActions.map((action) => action.id).sort();
}

test('combat metrics are bounded and reflect biologically different base animals', () => {
  const rabbit = deriveCombatMetrics(creature('rabbit'), BIOLOGY_CONTENT_CATALOG);
  const goat = deriveCombatMetrics(creature('goat'), BIOLOGY_CONTENT_CATALOG);
  const pig = deriveCombatMetrics(creature('pig'), BIOLOGY_CONTENT_CATALOG);

  for (const metrics of [rabbit, goat, pig]) {
    for (const key of COMBAT_METRIC_KEYS) assert.ok(metrics[key] >= 0 && metrics[key] <= 100, `${key} out of bounds`);
  }
  assert.ok(rabbit.mobility > pig.mobility);
  assert.ok(pig.vitality > rabbit.vitality);
  assert.ok(goat.protection > rabbit.protection);
  assert.ok(pig.mass > rabbit.mass);
});

test('four biologically distinct creatures expose genuinely different legal action sets', () => {
  const rabbit = deriveCreatureCombatProfile(creature('rabbit'), BIOLOGY_CONTENT_CATALOG);
  const goat = deriveCreatureCombatProfile(creature('goat'), BIOLOGY_CONTENT_CATALOG);
  const pig = deriveCreatureCombatProfile(creature('pig'), BIOLOGY_CONTENT_CATALOG);
  const electricRabbit = deriveCreatureCombatProfile(creature('rabbit', [
    expression('electric_eel_electrocyte_suite', 'electrical_discharge', ['offence.electrical_discharge']),
    expression('electric_eel_electrocyte_suite', 'electrocyte_support', ['resource.bioelectric_charge']),
    expression('electric_eel_electrocyte_suite', 'electroreception', ['sense.electroreception']),
  ], 'electric_rabbit'), BIOLOGY_CONTENT_CATALOG);

  const sets = [rabbit, goat, pig, electricRabbit].map((profile) => actionIds(profile).join('|'));
  assert.equal(new Set(sets).size, 4);
  assert.ok(actionIds(rabbit).includes(ids.action('combat.hind_kick')));
  assert.ok(actionIds(goat).includes(ids.action('combat.ram')));
  assert.ok(actionIds(pig).includes(ids.action('combat.bite')));
  assert.ok(actionIds(electricRabbit).includes(ids.action('combat.electrical_discharge')));
  assert.ok(actionIds(electricRabbit).length > 4, 'action model must not collapse to four move slots');
});

test('attempted but non-functional anatomy does not generate a combat action', () => {
  const failedElectricRabbit = creature('rabbit', [
    expression('electric_eel_electrocyte_suite', 'electrical_discharge', ['offence.electrical_discharge'], false),
  ], 'failed_electric_rabbit');
  const actions = deriveLegalCombatActions(failedElectricRabbit, BIOLOGY_CONTENT_CATALOG);
  assert.equal(actions.some((action) => action.id === ids.action('combat.electrical_discharge')), false);
});

test('base-animal and splice-derived capability use the same action-generation path', () => {
  const pigActions = deriveLegalCombatActions(creature('pig'), BIOLOGY_CONTENT_CATALOG);
  const lionJawRabbit = creature('rabbit', [
    expression('lion_predatory_suite', 'jaw_dentition', ['offence.bite']),
  ], 'lion_jaw_rabbit');
  const rabbitActions = deriveLegalCombatActions(lionJawRabbit, BIOLOGY_CONTENT_CATALOG);

  assert.ok(pigActions.some((action) => action.id === ids.action('combat.bite')));
  assert.ok(rabbitActions.some((action) => action.id === ids.action('combat.bite')));
});

test('combat capability and action catalogue references validate', () => {
  assert.deepEqual(validateContentCatalog(CONTENT_CATALOG), []);
});
