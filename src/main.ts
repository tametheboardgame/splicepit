import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { LabScene } from './scenes/LabScene.js';
import { SpliceScene } from './scenes/SpliceScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#181512',
  pixelArt: false,
  antialias: true,
  render: { roundPixels: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, IntroScene, LabScene, SpliceScene, BattleScene],
};

const game = new Phaser.Game(config);
globalThis.__SPLICEPIT_GAME__ = game;
