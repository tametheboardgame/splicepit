import test from 'node:test';
import assert from 'node:assert/strict';
import { RSP5_ROUTE_SCENE_PACK } from '../src/world/routeStoryIntegration.js';
import {
  RSP6_ROUTE_SCENE_PACK,
  routeGroundingShadowAt,
  routeSceneForegroundOccluders,
} from '../src/world/routeDepthGrounding.js';

function contains(bounds, x, y) {
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

test('RSP-6 preserves every RSP-5 geometry and semantic contract', () => {
  assert.equal(RSP6_ROUTE_SCENE_PACK.renderer, RSP5_ROUTE_SCENE_PACK.renderer);
  for (const key of [
    'source',
    'world',
    'cameraBounds',
    'playerFeetHitbox',
    'boundaryInset',
    'spawn',
    'collision',
    'anchors',
    'exits',
  ]) {
    assert.deepEqual(RSP6_ROUTE_SCENE_PACK[key], RSP5_ROUTE_SCENE_PACK[key], `${key} must not change in RSP-6`);
  }
});

test('RSP-6 limits foreground depth to four visible structural occluders', () => {
  assert.equal(RSP6_ROUTE_SCENE_PACK.foreground.mode, 'exact-base-pixel-regions');
  assert.deepEqual(
    RSP6_ROUTE_SCENE_PACK.foreground.occluders.map((occluder) => occluder.id),
    [
      'master-lab-entry-front-frame',
      'weighbridge-west-rail',
      'weighbridge-booth-front',
      'local-pit-gate-front',
    ],
  );

  const occluderArea = RSP6_ROUTE_SCENE_PACK.foreground.occluders.reduce(
    (total, occluder) => total + occluder.bounds.width * occluder.bounds.height,
    0,
  );
  const worldArea = RSP6_ROUTE_SCENE_PACK.world.width * RSP6_ROUTE_SCENE_PACK.world.height;
  assert.ok(occluderArea / worldArea < 0.05, 'foreground crops must remain narrow rather than covering ordinary ground');
});

test('RSP-6 foreground crops do not cover representative open road and staging ground', () => {
  const scale = RSP6_ROUTE_SCENE_PACK.source.scale;
  const openGroundProbes = [
    { id: 'yard-side-road', x: 300 * scale, y: 493 * scale },
    { id: 'central-junction', x: 410 * scale, y: 300 * scale },
    { id: 'debt-staging-centre', x: 651 * scale, y: 424 * scale },
    { id: 'pit-road', x: 760 * scale, y: 520 * scale },
  ];

  for (const probe of openGroundProbes) {
    assert.equal(
      RSP6_ROUTE_SCENE_PACK.foreground.occluders.some((occluder) => contains(occluder.bounds, probe.x, probe.y)),
      false,
      `${probe.id} must remain ordinary unmasked traversable ground`,
    );
  }
});

test('RSP-6 depth sorting activates an object only while player feet are behind it', () => {
  for (const occluder of RSP6_ROUTE_SCENE_PACK.foreground.occluders) {
    assert.ok(
      routeSceneForegroundOccluders(occluder.sortY - 1).some((candidate) => candidate.id === occluder.id),
      `${occluder.id} should occlude when feet are behind its sort line`,
    );
    assert.equal(
      routeSceneForegroundOccluders(occluder.sortY + 1).some((candidate) => candidate.id === occluder.id),
      false,
      `${occluder.id} should not occlude when feet are in front of its sort line`,
    );
  }
});

test('RSP-6 uses one restrained feet-based contact shadow', () => {
  assert.deepEqual(routeGroundingShadowAt(900, 1200), {
    x: 900,
    y: 1196,
    radiusX: 20,
    radiusY: 6,
    alpha: 0.22,
  });
  assert.ok(RSP6_ROUTE_SCENE_PACK.grounding.shadow.alpha <= 0.25);
  assert.ok(RSP6_ROUTE_SCENE_PACK.grounding.shadow.radiusY < RSP6_ROUTE_SCENE_PACK.grounding.shadow.radiusX / 2);
});
