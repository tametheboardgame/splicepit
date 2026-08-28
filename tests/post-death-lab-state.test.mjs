import test from 'node:test';
import assert from 'node:assert/strict';
import { PostDeathLabStateController } from '../src/story/postDeathLabState.js';

test('WP0.7D converts the Master Lab into a durable post-death aftermath state', () => {
  const state = new PostDeathLabStateController();
  assert.deepEqual(state.snapshot(), {
    phase: 'pre-disaster',
    active: false,
    masterPresent: true,
    masterLabState: 'pre-disaster',
    spliceBenchReady: false,
    spliceBenchInteractionCount: 0,
  });

  assert.equal(state.activateAfterDisaster(), true);
  assert.deepEqual(state.snapshot(), {
    phase: 'post-death',
    active: true,
    masterPresent: false,
    masterLabState: 'aftermath',
    spliceBenchReady: true,
    spliceBenchInteractionCount: 0,
  });
  assert.equal(state.activateAfterDisaster(), false, 're-entry must not reinitialise the aftermath transition');
  assert.equal(state.snapshot().masterLabState, 'aftermath');
});

test('WP0.7D exposes one stable splice-bench hand-off after the disaster', () => {
  const state = new PostDeathLabStateController();
  assert.equal(state.requestSpliceBench(), false, 'the bench cannot become the route forward before the disaster');
  state.activateAfterDisaster();
  assert.equal(state.requestSpliceBench(), true);
  assert.equal(state.requestSpliceBench(), false, 'overlapping semantic aliases must not duplicate the hand-off');
  assert.equal(state.snapshot().spliceBenchInteractionCount, 1);
});

test('WP0.7D state listeners receive activation and bench hand-off changes', () => {
  const state = new PostDeathLabStateController();
  const snapshots = [];
  const unsubscribe = state.subscribe((snapshot) => snapshots.push(snapshot));

  state.activateAfterDisaster();
  state.requestSpliceBench();
  state.requestSpliceBench();
  unsubscribe();

  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].masterPresent, false);
  assert.equal(snapshots[0].spliceBenchInteractionCount, 0);
  assert.equal(snapshots[1].spliceBenchInteractionCount, 1);
});
