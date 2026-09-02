# RSP-5 — Route Story / Interaction / Debt Encounter Integration

Date: 2 September 2026
Status: COMPLETE

## Purpose

Reconnect the opening Route's gameplay meaning to the authored RSP-4 scene geometry without prematurely switching the live production renderer.

RSP-5 makes semantic identifiers, not raw world coordinates, the contract for the Find your Master route objective, Yard/Lab/Pit interactions, safe overlay returns and the post-disaster creditor confrontation.

## Scene contract

`src/world/routeStoryIntegration.ts` versions the unchanged RSP-4 geometry as `opening-route-bright-rsp5-v1` and adds the gameplay/story layer.

The authored geometry remains:

- `3072 × 2049` world;
- `1280 × 720` gameplay view;
- RSP-4 collision and feet hitbox unchanged;
- six stable semantic anchors unchanged.

No collision was moved in RSP-5.

## Objective integration

The existing `find-master` opening objective now has an authored Route destination contract:

- objective: `find-master`;
- destination anchor: `master-lab-entrance`.

Consumers can resolve the visible Lab destination from the scene contract without importing a legacy route landmark or coordinate.

## Interaction contract

The authored Route exposes explicit shared ACTION/interact semantics for:

- `yard-return` → Apprentice Splicer Yard;
- `master-lab-entrance` → Master Lab;
- `local-pit-entrance` → Local Pit.

Each interaction owns:

- its semantic target;
- player-facing ACTION prompt;
- visible entry anchor;
- safe route-side return anchor.

Master Lab and Local Pit return positions resolve through `master-lab-return` and `local-pit-return` respectively. The safe returns remain walkable and outside their corresponding entry triggers, preserving the RSP-0 no-instant-re-entry requirement.

## Debt encounter staging

The retired Old Toll Lay-by is no longer the authored RSP-5 encounter contract.

The existing WP0.7E debt confrontation is staged at:

- anchor: `debt-encounter`;
- authored location: **Decommissioned Biosecurity Weighbridge**;
- trigger radius: 150 world pixels, capped by the authored anchor radius;
- representative: positioned on clear weighbridge staging ground by a small semantic offset from the trigger centre;
- activation: automatic while armed;
- story state: normal Bright world only;
- eligibility: post-death Lab active and splice-bench route-forward hand-off completed.

The existing dialogue, retry-safe lifecycle, inherited-debt flag and one-way completion semantics are unchanged.

## Runtime migration

`src/cutscene/debtCollectorEncounterRuntime.ts` no longer imports `OPENING_ROUTE_LANDMARKS` directly.

Instead it asks the Route story contract for the current encounter placement. This is deliberately renderer-aware:

- while the current procedural Route remains live, a single central legacy compatibility fallback preserves the existing production encounter position;
- when RSP-7 activates the scene-image Route and exposes `routeRenderer = scene-image`, the same creditor runtime automatically resolves the authored weighbridge trigger and representative placement;
- RSP-7 can then remove the central legacy fallback without rewriting the encounter consumer again.

This avoids changing production Route coordinates before the matching authored image is active.

## Automated coverage

RSP-5 adds dedicated semantic tests proving:

- `find-master` resolves to the authored Master Lab entrance;
- all three Route interactions resolve from scene-pack exits;
- ACTION prompts exist for those interactions;
- Master Lab and Local Pit safe returns resolve from semantic anchors and sit outside entry triggers;
- the creditor trigger resolves to the authored weighbridge anchor;
- the creditor representative stands on walkable ground;
- the encounter remains Bright-world only and retains post-death/bench eligibility requirements;
- automatic triggering still requires armed state, visible Route gameplay and no already-running cutscene;
- the previous unit assertion canonising the Old Toll is removed.

Existing WP0.7E lifecycle and dialogue tests remain in place.

## Scope boundary

RSP-5 deliberately does not:

- activate the RSP-3 image as the normal Route renderer;
- replace current Route collision in the live runtime;
- remove the temporary procedural-route compatibility fallback;
- create foreground occlusion;
- create the authored Dark Route counterpart.

Those are intentionally separated into RSP-6 and RSP-7 so production cannot enter a half-migrated visual state.

## Result

The authored Route now owns both geometry and gameplay meaning. RSP-6 can add depth/grounding without changing story semantics, and RSP-7 can switch production rendering without re-authoring the objective, transitions or creditor encounter.
