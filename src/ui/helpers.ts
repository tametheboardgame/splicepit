import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';

export function addPaperPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, alpha = 0.96): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.paper, alpha);
  g.lineStyle(2, PALETTE.bone, 0.34);
  g.fillRoundedRect(x, y, width, height, 8);
  g.strokeRoundedRect(x, y, width, height, 8);
  g.lineStyle(1, PALETTE.moss, 0.2);
  g.strokeRect(x + 6, y + 6, width - 12, height - 12);
  return g;
}

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  onClick: () => void,
  { accent = PALETTE.moss }: { accent?: number } = {},
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, 42, PALETTE.paperDeep, 0.94).setStrokeStyle(1, accent, 0.9);
  const text = scene.add.text(0, 0, label, { ...TEXT.mono, fontSize: '14px' }).setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(width, 42).setInteractive({ useHandCursor: true });
  container.on('pointerover', () => { bg.setFillStyle(accent, 0.32); text.setColor('#ffffff'); });
  container.on('pointerout', () => { bg.setFillStyle(PALETTE.paperDeep, 0.94); text.setColor('#a79d88'); });
  container.on('pointerdown', onClick);
  return container;
}

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
