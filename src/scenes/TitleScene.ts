import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { addNoiseLines } from '../ui/helpers.js';
import { addButton, FocusMenu } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { clearSave, hasSave, loadGame } from '../systems/saveSystem.js';

export class TitleScene extends Phaser.Scene {
  private semanticInput!: SemanticInput;
  private menu!: FocusMenu;

  constructor() { super('Title'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    fadeIn(this);
    this.drawBackdrop();
    addNoiseLines(this, 140, 0.08);

    this.add.text(66, 77, t('title.logo.top'), { ...TEXT.title, fontSize: '94px', color: '#e8dfc8' }).setLetterSpacing(-5);
    this.add.text(65, 158, t('title.logo.bottom'), { ...TEXT.title, fontSize: '112px', color: '#b7c86c' }).setLetterSpacing(-6);
    this.add.text(70, 282, t('title.tagline'), { ...TEXT.mono, fontSize: '12px', color: '#a0573d' });
    this.add.text(70, 307, t('title.refunds'), { ...TEXT.body, fontSize: '18px', fontStyle: 'italic', color: '#a79d88' });

    this.semanticInput = new SemanticInput(this);
    const controls = [];
    const x = 755;
    controls.push(addButton(this, x, 354, 280, t('title.newGame'), () => {
      clearSave();
      transitionTo(this, 'Intro');
    }, { accent: PALETTE.acid }));
    if (hasSave()) {
      controls.push(addButton(this, x, 410, 280, t('title.continue'), () => {
        loadGame();
        transitionTo(this, 'Lab');
      }, { accent: PALETTE.moss }));
    }
    this.menu = new FocusMenu(this.semanticInput, controls, 'vertical');

    this.add.text(GAME_WIDTH - 24, GAME_HEIGHT - 18, t('title.version'), { ...TEXT.mono, fontSize: '10px' }).setOrigin(1, 1);
  }

  update(): void {
    this.menu.update();
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
