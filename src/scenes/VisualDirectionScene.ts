import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

const P = {
  void: 0x0d0f0e,
  ink: 0xe3dcc7,
  muted: 0x928b7c,
  outline: 0x111311,
  wallDark: 0x1b1f1d,
  wall: 0x2a2f2b,
  wallLight: 0x41473f,
  floorA: 0x34352f,
  floorB: 0x3b3a33,
  floorEdge: 0x20231f,
  metalDark: 0x303632,
  metal: 0x535a52,
  metalLight: 0x788074,
  woodDark: 0x4a3025,
  wood: 0x744936,
  copper: 0xa6673f,
  amber: 0xe19a43,
  greenDark: 0x355530,
  green: 0x77a94f,
  greenBright: 0xb3d867,
  fluid: 0x7bc84a,
  fluidDark: 0x2e6a35,
  cyan: 0x619a94,
  bruise: 0x745472,
  blood: 0x8d3d37,
  red: 0xb64d3d,
  skin: 0xc98e69,
  hair: 0x263f3b,
  coat: 0x495b55,
  cream: 0xc8bca2,
} as const;

type ViewMode = 'workshop' | 'market' | 'battle';

const MODES: readonly ViewMode[] = ['workshop', 'market', 'battle'];

export class VisualDirectionScene extends Phaser.Scene {
  private modeIndex = 0;

  constructor() { super('VisualDirection'); }

  create(): void {
    this.cameras.main.setBackgroundColor(P.void);
    fadeIn(this, 120);
    this.renderMode();

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === '1') this.setMode(0);
      if (event.key === '2') this.setMode(1);
      if (event.key === '3') this.setMode(2);
      if (event.key === 'ArrowLeft') this.setMode((this.modeIndex + MODES.length - 1) % MODES.length);
      if (event.key === 'ArrowRight') this.setMode((this.modeIndex + 1) % MODES.length);
      if (event.key === 'Escape') transitionTo(this, 'Title', { duration: 100 });
    });
  }

  private setMode(index: number): void {
    if (index === this.modeIndex) return;
    this.modeIndex = index;
    this.renderMode();
  }

  private renderMode(): void {
    this.tweens.killAll();
    this.children.removeAll(true);

    const mode = MODES[this.modeIndex];
    if (mode === 'workshop') this.drawWorkshop();
    if (mode === 'market') this.drawMarket();
    if (mode === 'battle') this.drawBattle();
    this.drawModeTabs(mode);
  }

  private drawModeTabs(active: ViewMode): void {
    const g = this.add.graphics();
    g.fillStyle(P.void, 0.96);
    g.fillRect(0, 0, GAME_WIDTH, 38);
    g.fillStyle(P.wallDark, 1);
    g.fillRect(0, 37, GAME_WIDTH, 2);

    this.add.text(14, 10, 'SPLICEPIT // IN-ENGINE VISUAL TARGET', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '11px',
      color: '#b3d867',
      fontStyle: 'bold',
    });

    const labels: ReadonlyArray<{ mode: ViewMode; label: string }> = [
      { mode: 'workshop', label: '1  WORKSHOP' },
      { mode: 'market', label: '2  UNDERGROUND MARKET' },
      { mode: 'battle', label: '3  BATTLE' },
    ];

    labels.forEach((item, index) => {
      const x = 535 + index * 136;
      const selected = active === item.mode;
      g.fillStyle(selected ? P.greenDark : P.wall, 1);
      g.fillRect(x, 7, 126, 24);
      g.lineStyle(1, selected ? P.greenBright : P.wallLight, 1);
      g.strokeRect(x + 0.5, 7.5, 125, 23);
      this.add.text(x + 8, 13, item.label, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '9px',
        color: selected ? '#e3dcc7' : '#928b7c',
      });
      this.add.zone(x, 7, 126, 24).setOrigin(0).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.setMode(index));
    });

    this.add.text(GAME_WIDTH - 12, GAME_HEIGHT - 12, '←/→ switch view   ESC old prototype', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '8px',
      color: '#776f62',
    }).setOrigin(1, 1);
  }

  private drawWorkshop(): void {
    this.drawTiledRoom(P.floorA, P.floorB);
    const g = this.add.graphics();

    // Rear wall and utility strip.
    g.fillStyle(P.wallDark, 1); g.fillRect(34, 54, 892, 58);
    g.fillStyle(P.wall, 1); g.fillRect(48, 67, 864, 34);
    g.fillStyle(P.wallLight, 0.7);
    for (let x = 60; x < 900; x += 48) g.fillRect(x, 76, 30, 3);
    g.fillStyle(P.metalDark, 1); g.fillRect(54, 106, 852, 7);

    // Pipes across the wall.
    g.fillStyle(P.metal, 1); g.fillRect(74, 61, 190, 6); g.fillRect(270, 61, 6, 42);
    g.fillStyle(P.copper, 0.9); g.fillRect(606, 63, 205, 4); g.fillRect(805, 63, 5, 39);
    g.fillStyle(P.green, 0.5); g.fillRect(367, 59, 142, 4);

    // Left specimen tanks.
    this.drawTank(80, 126, 52, 108, 'A');
    this.drawTank(146, 118, 52, 116, 'B');
    this.drawTank(212, 134, 48, 100, 'C');
    this.add.text(82, 244, 'LIVE STOCK', this.pixelText('#928b7c', 8));

    // Work bench, microscope and jars.
    this.drawBench(74, 294, 222, 70);
    g.fillStyle(P.metal, 1); g.fillRect(92, 274, 7, 20); g.fillRect(92, 274, 28, 5); g.fillRect(115, 278, 5, 17);
    g.fillStyle(P.greenBright, 0.8); g.fillRect(164, 311, 7, 12); g.fillRect(178, 307, 8, 16); g.fillRect(193, 314, 6, 9);
    g.fillStyle(P.cyan, 0.8); g.fillRect(218, 310, 8, 13);

    // Central splicing platform.
    g.fillStyle(P.outline, 1); g.fillCircle(475, 256, 99);
    g.fillStyle(P.metalDark, 1); g.fillCircle(475, 256, 93);
    g.fillStyle(P.woodDark, 1); g.fillCircle(475, 256, 77);
    g.fillStyle(P.floorEdge, 1); g.fillCircle(475, 256, 64);
    g.lineStyle(5, P.metal, 1); g.strokeCircle(475, 256, 85);
    g.lineStyle(2, P.copper, 0.9); g.strokeCircle(475, 256, 70);
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      g.fillStyle(P.metalLight, 1);
      g.fillRect(Math.round(475 + Math.cos(angle) * 83) - 2, Math.round(256 + Math.sin(angle) * 83) - 2, 4, 4);
    }

    // Splice cradle and cable arms.
    g.fillStyle(P.metal, 1); g.fillRect(434, 236, 82, 38);
    g.fillStyle(P.cream, 1); g.fillRect(442, 242, 65, 23);
    g.fillStyle(P.bruise, 0.75); g.fillRect(457, 248, 36, 11);
    g.fillStyle(P.metalDark, 1); g.fillRect(421, 226, 10, 50); g.fillRect(520, 226, 10, 50);
    g.fillStyle(P.copper, 1); g.fillRect(414, 221, 27, 6); g.fillRect(510, 221, 27, 6);
    g.fillStyle(P.fluid, 0.8); g.fillRect(466, 214, 18, 9);

    this.drawSmallRabwolf(461, 241, 1);

    // Rear console cluster.
    this.drawConsole(352, 116, 250, 68);
    this.add.text(396, 127, 'SPLICE CONTROL', this.pixelText('#b3d867', 9));
    this.add.text(379, 145, 'VIABILITY  63%    TRAIT MAP  ??', this.pixelText('#928b7c', 8));
    g.fillStyle(P.green, 0.7); g.fillRect(380, 160, 94, 4);
    g.fillStyle(P.red, 0.7); g.fillRect(478, 160, 47, 4);

    // Right cages and cold storage.
    this.drawCage(677, 120, 105, 100, true);
    this.drawCage(793, 120, 99, 100, false);
    this.add.text(688, 229, 'TEST SUBJECTS', this.pixelText('#928b7c', 8));

    // Small chemistry station.
    this.drawBench(682, 287, 210, 72);
    g.fillStyle(P.fluid, 0.85); g.fillRect(703, 311, 8, 17); g.fillRect(718, 305, 8, 23);
    g.fillStyle(P.blood, 0.85); g.fillRect(739, 314, 7, 14);
    g.fillStyle(P.amber, 0.85); g.fillRect(758, 309, 8, 19);
    this.add.text(799, 312, 'MUTAGEN', this.pixelText('#a6a08f', 8));
    this.add.text(799, 326, 'STOCK', this.pixelText('#a6a08f', 8));

    // Exit and floor drains.
    this.drawDoor(814, 386, 77, 89, 'MARKET');
    g.fillStyle(P.metalDark, 1); g.fillRect(354, 422, 84, 16);
    for (let x = 359; x < 434; x += 8) g.fillStyle(P.outline, 1).fillRect(x, 424, 3, 12);

    // Player and technician.
    this.drawPlayer(480, 428, false);
    this.drawNpc(324, 176, P.wood, P.skin, 1);

    this.drawLocationLabel('THE WORKSHOP', 'Inherited splice pit / illegal genetics lab', 'E  Use splice bench', 475, 332);
    this.addAmbientTankPulse(170, 174);
  }

  private drawMarket(): void {
    this.drawTiledRoom(0x39352f, 0x403a32);
    const g = this.add.graphics();

    // Sewage channels and pipe framing.
    g.fillStyle(P.wallDark, 1); g.fillRect(34, 54, 892, 58);
    g.fillStyle(P.metalDark, 1); g.fillRect(58, 71, 844, 10);
    g.fillStyle(P.fluidDark, 1); g.fillRect(34, 438, 892, 44);
    g.fillStyle(P.fluid, 0.18); g.fillRect(34, 446, 892, 23);
    for (let x = 45; x < 920; x += 48) {
      g.fillStyle(P.greenBright, 0.18); g.fillRect(x, 452 + (x % 3), 23, 2);
    }

    this.drawMarketStall(68, 116, 184, 92, 'GENE STOCK', P.green, true);
    this.drawMarketStall(274, 116, 174, 92, 'AUGMENTS', P.copper, false);
    this.drawMarketStall(658, 116, 228, 92, 'FRESH CUTS', P.red, false);
    this.drawMarketStall(76, 302, 198, 96, 'GREY WARES', P.cyan, false);
    this.drawMarketStall(652, 302, 228, 96, 'MUTAGEN', P.greenBright, true);

    // Central drain and crossing plates.
    g.fillStyle(P.outline, 1); g.fillCircle(480, 286, 72);
    g.fillStyle(P.metalDark, 1); g.fillCircle(480, 286, 66);
    g.lineStyle(3, P.metalLight, 0.75); g.strokeCircle(480, 286, 56);
    for (let y = 244; y <= 328; y += 10) {
      g.fillStyle(P.outline, 0.9); g.fillRect(441, y, 78, 4);
    }
    for (let x = 448; x <= 512; x += 12) {
      g.fillStyle(P.metal, 1); g.fillRect(x, 241, 4, 90);
    }

    // Crowd and traders.
    this.drawNpc(164, 228, 0x4c4940, P.skin, 0);
    this.drawNpc(237, 260, P.bruise, 0xb47e60, 2);
    this.drawNpc(320, 238, P.coat, P.skin, 0);
    this.drawNpc(396, 330, P.wood, 0x9f6d55, 2);
    this.drawNpc(577, 245, 0x50514a, P.skin, 0);
    this.drawNpc(703, 244, P.coat, 0xb47e60, 1);
    this.drawNpc(817, 266, P.wood, P.skin, 0);
    this.drawNpc(573, 376, P.bruise, 0x9f6d55, 2);
    this.drawNpc(348, 388, 0x364b47, P.skin, 0);

    // Suspicious beast for sale.
    this.drawSmallRabwolf(123, 164, 1);
    g.fillStyle(P.outline, 1); g.fillRect(104, 156, 54, 4); g.fillRect(104, 190, 54, 4);
    for (let x = 106; x < 158; x += 10) g.fillRect(x, 158, 3, 34);

    this.drawPlayer(484, 378, false);

    this.add.text(458, 346, '!', {
      fontFamily: 'ui-monospace, monospace', fontSize: '16px', color: '#e19a43', fontStyle: 'bold',
    });
    this.drawLocationLabel('UNDERGROUND MARKET', 'Genes, animals, parts and people with flexible ethics', 'E  Talk to Mara', 483, 409);
  }

  private drawBattle(): void {
    const g = this.add.graphics();
    g.fillStyle(P.void, 1); g.fillRect(0, 38, GAME_WIDTH, GAME_HEIGHT - 38);

    // Industrial crowd background.
    g.fillStyle(P.wallDark, 1); g.fillRect(32, 54, 896, 166);
    g.fillStyle(P.wall, 1); g.fillRect(44, 66, 872, 130);
    for (let x = 58; x < 910; x += 35) {
      g.fillStyle(x % 70 === 0 ? P.greenDark : P.outline, 1);
      g.fillRect(x, 84, 17, 72);
      g.fillStyle(P.muted, 0.55); g.fillRect(x + 4, 91, 8, 9);
      g.fillStyle(P.skin, 0.35); g.fillRect(x + 5, 108, 7, 7);
    }
    g.fillStyle(P.metalDark, 1); g.fillRect(44, 190, 872, 24);
    for (let x = 48; x < 912; x += 18) g.fillStyle(P.outline, 1).fillRect(x, 194, 8, 16);

    // Arena floor, deliberately flatter than the concept-art attempt.
    g.fillStyle(0x403831, 1); g.fillRect(32, 214, 896, 214);
    for (let y = 224; y < 424; y += 24) {
      for (let x = 44; x < 916; x += 24) {
        const c = ((x + y) / 24) % 2 === 0 ? 0x494038 : 0x3c352f;
        g.fillStyle(c, 1); g.fillRect(x, y, 22, 22);
      }
    }
    g.fillStyle(P.blood, 0.38); g.fillRect(656, 314, 38, 6); g.fillRect(673, 304, 12, 25);
    g.fillStyle(P.metalDark, 1); g.fillCircle(480, 327, 42);
    g.fillStyle(P.outline, 1); g.fillCircle(480, 327, 35);
    for (let y = 300; y <= 350; y += 10) g.fillStyle(P.metal, 1).fillRect(453, y, 54, 3);

    // Combatants.
    this.drawBattleRabwolf(276, 292, 2);
    this.drawBattleBoar(666, 258, 2);

    // Pokemon-like readable status framing, but original SplicePit styling.
    this.drawBattleStatus(56, 64, 326, 'RABWOLF', 'Lv.12', 78, 78, P.green);
    this.drawBattleStatus(578, 64, 326, 'IRON BOAR', 'Lv.11', 55, 64, P.red);

    // Compact command box.
    g.fillStyle(P.outline, 1); g.fillRect(60, 442, 840, 72);
    g.fillStyle(P.wallDark, 1); g.fillRect(64, 446, 832, 64);
    g.lineStyle(2, P.metal, 1); g.strokeRect(64.5, 446.5, 831, 63);

    const moves = [
      ['RIPPER CLAW', '8/10'],
      ['SPRING LUNGE', '5/8'],
      ['SCENT LOCK', '4/5'],
      ['GUARD', '∞'],
    ];
    moves.forEach((move, index) => {
      const x = 82 + (index % 2) * 226;
      const y = 456 + Math.floor(index / 2) * 24;
      g.fillStyle(index === 0 ? P.greenDark : P.wall, 1); g.fillRect(x, y, 208, 20);
      g.lineStyle(1, index === 0 ? P.greenBright : P.wallLight, 1); g.strokeRect(x + 0.5, y + 0.5, 207, 19);
      this.add.text(x + 8, y + 5, move[0], this.pixelText(index === 0 ? '#e3dcc7' : '#b4ad9d', 8));
      this.add.text(x + 196, y + 5, move[1], this.pixelText('#928b7c', 8)).setOrigin(1, 0);
    });

    this.add.text(548, 459, 'Rabwolf lowers its body.', this.pixelText('#e3dcc7', 10));
    this.add.text(548, 479, 'The grafted hind legs tense.', this.pixelText('#928b7c', 9));
    this.add.text(548, 497, 'Choose an action.', this.pixelText('#b3d867', 9));
  }

  private drawTiledRoom(a: number, b: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.void, 1); g.fillRect(0, 38, GAME_WIDTH, GAME_HEIGHT - 38);
    g.fillStyle(P.wallDark, 1); g.fillRect(22, 48, 916, 448);
    g.fillStyle(P.floorEdge, 1); g.fillRect(34, 60, 892, 424);

    const tile = 24;
    for (let y = 72; y < 474; y += tile) {
      for (let x = 46; x < 914; x += tile) {
        const colour = ((x + y) / tile) % 2 === 0 ? a : b;
        g.fillStyle(colour, 1); g.fillRect(x, y, 22, 22);
        g.fillStyle(P.outline, 0.28); g.fillRect(x, y + 20, 22, 2);
        if ((x + y) % 72 === 0) {
          g.fillStyle(P.metalLight, 0.16); g.fillRect(x + 4, y + 5, 8, 2);
        }
      }
    }
  }

  private drawTank(x: number, y: number, w: number, h: number, mark: string): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 5, y - 7, w + 10, h + 14);
    g.fillStyle(P.metalDark, 1); g.fillRect(x - 2, y - 4, w + 4, h + 8);
    g.fillStyle(P.fluidDark, 1); g.fillRect(x + 5, y + 7, w - 10, h - 19);
    g.fillStyle(P.fluid, 0.46); g.fillRect(x + 8, y + 10, w - 16, h - 25);
    g.fillStyle(P.greenBright, 0.25); g.fillRect(x + 11, y + 13, 5, h - 32);
    g.fillStyle(P.cream, 0.68); g.fillRect(x + Math.floor(w / 2) - 7, y + 40, 14, 7);
    g.fillRect(x + Math.floor(w / 2) - 4, y + 47, 8, 17);
    g.fillStyle(P.bruise, 0.75); g.fillRect(x + Math.floor(w / 2) + 3, y + 43, 5, 5);
    g.fillStyle(P.metalLight, 1); g.fillRect(x - 2, y - 4, w + 4, 5); g.fillRect(x - 2, y + h - 1, w + 4, 5);
    this.add.text(x + w - 9, y + 3, mark, this.pixelText('#d5ccb7', 7)).setOrigin(1, 0);
  }

  private drawBench(x: number, y: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 3, y - 3, w + 6, h + 6);
    g.fillStyle(P.woodDark, 1); g.fillRect(x, y, w, h);
    g.fillStyle(P.wood, 1); g.fillRect(x, y, w, 11);
    g.fillStyle(P.metalDark, 1); g.fillRect(x + 7, y + 17, w - 14, h - 25);
    for (let xx = x + 12; xx < x + w - 8; xx += 22) {
      g.fillStyle(P.metal, 0.7); g.fillRect(xx, y + h - 8, 4, 8);
    }
  }

  private drawConsole(x: number, y: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 4, y - 4, w + 8, h + 8);
    g.fillStyle(P.metalDark, 1); g.fillRect(x, y, w, h);
    g.fillStyle(0x17201b, 1); g.fillRect(x + 12, y + 9, w - 24, 41);
    g.fillStyle(P.greenDark, 1); g.fillRect(x + 18, y + 54, 24, 5);
    g.fillStyle(P.copper, 1); g.fillRect(x + 48, y + 54, 15, 5);
    g.fillStyle(P.red, 1); g.fillRect(x + 69, y + 54, 9, 5);
  }

  private drawCage(x: number, y: number, w: number, h: number, occupied: boolean): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 4, y - 4, w + 8, h + 8);
    g.fillStyle(P.wallDark, 1); g.fillRect(x, y, w, h);
    g.fillStyle(P.metal, 1); g.fillRect(x, y, w, 5); g.fillRect(x, y + h - 5, w, 5);
    for (let xx = x + 8; xx < x + w; xx += 12) g.fillRect(xx, y + 4, 3, h - 8);
    if (occupied) {
      g.fillStyle(P.cream, 0.85); g.fillRect(x + 36, y + 51, 30, 12); g.fillRect(x + 55, y + 44, 12, 12);
      g.fillStyle(P.bruise, 0.85); g.fillRect(x + 61, y + 48, 4, 4);
      g.fillStyle(P.green, 0.7); g.fillRect(x + 30, y + 47, 7, 5);
    }
  }

  private drawDoor(x: number, y: number, w: number, h: number, label: string): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 4, y - 4, w + 8, h + 8);
    g.fillStyle(P.metalDark, 1); g.fillRect(x, y, w, h);
    g.fillStyle(P.wall, 1); g.fillRect(x + 8, y + 9, w - 16, h - 18);
    g.fillStyle(P.greenBright, 0.75); g.fillRect(x + w - 17, y + 42, 5, 10);
    this.add.text(x + w / 2, y + 17, label, this.pixelText('#928b7c', 7)).setOrigin(0.5, 0);
  }

  private drawMarketStall(x: number, y: number, w: number, h: number, label: string, accent: number, tank: boolean): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x - 4, y - 4, w + 8, h + 8);
    g.fillStyle(P.wallDark, 1); g.fillRect(x, y, w, h);
    g.fillStyle(P.woodDark, 1); g.fillRect(x + 6, y + h - 31, w - 12, 25);
    g.fillStyle(P.wood, 1); g.fillRect(x + 3, y + h - 35, w - 6, 8);
    g.fillStyle(accent, 0.72); g.fillRect(x + 8, y + 8, w - 16, 17);
    this.add.text(x + 14, y + 12, label, this.pixelText('#e3dcc7', 8));

    if (tank) {
      g.fillStyle(P.metalDark, 1); g.fillRect(x + 16, y + 31, 42, 44);
      g.fillStyle(P.fluidDark, 1); g.fillRect(x + 21, y + 35, 32, 35);
      g.fillStyle(P.fluid, 0.45); g.fillRect(x + 25, y + 38, 24, 29);
      g.fillStyle(P.cream, 0.75); g.fillRect(x + 32, y + 49, 10, 7);
    } else {
      for (let i = 0; i < 5; i += 1) {
        g.fillStyle(i % 2 ? P.cream : accent, 0.8);
        g.fillRect(x + 18 + i * 22, y + 46 + (i % 2) * 5, 10, 9);
      }
    }

    this.drawNpc(x + w - 34, y + h - 35, P.coat, P.skin, 1);
  }

  private drawPlayer(x: number, y: number, side: boolean): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 0.7); g.fillRect(x - 8, y + 11, 18, 5);
    g.fillStyle(P.outline, 1); g.fillRect(x - 7, y - 13, 15, 25);
    g.fillStyle(P.skin, 1); g.fillRect(x - 5, y - 12, 11, 8);
    g.fillStyle(P.hair, 1); g.fillRect(x - 6, y - 15, 12, 5); g.fillRect(x - 7, y - 12, 3, 6);
    g.fillStyle(P.coat, 1); g.fillRect(x - 6, y - 3, 13, 11);
    g.fillStyle(P.green, 1); g.fillRect(x - 2, y - 2, 4, 8);
    g.fillStyle(P.woodDark, 1); g.fillRect(x - 6, y + 8, 5, 6); g.fillRect(x + 2, y + 8, 5, 6);
    if (!side) {
      g.fillStyle(P.cream, 0.8); g.fillRect(x - 3, y - 10, 2, 2); g.fillRect(x + 2, y - 10, 2, 2);
    }
  }

  private drawNpc(x: number, y: number, clothes: number, skin: number, hairVariant: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 0.6); g.fillRect(x - 7, y + 11, 15, 4);
    g.fillStyle(P.outline, 1); g.fillRect(x - 6, y - 12, 13, 25);
    g.fillStyle(skin, 1); g.fillRect(x - 4, y - 10, 9, 7);
    g.fillStyle(hairVariant === 2 ? 0x2e2521 : hairVariant === 1 ? 0x6b4d36 : 0x1c2523, 1);
    g.fillRect(x - 5, y - 13, 11, 5);
    g.fillStyle(clothes, 1); g.fillRect(x - 5, y - 2, 11, 12);
    g.fillStyle(P.metalLight, 0.7); g.fillRect(x - 5, y + 10, 4, 4); g.fillRect(x + 2, y + 10, 4, 4);
  }

  private drawSmallRabwolf(x: number, y: number, scale: number): void {
    const g = this.add.graphics();
    const s = scale;
    g.fillStyle(P.outline, 0.65); g.fillRect(x - 3 * s, y + 14 * s, 32 * s, 4 * s);
    g.fillStyle(P.outline, 1); g.fillRect(x, y, 25 * s, 13 * s); g.fillRect(x + 20 * s, y - 4 * s, 14 * s, 12 * s);
    g.fillStyle(0x686c60, 1); g.fillRect(x + 2 * s, y + 2 * s, 21 * s, 9 * s); g.fillRect(x + 22 * s, y - 2 * s, 10 * s, 8 * s);
    g.fillStyle(P.cream, 1); g.fillRect(x + 24 * s, y - 9 * s, 3 * s, 8 * s); g.fillRect(x + 30 * s, y - 8 * s, 3 * s, 8 * s);
    g.fillStyle(P.blood, 1); g.fillRect(x + 30 * s, y + 1 * s, 2 * s, 2 * s);
    g.fillStyle(P.green, 1); g.fillRect(x + 7 * s, y - 4 * s, 5 * s, 6 * s); g.fillRect(x + 13 * s, y - 6 * s, 4 * s, 7 * s);
    g.fillStyle(P.metal, 1); g.fillRect(x + 4 * s, y + 5 * s, 5 * s, 5 * s); g.fillRect(x + 15 * s, y + 5 * s, 5 * s, 5 * s);
    g.fillStyle(0x686c60, 1); g.fillRect(x - 6 * s, y + 1 * s, 8 * s, 4 * s); g.fillRect(x - 9 * s, y - 1 * s, 4 * s, 3 * s);
    g.fillRect(x + 3 * s, y + 10 * s, 4 * s, 8 * s); g.fillRect(x + 18 * s, y + 10 * s, 4 * s, 8 * s);
  }

  private drawBattleRabwolf(x: number, y: number, scale: number): void {
    const g = this.add.graphics();
    const s = scale;
    g.fillStyle(P.outline, 0.65); g.fillRect(x - 12 * s, y + 35 * s, 70 * s, 6 * s);
    g.fillStyle(P.outline, 1); g.fillRect(x, y + 5 * s, 48 * s, 25 * s); g.fillRect(x + 40 * s, y - 7 * s, 28 * s, 23 * s);
    g.fillStyle(0x62665a, 1); g.fillRect(x + 4 * s, y + 8 * s, 41 * s, 18 * s); g.fillRect(x + 44 * s, y - 3 * s, 20 * s, 15 * s);
    g.fillStyle(P.cream, 1); g.fillRect(x + 48 * s, y - 18 * s, 7 * s, 16 * s); g.fillRect(x + 59 * s, y - 17 * s, 7 * s, 16 * s);
    g.fillStyle(P.green, 1); g.fillRect(x + 8 * s, y - 4 * s, 9 * s, 12 * s); g.fillRect(x + 20 * s, y - 8 * s, 9 * s, 15 * s); g.fillRect(x + 32 * s, y - 4 * s, 8 * s, 12 * s);
    g.fillStyle(P.metalLight, 1); g.fillRect(x + 10 * s, y + 10 * s, 8 * s, 8 * s); g.fillRect(x + 27 * s, y + 13 * s, 8 * s, 8 * s);
    g.fillStyle(P.blood, 1); g.fillRect(x + 60 * s, y + 2 * s, 4 * s, 4 * s);
    g.fillStyle(0x62665a, 1); g.fillRect(x - 13 * s, y + 9 * s, 16 * s, 7 * s); g.fillRect(x - 20 * s, y + 4 * s, 9 * s, 6 * s);
    g.fillRect(x + 5 * s, y + 27 * s, 8 * s, 14 * s); g.fillRect(x + 35 * s, y + 27 * s, 8 * s, 14 * s);
  }

  private drawBattleBoar(x: number, y: number, scale: number): void {
    const g = this.add.graphics();
    const s = scale;
    g.fillStyle(P.outline, 0.65); g.fillRect(x - 10 * s, y + 40 * s, 74 * s, 7 * s);
    g.fillStyle(P.outline, 1); g.fillRect(x, y + 5 * s, 52 * s, 30 * s); g.fillRect(x - 10 * s, y + 12 * s, 25 * s, 21 * s);
    g.fillStyle(0x5f625c, 1); g.fillRect(x + 4 * s, y + 8 * s, 44 * s, 23 * s); g.fillRect(x - 7 * s, y + 15 * s, 20 * s, 14 * s);
    g.fillStyle(P.metalLight, 1); g.fillRect(x + 13 * s, y, 13 * s, 10 * s); g.fillRect(x + 30 * s, y + 2 * s, 13 * s, 10 * s); g.fillRect(x + 36 * s, y + 15 * s, 13 * s, 10 * s);
    g.fillStyle(P.cream, 1); g.fillRect(x - 13 * s, y + 25 * s, 8 * s, 4 * s); g.fillRect(x - 12 * s, y + 19 * s, 7 * s, 4 * s);
    g.fillStyle(P.red, 1); g.fillRect(x + 3 * s, y + 18 * s, 4 * s, 4 * s);
    g.fillStyle(P.greenDark, 1); g.fillRect(x + 25 * s, y + 12 * s, 7 * s, 7 * s);
    g.fillStyle(0x5f625c, 1); g.fillRect(x + 6 * s, y + 31 * s, 9 * s, 15 * s); g.fillRect(x + 38 * s, y + 31 * s, 9 * s, 15 * s);
  }

  private drawBattleStatus(x: number, y: number, w: number, name: string, level: string, hp: number, max: number, accent: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 1); g.fillRect(x, y, w, 66);
    g.fillStyle(P.wallDark, 1); g.fillRect(x + 4, y + 4, w - 8, 58);
    g.lineStyle(2, P.metal, 1); g.strokeRect(x + 4.5, y + 4.5, w - 9, 57);
    this.add.text(x + 14, y + 12, name, this.pixelText('#e3dcc7', 11));
    this.add.text(x + w - 14, y + 12, level, this.pixelText('#928b7c', 9)).setOrigin(1, 0);
    this.add.text(x + 14, y + 36, 'HP', this.pixelText('#d2c9b5', 8));
    g.fillStyle(P.outline, 1); g.fillRect(x + 43, y + 36, w - 64, 10);
    g.fillStyle(accent, 1); g.fillRect(x + 45, y + 38, Math.max(1, Math.floor((w - 68) * (hp / max))), 6);
    this.add.text(x + w - 14, y + 49, `${hp}/${max}`, this.pixelText('#928b7c', 8)).setOrigin(1, 0);
  }

  private drawLocationLabel(title: string, subtitle: string, prompt: string, x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(P.outline, 0.96); g.fillRect(x - 166, y, 332, 54);
    g.fillStyle(P.wallDark, 0.98); g.fillRect(x - 163, y + 3, 326, 48);
    g.lineStyle(1, P.metal, 1); g.strokeRect(x - 162.5, y + 3.5, 325, 47);
    this.add.text(x - 150, y + 8, title, this.pixelText('#e3dcc7', 10));
    this.add.text(x - 150, y + 23, subtitle, this.pixelText('#928b7c', 8));
    this.add.text(x + 150, y + 38, prompt, this.pixelText('#b3d867', 8)).setOrigin(1, 0);
  }

  private addAmbientTankPulse(x: number, y: number): void {
    const glow = this.add.rectangle(x, y, 33, 77, P.greenBright, 0.05);
    this.tweens.add({ targets: glow, alpha: 0.16, duration: 1200, yoyo: true, repeat: -1 });
  }

  private pixelText(colour: string, size: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      color: colour,
      fontStyle: 'bold',
    };
  }
}
