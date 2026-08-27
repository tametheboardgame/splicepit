import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ENVIRONMENT_CAPABILITIES,
  ENVIRONMENT_LOCATION_IDS,
  EnvironmentVisualController,
  openingWorldEnvironmentAt,
  renderAuthoredEnvironment,
} from '../src/environment/environmentVisualContract.js';
import {
  ENVIRONMENT_MATERIALS,
  ENVIRONMENT_SURFACE_RULES,
} from '../src/environment/environmentArtLanguage.js';

test('WP0.6G registers all four opening environments against stable render and geometry contracts', () => {
  assert.deepEqual([...ENVIRONMENT_LOCATION_IDS], ['yard', 'route', 'master-lab', 'local-pit']);
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.renderSurfaceId, 'opening-world');
  assert.equal(ENVIRONMENT_CAPABILITIES.route.renderSurfaceId, 'opening-world');
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.geometryId, ENVIRONMENT_CAPABILITIES.route.geometryId);
  assert.equal(ENVIRONMENT_CAPABILITIES['master-lab'].renderSurfaceId, 'master-lab');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].renderSurfaceId, 'local-pit');
  for (const id of ENVIRONMENT_LOCATION_IDS) {
    assert.deepEqual([...ENVIRONMENT_CAPABILITIES[id].authoredStates], ['bright', 'dark']);
  }
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.darkArtStatus, 'authored');
  assert.equal(ENVIRONMENT_CAPABILITIES.route.darkArtStatus, 'authored');
  assert.equal(ENVIRONMENT_CAPABILITIES['master-lab'].darkArtStatus, 'authored');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].darkArtStatus, 'pending');
});

test('WP0.6G keeps the opening world topology separate from logical Yard/route visual capability selection', () => {
  assert.equal(openingWorldEnvironmentAt(1719), 'yard');
  assert.equal(openingWorldEnvironmentAt(1720), 'route');
  assert.equal(openingWorldEnvironmentAt(2800), 'route');
});

test('WP0.6G debug controls can force bright, force dark and return to normal bright presentation', () => {
  const controller = new EnvironmentVisualController();
  assert.equal(controller.sample('yard', 0).visualState, 'bright');

  controller.forceDark();
  assert.equal(controller.sample('yard', 10).visualState, 'dark');
  assert.equal(controller.sample('yard', 10).darkMix, 1);

  controller.forceBright();
  assert.equal(controller.sample('yard', 20).visualState, 'bright');
  assert.equal(controller.sample('yard', 20).darkMix, 0);

  controller.clearForcedState();
  assert.equal(controller.sample('yard', 30).visualState, 'bright');
});

test('WP0.6G transitions are deterministic, location-scoped and recover cleanly', () => {
  const controller = new EnvironmentVisualController();
  controller.forceTransition('local-pit', 1000, 1000);

  const rupture = controller.sample('local-pit', 1100);
  assert.equal(rupture.phase, 'rupture');
  assert.ok(rupture.darkMix > 0 && rupture.darkMix < 1);

  const glimpse = controller.sample('local-pit', 1400);
  assert.equal(glimpse.phase, 'dark-glimpse');
  assert.equal(glimpse.visualState, 'dark');
  assert.equal(glimpse.darkMix, 1);

  assert.equal(controller.sample('yard', 1400).visualState, 'bright');

  const recovery = controller.sample('local-pit', 1800);
  assert.equal(recovery.phase, 'recovery');
  assert.ok(recovery.darkMix > 0 && recovery.darkMix < 1);

  const recovered = controller.sample('local-pit', 2001);
  assert.equal(recovered.phase, 'steady');
  assert.equal(recovered.visualState, 'bright');
  assert.equal(recovered.darkMix, 0);
});

test('WP0.6G suppression prevents a corruption transition from changing the presented environment state', () => {
  const controller = new EnvironmentVisualController();
  controller.forceTransition('master-lab', 1000, 1000);
  controller.setSuppressed('cutscene', true);

  const suppressed = controller.sample('master-lab', 1400);
  assert.equal(suppressed.suppressed, true);
  assert.equal(suppressed.visualState, 'bright');
  assert.equal(suppressed.darkMix, 0);

  controller.setSuppressed('cutscene', false);
  const resumed = controller.sample('master-lab', 1500);
  assert.equal(resumed.suppressed, false);
  assert.equal(resumed.phase, 'dark-glimpse');
  assert.equal(resumed.visualState, 'dark');
});

test('WP0.6G compositor blends authored renderers and never synthesises a dark state when no dark renderer exists', () => {
  const calls = [];
  const context = {
    globalAlpha: 1,
    save() { calls.push(['save', this.globalAlpha]); },
    restore() { calls.push(['restore', this.globalAlpha]); this.globalAlpha = 1; },
  };

  renderAuthoredEnvironment(context, {
    locationId: 'yard',
    visualState: 'dark',
    phase: 'dark-glimpse',
    darkMix: 0.75,
    transitionProgress: 0.5,
    suppressed: false,
  }, {
    bright: () => calls.push(['bright', context.globalAlpha]),
    dark: () => calls.push(['dark', context.globalAlpha]),
  });

  assert.deepEqual(calls, [
    ['save', 1],
    ['bright', 1],
    ['dark', 0.75],
    ['restore', 0.75],
  ]);

  calls.length = 0;
  renderAuthoredEnvironment(context, {
    locationId: 'route',
    visualState: 'dark',
    phase: 'dark-glimpse',
    darkMix: 1,
    transitionProgress: 0.5,
    suppressed: false,
  }, {
    bright: () => calls.push(['bright-fallback', context.globalAlpha]),
  });
  assert.deepEqual(calls, [['bright-fallback', 1]]);
});

test('WP0.6G locks common material and surface-storytelling vocabulary for later location art packages', () => {
  const requiredMaterials = ['wood', 'brick', 'plaster', 'steel', 'glass', 'dirt', 'grass', 'cage', 'machinery', 'biological-residue'];
  assert.deepEqual(Object.keys(ENVIRONMENT_MATERIALS), requiredMaterials);
  assert.match(ENVIRONMENT_SURFACE_RULES.grime, /uniform dark overlays/);
  assert.match(ENVIRONMENT_SURFACE_RULES.blood, /full-scene tint/);
  assert.match(ENVIRONMENT_SURFACE_RULES.biologicalResidue, /containment/);
});
