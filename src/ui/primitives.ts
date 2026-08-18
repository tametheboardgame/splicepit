import Phaser from 'phaser';
import { ACTIONS } from '../input/actions.js';
import type { SemanticInput } from '../input/SemanticInput.js';
import { wrappedText } from './helpers.js';
import { UI_COLOURS, UI_METRICS, UI_TEXT, type UiAccent, accentColour } from './theme.js';

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

export interface StatusBarHandle {
  setValue(value: number, maximum?: number): void;
  setVisible(visible: boolean): void;
}

export interface InventorySlotHandle {
  readonly container: Phaser.GameObjects.Container;
  setSelected(selected: boolean): void;
  setCount(count: number | undefined): void;
}

function drawPanelFrame(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number,
  accent?: number,
): void {
  g.fillStyle(UI_COLOURS.borderDark, alpha);
  g.fillRect(x, y, width, height);
  g.fillStyle(UI_COLOURS.panel, alpha);
  g.fillRect(x + 2, y + 2, width - 4, height - 4);
  g.lineStyle(1, UI_COLOURS.border, 0.95);
  g.strokeRect(x + 2.5, y + 2.5, width - 5, height - 5);
  g.lineStyle(1, UI_COLOURS.borderLight, 0.3);
  g.strokeRect(x + 5.5, y + 5.5, width - 11, height - 11);
  if (accent !== undefined) {
    g.fillStyle(accent, 1);
    g.fillRect(x + 6, y + 5, Math.min(44, width - 12), 2);
  }
}

export function addPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.96,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  drawPanelFrame(g, x, y, width, height, alpha);
  return g;
}

export function addHudPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  title?: string,
  accent: UiAccent = 'green',
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  drawPanelFrame(g, 0, 0, width, height, 0.97, accentColour(accent));
  container.add(g);
  if (title) {
    const heading = scene.add.text(10, 8, title.toUpperCase(), { ...UI_TEXT.label, color: colourHex(accentColour(accent)) });
    container.add(heading);
  }
  return container;
}

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  onClick: () => void,
  { accent = UI_COLOURS.greenBright }: { accent?: number } = {},
): ButtonControl {
  const container = scene.add.container(x, y);
  const height = UI_METRICS.buttonHeight;
  const bg = scene.add.rectangle(0, 0, width, height, UI_COLOURS.panelRaised, 0.98)
    .setStrokeStyle(1, UI_COLOURS.border, 1);
  const leftAccent = scene.add.rectangle(-(width / 2) + 2, 0, 3, height - 4, accent, 0.9).setOrigin(0, 0.5);
  const text = scene.add.text(0, 0, label.toUpperCase(), { ...UI_TEXT.bodySmall, fontStyle: 'bold' }).setOrigin(0.5);
  container.add([bg, leftAccent, text]);
  container.setSize(width, height).setInteractive({ useHandCursor: true });

  let focused = false;
  let enabled = true;
  let focusRequester: (() => void) | undefined;

  const render = (): void => {
    bg.setFillStyle(focused ? UI_COLOURS.panelInset : UI_COLOURS.panelRaised, 0.98);
    bg.setStrokeStyle(focused ? 2 : 1, focused ? accent : UI_COLOURS.border, enabled ? 1 : 0.35);
    leftAccent.setAlpha(enabled ? (focused ? 1 : 0.75) : 0.2);
    text.setColor(enabled ? (focused ? '#ffffff' : '#e3dcc7') : '#625f57');
    container.setAlpha(enabled ? 1 : 0.62);
  };

  const control: ButtonControl = {
    container,
    setFocused(value: boolean): void { focused = value; render(); },
    activate(): void { if (enabled) onClick(); },
    setFocusRequester(requester: (() => void) | undefined): void { focusRequester = requester; },
    setVisible(visible: boolean): void { container.setVisible(visible); },
    setEnabled(value: boolean): void {
      enabled = value;
      if (value) container.setInteractive({ useHandCursor: true });
      else container.disableInteractive();
      render();
    },
  };

  container.on('pointerover', () => {
    if (!enabled) return;
    focusRequester?.();
    if (!focusRequester) control.setFocused(true);
  });
  container.on('pointerout', () => { if (!focusRequester) control.setFocused(false); });
  container.on('pointerdown', () => control.activate());
  render();
  return control;
}

export function addPrompt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  label: string,
  accent: UiAccent = 'green',
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const colour = accentColour(accent);
  const keyWidth = Math.max(22, key.length * 7 + 10);
  const labelWidth = Math.max(70, label.length * 6 + 18);
  const totalWidth = keyWidth + labelWidth;
  const bg = scene.add.rectangle(0, 0, totalWidth, UI_METRICS.promptHeight, UI_COLOURS.panelInset, 0.94)
    .setOrigin(0)
    .setStrokeStyle(1, UI_COLOURS.border, 0.95);
  const keyBg = scene.add.rectangle(3, 3, keyWidth - 6, UI_METRICS.promptHeight - 6, UI_COLOURS.panelRaised, 1)
    .setOrigin(0)
    .setStrokeStyle(1, colour, 0.95);
  const keyText = scene.add.text(keyWidth / 2, UI_METRICS.promptHeight / 2, key.toUpperCase(), { ...UI_TEXT.bodySmall, fontStyle: 'bold', color: colourHex(colour) }).setOrigin(0.5);
  const labelText = scene.add.text(keyWidth + 8, UI_METRICS.promptHeight / 2, label, UI_TEXT.bodySmall).setOrigin(0, 0.5);
  container.add([bg, keyBg, keyText, labelText]);
  return container;
}

export function addTooltip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string,
  body: string,
  width = 210,
): Phaser.GameObjects.Container {
  const container = addHudPanel(scene, x, y, width, 72, title, 'amber');
  const bodyText = scene.add.text(10, 29, body, { ...UI_TEXT.bodySmall, color: '#c8c0ad', wordWrap: { width: width - 20 } });
  container.add(bodyText);
  return container;
}

export function addStatusBar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  value: number,
  maximum: number,
  accent: UiAccent = 'green',
): StatusBarHandle {
  const labelText = scene.add.text(x, y, label.toUpperCase(), UI_TEXT.micro);
  const numberText = scene.add.text(x + width, y, '', UI_TEXT.micro).setOrigin(1, 0);
  const frame = scene.add.rectangle(x, y + 12, width, 8, UI_COLOURS.panelInset, 1).setOrigin(0).setStrokeStyle(1, UI_COLOURS.border, 0.85);
  const fill = scene.add.rectangle(x + 2, y + 14, width - 4, 4, accentColour(accent), 1).setOrigin(0);

  let max = Math.max(1, maximum);
  const render = (current: number): void => {
    const clamped = Phaser.Math.Clamp(current, 0, max);
    fill.width = Math.max(0, (width - 4) * (clamped / max));
    numberText.setText(`${Math.round(clamped)}/${Math.round(max)}`);
  };
  render(value);

  return {
    setValue(current: number, newMaximum?: number): void {
      if (newMaximum !== undefined) max = Math.max(1, newMaximum);
      render(current);
    },
    setVisible(visible: boolean): void {
      labelText.setVisible(visible);
      numberText.setVisible(visible);
      frame.setVisible(visible);
      fill.setVisible(visible);
    },
  };
}

export function addInventorySlot(
  scene: Phaser.Scene,
  x: number,
  y: number,
  icon: string,
  count?: number,
  accent: UiAccent = 'green',
): InventorySlotHandle {
  const size = UI_METRICS.slot;
  const container = scene.add.container(x, y);
  const frame = scene.add.rectangle(0, 0, size, size, UI_COLOURS.panelInset, 1).setOrigin(0).setStrokeStyle(1, UI_COLOURS.border, 1);
  const glyph = scene.add.text(size / 2, size / 2 - 2, icon, { ...UI_TEXT.heading, fontSize: '18px' }).setOrigin(0.5);
  const countText = scene.add.text(size - 4, size - 3, '', UI_TEXT.micro).setOrigin(1, 1);
  container.add([frame, glyph, countText]);

  const setCount = (next: number | undefined): void => {
    countText.setText(next === undefined ? '' : `x${next}`);
  };
  setCount(count);

  return {
    container,
    setSelected(selected: boolean): void {
      frame.setStrokeStyle(selected ? 2 : 1, selected ? accentColour(accent) : UI_COLOURS.border, 1);
      frame.setFillStyle(selected ? UI_COLOURS.panelRaised : UI_COLOURS.panelInset, 1);
    },
    setCount,
  };
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
  const titleText = scene.add.text(x + 14, y + 12, '', UI_TEXT.label).setDepth(51).setVisible(false);
  const bodyText = wrappedText(scene, x + 14, y + 34, '', width - 28, { ...UI_TEXT.body, fontSize: '12px', lineSpacing: 3 }).setDepth(51).setVisible(false);

  const setVisible = (visible: boolean): void => {
    panel.setVisible(visible);
    titleText.setVisible(visible);
    bodyText.setVisible(visible);
  };

  return {
    show(title: string, body: string): void { titleText.setText(title.toUpperCase()); bodyText.setText(body); setVisible(true); },
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
  const titleText = scene.add.text(x + 14, y + 11, '', UI_TEXT.label).setDepth(51).setVisible(false);
  const bodyText = wrappedText(scene, x + 14, y + 31, '', width - 28, { ...UI_TEXT.body, fontSize: '12px', lineSpacing: 3 }).setDepth(51).setVisible(false);
  const promptText = scene.add.text(x + width - 12, y + height - 10, '', { ...UI_TEXT.micro, color: '#b3d867' }).setOrigin(1, 1).setDepth(51).setVisible(false);

  const setVisible = (visible: boolean): void => {
    panel.setVisible(visible);
    titleText.setVisible(visible);
    bodyText.setVisible(visible);
    promptText.setVisible(visible);
  };

  return {
    show(title: string, body: string): void { titleText.setText(title.toUpperCase()); bodyText.setText(body); setVisible(true); },
    hide(): void { setVisible(false); },
    setVisible,
    setPrompt(prompt: string): void { promptText.setText(prompt.toUpperCase()); },
  };
}

function colourHex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}
