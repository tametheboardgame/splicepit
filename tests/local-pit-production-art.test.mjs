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

test('GTD-3/4 authors bright and dark Local Pit art against the locked Pit geometry', () => {
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.locationId, 'local-pit');
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES['local-pit'].geometryId);
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.activeArtGeneration, 'graphics-tightening-pass-d');
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.qualityReference, 'master-lab-and-approved-protagonists');
  assert.equal(LOCAL_PIT_PRODUCTION_ART_CONTRACT.replacementMode, 'authored-exterior-and-interior-not-legacy-overlay-stack');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].darkArtStatus, 'authored');
});

test('GTD-3/4 bright Pit covers the full-redraw authored composition groups', () => {
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'authored-exterior-arrival',
    'venue-facade-and-gate',
    'animal-handling-and-loading',
    'reception-and-registration',
    'prep-weigh-and-decon',
    'results-payout-and-medical',
    'arena-and-spectator-business',
    'directional-lighting-and-depth',
  ]);
});

test('GTD-3/4 dark Pit tells local combat-venue horror stories through physical changes', () => {
  assert.deepEqual([...LOCAL_PIT_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'exterior-organic-intrusion',
    'failed-cleanup-and-runoff',
    'warped-holding-equipment',
    'arena-rail-and-floor-intrusion',
    'wrong-crowd-and-shadow',
    'blood-and-biological-residue',
  ]);
});

test('GTD-3/4 preserves the WP0.6F floorplan, staging and collision topology', () => {
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
