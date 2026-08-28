import test from 'node:test';
import assert from 'node:assert/strict';

import { ENVIRONMENT_CAPABILITIES } from '../src/environment/environmentVisualContract.js';
import { YARD_PRODUCTION_ART_CONTRACT } from '../src/world/yardProductionArt.js';
import {
  OPENING_ROUTE_WAYPOINTS,
  YARD_COLLIDERS,
  YARD_SPAWN,
  YARD_WORLD_HEIGHT,
  YARD_WORLD_WIDTH,
} from '../src/world/yard.js';

test('GTD-1 authors both Yard visual states against the existing opening-world geometry', () => {
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.locationId, 'yard');
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES.yard.geometryId);
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.activeArtGeneration, 'graphics-tightening-pass-d');
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.qualityReference, 'master-lab-and-approved-protagonists');
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.replacementMode, 'opaque-core-redraw-not-overlay-stack');
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.darkArtStatus, 'authored');
});

test('GTD-1 bright Yard covers the full-redraw authored detail groups', () => {
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'authored-ground-plate',
    'apprentice-workshop',
    'animal-handling',
    'biotech-service',
    'containment-hardware',
    'waste-and-repairs',
    'directional-lighting',
    'foreground-depth',
  ]);
});

test('GTD-1 dark Yard changes physical storytelling rather than applying a scene filter', () => {
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'ruptured-containment',
    'organic-pipe-intrusion',
    'wrong-pen-silhouettes',
    'failed-cleanup',
    'dead-ground',
    'biological-runoff',
    'foreground-tissue',
  ]);
});

test('GTD-1 leaves the accepted Yard traversal topology intact', () => {
  assert.deepEqual(YARD_SPAWN, { x: 900, y: 562 });
  assert.equal(YARD_WORLD_WIDTH, 2920);
  assert.equal(YARD_WORLD_HEIGHT, 1600);
  assert.equal(YARD_COLLIDERS.length, 19);
  assert.equal(OPENING_ROUTE_WAYPOINTS.length, 13);
  assert.deepEqual(YARD_COLLIDERS[0], { x: 414, y: 294, width: 430, height: 172 });
  assert.deepEqual(YARD_COLLIDERS.at(-1), { x: 2810, y: 1378, width: 78, height: 98 });
});
