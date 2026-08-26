import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCAL_PIT_ENTRY_SPAWN,
  LOCAL_PIT_EXIT_ZONE,
  LOCAL_PIT_STAGES,
  LOCAL_PIT_VIEW_HEIGHT,
  LOCAL_PIT_VIEW_WIDTH,
  LOCAL_PIT_WORLD_HEIGHT,
  LOCAL_PIT_WORLD_WIDTH,
  LOCAL_PIT_YARD_ENTRY_ZONE,
  isLocalPitPositionBlocked,
  localPitZoneAt,
  nearestLocalPitStage,
  pointInsideLocalPitRect,
} from '../src/world/localPit.js';

function sampleSegment(from, to, spacing = 10) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  return Array.from({ length: steps + 1 }, (_, index) => ({
    x: from.x + ((to.x - from.x) * index) / steps,
    y: from.y + ((to.y - from.y) * index) / steps,
  }));
}

function assertRouteIsWalkable(route, message) {
  for (let segment = 0; segment < route.length - 1; segment += 1) {
    for (const point of sampleSegment(route[segment], route[segment + 1])) {
      assert.equal(
        isLocalPitPositionBlocked(point.x, point.y),
        false,
        `${message} blocked near (${Math.round(point.x)}, ${Math.round(point.y)})`,
      );
    }
  }
}

test('WP0.6F exposes a camera-sized Local Pit with exterior and interior staging', () => {
  assert.equal(LOCAL_PIT_VIEW_WIDTH, 1280);
  assert.equal(LOCAL_PIT_VIEW_HEIGHT, 720);
  assert.ok(LOCAL_PIT_WORLD_WIDTH > LOCAL_PIT_VIEW_WIDTH);
  assert.ok(LOCAL_PIT_WORLD_HEIGHT > LOCAL_PIT_VIEW_HEIGHT);
  assert.equal(localPitZoneAt(LOCAL_PIT_ENTRY_SPAWN.x, LOCAL_PIT_ENTRY_SPAWN.y), 'exterior');
  assert.equal(localPitZoneAt(1180, 810), 'interior');

  assert.deepEqual(
    LOCAL_PIT_STAGES.map((stage) => stage.id),
    ['arrival-gate', 'reception', 'prep-bay', 'arena-gate', 'tutorial-battle-floor', 'result-desk'],
  );

  for (const stage of LOCAL_PIT_STAGES) {
    assert.equal(nearestLocalPitStage(stage.x, stage.y)?.id, stage.id);
    assert.equal(isLocalPitPositionBlocked(stage.x, stage.y), false, `${stage.id} player staging point must be walkable.`);
  }
});

test('WP0.6F keeps arrival, reception, prep, arena and result routes walkable', () => {
  const reception = LOCAL_PIT_STAGES.find((stage) => stage.id === 'reception');
  const prep = LOCAL_PIT_STAGES.find((stage) => stage.id === 'prep-bay');
  const gate = LOCAL_PIT_STAGES.find((stage) => stage.id === 'arena-gate');
  const floor = LOCAL_PIT_STAGES.find((stage) => stage.id === 'tutorial-battle-floor');
  const result = LOCAL_PIT_STAGES.find((stage) => stage.id === 'result-desk');
  assert.ok(reception && prep && gate && floor && result);

  assertRouteIsWalkable([LOCAL_PIT_ENTRY_SPAWN, { x: 1180, y: 980 }, reception], 'Arrival to reception');
  assertRouteIsWalkable([reception, { x: 1120, y: 560 }, { x: 680, y: 560 }, prep], 'Reception to prep bay');
  assertRouteIsWalkable([reception, { x: 1320, y: 700 }, gate], 'Reception to arena gate');
  assertRouteIsWalkable([gate, { x: 1550, y: 540 }, floor], 'Arena gate to tutorial battle floor');
  assertRouteIsWalkable([floor, { x: 1550, y: 540 }, { x: 1340, y: 540 }, result], 'Battle floor to results desk');
});

test('WP0.6F provides explicit Yard hand-off and solid authored venue geometry', () => {
  assert.equal(pointInsideLocalPitRect(2768, 1432, LOCAL_PIT_YARD_ENTRY_ZONE), true);
  assert.equal(pointInsideLocalPitRect(1180, 1410, LOCAL_PIT_EXIT_ZONE), true);
  assert.equal(pointInsideLocalPitRect(LOCAL_PIT_ENTRY_SPAWN.x, LOCAL_PIT_ENTRY_SPAWN.y, LOCAL_PIT_EXIT_ZONE), false);
  assert.equal(isLocalPitPositionBlocked(1180, 1410), false, 'The return path must remain traversable.');

  assert.equal(isLocalPitPositionBlocked(130, 500), true, 'West venue wall must remain solid.');
  assert.equal(isLocalPitPositionBlocked(2220, 500), true, 'East venue wall must remain solid.');
  assert.equal(isLocalPitPositionBlocked(1800, 220), true, 'Arena rail must remain solid.');
  assert.equal(isLocalPitPositionBlocked(1800, 430), false, 'Tutorial battle floor must remain usable.');
});
