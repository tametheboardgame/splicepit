import {
  drawTitleScreen,
  TITLE_ADVANCE_MS,
  TITLE_VIEW_HEIGHT,
  TITLE_VIEW_WIDTH,
} from './ui/titleCorruption.js';

type TitleDebug = {
  ready: boolean;
  error: string | null;
  titleRendered: boolean;
  elapsedMs: number;
  corruption: number;
  corruptionEventsPassed: number;
  maxCorruption: number;
  readyToAdvance: boolean;
  advanced: boolean;
};

type TitleGlobal = typeof globalThis & {
  __SPLICEPIT_TITLE__?: TitleDebug;
};

const query = new URLSearchParams(window.location.search);
const skipTitle = query.get('skipTitle') === '1';

if (skipTitle) {
  void import('./main.js');
} else {
  const root = document.getElementById('game') as HTMLElement | null;
  if (!root) throw new Error('Missing #game root');

  root.innerHTML = `
    <canvas
      id="visual-reset-stage"
      width="${TITLE_VIEW_WIDTH}"
      height="${TITLE_VIEW_HEIGHT}"
      aria-label="SplicePit title screen"
    ></canvas>
  `;

  const canvas = root.querySelector<HTMLCanvasElement>('#visual-reset-stage');
  const context = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !context) throw new Error('SplicePit title stage failed to mount');
  context.imageSmoothingEnabled = false;

  const debug: TitleDebug = {
    ready: true,
    error: null,
    titleRendered: false,
    elapsedMs: 0,
    corruption: 0,
    corruptionEventsPassed: 0,
    maxCorruption: 0,
    readyToAdvance: false,
    advanced: false,
  };
  (globalThis as TitleGlobal).__SPLICEPIT_TITLE__ = debug;

  let startedAt = performance.now();
  let frameHandle = 0;
  let advancing = false;

  const render = (now: number): void => {
    if (advancing) return;
    const elapsedMs = Math.max(0, now - startedAt);
    const state = drawTitleScreen(context, elapsedMs);
    debug.titleRendered = true;
    debug.elapsedMs = Math.round(elapsedMs);
    debug.corruption = state.corruption;
    debug.corruptionEventsPassed = state.corruptionEventsPassed;
    debug.maxCorruption = Math.max(debug.maxCorruption, state.corruption);
    debug.readyToAdvance = state.readyToAdvance;
    frameHandle = requestAnimationFrame(render);
  };

  const handOffToGame = (): void => {
    if (advancing) return;
    advancing = true;
    debug.advanced = true;
    debug.titleRendered = false;
    cancelAnimationFrame(frameHandle);
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    void import('./main.js').catch((error: unknown) => {
      debug.error = error instanceof Error ? error.message : String(error);
      console.error('Failed to hand off from title to game runtime', error);
    });
  };

  const advanceOrSkip = (): void => {
    const elapsedMs = performance.now() - startedAt;
    if (elapsedMs < TITLE_ADVANCE_MS) {
      startedAt = performance.now() - TITLE_ADVANCE_MS;
      return;
    }
    handOffToGame();
  };

  function onKeyDown(event: KeyboardEvent): void {
    if (event.code !== 'Enter' && event.code !== 'Space') return;
    event.preventDefault();
    advanceOrSkip();
  }

  function onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    advanceOrSkip();
  }

  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onPointerDown);
  frameHandle = requestAnimationFrame(render);
}
