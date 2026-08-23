export const PROTAGONIST_IDS = ['milo', 'theo', 'ada', 'pip'] as const;
export type ProtagonistId = (typeof PROTAGONIST_IDS)[number];

export const PROTAGONIST_DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
export type ProtagonistDirection = (typeof PROTAGONIST_DIRECTIONS)[number];

export const PROTAGONIST_SPRITE_FRAME_WIDTH = 64;
export const PROTAGONIST_SPRITE_FRAME_HEIGHT = 96;
export const PROTAGONIST_SPRITE_COLUMNS = 4;
export const PROTAGONIST_SPRITE_ROWS = 4;
export const PROTAGONIST_GAMEPLAY_SCALE = 1;
export const PROTAGONIST_REVIEW_SCALE = 2;

export interface ProtagonistFrameRow {
  readonly idle: number;
  readonly walk: readonly [number, number, number];
}

export const PROTAGONIST_FRAME_LAYOUT: Record<ProtagonistDirection, ProtagonistFrameRow> = {
  down: { idle: 0, walk: [1, 2, 3] },
  left: { idle: 4, walk: [5, 6, 7] },
  right: { idle: 8, walk: [9, 10, 11] },
  up: { idle: 12, walk: [13, 14, 15] },
};

export interface ProtagonistSpriteDefinition {
  readonly id: ProtagonistId;
  readonly name: string;
  readonly textureKey: string;
  readonly assetPath: string;
}

// The HD filenames are deliberately versioned. WP0.4D replaced an earlier
// 24x32 sheet at the same URL and browsers/CDNs could retain that old PNG while
// the runtime attempted to slice it as 64x96, which corrupts every frame after
// the first. Never reuse a protagonist asset URL for a different sheet grid.
export const PROTAGONIST_SPRITES: Record<ProtagonistId, ProtagonistSpriteDefinition> = {
  milo: {
    id: 'milo',
    name: 'Milo',
    textureKey: 'protagonist-milo',
    assetPath: 'assets/protagonists/milo-hd-v2.png',
  },
  theo: {
    id: 'theo',
    name: 'Theo',
    textureKey: 'protagonist-theo',
    assetPath: 'assets/protagonists/theo-hd-v2.png',
  },
  ada: {
    id: 'ada',
    name: 'Ada',
    textureKey: 'protagonist-ada',
    assetPath: 'assets/protagonists/ada-hd-v2.png',
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    textureKey: 'protagonist-pip',
    assetPath: 'assets/protagonists/pip-hd-v2.png',
  },
};

// WP0.4E may expand these IDs into authored palette/mask variants. Keeping the
// appearance contract separate now prevents character customisation from
// leaking into movement or animation code.
export type ProtagonistSkinToneId = 'base';
export type ProtagonistAccentVariantId = 'base';

export interface ProtagonistAppearance {
  readonly id: ProtagonistId;
  readonly skinToneId: ProtagonistSkinToneId;
  readonly accentVariantId: ProtagonistAccentVariantId;
}

export const DEFAULT_PROTAGONIST_APPEARANCE: ProtagonistAppearance = {
  id: 'milo',
  skinToneId: 'base',
  accentVariantId: 'base',
};

export function isProtagonistId(value: string | null | undefined): value is ProtagonistId {
  return PROTAGONIST_IDS.includes(value as ProtagonistId);
}