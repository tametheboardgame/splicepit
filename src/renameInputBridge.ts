type VisualResetState = {
  phase: 'select' | 'name' | 'confirmed';
};

type VisualResetGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: VisualResetState;
};

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const INPUT_X = 300;
const INPUT_Y = 500;
const INPUT_WIDTH = 360;
const INPUT_HEIGHT = 28;

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
    const scaleX = rect.width / VIEW_WIDTH;
    const scaleY = rect.height / VIEW_HEIGHT;
    input.style.left = `${rect.left + INPUT_X * scaleX}px`;
    input.style.top = `${rect.top + INPUT_Y * scaleY}px`;
    input.style.width = `${INPUT_WIDTH * scaleX}px`;
    input.style.height = `${Math.max(24, INPUT_HEIGHT * scaleY)}px`;
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
      if (!wasNaming) {
        requestAnimationFrame(focusForNaming);
      }
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
