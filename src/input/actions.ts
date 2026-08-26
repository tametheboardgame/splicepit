export const ACTIONS = {
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  RUN: 'RUN',
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

export const SEMANTIC_INPUT_EVENT = 'splicepit-semantic-input';

export interface SemanticInputEventDetail {
  readonly action: SemanticAction;
  readonly pressed: boolean;
}

export type KeyboardControl =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'KeyW'
  | 'KeyA'
  | 'KeyS'
  | 'KeyD'
  | 'ShiftLeft'
  | 'ShiftRight'
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

export type TouchControl =
  | 'move-up'
  | 'move-down'
  | 'move-left'
  | 'move-right'
  | 'run'
  | 'action'
  | 'back'
  | 'menu'
  | 'bag'
  | 'map'
  | 'battle-1'
  | 'battle-2'
  | 'battle-3';

export interface DeviceBindingMap<Control extends string | number> {
  readonly [action: string]: readonly Control[] | undefined;
}

export interface SemanticBindingProfile {
  readonly keyboard: Readonly<Record<SemanticAction, readonly KeyboardControl[]>>;
  readonly gamepad?: DeviceBindingMap<number>;
  readonly touch?: DeviceBindingMap<TouchControl>;
}

export const DEFAULT_BINDINGS: SemanticBindingProfile = {
  keyboard: {
    MOVE_UP: ['ArrowUp', 'KeyW'],
    MOVE_DOWN: ['ArrowDown', 'KeyS'],
    MOVE_LEFT: ['ArrowLeft', 'KeyA'],
    MOVE_RIGHT: ['ArrowRight', 'KeyD'],
    RUN: ['ShiftLeft', 'ShiftRight'],
    INTERACT: ['KeyE', 'Space'],
    CONFIRM: ['Enter', 'Space'],
    CANCEL: ['Escape'],
    MENU: ['Tab'],
    BAG: ['KeyB'],
    MAP: ['KeyM'],
    LAB_INTERACT: ['KeyE', 'Space'],
    LAB_CANCEL: ['Escape'],
    BATTLE_PRIMARY: ['Digit1'],
    BATTLE_SECONDARY: ['Digit2'],
    BATTLE_TERTIARY: ['Digit3'],
  },
  gamepad: {},
  touch: {
    MOVE_UP: ['move-up'],
    MOVE_DOWN: ['move-down'],
    MOVE_LEFT: ['move-left'],
    MOVE_RIGHT: ['move-right'],
    RUN: ['run'],
    INTERACT: ['action'],
    CONFIRM: ['action'],
    CANCEL: ['back'],
    MENU: ['menu'],
    BAG: ['bag'],
    MAP: ['map'],
    LAB_INTERACT: ['action'],
    LAB_CANCEL: ['back'],
    BATTLE_PRIMARY: ['battle-1'],
    BATTLE_SECONDARY: ['battle-2'],
    BATTLE_TERTIARY: ['battle-3'],
  },
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
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
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

const TOUCH_CONTROL_LABELS: Readonly<Record<TouchControl, string>> = {
  'move-up': '↑',
  'move-down': '↓',
  'move-left': '←',
  'move-right': '→',
  run: 'RUN',
  action: 'ACTION',
  back: 'BACK',
  menu: 'MENU',
  bag: 'BAG',
  map: 'MAP',
  'battle-1': '1',
  'battle-2': '2',
  'battle-3': '3',
};

export function keyboardHint(action: SemanticAction, profile: SemanticBindingProfile = DEFAULT_BINDINGS): string {
  const labels = profile.keyboard[action].map((control) => CONTROL_LABELS[control]);
  return [...new Set(labels)].join('/');
}

export function touchHint(action: SemanticAction, profile: SemanticBindingProfile = DEFAULT_BINDINGS): string {
  const controls = profile.touch?.[action] ?? [];
  return controls.map((control) => TOUCH_CONTROL_LABELS[control]).join('/');
}

export function touchInputAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (navigator.maxTouchPoints > 0) return true;
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

export function preferredInputHint(action: SemanticAction, profile: SemanticBindingProfile = DEFAULT_BINDINGS): string {
  if (touchInputAvailable()) {
    const hint = touchHint(action, profile);
    if (hint) return hint;
  }
  return keyboardHint(action, profile);
}
