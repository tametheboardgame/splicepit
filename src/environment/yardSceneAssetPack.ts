export const YSP3_BRIGHT_YARD_ASSET_PACK = {
  id: 'yard-bright-scene-v1',
  workPackage: 'YSP-3',
  sourceGenerationId: '4e7d4d4d-fabd-4839-b155-15ca1b4053fe',
  sourceDirection: 'open-centre Yard',
  sourceRecovery: 'user-supplied approved Bright Yard master, 30 August 2026',
  source: {
    width: 1280,
    height: 720,
    bytes: 177808,
    sha256: '6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb',
    format: 'image/webp',
  },
  assets: {
    base: '/generated/ysp3/yard-bright-base.webp',
    foreground: '/generated/ysp3/yard-bright-foreground.png',
    manifest: '/generated/ysp3/yard-bright-scene.json',
  },
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    exactLayerAlignmentRequired: true,
  },
  foregroundStatus: 'transparent-staging-layer-for-ysp6-depth-authoring',
} as const;

export const YSP8_DARK_YARD_ASSET_PACK = {
  id: 'yard-dark-scene-ysp8-v1',
  workPackage: 'YSP-8',
  sourceApproval: 'user-approved authored Dark Yard counterpart, 31 August 2026',
  source: {
    width: 1280,
    height: 720,
    bytes: 143796,
    sha256: 'f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b',
    format: 'image/webp',
  },
  assets: {
    base: '/generated/ysp8/yard-dark-base.webp',
    manifest: '/generated/ysp8/yard-dark-scene.json',
  },
  rendering: {
    imageSmoothingEnabled: false,
    preloadRequired: true,
    exactBrightAlignmentRequired: true,
  },
} as const;

export const YSP9_YARD_ASSET_BUDGET = {
  compressedAuthoredBasesBytes: YSP3_BRIGHT_YARD_ASSET_PACK.source.bytes + YSP8_DARK_YARD_ASSET_PACK.source.bytes,
  decodedSurfaceCount: 3,
  decodedRgbaBytes:
    YSP3_BRIGHT_YARD_ASSET_PACK.source.width *
    YSP3_BRIGHT_YARD_ASSET_PACK.source.height *
    4 *
    3,
  decodedRgbaBudgetBytes: 12 * 1024 * 1024,
} as const;

export type Ysp3BrightYardAssetPack = typeof YSP3_BRIGHT_YARD_ASSET_PACK;
export type Ysp8DarkYardAssetPack = typeof YSP8_DARK_YARD_ASSET_PACK;

export interface Ysp8YardPreparedAssets {
  readonly base: HTMLImageElement;
  readonly foreground: HTMLImageElement;
  readonly darkBase: HTMLImageElement;
}

export interface Ysp9YardAssetLifecycleDebug {
  readonly preloadRequests: number;
  readonly cacheHits: number;
  readonly decodeStarts: number;
  readonly successfulLoads: number;
  readonly failedLoads: number;
  readonly ready: boolean;
  readonly lastLoadDurationMs: number | null;
  readonly compressedAuthoredBasesBytes: number;
  readonly decodedRgbaBytes: number;
  readonly decodedRgbaBudgetBytes: number;
}

const lifecycle = {
  preloadRequests: 0,
  cacheHits: 0,
  decodeStarts: 0,
  successfulLoads: 0,
  failedLoads: 0,
  ready: false,
  lastLoadDurationMs: null as number | null,
};

let preparedAssetsPromise: Promise<Ysp8YardPreparedAssets> | null = null;

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

async function decodeYardAsset(url: string, label: string): Promise<HTMLImageElement> {
  lifecycle.decodeStarts += 1;
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  if (
    image.naturalWidth !== YSP3_BRIGHT_YARD_ASSET_PACK.source.width ||
    image.naturalHeight !== YSP3_BRIGHT_YARD_ASSET_PACK.source.height
  ) {
    throw new Error(
      `${label} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}; expected ${YSP3_BRIGHT_YARD_ASSET_PACK.source.width}x${YSP3_BRIGHT_YARD_ASSET_PACK.source.height}`,
    );
  }
  return image;
}

/**
 * YSP-9 keeps the YSP-8 atomic Bright + Dark dependency but memoises the full
 * decoded set for the life of the page. Re-entering the Yard from selection or
 * another opening flow therefore reuses the same decoded surfaces instead of
 * allocating another three 1280×720 images. Failed loads clear the cache so a
 * later retry can recover normally.
 */
export function preloadYsp8YardAssets(): Promise<Ysp8YardPreparedAssets> {
  lifecycle.preloadRequests += 1;
  if (preparedAssetsPromise) {
    lifecycle.cacheHits += 1;
    return preparedAssetsPromise;
  }

  const startedAt = nowMs();
  preparedAssetsPromise = Promise.all([
    decodeYardAsset(YSP3_BRIGHT_YARD_ASSET_PACK.assets.base, 'YSP-3 Bright Yard base'),
    decodeYardAsset(YSP3_BRIGHT_YARD_ASSET_PACK.assets.foreground, 'YSP-3 Bright Yard foreground'),
    decodeYardAsset(YSP8_DARK_YARD_ASSET_PACK.assets.base, 'YSP-8 Dark Yard base'),
  ]).then(([base, foreground, darkBase]) => {
    lifecycle.successfulLoads += 1;
    lifecycle.ready = true;
    lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
    return { base, foreground, darkBase };
  }).catch((error: unknown) => {
    lifecycle.failedLoads += 1;
    lifecycle.ready = false;
    lifecycle.lastLoadDurationMs = Math.max(0, nowMs() - startedAt);
    preparedAssetsPromise = null;
    throw error;
  });

  return preparedAssetsPromise;
}

export function ysp9YardAssetLifecycleDebug(): Ysp9YardAssetLifecycleDebug {
  return {
    ...lifecycle,
    compressedAuthoredBasesBytes: YSP9_YARD_ASSET_BUDGET.compressedAuthoredBasesBytes,
    decodedRgbaBytes: YSP9_YARD_ASSET_BUDGET.decodedRgbaBytes,
    decodedRgbaBudgetBytes: YSP9_YARD_ASSET_BUDGET.decodedRgbaBudgetBytes,
  };
}

/** Compatibility alias retained for the YSP-3 decode smoke and earlier callers. */
export async function preloadYsp3BrightYardAssets(): Promise<Ysp8YardPreparedAssets> {
  return preloadYsp8YardAssets();
}
