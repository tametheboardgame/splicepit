import Phaser from 'phaser';
import { TILE, PALETTE, TEXT } from '../config.js';
import { OPENING_BASE_ANIMAL_IDS, OPENING_SOURCE_PACKAGE_IDS } from '../content/biologyCatalog.js';
import { CONTENT_CATALOG } from '../content/contentCatalog.js';
import { BASE_ANIMALS } from '../data/animals.js';
import { dialogueText } from '../dialogue/catalogue.js';
import { ACTIONS } from '../input/actions.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import { addPanel, createDialogueBox } from '../ui/primitives.js';
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

interface SelectionItem {
  id: string;
  name: string;
  description: string;
  recovered?: boolean;
  subline?: string;
}

type SelectionMode = 'animal' | 'source' | null;

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

  selectionMode: SelectionMode = null;
  selectionIndex = 0;
  selectionItems: SelectionItem[] = [];
  selectionObjects: Phaser.GameObjects.GameObject[] = [];
  selectionRows: Array<{ bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }> = [];
  selectionDetail: Phaser.GameObjects.Text | null = null;

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
    g.fillStyle(0x0f110e, 1); g.fillRect(WORLD_X, WORLD_Y, COLS * TILE, ROWS * TILE);

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const px = WORLD_X + x * TILE;
        const py = WORLD_Y + y * TILE;
        const wall = MAP[y][x] === '#';
        if (wall) {
          g.fillStyle(0x24231f, 1); g.fillRect(px, py, TILE, TILE);
          g.fillStyle(0x171713, 1); g.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
          g.lineStyle(1, PALETTE.bone, 0.08); g.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
        } else {
          g.fillStyle(0x252a22, 1); g.fillRect(px, py, TILE, TILE);
          g.lineStyle(1, PALETTE.moss, 0.045); g.strokeRect(px, py, TILE, TILE);
        }
      }
    }

    // Worn floor zones and service markings make the room read as a working lab,
    // rather than a debug tile map.
    g.fillStyle(PALETTE.bruiseDark, 0.16); g.fillRoundedRect(WORLD_X + 48, WORLD_Y + 48, 190, 132, 14);
    g.fillStyle(PALETTE.mossDark, 0.18); g.fillRoundedRect(WORLD_X + 48, WORLD_Y + 258, 230, 146, 14);
    g.fillStyle(PALETTE.rustDark, 0.16); g.fillRoundedRect(WORLD_X + 420, WORLD_Y + 250, 240, 160, 14);
    g.lineStyle(2, PALETTE.acid, 0.16); g.strokeRoundedRect(WORLD_X + 306, WORLD_Y + 52, 338, 120, 10);
    g.lineStyle(2, PALETTE.rust, 0.18); g.lineBetween(WORLD_X + 332, WORLD_Y + 230, WORLD_X + 650, WORLD_Y + 230);

    this.add.text(WORLD_X + 58, WORLD_Y + 55, 'WET LAB / BENCH 01', { ...TEXT.mono, fontSize: '9px', color: '#73516f' });
    this.add.text(WORLD_X + 58, WORLD_Y + 267, 'ANIMAL HOLDING', { ...TEXT.mono, fontSize: '9px', color: '#71845c' });
    this.add.text(WORLD_X + 460, WORLD_Y + 58, 'BIOLOGICAL SOURCE ARCHIVE', { ...TEXT.mono, fontSize: '9px', color: '#b7c86c' });
    this.add.text(WORLD_X + 462, WORLD_Y + 266, 'PIT ADMIN / EXIT', { ...TEXT.mono, fontSize: '9px', color: '#a0573d' });

    // Pipes, drains and old hazard tape.
    g.lineStyle(5, PALETTE.blueGrey, 0.28); g.lineBetween(WORLD_X + 14, WORLD_Y + 214, WORLD_X + 312, WORLD_Y + 214);
    g.lineStyle(2, PALETTE.bone, 0.14);
    for (let i = 0; i < 7; i += 1) {
      const x = WORLD_X + 480 + i * 24;
      g.lineBetween(x, WORLD_Y + 414, x + 14, WORLD_Y + 428);
    }
    g.fillStyle(0x0a0b09, 0.8); g.fillCircle(WORLD_X + 356, WORLD_Y + 353, 16);
    g.lineStyle(1, PALETTE.bone, 0.18); g.strokeCircle(WORLD_X + 356, WORLD_Y + 353, 11);
  }

  private createInteractables(): void {
    this.addObject(3, 2, t('lab.object.spliceBench'), 'bench', PALETTE.bruise, () => this.useSpliceBench());
    this.addObject(10, 2, t('lab.object.geneCabinet'), 'archive', PALETTE.acid, () => this.useGeneCabinet());
    this.addObject(3, 6, t('lab.object.animalPen'), 'pen', PALETTE.moss, () => this.useAnimalPen());
    this.addObject(9, 6, t('lab.object.noticeBoard'), 'board', PALETTE.rust, () => this.useNoticeBoard());
    this.addObject(11, 8, t('lab.object.fitPitGate'), 'gate', PALETTE.blood, () => this.useFitPit());
  }

  private addObject(gx: number, gy: number, name: string, kind: string, colour: number, action: () => void): void {
    const x = WORLD_X + gx * TILE + TILE / 2;
    const y = WORLD_Y + gy * TILE + TILE / 2;
    const plate = this.add.rectangle(x, y, TILE - 4, TILE - 4, colour, 0.03).setStrokeStyle(1, colour, 0.18);
    this.drawFixture(x, y, kind, colour);
    this.interactables.push({ gx, gy, name, action, plate });
  }

  private drawFixture(x: number, y: number, kind: string, colour: number): void {
    const g = this.add.graphics();
    if (kind === 'bench') {
      g.fillStyle(0x171611, 1); g.fillRoundedRect(x - 22, y - 17, 44, 34, 5);
      g.lineStyle(2, colour, 0.85); g.strokeRoundedRect(x - 22, y - 17, 44, 34, 5);
      g.fillStyle(PALETTE.bone, 0.14); g.fillRect(x - 17, y - 10, 34, 5);
      g.fillStyle(PALETTE.bruise, 0.72); g.fillCircle(x - 10, y + 7, 5);
      g.fillStyle(PALETTE.acid, 0.66); g.fillCircle(x + 9, y + 7, 5);
      g.lineStyle(2, PALETTE.blueGrey, 0.65); g.lineBetween(x - 14, y - 16, x - 14, y - 26); g.lineBetween(x + 13, y - 16, x + 13, y - 23);
      return;
    }
    if (kind === 'archive') {
      g.fillStyle(0x151711, 1); g.fillRoundedRect(x - 20, y - 22, 40, 44, 4);
      g.lineStyle(2, colour, 0.7); g.strokeRoundedRect(x - 20, y - 22, 40, 44, 4);
      for (let row = 0; row < 3; row += 1) {
        g.lineStyle(1, PALETTE.bone, 0.16); g.lineBetween(x - 16, y - 11 + row * 11, x + 16, y - 11 + row * 11);
        for (let col = 0; col < 4; col += 1) {
          const vialColour = [PALETTE.acid, PALETTE.rust, PALETTE.bruise, PALETTE.blueGrey][(row + col) % 4];
          g.fillStyle(vialColour, 0.82); g.fillRect(x - 13 + col * 8, y - 17 + row * 11, 4, 7);
        }
      }
      return;
    }
    if (kind === 'pen') {
      g.lineStyle(3, colour, 0.85);
      g.strokeRoundedRect(x - 22, y - 20, 44, 40, 4);
      for (let i = -14; i <= 14; i += 14) g.lineBetween(x + i, y - 20, x + i, y + 20);
      g.fillStyle(PALETTE.bone, 0.72); g.fillEllipse(x - 9, y + 3, 11, 8);
      g.fillStyle(PALETTE.bone, 0.55); g.fillEllipse(x + 7, y - 7, 13, 9);
      g.fillStyle(PALETTE.bone, 0.42); g.fillEllipse(x + 9, y + 10, 16, 10);
      return;
    }
    if (kind === 'board') {
      g.fillStyle(0x2c2119, 1); g.fillRoundedRect(x - 20, y - 18, 40, 36, 3);
      g.lineStyle(3, colour, 0.8); g.strokeRoundedRect(x - 20, y - 18, 40, 36, 3);
      g.fillStyle(PALETTE.bone, 0.72); g.fillRect(x - 13, y - 10, 14, 10); g.fillRect(x + 3, y - 6, 11, 13);
      g.fillStyle(PALETTE.rust, 0.7); g.fillRect(x - 7, y + 5, 15, 8);
      return;
    }
    g.lineStyle(4, colour, 0.86); g.strokeRoundedRect(x - 22, y - 23, 44, 46, 4);
    for (let i = -14; i <= 14; i += 9) g.lineBetween(x + i, y - 21, x + i, y + 21);
    g.fillStyle(PALETTE.rust, 0.68); g.fillRect(x - 18, y - 2, 36, 6);
  }

  private createPlayer(): void {
    const p = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x0b0b09, 0.5); g.fillEllipse(0, 28, 28, 10);
    g.fillStyle(PALETTE.bone, 1); g.lineStyle(2, PALETTE.inkDark, 1);
    g.fillCircle(0, -11, 7); g.strokeCircle(0, -11, 7);
    g.fillStyle(PALETTE.rustDark, 1); g.fillRoundedRect(-9, -3, 18, 25, 5); g.strokeRoundedRect(-9, -3, 18, 25, 5);
    g.fillStyle(PALETTE.bone, 0.85); g.fillRect(-7, 0, 14, 4);
    g.lineStyle(3, PALETTE.bone, 0.95); g.lineBetween(-5, 20, -7, 29); g.lineBetween(5, 20, 7, 29);
    p.add(g);
    this.player = p;
    this.snapPlayer();
  }

  private createHud(): void {
    this.hudPanel = addPanel(this, 760, 22, 176, 488, 0.97);
    this.add.text(780, 42, 'LOWER PIT / LAB', { ...TEXT.mono, fontSize: '9px', color: '#657779' });
    this.add.text(780, 60, t('lab.ledger'), { ...TEXT.mono, fontSize: '11px', color: '#a0573d' });
    this.objectiveText = this.add.text(780, 96, '', { ...TEXT.body, fontSize: '15px', lineSpacing: 3, wordWrap: { width: 137, useAdvancedWrap: true } });
    this.statusText = this.add.text(780, 282, '', { ...TEXT.mono, fontSize: '11px', lineSpacing: 7, wordWrap: { width: 140 } });
    this.promptBg = this.add.rectangle(390, 486, 610, 42, PALETTE.paperDeep, 0.93).setStrokeStyle(1, PALETTE.acid, 0.24);
    this.promptText = this.add.text(390, 486, '', { ...TEXT.mono, fontSize: '12px' }).setOrigin(0.5);
    this.messageBox = createDialogueBox(this, 70, 356, 620, 125);
    this.messageBox.setPrompt(`[${this.semanticInput.hint(ACTIONS.CANCEL)} / ${this.semanticInput.hint(ACTIONS.CONFIRM)}]`);
  }

  update(): void {
    if (this.selectionMode) {
      this.updateSelection();
      return;
    }
    if (this.blocked) {
      if (this.semanticInput.justDown(ACTIONS.LAB_CANCEL) || this.semanticInput.justDown(ACTIONS.CONFIRM)) this.closeMessage();
      return;
    }

    if (!this.moving) {
      const directions: Array<[typeof ACTIONS.MOVE_UP | typeof ACTIONS.MOVE_DOWN | typeof ACTIONS.MOVE_LEFT | typeof ACTIONS.MOVE_RIGHT, number, number]> = [
        [ACTIONS.MOVE_UP, 0, -1],
        [ACTIONS.MOVE_DOWN, 0, 1],
        [ACTIONS.MOVE_LEFT, -1, 0],
        [ACTIONS.MOVE_RIGHT, 1, 0],
      ];
      const held = directions.find(([action]) => this.semanticInput.isDown(action));
      if (held) this.move(held[1], held[2]);
    }

    if (this.semanticInput.justDown(ACTIONS.LAB_INTERACT)) this.interact();
    this.updatePrompt();
  }

  private move(dx: number, dy: number): void {
    if (this.moving) return;
    const nx = this.playerGrid.x + dx;
    const ny = this.playerGrid.y + dy;
    if (MAP[ny]?.[nx] === '#') {
      this.cameras.main.shake(45, 0.0015);
      return;
    }
    this.playerGrid = { x: nx, y: ny };
    this.moving = true;
    this.tweens.add({
      targets: this.player,
      x: WORLD_X + nx * TILE + TILE / 2,
      y: WORLD_Y + ny * TILE + TILE / 2 + 3,
      duration: 92,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.moving = false; },
    });
  }

  private snapPlayer(): void {
    this.player.setPosition(WORLD_X + this.playerGrid.x * TILE + TILE / 2, WORLD_Y + this.playerGrid.y * TILE + TILE / 2 + 3);
  }

  private nearby(): Interactable | undefined {
    return this.interactables.find((o) => Math.abs(o.gx - this.playerGrid.x) + Math.abs(o.gy - this.playerGrid.y) <= 1);
  }

  private interact(): void {
    const object = this.nearby();
    if (object) object.action();
  }

  private updatePrompt(): void {
    const object = this.nearby();
    for (const interactable of this.interactables) {
      const active = interactable === object;
      interactable.plate.setFillStyle(active ? PALETTE.acid : PALETTE.paperDeep, active ? 0.12 : 0.02);
      interactable.plate.setStrokeStyle(active ? 2 : 1, active ? PALETTE.acid : PALETTE.bone, active ? 0.7 : 0.08);
    }
    this.promptText.setText(object ? t('lab.prompt.interact', { control: this.semanticInput.hint(ACTIONS.LAB_INTERACT), name: object.name }) : '');
    this.promptBg.setVisible(Boolean(object));
  }

  useAnimalPen(): void {
    if (gameState.hasBaseAnimal) {
      this.showMessage(t('lab.object.animalPen'), t('lab.message.animalAlready'));
      return;
    }
    const items: SelectionItem[] = OPENING_BASE_ANIMAL_IDS.map((id) => {
      const base = CONTENT_CATALOG.baseAnimals.find((candidate) => candidate.id === id);
      return {
        id,
        name: base?.name ?? id,
        description: base?.description ?? '',
        subline: id === 'rabbit' ? 'LIGHT / FAST / FRAGILE' : id === 'goat' ? 'ROBUST / HORNS / SURE-FOOTED' : 'HEAVY / DURABLE / HIGH METABOLIC LOAD',
      };
    });
    this.openSelection('animal', items);
  }

  useGeneCabinet(): void {
    if (!gameState.hasBaseAnimal) {
      this.showMessage(t('lab.object.geneCabinet'), t('lab.message.needBaseForGenes'));
      return;
    }
    if (OPENING_SOURCE_PACKAGE_IDS.every((id) => gameState.collectedGenes.includes(id))) {
      this.showMessage(t('lab.object.geneCabinet'), t('lab.message.noGenesLeft'));
      return;
    }
    const items: SelectionItem[] = OPENING_SOURCE_PACKAGE_IDS.map((id) => {
      const source = CONTENT_CATALOG.sourcePackages.find((candidate) => candidate.id === id);
      return {
        id,
        name: source?.name ?? id,
        description: source?.description ?? '',
        recovered: gameState.collectedGenes.includes(id),
        subline: source ? `${source.sourceSpecies.toUpperCase()} / ${source.biologicalClassTags.map((tag) => tag.replaceAll('_', ' ')).join(', ').toUpperCase()}` : '',
      };
    });
    this.openSelection('source', items);
  }

  private openSelection(mode: Exclude<SelectionMode, null>, items: SelectionItem[]): void {
    this.closeSelection(false);
    this.selectionMode = mode;
    this.selectionItems = items;
    const firstAvailable = mode === 'source' ? items.findIndex((item) => !item.recovered) : 0;
    this.selectionIndex = firstAvailable >= 0 ? firstAvailable : 0;
    this.blocked = true;
    this.promptBg.setVisible(false);
    this.promptText.setVisible(false);

    const shade = this.add.rectangle(480, 270, 960, 540, 0x080907, 0.76).setDepth(90);
    const panel = addPanel(this, 112, 42, 736, 456, 0.995).setDepth(91);
    const title = this.add.text(138, 65, mode === 'animal' ? t('lab.choice.animals.title') : t('lab.choice.sources.title'), {
      ...TEXT.title, fontSize: '24px', color: '#e8dfc8',
    }).setDepth(92);
    const help = this.add.text(140, 103, mode === 'animal' ? t('lab.choice.animals.help') : t('lab.choice.sources.help'), {
      ...TEXT.body, fontSize: '13px', color: '#a79d88', wordWrap: { width: 675 }, lineSpacing: 2,
    }).setDepth(92);
    const divider = this.add.rectangle(489, 290, 2, 260, PALETTE.bone, 0.12).setDepth(92);
    const detail = this.add.text(515, 164, '', {
      ...TEXT.body, fontSize: '14px', color: '#e8dfc8', wordWrap: { width: 290, useAdvancedWrap: true }, lineSpacing: 4,
    }).setDepth(92);
    const hint = this.add.text(480, 472, t('lab.choice.select'), { ...TEXT.mono, fontSize: '10px', color: '#b7c86c' }).setOrigin(0.5).setDepth(92);

    this.selectionObjects.push(shade, panel, title, help, divider, detail, hint);
    this.selectionDetail = detail;

    const rowStart = mode === 'animal' ? 185 : 157;
    const rowStep = mode === 'animal' ? 58 : 29;
    const rowHeight = mode === 'animal' ? 48 : 24;
    items.forEach((item, index) => {
      const y = rowStart + index * rowStep;
      const bg = this.add.rectangle(311, y, 326, rowHeight, PALETTE.paperDeep, 0.9)
        .setStrokeStyle(1, PALETTE.bone, 0.14)
        .setDepth(92)
        .setInteractive({ useHandCursor: true });
      const status = mode === 'source' ? `  ${item.recovered ? `[${t('lab.choice.recovered')}]` : `[${t('lab.choice.available')}]`}` : '';
      const text = this.add.text(158, y - (mode === 'animal' ? 10 : 7), `${item.name}${status}`, {
        ...TEXT.mono, fontSize: mode === 'animal' ? '13px' : '10px', color: '#a79d88',
      }).setDepth(93);
      if (mode === 'animal' && item.subline) {
        const sub = this.add.text(158, y + 9, item.subline, { ...TEXT.mono, fontSize: '8px', color: '#657779' }).setDepth(93);
        this.selectionObjects.push(sub);
      }
      bg.on('pointerover', () => { this.selectionIndex = index; this.renderSelection(); });
      bg.on('pointerdown', () => { this.selectionIndex = index; this.confirmSelection(); });
      this.selectionRows.push({ bg, text });
      this.selectionObjects.push(bg, text);
    });

    this.renderSelection();
  }

  private updateSelection(): void {
    if (this.semanticInput.justDown(ACTIONS.LAB_CANCEL)) {
      this.closeSelection();
      return;
    }
    if (this.semanticInput.justDown(ACTIONS.MOVE_UP)) {
      this.selectionIndex = (this.selectionIndex - 1 + this.selectionItems.length) % this.selectionItems.length;
      this.renderSelection();
    } else if (this.semanticInput.justDown(ACTIONS.MOVE_DOWN)) {
      this.selectionIndex = (this.selectionIndex + 1) % this.selectionItems.length;
      this.renderSelection();
    }
    if (this.semanticInput.justDown(ACTIONS.CONFIRM)) this.confirmSelection();
  }

  private renderSelection(): void {
    this.selectionRows.forEach((row, index) => {
      const selected = index === this.selectionIndex;
      const recovered = Boolean(this.selectionItems[index]?.recovered);
      row.bg.setFillStyle(selected ? PALETTE.mossDark : PALETTE.paperDeep, selected ? 0.72 : 0.9);
      row.bg.setStrokeStyle(selected ? 2 : 1, selected ? PALETTE.acid : PALETTE.bone, selected ? 0.9 : 0.14);
      row.text.setColor(recovered ? '#657779' : selected ? '#ffffff' : '#a79d88');
    });
    const item = this.selectionItems[this.selectionIndex];
    if (!item || !this.selectionDetail) return;
    const status = this.selectionMode === 'source'
      ? `\n\nSTATUS: ${item.recovered ? t('lab.choice.recovered') : t('lab.choice.available')}`
      : '';
    this.selectionDetail.setText(`${item.name.toUpperCase()}\n${item.subline ?? ''}\n\n${item.description}${status}`);
  }

  private confirmSelection(): void {
    const item = this.selectionItems[this.selectionIndex];
    if (!item || !this.selectionMode) return;

    if (this.selectionMode === 'animal') {
      gameState.acquireAnimal(item.id);
      saveGame();
      this.updateHud();
      this.closeSelection(false);
      const animal = BASE_ANIMALS[item.id];
      this.showMessage(t('lab.message.animalAcquiredTitle'), t('lab.message.animalAcquired', {
        name: animal?.name ?? item.name,
        description: animal?.description ?? item.description,
      }));
      return;
    }

    if (item.recovered) return;
    gameState.addGene(item.id);
    saveGame();
    this.updateHud();
    this.closeSelection(false);
    this.showMessage(t('lab.message.geneRecoveredTitle'), t('lab.message.geneRecovered', {
      name: item.name,
      description: item.description,
    }));
  }

  private closeSelection(unblock = true): void {
    for (const object of this.selectionObjects) object.destroy();
    this.selectionObjects = [];
    this.selectionRows = [];
    this.selectionItems = [];
    this.selectionDetail = null;
    this.selectionMode = null;
    if (unblock) {
      this.blocked = false;
      this.promptText.setVisible(true);
      this.updatePrompt();
    }
  }

  useSpliceBench(): void {
    if (!gameState.hasBaseAnimal) {
      this.showMessage(t('lab.object.spliceBench'), t('lab.message.noBaseAtBench'));
      return;
    }
    if (gameState.collectedGenes.length === 0) {
      this.showMessage(t('lab.object.spliceBench'), t('lab.message.noGenesAtBench'));
      return;
    }
    transitionTo(this, 'Splice');
  }

  useFitPit(): void {
    if (!gameState.currentCreature) {
      this.showMessage(t('lab.object.fitPitGate'), t('lab.message.noCreatureAtGate'));
      return;
    }
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
