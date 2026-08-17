import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { addButton, addNoiseLines, wrappedText } from '../ui/helpers.js';
import { gameState } from '../state/GameState.js';

export class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }

  create(): void {
    this.cameras.main.setBackgroundColor(0x12110f);
    this.drawAftermath();
    addNoiseLines(this, 100, 0.07);

    this.add.text(60, 56, 'AFTER THE GAS', { ...TEXT.mono, fontSize: '13px', color: '#a0573d' });
    this.add.text(60, 84, 'Morning finds the pit quiet.', { ...TEXT.title, fontSize: '40px' });
    wrappedText(this, 60, 151,
      'The rampaging splice is dead. So is your SpliceMaster. So are the other apprentices. The emergency gas did exactly what it was meant to do, eventually.\n\nYou are still alive. Which leaves the damaged pit, its remaining equipment and every unpaid bill in your hands.',
      525, { fontSize: '20px', lineSpacing: 8 });

    this.add.text(60, 400, 'FIRST JOB', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c' });
    this.add.text(60, 422, 'Obtain a clean base animal.', { ...TEXT.title, fontSize: '26px' });
    addButton(this, GAME_WIDTH - 176, GAME_HEIGHT - 62, 260, 'OPEN THE DOOR', () => {
      gameState.seenIntro = true;
      this.scene.start('Lab');
    }, { accent: PALETTE.rust });
  }

  private drawAftermath(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.paper, 0.88); g.fillRect(625, 0, 335, 540);
    g.fillStyle(PALETTE.bruiseDark, 0.5); g.fillEllipse(792, 238, 250, 145);
    g.fillStyle(PALETTE.mossDark, 0.55); g.fillEllipse(808, 225, 170, 103);
    g.lineStyle(5, PALETTE.bone, 0.4);
    g.lineBetween(680, 82, 897, 410); g.lineBetween(905, 72, 706, 432);
    g.lineStyle(2, PALETTE.rust, 0.55);
    for (let i = 0; i < 12; i += 1) {
      const x = 650 + Math.random() * 270; const y = 35 + Math.random() * 450;
      g.lineBetween(x, y, x + (Math.random() - .5) * 70, y + (Math.random() - .5) * 70);
    }
    g.fillStyle(PALETTE.blood, 0.35); g.fillEllipse(785, 345, 120, 32);
  }
}
