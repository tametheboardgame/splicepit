import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { addButton, addNoiseLines } from '../ui/helpers.js';
import { clearSave, hasSave, loadGame } from '../systems/saveSystem.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    this.drawBackdrop();
    addNoiseLines(this, 140, 0.08);

    this.add.text(66, 77, 'SPLICE', { ...TEXT.title, fontSize: '94px', color: '#e8dfc8' }).setLetterSpacing(-5);
    this.add.text(65, 158, 'PIT', { ...TEXT.title, fontSize: '112px', color: '#b7c86c' }).setLetterSpacing(-6);
    this.add.text(70, 282, 'A SMALL BUSINESS IN CREATIVE BIOLOGY', { ...TEXT.mono, fontSize: '12px', color: '#a0573d' });
    this.add.text(70, 307, 'No refunds for viable tissue.', { ...TEXT.body, fontSize: '18px', fontStyle: 'italic', color: '#a79d88' });

    const x = 755;
    addButton(this, x, 354, 280, 'NEW GAME', () => { clearSave(); this.scene.start('Intro'); }, { accent: PALETTE.acid });
    if (hasSave()) {
      addButton(this, x, 410, 280, 'CONTINUE', () => { loadGame(); this.scene.start('Lab'); }, { accent: PALETTE.moss });
    }

    this.add.text(GAME_WIDTH - 24, GAME_HEIGHT - 18, 'R0.1 / PROTOTYPE CANON', { ...TEXT.mono, fontSize: '10px' }).setOrigin(1, 1);
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.mossDark, 0.28); g.fillCircle(780, 120, 190);
    g.lineStyle(4, PALETTE.bone, 0.26);
    g.strokeEllipse(766, 142, 270, 180);
    g.strokeEllipse(802, 128, 250, 172);
    g.lineStyle(10, PALETTE.bruise, 0.28);
    for (let i = 0; i < 7; i += 1) {
      const y = 28 + i * 39;
      g.lineBetween(642 + i * 7, y, 879 - i * 4, y + 42);
    }
    g.fillStyle(PALETTE.paper, 0.85); g.fillRect(610, 322, 325, 154);
    g.lineStyle(2, PALETTE.rust, 0.65); g.strokeRect(610, 322, 325, 154);
  }
}
