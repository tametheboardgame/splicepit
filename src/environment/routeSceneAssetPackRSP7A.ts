export const RSP7A_ROUTE_ASSET_PACK = {
  id: 'opening-route-approved-pair-rsp7a-v1',
  workPackage: 'RSP-7A',
  approval: 'user-approved Bright and Dark Opening Route masters, 3 September 2026',
  sourceMasters: {
    bright: {
      width: 1535,
      height: 1024,
      bytes: 4419010,
      sha256: 'e75b3126a657f2b97f59e5a55fdb6077f4b49b3fa3c424d8ab8a4808812d1221',
      format: 'image/png',
      role: 'geometry-authority',
    },
    dark: {
      width: 1448,
      height: 1086,
      bytes: 3486931,
      sha256: 'a3ace884ddaa63b25113ca467fc35e8d1c3067a074b6f4da52af08c89fda18ef',
      format: 'image/png',
      role: 'authored-corrupted-counterpart',
    },
  },
  production: {
    width: 1024,
    height: 683,
    worldScale: 3,
    worldWidth: 3072,
    worldHeight: 2049,
    normalisation: {
      bright: 'high-quality resize from approved 1535x1024 Bright source',
      dark: 'high-quality geometry normalisation from approved 1448x1086 Dark source to the identical Bright production canvas',
    },
    bright: {
      path: '/generated/rsp7a/route-bright-base.webp',
      format: 'image/webp',
      quality: 90,
      bytes: 392486,
      sha256: '7fc4f974507a2843ed08e50a6c151e9ee56b47631914b417ec73d0efecb958b6',
    },
    dark: {
      path: '/generated/rsp7a/route-dark-base.webp',
      format: 'image/webp',
      quality: 90,
      bytes: 334852,
      sha256: '3aaa862f2e641831afbce9f9dc07d9a280e1aad7b7d30b096e3d2c70cf6d2554',
    },
  },
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    atomicBrightDarkPairRequired: true,
    exactLayerAlignmentRequired: true,
  },
} as const;

export interface Rsp7aPreparedRouteAssets {
  readonly bright: HTMLImageElement;
  readonly dark: HTMLImageElement;
}

let preparedAssetsPromise: Promise<Rsp7aPreparedRouteAssets> | null = null;

async function decodeRouteAsset(url: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  if (
    image.naturalWidth !== RSP7A_ROUTE_ASSET_PACK.production.width ||
    image.naturalHeight !== RSP7A_ROUTE_ASSET_PACK.production.height
  ) {
    throw new Error(
      `${label} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}; expected ${RSP7A_ROUTE_ASSET_PACK.production.width}x${RSP7A_ROUTE_ASSET_PACK.production.height}`,
    );
  }
  return image;
}

/**
 * RSP-7A prepares the approved pair atomically but does not activate it in the
 * live Route renderer. RSP-7B owns that production cutover.
 */
export function preloadRsp7aRouteAssets(): Promise<Rsp7aPreparedRouteAssets> {
  if (preparedAssetsPromise) return preparedAssetsPromise;
  preparedAssetsPromise = Promise.all([
    decodeRouteAsset(RSP7A_ROUTE_ASSET_PACK.production.bright.path, 'RSP-7A Bright Route'),
    decodeRouteAsset(RSP7A_ROUTE_ASSET_PACK.production.dark.path, 'RSP-7A Dark Route'),
  ]).then(([bright, dark]) => ({ bright, dark })).catch((error: unknown) => {
    preparedAssetsPromise = null;
    throw error;
  });
  return preparedAssetsPromise;
}
