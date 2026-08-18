import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
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
    if (new URLSearchParams(globalThis.location.search).get('combatPlaytest') === '1') {
      transitionTo(this, 'CombatPlaytest', { duration: 0 });
      return;
    }

    this.cameras.main.setBackgroundColor(PALETTE.sky);
    fadeIn(this);
    this.drawBackdrop();

    this.add.text(54, 47, t('title.logo.top'), {
      ...TEXT.title,
      fontSize: '82px',
      color: '#fff2bd',
      stroke: '#392c35',
      strokeThickness: 10,
      shadow: { offsetX: 5, offsetY: 6, color: '#ff78ad', blur: 0, fill: true },
    }).setLetterSpacing(-5).setRotation(-0.015);
    this.add.text(50, 117, t('title.logo.bottom'), {
      ...TEXT.title,
      fontSize: '104px',
      color: '#d8f64b',
      stroke: '#392c35',
      strokeThickness: 11,
      shadow: { offsetX: 6, offsetY: 7, color: '#73439a', blur: 0, fill: true },
    }).setLetterSpacing(-6).setRotation(0.012);

    this.add.text(64, 244, t('title.tagline'), {
      ...TEXT.mono,
      fontSize: '12px',
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 9, y: 6 },
    }).setRotation(-0.012);
    this.add.text(67, 286, t('title.refunds'), {
      ...TEXT.body,
      fontSize: '17px',
      fontStyle: 'italic',
      color: '#5a365f',
    });

    this.semanticInput = new SemanticInput(this);
    const controls = [];
    const x = 214;
    controls.push(addButton(this, x, 374, 310, t('title.newGame'), () => {
      clearSave();
      transitionTo(this, 'Intro');
    }, { accent: PALETTE.acid }));
    if (hasSave()) {
      controls.push(addButton(this, x, 424, 310, t('title.continue'), () => {
        loadGame();
        transitionTo(this, 'Lab');
      }, { accent: PALETTE.candy }));
    }
    this.menu = new FocusMenu(this.semanticInput, controls, 'vertical');

    this.add.text(GAME_WIDTH - 24, GAME_HEIGHT - 16, t('title.version'), {
      ...TEXT.mono,
      fontSize: '9px',
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 7, y: 4 },
    }).setOrigin(1, 1);
  }

  update(): void {
    this.menu?.update();
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();

    // Sky, rolling grass and aggressively cheerful flowers.
    g.fillStyle(PALETTE.sky, 1); g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xffffff, 0.82);
    this.cloud(g, 152, 72, 1.05);
    this.cloud(g, 760, 68, 0.85);
    g.fillStyle(PALETTE.yolk, 0.95); g.fillCircle(850, 88, 42);

    g.fillStyle(PALETTE.grassLight, 1); g.fillEllipse(200, 548, 820, 290);
    g.fillStyle(PALETTE.grass, 1); g.fillEllipse(710, 570, 940, 330);
    g.fillStyle(PALETTE.mossDark, 0.3); g.fillEllipse(790, 570, 570, 165);

    for (let i = 0; i < 28; i += 1) {
      const x = 32 + ((i * 79) % 890);
      const y = 387 + ((i * 31) % 128);
      const colour = [PALETTE.candy, PALETTE.yolk, PALETTE.bruise, PALETTE.acid][i % 4];
      g.fillStyle(colour, 0.94);
      g.fillCircle(x - 3, y, 4); g.fillCircle(x + 3, y, 4); g.fillCircle(x, y - 3, 4); g.fillCircle(x, y + 3, 4);
      g.fillStyle(PALETTE.bone, 1); g.fillCircle(x, y, 2);
    }

    // Wonky farm fence so the title reads as a place rather than a UI panel.
    g.lineStyle(6, 0xffe4a3, 1);
    for (let x = 430; x < 930; x += 74) {
      g.lineBetween(x, 344, x - 6, 463);
    }
    g.lineBetween(414, 373, 940, 392);
    g.lineBetween(410, 421, 934, 441);
    g.lineStyle(2, PALETTE.inkDark, 0.48);
    g.lineBetween(414, 373, 940, 392);
    g.lineBetween(410, 421, 934, 441);

    // The thing in the meadow: cute silhouette, wrong number of limbs, wet-lab eye.
    g.fillStyle(PALETTE.bruise, 1); g.lineStyle(6, PALETTE.inkDark, 0.9);
    g.fillEllipse(710, 322, 194, 112); g.strokeEllipse(710, 322, 194, 112);
    g.fillCircle(795, 283, 54); g.strokeCircle(795, 283, 54);
    g.fillStyle(PALETTE.candy, 1); g.fillEllipse(816, 277, 35, 27); g.strokeEllipse(816, 277, 35, 27);
    g.fillStyle(PALETTE.inkDark, 1); g.fillCircle(821, 274, 8);
    g.fillStyle(PALETTE.acid, 1); g.fillCircle(823, 272, 3);

    g.lineStyle(15, PALETTE.bruise, 1);
    g.lineBetween(656, 352, 632, 410); g.lineBetween(690, 361, 680, 425);
    g.lineBetween(735, 359, 748, 423); g.lineBetween(768, 347, 790, 405);
    g.lineBetween(682, 344, 600, 379); // extra limb, obviously medically regrettable
    g.lineStyle(6, PALETTE.inkDark, 0.9);
    g.lineBetween(656, 352, 632, 410); g.lineBetween(690, 361, 680, 425);
    g.lineBetween(735, 359, 748, 423); g.lineBetween(768, 347, 790, 405);
    g.lineBetween(682, 344, 600, 379);

    // Translucent specimen tube grafted into its back.
    g.fillStyle(0x55dce1, 0.64); g.fillRoundedRect(676, 245, 37, 83, 15);
    g.lineStyle(5, PALETTE.inkDark, 0.84); g.strokeRoundedRect(676, 245, 37, 83, 15);
    g.fillStyle(PALETTE.acid, 0.8); g.fillCircle(695, 300, 13);
    g.lineStyle(5, PALETTE.rust, 0.9); g.lineBetween(695, 247, 680, 210); g.lineBetween(680, 210, 654, 202);
  }

  private cloud(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    g.fillCircle(x, y, 27 * scale);
    g.fillCircle(x + 30 * scale, y + 3 * scale, 21 * scale);
    g.fillCircle(x - 28 * scale, y + 7 * scale, 19 * scale);
    g.fillRoundedRect(x - 46 * scale, y + 3 * scale, 93 * scale, 27 * scale, 13 * scale);
  }
}
