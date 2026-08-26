import Phaser from 'phaser';
import { ACTIONS, DEFAULT_BINDINGS, keyboardHint } from './actions.js';
import type { KeyboardControl, SemanticAction, SemanticBindingProfile } from './actions.js';

export interface SemanticInputAdapter {
  justDown(action: SemanticAction): boolean;
  isDown(action: SemanticAction): boolean;
  hint(action: SemanticAction): string | undefined;
}

const KEY_CODES: Readonly<Record<KeyboardControl, number>> = {
  ArrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
  ArrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
  ArrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
  ArrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  KeyW: Phaser.Input.Keyboard.KeyCodes.W,
  KeyA: Phaser.Input.Keyboard.KeyCodes.A,
  KeyS: Phaser.Input.Keyboard.KeyCodes.S,
  KeyD: Phaser.Input.Keyboard.KeyCodes.D,
  ShiftLeft: Phaser.Input.Keyboard.KeyCodes.SHIFT,
  ShiftRight: Phaser.Input.Keyboard.KeyCodes.SHIFT,
  KeyE: Phaser.Input.Keyboard.KeyCodes.E,
  KeyB: Phaser.Input.Keyboard.KeyCodes.B,
  Enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
  Space: Phaser.Input.Keyboard.KeyCodes.SPACE,
  Escape: Phaser.Input.Keyboard.KeyCodes.ESC,
  Tab: Phaser.Input.Keyboard.KeyCodes.TAB,
  KeyM: Phaser.Input.Keyboard.KeyCodes.M,
  Digit1: Phaser.Input.Keyboard.KeyCodes.ONE,
  Digit2: Phaser.Input.Keyboard.KeyCodes.TWO,
  Digit3: Phaser.Input.Keyboard.KeyCodes.THREE,
};

class KeyboardSemanticAdapter implements SemanticInputAdapter {
  private readonly keys = new Map<SemanticAction, Phaser.Input.Keyboard.Key[]>();

  constructor(scene: Phaser.Scene, private readonly profile: SemanticBindingProfile) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');

    for (const action of Object.values(ACTIONS) as SemanticAction[]) {
      this.keys.set(action, profile.keyboard[action].map((control) => keyboard.addKey(KEY_CODES[control])));
    }
  }

  justDown(action: SemanticAction): boolean {
    return (this.keys.get(action) ?? []).some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  isDown(action: SemanticAction): boolean {
    return (this.keys.get(action) ?? []).some((key) => key.isDown);
  }

  hint(action: SemanticAction): string {
    return keyboardHint(action, this.profile);
  }
}

export class SemanticInput {
  private readonly adapters: SemanticInputAdapter[] = [];

  constructor(scene: Phaser.Scene, profile: SemanticBindingProfile = DEFAULT_BINDINGS) {
    this.adapters.push(new KeyboardSemanticAdapter(scene, profile));
  }

  addAdapter(adapter: SemanticInputAdapter): void {
    this.adapters.push(adapter);
  }

  justDown(action: SemanticAction): boolean {
    return this.adapters.some((adapter) => adapter.justDown(action));
  }

  isDown(action: SemanticAction): boolean {
    return this.adapters.some((adapter) => adapter.isDown(action));
  }

  hint(action: SemanticAction): string {
    return this.adapters.map((adapter) => adapter.hint(action)).find((value): value is string => Boolean(value)) ?? action;
  }
}
