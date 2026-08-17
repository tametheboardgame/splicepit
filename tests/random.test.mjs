import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../src/random/RandomSource.js';
import { attemptSplice } from '../src/systems/spliceSystem.js';

test('same seed produces the same random sequence', () => {
  const a = new SeededRandom('repeatable-seed');
  const b = new SeededRandom('repeatable-seed');
  const first = Array.from({ length: 8 }, () => a.next());
  const second = Array.from({ length: 8 }, () => b.next());
  assert.deepEqual(first, second);
  assert.equal(a.calls, 8);
  assert.equal(b.calls, 8);
});

test('RNG snapshot restores the exact continuation point', () => {
  const source = new SeededRandom('snapshot-seed');
  source.next(); source.next(); source.next();
  const snapshot = source.snapshot();
  const expected = [source.next(), source.next(), source.next()];
  source.restore(snapshot);
  assert.deepEqual([source.next(), source.next(), source.next()], expected);
});

test('splice fixture is reproducible from inputs plus seed', () => {
  const metadata = { creatureId: 'splice-fixture-001', createdAt: '2026-08-17T12:00:00.000Z' };
  const a = new SeededRandom('splicepit-ci');
  const b = new SeededRandom('splicepit-ci');
  const first = attemptSplice('rabbit', ['gecko_regeneration'], () => a.next(), metadata);
  const second = attemptSplice('rabbit', ['gecko_regeneration'], () => b.next(), metadata);
  assert.equal(first.success, true);
  assert.deepEqual(first, second);
  assert.deepEqual(a.snapshot(), b.snapshot());
});
