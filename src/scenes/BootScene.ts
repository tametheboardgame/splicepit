import Phaser from 'phaser';
import { PALETTE } from '../config.js';
import { transitionTo } from '../ui/transitions.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    transitionTo(this, 'Title', { duration: 0 });
  }
}
