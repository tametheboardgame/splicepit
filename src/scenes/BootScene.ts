import Phaser from 'phaser';
import { PALETTE } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    this.scene.start('Title');
  }
}
