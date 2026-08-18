import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';
import { ACTIONS } from '../input/actions.js';
import type { SemanticInput } from '../input/SemanticInput.js';
import { wrappedText } from './helpers.js';

export interface FocusableControl {
  setFocused(focused: boolean): void;
  activate(): void;
  setFocusRequester(requester: (() => void) | undefined): void;
  setVisible(visible: boolean): void;
  setEnabled(enabled: boolean): void;
}

export interface ButtonControl extends FocusableControl {
  readonly container: Phaser.GameObjects.Container;
}

export function addPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, alpha = 0.96): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  // Cartoon sticker-card treatment: soft offset shadow, warm paper surface,
  // dark plum outline and a deliberately imperfect inner accent.
  g.fillStyle(PALETTE.inkDark, 0.18 * alpha);
  g.fillRoundedRect(x + 7, y + 8, width, height, 18);
  g.fillStyle(PALETTE.paper, alpha);
  g.fillRoundedRect(x, y, width, height, 18);
  g.lineStyle(4, PALETTE.inkDark, 0.74);
  g.strokeRoundedRect(x, y, width, height, 18);
  g.lineStyle(2, PALETTE.candy, 0.28);
  g.strokeRoundedRect(x + 8, y + 8, width - 16, height - 16, 12);
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
): ButtonControl {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const text = scene.add.text(0, -1, label, {
    ...TEXT.mono,
    fontSize: '13px',
    color: '#392c35',
    align: 'center',
    wordWrap: { width: width - 24, useAdvancedWrap: true },
  }).setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(width, 42).setInteractive({ useHandCursor: true });

  let focused = false;
  let enabled = true;
  let focusRequester: (() => void) | undefined;

  const render = (): void => {
    bg.clear();
    bg.fillStyle(PALETTE.inkDark, enabled ? 0.23 : 0.1);
    bg.fillRoundedRect(-width / 2 + 4, -17, width, 38, 14);
    bg.fillStyle(focused ? accent : PALETTE.paper, enabled ? 1 : 0.62);
    bg.fillRoundedRect(-width / 2, -21, width, 38, 14);
    bg.lineStyle(focused ? 4 : 3, PALETTE.inkDark, enabled ? 0.86 : 0.3);
    bg.strokeRoundedRect(-width / 2, -21, width, 38, 14);
    if (focused) {
      bg.lineStyle(2, PALETTE.paper, 0.78);
      bg.strokeRoundedRect(-width / 2 + 6, -15, width - 12, 26, 9);
    }
    text.setColor(enabled ? '#392c35' : '#7f7380');
    container.setAlpha(enabled ? 1 : 0.7);
  };

  const control: ButtonControl = {
    container,
    setFocused(value: boolean): void { focused = value; render(); },
    activate(): void { if (enabled) onClick(); },
    setFocusRequester(requester: (() => void) | undefined): void { focusRequester = requester; },
    setVisible(visible: boolean): void { container.setVisible(visible); },
    setEnabled(value: boolean): void {
      enabled = value;
      if (value) container.setInteractive({ useHandCursor: true }); else container.disableInteractive();
      render();
    },
  };

  container.on('pointerover', () => { if (!enabled) return; focusRequester?.(); if (!focusRequester) control.setFocused(true); });
  container.on('pointerout', () => { if (!focusRequester) control.setFocused(false); });
  container.on('pointerdown', () => control.activate());
  render();
  return control;
}

export class FocusMenu {
  private index = 0;
  private enabled = true;

  constructor(
    private readonly input: SemanticInput,
    private readonly controls: FocusableControl[],
    private readonly orientation: 'horizontal' | 'vertical' = 'vertical',
  ) {
    controls.forEach((control, index) => control.setFocusRequester(() => this.setIndex(index)));
    this.renderFocus();
  }

  update(): void {
    if (!this.enabled || this.controls.length === 0) return;
    const previous = this.orientation === 'vertical'
      ? this.input.justDown(ACTIONS.MOVE_UP) || this.input.justDown(ACTIONS.MOVE_LEFT)
      : this.input.justDown(ACTIONS.MOVE_LEFT) || this.input.justDown(ACTIONS.MOVE_UP);
    const next = this.orientation === 'vertical'
      ? this.input.justDown(ACTIONS.MOVE_DOWN) || this.input.justDown(ACTIONS.MOVE_RIGHT)
      : this.input.justDown(ACTIONS.MOVE_RIGHT) || this.input.justDown(ACTIONS.MOVE_DOWN);

    if (previous) this.setIndex(this.index - 1);
    else if (next) this.setIndex(this.index + 1);

    if (this.input.justDown(ACTIONS.CONFIRM)) this.controls[this.index]?.activate();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.controls.forEach((control) => control.setEnabled(enabled));
    this.renderFocus();
  }

  setIndex(index: number): void {
    if (this.controls.length === 0) return;
    this.index = ((index % this.controls.length) + this.controls.length) % this.controls.length;
    this.renderFocus();
  }

  private renderFocus(): void {
    this.controls.forEach((control, index) => control.setFocused(this.enabled && index === this.index));
  }
}

export interface ModalHandle {
  show(title: string, body: string): void;
  hide(): void;
  setVisible(visible: boolean): void;
}

export function createModal(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): ModalHandle {
  const panel = addPanel(scene, x, y, width, height, 0.99).setDepth(50).setVisible(false);
  const titleText = scene.add.text(x + 22, y + 20, '', { ...TEXT.mono, fontSize: '11px', color: '#73439a' }).setDepth(51).setVisible(false);
  const bodyText = wrappedText(scene, x + 22, y + 45, '', width - 44, { fontSize: '17px', lineSpacing: 4 }).setDepth(51).setVisible(false);

  const setVisible = (visible: boolean): void => {
    panel.setVisible(visible);
    titleText.setVisible(visible);
    bodyText.setVisible(visible);
  };

  return {
    show(title: string, body: string): void { titleText.setText(title); bodyText.setText(body); setVisible(true); },
    hide(): void { setVisible(false); },
    setVisible,
  };
}

export interface DialogueBoxHandle extends ModalHandle {
  setPrompt(prompt: string): void;
}

export function createDialogueBox(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): DialogueBoxHandle {
  const panel = addPanel(scene, x, y, width, height, 0.99).setDepth(50).setVisible(false);
  const titleText = scene.add.text(x + 22, y + 20, '', { ...TEXT.mono, fontSize: '11px', color: '#73439a' }).setDepth(51).setVisible(false);
  const bodyText = wrappedText(scene, x + 22, y + 45, '', width - 44, { fontSize: '17px', lineSpacing: 4 }).setDepth(51).setVisible(false);
  const promptText = scene.add.text(x + width - 18, y + height - 14, '', { ...TEXT.mono, fontSize: '9px', color: '#5a365f' }).setOrigin(1, 1).setDepth(51).setVisible(false);

  const setVisible = (visible: boolean): void => {
    panel.setVisible(visible);
    titleText.setVisible(visible);
    bodyText.setVisible(visible);
    promptText.setVisible(visible);
  };

  return {
    show(title: string, body: string): void { titleText.setText(title); bodyText.setText(body); setVisible(true); },
    hide(): void { setVisible(false); },
    setVisible,
    setPrompt(prompt: string): void { promptText.setText(prompt); },
  };
}
