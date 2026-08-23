import Phaser from 'phaser';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_FRAME_LAYOUT,
  PROTAGONIST_GAMEPLAY_SCALE,
  PROTAGONIST_IDS,
  PROTAGONIST_SPRITE_COLUMNS,
  PROTAGONIST_SPRITE_FRAME_HEIGHT,
  PROTAGONIST_SPRITE_FRAME_WIDTH,
  PROTAGONIST_SPRITE_ROWS,
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

export function protagonistFrameName(frameIndex: number): string {
  return `frame-${frameIndex}`;
}

export function preloadProtagonistSprites(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    const definition = PROTAGONIST_SPRITES[id];
    if (scene.textures.exists(definition.textureKey)) continue;

    // Load the approved sheet as one ordinary image. We then register the
    // 64x96 frames ourselves by explicit pixel co-ordinates after loading.
    // This deliberately bypasses Phaser's spritesheet frame parser.
    scene.load.image(definition.textureKey, definition.assetPath);
  }
}

function registerProtagonistFrames(scene: Phaser.Scene, id: ProtagonistId): void {
  const definition = PROTAGONIST_SPRITES[id];
  const texture = scene.textures.get(definition.textureKey);
  const frameCount = PROTAGONIST_SPRITE_COLUMNS * PROTAGONIST_SPRITE_ROWS;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const column = frameIndex % PROTAGONIST_SPRITE_COLUMNS;
    const row = Math.floor(frameIndex / PROTAGONIST_SPRITE_COLUMNS);
    const frameName = protagonistFrameName(frameIndex);

    texture.add(
      frameName,
      0,
      column * PROTAGONIST_SPRITE_FRAME_WIDTH,
      row * PROTAGONIST_SPRITE_FRAME_HEIGHT,
      PROTAGONIST_SPRITE_FRAME_WIDTH,
      PROTAGONIST_SPRITE_FRAME_HEIGHT,
    );
  }
}

function animationFrames(textureKey: string, frameIndices: readonly number[]): Phaser.Types.Animations.AnimationFrame[] {
  return frameIndices.map((frameIndex) => ({
    key: textureKey,
    frame: protagonistFrameName(frameIndex),
  }));
}

export function applyProtagonistNearestNeighbourFiltering(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    const textureKey = PROTAGONIST_SPRITES[id].textureKey;
    if (scene.textures.exists(textureKey)) {
      scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

export function createProtagonistAnimations(scene: Phaser.Scene): void {
  for (const id of PROTAGONIST_IDS) {
    const definition = PROTAGONIST_SPRITES[id];
    registerProtagonistFrames(scene, id);

    for (const direction of PROTAGONIST_DIRECTIONS) {
      const frames = PROTAGONIST_FRAME_LAYOUT[direction];
      const idleKey = protagonistAnimationKey(id, direction, 'idle');
      const walkKey = protagonistAnimationKey(id, direction, 'walk');

      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: animationFrames(definition.textureKey, [frames.idle]),
          frameRate: 1,
          repeat: -1,
        });
      }

      if (!scene.anims.exists(walkKey)) {
        // Keep the three secondary directions on one known-good authored pose
        // while diagnosing the runtime. Down retains the coherent walk cycle.
        const walkFrames = direction === 'down'
          ? [frames.walk[0], frames.walk[1], frames.walk[2], frames.walk[1]]
          : [frames.idle];

        scene.anims.create({
          key: walkKey,
          frames: animationFrames(definition.textureKey, walkFrames),
          frameRate: direction === 'down' ? 8 : 1,
          repeat: -1,
        });
      }
    }
  }
}

export function playProtagonistAnimation(
  sprite: Phaser.GameObjects.Sprite,
  id: ProtagonistId,
  direction: ProtagonistDirection,
  state: ProtagonistAnimationState,
): void {
  const key = protagonistAnimationKey(id, direction, state);
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}

export function createProtagonistSprite(
  scene: Phaser.Scene,
  id: ProtagonistId,
  x: number,
  y: number,
  direction: ProtagonistDirection = 'down',
  scale = PROTAGONIST_GAMEPLAY_SCALE,
): Phaser.GameObjects.Sprite {
  const sprite = scene.add.sprite(
    x,
    y,
    PROTAGONIST_SPRITES[id].textureKey,
    protagonistFrameName(PROTAGONIST_FRAME_LAYOUT[direction].idle),
  )
    .setOrigin(0.5, 1)
    .setScale(scale);

  playProtagonistAnimation(sprite, id, direction, 'idle');
  return sprite;
}
