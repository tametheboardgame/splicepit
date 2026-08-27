import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RINOCOW_DISASTER_CUTSCENE,
  RINOCOW_DISASTER_DIALOGUE,
  RINOCOW_DISASTER_FLAGS,
  RINOCOW_DISASTER_TRANSITIONS,
} from '../src/cutscene/rinocowDisaster.js';

function stepIndex(predicate) {
  return RINOCOW_DISASTER_CUTSCENE.steps.findIndex(predicate);
}

test('RinoCow disaster preserves the locked causal story order', () => {
  const breach = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.BREACH_STARTED);
  const impact = stepIndex((step) => step.kind === 'transition' && step.transitionId === RINOCOW_DISASTER_TRANSITIONS.IMPACT);
  const masterDead = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.MASTER_DEAD);
  const gasPrompt = stepIndex((step) => step.kind === 'dialogue' && step.cueId === 'gas-confirm');
  const gasReleased = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.GAS_RELEASED);
  const rinocowDead = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.RINOCOW_DEAD);
  const apprenticesDead = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.OTHER_APPRENTICES_DEAD);
  const playerSurvived = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.PLAYER_SURVIVED);
  const playerAlone = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.PLAYER_ALONE);
  const complete = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.COMPLETE);

  assert.ok(breach >= 0);
  assert.ok(impact > breach);
  assert.ok(masterDead > impact, 'RinoCow impact must happen before Viktor is marked dead');
  assert.ok(gasPrompt > masterDead, 'the player reaches the fail-safe only after Viktor dies');
  assert.ok(gasReleased > gasPrompt, 'confirming the fail-safe must precede gas release');
  assert.ok(rinocowDead > gasReleased, 'RinoCow dies to the gas, not before it');
  assert.ok(apprenticesDead > gasReleased, 'the other apprentices die after the fail-safe is released');
  assert.ok(playerSurvived > apprenticesDead);
  assert.ok(playerAlone > apprenticesDead);
  assert.ok(complete > playerAlone);
});

test('RinoCow is visibly scripted as the direct cause of Viktor death', () => {
  const masterDead = stepIndex((step) => step.kind === 'flag' && step.flag === RINOCOW_DISASTER_FLAGS.MASTER_DEAD);
  const charge = RINOCOW_DISASTER_CUTSCENE.steps
    .map((step, index) => ({ step, index }))
    .find(({ step, index }) => step.kind === 'move' && step.actorId === 'rinocow' && index < masterDead && (step.speed ?? 0) >= 700);
  assert.ok(charge, 'a high-speed RinoCow charge must occur before Viktor is marked dead');
  assert.equal(charge.step.kind, 'move');
  assert.ok(charge.step.speed >= 700, 'the impact movement is authored as a charge');
});

test('the fail-safe is an explicit player confirmation beat', () => {
  const gasConfirm = RINOCOW_DISASTER_CUTSCENE.steps.find((step) => step.kind === 'dialogue' && step.cueId === 'gas-confirm');
  assert.ok(gasConfirm);
  assert.equal(gasConfirm.kind, 'dialogue');
  assert.equal(gasConfirm.durationMs, undefined, 'untimed dialogue waits for Confirm/Interact in the WP0.7A runtime');
  assert.match(RINOCOW_DISASTER_DIALOGUE['gas-confirm'].text, /KILL EVERY UNSEALED ORGANISM/i);
});

test('all authored dialogue cues exist and aftermath clearly leaves the player alone', () => {
  for (const step of RINOCOW_DISASTER_CUTSCENE.steps) {
    if (step.kind !== 'dialogue') continue;
    assert.ok(RINOCOW_DISASTER_DIALOGUE[step.cueId], `missing dialogue cue ${step.cueId}`);
  }

  assert.match(RINOCOW_DISASTER_DIALOGUE['alone-now'].text, /There is no Master now/i);
  assert.match(RINOCOW_DISASTER_DIALOGUE['alone-now'].text, /Just you/i);
  assert.match(RINOCOW_DISASTER_DIALOGUE['booking-reminder'].text, /NON-REFUNDABLE/i);
  assert.match(RINOCOW_DISASTER_DIALOGUE['viktor-biometric-alert'].text, /NO LONGER A STAFFING CONCERN/i);
});

test('disaster uses the authored corruption language without replacing the shared runtime', () => {
  const corruption = RINOCOW_DISASTER_CUTSCENE.steps
    .filter((step) => step.kind === 'corruption')
    .map((step) => step.intensity);
  assert.ok(corruption.includes('blink'));
  assert.ok(corruption.includes('rupture'));
  assert.ok(corruption.includes('linger'));
});
