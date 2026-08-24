import Phaser from 'phaser';
import { PALETTE } from '../config.js';
import {
  applyProtagonistNearestNeighbourFiltering,
  createProtagonistAnimations,
  preloadProtagonistSprites,
} from '../render/protagonistSprites.js';
import { transitionTo } from '../ui/transitions.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload(): void {
    preloadProtagonistSprites(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    applyProtagonistNearestNeighbourFiltering(this);
    createProtagonistAnimations(this);

    const params = new URLSearchParams(window.location.search);
    const target = params.get('spriteTest') === '1'
      ? 'ProtagonistSpriteTest'
      : params.get('labTest') === '1'
        ? 'Lab'
        : 'Title';
    transitionTo(this, target, { duration: 0 });
  }
}
