import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIONS,
  DEFAULT_BINDINGS,
  keyboardHint,
  touchHint,
} from '../src/input/actions.js';

test('WP0.6E1 exposes hold-to-run on keyboard and touch', () => {
  assert.equal(ACTIONS.RUN, 'RUN');
  assert.deepEqual(DEFAULT_BINDINGS.keyboard.RUN, ['ShiftLeft', 'ShiftRight']);
  assert.deepEqual(DEFAULT_BINDINGS.touch?.RUN, ['run']);
  assert.equal(keyboardHint(ACTIONS.RUN), 'SHIFT/SHIFT');
  assert.equal(touchHint(ACTIONS.RUN), 'RUN');
});
