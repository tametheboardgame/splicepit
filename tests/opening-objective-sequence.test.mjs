import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENING_ONBOARDING_PROMPTS,
  OPENING_TUTORIAL_GAP_MS,
  OpeningObjectiveSequenceController,
} from '../src/onboarding/openingObjectiveSequence.js';

test('WP0.6C opening onboarding teaches the basic controls in authored order', () => {
  assert.deepEqual(OPENING_ONBOARDING_PROMPTS, [
    'movement',
    'interact',
    'bag',
    'confirm-cancel',
    'map',
  ]);

  const sequence = new OpeningObjectiveSequenceController();
  assert.equal(sequence.objectiveId(), 'yard-orientation');
  assert.equal(sequence.takeReadyPrompt(0), 'movement');
  assert.equal(sequence.takeReadyPrompt(1), null);

  let now = 100;
  for (const [index, promptId] of OPENING_ONBOARDING_PROMPTS.entries()) {
    if (index > 0) {
      assert.equal(sequence.takeReadyPrompt(now - 1), null);
      assert.equal(sequence.takeReadyPrompt(now), promptId);
    }

    assert.equal(sequence.currentPromptId(), promptId);
    assert.equal(sequence.acknowledgeCompletedPrompt(promptId, now), true);
    assert.deepEqual(sequence.completedPromptIds(), OPENING_ONBOARDING_PROMPTS.slice(0, index + 1));
    now += OPENING_TUTORIAL_GAP_MS;
  }

  assert.equal(sequence.currentPromptId(), null);
  assert.equal(sequence.isComplete(), true);
  assert.equal(sequence.objectiveId(), 'find-master');
});

test('opening sequence ignores out-of-order or unactivated completion reports', () => {
  const sequence = new OpeningObjectiveSequenceController();
  assert.equal(sequence.acknowledgeCompletedPrompt('movement', 10), false);
  assert.equal(sequence.takeReadyPrompt(10), 'movement');
  assert.equal(sequence.acknowledgeCompletedPrompt('interact', 20), false);
  assert.equal(sequence.currentPromptId(), 'movement');
});

test('YSP-5 can resume at the authored route after onboarding is already complete', () => {
  const sequence = new OpeningObjectiveSequenceController();
  sequence.complete();
  assert.equal(sequence.currentPromptId(), null);
  assert.equal(sequence.takeReadyPrompt(100), null);
  assert.equal(sequence.isComplete(), true);
  assert.equal(sequence.objectiveId(), 'find-master');
  assert.deepEqual(sequence.completedPromptIds(), OPENING_ONBOARDING_PROMPTS);

  sequence.reset(250);
  assert.equal(sequence.currentPromptId(), 'movement');
  assert.equal(sequence.objectiveId(), 'yard-orientation');
});
