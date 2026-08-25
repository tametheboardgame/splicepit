export const ACTIONS = {
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  INTERACT: 'INTERACT',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  MENU: 'MENU',
  BAG: 'BAG',
  MAP: 'MAP',
  LAB_INTERACT: 'LAB_INTERACT',
  LAB_CANCEL: 'LAB_CANCEL',
  BATTLE_PRIMARY: 'BATTLE_PRIMARY',
  BATTLE_SECONDARY: 'BATTLE_SECONDARY',
  BATTLE_TERTIARY: 'BATTLE_TERTIARY',
} as const;

export type SemanticAction = typeof ACTIONS[keyof typeof ACTIONS];

export type KeyboardControl =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'KeyW'
  | 'KeyA'
  | 'KeyS'
  | 'KeyD'
  | 'KeyE'
  | 'KeyB'
  | 'Enter'
  | 'Space'
  | 'Escape'
  | 'Tab'
  | 'KeyM'
  | 'Digit1'
  | 'Digit2'
  | 'Digit3';

export interface DeviceBindingMap<Control extends string | number> {
  readonly [action: string]: readonly Control[] | undefined;
}

export interface SemanticBindingProfile {
  readonly keyboard: Readonly<Record<SemanticAction, readonly KeyboardControl[]>>;
  readonly gamepad?: DeviceBindingMap<number>;
  readonly touch?: DeviceBindingMap<string>;
}

export const DEFAULT_BINDINGS: SemanticBindingProfile = {
  keyboard: {
    MOVE_UP: ['ArrowUp', 'KeyW'],
    MOVE_DOWN: ['ArrowDown', 'KeyS'],
    MOVE_LEFT: ['ArrowLeft', 'KeyA'],
    MOVE_RIGHT: ['ArrowRight', 'KeyD'],
    INTERACT: ['KeyE', 'Space'],
    CONFIRM: ['Enter', 'Space'],
    CANCEL: ['Escape'],
    MENU: ['Tab', 'KeyM'],
    BAG: ['KeyB'],
    MAP: ['KeyM'],
    LAB_INTERACT: ['KeyE', 'Space'],
    LAB_CANCEL: ['Escape'],
    BATTLE_PRIMARY: ['Digit1'],
    BATTLE_SECONDARY: ['Digit2'],
    BATTLE_TERTIARY: ['Digit3'],
  },
  gamepad: {},
  touch: {},
};

const CONTROL_LABELS: Readonly<Record<KeyboardControl, string>> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  KeyW: 'W',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyE: 'E',
  KeyB: 'B',
  Enter: 'ENTER',
  Space: 'SPACE',
  Escape: 'ESC',
  Tab: 'TAB',
  KeyM: 'M',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
};

export function keyboardHint(action: SemanticAction, profile: SemanticBindingProfile = DEFAULT_BINDINGS): string {
  return profile.keyboard[action].map((control) => CONTROL_LABELS[control]).join('/');
}
