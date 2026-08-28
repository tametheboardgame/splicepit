const params = new URLSearchParams(window.location.search);
const legacyLabHarness = params.get('labTest') === '1';
const disasterHarness = params.get('rinocowTest') === '1';

if (!legacyLabHarness || disasterHarness) {
  void Promise.all([
    import('./rinocowDisasterRuntime.js'),
    import('./rinocowDisasterPresentationFix.js'),
  ]);
}
