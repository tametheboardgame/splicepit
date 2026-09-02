# RSP-4 — Re-author Route Walkability / Collision / Exits

Date: 2 September 2026
Status: COMPLETE

## Purpose

Replace the disposable `opening-world-v1` Route geometry with gameplay space authored directly against the locked RSP-3 Bright Opening Route raster.

RSP-4 owns walkability, collision, semantic route anchors, explicit exits and camera bounds. It does not yet switch the live Route renderer or reconnect story/runtime consumers; those remain RSP-5 and RSP-7 responsibilities.

## Visual source of truth

RSP-4 is authored against the exact RSP-3 production derivative:

- source image: `1024 × 683` JPEG;
- SHA-256: `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- world mapping: exact integer `3×` source-pixel scale;
- authored Route world: `3072 × 2049`;
- gameplay camera: `1280 × 720`.

The previous 2920 × 1600 `opening-world-v1` dimensions, raw landmarks, legacy waypoints, Old Toll geometry and procedural road collision were not used as the replacement geometry source.

## Scene-owned geometry

`src/world/routeScenePack.ts` now defines `RSP4_ROUTE_SCENE_PACK` with:

- scene-image renderer identity;
- source asset/world mapping;
- scene-owned world and camera bounds;
- feet-based protagonist hitbox matching the approved Yard scale;
- broad authored blocked rectangles around visible physical masses;
- semantic anchors and explicit interaction exits;
- collision, anchor, exit and camera helper functions.

Small decorative clutter remains traversable where modelling every object would make touch movement brittle. Large buildings, cliffs, industrial compounds, machinery and coherent fence/vegetation masses remain solid.

## Authored collision language

Major blocked groups include:

- north-west greenhouse / animal-operation structures and paddocks;
- north-central woodland and rock bank;
- Viktor Lab building mass and retaining wall;
- east-side cliff boundary;
- weighbridge booth and rail machinery;
- Yard-side tank complex, gate posts, fence return and service crates;
- south-central fenced growth and woodland masses;
- Pit-side rock, utility excavation, woodland and fence return.

The visible main roads, Lab approach apron, weighbridge hardstanding and Pit approach remain deliberately open.

## Locked semantic anchors

The new scene pack provides all six anchors required by RSP-0:

- `yard-arrival`;
- `master-lab-entrance`;
- `master-lab-return`;
- `debt-encounter`;
- `local-pit-entrance`;
- `local-pit-return`.

These identifiers are now the stable geometry contract. Raw coordinates are implementation detail.

The Master Lab return point was deliberately placed on the open Lab approach rather than immediately beside the weighbridge rail, preserving forgiving correction space for touch controls and avoiding instant re-entry.

## Explicit exits

The scene pack exposes three explicit Action/interact exits:

- `yard-return` → `apprentice-yard`;
- `master-lab-entrance` → `master-lab`;
- `local-pit-entrance` → `local-pit`.

Each exit references a safe route-side return anchor. Those return points are outside the corresponding exit trigger so returning from an overlay scene cannot instantly re-enter it.

## Traversal proof

The old `tests/opening-route.test.mjs` coordinate assertions have been replaced with RSP-4 semantic geometry tests.

Coverage proves:

- the scene owns the locked `3072 × 2049` world and correct 1280 × 720 camera limits;
- all six semantic anchors exist and resolve to walkable ground;
- each anchor has a forgiving open approach disc around it;
- Yard arrival can reach the Master Lab entrance;
- Master Lab return can reach the debt staging area;
- debt staging can reach the Local Pit entrance;
- Local Pit return remains connected to the wider Route;
- exit centres are reachable and resolve to the intended semantic exit;
- safe returns do not overlap their own exit trigger;
- representative visible solid masses block movement;
- representative visible roads and staging ground remain traversable.

Reachability uses deterministic grid search against the real feet-hitbox collision function rather than reproducing hand-authored legacy waypoints.

## Mobile and camera implications

The authored geometry keeps the critical route wider than the protagonist feet hitbox and retains open correction space around Lab, debt and Pit anchors.

At the locked world dimensions, the 1280 × 720 camera has valid travel limits of:

- horizontal: `0…1792`;
- vertical: `0…1329`.

This gives the selected composition multiple camera-scale traversal beats without exposing space beyond the authored raster.

## Scope boundary

RSP-4 deliberately does not:

- switch production rendering from Pass D to the RSP-3 raster;
- reconnect the existing opening objective controller to the new Route scene pack;
- reconnect Master Lab and Local Pit runtime return callbacks;
- arm or trigger the debt encounter from the new semantic anchor;
- add NPC placement or interaction presentation;
- author Route foreground occlusion;
- author the matching Dark Route raster.

Those responsibilities remain ordered as RSP-5, RSP-6 and RSP-7.

## Result

The Opening Route now has a scene-owned gameplay geometry contract based on what the approved authored image visibly depicts rather than on the retired procedural map.

RSP-5 can integrate story, interactions and the debt encounter using semantic identifiers without inheriting obsolete raw coordinates.
