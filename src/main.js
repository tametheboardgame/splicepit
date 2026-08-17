import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { LabScene } from './scenes/LabScene.js';
import { SpliceScene } from './scenes/SpliceScene.js';
import { BattleScene } from './scenes/BattleScene.js';

if (!globalThis.Phaser) {
  document.getElementById('game').innerHTML = '<div style="padding:2rem;color:#e8dfc8">Unable to load the game engine. Check your connection and reload.</div>';
  throw new Error('Phaser failed to load');
}

const config = {
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

new Phaser.Game(config);
