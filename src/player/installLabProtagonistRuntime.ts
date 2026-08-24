import Phaser from 'phaser';
import {
  DEFAULT_PROTAGONIST_APPEARANCE,
  PROTAGONIST_FRAME_LAYOUT,
  PROTAGONIST_GAMEPLAY_SCALE,
  isProtagonistId,
  type ProtagonistDirection,
} from './protagonists.js';
import {
  createProtagonistSprite,
  playProtagonistAnimation,
  protagonistFrameName,
} from '../render/protagonistSprites.js';
import { LabScene } from '../scenes/LabScene.js';

let installed = false;

function directionForMove(dx: number, dy: number): ProtagonistDirection {
  if (dx < 0) return 'left';
  if (dx > 0) return 'right';
  if (dy < 0) return 'up';
  return 'down';
}

export function installLabProtagonistRuntime(): void {
  if (installed) return;
  installed = true;

  const originalCreate = LabScene.prototype.create;

  LabScene.prototype.create = function createWithApprovedProtagonist(this: LabScene): void {
    originalCreate.call(this);

    const runtime = this as unknown as {
      player: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite;
      moving: boolean;
      move: (dx: number, dy: number) => void;
    };

    const oldPlayer = runtime.player;
    const { x, y } = oldPlayer;
    oldPlayer.destroy();

    const requested = typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('protagonist');
    const protagonistId = isProtagonistId(requested)
      ? requested
      : DEFAULT_PROTAGONIST_APPEARANCE.id;

    const sprite = createProtagonistSprite(
      this,
      protagonistId,
      x,
      y,
      'down',
      PROTAGONIST_GAMEPLAY_SCALE,
    );
    runtime.player = sprite;

    const originalMove = runtime.move.bind(this);
    let facing: ProtagonistDirection = 'down';

    const setIdleFrame = (direction: ProtagonistDirection): void => {
      sprite.anims.stop();
      sprite.setFrame(protagonistFrameName(PROTAGONIST_FRAME_LAYOUT[direction].idle));
    };

    runtime.move = (dx: number, dy: number): void => {
      facing = directionForMove(dx, dy);

      if (facing === 'down') {
        playProtagonistAnimation(sprite, protagonistId, 'down', 'walk');
      } else {
        setIdleFrame(facing);
      }

      originalMove(dx, dy);

      this.time.delayedCall(110, () => {
        if (!runtime.moving) setIdleFrame(facing);
      });
    };

    setIdleFrame('down');
  };
}
