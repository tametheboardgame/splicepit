import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';
import {
  addButton,
  addHudPanel,
  addInventorySlot,
  addPrompt,
  addStatusBar,
  addTooltip,
  createDialogueBox,
} from '../ui/primitives.js';
import { UI_COLOURS, UI_TEXT } from '../ui/theme.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

export class InterfaceStyleScene extends Phaser.Scene {
  private dialogueVisible = true;
  private tooltipVisible = true;
  private slotIndex = 0;
  private slots: ReturnType<typeof addInventorySlot>[] = [];

  constructor() { super('InterfaceStyle'); }

  create(): void {
    this.cameras.main.setBackgroundColor(UI_COLOURS.void);
    fadeIn(this, 120);
    this.drawWorkshopBackdrop();
    this.drawHudSamples();
    this.drawInventorySample();
    this.drawDialogueSample();
    this.drawTitleSample();
    this.drawReviewHelp();

    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.slotIndex = (this.slotIndex + 1) % this.slots.length;
      this.renderSlotSelection();
    });
    this.input.keyboard?.on('keydown-D', () => this.toggleDialogue());
    this.input.keyboard?.on('keydown-T', () => this.toggleTooltip());
    this.input.keyboard?.on('keydown-ESC', () => transitionTo(this, 'Title', { duration: 100 }));
  }

  private drawWorkshopBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(0x111411, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(0x2b2d29, 1);
    g.fillRect(0, 42, GAME_WIDTH, GAME_HEIGHT - 42);
    for (let y = 42; y < GAME_HEIGHT; y += 24) {
      for (let x = 0; x < GAME_WIDTH; x += 24) {
        const alternate = ((x / 24) + (y / 24)) % 2 === 0;
        g.fillStyle(alternate ? 0x34352f : 0x30312d, 1);
        g.fillRect(x + 1, y + 1, 22, 22);
      }
    }

    g.fillStyle(0x151917, 1);
    g.fillRect(0, 42, GAME_WIDTH, 62);
    g.fillStyle(0x535a52, 1);
    g.fillRect(0, 101, GAME_WIDTH, 4);

    g.fillStyle(0x4a3025, 1);
    g.fillRect(64, 142, 235, 50);
    g.fillStyle(0x744936, 1);
    g.fillRect(70, 148, 223, 8);
    g.fillStyle(0x535a52, 1);
    g.fillRect(80, 160, 28, 24);
    g.fillRect(118, 164, 22, 20);
    g.fillStyle(UI_COLOURS.greenBright, 0.8);
    g.fillRect(156, 164, 8, 17);
    g.fillRect(172, 159, 8, 22);
    g.fillStyle(UI_COLOURS.amber, 0.85);
    g.fillRect(197, 166, 7, 15);

    g.fillStyle(0x161b18, 1);
    g.fillRect(700, 118, 86, 128);
    g.lineStyle(4, 0x535a52, 1);
    g.strokeRect(702, 120, 82, 124);
    g.fillStyle(0x2e6a35, 0.82);
    g.fillRect(710, 132, 66, 92);
    g.fillStyle(UI_COLOURS.greenBright, 0.25);
    g.fillCircle(744, 166, 21);
    g.fillStyle(0xc98e69, 0.9);
    g.fillCircle(744, 176, 8);
    g.fillRect(739, 184, 10, 25);

    g.fillStyle(0x0b0d0c, 1);
    g.fillCircle(465, 259, 10);
    g.fillStyle(0xc98e69, 1);
    g.fillCircle(465, 252, 6);
    g.fillStyle(0x495b55, 1);
    g.fillRect(458, 259, 14, 18);
    g.fillStyle(UI_COLOURS.greenBright, 0.8);
    g.fillRect(461, 263, 8, 3);

    g.fillStyle(0x151917, 1);
    g.fillRect(372, 152, 188, 72);
    g.lineStyle(2, 0x535a52, 1);
    g.strokeRect(373, 153, 186, 70);
    g.fillStyle(0x535a52, 1);
    g.fillRect(389, 169, 155, 34);
    g.fillStyle(UI_COLOURS.amber, 0.65);
    g.fillRect(405, 181, 122, 6);
    this.add.text(412, 159, 'SPLICER UNIT', UI_TEXT.label);
  }

  private drawHudSamples(): void {
    const playerHud = addHudPanel(this, 14, 54, 190, 89, 'RIVET // RANK 3', 'green');
    playerHud.setDepth(20);
    this.add.text(24, 79, 'CUTTER', { ...UI_TEXT.micro, color: '#9b9587' }).setDepth(21);
    addStatusBar(this, 24, 96, 164, 'HP', 68, 68, 'green');
    addStatusBar(this, 24, 121, 164, 'SP', 19, 24, 'cyan');

    const objective = addHudPanel(this, 724, 54, 222, 76, 'OBJECTIVE', 'amber');
    objective.setDepth(20);
    this.add.text(735, 82, 'Stabilise the thrashling', UI_TEXT.bodySmall).setDepth(21);
    this.add.text(735, 101, '0 / 1', { ...UI_TEXT.micro, color: '#e19a43' }).setDepth(21);

    const prompt = addPrompt(this, 393, 232, 'E', 'Use splicer', 'green');
    prompt.setDepth(22);

    const tooltip = addTooltip(this, 610, 272, 'GENE CABINET', 'Stored donor traits. Green marks viable samples.', 250);
    tooltip.setDepth(22).setName('wp04d-tooltip');

    const action = addButton(this, 842, 346, 170, 'Open bench', () => undefined, { accent: UI_COLOURS.greenBright });
    action.container.setDepth(22);
  }

  private drawInventorySample(): void {
    const inventory = addHudPanel(this, 676, 354, 270, 142, 'PACK // 6 SLOTS', 'cyan');
    inventory.setDepth(20);
    const icons = ['DNA', 'VIAL', 'CLAW', 'MEAT', 'KEY', '???'];
    const counts = [3, 2, 1, 4, undefined, 1];
    this.slots = icons.map((icon, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const slot = addInventorySlot(this, 690 + col * 52, 382 + row * 50, icon, counts[index], index === 3 ? 'amber' : 'green');
      slot.container.setDepth(22);
      return slot;
    });
    this.renderSlotSelection();
    this.add.text(850, 387, 'SELECTED', UI_TEXT.label).setDepth(22);
    this.add.text(850, 405, 'Rabbit donor DNA', UI_TEXT.bodySmall).setDepth(22);
    this.add.text(850, 439, 'TAB  next slot', UI_TEXT.micro).setDepth(22);
  }

  private drawDialogueSample(): void {
    const dialogue = createDialogueBox(this, 30, 384, 610, 112);
    dialogue.show('MARA // GENE TRADER', 'That sample is alive enough. Whether it stays that way after the splice is your problem.');
    dialogue.setPrompt('E  Continue');
    this.registry.set('wp04d-dialogue', dialogue);
  }

  private drawTitleSample(): void {
    const g = this.add.graphics().setDepth(25);
    g.fillStyle(UI_COLOURS.void, 0.98);
    g.fillRect(0, 0, GAME_WIDTH, 42);
    g.fillStyle(UI_COLOURS.greenBright, 1);
    g.fillRect(0, 40, 150, 2);
    g.fillStyle(UI_COLOURS.amber, 0.9);
    g.fillRect(150, 40, 90, 2);
    this.add.text(14, 9, 'SPLICEPIT', { ...UI_TEXT.title, color: '#e3dcc7' }).setDepth(26);
    this.add.text(135, 14, 'WORKSHOP', { ...UI_TEXT.label, color: '#b3d867' }).setDepth(26);
    this.add.text(GAME_WIDTH - 14, 12, '₽ 1,257   //   DAY 3', { ...UI_TEXT.micro, color: '#e19a43' }).setOrigin(1, 0).setDepth(26);
  }

  private drawReviewHelp(): void {
    this.add.text(14, GAME_HEIGHT - 10, 'WP0.4D REVIEW  //  D dialogue  T tooltip  TAB selection  ESC title', {
      ...UI_TEXT.micro,
      color: '#777268',
    }).setOrigin(0, 1).setDepth(80);
  }

  private renderSlotSelection(): void {
    this.slots.forEach((slot, index) => slot.setSelected(index === this.slotIndex));
  }

  private toggleDialogue(): void {
    const dialogue = this.registry.get('wp04d-dialogue') as { setVisible(visible: boolean): void } | undefined;
    if (!dialogue) return;
    this.dialogueVisible = !this.dialogueVisible;
    dialogue.setVisible(this.dialogueVisible);
  }

  private toggleTooltip(): void {
    const tooltip = this.children.getByName('wp04d-tooltip') as Phaser.GameObjects.Container | null;
    if (!tooltip) return;
    this.tooltipVisible = !this.tooltipVisible;
    tooltip.setVisible(this.tooltipVisible);
  }
}
