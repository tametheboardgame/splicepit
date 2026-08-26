import {
  ACTIONS,
  DEFAULT_BINDINGS,
  SEMANTIC_INPUT_EVENT,
  touchInputAvailable,
  type SemanticAction,
  type SemanticInputEventDetail,
  type TouchControl,
} from './actions.js';

type VisualResetState = {
  readonly ready?: boolean;
  readonly phase?: string;
};

type DebugGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: VisualResetState;
};

type ActivePointer = {
  readonly control: TouchControl;
  readonly button: HTMLButtonElement;
};

const CONTROL_ID = 'mobile-gameplay-controls';
const activePointers = new Map<number, ActivePointer>();

function actionsFor(control: TouchControl): SemanticAction[] {
  const actions: SemanticAction[] = [];
  for (const action of Object.values(ACTIONS) as SemanticAction[]) {
    if ((DEFAULT_BINDINGS.touch?.[action] ?? []).includes(control)) actions.push(action);
  }
  return actions;
}

function emit(control: TouchControl, pressed: boolean): void {
  for (const action of actionsFor(control)) {
    const detail: SemanticInputEventDetail = { action, pressed };
    window.dispatchEvent(new CustomEvent<SemanticInputEventDetail>(SEMANTIC_INPUT_EVENT, { detail }));
  }
}

function releasePointer(pointerId: number): void {
  const active = activePointers.get(pointerId);
  if (!active) return;
  activePointers.delete(pointerId);
  active.button.classList.remove('is-pressed');
  emit(active.control, false);
}

function releaseAllPointers(): void {
  for (const pointerId of [...activePointers.keys()]) releasePointer(pointerId);
}

function controlButton(control: TouchControl, label: string, className: string, ariaLabel: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `mobile-control ${className}`;
  button.dataset.control = control;
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);

  button.addEventListener('contextmenu', (event) => event.preventDefault());
  button.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    if (activePointers.has(event.pointerId)) releasePointer(event.pointerId);
    activePointers.set(event.pointerId, { control, button });
    button.classList.add('is-pressed');
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // Some mobile browsers release capture aggressively; global pointer handlers remain a fallback.
    }
    emit(control, true);
  });

  const release = (event: PointerEvent): void => {
    event.preventDefault();
    releasePointer(event.pointerId);
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', (event) => releasePointer(event.pointerId));

  return button;
}

function buildControls(): HTMLElement {
  const root = document.createElement('div');
  root.id = CONTROL_ID;
  root.className = 'mobile-gameplay-controls';
  root.setAttribute('aria-label', 'Mobile gameplay controls');
  root.setAttribute('aria-hidden', 'true');

  const dpad = document.createElement('div');
  dpad.className = 'mobile-dpad';
  dpad.setAttribute('aria-label', 'Movement controls');
  const runButton = controlButton('run', 'RUN', 'mobile-run-button', 'Hold to run');
  runButton.style.gridColumn = '3';
  runButton.style.gridRow = '3';
  runButton.style.fontSize = '12px';
  runButton.style.borderRadius = '50%';
  dpad.append(
    controlButton('move-up', '↑', 'mobile-dpad-up', 'Move up'),
    controlButton('move-left', '←', 'mobile-dpad-left', 'Move left'),
    controlButton('move-right', '→', 'mobile-dpad-right', 'Move right'),
    controlButton('move-down', '↓', 'mobile-dpad-down', 'Move down'),
    runButton,
  );

  const actions = document.createElement('div');
  actions.className = 'mobile-action-cluster';

  const utilities = document.createElement('div');
  utilities.className = 'mobile-utility-row';
  utilities.append(
    controlButton('bag', 'BAG', 'mobile-utility-button', 'Open or close Bag'),
    controlButton('map', 'MAP', 'mobile-utility-button', 'Open or close Map'),
  );

  const primary = document.createElement('div');
  primary.className = 'mobile-primary-row';
  primary.append(
    controlButton('back', 'BACK', 'mobile-back-button', 'Back or cancel'),
    controlButton('action', 'ACTION', 'mobile-action-button', 'Interact or confirm'),
  );

  actions.append(utilities, primary);
  root.append(dpad, actions);
  document.body.append(root);
  return root;
}

function isGameplayActive(): boolean {
  const state = (globalThis as DebugGlobal).__SPLICEPIT_VISUAL_RESET__;
  return Boolean(state?.ready && state.phase === 'confirmed');
}

function startVisibilitySync(root: HTMLElement): void {
  let visible = false;

  const sync = (): void => {
    const nextVisible = touchInputAvailable() && isGameplayActive();
    if (nextVisible !== visible) {
      visible = nextVisible;
      root.classList.toggle('is-active', visible);
      root.setAttribute('aria-hidden', visible ? 'false' : 'true');
      document.body.classList.toggle('mobile-gameplay-active', visible);
      if (!visible) releaseAllPointers();
    }
    window.setTimeout(sync, 120);
  };

  sync();
}

if (!document.getElementById(CONTROL_ID)) {
  startVisibilitySync(buildControls());
}

window.addEventListener('blur', releaseAllPointers);
window.addEventListener('pointerup', (event) => releasePointer(event.pointerId), { passive: false });
window.addEventListener('pointercancel', (event) => releasePointer(event.pointerId), { passive: false });
