import {
  drawTitleScreen,
  TITLE_ADVANCE_MS,
  TITLE_VIEW_HEIGHT,
  TITLE_VIEW_WIDTH,
} from './ui/titleCorruption.js';
import {
  drawMainMenuScreen,
  firstEnabledMenuIndex,
  MAIN_MENU_ITEMS,
  mainMenuHitTest,
  moveMainMenuSelection,
  settingsBackHitTest,
  type MainMenuScreen,
} from './ui/mainMenu.js';
import {
  dialoguePageVisualState,
  dialogueRevealDurationMs,
  isDialogueTextSpeed,
  type DialogueTextSpeed,
} from './dialogue/presentation.js';
import { openingNarrationSequence } from './dialogue/openingNarration.js';
import { drawDialogueScreen } from './ui/dialoguePresentation.js';

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

type MenuDebug = {
  ready: boolean;
  error: string | null;
  rendered: boolean;
  screen: MainMenuScreen;
  selectedId: string | null;
  continueEnabled: boolean;
  statusText: string;
  settingsOpened: boolean;
  newGameStarted: boolean;
};

type DialogueDebug = {
  ready: boolean;
  error: string | null;
  rendered: boolean;
  sequenceId: string;
  pageIndex: number;
  pageId: string;
  visibleCharacters: number;
  textLength: number;
  textComplete: boolean;
  corruption: number;
  corruptionEventsPassed: number;
  maxCorruption: number;
  textSpeed: DialogueTextSpeed;
  skipped: boolean;
  completed: boolean;
  handedOffToSelector: boolean;
};

type BootGlobal = typeof globalThis & {
  __SPLICEPIT_TITLE__?: TitleDebug;
  __SPLICEPIT_MENU__?: MenuDebug;
  __SPLICEPIT_DIALOGUE__?: DialogueDebug;
};

const query = new URLSearchParams(window.location.search);
const skipTitle = query.get('skipTitle') === '1';
const menuTest = query.get('menuTest') === '1';
const dialogueTest = query.get('dialogueTest') === '1';
const requestedDialogueSpeed = query.get('dialogueSpeed');
const dialogueSpeed: DialogueTextSpeed = isDialogueTextSpeed(requestedDialogueSpeed)
  ? requestedDialogueSpeed
  : 'normal';

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
  if (!canvas || !context) throw new Error('SplicePit opening stage failed to mount');
  context.imageSmoothingEnabled = false;

  const handOffToSelector = (dialogueDebug?: DialogueDebug): void => {
    if (dialogueDebug) dialogueDebug.handedOffToSelector = true;
    void import('./main.js').catch((error: unknown) => {
      if (dialogueDebug) dialogueDebug.error = error instanceof Error ? error.message : String(error);
      console.error('Failed to hand off opening flow to apprentice selection', error);
    });
  };

  const startOpeningDialogue = (): void => {
    canvas.setAttribute('aria-label', 'SplicePit opening narration');
    const sequence = openingNarrationSequence();
    const firstPage = sequence.pages[0];
    if (!firstPage) {
      handOffToSelector();
      return;
    }

    const debug: DialogueDebug = {
      ready: true,
      error: null,
      rendered: false,
      sequenceId: sequence.id,
      pageIndex: 0,
      pageId: firstPage.id,
      visibleCharacters: 0,
      textLength: firstPage.text.length,
      textComplete: false,
      corruption: 0,
      corruptionEventsPassed: 0,
      maxCorruption: 0,
      textSpeed: dialogueSpeed,
      skipped: false,
      completed: false,
      handedOffToSelector: false,
    };
    (globalThis as BootGlobal).__SPLICEPIT_DIALOGUE__ = debug;

    let pageIndex = 0;
    let pageStartedAt = performance.now();
    const sequenceStartedAt = pageStartedAt;
    let frameHandle = 0;
    let active = true;

    const syncDebug = (now: number): void => {
      const page = sequence.pages[pageIndex];
      if (!page) return;
      const state = dialoguePageVisualState(page, Math.max(0, now - pageStartedAt), dialogueSpeed);
      debug.pageIndex = pageIndex;
      debug.pageId = page.id;
      debug.visibleCharacters = state.visibleCharacters;
      debug.textLength = page.text.length;
      debug.textComplete = state.textComplete;
      debug.corruption = state.corruption;
      debug.corruptionEventsPassed = state.corruptionEventsPassed;
      debug.maxCorruption = Math.max(debug.maxCorruption, state.corruption);
    };

    const renderDialogue = (now: number): void => {
      if (!active) return;
      const page = sequence.pages[pageIndex];
      if (!page) return;
      const pageElapsedMs = Math.max(0, now - pageStartedAt);
      const state = dialoguePageVisualState(page, pageElapsedMs, dialogueSpeed);
      drawDialogueScreen(context, page, state, pageIndex, sequence.pages.length, Math.max(0, now - sequenceStartedAt));
      debug.rendered = true;
      syncDebug(now);
      frameHandle = requestAnimationFrame(renderDialogue);
    };

    const cleanupDialogue = (): void => {
      active = false;
      cancelAnimationFrame(frameHandle);
      window.removeEventListener('keydown', onDialogueKeyDown);
      canvas.removeEventListener('pointerdown', onDialoguePointerDown);
    };

    const finishDialogue = (skipped: boolean): void => {
      if (!active) return;
      debug.skipped = skipped;
      debug.completed = true;
      debug.rendered = false;
      cleanupDialogue();
      handOffToSelector(debug);
    };

    const advanceDialogue = (): void => {
      if (!active) return;
      const page = sequence.pages[pageIndex];
      if (!page) {
        finishDialogue(false);
        return;
      }
      const now = performance.now();
      const pageElapsedMs = Math.max(0, now - pageStartedAt);
      const state = dialoguePageVisualState(page, pageElapsedMs, dialogueSpeed);
      if (!state.textComplete) {
        pageStartedAt = now - dialogueRevealDurationMs(page.text, dialogueSpeed);
        syncDebug(now);
        return;
      }

      if (pageIndex >= sequence.pages.length - 1) {
        finishDialogue(false);
        return;
      }

      pageIndex += 1;
      pageStartedAt = now;
      syncDebug(now);
    };

    function onDialogueKeyDown(event: KeyboardEvent): void {
      if (!active) return;
      if (event.code === 'Escape') {
        event.preventDefault();
        finishDialogue(true);
        return;
      }
      if (event.code !== 'Enter' && event.code !== 'Space') return;
      event.preventDefault();
      advanceDialogue();
    }

    function onDialoguePointerDown(event: PointerEvent): void {
      if (!active) return;
      event.preventDefault();
      advanceDialogue();
    }

    window.addEventListener('keydown', onDialogueKeyDown);
    canvas.addEventListener('pointerdown', onDialoguePointerDown);
    frameHandle = requestAnimationFrame(renderDialogue);
  };

  const startMainMenu = (): void => {
    canvas.setAttribute('aria-label', 'SplicePit main menu');
    const debug: MenuDebug = {
      ready: true,
      error: null,
      rendered: false,
      screen: 'menu',
      selectedId: MAIN_MENU_ITEMS[firstEnabledMenuIndex()]?.id ?? null,
      continueEnabled: MAIN_MENU_ITEMS.find((item) => item.id === 'continue')?.enabled ?? false,
      statusText: '',
      settingsOpened: false,
      newGameStarted: false,
    };
    (globalThis as BootGlobal).__SPLICEPIT_MENU__ = debug;

    let screen: MainMenuScreen = 'menu';
    let selectedIndex = firstEnabledMenuIndex();
    let statusText = '';
    let frameHandle = 0;
    let active = true;
    const startedAt = performance.now();

    const syncDebug = (): void => {
      debug.screen = screen;
      debug.selectedId = screen === 'settings' ? 'back' : (MAIN_MENU_ITEMS[selectedIndex]?.id ?? null);
      debug.statusText = statusText;
    };

    const renderMenu = (now: number): void => {
      if (!active) return;
      drawMainMenuScreen(context, { screen, selectedIndex, statusText }, Math.max(0, now - startedAt));
      debug.rendered = true;
      syncDebug();
      frameHandle = requestAnimationFrame(renderMenu);
    };

    const cleanupMenu = (): void => {
      active = false;
      cancelAnimationFrame(frameHandle);
      window.removeEventListener('keydown', onMenuKeyDown);
      canvas.removeEventListener('pointermove', onMenuPointerMove);
      canvas.removeEventListener('pointerdown', onMenuPointerDown);
    };

    const startNewGame = (): void => {
      if (!active) return;
      debug.newGameStarted = true;
      debug.rendered = false;
      cleanupMenu();
      startOpeningDialogue();
    };

    const activateMenuIndex = (index: number): void => {
      const item = MAIN_MENU_ITEMS[index];
      if (!item) return;
      selectedIndex = index;
      if (!item.enabled) {
        statusText = item.note;
        syncDebug();
        return;
      }
      statusText = '';
      if (item.id === 'new-game') {
        startNewGame();
        return;
      }
      if (item.id === 'settings') {
        screen = 'settings';
        debug.settingsOpened = true;
        syncDebug();
      }
    };

    const returnToMenu = (): void => {
      screen = 'menu';
      const settingsIndex = MAIN_MENU_ITEMS.findIndex((item) => item.id === 'settings');
      if (settingsIndex >= 0) selectedIndex = settingsIndex;
      statusText = '';
      syncDebug();
    };

    const pointerPosition = (event: PointerEvent): { x: number; y: number } => {
      const bounds = canvas.getBoundingClientRect();
      const scaleX = canvas.width / Math.max(1, bounds.width);
      const scaleY = canvas.height / Math.max(1, bounds.height);
      return {
        x: (event.clientX - bounds.left) * scaleX,
        y: (event.clientY - bounds.top) * scaleY,
      };
    };

    function onMenuKeyDown(event: KeyboardEvent): void {
      if (!active) return;
      if (screen === 'settings') {
        if (event.code === 'Escape' || event.code === 'Backspace' || event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();
          returnToMenu();
        }
        return;
      }

      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        selectedIndex = moveMainMenuSelection(selectedIndex, -1);
        statusText = '';
        syncDebug();
        return;
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault();
        selectedIndex = moveMainMenuSelection(selectedIndex, 1);
        statusText = '';
        syncDebug();
        return;
      }
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        activateMenuIndex(selectedIndex);
      }
    }

    function onMenuPointerMove(event: PointerEvent): void {
      if (!active || screen !== 'menu') return;
      const { x, y } = pointerPosition(event);
      const hit = mainMenuHitTest(x, y);
      if (hit === null) return;
      selectedIndex = hit;
      statusText = MAIN_MENU_ITEMS[hit]?.enabled ? '' : (MAIN_MENU_ITEMS[hit]?.note ?? '');
      syncDebug();
    }

    function onMenuPointerDown(event: PointerEvent): void {
      if (!active) return;
      const { x, y } = pointerPosition(event);
      if (screen === 'settings') {
        if (settingsBackHitTest(x, y)) {
          event.preventDefault();
          returnToMenu();
        }
        return;
      }
      const hit = mainMenuHitTest(x, y);
      if (hit === null) return;
      event.preventDefault();
      activateMenuIndex(hit);
    }

    window.addEventListener('keydown', onMenuKeyDown);
    canvas.addEventListener('pointermove', onMenuPointerMove);
    canvas.addEventListener('pointerdown', onMenuPointerDown);
    frameHandle = requestAnimationFrame(renderMenu);
  };

  if (dialogueTest) {
    startOpeningDialogue();
  } else if (menuTest) {
    startMainMenu();
  } else {
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
    (globalThis as BootGlobal).__SPLICEPIT_TITLE__ = debug;

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

    const handOffToMenu = (): void => {
      if (advancing) return;
      advancing = true;
      debug.advanced = true;
      debug.titleRendered = false;
      cancelAnimationFrame(frameHandle);
      window.removeEventListener('keydown', onTitleKeyDown);
      canvas.removeEventListener('pointerdown', onTitlePointerDown);
      startMainMenu();
    };

    const advanceOrSkip = (): void => {
      const elapsedMs = performance.now() - startedAt;
      if (elapsedMs < TITLE_ADVANCE_MS) {
        startedAt = performance.now() - TITLE_ADVANCE_MS;
        return;
      }
      handOffToMenu();
    };

    function onTitleKeyDown(event: KeyboardEvent): void {
      if (event.code !== 'Enter' && event.code !== 'Space') return;
      event.preventDefault();
      advanceOrSkip();
    }

    function onTitlePointerDown(event: PointerEvent): void {
      event.preventDefault();
      advanceOrSkip();
    }

    window.addEventListener('keydown', onTitleKeyDown);
    canvas.addEventListener('pointerdown', onTitlePointerDown);
    frameHandle = requestAnimationFrame(render);
  }
}
