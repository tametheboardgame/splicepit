import Phaser from 'phaser';
import { SpriteSandboxScene } from './scenes/SpriteSandboxScene.js';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  render: { roundPixels: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: '100%',
    height: '100%',
  },
  scene: [SpriteSandboxScene],
};

const game = new Phaser.Game(config);
globalThis.__SPLICEPIT_GAME__ = game;
