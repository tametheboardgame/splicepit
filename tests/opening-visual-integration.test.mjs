import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OPENING_PRODUCTION_ART_CONTRACTS,
  OPENING_VISUAL_INTEGRATION_GATE,
  openingVisualIntegrationIssues,
} from '../src/environment/openingVisualIntegration.js';
import { ENVIRONMENT_CAPABILITIES } from '../src/environment/environmentVisualContract.js';

test('WP0.6M opening production-art contracts pass the final cross-location integration gate', () => {
  assert.deepEqual(openingVisualIntegrationIssues(), []);
  assert.deepEqual([...OPENING_VISUAL_INTEGRATION_GATE.locationIds], ['yard', 'route', 'master-lab', 'local-pit']);
  assert.deepEqual(OPENING_VISUAL_INTEGRATION_GATE.viewport, { width: 1280, height: 720 });
  assert.deepEqual(OPENING_VISUAL_INTEGRATION_GATE.protagonistFrame, { width: 64, height: 96 });
});

test('WP0.6M every location keeps authored bright/dark art above the shared production-detail floor', () => {
  for (const [id, contract] of Object.entries(OPENING_PRODUCTION_ART_CONTRACTS)) {
    assert.deepEqual([...contract.authoredStates], ['bright', 'dark'], `${id} authored states`);
    assert.equal(contract.collisionTopology, 'unchanged', `${id} collision topology`);
    assert.ok(contract.brightDetailGroups.length >= OPENING_VISUAL_INTEGRATION_GATE.minimumBrightDetailGroups, `${id} bright detail floor`);
    assert.ok(contract.darkStoryGroups.length >= OPENING_VISUAL_INTEGRATION_GATE.minimumDarkStoryGroups, `${id} dark storytelling floor`);
  }
});

test('WP0.6M preserves connected Yard/route geometry while keeping interior geometry explicit', () => {
  assert.equal(ENVIRONMENT_CAPABILITIES.yard.geometryId, 'opening-world-v1');
  assert.equal(ENVIRONMENT_CAPABILITIES.route.geometryId, 'opening-world-v1');
  assert.equal(ENVIRONMENT_CAPABILITIES['master-lab'].geometryId, 'master-lab-v1');
  assert.equal(ENVIRONMENT_CAPABILITIES['local-pit'].geometryId, 'local-pit-v1');
});

test('WP0.6M locks the common opening material vocabulary used by all four production-art passes', () => {
  assert.deepEqual(OPENING_VISUAL_INTEGRATION_GATE.materialIds, [
    'wood',
    'brick',
    'plaster',
    'steel',
    'glass',
    'dirt',
    'grass',
    'cage',
    'machinery',
    'biological-residue',
  ]);
  assert.equal(OPENING_VISUAL_INTEGRATION_GATE.corruptionRuntime, 'ambient-world-corruption-v1');
});
