export const PROTAGONIST_IDS = ['milo', 'theo', 'ada', 'pip'] as const;
export type ProtagonistId = (typeof PROTAGONIST_IDS)[number];

export const PROTAGONIST_DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
export type ProtagonistDirection = (typeof PROTAGONIST_DIRECTIONS)[number];

export const PROTAGONIST_SPRITE_FRAME_WIDTH = 24;
export const PROTAGONIST_SPRITE_FRAME_HEIGHT = 32;
export const PROTAGONIST_SPRITE_COLUMNS = 4;
export const PROTAGONIST_SPRITE_ROWS = 4;
export const PROTAGONIST_SPRITE_DISPLAY_SCALE = 4;

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

export const PROTAGONIST_SPRITES: Record<ProtagonistId, ProtagonistSpriteDefinition> = {
  milo: {
    id: 'milo',
    name: 'Milo',
    textureKey: 'protagonist-milo',
    assetPath: 'assets/protagonists/milo.png',
  },
  theo: {
    id: 'theo',
    name: 'Theo',
    textureKey: 'protagonist-theo',
    assetPath: 'assets/protagonists/theo.png',
  },
  ada: {
    id: 'ada',
    name: 'Ada',
    textureKey: 'protagonist-ada',
    assetPath: 'assets/protagonists/ada.png',
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    textureKey: 'protagonist-pip',
    assetPath: 'assets/protagonists/pip.png',
  },
};
