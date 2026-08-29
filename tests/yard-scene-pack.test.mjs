import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isYardScenePositionBlocked,
  yardSceneAnchor,
  yardSceneCameraLimits,
  YSP0_YARD_SCENE_PACK,
} from '../src/world/yardScenePack.js';

test('YSP-0 scene pack owns Yard dimensions, camera bounds and image scale', () => {
  const pack = YSP0_YARD_SCENE_PACK;
  assert.equal(pack.renderer, 'scene-image');
  assert.equal(pack.source.width * pack.source.scale, pack.world.width);
  assert.equal(pack.source.height * pack.source.scale, pack.world.height);
  assert.deepEqual(pack.cameraBounds, { x: 0, y: 0, width: pack.world.width, height: pack.world.height });
  assert.deepEqual(yardSceneCameraLimits(pack, 1280, 720), { x: 0, y: 0, width: 1640, height: 880 });
});

test('YSP-0 scene pack owns deterministic feet collision independently of legacy Yard topology', () => {
  const pack = YSP0_YARD_SCENE_PACK;
  assert.equal(pack.collision.mode, 'blocked-rectangles');
  assert.equal(pack.collision.colliders.length, 9);
  assert.equal(isYardScenePositionBlocked(pack, pack.spawn.x, pack.spawn.y), false);
  assert.equal(isYardScenePositionBlocked(pack, 500, 300), true);
  assert.equal(isYardScenePositionBlocked(pack, 1500, 600), false);
  assert.equal(isYardScenePositionBlocked(pack, 4, 4), true);
});

test('YSP-0 scene pack supplies spawn, story anchors and exit metadata', () => {
  const pack = YSP0_YARD_SCENE_PACK;
  assert.deepEqual(pack.spawn, { x: 900, y: 562 });
  assert.equal(yardSceneAnchor(pack, 'master-lab-door')?.kind, 'story');
  assert.equal(yardSceneAnchor(pack, 'science-bench')?.kind, 'interaction');
  assert.equal(pack.exits[0].id, 'east-master-route');
  assert.equal(pack.exits[0].target, 'master-lab-route');
});
