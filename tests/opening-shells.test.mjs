import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENING_INVENTORY,
  OPENING_OBJECTIVES,
  OpeningShellController,
} from '../src/onboarding/openingShells.js';

test('WP0.6B opening inventory stays deliberately small and concrete', () => {
  assert.deepEqual(OPENING_INVENTORY.map((entry) => entry.id), ['apprentice-kit', 'sample-vials']);
  assert.equal(OPENING_INVENTORY[0].quantity, 1);
  assert.equal(OPENING_INVENTORY[1].quantity, 3);
});

test('Bag and Map shells toggle and replace one another cleanly', () => {
  const shells = new OpeningShellController();
  assert.equal(shells.activeShell(), null);
  assert.equal(shells.toggle('bag'), 'bag');
  assert.equal(shells.toggle('map'), 'map');
  assert.equal(shells.toggle('map'), null);
  assert.equal(shells.toggle('bag'), 'bag');
  shells.closeShell();
  assert.equal(shells.activeShell(), null);
});

test('objective controller exposes current objective and basic progression without save coupling', () => {
  const shells = new OpeningShellController();
  assert.equal(shells.currentObjective().id, 'yard-orientation');
  assert.equal(shells.objectiveStep(), 1);
  assert.equal(shells.objectiveCount(), OPENING_OBJECTIVES.length);

  assert.equal(shells.advanceObjective(), true);
  assert.equal(shells.currentObjective().id, 'find-master');
  assert.equal(shells.objectiveStep(), 2);
  assert.equal(shells.advanceObjective(), false);

  assert.equal(shells.setObjective('yard-orientation'), true);
  assert.equal(shells.currentObjective().id, 'yard-orientation');
  shells.toggle('map');
  shells.reset();
  assert.equal(shells.activeShell(), null);
  assert.equal(shells.currentObjective().id, 'yard-orientation');
});
