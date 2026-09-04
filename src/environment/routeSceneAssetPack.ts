export const RSP3_BRIGHT_ROUTE_ASSET_PACK = {
  id: 'opening-route-bright-scene-v1',
  workPackage: 'RSP-3',
  sourceGenerationId: '36419539-1a20-4646-b1be-d92b04955e40',
  sourceDirection: 'holistic hooked semi-rural biotech Bright route',
  source: {
    width: 1024,
    height: 683,
    bytes: 120561,
    sha256: 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c',
    format: 'image/jpeg',
  },
  assets: {
    base: '/generated/rsp3/route-bright-base.jpg',
    manifest: '/generated/rsp3/route-bright-scene.json',
  },
  world: {
    scale: 3,
    width: 3072,
    height: 2049,
  },
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    exactDarkAlignmentRequired: true,
  },
} as const;

export const RSP7_DARK_ROUTE_ASSET_PACK = {
  id: 'opening-route-dark-scene-rsp7-v1',
  workPackage: 'RSP-7',
  sourceDirection: 'authored Dark counterpart aligned exactly to the approved Bright Route raster',
  source: {
    width: 1024,
    height: 683,
    format: 'image/jpeg',
    base64Characters: 124000,
  },
  assets: {
    base: '/generated/rsp7/route-dark-base.jpg',
    manifest: '/generated/rsp7/route-dark-scene.json',
  },
  world: RSP3_BRIGHT_ROUTE_ASSET_PACK.world,
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    exactBrightAlignmentRequired: true,
  },
} as const;

export interface Rsp7RoutePreparedBrightAsset {
  readonly base: HTMLImageElement;
}

export interface Rsp7RoutePreparedAssets {
  readonly base: HTMLImageElement;
  readonly darkBase: HTMLImageElement;
}

export interface Rsp7RouteAssetLifecycleDebug {
  readonly preloadRequests: number;
  readonly cacheHits: number;
  readonly decodeStarts: number;
  readonly successfulLoads: number;
  readonly failedLoads: number;
  readonly ready: boolean;
  readonly darkReady: boolean;
  readonly lastLoadDurationMs: number | null;
}

const lifecycle = {
  preloadRequests: 0,
  cacheHits: 0,
  decodeStarts: 0,
  successfulLoads: 0,
  failedLoads: 0,
  ready: false,
  darkReady: false,
  lastLoadDurationMs: null as number | null,
};

let brightAssetPromise: Promise<Rsp7RoutePreparedBrightAsset> | null = null;
let routeAssetsPromise: Promise<Rsp7RoutePreparedAssets> | null = null;

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

async function decodeRouteAsset(url: string, label: string): Promise<HTMLImageElement> {
  lifecycle.decodeStarts += 1;
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  if (
    image.naturalWidth !== RSP3_BRIGHT_ROUTE_ASSET_PACK.source.width ||
    image.naturalHeight !== RSP3_BRIGHT_ROUTE_ASSET_PACK.source.height
  ) {
    throw new Error(
      `${label} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}; expected ${RSP3_BRIGHT_ROUTE_ASSET_PACK.source.width}x${RSP3_BRIGHT_ROUTE_ASSET_PACK.source.height}`,
    );
  }
  return image;
}

export function preloadRsp3BrightRouteAsset(): Promise<Rsp7RoutePreparedBrightAsset> {
  lifecycle.preloadRequests += 1;
  if (brightAssetPromise) {
    lifecycle.cacheHits += 1;
    return brightAssetPromise;
  }

  const startedAt = nowMs();
  brightAssetPromise = decodeRouteAsset(RSP3_BRIGHT_ROUTE_ASSET_PACK.assets.base, 'RSP-3 Bright Route base')
    .then((base) => {
      lifecycle.successfulLoads += 1;
      lifecycle.ready = true;
      lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
      return { base };
    })
    .catch((error: unknown) => {
      lifecycle.failedLoads += 1;
      lifecycle.ready = false;
      lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
      brightAssetPromise = null;
      throw error;
    });
  return brightAssetPromise;
}

/** Atomic RSP-7 production dependency: Bright and Dark must decode together. */
export function preloadRsp7RouteAssets(): Promise<Rsp7RoutePreparedAssets> {
  lifecycle.preloadRequests += 1;
  if (routeAssetsPromise) {
    lifecycle.cacheHits += 1;
    return routeAssetsPromise;
  }

  const startedAt = nowMs();
  const brightPromise = brightAssetPromise
    ? brightAssetPromise.then(({ base }) => base)
    : decodeRouteAsset(RSP3_BRIGHT_ROUTE_ASSET_PACK.assets.base, 'RSP-3 Bright Route base');
  const darkPromise = decodeRouteAsset(RSP7_DARK_ROUTE_ASSET_PACK.assets.base, 'RSP-7 Dark Route base');

  routeAssetsPromise = Promise.all([brightPromise, darkPromise])
    .then(([base, darkBase]) => {
      lifecycle.successfulLoads += brightAssetPromise ? 1 : 2;
      lifecycle.ready = true;
      lifecycle.darkReady = true;
      lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
      brightAssetPromise ??= Promise.resolve({ base });
      return { base, darkBase };
    })
    .catch((error: unknown) => {
      lifecycle.failedLoads += 1;
      lifecycle.ready = false;
      lifecycle.darkReady = false;
      lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
      routeAssetsPromise = null;
      throw error;
    });
  return routeAssetsPromise;
}

export function rsp7RouteAssetLifecycleDebug(): Rsp7RouteAssetLifecycleDebug {
  return { ...lifecycle };
}
