import test from 'node:test';
import assert from 'node:assert/strict';

import { ENVIRONMENT_CAPABILITIES } from '../src/environment/environmentVisualContract.js';
import {
  LOCAL_PIT_COLLIDERS,
  LOCAL_PIT_ENTRY_SPAWN,
  LOCAL_PIT_EXIT_ZONE,
  LOCAL_PIT_STAGES,
  LOCAL_PIT_WORLD_HEIGHT,
  LOCAL_PIT_WORLD_WIDTH,
  isLocalPitPositionBlocked,
} from '../src/world/localPit.js';
import { LOCAL_PIT_PRODUCTION_ART_CONTRACT } from '../src/world/localPitProductionArt.js';

test('WP0.6K authors bright and dark Local Pit art against the locked Pit geometry', () => {
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.locationId, 'local-pit');
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES['local-pit'].geometryId);
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].darkArtStatus, 'authored');
});

test('WP0.6K bright Pit covers the locked production-art detail groups', () => {
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'exterior-facade-fencing-signage',
    'reception-registration-payout-clutter',
    'prep-weigh-cages-decon',
    'drains-stains-patching-rust-tape',
    'arena-construction-and-worn-rails',
    'spectator-and-business-clutter',
    'local-league-personality',
    'cheap-venue-lighting-and-depth',
  ]);
});

test('WP0.6K dark Pit tells local combat-venue horror stories instead of applying a generic tint', () => {
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'old-blood-organic-residue',
    'failed-cleanup-and-nasty-drains',
    'warped-cages-and-equipment',
    'crowd-and-arena-silhouettes',
    'prep-bay-biological-wrongness',
    'fight-floor-brutality-evidence',
  ]);
});

test('WP0.6K preserves the WP0.6F floorplan, staging and collision topology', () => {
  assert.equal(LOCAL_PIT_WORLD_WIDTH, 2360);
  assert.equal(LOCAL_PIT_WORLD_HEIGHT, 1480);
  assert.deepEqual(LOCAL_PIT_ENTRY_SPAWN, { x: 1180, y: 1320 });
  assert.deepEqual(LOCAL_PIT_EXIT_ZONE, { x: 1090, y: 1370, width: 180, height: 82 });
  assert.equal(LOCAL_PIT_COLLIDERS.length, 19);
  assert.deepEqual(
    LOCAL_PIT_STAGES.map((stage) => [stage.id, stage.x, stage.y, stage.radius]),
    [
      ['arrival-gate', 1180, 1260, 150],
      ['reception', 1120, 810, 170],
      ['prep-bay', 680, 620, 180],
      ['arena-gate', 1450, 540, 150],
      ['tutorial-battle-floor', 1800, 430, 220],
      ['result-desk', 1160, 490, 150],
    ],
  );
  assert.equal(isLocalPitPositionBlocked(1180, 1320), false);
  assert.equal(isLocalPitPositionBlocked(1120, 810), false);
  assert.equal(isLocalPitPositionBlocked(680, 620), false);
  assert.equal(isLocalPitPositionBlocked(1800, 430), false, 'tutorial battle floor remains traversable');
  assert.equal(isLocalPitPositionBlocked(530, 720), true, 'reception counter remains solid');
  assert.equal(isLocalPitPositionBlocked(1180, 1398), false, 'Pit exit remains traversable');
});
