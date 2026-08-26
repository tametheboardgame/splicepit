import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ACTIONS, DEFAULT_BINDINGS, touchHint } from '../src/input/actions.js';

test('WP0.6D1 touch bindings preserve the semantic input contract', () => {
  assert.deepEqual(DEFAULT_BINDINGS.touch.MOVE_UP, ['move-up']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.MOVE_LEFT, ['move-left']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.MOVE_DOWN, ['move-down']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.MOVE_RIGHT, ['move-right']);

  assert.deepEqual(DEFAULT_BINDINGS.touch.INTERACT, ['action']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.CONFIRM, ['action']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.LAB_INTERACT, ['action']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.CANCEL, ['back']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.LAB_CANCEL, ['back']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.BAG, ['bag']);
  assert.deepEqual(DEFAULT_BINDINGS.touch.MAP, ['map']);

  assert.equal(touchHint(ACTIONS.INTERACT), 'ACTION');
  assert.equal(touchHint(ACTIONS.CONFIRM), 'ACTION');
  assert.equal(touchHint(ACTIONS.CANCEL), 'BACK');
  assert.equal(touchHint(ACTIONS.BAG), 'BAG');
  assert.equal(touchHint(ACTIONS.MAP), 'MAP');
});

test('WP0.6D1 mobile surface emits semantic input rather than synthesising keyboard input', () => {
  const source = readFileSync('src/input/mobileGameplayControls.ts', 'utf8');
  assert.match(source, /SEMANTIC_INPUT_EVENT/);
  assert.match(source, /DEFAULT_BINDINGS\.touch/);
  assert.doesNotMatch(source, /KeyboardEvent/);
  assert.doesNotMatch(source, /dispatchKeyEvent/);
});
