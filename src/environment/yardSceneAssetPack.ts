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

export type Ysp3BrightYardAssetPack = typeof YSP3_BRIGHT_YARD_ASSET_PACK;

export interface Ysp3BrightYardPreparedAssets {
  readonly base: HTMLImageElement;
  readonly foreground: HTMLImageElement;
}

async function decodeYardAsset(url: string, label: string): Promise<HTMLImageElement> {
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

export async function preloadYsp3BrightYardAssets(): Promise<Ysp3BrightYardPreparedAssets> {
  const [base, foreground] = await Promise.all([
    decodeYardAsset(YSP3_BRIGHT_YARD_ASSET_PACK.assets.base, 'YSP-3 Bright Yard base'),
    decodeYardAsset(YSP3_BRIGHT_YARD_ASSET_PACK.assets.foreground, 'YSP-3 Bright Yard foreground'),
  ]);
  return { base, foreground };
}
