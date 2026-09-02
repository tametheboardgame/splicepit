import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEBT_COLLECTOR_CUTSCENE,
  DEBT_COLLECTOR_DIALOGUE,
  DEBT_COLLECTOR_FLAGS,
} from '../src/cutscene/debtCollectorEncounter.js';
import {
  DebtEncounterStateController,
  shouldArmDebtEncounter,
} from '../src/story/debtEncounterState.js';
import {
  RSP5_ROUTE_STORY_CONTRACT,
  routeDebtEncounterPlacement,
} from '../src/world/routeStoryIntegration.js';

function stepIndex(predicate) {
  return DEBT_COLLECTOR_CUTSCENE.steps.findIndex(predicate);
}

test('WP0.7E debt encounter arms only after the post-death bench hand-off and completes once', () => {
  assert.equal(shouldArmDebtEncounter({ active: false, spliceBenchInteractionCount: 1 }), false);
  assert.equal(shouldArmDebtEncounter({ active: true, spliceBenchInteractionCount: 0 }), false);
  assert.equal(shouldArmDebtEncounter({ active: true, spliceBenchInteractionCount: 1 }), true);

  const state = new DebtEncounterStateController();
  assert.equal(state.beginEncounter(), false);
  assert.equal(state.armForPitRoute(), true);
  assert.equal(state.armForPitRoute(), false);
  assert.equal(state.beginEncounter(), true);
  assert.equal(state.beginEncounter(), false);
  assert.equal(state.completeEncounter(), true);
  assert.equal(state.completeEncounter(), false);
  assert.deepEqual(state.snapshot(), {
    phase: 'completed',
    armed: false,
    running: false,
    completed: true,
    inheritedDebtConfirmed: true,
    encounterCount: 1,
  });
});

test('WP0.7E cancelled confrontation can safely retry without duplicating completion', () => {
  const state = new DebtEncounterStateController();
  state.armForPitRoute();
  state.beginEncounter();
  assert.equal(state.cancelEncounter(), true);
  assert.equal(state.snapshot().phase, 'armed');
  assert.equal(state.beginEncounter(), true);
  assert.equal(state.completeEncounter(), true);
  assert.equal(state.snapshot().encounterCount, 2);
});

test('RSP-5 stages WP0.7E at the authored biosecurity weighbridge instead of the retired Old Toll', () => {
  const placement = routeDebtEncounterPlacement();
  assert.equal(placement.anchorId, 'debt-encounter');
  assert.equal(placement.label, 'Decommissioned Biosecurity Weighbridge');
  assert.equal(placement.triggerRadius, RSP5_ROUTE_STORY_CONTRACT.debtEncounter.triggerRadius);
  assert.equal(placement.requiresPostDeathLab, true);
  assert.equal(placement.requiresSpliceBenchHandoff, true);
  assert.equal(placement.normalWorldOnly, true);
});

test('debt confrontation explicitly transfers pressure without locking open economy or faction decisions', () => {
  const dialogue = Object.values(DEBT_COLLECTOR_DIALOGUE).map((cue) => cue.text).join(' ');
  assert.match(dialogue, /account is not/i);
  assert.match(dialogue, /obligations attached to the operation/i);
  assert.match(dialogue, /surviving operator/i);
  assert.match(dialogue, /fight booked tonight/i);
  assert.match(dialogue, /figures and dates/i);
  assert.match(dialogue, /death did not clear what he owed/i);
  assert.doesNotMatch(dialogue, /Clearing House/i, 'the provisional creditor faction must not become canon in WP0.7E');
  assert.doesNotMatch(dialogue, /£|\$|€|\b\d+\s*(?:day|days|week|weeks|month|months)\b/i, 'exact debt amount/deadline remains open');
});

test('debt encounter completes inherited-debt flag only after the confrontation dialogue', () => {
  const started = stepIndex((step) => step.kind === 'flag' && step.flag === DEBT_COLLECTOR_FLAGS.STARTED);
  const firstDialogue = stepIndex((step) => step.kind === 'dialogue');
  const lastDialogue = DEBT_COLLECTOR_CUTSCENE.steps.findLastIndex((step) => step.kind === 'dialogue');
  const inherited = stepIndex((step) => step.kind === 'flag' && step.flag === DEBT_COLLECTOR_FLAGS.INHERITED_DEBT_CONFIRMED);
  const complete = stepIndex((step) => step.kind === 'flag' && step.flag === DEBT_COLLECTOR_FLAGS.COMPLETE);

  assert.ok(started >= 0);
  assert.ok(firstDialogue > started);
  assert.ok(inherited > lastDialogue);
  assert.ok(complete > inherited);

  for (const step of DEBT_COLLECTOR_CUTSCENE.steps) {
    if (step.kind === 'dialogue') assert.ok(DEBT_COLLECTOR_DIALOGUE[step.cueId], `missing dialogue cue ${step.cueId}`);
    assert.notEqual(step.kind, 'corruption', 'the administrative threat should land in the normal bright layer');
  }
});
