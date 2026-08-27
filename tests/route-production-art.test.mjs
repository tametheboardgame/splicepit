import test from 'node:test';
import assert from 'node:assert/strict';

import { ENVIRONMENT_CAPABILITIES, OPENING_ROUTE_ENVIRONMENT_X } from '../src/environment/environmentVisualContract.js';
import { ROUTE_PRODUCTION_ART_CONTRACT } from '../src/world/routeProductionArt.js';
import {
  OPENING_ROUTE_LANDMARKS,
  OPENING_ROUTE_WAYPOINTS,
  YARD_COLLIDERS,
  YARD_SPAWN,
  YARD_WORLD_HEIGHT,
  YARD_WORLD_WIDTH,
  isYardPositionBlocked,
} from '../src/world/yard.js';

test('WP0.6I authors both route visual states against the existing opening-world geometry', () => {
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.locationId, 'route');
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES.route.geometryId);
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(ENVIRONMENT_CAPABILITIES.route.darkArtStatus, 'authored');
  assert.equal(OPENING_ROUTE_ENVIRONMENT_X, 1720);
});

test('WP0.6I bright route covers the locked production-art detail groups', () => {
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'road-edge-and-wear',
    'terrain-transitions',
    'drainage-and-verges',
    'fencing-and-signage',
    'local-infrastructure',
    'navigation-landmarks',
    'vegetation-clusters',
    'route-storytelling',
  ]);
});

test('WP0.6I dark route uses location-specific environmental storytelling', () => {
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'contaminated-runoff',
    'dead-vegetation',
    'biological-intrusion',
    'damaged-signage',
    'wrong-shadow-pockets',
    'off-route-horror',
  ]);
});

test('WP0.6I preserves the WP0.6D route topology and hand-off landmarks', () => {
  assert.deepEqual(YARD_SPAWN, { x: 900, y: 562 });
  assert.equal(YARD_WORLD_WIDTH, 2920);
  assert.equal(YARD_WORLD_HEIGHT, 1600);
  assert.equal(YARD_COLLIDERS.length, 19);
  assert.equal(OPENING_ROUTE_WAYPOINTS.length, 13);
  assert.deepEqual(
    OPENING_ROUTE_LANDMARKS.map((landmark) => [landmark.id, landmark.x, landmark.y]),
    [
      ['apprentice-yard', 900, 562],
      ['master-lab', 2460, 566],
      ['debt-encounter', 2170, 994],
      ['local-pit-route', 2590, 1432],
    ],
  );
  assert.equal(isYardPositionBlocked(1840, 655), false);
  assert.equal(isYardPositionBlocked(1930, 970), false, 'Old Toll inspection bay remains walkable');
  assert.equal(isYardPositionBlocked(1970, 960), true, 'Old Toll booth remains solid');
  assert.equal(isYardPositionBlocked(2140, 994), false);
  assert.equal(isYardPositionBlocked(2590, 1432), false);
});
