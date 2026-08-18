import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

const V = {
  void: 0x111414,
  wallDeep: 0x1b1f1e,
  wall: 0x292d2a,
  floor: 0x242826,
  floorLine: 0x697066,
  metal: 0x4a4f49,
  metalLight: 0x6f756d,
  bone: 0xd1c8b5,
  boneMuted: 0x9f9889,
  moss: 0x66715a,
  mossDeep: 0x394139,
  copper: 0xa56849,
  copperDeep: 0x684433,
  bruise: 0x70566e,
  cyan: 0x6f989a,
  acid: 0xa6b96e,
  blood: 0x874744,
  warmLight: 0xe4b978,
} as const;

export class VisualDirectionScene extends Phaser.Scene {
  constructor() { super('VisualDirection'); }

  create(): void {
    this.cameras.main.setBackgroundColor(V.void);
    fadeIn(this, 180);
    this.drawRoom();
    this.drawWorkshopFurniture();
    this.drawScaleProxies();
    this.addAmbientLife();
    this.addReviewCopy();

    const continueToPrototype = (): void => transitionTo(this, 'Title', { duration: 120 });
    this.input.keyboard?.once('keydown-ENTER', continueToPrototype);
    this.input.keyboard?.once('keydown-SPACE', continueToPrototype);
    this.input.once('pointerdown', continueToPrototype);
  }

  private drawRoom(): void {
    const g = this.add.graphics();

    g.fillStyle(V.void, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    g.fillStyle(V.floor, 1);
    g.fillRect(30, 30, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    g.lineStyle(1, V.floorLine, 0.08);
    for (let x = 54; x < GAME_WIDTH - 30; x += 24) g.lineBetween(x, 66, x, GAME_HEIGHT - 54);
    for (let y = 66; y < GAME_HEIGHT - 30; y += 24) g.lineBetween(54, y, GAME_WIDTH - 54, y);

    g.fillStyle(V.wallDeep, 1);
    g.fillRect(30, 30, GAME_WIDTH - 60, 40);
    g.fillRect(30, 30, 34, GAME_HEIGHT - 60);
    g.fillRect(GAME_WIDTH - 64, 30, 34, GAME_HEIGHT - 60);

    g.fillStyle(V.wall, 1);
    g.fillRect(64, 70, GAME_WIDTH - 128, 18);

    g.fillStyle(V.warmLight, 0.025);
    g.fillCircle(470, 255, 205);
    g.fillStyle(V.cyan, 0.02);
    g.fillCircle(180, 216, 145);

    g.fillStyle(V.void, 0.55);
    g.fillRect(30, GAME_HEIGHT - 62, GAME_WIDTH - 60, 32);
  }

  private drawWorkshopFurniture(): void {
    const g = this.add.graphics();

    // Specimen wall: repetition is compact, colour is localised to the contents.
    g.fillStyle(V.wallDeep, 1);
    g.fillRoundedRect(78, 104, 212, 214, 8);
    g.lineStyle(2, V.metal, 0.75);
    g.strokeRoundedRect(78, 104, 212, 214, 8);

    for (let i = 0; i < 3; i += 1) {
      const x = 96 + i * 62;
      g.fillStyle(0x151919, 1);
      g.fillRoundedRect(x, 126, 48, 128, 6);
      g.lineStyle(2, V.metalLight, 0.55);
      g.strokeRoundedRect(x, 126, 48, 128, 6);
      g.fillStyle(i === 1 ? V.acid : V.cyan, 0.18);
      g.fillRoundedRect(x + 7, 146, 34, 90, 12);
      g.fillStyle(V.bone, 0.46);
      g.fillCircle(x + 24, 183 + i * 5, 7 + i);
      if (i === 2) {
        g.fillStyle(V.blood, 0.62);
        g.fillCircle(x + 29, 187, 3);
      }
    }

    // Central operating island: visually important but physically modest.
    g.fillStyle(V.void, 0.55);
    g.fillEllipse(480, 298, 240, 88);
    g.fillStyle(V.copperDeep, 1);
    g.fillRoundedRect(376, 218, 208, 112, 12);
    g.fillStyle(V.metal, 1);
    g.fillRoundedRect(388, 206, 184, 104, 10);
    g.lineStyle(2, V.metalLight, 0.55);
    g.strokeRoundedRect(388, 206, 184, 104, 10);
    g.fillStyle(V.boneMuted, 0.95);
    g.fillRoundedRect(416, 225, 128, 48, 16);
    g.fillStyle(V.bruise, 0.52);
    g.fillEllipse(478, 249, 72, 22);
    g.fillStyle(V.bone, 0.85);
    g.fillCircle(442, 249, 7);
    g.fillCircle(514, 249, 6);
    g.lineStyle(3, V.copper, 0.72);
    g.lineBetween(414, 289, 360, 314);
    g.lineBetween(546, 289, 610, 318);

    // Small instrument trolley and local task light.
    g.fillStyle(V.metal, 1);
    g.fillRoundedRect(332, 236, 34, 58, 5);
    g.fillStyle(V.acid, 0.65);
    g.fillCircle(349, 250, 3);
    g.fillStyle(V.copper, 0.75);
    g.fillRect(340, 266, 18, 4);
    g.lineStyle(3, V.metalLight, 0.8);
    g.lineBetween(366, 221, 356, 182);
    g.lineBetween(356, 182, 380, 158);
    g.fillStyle(V.warmLight, 0.75);
    g.fillCircle(381, 157, 7);

    // Right machinery cluster, mostly neutral with tiny readable status accents.
    g.fillStyle(V.wallDeep, 1);
    g.fillRoundedRect(682, 112, 190, 168, 10);
    g.lineStyle(2, V.metal, 0.8);
    g.strokeRoundedRect(682, 112, 190, 168, 10);
    g.fillStyle(V.metal, 1);
    g.fillRoundedRect(704, 136, 68, 108, 8);
    g.fillRoundedRect(788, 132, 62, 116, 8);
    g.fillStyle(V.cyan, 0.75);
    g.fillCircle(725, 157, 4);
    g.fillStyle(V.copper, 0.9);
    g.fillCircle(744, 157, 4);
    g.fillStyle(V.blood, 0.8);
    g.fillCircle(816, 155, 4);
    g.lineStyle(4, V.copperDeep, 0.75);
    g.lineBetween(730, 244, 730, 302);
    g.lineBetween(818, 248, 842, 304);

    // Holding pens at the lower left. The oddity is in the occupant, not the architecture.
    g.fillStyle(V.wallDeep, 0.95);
    g.fillRoundedRect(94, 344, 248, 122, 8);
    g.lineStyle(2, V.metal, 0.7);
    g.strokeRoundedRect(94, 344, 248, 122, 8);
    for (let x = 126; x <= 310; x += 31) g.lineBetween(x, 352, x, 456);
    g.lineBetween(102, 404, 334, 404);

    // Exit and dead storage occupy darker corners so the centre remains the visual home.
    g.fillStyle(V.void, 0.9);
    g.fillRoundedRect(768, 352, 104, 116, 8);
    g.lineStyle(2, V.mossDeep, 0.9);
    g.strokeRoundedRect(768, 352, 104, 116, 8);
    g.fillStyle(V.moss, 0.55);
    g.fillRect(808, 371, 24, 5);
    g.fillStyle(V.boneMuted, 0.6);
    g.fillCircle(850, 410, 3);
  }

  private drawScaleProxies(): void {
    const g = this.add.graphics();

    // Player proxy: deliberately simple. WP0.4E owns the actual sprite language.
    g.fillStyle(V.void, 0.55);
    g.fillEllipse(575, 389, 20, 8);
    g.fillStyle(V.bone, 0.95);
    g.fillCircle(575, 368, 5);
    g.fillStyle(V.moss, 1);
    g.fillRoundedRect(570, 373, 10, 15, 3);
    g.fillStyle(V.copper, 0.95);
    g.fillRect(568, 378, 3, 9);

    // Common-creature scale proxy in the pen.
    g.fillStyle(V.void, 0.5);
    g.fillEllipse(211, 431, 24, 7);
    g.fillStyle(V.boneMuted, 0.9);
    g.fillEllipse(210, 420, 19, 12);
    g.fillCircle(220, 416, 6);
    g.lineStyle(3, V.boneMuted, 0.9);
    g.lineBetween(219, 411, 216, 401);
    g.lineBetween(224, 411, 227, 401);
    g.lineStyle(2, V.bruise, 0.8);
    g.lineBetween(202, 421, 194, 414);
  }

  private addAmbientLife(): void {
    const tankGlow = this.add.rectangle(182, 194, 30, 82, V.acid, 0.08);
    tankGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: tankGlow,
      alpha: { from: 0.05, to: 0.18 },
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    for (let i = 0; i < 5; i += 1) {
      const bubble = this.add.circle(170 + (i % 3) * 8, 226 - i * 8, 1.5 + (i % 2), V.bone, 0.35);
      this.tweens.add({
        targets: bubble,
        y: bubble.y - 34,
        alpha: 0,
        duration: 1600 + i * 240,
        delay: i * 280,
        repeat: -1,
        ease: 'Sine.Out',
      });
    }

    const warning = this.add.circle(816, 155, 4, V.blood, 0.6);
    this.tweens.add({ targets: warning, alpha: 0.18, duration: 780, yoyo: true, repeat: -1 });
  }

  private addReviewCopy(): void {
    this.add.text(50, 43, 'WP0.4C // VISUAL DIRECTION STUDY', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '10px',
      color: '#9f9889',
      letterSpacing: 1.2,
    });

    this.add.text(50, 495, 'SMALL WORLD • QUIET UI • LOCAL COLOUR • BIOLOGY IN THE DETAILS', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '9px',
      color: '#7f7b70',
      letterSpacing: 0.8,
    });

    this.add.text(GAME_WIDTH - 48, GAME_HEIGHT - 34, 'ENTER / CLICK  →  EXISTING PROTOTYPE', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '9px',
      color: '#a6b96e',
    }).setOrigin(1, 1);
  }
}
