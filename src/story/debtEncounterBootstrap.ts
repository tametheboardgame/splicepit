import { postDeathLabState } from './postDeathLabState.js';
import {
  debtEncounterState,
  shouldArmDebtEncounter,
  type DebtEncounterSnapshot,
} from './debtEncounterState.js';

type DebtEncounterStoryDebug = {
  readonly ready: true;
  snapshot: DebtEncounterSnapshot;
};

type DebtEncounterGlobal = typeof globalThis & {
  __SPLICEPIT_DEBT_ENCOUNTER_STATE__?: DebtEncounterStoryDebug;
};

const debug: DebtEncounterStoryDebug = {
  ready: true,
  snapshot: debtEncounterState.snapshot(),
};

function syncDebug(): void {
  debug.snapshot = debtEncounterState.snapshot();
}

function syncEligibility(): void {
  const postDeath = postDeathLabState.snapshot();
  if (shouldArmDebtEncounter(postDeath)) debtEncounterState.armForPitRoute();
}

postDeathLabState.subscribe(syncEligibility);
debtEncounterState.subscribe(syncDebug);
syncEligibility();
syncDebug();

(globalThis as DebtEncounterGlobal).__SPLICEPIT_DEBT_ENCOUNTER_STATE__ = debug;
