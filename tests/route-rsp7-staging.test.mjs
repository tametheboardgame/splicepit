import test from 'node:test';
import assert from 'node:assert/strict';
import { RSP3_BRIGHT_ROUTE_ASSET_PACK, rsp7RouteAssetLifecycleDebug } from '../src/environment/routeSceneAssetPack.js';
import { routeSceneProductionCutoverReady } from '../src/environment/routeSceneImageRuntime.js';
import { RSP6_ROUTE_SCENE_PACK } from '../src/world/routeDepthGrounding.js';
import { ROUTE_INTERIOR_RETURN_EVENT } from '../src/world/routeRuntimeBridge.js';

test('RSP-7 stages the exact locked RSP-3 Bright Route asset against the RSP-6 world', () => {
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.width, RSP6_ROUTE_SCENE_PACK.source.width);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.height, RSP6_ROUTE_SCENE_PACK.source.height);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.scale, RSP6_ROUTE_SCENE_PACK.source.scale);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.width, RSP6_ROUTE_SCENE_PACK.world.width);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.height, RSP6_ROUTE_SCENE_PACK.world.height);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.assets.base, RSP6_ROUTE_SCENE_PACK.source.assetPath);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.sha256, 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c');
});

test('RSP-7 refuses production scene-image cutover before authored Dark readiness', () => {
  const lifecycle = rsp7RouteAssetLifecycleDebug();
  assert.equal(lifecycle.ready, false);
  assert.equal(lifecycle.darkReady, false);
  assert.equal(routeSceneProductionCutoverReady(), false);
});

test('RSP-7 reserves one semantic interior-return bridge rather than exposing raw coordinates', () => {
  assert.equal(ROUTE_INTERIOR_RETURN_EVENT, 'splicepit:route-interior-return');
});
