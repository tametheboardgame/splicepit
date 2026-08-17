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
): ButtonControl {
  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, 42, PALETTE.paperDeep, 0.94).setStrokeStyle(1, accent, 0.9);
  const text = scene.add.text(0, 0, label, { ...TEXT.mono, fontSize: '14px' }).setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(width, 42).setInteractive({ useHandCursor: true });

  let focused = false;
  let enabled = true;
  let focusRequester: (() => void) | undefined;

  const render = (): void => {
    bg.setFillStyle(focused ? accent : PALETTE.paperDeep, focused ? 0.32 : 0.94);
    bg.setStrokeStyle(focused ? 3 : 1, accent, enabled ? 0.9 : 0.32);
    text.setColor(focused ? '#ffffff' : '#a79d88');
    container.setAlpha(enabled ? 1 : 0.48);
  };

  const control: ButtonControl = {
    container,
    setFocused(value: boolean): void { focused = value; render(); },
    activate(): void { if (enabled) onClick(); },
    setFocusRequester(requester: (() => void) | undefined): void { focusRequester = requester; },
    setVisible(visible: boolean): void { container.setVisible(visible); },
    setEnabled(value: boolean): void { enabled = value; if (value) container.setInteractive({ useHandCursor: true }); else container.disableInteractive(); render(); },
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
  const panel = addPanel(scene, x, y, width, height, 0.985).setDepth(50).setVisible(false);
  const titleText = scene.add.text(x + 22, y + 20, '', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c' }).setDepth(51).setVisible(false);
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
  const panel = addPanel(scene, x, y, width, height, 0.985).setDepth(50).setVisible(false);
  const titleText = scene.add.text(x + 22, y + 20, '', { ...TEXT.mono, fontSize: '11px', color: '#b7c86c' }).setDepth(51).setVisible(false);
  const bodyText = wrappedText(scene, x + 22, y + 45, '', width - 44, { fontSize: '17px', lineSpacing: 4 }).setDepth(51).setVisible(false);
  const promptText = scene.add.text(x + width - 18, y + height - 14, '', { ...TEXT.mono, fontSize: '9px', color: '#a79d88' }).setOrigin(1, 1).setDepth(51).setVisible(false);

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
