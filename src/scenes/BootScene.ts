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
    const spriteTest = new URLSearchParams(window.location.search).get('spriteTest') === '1';
    transitionTo(this, spriteTest ? 'ProtagonistSpriteTest' : 'Title', { duration: 0 });
  }
}
