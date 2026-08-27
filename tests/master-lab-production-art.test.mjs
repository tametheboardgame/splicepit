import test from 'node:test';
import assert from 'node:assert/strict';

import { ENVIRONMENT_CAPABILITIES } from '../src/environment/environmentVisualContract.js';
import {
  MASTER_LAB_COLLIDERS,
  MASTER_LAB_ENTRY_SPAWN,
  MASTER_LAB_EXIT_ZONE,
  MASTER_LAB_STAGES,
  MASTER_LAB_WORLD_HEIGHT,
  MASTER_LAB_WORLD_WIDTH,
  isMasterLabPositionBlocked,
} from '../src/world/masterLab.js';
import { MASTER_LAB_PRODUCTION_ART_CONTRACT } from '../src/world/masterLabProductionArt.js';

test('WP0.6J authors bright and dark Master Lab art against the locked Lab geometry', () => {
  assert.equal(MASTER_LAB_PRODUCTION_ART_CONTRACT.locationId, 'master-lab');
  assert.equal(MASTER_LAB_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES['master-lab'].geometryId);
  assert.deepEqual([...MASTER_LAB_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(MASTER_LAB_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(ENVIRONMENT_CAPABILITIES['master-lab'].darkArtStatus, 'authored');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].darkArtStatus, 'pending');
});

test('WP0.6J bright Lab covers the locked production-art detail groups', () => {
  assert.deepEqual([...MASTER_LAB_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'splice-machinery',
    'specimen-storage',
    'tools-notes-consumables',
    'tubing-cabling-power',
    'drains-and-containment',
    'obsessive-workplace-clutter',
    'lighting-and-shadow-depth',
    'routine-biotech-humour',
  ]);
});

test('WP0.6J dark Lab tells location-specific biotech horror stories instead of applying a generic tint', () => {
  assert.deepEqual([...MASTER_LAB_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'failed-specimens',
    'containment-horror',
    'blood-tissue-and-leakage',
    'damaged-equipment',
    'corrupted-work-surfaces',
    'hidden-silhouettes',
  ]);
});

test('WP0.6J preserves the WP0.6E floorplan, staging and collision topology', () => {
  assert.equal(MASTER_LAB_WORLD_WIDTH, 1960);
  assert.equal(MASTER_LAB_WORLD_HEIGHT, 1200);
  assert.deepEqual(MASTER_LAB_ENTRY_SPAWN, { x: 980, y: 1040 });
  assert.deepEqual(MASTER_LAB_EXIT_ZONE, { x: 900, y: 1060, width: 160, height: 76 });
  assert.equal(MASTER_LAB_COLLIDERS.length, 16);
  assert.deepEqual(
    MASTER_LAB_STAGES.map((stage) => [stage.id, stage.x, stage.y, stage.radius]),
    [
      ['entry', 980, 1040, 110],
      ['master-stage', 980, 620, 170],
      ['rinocow-containment', 1500, 760, 170],
      ['splice-bench', 650, 600, 160],
      ['aftermath-focus', 1160, 620, 190],
    ],
  );
  assert.equal(isMasterLabPositionBlocked(980, 1040), false);
  assert.equal(isMasterLabPositionBlocked(980, 620), false);
  assert.equal(isMasterLabPositionBlocked(1500, 760), false);
  assert.equal(isMasterLabPositionBlocked(650, 600), false);
  assert.equal(isMasterLabPositionBlocked(1480, 470), true, 'RinoCow containment remains solid');
  assert.equal(isMasterLabPositionBlocked(980, 1088), false, 'Lab doorway remains traversable');
});
