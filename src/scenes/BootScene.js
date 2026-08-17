import { PALETTE } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    this.scene.start('Title');
  }
}
