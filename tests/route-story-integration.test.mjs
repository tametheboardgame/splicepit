import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RSP5_ROUTE_SCENE_PACK,
  RSP5_ROUTE_STORY_CONTRACT,
  routeDebtEncounterPlacement,
  routeObjectiveAnchor,
  routeSafeReturnPosition,
  routeStoryInteractionAt,
  routeStoryInteractionForTarget,
  shouldTriggerRouteDebtEncounter,
} from '../src/world/routeStoryIntegration.js';
import {
  isRouteScenePositionBlocked,
  routeSceneAnchor,
  routeSceneExitAt,
} from '../src/world/routeScenePack.js';

test('RSP-5 maps Find your Master to the authored Master Lab entrance', () => {
  const objective = routeObjectiveAnchor('find-master');
  const lab = routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, 'master-lab-entrance');

  assert.deepEqual(objective, lab.position);
  assert.equal(routeObjectiveAnchor('yard-orientation'), null);
  assert.equal(isRouteScenePositionBlocked(RSP5_ROUTE_SCENE_PACK, objective.x, objective.y), false);
});

test('RSP-5 interaction contract resolves visible exits without exposing raw coordinates to consumers', () => {
  assert.deepEqual(
    RSP5_ROUTE_STORY_CONTRACT.interactions.map((interaction) => [interaction.id, interaction.target]),
    [
      ['yard-return', 'apprentice-yard'],
      ['master-lab-entrance', 'master-lab'],
      ['local-pit-entrance', 'local-pit'],
    ],
  );

  for (const interaction of RSP5_ROUTE_STORY_CONTRACT.interactions) {
    const exit = RSP5_ROUTE_SCENE_PACK.exits.find((candidate) => candidate.id === interaction.id);
    assert.ok(exit, `missing authored exit ${interaction.id}`);
    const x = exit.bounds.x + exit.bounds.width / 2;
    const y = exit.bounds.y + exit.bounds.height / 2;
    assert.equal(routeSceneExitAt(RSP5_ROUTE_SCENE_PACK, x, y)?.id, interaction.id);
    assert.equal(routeStoryInteractionAt(x, y)?.target, interaction.target);
    assert.match(interaction.prompt, /ACTION/);
  }
});

test('RSP-5 overlay returns resolve to safe authored Route anchors outside entry triggers', () => {
  for (const target of ['master-lab', 'local-pit']) {
    const interaction = routeStoryInteractionForTarget(target);
    const safeReturn = routeSafeReturnPosition(target);
    const expected = routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, interaction.returnAnchorId);

    assert.deepEqual(safeReturn, expected.position);
    assert.equal(isRouteScenePositionBlocked(RSP5_ROUTE_SCENE_PACK, safeReturn.x, safeReturn.y), false);
    assert.equal(routeSceneExitAt(RSP5_ROUTE_SCENE_PACK, safeReturn.x, safeReturn.y), null);
  }
});

test('RSP-5 debt encounter is staged at the authored weighbridge in the normal Bright world', () => {
  const placement = routeDebtEncounterPlacement();
  const anchor = routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, 'debt-encounter');

  assert.equal(placement.anchorId, 'debt-encounter');
  assert.equal(placement.label, 'Decommissioned Biosecurity Weighbridge');
  assert.deepEqual(placement.triggerPosition, anchor.position);
  assert.ok(placement.triggerRadius > 100 && placement.triggerRadius <= anchor.radius);
  assert.equal(placement.autoTrigger, true);
  assert.equal(placement.normalWorldOnly, true);
  assert.equal(placement.requiresPostDeathLab, true);
  assert.equal(placement.requiresSpliceBenchHandoff, true);
  assert.equal(isRouteScenePositionBlocked(RSP5_ROUTE_SCENE_PACK, placement.representativePosition.x, placement.representativePosition.y), false);
});

test('RSP-5 debt trigger preserves armed, route-visible and cutscene-control gates', () => {
  const placement = routeDebtEncounterPlacement();
  const base = {
    playerX: placement.triggerPosition.x,
    playerY: placement.triggerPosition.y,
    armed: true,
    routeVisible: true,
    cutsceneRunning: false,
  };

  assert.equal(shouldTriggerRouteDebtEncounter(base), true);
  assert.equal(shouldTriggerRouteDebtEncounter({ ...base, armed: false }), false);
  assert.equal(shouldTriggerRouteDebtEncounter({ ...base, routeVisible: false }), false);
  assert.equal(shouldTriggerRouteDebtEncounter({ ...base, cutsceneRunning: true }), false);
  assert.equal(shouldTriggerRouteDebtEncounter({ ...base, playerX: placement.triggerPosition.x + placement.triggerRadius + 1 }), false);
});
