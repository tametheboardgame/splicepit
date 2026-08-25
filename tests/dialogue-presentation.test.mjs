import test from 'node:test';
import assert from 'node:assert/strict';

import {
  dialogueCorruptionAmount,
  dialoguePageVisualState,
  dialogueRevealDurationMs,
  dialogueVisibleCharacters,
  isDialogueTextSpeed,
} from '../src/dialogue/presentation.js';
import { openingNarrationSequence } from '../src/dialogue/openingNarration.js';

test('opening narration carries the locked satirical story handoff', () => {
  const sequence = openingNarrationSequence();
  assert.equal(sequence.id, 'opening-welcome');
  assert.equal(sequence.pages.length, 4);
  assert.match(sequence.pages[0].text, /world of Splicing/i);
  assert.match(sequence.pages[2].text, /fucked-up genetic alteration/i);
  assert.match(sequence.pages[2].text, /animal brutality/i);
  assert.match(sequence.pages[3].text, /choose your Splice apprentice/i);
});

test('text speed hooks reveal deterministically and instant mode completes immediately', () => {
  const text = '123456789012345678901234';
  assert.ok(dialogueRevealDurationMs(text, 'slow') > dialogueRevealDurationMs(text, 'normal'));
  assert.ok(dialogueRevealDurationMs(text, 'normal') > dialogueRevealDurationMs(text, 'fast'));
  assert.equal(dialogueRevealDurationMs(text, 'instant'), 0);
  assert.equal(dialogueVisibleCharacters(text, 500, 'slow'), 12);
  assert.equal(dialogueVisibleCharacters(text, 500, 'instant'), text.length);
  assert.equal(isDialogueTextSpeed('fast'), true);
  assert.equal(isDialogueTextSpeed('warp'), false);
});

test('controlled corruption events remain page-authored and recover cleanly', () => {
  const page = openingNarrationSequence().pages[2];
  assert.equal(dialogueCorruptionAmount(page, 0), 0);
  assert.ok(dialogueCorruptionAmount(page, 835) > 0.9);
  assert.equal(dialogueCorruptionAmount(page, 1600), 0);

  const during = dialoguePageVisualState(page, 835, 'instant');
  assert.equal(during.textComplete, true);
  assert.ok(during.corruption > 0.9);
  assert.equal(during.corruptionEventsPassed, 2);

  const recovered = dialoguePageVisualState(page, 1600, 'instant');
  assert.equal(recovered.corruption, 0);
  assert.equal(recovered.corruptionEventsPassed, 3);
});

test('dialogue model supports optional speakers and portraits without requiring either', () => {
  const plain = { id: 'plain', text: 'No speaker required.' };
  const voiced = {
    id: 'voiced',
    text: 'Portrait-ready.',
    speaker: 'Dr Example',
    portrait: { src: '/portrait.png', alt: 'Dr Example' },
  };
  assert.equal(dialoguePageVisualState(plain, 9999, 'normal').textComplete, true);
  assert.equal(dialoguePageVisualState(voiced, 9999, 'normal').textComplete, true);
  assert.equal(voiced.speaker, 'Dr Example');
  assert.equal(voiced.portrait.alt, 'Dr Example');
});
