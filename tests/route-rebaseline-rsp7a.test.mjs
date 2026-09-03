import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isRouteScenePositionBlocked,
  routeSceneAnchor,
  routeSceneCameraLimits,
  routeSceneExitAt,
} from '../src/world/routeScenePack.js';
import {
  RSP7A_ROUTE_SCENE_PACK,
  RSP7A_ROUTE_SEMANTIC_ANCHORS,
} from '../src/world/routeScenePackRSP7A.js';
import {
  RSP7A_ROUTE_DEPTH_CONTRACT,
  rsp7aRouteForegroundOccluders,
  rsp7aRouteGroundingShadowAt,
} from '../src/world/routeDepthGroundingRSP7A.js';
import { RSP7A_ROUTE_ASSET_PACK } from '../src/environment/routeSceneAssetPackRSP7A.js';

function canReach(from, to, spacing = 24) {
  const pack = RSP7A_ROUTE_SCENE_PACK;
  const targetRadius = Math.max(spacing, Math.min(to.radius ?? spacing, 72));
  const queue = [{ x: from.x, y: from.y }];
  const visited = new Set([`${Math.round(from.x)},${Math.round(from.y)}`]);
  const directions = [[spacing, 0], [-spacing, 0], [0, spacing], [0, -spacing]];

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
    [0, 0], [radius, 0], [-radius, 0], [0, radius], [0, -radius],
    [radius * Math.SQRT1_2, radius * Math.SQRT1_2],
    [-radius * Math.SQRT1_2, radius * Math.SQRT1_2],
    [radius * Math.SQRT1_2, -radius * Math.SQRT1_2],
    [-radius * Math.SQRT1_2, -radius * Math.SQRT1_2],
  ];
  for (const [dx, dy] of samples) {
    assert.equal(
      isRouteScenePositionBlocked(RSP7A_ROUTE_SCENE_PACK, anchor.position.x + dx, anchor.position.y + dy),
      false,
      `${anchor.id} should keep forgiving feet-hitbox approach space`,
    );
  }
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test('RSP-7A locks the approved Bright/Dark pair to one production canvas', () => {
  assert.equal(RSP7A_ROUTE_SCENE_PACK.id, 'opening-route-approved-masters-rsp7a-v1');
  assert.deepEqual(RSP7A_ROUTE_SCENE_PACK.source, {
    width: 1024,
    height: 683,
    scale: 3,
    assetPath: '/generated/rsp7a/route-bright-base.webp',
  });
  assert.deepEqual(RSP7A_ROUTE_SCENE_PACK.world, { width: 3072, height: 2049 });
  assert.deepEqual(routeSceneCameraLimits(RSP7A_ROUTE_SCENE_PACK, 1280, 720), {
    x: 0,
    y: 0,
    width: 1792,
    height: 1329,
  });
  assert.equal(RSP7A_ROUTE_ASSET_PACK.sourceMasters.bright.sha256, 'e75b3126a657f2b97f59e5a55fdb6077f4b49b3fa3c424d8ab8a4808812d1221');
  assert.equal(RSP7A_ROUTE_ASSET_PACK.sourceMasters.dark.sha256, 'a3ace884ddaa63b25113ca467fc35e8d1c3067a074b6f4da52af08c89fda18ef');
  assert.equal(RSP7A_ROUTE_ASSET_PACK.production.bright.sha256, '7fc4f974507a2843ed08e50a6c151e9ee56b47631914b417ec73d0efecb958b6');
  assert.equal(RSP7A_ROUTE_ASSET_PACK.production.dark.sha256, '3aaa862f2e641831afbce9f9dc07d9a280e1aad7b7d30b096e3d2c70cf6d2554');
});

test('RSP-7A preserves the six semantic anchors on forgiving walkable ground', () => {
  assert.deepEqual(RSP7A_ROUTE_SEMANTIC_ANCHORS, [
    'yard-arrival',
    'master-lab-entrance',
    'master-lab-return',
    'debt-encounter',
    'local-pit-entrance',
    'local-pit-return',
  ]);
  assert.deepEqual(RSP7A_ROUTE_SCENE_PACK.anchors.map((anchor) => anchor.id), RSP7A_ROUTE_SEMANTIC_ANCHORS);
  for (const id of RSP7A_ROUTE_SEMANTIC_ANCHORS) {
    const anchor = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, id);
    assert.equal(isRouteScenePositionBlocked(RSP7A_ROUTE_SCENE_PACK, anchor.position.x, anchor.position.y), false);
    assertOpenDisc(anchor);
  }
});

test('RSP-7A proves Yard -> Lab -> weighbridge debt staging -> Pit traversal', () => {
  const yard = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'yard-arrival');
  const labEntrance = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'master-lab-entrance');
  const labReturn = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'master-lab-return');
  const debt = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'debt-encounter');
  const pitEntrance = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'local-pit-entrance');
  const pitReturn = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, 'local-pit-return');

  assert.equal(canReach(yard.position, labEntrance.position), true);
  assert.equal(canReach(labReturn.position, debt.position), true);
  assert.equal(canReach(debt.position, pitEntrance.position), true);
  assert.equal(canReach(pitReturn.position, yard.position), true);
});

test('RSP-7A keeps semantic exits explicit, reachable and retry-safe', () => {
  assert.deepEqual(RSP7A_ROUTE_SCENE_PACK.exits.map((exit) => ({
    id: exit.id,
    target: exit.target,
    activation: exit.activation,
    safeReturnAnchor: exit.safeReturnAnchor,
  })), [
    { id: 'yard-return', target: 'apprentice-yard', activation: 'interact', safeReturnAnchor: 'yard-arrival' },
    { id: 'master-lab-entrance', target: 'master-lab', activation: 'interact', safeReturnAnchor: 'master-lab-return' },
    { id: 'local-pit-entrance', target: 'local-pit', activation: 'interact', safeReturnAnchor: 'local-pit-return' },
  ]);

  for (const exit of RSP7A_ROUTE_SCENE_PACK.exits) {
    const x = exit.bounds.x + exit.bounds.width / 2;
    const y = exit.bounds.y + exit.bounds.height / 2;
    assert.equal(isRouteScenePositionBlocked(RSP7A_ROUTE_SCENE_PACK, x, y), false, `${exit.id} centre must be walkable`);
    assert.equal(routeSceneExitAt(RSP7A_ROUTE_SCENE_PACK, x, y)?.id, exit.id);
    const safeReturn = routeSceneAnchor(RSP7A_ROUTE_SCENE_PACK, exit.safeReturnAnchor);
    assert.equal(routeSceneExitAt(RSP7A_ROUTE_SCENE_PACK, safeReturn.position.x, safeReturn.position.y), null);
  }
});

test('RSP-7A collision follows the approved master instead of the superseded raster', () => {
  const blocked = [
    [300, 150, 'upper-west forest/operation'],
    [2100, 240, 'Viktor Lab mass'],
    [1635, 900, 'weighbridge booth'],
    [2670, 1650, 'Pit ring'],
    [1260, 390, 'restricted top service gate'],
  ];
  for (const [x, y, label] of blocked) {
    assert.equal(isRouteScenePositionBlocked(RSP7A_ROUTE_SCENE_PACK, x, y), true, `${label} should be solid`);
  }

  const open = [
    [369, 1662, 'Yard arrival'],
    [1590, 990, 'main hooked service road'],
    [1860, 1122, 'debt/weighbridge staging'],
    [2121, 1671, 'Pit entrance approach'],
  ];
  for (const [x, y, label] of open) {
    assert.equal(isRouteScenePositionBlocked(RSP7A_ROUTE_SCENE_PACK, x, y), false, `${label} should be traversable`);
  }
});

test('RSP-7A foreground depth stays sparse and never masks ordinary road', () => {
  const foreground = RSP7A_ROUTE_DEPTH_CONTRACT.foreground;
  assert.equal(foreground.mode, 'exact-base-pixel-regions');
  assert.deepEqual(foreground.occluders.map((item) => item.id), [
    'yard-entry-gate-front',
    'master-lab-entry-front-frame',
    'weighbridge-booth-front',
    'weighbridge-east-utility-front',
    'local-pit-gate-front',
  ]);

  const maskedArea = foreground.occluders.reduce((sum, item) => sum + item.bounds.width * item.bounds.height, 0);
  const worldArea = RSP7A_ROUTE_SCENE_PACK.world.width * RSP7A_ROUTE_SCENE_PACK.world.height;
  assert.ok(maskedArea / worldArea < 0.05, 'foreground crops must remain below 5% of the world');

  const roadProbe = { x: 1520, y: 1040, width: 16, height: 16 };
  assert.equal(foreground.occluders.some((item) => overlaps(item.bounds, roadProbe)), false, 'ordinary road must not be foreground-masked');
  assert.equal(rsp7aRouteForegroundOccluders(0).length, foreground.occluders.length);
  assert.equal(rsp7aRouteForegroundOccluders(RSP7A_ROUTE_SCENE_PACK.world.height + 1).length, 0);
  assert.deepEqual(rsp7aRouteGroundingShadowAt(100, 200), {
    x: 100,
    y: 196,
    radiusX: 20,
    radiusY: 6,
    alpha: 0.22,
  });
});
