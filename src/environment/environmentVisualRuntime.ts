import {
  environmentVisualController,
  openingWorldEnvironmentAt,
  refreshEnvironmentVisualDebug,
  type EnvironmentLocationId,
} from './environmentVisualContract.js';

type YardDebug = {
  ready?: boolean;
  phase?: string;
  playerX?: number;
  activeOpeningShell?: string | null;
};

type OverlayDebug = {
  active?: boolean;
};

type DialogueDebug = {
  ready?: boolean;
  completed?: boolean;
  handedOffToSelector?: boolean;
};

type RuntimeGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_MASTER_LAB__?: OverlayDebug;
  __SPLICEPIT_LOCAL_PIT__?: OverlayDebug;
  __SPLICEPIT_DIALOGUE__?: DialogueDebug;
};

function activeLocation(): EnvironmentLocationId {
  const globals = globalThis as RuntimeGlobal;
  if (globals.__SPLICEPIT_LOCAL_PIT__?.active) return 'local-pit';
  if (globals.__SPLICEPIT_MASTER_LAB__?.active) return 'master-lab';

  const yard = globals.__SPLICEPIT_VISUAL_RESET__;
  if (yard?.phase === 'confirmed' && typeof yard.playerX === 'number') {
    return openingWorldEnvironmentAt(yard.playerX);
  }
  return 'yard';
}

function syncSuppression(): void {
  const globals = globalThis as RuntimeGlobal;
  const dialogue = globals.__SPLICEPIT_DIALOGUE__;
  const dialogueActive = Boolean(dialogue?.ready && !dialogue.completed && !dialogue.handedOffToSelector);
  environmentVisualController.setSuppressed('opening-dialogue', dialogueActive);
  environmentVisualController.setSuppressed('opening-shell', Boolean(globals.__SPLICEPIT_VISUAL_RESET__?.activeOpeningShell));
}

function tick(now: number): void {
  environmentVisualController.setActiveLocation(activeLocation());
  syncSuppression();
  refreshEnvironmentVisualDebug(now);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
