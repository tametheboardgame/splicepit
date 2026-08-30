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
