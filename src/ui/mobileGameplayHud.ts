import { touchInputAvailable } from '../input/actions.js';
import { OPENING_TUTORIAL_PROMPTS, type TutorialPromptId } from '../tutorial/tutorialFramework.js';

type MobileHudDebugState = {
  readonly ready?: boolean;
  readonly phase?: string;
  readonly activeOpeningShell?: string | null;
  readonly objectiveTitle?: string;
  readonly objectiveDetail?: string;
  readonly objectiveStep?: number;
  readonly objectiveCount?: number;
  readonly tutorialPromptId?: TutorialPromptId | null;
  readonly tutorialPromptVisible?: boolean;
  readonly tutorialPromptCompleting?: boolean;
  readonly tutorialPromptAlpha?: number;
  readonly tutorialHintLabels?: readonly string[];
};

type DebugGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: MobileHudDebugState;
};

const promptDefinitions = new Map(OPENING_TUTORIAL_PROMPTS.map((definition) => [definition.id, definition]));

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function buildHud(): HTMLElement {
  const root = element('div', 'mobile-gameplay-hud');
  root.id = 'mobile-gameplay-hud';
  root.setAttribute('aria-hidden', 'true');

  const objective = element('section', 'mobile-hud-card mobile-objective-card');
  objective.dataset.mobileHud = 'objective';
  const objectiveKicker = element('div', 'mobile-hud-kicker');
  const objectiveTitle = element('div', 'mobile-hud-title');
  const objectiveBody = element('div', 'mobile-hud-body');
  objective.append(objectiveKicker, objectiveTitle, objectiveBody);

  const tutorial = element('section', 'mobile-hud-card mobile-tutorial-card');
  tutorial.dataset.mobileHud = 'tutorial';
  const tutorialKicker = element('div', 'mobile-hud-kicker');
  tutorialKicker.textContent = 'FIELD NOTE';
  const tutorialTitle = element('div', 'mobile-hud-title');
  const tutorialBody = element('div', 'mobile-hud-body');
  const tutorialHints = element('div', 'mobile-hud-hints');
  tutorial.append(tutorialKicker, tutorialTitle, tutorialBody, tutorialHints);

  root.append(objective, tutorial);
  document.body.append(root);
  return root;
}

function syncHud(root: HTMLElement): void {
  const state = (globalThis as DebugGlobal).__SPLICEPIT_VISUAL_RESET__;
  const active = touchInputAvailable() && Boolean(state?.ready && state.phase === 'confirmed');
  root.classList.toggle('is-active', active);
  root.setAttribute('aria-hidden', active ? 'false' : 'true');
  if (!active) return;

  const objective = root.querySelector<HTMLElement>('[data-mobile-hud="objective"]');
  const tutorial = root.querySelector<HTMLElement>('[data-mobile-hud="tutorial"]');
  if (!objective || !tutorial) return;

  const objectiveVisible = state?.activeOpeningShell == null;
  objective.classList.toggle('is-visible', objectiveVisible);
  objective.querySelector<HTMLElement>('.mobile-hud-kicker')!.textContent =
    `OBJECTIVE ${state?.objectiveStep ?? 1}/${state?.objectiveCount ?? 1}`;
  objective.querySelector<HTMLElement>('.mobile-hud-title')!.textContent = state?.objectiveTitle ?? '';
  objective.querySelector<HTMLElement>('.mobile-hud-body')!.textContent = state?.objectiveDetail ?? '';

  const promptId = state?.tutorialPromptId ?? null;
  const definition = promptId ? promptDefinitions.get(promptId) : undefined;
  const tutorialVisible = Boolean(state?.tutorialPromptVisible && definition);
  tutorial.classList.toggle('is-visible', tutorialVisible);
  tutorial.classList.toggle('is-completing', Boolean(state?.tutorialPromptCompleting));
  tutorial.style.opacity = String(Math.max(0, Math.min(1, state?.tutorialPromptAlpha ?? 1)));
  tutorial.querySelector<HTMLElement>('.mobile-hud-title')!.textContent = definition?.title.toUpperCase() ?? '';
  tutorial.querySelector<HTMLElement>('.mobile-hud-body')!.textContent = definition?.body ?? '';

  const hints = tutorial.querySelector<HTMLElement>('.mobile-hud-hints')!;
  const labels = state?.tutorialHintLabels ?? [];
  const signature = labels.join('|');
  if (hints.dataset.signature !== signature) {
    hints.dataset.signature = signature;
    hints.replaceChildren(...labels.map((label) => {
      const chip = element('span', 'mobile-hud-hint');
      chip.textContent = label;
      return chip;
    }));
  }
}

if (!document.getElementById('mobile-gameplay-hud')) {
  const hud = buildHud();
  const loop = (): void => {
    syncHud(hud);
    window.setTimeout(loop, 80);
  };
  loop();
}
