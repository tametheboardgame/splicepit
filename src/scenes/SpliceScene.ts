import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { gameState } from '../state/GameState.js';
import { calculateSplice, attemptSplice } from '../systems/spliceSystem.js';
import { saveGame } from '../systems/saveSystem.js';
import { addNoiseLines, wrappedText } from '../ui/helpers.js';
import { addButton, addPanel, FocusMenu } from '../ui/primitives.js';
import type { FocusableControl } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';
import { drawCreature } from '../render/CreatureRenderer.js';

interface GeneCard extends FocusableControl {
  id: string;
  tick: Phaser.GameObjects.Rectangle;
  bg: Phaser.GameObjects.Rectangle;
  focused: boolean;
}

export class SpliceScene extends Phaser.Scene {
  selected = new Set<string>();
  cards: GeneCard[] = [];
  previewPanel!: Phaser.GameObjects.Graphics;
  previewTitle!: Phaser.GameObjects.Text;
  previewStats!: Phaser.GameObjects.Text;
  previewRisk!: Phaser.GameObjects.Text;
  creatureContainer: Phaser.GameObjects.Container | null = null;
  resultText!: Phaser.GameObjects.Text;
  semanticInput!: SemanticInput;
  menu!: FocusMenu;

  constructor() { super('Splice'); }

  create(): void {
    this.selected = new Set(gameState.currentCreature?.genes ?? []);
    this.cards = [];
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    fadeIn(this);
    this.drawMachine(); addNoiseLines(this, 90, 0.055);
    this.add.text(48, 35, t('splice.eyebrow'), { ...TEXT.mono, fontSize: '12px', color: '#a0573d' });
    this.add.text(48, 61, t('splice.title'), { ...TEXT.title, fontSize: '36px' });
    wrappedText(this, 48, 108, t('splice.instructions'), 455, { fontSize: '16px' });

    this.semanticInput = new SemanticInput(this);
    gameState.collectedGenes.forEach((id, index) => this.createGeneCard(id, 48, 200 + index * 66));
    this.previewPanel = addPanel(this, 560, 45, 355, 430, 0.94);
    this.previewTitle = this.add.text(585, 68, '', { ...TEXT.title, fontSize: '25px' });
    this.previewStats = this.add.text(585, 122, '', { ...TEXT.mono, fontSize: '12px', lineSpacing: 7 });
    this.previewRisk = wrappedText(this, 585, 255, '', 290, { fontSize: '16px' });
    this.creatureContainer = null;
    const attemptButton = addButton(this, 710, 445, 260, t('splice.attempt'), () => this.splice(), { accent: PALETTE.acid });
    const returnButton = addButton(this, 170, 500, 240, t('splice.return'), () => transitionTo(this, 'Lab'), { accent: PALETTE.rust });
    this.resultText = this.add.text(330, 483, '', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c', wordWrap: { width: 340 } });
    this.menu = new FocusMenu(this.semanticInput, [...this.cards, attemptButton, returnButton], 'vertical');
    this.refresh();
  }

  update(): void {
    this.menu.update();
  }

  private drawMachine(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.paper, 0.7); g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(PALETTE.paperDeep, 0.82); g.fillRect(25, 185, 490, 275);
    g.lineStyle(2, PALETTE.bone, 0.22); g.strokeRect(25, 185, 490, 275);
    g.lineStyle(6, PALETTE.bruise, 0.22); g.lineBetween(500, 0, 575, 540); g.lineBetween(530, 0, 605, 540);
    for (let i = 0; i < 8; i += 1) { g.fillStyle(i % 2 ? PALETTE.rustDark : PALETTE.mossDark, 0.25); g.fillCircle(755 + Math.sin(i) * 90, 220 + i * 30, 45 + i * 2); }
  }

  private createGeneCard(id: string, x: number, y: number): void {
    const gene = GENES[id];
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 468, 54, PALETTE.paperDeep, 0.94).setOrigin(0).setStrokeStyle(1, PALETTE.bone, 0.25);
    const tick = this.add.rectangle(18, 27, 22, 22, PALETTE.mossDark, 1).setStrokeStyle(2, PALETTE.bone, 0.6);
    const name = this.add.text(38, 10, gene.name, { ...TEXT.body, fontSize: '17px' });
    const meta = this.add.text(38, 32, t('splice.cardMeta', { source: gene.source.toUpperCase(), complexity: gene.complexity }), { ...TEXT.mono, fontSize: '9px' });
    container.add([bg, tick, name, meta]);
    container.setSize(468, 54).setInteractive(new Phaser.Geom.Rectangle(0, 0, 468, 54), Phaser.Geom.Rectangle.Contains);

    let focusRequester: (() => void) | undefined;
    let enabled = true;
    const card: GeneCard = {
      id,
      tick,
      bg,
      focused: false,
      setFocused: (focused: boolean): void => { card.focused = focused; this.renderCard(card); },
      activate: (): void => { if (!enabled) return; this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id); this.refresh(); },
      setFocusRequester: (requester: (() => void) | undefined): void => { focusRequester = requester; },
      setVisible: (visible: boolean): void => { container.setVisible(visible); },
      setEnabled: (value: boolean): void => { enabled = value; if (value) container.setInteractive(new Phaser.Geom.Rectangle(0, 0, 468, 54), Phaser.Geom.Rectangle.Contains); else container.disableInteractive(); container.setAlpha(value ? 1 : 0.48); },
    };

    container.on('pointerover', () => focusRequester?.());
    container.on('pointerdown', () => card.activate());
    this.cards.push(card);
  }

  private renderCard(card: GeneCard): void {
    const selected = this.selected.has(card.id);
    card.tick.setFillStyle(selected ? PALETTE.acid : PALETTE.mossDark, selected ? 0.95 : 1);
    if (card.focused) card.bg.setStrokeStyle(3, PALETTE.bone, 1);
    else card.bg.setStrokeStyle(selected ? 2 : 1, selected ? PALETTE.acid : PALETTE.bone, selected ? 0.8 : 0.25);
  }

  private refresh(): void {
    this.cards.forEach((card) => this.renderCard(card));
    const genes = [...this.selected];
    const baseAnimalId = gameState.baseAnimalId;
    if (!baseAnimalId) throw new Error('Splice scene requires a base animal.');
    const plan = calculateSplice(baseAnimalId, genes);
    this.previewTitle.setText(t('splice.previewTitle', {
      base: BASE_ANIMALS[baseAnimalId].name,
      count: genes.length,
      geneWord: t(genes.length === 1 ? 'splice.geneSingular' : 'splice.genePlural'),
    }));
    this.previewStats.setText(t('splice.previewStats', {
      chance: plan.chance,
      complexity: plan.complexity,
      hp: plan.stats.maxHp,
      attack: plan.stats.attack,
      defence: plan.stats.defence,
      speed: plan.stats.speed,
      stability: plan.stats.stability,
    }));
    this.previewRisk.setText(genes.length === 0 ? t('splice.risk.none') : plan.chance >= 75 ? t('splice.risk.reasonable') : t('splice.risk.high'));
    if (this.creatureContainer) this.creatureContainer.destroy();
    this.creatureContainer = drawCreature(this, 790, 360, { genes, mutation: null }, { scale: 0.63 });
  }

  splice(): void {
    const genes = [...this.selected];
    if (genes.length === 0) { this.resultText.setText(t('splice.selectGene')); return; }
    const baseAnimalId = gameState.baseAnimalId;
    if (!baseAnimalId) throw new Error('Splice scene requires a base animal.');
    const result = attemptSplice(baseAnimalId, genes);
    if (!result.success) {
      this.resultText.setText(t('splice.failed', { roll: Math.round(result.roll), chance: result.chance, message: result.message }));
      this.cameras.main.shake(180, 0.008);
      return;
    }
    gameState.setCreature(result.creature); saveGame();
    this.resultText.setText(t('splice.success', { message: result.message, name: result.creature.name }));
    this.cameras.main.flash(220, 183, 200, 108, false);
    this.time.delayedCall(900, () => transitionTo(this, 'Lab'));
  }
}
