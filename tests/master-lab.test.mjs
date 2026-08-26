import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MASTER_LAB_ENTRY_SPAWN,
  MASTER_LAB_EXIT_ZONE,
  MASTER_LAB_EXTERIOR_ENTRY_ZONE,
  MASTER_LAB_STAGES,
  MASTER_LAB_VIEW_HEIGHT,
  MASTER_LAB_VIEW_WIDTH,
  MASTER_LAB_WORLD_HEIGHT,
  MASTER_LAB_WORLD_WIDTH,
  isMasterLabPositionBlocked,
  nearestMasterLabStage,
  pointInsideMasterLabRect,
} from '../src/world/masterLab.js';

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
        isMasterLabPositionBlocked(point.x, point.y),
        false,
        `${message} blocked near (${Math.round(point.x)}, ${Math.round(point.y)})`,
      );
    }
  }
}

test('WP0.6E exposes a camera-sized Master Lab with authored staging zones', () => {
  assert.equal(MASTER_LAB_VIEW_WIDTH, 1280);
  assert.equal(MASTER_LAB_VIEW_HEIGHT, 720);
  assert.ok(MASTER_LAB_WORLD_WIDTH > MASTER_LAB_VIEW_WIDTH);
  assert.ok(MASTER_LAB_WORLD_HEIGHT > MASTER_LAB_VIEW_HEIGHT);

  assert.deepEqual(
    MASTER_LAB_STAGES.map((stage) => stage.id),
    ['entry', 'master-stage', 'rinocow-containment', 'splice-bench', 'aftermath-focus'],
  );

  for (const stage of MASTER_LAB_STAGES) {
    assert.equal(isMasterLabPositionBlocked(stage.x, stage.y), false, `${stage.id} staging point must be walkable.`);
    assert.equal(nearestMasterLabStage(stage.x, stage.y)?.id, stage.id);
  }
});

test('WP0.6E keeps the critical cutscene and tutorial routes walkable', () => {
  const master = MASTER_LAB_STAGES.find((stage) => stage.id === 'master-stage');
  const containment = MASTER_LAB_STAGES.find((stage) => stage.id === 'rinocow-containment');
  const bench = MASTER_LAB_STAGES.find((stage) => stage.id === 'splice-bench');
  assert.ok(master && containment && bench);

  assertRouteIsWalkable([MASTER_LAB_ENTRY_SPAWN, { x: 980, y: 780 }, master], 'Entry to Viktor stage');
  assertRouteIsWalkable([master, { x: 1220, y: 760 }, containment], 'Viktor stage to RinoCow containment');
  assertRouteIsWalkable([master, { x: 740, y: 650 }, bench], 'Viktor stage to splice bench');
});

test('WP0.6E provides explicit exterior entry and interior exit interaction zones', () => {
  assert.equal(pointInsideMasterLabRect(2506, 566, MASTER_LAB_EXTERIOR_ENTRY_ZONE), true);
  assert.equal(pointInsideMasterLabRect(MASTER_LAB_ENTRY_SPAWN.x, MASTER_LAB_ENTRY_SPAWN.y, MASTER_LAB_EXIT_ZONE), false);
  assert.equal(pointInsideMasterLabRect(980, 1088, MASTER_LAB_EXIT_ZONE), true);
  assert.equal(isMasterLabPositionBlocked(980, 1088), false, 'The doorway gap must remain traversable.');

  assert.equal(isMasterLabPositionBlocked(90, 600), true, 'West wall must remain solid.');
  assert.equal(isMasterLabPositionBlocked(1870, 600), true, 'East wall must remain solid.');
  assert.equal(isMasterLabPositionBlocked(1480, 470), true, 'RinoCow tank itself must remain contained.');
});
