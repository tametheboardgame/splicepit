import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { dialogueText } from '../dialogue/catalogue.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { gameState } from '../state/GameState.js';
import { addNoiseLines, wrappedText } from '../ui/helpers.js';
import { addButton, FocusMenu } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

export class IntroScene extends Phaser.Scene {
  private semanticInput!: SemanticInput;
  private menu!: FocusMenu;

  constructor() { super('Intro'); }

  create(): void {
    this.cameras.main.setBackgroundColor(0x12110f);
    fadeIn(this);
    this.drawAftermath();
    addNoiseLines(this, 100, 0.07);

    this.add.text(60, 56, t('intro.eyebrow'), { ...TEXT.mono, fontSize: '13px', color: '#a0573d' });
    this.add.text(60, 84, t('intro.title'), { ...TEXT.title, fontSize: '40px' });
    wrappedText(this, 60, 151, dialogueText('intro_aftermath'), 525, { fontSize: '20px', lineSpacing: 8 });

    this.add.text(60, 400, t('intro.firstJob'), { ...TEXT.mono, fontSize: '11px', color: '#b7c86c' });
    this.add.text(60, 422, t('intro.objective'), { ...TEXT.title, fontSize: '26px' });

    this.semanticInput = new SemanticInput(this);
    const openDoor = addButton(this, GAME_WIDTH - 176, GAME_HEIGHT - 62, 260, t('intro.openDoor'), () => {
      gameState.seenIntro = true;
      transitionTo(this, 'Lab');
    }, { accent: PALETTE.rust });
    this.menu = new FocusMenu(this.semanticInput, [openDoor], 'vertical');
  }

  update(): void {
    this.menu.update();
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
