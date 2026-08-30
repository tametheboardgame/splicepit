import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isYardScenePositionBlocked,
  yardSceneCameraLimits,
  YSP4_YARD_SCENE_PACK,
} from '../src/world/yardScenePack.js';

function canReach(pack, start, targetBounds, step = 10) {
  const startPoint = {
    x: Math.round(start.x / step) * step,
    y: Math.round(start.y / step) * step,
  };
  const queue = [startPoint];
  const visited = new Set([`${startPoint.x},${startPoint.y}`]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (
      current.x >= targetBounds.x &&
      current.x <= targetBounds.x + targetBounds.width &&
      current.y >= targetBounds.y &&
      current.y <= targetBounds.y + targetBounds.height
    ) return true;

    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${next.x},${next.y}`;
      if (visited.has(key) || isYardScenePositionBlocked(pack, next.x, next.y)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return false;
}

test('YSP-4 scene pack uses the approved production raster as world geometry', () => {
  const pack = YSP4_YARD_SCENE_PACK;
  assert.equal(pack.renderer, 'scene-image');
  assert.equal(pack.id, 'yard-bright-scene-ysp4-v1');
  assert.deepEqual(pack.source, { width: 1280, height: 720, scale: 1 });
  assert.deepEqual(pack.world, { width: 1280, height: 720 });
  assert.deepEqual(pack.cameraBounds, { x: 0, y: 0, width: 1280, height: 720 });
  assert.deepEqual(yardSceneCameraLimits(pack, 1280, 720), { x: 0, y: 0, width: 0, height: 0 });
  assert.deepEqual(yardSceneCameraLimits(pack, 640, 360), { x: 0, y: 0, width: 640, height: 360 });
});

test('YSP-4 collision follows visible Bright Yard masses and preserves the open centre', () => {
  const pack = YSP4_YARD_SCENE_PACK;
  assert.equal(pack.collision.mode, 'blocked-rectangles');
  assert.equal(pack.collision.colliders.length, 17);
  assert.equal(isYardScenePositionBlocked(pack, pack.spawn.x, pack.spawn.y), false);

  // Representative visibly open ground.
  assert.equal(isYardScenePositionBlocked(pack, 575, 500), false);
  assert.equal(isYardScenePositionBlocked(pack, 500, 350), false);
  assert.equal(isYardScenePositionBlocked(pack, 820, 385), false);
  assert.equal(isYardScenePositionBlocked(pack, 1050, 385), false);

  // Representative visibly solid structures.
  assert.equal(isYardScenePositionBlocked(pack, 300, 200), true, 'GENECO workshop must be solid');
  assert.equal(isYardScenePositionBlocked(pack, 680, 150), true, 'THE HUT must be solid');
  assert.equal(isYardScenePositionBlocked(pack, 820, 480), true, 'splice pit must be solid');
  assert.equal(isYardScenePositionBlocked(pack, 1100, 550), true, 'CRYO container stack must be solid');
  assert.equal(isYardScenePositionBlocked(pack, 780, 630), true, 'service ring must be solid');
  assert.equal(isYardScenePositionBlocked(pack, 4, 4), true, 'world edge must remain bounded');
});

test('YSP-4 keeps a continuous feet-safe route from spawn to the visible Master Lab tunnel', () => {
  const pack = YSP4_YARD_SCENE_PACK;
  assert.equal(pack.exits.length, 1);
  assert.equal(pack.exits[0].id, 'master-lab-tunnel');
  assert.equal(pack.exits[0].target, 'master-lab-route');
  assert.equal(canReach(pack, pack.spawn, pack.exits[0].bounds), true);
});

test('YSP-4 leaves interaction anchors to YSP-5 rather than carrying legacy coordinates forward', () => {
  assert.deepEqual(YSP4_YARD_SCENE_PACK.anchors, []);
});
