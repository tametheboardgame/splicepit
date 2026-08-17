import test from 'node:test';
import assert from 'node:assert/strict';

import { SeededRandom, randomFn } from '../src/random/RandomSource.js';
import {
  CADENCE_COMPARISON,
  CANDIDATE_COMBAT_CADENCE,
  RECOVER_BREATH_ACTION_ID,
  availableActionIdsForNextRound,
  createCombatTurnState,
  createTurnCombatant,
  orderDeclarations,
  resolveCombatRound,
} from '../src/domain/combatTurn.js';

const baseMetrics = {
  vitality: 55,
  force: 55,
  protection: 50,
  mobility: 50,
  perception: 50,
  metabolicCapacity: 55,
  reliability: 60,
  reach: 50,
  mass: 50,
};

function action(id, name, role, primaryMetric = 'force', secondaryMetric = 'mobility') {
  return {
    id,
    name,
    description: `${name} fixture`,
    role,
    requiredCapabilityIds: [],
    primaryMetric,
    secondaryMetric,
    supportingCapabilityIds: [],
  };
}

function profile(id, metrics = {}, actions = []) {
  return {
    creatureId: id,
    metrics: { ...baseMetrics, ...metrics },
    capabilityIds: [],
    legalActions: actions,
  };
}

const reposition = action('combat.ground_reposition', 'Ground Reposition', 'mobility', 'mobility', 'perception');
const brace = action('combat.stable_brace', 'Stable Brace', 'defence', 'protection', 'reliability');
const bite = action('combat.bite', 'Bite', 'offence', 'force', 'reach');
const burst = action('combat.burst_lunge', 'Burst Lunge', 'offence', 'force', 'mobility');

function duelState() {
  const fast = createTurnCombatant(
    'fast',
    'Fast Creature',
    profile('fast', { mobility: 78, perception: 66, metabolicCapacity: 62 }, [reposition, brace, bite, burst]),
  );
  const heavy = createTurnCombatant(
    'heavy',
    'Heavy Creature',
    profile('heavy', { force: 78, protection: 68, mobility: 32, mass: 82 }, [bite, brace]),
  );
  return createCombatTurnState([fast, heavy]);
}

test('WP0.4B comparison records why initiative rounds are the candidate cadence', () => {
  assert.equal(CANDIDATE_COMBAT_CADENCE, 'initiative_rounds');
  assert.equal(CADENCE_COMPARISON.length, 3);
  const alternating = CADENCE_COMPARISON.find((row) => row.variant === 'alternating');
  const initiative = CADENCE_COMPARISON.find((row) => row.variant === 'initiative_rounds');
  const simultaneous = CADENCE_COMPARISON.find((row) => row.variant === 'simultaneous_declaration');
  assert.equal(alternating.biologyAffectsOrder, false);
  assert.equal(initiative.biologyAffectsOrder, true);
  assert.equal(initiative.reactiveEffectsStayReadable, true);
  assert.equal(initiative.multiCreatureScalingRisk, 'low');
  assert.equal(simultaneous.reactiveEffectsStayReadable, false);
});

test('initiative rounds let action speed and biology determine order instead of fixed side priority', () => {
  const state = duelState();
  const declarations = [
    { actorId: 'heavy', targetId: 'fast', actionId: bite.id },
    { actorId: 'fast', targetId: 'heavy', actionId: brace.id },
  ];
  const alternating = orderDeclarations('alternating', state.combatants, declarations);
  const initiative = orderDeclarations('initiative_rounds', state.combatants, declarations);
  assert.equal(alternating[0].actorId, 'heavy');
  assert.equal(initiative[0].actorId, 'fast', 'fast defensive action should resolve before a slow heavy attack');
});

test('setup, metabolic cost and cooldown prevent repeated strongest-action spam', () => {
  let state = duelState();
  const fast = state.combatants.find((combatant) => combatant.id === 'fast');
  assert.ok(fast);
  assert.equal(availableActionIdsForNextRound(fast, state.round).includes(burst.id), false, 'burst needs setup first');

  state = resolveCombatRound(state, [
    { actorId: 'fast', targetId: 'heavy', actionId: reposition.id },
    { actorId: 'heavy', targetId: 'fast', actionId: RECOVER_BREATH_ACTION_ID },
  ], randomFn(new SeededRandom('wp0.4b-setup')));

  const afterSetup = state.combatants.find((combatant) => combatant.id === 'fast');
  assert.ok(afterSetup);
  assert.ok(afterSetup.setup >= 1);
  assert.equal(availableActionIdsForNextRound(afterSetup, state.round).includes(burst.id), true);

  const reserveBeforeBurst = afterSetup.metabolicReserve;
  state = resolveCombatRound(state, [
    { actorId: 'fast', targetId: 'heavy', actionId: burst.id },
    { actorId: 'heavy', targetId: 'fast', actionId: brace.id },
  ], randomFn(new SeededRandom('wp0.4b-burst')));

  const afterBurst = state.combatants.find((combatant) => combatant.id === 'fast');
  assert.ok(afterBurst);
  assert.ok(afterBurst.metabolicReserve < reserveBeforeBurst, 'committed attack must consume meaningful reserve');
  assert.equal(afterBurst.setup, 0, 'committed attack consumes its setup');
  assert.equal(availableActionIdsForNextRound(afterBurst, state.round).includes(burst.id), false, 'cooldown blocks immediate repeat');
  assert.ok(availableActionIdsForNextRound(afterBurst, state.round).includes(reposition.id), 'lower-cost setup option remains available');
  assert.ok(availableActionIdsForNextRound(afterBurst, state.round).includes(RECOVER_BREATH_ACTION_ID), 'recovery is always a tactical option');
});

test('same combat state, declarations and seed reproduce event order and outcome exactly', () => {
  const source = duelState();
  const declarations = [
    { actorId: 'fast', targetId: 'heavy', actionId: bite.id },
    { actorId: 'heavy', targetId: 'fast', actionId: bite.id },
  ];
  const firstRng = new SeededRandom('wp0.4b-replay');
  const secondRng = new SeededRandom('wp0.4b-replay');
  const first = resolveCombatRound(source, declarations, randomFn(firstRng));
  const second = resolveCombatRound(source, declarations, randomFn(secondRng));
  assert.deepEqual(first, second);
  assert.deepEqual(first.events.map((value) => value.message), second.events.map((value) => value.message));
});

test('combat events form a human-readable ordered round log', () => {
  const state = resolveCombatRound(duelState(), [
    { actorId: 'fast', targetId: 'heavy', actionId: brace.id },
    { actorId: 'heavy', targetId: 'fast', actionId: bite.id },
  ], randomFn(new SeededRandom('wp0.4b-log')));

  assert.equal(state.events[0].type, 'round_start');
  assert.equal(state.events.at(-1).type, 'round_end');
  assert.ok(state.events.some((value) => value.message.includes('Fast Creature uses Stable Brace')));
  assert.ok(state.events.some((value) => value.message.includes('Heavy Creature uses Bite')));
  assert.deepEqual(state.events.map((value) => value.sequence), state.events.map((_, index) => index + 1));
});
