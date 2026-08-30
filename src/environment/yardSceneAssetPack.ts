export const YSP3_BRIGHT_YARD_ASSET_PACK = {
  id: 'yard-bright-scene-v1',
  workPackage: 'YSP-3',
  sourceGenerationId: '4e7d4d4d-fabd-4839-b155-15ca1b4053fe',
  sourceDirection: 'open-centre Yard',
  source: {
    width: 1280,
    height: 720,
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
