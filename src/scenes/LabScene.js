import { TILE, PALETTE, TEXT } from '../config.js';
import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import { addPaperPanel, wrappedText } from '../ui/helpers.js';

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
];

export class LabScene extends Phaser.Scene {
  constructor() { super('Lab'); }

  create() {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    this.blocked = false;
    this.interactables = [];
    this.playerGrid = { x: 2, y: 5 };
    this.drawWorld();
    this.createInteractables();
    this.createPlayer();
    this.createHud();
    this.createInput();
    this.updateHud();
    saveGame();
  }

  drawWorld() {
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
    g.lineBetween(WORLD_X + 2*TILE, WORLD_Y + 2*TILE, WORLD_X + 4*TILE, WORLD_Y + 3*TILE);
    g.lineBetween(WORLD_X + 9*TILE, WORLD_Y + 4*TILE, WORLD_X + 11*TILE, WORLD_Y + 5*TILE);
    g.fillStyle(PALETTE.moss, 0.25);
    for (let i = 0; i < 18; i += 1) g.fillCircle(WORLD_X + 360 + Math.random()*280, WORLD_Y + 265 + Math.random()*160, 3 + Math.random()*7);
  }

  createInteractables() {
    this.addObject(3, 2, 'SPLICE BENCH', 'S', PALETTE.bruise, () => this.useSpliceBench());
    this.addObject(10, 2, 'GENE CABINET', 'G', PALETTE.acid, () => this.useGeneCabinet());
    this.addObject(3, 6, 'ANIMAL PEN', 'R', PALETTE.moss, () => this.useAnimalPen());
    this.addObject(9, 6, 'NOTICE BOARD', 'B', PALETTE.rust, () => this.useNoticeBoard());
    this.addObject(11, 8, 'FIT PIT GATE', 'P', PALETTE.blood, () => this.useFitPit());
  }

  addObject(gx, gy, name, mark, colour, action) {
    const x = WORLD_X + gx*TILE + TILE/2; const y = WORLD_Y + gy*TILE + TILE/2;
    const plate = this.add.rectangle(x, y, TILE - 10, TILE - 10, colour, 0.68).setStrokeStyle(2, PALETTE.bone, 0.55);
    this.add.text(x, y, mark, { ...TEXT.mono, fontSize: '18px', color: '#181512' }).setOrigin(.5);
    this.interactables.push({ gx, gy, name, action, plate });
  }

  createPlayer() {
    const p = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(PALETTE.bone, 1); g.lineStyle(2, PALETTE.inkDark, 1);
    g.fillCircle(0, -9, 8); g.strokeCircle(0, -9, 8);
    g.fillStyle(PALETTE.rust, 1); g.fillRoundedRect(-9, -1, 18, 22, 5); g.strokeRoundedRect(-9, -1, 18, 22, 5);
    g.lineStyle(3, PALETTE.bone, 1); g.lineBetween(-5, 19, -7, 29); g.lineBetween(5, 19, 7, 29);
    p.add(g); this.player = p; this.snapPlayer();
  }

  createHud() {
    this.hudPanel = addPaperPanel(this, 760, 30, 176, 480, 0.97);
    this.add.text(780, 50, 'PIT LEDGER', { ...TEXT.mono, fontSize: '11px', color: '#a0573d' });
    this.objectiveText = wrappedText(this, 780, 89, '', 137, { fontSize: '15px', lineSpacing: 3 });
    this.statusText = this.add.text(780, 278, '', { ...TEXT.mono, fontSize: '11px', lineSpacing: 7, wordWrap: { width: 140 } });
    this.promptBg = this.add.rectangle(390, 486, 610, 42, PALETTE.paperDeep, 0.9).setStrokeStyle(1, PALETTE.bone, 0.25);
    this.promptText = this.add.text(390, 486, '', { ...TEXT.mono, fontSize: '12px' }).setOrigin(.5);
    this.messagePanel = addPaperPanel(this, 70, 356, 620, 125, 0.985).setVisible(false);
    this.messageTitle = this.add.text(92, 377, '', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c' }).setVisible(false);
    this.messageBody = wrappedText(this, 92, 402, '', 570, { fontSize: '17px', lineSpacing: 4 }).setVisible(false);
  }

  createInput() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP, down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT, right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W, a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S, d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E, space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc) && this.blocked) { this.closeMessage(); return; }
    if (this.blocked) return;
    const dirs = [
      [this.keys.up, this.keys.w, 0, -1], [this.keys.down, this.keys.s, 0, 1],
      [this.keys.left, this.keys.a, -1, 0], [this.keys.right, this.keys.d, 1, 0],
    ];
    for (const [k1,k2,dx,dy] of dirs) {
      if (Phaser.Input.Keyboard.JustDown(k1) || Phaser.Input.Keyboard.JustDown(k2)) { this.move(dx,dy); break; }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.e) || Phaser.Input.Keyboard.JustDown(this.keys.space)) this.interact();
    this.updatePrompt();
  }

  move(dx,dy) {
    if (this.moving) return;
    const nx = this.playerGrid.x + dx; const ny = this.playerGrid.y + dy;
    if (MAP[ny]?.[nx] === '#') { this.cameras.main.shake(60, 0.002); return; }
    this.playerGrid = { x: nx, y: ny }; this.moving = true;
    this.tweens.add({ targets: this.player, x: WORLD_X + nx*TILE + TILE/2, y: WORLD_Y + ny*TILE + TILE/2 + 3, duration: 105, ease: 'Sine.easeInOut', onComplete: () => { this.moving = false; } });
  }

  snapPlayer() { this.player.setPosition(WORLD_X + this.playerGrid.x*TILE + TILE/2, WORLD_Y + this.playerGrid.y*TILE + TILE/2 + 3); }

  nearby() {
    return this.interactables.find((o) => Math.abs(o.gx - this.playerGrid.x) + Math.abs(o.gy - this.playerGrid.y) <= 1);
  }

  interact() { const o = this.nearby(); if (o) o.action(); }
  updatePrompt() { const o = this.nearby(); this.promptText.setText(o ? `[E] ${o.name}` : ''); this.promptBg.setVisible(Boolean(o)); }

  useAnimalPen() {
    if (gameState.hasBaseAnimal) return this.showMessage('ANIMAL PEN', 'The rabbit is already logged as your base specimen. It looks unconvinced by the promotion.');
    gameState.acquireAnimal('rabbit'); saveGame(); this.updateHud();
    this.showMessage('BASE ANIMAL ACQUIRED', `${BASE_ANIMALS.rabbit.name}: ${BASE_ANIMALS.rabbit.description}\n\nThe surviving gene cabinet may still contain usable samples.`);
  }

  useGeneCabinet() {
    const candidates = ['gecko_regeneration','boar_muscle','moth_sense'];
    const next = candidates.find((id) => !gameState.collectedGenes.includes(id));
    if (!gameState.hasBaseAnimal) return this.showMessage('GENE CABINET', 'Samples remain viable, but you need a base animal before any of this becomes useful.');
    if (!next) return this.showMessage('GENE CABINET', 'You have taken every viable prototype sample: Gecko Regeneration, Boar Myofibre and Moth Chemosense.');
    gameState.addGene(next); saveGame(); this.updateHud();
    this.showMessage('GENE SAMPLE RECOVERED', `${GENES[next].name}\n${GENES[next].description}\n\nReturn to the splice bench when you are ready to make a bad decision.`);
  }

  useSpliceBench() {
    if (!gameState.hasBaseAnimal) return this.showMessage('SPLICE BENCH', 'No base animal. The machine can only make alarming noises at you.');
    if (gameState.collectedGenes.length === 0) return this.showMessage('SPLICE BENCH', 'The bench survived. The sample rack did not. Find usable genetic material first.');
    this.scene.start('Splice');
  }

  useFitPit() {
    if (!gameState.currentCreature) return this.showMessage('FIT PIT GATE', 'The house accepts many things as a combatant. An empty transport cage is not one of them. Splice something first.');
    this.scene.start('Battle');
  }

  useNoticeBoard() {
    this.showMessage('NOTICE BOARD', `OUTSTANDING PIT DEBT: £${gameState.debt}\n\nFIT PIT LICENCE: SUSPENDED PENDING DEMONSTRATION BOUT\n\nHandwritten underneath: “If it can stand, it can fight.”`);
  }

  showMessage(title, body) { this.blocked = true; this.messagePanel.setVisible(true); this.messageTitle.setText(title).setVisible(true); this.messageBody.setText(body).setVisible(true); this.promptBg.setVisible(false); this.promptText.setVisible(false); }
  closeMessage() { this.blocked = false; this.messagePanel.setVisible(false); this.messageTitle.setVisible(false); this.messageBody.setVisible(false); this.promptText.setVisible(true); this.updatePrompt(); }

  updateHud() {
    const objectives = {
      find_animal: 'Obtain a clean base animal from the surviving pen.',
      collect_genes: 'Recover at least one viable gene sample.',
      splice: 'Use the splice bench to create a viable creature.',
      fight: 'Take your creature through the Fit Pit gate.',
      slice_complete: 'Vertical slice complete. The pit is technically a business again.',
    };
    this.objectiveText.setText(objectives[gameState.questStage]);
    const creature = gameState.currentCreature?.name ?? 'NONE';
    this.statusText.setText([
      `CASH       £${gameState.coins}`,
      `DEBT       £${gameState.debt}`,
      `BASE       ${gameState.hasBaseAnimal ? BASE_ANIMALS[gameState.baseAnimalId].name.toUpperCase() : 'NONE'}`,
      `GENES      ${gameState.collectedGenes.length}`,
      `CREATURE   ${creature.toUpperCase()}`,
      `PIT WINS   ${gameState.fitPitWins}`,
      '',
      '[AUTO-SAVE ENABLED]'
    ].join('\n'));
  }
}
