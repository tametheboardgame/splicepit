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

test('GTD-2 authors both route visual states against the existing opening-world geometry', () => {
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.locationId, 'route');
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.geometryId, ENVIRONMENT_CAPABILITIES.route.geometryId);
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.authoredStates], ['bright', 'dark']);
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.collisionTopology, 'unchanged');
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.activeArtGeneration, 'graphics-tightening-pass-d');
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.qualityReference, 'master-lab-and-approved-protagonists');
  assert.equal(ROUTE_PRODUCTION_ART_CONTRACT.replacementMode, 'authored-route-plates-not-legacy-overlay-stack');
  assert.equal(ENVIRONMENT_CAPABILITIES.route.darkArtStatus, 'authored');
  assert.equal(OPENING_ROUTE_ENVIRONMENT_X, 1720);
});

test('GTD-2 bright route covers the full-redraw authored composition groups', () => {
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.brightDetailGroups], [
    'authored-road-surface',
    'lab-approach',
    'old-toll-debt-layby',
    'pit-approach',
    'drainage-and-verges',
    'animal-transport-remnants',
    'utility-infrastructure',
    'foreground-depth',
  ]);
});

test('GTD-2 dark route uses location-specific physical environmental storytelling', () => {
  assert.deepEqual([...ROUTE_PRODUCTION_ART_CONTRACT.darkStoryGroups], [
    'contaminated-drainage',
    'organic-road-intrusion',
    'wrong-toll-shadow',
    'dead-verges',
    'damaged-route-signage',
    'pit-bound-residue',
    'foreground-tissue',
  ]);
});

test('GTD-2 preserves the WP0.6D route topology and hand-off landmarks', () => {
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
