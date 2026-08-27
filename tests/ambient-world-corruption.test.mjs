import test from 'node:test';
import assert from 'node:assert/strict';

import { EnvironmentVisualController } from '../src/environment/environmentVisualContract.js';
import {
  AMBIENT_CORRUPTION_PRESETS,
  AmbientWorldCorruptionScheduler,
  DEFAULT_AMBIENT_CORRUPTION_CONFIG,
} from '../src/environment/ambientWorldCorruption.js';

test('WP0.6L ambient corruption stays rare and does not fire before its scheduled window', () => {
  const scheduler = new AmbientWorldCorruptionScheduler({ minDelayMs: 1000, maxDelayMs: 1000, random: () => 0.5 });
  assert.equal(scheduler.update({ now: 0, locationId: 'yard', exploring: true, blocked: false }).started, null);
  assert.equal(scheduler.update({ now: 999, locationId: 'yard', exploring: true, blocked: false }).started, null);
  const started = scheduler.update({ now: 1000, locationId: 'yard', exploring: true, blocked: false }).started;
  assert.equal(started?.locationId, 'yard');
  assert.equal(started?.source, 'ambient');
  assert.equal(started?.intensity, 'blink');
  assert.equal(DEFAULT_AMBIENT_CORRUPTION_CONFIG.minDelayMs >= 20000, true);
  assert.equal(DEFAULT_AMBIENT_CORRUPTION_CONFIG.maxDelayMs > DEFAULT_AMBIENT_CORRUPTION_CONFIG.minDelayMs, true);
});

test('WP0.6L varies event intensity and can produce a longer dark-layer glimpse deterministically', () => {
  const rolls = [0, 0.99];
  const scheduler = new AmbientWorldCorruptionScheduler({
    minDelayMs: 1000,
    maxDelayMs: 1000,
    random: () => rolls.shift() ?? 0,
  });
  scheduler.update({ now: 0, locationId: 'route', exploring: true, blocked: false });
  const started = scheduler.update({ now: 1000, locationId: 'route', exploring: true, blocked: false }).started;
  assert.equal(started?.intensity, 'linger');
  assert.equal(started?.durationMs, AMBIENT_CORRUPTION_PRESETS.linger.durationMs);
  assert.ok((started?.overlayStrength ?? 0) > AMBIENT_CORRUPTION_PRESETS.rupture.overlayStrength);
});

test('WP0.6L cancels ambient corruption when exploration is suppressed and defers the next event', () => {
  const scheduler = new AmbientWorldCorruptionScheduler({ minDelayMs: 1000, maxDelayMs: 1000, recoveryBufferMs: 4000, random: () => 0 });
  scheduler.update({ now: 0, locationId: 'master-lab', exploring: true, blocked: false });
  const started = scheduler.update({ now: 1000, locationId: 'master-lab', exploring: true, blocked: false }).started;
  assert.ok(started);
  const blocked = scheduler.update({ now: 1100, locationId: 'master-lab', exploring: true, blocked: true });
  assert.equal(blocked.cancelled?.id, started.id);
  assert.equal(blocked.active, null);
  assert.equal(scheduler.snapshot().nextDueAt, 5100);
  assert.equal(scheduler.update({ now: 5099, locationId: 'master-lab', exploring: true, blocked: false }).started, null);
});

test('WP0.6L resets its ambient timer when the player changes opening location', () => {
  const scheduler = new AmbientWorldCorruptionScheduler({ minDelayMs: 1000, maxDelayMs: 1000, random: () => 0 });
  scheduler.update({ now: 0, locationId: 'yard', exploring: true, blocked: false });
  scheduler.update({ now: 500, locationId: 'route', exploring: true, blocked: false });
  assert.equal(scheduler.snapshot().locationId, 'route');
  assert.equal(scheduler.snapshot().nextDueAt, 1500);
  assert.equal(scheduler.update({ now: 1000, locationId: 'route', exploring: true, blocked: false }).started, null);
  assert.equal(scheduler.update({ now: 1500, locationId: 'route', exploring: true, blocked: false }).started?.locationId, 'route');
});

test('WP0.6L authored triggers can explicitly override ordinary suppression for later story beats', () => {
  const scheduler = new AmbientWorldCorruptionScheduler({ random: () => 0 });
  const event = scheduler.force('local-pit', 2000, 'rupture', 'authored');
  assert.equal(event.source, 'authored');
  assert.equal(event.ignoreSuppression, true);
  const update = scheduler.update({ now: 2100, locationId: 'local-pit', exploring: true, blocked: true });
  assert.equal(update.active?.id, event.id);
  assert.equal(scheduler.snapshot().authoredEventCount, 1);
});

test('WP0.6L authored environment transitions can deliberately render through normal suppression', () => {
  const controller = new EnvironmentVisualController();
  controller.setSuppressed('cutscene', true);
  controller.forceTransition('master-lab', 1000, 1000, { ignoreSuppression: true });
  const sample = controller.sample('master-lab', 1400);
  assert.equal(sample.suppressed, false);
  assert.equal(sample.phase, 'dark-glimpse');
  assert.equal(sample.darkMix, 1);
  assert.equal(controller.snapshot(1400).transitionIgnoresSuppression, true);
});
