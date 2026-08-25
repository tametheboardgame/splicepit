import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TITLE_ADVANCE_MS,
  TITLE_REVEAL_MS,
  titleVisualState,
} from '../src/ui/titleCorruption.js';

test('title reveal settles before the first authored corruption interruption', () => {
  const initial = titleVisualState(0);
  const revealed = titleVisualState(TITLE_REVEAL_MS);
  const firstBreak = titleVisualState(1700);

  assert.equal(initial.reveal, 0);
  assert.equal(initial.corruption, 0);
  assert.equal(revealed.reveal, 1);
  assert.equal(revealed.corruption, 0);
  assert.ok(firstBreak.corruption > 0.4);
  assert.equal(firstBreak.corruptionEventsPassed, 1);
});

test('title corruption snaps back cleanly and only then allows advance', () => {
  const majorBreak = titleVisualState(1950);
  const recovered = titleVisualState(2700);
  const ready = titleVisualState(TITLE_ADVANCE_MS);

  assert.ok(majorBreak.corruption > 0.65);
  assert.equal(recovered.corruption, 0);
  assert.equal(recovered.readyToAdvance, false);
  assert.equal(ready.corruption, 0);
  assert.equal(ready.readyToAdvance, true);
  assert.ok(ready.promptAlpha > 0);
  assert.equal(ready.corruptionEventsPassed, 3);
});

test('settled title continues to receive deterministic later corruption pulses', () => {
  const beforeLoop = titleVisualState(6000);
  const laterBreak = titleVisualState(6400);
  const sameLaterBreak = titleVisualState(6400);

  assert.equal(beforeLoop.corruption, 0);
  assert.ok(laterBreak.corruption > 0.2);
  assert.ok(laterBreak.corruptionEventsPassed > beforeLoop.corruptionEventsPassed);
  assert.deepEqual(laterBreak, sameLaterBreak);
});
