import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';
import { gameState } from '../state/GameState.js';
import { calculateSplice, attemptSplice } from '../systems/spliceSystem.js';
import { saveGame } from '../systems/saveSystem.js';
import { addButton, addNoiseLines, addPaperPanel, wrappedText } from '../ui/helpers.js';
import { drawCreature } from '../render/CreatureRenderer.js';

interface GeneCard {
  id: string;
  tick: Phaser.GameObjects.Rectangle;
  bg: Phaser.GameObjects.Rectangle;
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

  constructor() { super('Splice'); }

  create(): void {
    this.selected = new Set(gameState.currentCreature?.genes ?? []);
    this.cards = [];
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    this.drawMachine(); addNoiseLines(this, 90, 0.055);
    this.add.text(48, 35, 'SPLICE BENCH / MANUAL MODE', { ...TEXT.mono, fontSize: '12px', color: '#a0573d' });
    this.add.text(48, 61, 'Make something viable.', { ...TEXT.title, fontSize: '36px' });
    wrappedText(this, 48, 108, 'Select any recovered genes. More complex combinations are less likely to hold and more likely to mutate. There is no designed combination limit; the risk curve is the constraint.', 455, { fontSize: '16px' });

    gameState.collectedGenes.forEach((id, index) => this.createGeneCard(id, 48, 200 + index * 66));
    this.previewPanel = addPaperPanel(this, 560, 45, 355, 430, 0.94);
    this.previewTitle = this.add.text(585, 68, '', { ...TEXT.title, fontSize: '25px' });
    this.previewStats = this.add.text(585, 122, '', { ...TEXT.mono, fontSize: '12px', lineSpacing: 7 });
    this.previewRisk = wrappedText(this, 585, 255, '', 290, { fontSize: '16px' });
    this.creatureContainer = null;
    addButton(this, 710, 445, 260, 'ATTEMPT SPLICE', () => this.splice(), { accent: PALETTE.acid });
    addButton(this, 170, 500, 240, 'RETURN TO PIT', () => this.scene.start('Lab'), { accent: PALETTE.rust });
    this.resultText = this.add.text(330, 483, '', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c', wordWrap: { width: 340 } });
    this.refresh();
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
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 468, 54, PALETTE.paperDeep, 0.94).setOrigin(0).setStrokeStyle(1, PALETTE.bone, 0.25);
    const tick = this.add.rectangle(18, 27, 22, 22, PALETTE.mossDark, 1).setStrokeStyle(2, PALETTE.bone, 0.6);
    const name = this.add.text(38, 10, gene.name, { ...TEXT.body, fontSize: '17px' });
    const meta = this.add.text(38, 32, `SOURCE ${gene.source.toUpperCase()}  |  COMPLEXITY ${gene.complexity}`, { ...TEXT.mono, fontSize: '9px' });
    c.add([bg, tick, name, meta]);
    c.setSize(468, 54).setInteractive(new Phaser.Geom.Rectangle(0, 0, 468, 54), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => { this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id); this.refresh(); });
    this.cards.push({ id, tick, bg });
  }

  private refresh(): void {
    this.cards.forEach(({ id, tick, bg }) => {
      const on = this.selected.has(id);
      tick.setFillStyle(on ? PALETTE.acid : PALETTE.mossDark, on ? 0.95 : 1);
      bg.setStrokeStyle(1, on ? PALETTE.acid : PALETTE.bone, on ? 0.8 : 0.25);
    });
    const genes = [...this.selected];
    const baseAnimalId = gameState.baseAnimalId;
    if (!baseAnimalId) throw new Error('Splice scene requires a base animal.');
    const plan = calculateSplice(baseAnimalId, genes);
    this.previewTitle.setText(`${BASE_ANIMALS[baseAnimalId].name} + ${genes.length} gene${genes.length === 1 ? '' : 's'}`);
    this.previewStats.setText([
      `VIABILITY       ${plan.chance}%`, `COMPLEXITY      ${plan.complexity}`, '',
      `HP              ${plan.stats.maxHp}`, `ATTACK          ${plan.stats.attack}`, `DEFENCE         ${plan.stats.defence}`, `SPEED           ${plan.stats.speed}`, `STABILITY       ${plan.stats.stability}%`,
    ].join('\n'));
    this.previewRisk.setText(genes.length === 0 ? 'A rabbit remains, disappointingly, a rabbit.' : plan.chance >= 75 ? 'Reasonable chance of a clean hold. Mutation remains possible.' : 'The bench recommends fewer genes. The bench has never owned a Fit Pit.');
    if (this.creatureContainer) this.creatureContainer.destroy();
    this.creatureContainer = drawCreature(this, 790, 360, { genes, mutation: null }, { scale: 0.63 });
  }

  splice(): void {
    const genes = [...this.selected];
    if (genes.length === 0) { this.resultText.setText('Select at least one gene.'); return; }
    const baseAnimalId = gameState.baseAnimalId;
    if (!baseAnimalId) throw new Error('Splice scene requires a base animal.');
    const result = attemptSplice(baseAnimalId, genes);
    if (!result.success) {
      this.resultText.setText(`FAILED (${Math.round(result.roll)} / ${result.chance}). ${result.message}`);
      this.cameras.main.shake(180, 0.008);
      return;
    }
    gameState.setCreature(result.creature); saveGame();
    this.resultText.setText(`VIABLE. ${result.message} Creature logged as ${result.creature.name}.`);
    this.cameras.main.flash(220, 183, 200, 108, false);
    this.time.delayedCall(900, () => this.scene.start('Lab'));
  }
}
