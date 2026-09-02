import test from 'node:test';
import assert from 'node:assert/strict';

import { RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK } from '../src/environment/openingRouteSceneAssetPack.js';

test('RSP-3 locks the selected Bright Opening Route source identity', () => {
  const pack = RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK;
  assert.equal(pack.workPackage, 'RSP-3');
  assert.equal(pack.sourceGenerationId, '36419539-1a20-4646-b1be-d92b04955e40');
  assert.equal(pack.sourceComposition, 'integrated hooked-service-route master');
  assert.equal(pack.selectedSourcePngSha256, '7ecfd2078efec161133671f09dbdfa2f9deb52fffc30bae06f64a4078e0c5ad5');
  assert.deepEqual(pack.source, {
    width: 1536,
    height: 1024,
    scale: 1.5,
    bytes: 582212,
    sha256: '786726d57a260597ae771e3417e811a9705262cd4367e8027cda82da3c809574',
    format: 'image/webp',
  });
});

test('RSP-3 provides enough authored world travel for multiple 1280x720 camera beats', () => {
  const pack = RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK;
  assert.deepEqual(pack.world, {
    width: 2304,
    height: 1536,
    viewportWidth: 1280,
    viewportHeight: 720,
    cameraTravelX: 1024,
    cameraTravelY: 816,
  });
  assert.ok(pack.world.cameraTravelX >= pack.world.viewportWidth * 0.75);
  assert.ok(pack.world.cameraTravelY >= pack.world.viewportHeight);
});

test('RSP-3 prepares aligned layers without activating the production replacement early', () => {
  const pack = RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK;
  assert.equal(pack.assets.base, '/generated/rsp3/route-bright-base.webp');
  assert.equal(pack.assets.foreground, '/generated/rsp3/route-bright-foreground.png');
  assert.equal(pack.rendering.imageSmoothingEnabled, false);
  assert.equal(pack.rendering.preloadRequired, true);
  assert.equal(pack.rendering.exactLayerAlignmentRequired, true);
  assert.equal(pack.rendering.runtimeActivationDeferredUntil, 'RSP-7');
  assert.equal(pack.foregroundStatus, 'transparent-staging-layer-for-rsp6-depth-authoring');
});
