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

test('WP0.6H authors both Yard visual states against the existing opening-world geometry', () => {
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.locationId, 'yard');
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES.yard.geometryId);
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(YARD_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.darkArtStatus, 'authored');
});

test('WP0.6H bright Yard covers the locked production-art detail groups', () => {
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'traffic-wear',
    'workshop-materials',
    'containment-hardware',
    'biotech-service',
    'drainage',
    'foliage-variation',
    'ambient-machinery',
  ]);
});

test('WP0.6H dark Yard covers authored environmental storytelling rather than a scene filter', () => {
  assert.deepEqual([...YARD_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'containment-failure',
    'biological-intrusion',
    'dead-vegetation',
    'runoff-and-staining',
    'damaged-equipment',
    'wrong-silhouettes',
  ]);
});

test('WP0.6H leaves the accepted Yard traversal topology intact', () => {
  assert.deepEqual(YARD_SPAWN, { x: 900, y: 562 });
  assert.equal(YARD_WORLD_WIDTH, 2920);
  assert.equal(YARD_WORLD_HEIGHT, 1600);
  assert.equal(YARD_COLLIDERS.length, 19);
  assert.equal(OPENING_ROUTE_WAYPOINTS.length, 13);
  assert.deepEqual(YARD_COLLIDERS[0], { x: 414, y: 294, width: 430, height: 172 });
  assert.deepEqual(YARD_COLLIDERS.at(-1), { x: 2810, y: 1378, width: 78, height: 98 });
});
