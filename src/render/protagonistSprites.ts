import Phaser from 'phaser';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_FRAME_LAYOUT,
  PROTAGONIST_IDS,
  PROTAGONIST_SPRITE_FRAME_HEIGHT,
  PROTAGONIST_SPRITE_FRAME_WIDTH,
  PROTAGONIST_SPRITES,
  type ProtagonistDirection,
  type ProtagonistId,
} from '../player/protagonists.js';

export type ProtagonistAnimationState = 'idle' | 'walk';

export function protagonistAnimationKey(
  id: ProtagonistId,
  direction: ProtagonistDirection,
  state: ProtagonistAnimationState,
): string {
  return `${PROTAGONIST_SPRITES[id].textureKey}-${direction}-${state}`;
}

export function preloadProtagonistSprites(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    const definition = PROTAGONIST_SPRITES[id];
    scene.load.spritesheet(definition.textureKey, definition.assetPath, {
      frameWidth: PROTAGONIST_SPRITE_FRAME_WIDTH,
      frameHeight: PROTAGONIST_SPRITE_FRAME_HEIGHT,
    });
  }
}

export function applyProtagonistNearestNeighbourFiltering(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    scene.textures.get(PROTAGONIST_SPRITES[id].textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

export function createProtagonistAnimations(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    const definition = PROTAGONIST_SPRITES[id];

    for (const direction of PROTAGONIST_DIRECTIONS) {
      const frames = PROTAGONIST_FRAME_LAYOUT[direction];
      const idleKey = protagonistAnimationKey(id, direction, 'idle');
      const walkKey = protagonistAnimationKey(id, direction, 'walk');

      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: scene.anims.generateFrameNumbers(definition.textureKey, { frames: [frames.idle] }),
          frameRate: 1,
          repeat: -1,
        });
      }

      if (!scene.anims.exists(walkKey)) {
        scene.anims.create({
          key: walkKey,
          frames: scene.anims.generateFrameNumbers(definition.textureKey, {
            frames: [frames.walk[0], frames.walk[1], frames.walk[2], frames.walk[1]],
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }
}
