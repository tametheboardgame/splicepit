import test from 'node:test';
import assert from 'node:assert/strict';
import { RSP3_BRIGHT_ROUTE_ASSET_PACK, rsp7RouteAssetLifecycleDebug } from '../src/environment/routeSceneAssetPack.js';
import {
  routeSceneProductionCutoverBlockers,
  routeSceneProductionCutoverReady,
} from '../src/environment/routeSceneImageRuntime.js';
import { RSP6_ROUTE_SCENE_PACK } from '../src/world/routeDepthGrounding.js';
import {
  RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT,
  isRouteProductionPositionBlocked,
  routeProductionCameraLimits,
  routeProductionEntryFromYard,
  routeProductionInteractionAt,
  routeProductionReturnFromInterior,
  yardProductionReturnFromRoute,
} from '../src/world/routeProductionCutover.js';
import { ROUTE_INTERIOR_RETURN_EVENT } from '../src/world/routeRuntimeBridge.js';
import { routeSceneAnchor, routeSceneCameraLimits } from '../src/world/routeScenePack.js';
import { routeSafeReturnPosition } from '../src/world/routeStoryIntegration.js';
import { isYardScenePositionBlocked, YSP6_YARD_SCENE_PACK } from '../src/world/yardScenePack.js';

test('RSP-7 stages the exact locked RSP-3 Bright Route asset against the RSP-6 world', () => {
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.width, RSP6_ROUTE_SCENE_PACK.source.width);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.height, RSP6_ROUTE_SCENE_PACK.source.height);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.scale, RSP6_ROUTE_SCENE_PACK.source.scale);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.width, RSP6_ROUTE_SCENE_PACK.world.width);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.world.height, RSP6_ROUTE_SCENE_PACK.world.height);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.assets.base, RSP6_ROUTE_SCENE_PACK.source.assetPath);
  assert.equal(RSP3_BRIGHT_ROUTE_ASSET_PACK.source.sha256, 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c');
});

test('RSP-7 refuses production scene-image cutover until Dark art and semantic interiors are both ready', () => {
  const lifecycle = rsp7RouteAssetLifecycleDebug();
  assert.equal(lifecycle.ready, false);
  assert.equal(lifecycle.darkReady, false);
  assert.equal(routeSceneProductionCutoverReady(), false);
  assert.deepEqual(routeSceneProductionCutoverBlockers(), [
    'bright-route',
    'dark-route',
    'semantic-interior-bridge',
  ]);
});

test('RSP-7 reserves one semantic interior-return bridge rather than exposing raw coordinates', () => {
  assert.equal(ROUTE_INTERIOR_RETURN_EVENT, 'splicepit:route-interior-return');
});

test('RSP-7 production cutover contract is authored-scene only', () => {
  assert.equal(RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT.scenePackId, RSP6_ROUTE_SCENE_PACK.id);
  assert.equal(RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT.renderer, 'scene-image');
  assert.equal(RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT.legacyCoordinatesAllowed, false);

  const entry = routeProductionEntryFromYard();
  assert.deepEqual(entry, routeSceneAnchor(RSP6_ROUTE_SCENE_PACK, 'yard-arrival').position);
  assert.notDeepEqual(entry, { x: 1760, y: 655 });

  assert.deepEqual(
    routeProductionCameraLimits(1280, 720),
    routeSceneCameraLimits(RSP6_ROUTE_SCENE_PACK, 1280, 720),
  );
  assert.equal(
    isRouteProductionPositionBlocked(RSP6_ROUTE_SCENE_PACK.world.width + 10, RSP6_ROUTE_SCENE_PACK.world.height + 10),
    true,
  );
});

test('RSP-7 resolves interior returns through semantic authored anchors', () => {
  for (const target of ['master-lab', 'local-pit']) {
    assert.deepEqual(routeProductionReturnFromInterior(target), routeSafeReturnPosition(target));
  }
});

test('RSP-7 exposes authored interaction targets inside the three Route exit bounds', () => {
  for (const exit of RSP6_ROUTE_SCENE_PACK.exits) {
    const x = exit.bounds.x + exit.bounds.width / 2;
    const y = exit.bounds.y + exit.bounds.height / 2;
    assert.equal(routeProductionInteractionAt(x, y)?.target, exit.target);
  }
});

test('RSP-7 derives a safe Yard-side return from current Yard scene geometry', () => {
  const returnPoint = yardProductionReturnFromRoute();
  assert.equal(isYardScenePositionBlocked(YSP6_YARD_SCENE_PACK, returnPoint.x, returnPoint.y), false);
  assert.notDeepEqual(returnPoint, YSP6_YARD_SCENE_PACK.exits[0]?.targetEntry);
});
