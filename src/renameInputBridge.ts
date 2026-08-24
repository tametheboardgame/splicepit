import { RENAME_INPUT_BOX, SELECT_VIEW_HEIGHT, SELECT_VIEW_WIDTH } from './ui/apprenticeSelection.js';

type VisualResetState = {
  phase: 'select' | 'name' | 'confirmed';
};

type VisualResetGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: VisualResetState;
};

function debugState(): VisualResetState | undefined {
  return (globalThis as VisualResetGlobal).__SPLICEPIT_VISUAL_RESET__;
}

function mountRenameInputBridge(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#visual-reset-stage');
  const input = document.querySelector<HTMLInputElement>('#player-name-capture');
  if (!canvas || !input) {
    window.setTimeout(mountRenameInputBridge, 25);
    return;
  }

  let wasNaming = false;

  const positionInput = (): void => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / SELECT_VIEW_WIDTH;
    const scaleY = rect.height / SELECT_VIEW_HEIGHT;
    input.style.left = `${rect.left + RENAME_INPUT_BOX.x * scaleX}px`;
    input.style.top = `${rect.top + RENAME_INPUT_BOX.y * scaleY}px`;
    input.style.width = `${RENAME_INPUT_BOX.width * scaleX}px`;
    input.style.height = `${Math.max(26, RENAME_INPUT_BOX.height * scaleY)}px`;
    input.style.fontSize = `${Math.max(14, 18 * scaleY)}px`;
  };

  const focusForNaming = (): void => {
    if (debugState()?.phase !== 'name') return;
    input.classList.add('is-active');
    positionInput();
    input.focus({ preventScroll: true });
    input.select();
  };

  const sync = (): void => {
    const naming = debugState()?.phase === 'name';
    if (naming) {
      input.classList.add('is-active');
      positionInput();
      if (!wasNaming) requestAnimationFrame(focusForNaming);
    } else {
      input.classList.remove('is-active');
    }
    wasNaming = naming;
    requestAnimationFrame(sync);
  };

  window.addEventListener('resize', positionInput);
  canvas.addEventListener('pointerdown', () => {
    requestAnimationFrame(() => {
      if (debugState()?.phase === 'name') focusForNaming();
    });
  });

  window.addEventListener('keydown', (event) => {
    if (debugState()?.phase !== 'name' || document.activeElement === input) return;
    if (event.code !== 'Enter' && event.code !== 'Escape') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    input.focus({ preventScroll: true });
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: event.key,
      code: event.code,
      bubbles: true,
      cancelable: true,
    }));
  }, true);

  requestAnimationFrame(sync);
}

mountRenameInputBridge();
