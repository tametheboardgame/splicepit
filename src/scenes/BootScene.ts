import Phaser from 'phaser';
import { PALETTE } from '../config.js';
import { transitionTo } from '../ui/transitions.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    const params = new URLSearchParams(window.location.search);
    const visualDirectionReview = params.get('visualDirection') === '1';
    const interfaceStyleReview = params.get('interfaceStyle') === '1';
    const destination = interfaceStyleReview ? 'InterfaceStyle' : visualDirectionReview ? 'VisualDirection' : 'Title';
    transitionTo(this, destination, { duration: 0 });
  }
}
