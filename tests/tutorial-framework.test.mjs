import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, keyboardHint } from '../src/input/actions.js';
import {
  OPENING_TUTORIAL_PROMPTS,
  TUTORIAL_PROMPT_FADE_MS,
  TutorialPromptController,
} from '../src/tutorial/tutorialFramework.js';

test('WP0.6A tutorial catalogue covers opening controls and future mechanics', () => {
  const ids = OPENING_TUTORIAL_PROMPTS.map((prompt) => prompt.id);
  assert.deepEqual(ids, ['movement', 'interact', 'confirm-cancel', 'bag', 'map', 'splice', 'battle']);
  assert.equal(ACTIONS.BAG, 'BAG');
  assert.equal(ACTIONS.MAP, 'MAP');
  assert.equal(keyboardHint(ACTIONS.BAG), 'B');
  assert.equal(keyboardHint(ACTIONS.MAP), 'M');
});

test('movement help is contextual, non-modal and completes from real movement input', () => {
  const tutorial = new TutorialPromptController();
  assert.equal(tutorial.activate('movement'), true);

  const initial = tutorial.current(1000);
  assert.equal(initial?.id, 'movement');
  assert.equal(initial?.completing, false);
  assert.deepEqual(initial?.hints.map((hint) => hint.label), ['↑/W', '←/A', '↓/S', '→/D']);

  tutorial.observeAction(ACTIONS.MOVE_RIGHT, 1100);
  const completing = tutorial.current(1100);
  assert.equal(completing?.completing, true);
  assert.equal(tutorial.isCompleted('movement'), true);
  assert.deepEqual(tutorial.completedIds(), ['movement']);

  const fading = tutorial.current(1100 + TUTORIAL_PROMPT_FADE_MS / 2);
  assert.ok(fading && fading.alpha > 0 && fading.alpha < 1);
  assert.equal(tutorial.current(1100 + TUTORIAL_PROMPT_FADE_MS), null);
});

test('manual tutorial prompts remain available for authored splice and battle sequences', () => {
  const tutorial = new TutorialPromptController();
  tutorial.activate('splice');
  tutorial.observeAction(ACTIONS.INTERACT, 50);
  tutorial.observeAction(ACTIONS.CONFIRM, 75);
  assert.equal(tutorial.isCompleted('splice'), false);
  assert.equal(tutorial.current(100)?.id, 'splice');

  tutorial.completeActive(120);
  assert.equal(tutorial.isCompleted('splice'), true);
  assert.equal(tutorial.current(120)?.completing, true);
});

test('completed prompts do not reactivate until tutorial progress is reset', () => {
  const tutorial = new TutorialPromptController();
  tutorial.activate('bag');
  tutorial.observeAction(ACTIONS.BAG, 10);
  tutorial.current(10 + TUTORIAL_PROMPT_FADE_MS);
  assert.equal(tutorial.activate('bag'), false);

  tutorial.resetProgress();
  assert.equal(tutorial.activate('bag'), true);
  assert.equal(tutorial.isCompleted('bag'), false);
});
