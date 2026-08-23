import Phaser from 'phaser';
import {
  DEFAULT_PROTAGONIST_APPEARANCE,
  PROTAGONIST_GAMEPLAY_SCALE,
  isProtagonistId,
  type ProtagonistDirection,
} from './protagonists.js';
import {
  createProtagonistSprite,
  playProtagonistAnimation,
} from '../render/protagonistSprites.js';
import { LabScene } from '../scenes/LabScene.js';

let installed = false;

// WP0.4D keeps the existing lab/gameplay logic intact while replacing its
// temporary procedural figure with the approved authored protagonist art.
// WP0.4E can move protagonist choice into persistent game state without
// changing this renderer contract.
export function installLabProtagonistRuntime(): void {
  if (installed) return;
  installed = true;

  const originalCreate = LabScene.prototype.create;

  LabScene.prototype.create = function createWithApprovedProtagonist(this: LabScene): void {
    originalCreate.call(this);

    const runtime = this as unknown as {
      player: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite;
      moving: boolean;
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

    let direction: ProtagonistDirection = 'down';
    let walking = false;
    let lastX = sprite.x;
    let lastY = sprite.y;

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      const dx = sprite.x - lastX;
      const dy = sprite.y - lastY;
      const translated = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

      if (translated) {
        if (Math.abs(dx) >= Math.abs(dy)) direction = dx < 0 ? 'left' : 'right';
        else direction = dy < 0 ? 'up' : 'down';
      }

      const shouldWalk = translated || runtime.moving;
      if (shouldWalk !== walking || translated) {
        playProtagonistAnimation(sprite, protagonistId, direction, shouldWalk ? 'walk' : 'idle');
        walking = shouldWalk;
      }

      lastX = sprite.x;
      lastY = sprite.y;
    });
  };
}
