const params = new URLSearchParams(window.location.search);
const legacyLabHarness = params.get('labTest') === '1';
const debtHarness = params.get('debtTest') === '1';

if (!legacyLabHarness || debtHarness) {
  void import('./debtCollectorEncounterRuntime.js');
}
