import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_IDS,
  PROTAGONIST_REVIEW_SCALE,
  PROTAGONIST_SPRITES,
  type ProtagonistDirection,
} from '../player/protagonists.js';
import {
  createProtagonistSprite,
  playProtagonistAnimation,
} from '../render/protagonistSprites.js';
import { fadeIn } from '../ui/transitions.js';

export class ProtagonistSpriteTestScene extends Phaser.Scene {
  private sprites: Phaser.GameObjects.Sprite[] = [];
  private directionIndex = 0;

  constructor() {
    super('ProtagonistSpriteTest');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x171a17);
    fadeIn(this, 120);

    this.add.text(480, 30, 'WP0.4D — APPROVED PROTAGONIST RUNTIME TEST', {
      ...TEXT.mono,
      fontSize: '18px',
    }).setOrigin(0.5);

    this.add.text(480, 57, '64×96 frames • 1× gameplay • 2× review • fixed grid • nearest-neighbour', {
      ...TEXT.mono,
      color: '#c6c9b3',
      fontSize: '11px',
    }).setOrigin(0.5);

    const xPositions = [125, 365, 595, 835];

    PROTAGONIST_IDS.forEach((id, index) => {
      const definition = PROTAGONIST_SPRITES[id];
      const x = xPositions[index];

      this.add.rectangle(x, 240, 190, 330, 0x222720)
        .setStrokeStyle(2, PALETTE.mossDark, 0.9);

      const sprite = createProtagonistSprite(this, id, x, 330, 'down', PROTAGONIST_REVIEW_SCALE);
      playProtagonistAnimation(sprite, id, 'down', 'walk');
      this.sprites.push(sprite);

      this.add.text(x, 352, definition.name, {
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

    this.add.text(480, 486, 'Approved art gate: identity, animation cleanliness and stable feet at actual runtime scale', {
      ...TEXT.mono,
      color: '#9da28d',
      fontSize: '11px',
    }).setOrigin(0.5);
  }

  private playDirection(direction: ProtagonistDirection): void {
    this.sprites.forEach((sprite, index) => {
      playProtagonistAnimation(sprite, PROTAGONIST_IDS[index], direction, 'walk');
    });
  }
}
