import { debtEncounterState, type DebtEncounterSnapshot } from '../story/debtEncounterState.js';

const params = new URLSearchParams(window.location.search);
const legacyLabHarness = params.get('labTest') === '1';
const debtHarness = params.get('debtTest') === '1';
let runtimeRequested = false;

function ensureRuntime(): void {
  if (runtimeRequested) return;
  runtimeRequested = true;
  void import('./debtCollectorEncounterRuntime.js');
}

function syncRuntime(snapshot: DebtEncounterSnapshot): void {
  if (snapshot.phase !== 'locked') ensureRuntime();
}

if (debtHarness) {
  ensureRuntime();
} else if (!legacyLabHarness) {
  debtEncounterState.subscribe(syncRuntime);
  syncRuntime(debtEncounterState.snapshot());
}
