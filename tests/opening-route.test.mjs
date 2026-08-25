import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OPENING_ROUTE_LANDMARKS,
  OPENING_ROUTE_WAYPOINTS,
  YARD_SPAWN,
  YARD_WORLD_HEIGHT,
  YARD_WORLD_WIDTH,
  isYardPositionBlocked,
  nearestOpeningRouteLandmark,
} from '../src/world/yard.js';

function sampleSegment(from, to, spacing = 12) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  return Array.from({ length: steps + 1 }, (_, index) => ({
    x: from.x + ((to.x - from.x) * index) / steps,
    y: from.y + ((to.y - from.y) * index) / steps,
  }));
}

test('WP0.6D exposes the authored opening-world landmarks', () => {
  assert.ok(YARD_WORLD_WIDTH >= 2900);
  assert.ok(YARD_WORLD_HEIGHT >= 1500);

  assert.deepEqual(
    OPENING_ROUTE_LANDMARKS.map((landmark) => landmark.id),
    ['apprentice-yard', 'master-lab', 'debt-encounter', 'local-pit-route'],
  );

  assert.equal(nearestOpeningRouteLandmark(YARD_SPAWN.x, YARD_SPAWN.y)?.id, 'apprentice-yard');
  assert.equal(nearestOpeningRouteLandmark(2460, 566)?.id, 'master-lab');
  assert.equal(nearestOpeningRouteLandmark(2170, 994)?.id, 'debt-encounter');
  assert.equal(nearestOpeningRouteLandmark(2590, 1432)?.id, 'local-pit-route');
  assert.equal(nearestOpeningRouteLandmark(1700, 200)?.id, undefined);
});

test('WP0.6D keeps a continuous traversable Yard to Lab to Pit route', () => {
  const route = [YARD_SPAWN, ...OPENING_ROUTE_WAYPOINTS];

  for (let segment = 0; segment < route.length - 1; segment += 1) {
    const from = route[segment];
    const to = route[segment + 1];
    for (const point of sampleSegment(from, to)) {
      assert.equal(
        isYardPositionBlocked(point.x, point.y),
        false,
        `Opening route blocked between waypoint ${segment} and ${segment + 1} near (${Math.round(point.x)}, ${Math.round(point.y)})`,
      );
    }
  }
});

test('WP0.6D preserves physical boundaries around authored spaces', () => {
  assert.equal(isYardPositionBlocked(2490, 500), true, 'Master lab exterior should remain solid.');
  assert.equal(isYardPositionBlocked(1884, 930), true, 'Old Toll lamp/post should remain solid.');
  assert.equal(isYardPositionBlocked(2840, 1432), true, 'Pit-road boundary should stop this package before the Pit itself.');
});
