import {
  ACTIONS,
  DEFAULT_BINDINGS,
  SEMANTIC_INPUT_EVENT,
} from './actions.js';
import type {
  KeyboardControl,
  SemanticAction,
  SemanticBindingProfile,
  SemanticInputEventDetail,
} from './actions.js';

export class BrowserSemanticInput {
  private readonly pressed = new Set<KeyboardControl>();
  private readonly virtualPressed = new Set<SemanticAction>();
  private readonly justPressed = new Set<SemanticAction>();
  private enabled = false;

  constructor(private readonly profile: SemanticBindingProfile = DEFAULT_BINDINGS) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.reset);
    window.addEventListener(SEMANTIC_INPUT_EVENT, this.onSemanticInput as EventListener);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.reset();
  }

  isDown(action: SemanticAction): boolean {
    return this.virtualPressed.has(action) || this.profile.keyboard[action].some((control) => this.pressed.has(control));
  }

  justDown(action: SemanticAction): boolean {
    if (!this.justPressed.has(action)) return false;
    this.justPressed.delete(action);
    return true;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.reset);
    window.removeEventListener(SEMANTIC_INPUT_EVENT, this.onSemanticInput as EventListener);
    this.reset();
  }

  private actionsFor(control: KeyboardControl): SemanticAction[] {
    const actions: SemanticAction[] = [];
    for (const action of Object.values(ACTIONS) as SemanticAction[]) {
      if (this.profile.keyboard[action].includes(control)) actions.push(action);
    }
    return actions;
  }

  private isSemanticAction(value: string): value is SemanticAction {
    return (Object.values(ACTIONS) as readonly string[]).includes(value);
  }

  private isKeyboardControl(code: string): code is KeyboardControl {
    return (Object.values(this.profile.keyboard).flat() as readonly string[]).includes(code);
  }

  private onSemanticInput = (event: CustomEvent<SemanticInputEventDetail>): void => {
    if (!this.enabled) return;
    const detail = event.detail;
    if (!detail || !this.isSemanticAction(detail.action)) return;

    if (detail.pressed) {
      if (this.virtualPressed.has(detail.action)) return;
      this.virtualPressed.add(detail.action);
      this.justPressed.add(detail.action);
      return;
    }

    this.virtualPressed.delete(detail.action);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled || event.repeat || !this.isKeyboardControl(event.code)) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

    const control = event.code;
    this.pressed.add(control);
    for (const action of this.actionsFor(control)) this.justPressed.add(action);

    if (this.actionsFor(control).some((action) =>
      action === ACTIONS.MOVE_UP || action === ACTIONS.MOVE_DOWN ||
      action === ACTIONS.MOVE_LEFT || action === ACTIONS.MOVE_RIGHT ||
      action === ACTIONS.CANCEL)) {
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (!this.isKeyboardControl(event.code)) return;
    this.pressed.delete(event.code);
  };

  private reset = (): void => {
    this.pressed.clear();
    this.virtualPressed.clear();
    this.justPressed.clear();
  };
}
