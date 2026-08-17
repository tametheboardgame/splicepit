import Phaser from 'phaser';
import { TILE, PALETTE, TEXT } from '../config.js';
import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';
import { dialogueText } from '../dialogue/catalogue.js';
import { ACTIONS } from '../input/actions.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import { createDialogueBox, addPanel } from '../ui/primitives.js';
import type { DialogueBoxHandle } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';
import type { QuestStage } from '../types.js';

const COLS = 15;
const ROWS = 10;
const WORLD_X = 24;
const WORLD_Y = 30;

const MAP = [
  '###############',
  '#.....#.......#',
  '#..S..#...G...#',
  '#.....#.......#',
  '#.....###.#####',
  '#.............#',
  '#..R......B...#',
  '#.............#',
  '#..........P..#',
  '###############',
] as const;

interface GridPoint { x: number; y: number }
interface Interactable {
  gx: number;
  gy: number;
  name: string;
  action: () => void;
  plate: Phaser.GameObjects.Rectangle;
}

export class LabScene extends Phaser.Scene {
  blocked = false;
  moving = false;
  interactables: Interactable[] = [];
  playerGrid: GridPoint = { x: 2, y: 5 };
  player!: Phaser.GameObjects.Container;
  hudPanel!: Phaser.GameObjects.Graphics;
  objectiveText!: Phaser.GameObjects.Text;
  statusText!: Phaser.GameObjects.Text;
  promptBg!: Phaser.GameObjects.Rectangle;
  promptText!: Phaser.GameObjects.Text;
  messageBox!: DialogueBoxHandle;
  semanticInput!: SemanticInput;

  constructor() { super('Lab'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    fadeIn(this);
    this.blocked = false;
    this.moving = false;
    this.interactables = [];
    this.playerGrid = { x: 2, y: 5 };
    this.semanticInput = new SemanticInput(this);
    this.drawWorld();
    this.createInteractables();
    this.createPlayer();
    this.createHud();
    this.updateHud();
    saveGame();
  }

  private drawWorld(): void {
    const g = this.add.graphics();
    g.fillStyle(0x141713, 1); g.fillRect(WORLD_X, WORLD_Y, COLS * TILE, ROWS * TILE);
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const px = WORLD_X + x * TILE; const py = WORLD_Y + y * TILE;
        const wall = MAP[y][x] === '#';
        g.fillStyle(wall ? PALETTE.paper : ((x + y) % 2 ? 0x30352b : 0x2d3229), 1);
        g.fillRect(px, py, TILE, TILE);
        g.lineStyle(1, wall ? PALETTE.bone : PALETTE.moss, wall ? 0.16 : 0.08);
        g.strokeRect(px, py, TILE, TILE);
        if (!wall && Math.random() > 0.72) {
          g.lineStyle(1, PALETTE.bone, 0.06); g.lineBetween(px + 6, py + 14, px + 40, py + 18);
        }
      }
    }

    g.lineStyle(4, PALETTE.rustDark, 0.55);
    g.lineBetween(WORLD_X + 2 * TILE, WORLD_Y + 2 * TILE, WORLD_X + 4 * TILE, WORLD_Y + 3 * TILE);
    g.lineBetween(WORLD_X + 9 * TILE, WORLD_Y + 4 * TILE, WORLD_X + 11 * TILE, WORLD_Y + 5 * TILE);
    g.fillStyle(PALETTE.moss, 0.25);
    for (let i = 0; i < 18; i += 1) g.fillCircle(WORLD_X + 360 + Math.random() * 280, WORLD_Y + 265 + Math.random() * 160, 3 + Math.random() * 7);
  }

  private createInteractables(): void {
    this.addObject(3, 2, t('lab.object.spliceBench'), 'S', PALETTE.bruise, () => this.useSpliceBench());
    this.addObject(10, 2, t('lab.object.geneCabinet'), 'G', PALETTE.acid, () => this.useGeneCabinet());
    this.addObject(3, 6, t('lab.object.animalPen'), 'R', PALETTE.moss, () => this.useAnimalPen());
    this.addObject(9, 6, t('lab.object.noticeBoard'), 'B', PALETTE.rust, () => this.useNoticeBoard());
    this.addObject(11, 8, t('lab.object.fitPitGate'), 'P', PALETTE.blood, () => this.useFitPit());
  }

  private addObject(gx: number, gy: number, name: string, mark: string, colour: number, action: () => void): void {
    const x = WORLD_X + gx * TILE + TILE / 2; const y = WORLD_Y + gy * TILE + TILE / 2;
    const plate = this.add.rectangle(x, y, TILE - 10, TILE - 10, colour, 0.68).setStrokeStyle(2, PALETTE.bone, 0.55);
    this.add.text(x, y, mark, { ...TEXT.mono, fontSize: '18px', color: '#181512' }).setOrigin(0.5);
    this.interactables.push({ gx, gy, name, action, plate });
  }

  private createPlayer(): void {
    const p = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(PALETTE.bone, 1); g.lineStyle(2, PALETTE.inkDark, 1);
    g.fillCircle(0, -9, 8); g.strokeCircle(0, -9, 8);
    g.fillStyle(PALETTE.rust, 1); g.fillRoundedRect(-9, -1, 18, 22, 5); g.strokeRoundedRect(-9, -1, 18, 22, 5);
    g.lineStyle(3, PALETTE.bone, 1); g.lineBetween(-5, 19, -7, 29); g.lineBetween(5, 19, 7, 29);
    p.add(g); this.player = p; this.snapPlayer();
  }

  private createHud(): void {
    this.hudPanel = addPanel(this, 760, 30, 176, 480, 0.97);
    this.add.text(780, 50, t('lab.ledger'), { ...TEXT.mono, fontSize: '11px', color: '#a0573d' });
    this.objectiveText = this.add.text(780, 89, '', { ...TEXT.body, fontSize: '15px', lineSpacing: 3, wordWrap: { width: 137, useAdvancedWrap: true } });
    this.statusText = this.add.text(780, 278, '', { ...TEXT.mono, fontSize: '11px', lineSpacing: 7, wordWrap: { width: 140 } });
    this.promptBg = this.add.rectangle(390, 486, 610, 42, PALETTE.paperDeep, 0.9).setStrokeStyle(1, PALETTE.bone, 0.25);
    this.promptText = this.add.text(390, 486, '', { ...TEXT.mono, fontSize: '12px' }).setOrigin(0.5);
    this.messageBox = createDialogueBox(this, 70, 356, 620, 125);
    this.messageBox.setPrompt(`[${this.semanticInput.hint(ACTIONS.CANCEL)} / ${this.semanticInput.hint(ACTIONS.CONFIRM)}]`);
  }

  update(): void {
    if (this.blocked) {
      if (this.semanticInput.justDown(ACTIONS.LAB_CANCEL) || this.semanticInput.justDown(ACTIONS.CONFIRM)) this.closeMessage();
      return;
    }

    const directions: Array<[typeof ACTIONS.MOVE_UP | typeof ACTIONS.MOVE_DOWN | typeof ACTIONS.MOVE_LEFT | typeof ACTIONS.MOVE_RIGHT, number, number]> = [
      [ACTIONS.MOVE_UP, 0, -1],
      [ACTIONS.MOVE_DOWN, 0, 1],
      [ACTIONS.MOVE_LEFT, -1, 0],
      [ACTIONS.MOVE_RIGHT, 1, 0],
    ];
    for (const [action, dx, dy] of directions) {
      if (this.semanticInput.justDown(action)) { this.move(dx, dy); break; }
    }
    if (this.semanticInput.justDown(ACTIONS.LAB_INTERACT)) this.interact();
    this.updatePrompt();
  }

  private move(dx: number, dy: number): void {
    if (this.moving) return;
    const nx = this.playerGrid.x + dx; const ny = this.playerGrid.y + dy;
    if (MAP[ny]?.[nx] === '#') { this.cameras.main.shake(60, 0.002); return; }
    this.playerGrid = { x: nx, y: ny }; this.moving = true;
    this.tweens.add({ targets: this.player, x: WORLD_X + nx * TILE + TILE / 2, y: WORLD_Y + ny * TILE + TILE / 2 + 3, duration: 105, ease: 'Sine.easeInOut', onComplete: () => { this.moving = false; } });
  }

  private snapPlayer(): void { this.player.setPosition(WORLD_X + this.playerGrid.x * TILE + TILE / 2, WORLD_Y + this.playerGrid.y * TILE + TILE / 2 + 3); }

  private nearby(): Interactable | undefined {
    return this.interactables.find((o) => Math.abs(o.gx - this.playerGrid.x) + Math.abs(o.gy - this.playerGrid.y) <= 1);
  }

  private interact(): void { const object = this.nearby(); if (object) object.action(); }

  private updatePrompt(): void {
    const object = this.nearby();
    this.promptText.setText(object ? t('lab.prompt.interact', { control: this.semanticInput.hint(ACTIONS.LAB_INTERACT), name: object.name }) : '');
    this.promptBg.setVisible(Boolean(object));
  }

  useAnimalPen(): void {
    if (gameState.hasBaseAnimal) { this.showMessage(t('lab.object.animalPen'), dialogueText('lab_animal_already')); return; }
    gameState.acquireAnimal('rabbit'); saveGame(); this.updateHud();
    this.showMessage(t('lab.message.animalAcquiredTitle'), dialogueText('lab_animal_acquired', { name: BASE_ANIMALS.rabbit.name, description: BASE_ANIMALS.rabbit.description }));
  }

  useGeneCabinet(): void {
    const candidates = ['gecko_regeneration', 'boar_muscle', 'moth_sense'];
    const next = candidates.find((id) => !gameState.collectedGenes.includes(id));
    if (!gameState.hasBaseAnimal) { this.showMessage(t('lab.object.geneCabinet'), dialogueText('lab_need_base_for_genes')); return; }
    if (!next) { this.showMessage(t('lab.object.geneCabinet'), dialogueText('lab_no_genes_left')); return; }
    gameState.addGene(next); saveGame(); this.updateHud();
    this.showMessage(t('lab.message.geneRecoveredTitle'), dialogueText('lab_gene_recovered', { name: GENES[next].name, description: GENES[next].description }));
  }

  useSpliceBench(): void {
    if (!gameState.hasBaseAnimal) { this.showMessage(t('lab.object.spliceBench'), dialogueText('lab_no_base_at_bench')); return; }
    if (gameState.collectedGenes.length === 0) { this.showMessage(t('lab.object.spliceBench'), dialogueText('lab_no_genes_at_bench')); return; }
    transitionTo(this, 'Splice');
  }

  useFitPit(): void {
    if (!gameState.currentCreature) { this.showMessage(t('lab.object.fitPitGate'), dialogueText('lab_no_creature_at_gate')); return; }
    transitionTo(this, 'Battle');
  }

  useNoticeBoard(): void {
    this.showMessage(t('lab.object.noticeBoard'), dialogueText('lab_notice_board', { debt: gameState.debt }));
  }

  private showMessage(title: string, body: string): void {
    this.blocked = true;
    this.messageBox.show(title, body);
    this.promptBg.setVisible(false);
    this.promptText.setVisible(false);
  }

  closeMessage(): void {
    this.blocked = false;
    this.messageBox.hide();
    this.promptText.setVisible(true);
    this.updatePrompt();
  }

  private updateHud(): void {
    const objectives: Record<QuestStage, string> = {
      find_animal: t('lab.objective.findAnimal'),
      collect_genes: t('lab.objective.collectGenes'),
      splice: t('lab.objective.splice'),
      fight: t('lab.objective.fight'),
      slice_complete: t('lab.objective.complete'),
    };
    this.objectiveText.setText(objectives[gameState.questStage]);
    const none = t('lab.none');
    const creature = gameState.currentCreature?.name ?? none;
    const base = gameState.baseAnimalId ? BASE_ANIMALS[gameState.baseAnimalId] : undefined;
    this.statusText.setText([
      t('lab.status.cash', { value: gameState.coins }),
      t('lab.status.debt', { value: gameState.debt }),
      t('lab.status.base', { value: gameState.hasBaseAnimal && base ? base.name.toUpperCase() : none }),
      t('lab.status.genes', { value: gameState.collectedGenes.length }),
      t('lab.status.creature', { value: creature.toUpperCase() }),
      t('lab.status.wins', { value: gameState.fitPitWins }),
      '',
      t('lab.autoSave'),
    ].join('\n'));
  }
}
