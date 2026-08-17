import type Phaser from 'phaser';
import type { SplicePitDebugApi } from './diagnostics/debugState.js';

declare global {
  var __SPLICEPIT_GAME__: Phaser.Game | undefined;
  var __SPLICEPIT_DEBUG__: SplicePitDebugApi | undefined;
}

export {};
