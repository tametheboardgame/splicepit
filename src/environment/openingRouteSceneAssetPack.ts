export const RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK = {
  id: 'opening-route-bright-scene-rsp3-v1',
  workPackage: 'RSP-3',
  sourceGenerationId: '36419539-1a20-4646-b1be-d92b04955e40',
  sourceComposition: 'integrated hooked-service-route master',
  selectedSourcePngSha256: '7ecfd2078efec161133671f09dbdfa2f9deb52fffc30bae06f64a4078e0c5ad5',
  source: {
    width: 1536,
    height: 1024,
    scale: 1.5,
    bytes: 582212,
    sha256: '786726d57a260597ae771e3417e811a9705262cd4367e8027cda82da3c809574',
    format: 'image/webp',
  },
  world: {
    width: 2304,
    height: 1536,
    viewportWidth: 1280,
    viewportHeight: 720,
    cameraTravelX: 1024,
    cameraTravelY: 816,
  },
  assets: {
    base: '/generated/rsp3/route-bright-base.webp',
    foreground: '/generated/rsp3/route-bright-foreground.png',
    manifest: '/generated/rsp3/route-bright-scene.json',
  },
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    exactLayerAlignmentRequired: true,
    runtimeActivationDeferredUntil: 'RSP-7',
  },
  foregroundStatus: 'transparent-staging-layer-for-rsp6-depth-authoring',
} as const;

export type Rsp3BrightOpeningRouteAssetPack = typeof RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK;

export interface Rsp3PreparedRouteAssets {
  readonly base: HTMLImageElement;
  readonly foreground: HTMLImageElement;
}

let preparedAssetsPromise: Promise<Rsp3PreparedRouteAssets> | null = null;

async function decodeRouteAsset(url: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  if (
    image.naturalWidth !== RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.source.width ||
    image.naturalHeight !== RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.source.height
  ) {
    throw new Error(
      `${label} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}; expected ${RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.source.width}x${RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.source.height}`,
    );
  }
  return image;
}

/**
 * Preloads the prepared RSP-3 Bright Route asset pair without activating the
 * scene-image route renderer. Production replacement remains owned by RSP-7.
 */
export function preloadRsp3BrightOpeningRouteAssets(): Promise<Rsp3PreparedRouteAssets> {
  if (preparedAssetsPromise) return preparedAssetsPromise;
  preparedAssetsPromise = Promise.all([
    decodeRouteAsset(RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.assets.base, 'RSP-3 Bright Route base'),
    decodeRouteAsset(RSP3_BRIGHT_OPENING_ROUTE_ASSET_PACK.assets.foreground, 'RSP-3 Bright Route foreground'),
  ]).then(([base, foreground]) => ({ base, foreground })).catch((error: unknown) => {
    preparedAssetsPromise = null;
    throw error;
  });
  return preparedAssetsPromise;
}
