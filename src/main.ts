import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { validateRuntimeContent } from './content/runtimeValidation.js';
import { installDeveloperDiagnostics } from './diagnostics/debugState.js';
import { installLabProtagonistRuntime } from './player/installLabProtagonistRuntime.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { LabScene } from './scenes/LabScene.js';
import { SpliceScene } from './scenes/SpliceScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { ProtagonistSpriteTestScene } from './scenes/ProtagonistSpriteTestScene.js';

validateRuntimeContent();
installLabProtagonistRuntime();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#181512',
  pixelArt: true,
  antialias: false,
  render: { roundPixels: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, IntroScene, LabScene, SpliceScene, BattleScene, ProtagonistSpriteTestScene],
};

const game = new Phaser.Game(config);
globalThis.__SPLICEPIT_GAME__ = game;
installDeveloperDiagnostics(game);
