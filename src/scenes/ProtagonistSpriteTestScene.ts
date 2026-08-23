import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_IDS,
  PROTAGONIST_SPRITE_DISPLAY_SCALE,
  PROTAGONIST_SPRITES,
  type ProtagonistDirection,
} from '../player/protagonists.js';
import {
  applyProtagonistNearestNeighbourFiltering,
  createProtagonistAnimations,
  preloadProtagonistSprites,
  protagonistAnimationKey,
} from '../render/protagonistSprites.js';
import { fadeIn } from '../ui/transitions.js';

export class ProtagonistSpriteTestScene extends Phaser.Scene {
  private sprites: Phaser.GameObjects.Sprite[] = [];
  private directionIndex = 0;

  constructor() {
    super('ProtagonistSpriteTest');
  }

  preload(): void {
    preloadProtagonistSprites(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x171a17);
    applyProtagonistNearestNeighbourFiltering(this);
    createProtagonistAnimations(this);
    fadeIn(this, 120);

    this.add.text(480, 32, 'WP0.4D — RUNTIME PROTAGONIST SPRITE TEST', {
      ...TEXT.mono,
      fontSize: '18px',
    }).setOrigin(0.5);

    this.add.text(480, 60, '24×32 frames • 4× display • fixed grid • nearest-neighbour', {
      ...TEXT.mono,
      color: '#c6c9b3',
      fontSize: '12px',
    }).setOrigin(0.5);

    const xPositions = [120, 360, 600, 840];

    PROTAGONIST_IDS.forEach((id, index) => {
      const definition = PROTAGONIST_SPRITES[id];
      const x = xPositions[index];

      this.add.rectangle(x, 238, 176, 300, 0x222720)
        .setStrokeStyle(2, PALETTE.mossDark, 0.9);

      const sprite = this.add.sprite(x, 294, definition.textureKey, 0)
        .setOrigin(0.5, 1)
        .setScale(PROTAGONIST_SPRITE_DISPLAY_SCALE);
      sprite.play(protagonistAnimationKey(id, 'down', 'walk'));
      this.sprites.push(sprite);

      this.add.text(x, 330, definition.name, {
        ...TEXT.body,
        color: '#f0ead8',
        fontSize: '22px',
      }).setOrigin(0.5);
    });

    const directionText = this.add.text(480, 430, '', {
      ...TEXT.mono,
      color: '#d7ddb0',
      fontSize: '14px',
    }).setOrigin(0.5);

    const updateDirection = (): void => {
      const direction = PROTAGONIST_DIRECTIONS[this.directionIndex];
      directionText.setText(`WALK CYCLE: ${direction.toUpperCase()}`);
      this.playDirection(direction);
      this.directionIndex = (this.directionIndex + 1) % PROTAGONIST_DIRECTIONS.length;
    };

    updateDirection();
    this.time.addEvent({ delay: 1800, loop: true, callback: updateDirection });

    this.add.text(480, 486, 'Human gate: silhouette, identity, foot lock and animation cleanliness at play scale', {
      ...TEXT.mono,
      color: '#9da28d',
      fontSize: '11px',
    }).setOrigin(0.5);
  }

  private playDirection(direction: ProtagonistDirection): void {
    this.sprites.forEach((sprite, index) => {
      const id = PROTAGONIST_IDS[index];
      sprite.play(protagonistAnimationKey(id, direction, 'walk'), true);
    });
  }
}
