import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RSP4_ROUTE_SCENE_PACK,
  isRouteScenePositionBlocked,
  routeSceneAnchor,
  routeSceneCameraLimits,
  routeSceneExitAt,
} from '../src/world/routeScenePack.js';

const EXPECTED_ANCHORS = [
  'yard-arrival',
  'master-lab-entrance',
  'master-lab-return',
  'debt-encounter',
  'local-pit-entrance',
  'local-pit-return',
];

function canReach(from, to, spacing = 24) {
  const pack = RSP4_ROUTE_SCENE_PACK;
  const targetRadius = Math.max(spacing, Math.min(to.radius ?? spacing, 72));
  const queue = [{ x: from.x, y: from.y }];
  const visited = new Set([`${Math.round(from.x)},${Math.round(from.y)}`]);
  const directions = [
    [spacing, 0],
    [-spacing, 0],
    [0, spacing],
    [0, -spacing],
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (Math.hypot(current.x - to.x, current.y - to.y) <= targetRadius) return true;

    for (const [dx, dy] of directions) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${Math.round(next.x)},${Math.round(next.y)}`;
      if (visited.has(key) || isRouteScenePositionBlocked(pack, next.x, next.y)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return false;
}

function assertOpenDisc(anchor, radius = 42) {
  const samples = [
    [0, 0],
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * Math.SQRT1_2, radius * Math.SQRT1_2],
    [-radius * Math.SQRT1_2, radius * Math.SQRT1_2],
    [radius * Math.SQRT1_2, -radius * Math.SQRT1_2],
    [-radius * Math.SQRT1_2, -radius * Math.SQRT1_2],
  ];

  for (const [dx, dy] of samples) {
    assert.equal(
      isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, anchor.position.x + dx, anchor.position.y + dy),
      false,
      `${anchor.id} should have forgiving walkable approach space near (${Math.round(anchor.position.x + dx)}, ${Math.round(anchor.position.y + dy)})`,
    );
  }
}

test('RSP-4 owns the authored Route world instead of opening-world-v1 geometry', () => {
  assert.equal(RSP4_ROUTE_SCENE_PACK.id, 'opening-route-bright-rsp4-v1');
  assert.equal(RSP4_ROUTE_SCENE_PACK.renderer, 'scene-image');
  assert.deepEqual(RSP4_ROUTE_SCENE_PACK.source, {
    width: 1024,
    height: 683,
    scale: 3,
    assetPath: '/generated/rsp3/route-bright-base.jpg',
  });
  assert.deepEqual(RSP4_ROUTE_SCENE_PACK.world, { width: 3072, height: 2049 });
  assert.deepEqual(routeSceneCameraLimits(RSP4_ROUTE_SCENE_PACK, 1280, 720), {
    x: 0,
    y: 0,
    width: 1792,
    height: 1329,
  });
});

test('RSP-4 exposes the locked semantic Route anchors on walkable ground', () => {
  assert.deepEqual(RSP4_ROUTE_SCENE_PACK.anchors.map((anchor) => anchor.id), EXPECTED_ANCHORS);

  for (const id of EXPECTED_ANCHORS) {
    const anchor = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, id);
    assert.equal(
      isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, anchor.position.x, anchor.position.y),
      false,
      `${id} must resolve to walkable ground`,
    );
    assertOpenDisc(anchor);
  }
});

test('RSP-4 preserves continuous authored traversal from Yard to Lab to debt staging to Pit', () => {
  const yard = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'yard-arrival');
  const labEntrance = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'master-lab-entrance');
  const labReturn = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'master-lab-return');
  const debt = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'debt-encounter');
  const pitEntrance = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'local-pit-entrance');
  const pitReturn = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, 'local-pit-return');

  assert.equal(canReach(yard.position, labEntrance.position), true, 'Yard arrival must reach the Master Lab entrance.');
  assert.equal(canReach(labReturn.position, debt.position), true, 'Lab return must reach the debt encounter staging area.');
  assert.equal(canReach(debt.position, pitEntrance.position), true, 'Debt staging must reach the Local Pit entrance.');
  assert.equal(canReach(pitReturn.position, yard.position), true, 'Pit return must remain connected to the wider Route.');
});

test('RSP-4 semantic exits are explicit interactions with safe route-side return anchors', () => {
  assert.deepEqual(
    RSP4_ROUTE_SCENE_PACK.exits.map((exit) => ({
      id: exit.id,
      target: exit.target,
      activation: exit.activation,
      safeReturnAnchor: exit.safeReturnAnchor,
    })),
    [
      { id: 'yard-return', target: 'apprentice-yard', activation: 'interact', safeReturnAnchor: 'yard-arrival' },
      { id: 'master-lab-entrance', target: 'master-lab', activation: 'interact', safeReturnAnchor: 'master-lab-return' },
      { id: 'local-pit-entrance', target: 'local-pit', activation: 'interact', safeReturnAnchor: 'local-pit-return' },
    ],
  );

  for (const exit of RSP4_ROUTE_SCENE_PACK.exits) {
    const centreX = exit.bounds.x + exit.bounds.width / 2;
    const centreY = exit.bounds.y + exit.bounds.height / 2;
    assert.equal(isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, centreX, centreY), false, `${exit.id} centre must be reachable.`);
    assert.equal(routeSceneExitAt(RSP4_ROUTE_SCENE_PACK, centreX, centreY)?.id, exit.id);

    const safeReturn = routeSceneAnchor(RSP4_ROUTE_SCENE_PACK, exit.safeReturnAnchor);
    assert.equal(isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, safeReturn.position.x, safeReturn.position.y), false);
    assert.equal(routeSceneExitAt(RSP4_ROUTE_SCENE_PACK, safeReturn.position.x, safeReturn.position.y), null, `${exit.safeReturnAnchor} must not instantly re-enter ${exit.id}.`);
  }
});

test('RSP-4 collision follows visible authored masses while keeping roads and staging ground open', () => {
  const blockedSamples = [
    [330, 210, 'north-west greenhouse operation'],
    [1530, 270, "Viktor's Lab mass"],
    [2070, 930, 'weighbridge booth'],
    [210, 1280, 'Yard-side tank complex'],
    [2720, 1570, 'Pit-side woodland'],
  ];
  for (const [x, y, label] of blockedSamples) {
    assert.equal(isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, x, y), true, `${label} should remain solid.`);
  }

  const openSamples = [
    [774, 1479, 'Yard arrival road'],
    [1490, 810, 'Lab approach road'],
    [1890, 1210, 'weighbridge/debt staging ground'],
    [2200, 1650, 'Pit approach road'],
  ];
  for (const [x, y, label] of openSamples) {
    assert.equal(isRouteScenePositionBlocked(RSP4_ROUTE_SCENE_PACK, x, y), false, `${label} should remain traversable.`);
  }
});
