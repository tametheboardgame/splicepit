import Phaser from 'phaser';
import { PALETTE } from '../config.js';
import { transitionTo } from '../ui/transitions.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    const visualDirectionReview = new URLSearchParams(window.location.search).get('visualDirection') === '1';
    transitionTo(this, visualDirectionReview ? 'VisualDirection' : 'Title', { duration: 0 });
  }
}
