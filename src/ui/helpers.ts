import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';

export function addNoiseLines(scene: Phaser.Scene, count = 90, alpha = 0.055): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  for (let i = 0; i < count; i += 1) {
    const y = Math.random() * scene.scale.height;
    const x = Math.random() * scene.scale.width;
    const w = 20 + Math.random() * 180;
    g.lineStyle(1, Math.random() > 0.5 ? PALETTE.bone : PALETTE.moss, alpha * Math.random());
    g.lineBetween(x, y, x + w, y + (Math.random() - 0.5) * 4);
  }
  return g;
}

export function wrappedText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  width: number,
  style: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    ...TEXT.body,
    fontSize: '18px',
    lineSpacing: 6,
    wordWrap: { width, useAdvancedWrap: true },
    ...style,
  });
}
