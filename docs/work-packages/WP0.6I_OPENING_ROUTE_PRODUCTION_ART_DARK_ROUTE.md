# WP0.6I — Opening Route Production Art + Dark Route

Status: implementation package

## Authority

This package implements `WP0.6I — Opening Route Production Art + Dark Route` from `docs/GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

It upgrades the accepted WP0.6D route between the Apprentice Splicer Yard, Master's Lab, Old Toll debt-encounter lay-by and Local Pit approach without changing traversal topology.

## Geometry and gameplay lock

WP0.6I preserves:

- opening world size: `2920 × 1600`;
- Yard spawn: `(900, 562)`;
- all 19 accepted opening-world collision rectangles;
- all 13 WP0.6D route waypoints;
- the existing Master's Lab, Old Toll and Local Pit route landmark positions;
- camera, movement, hold-to-run, tutorial, objective, Bag and Map behaviour;
- existing Master Lab and Local Pit hand-offs;
- save, inventory, story and battle state.

The route production-art contract uses `opening-world-v1` and declares `collisionTopology: unchanged`.

## Bright route production pass

The bright route keeps the colourful local-world presentation while replacing connective blockout with specific environmental detail.

Authored detail includes:

- layered tyre/foot wear and irregular marks along the established road surface;
- deliberate verge edges and terrain transitions;
- open drainage, culvert grates and a continuous south-road gutter;
- route fencing with readable joins and material variation;
- utility poles, service markers, roadside sample hardware and local service pipework;
- stronger navigation signs for the Master's Lab and Local Pit;
- a more specific Old Toll inspection shelter at the future debt-encounter lay-by;
- cheap Pit-night advertising and approach markers tying the road to the venue;
- clustered verge plants, flowers and shrubs instead of repeated filler;
- local contact shadows and small deterministic machinery/water movement.

The route reuses the WP0.6G shared material language so its timber, steel, machinery, dirt, grass and biological surfaces relate directly to the upgraded Yard.

## Authored dark route

The dark state is a second authored environmental reading of the same geography, not a colour filter.

Location-specific corruption includes:

- contaminated water physically following the bright drainage network;
- tissue, residue and old staining caught in culvert grates and gutter low points;
- dead verge growth and fungal replacement at the same planted edges;
- biological growth attached to fence joins, service equipment and roadside advertising;
- damaged and ominously altered Lab/Pit signage;
- a corrupted Old Toll shelter that retains the same footprint and future encounter staging;
- wrong shadow pools beside the road;
- twitching off-route silhouettes and discarded biological evidence outside traversal lanes.

Bright and dark versions therefore preserve the same navigable road, landmarks and collision state while telling materially different stories.

## Runtime integration and depth

WP0.6I uses the WP0.6G `EnvironmentVisualController` and the same in-loop rendering model established by WP0.6H.

The opening-world frame order is:

1. accepted WP0.6D world/base render;
2. active location production-art base layer, Yard or route;
3. protagonist;
4. active location authored foreground edges where the player's feet are spatially behind them;
5. accepted tree-canopy foreground;
6. objective, tutorial and shell UI.

There is no independent route canvas and no second animation loop. Route production art uses the exact camera transform and render tick as the opening world.

`src/environment/routeProductionArtRuntime.ts` exposes `globalThis.__SPLICEPIT_ROUTE_ART__` for deterministic regression inspection. The route capability is now `darkArtStatus: authored`; Master Lab and Local Pit remain pending for WP0.6J and WP0.6K.

## Validation

Automated coverage verifies:

- bright and dark route states are authored against `opening-world-v1`;
- all roadmap bright-detail and dark-story groups are represented;
- world size, spawn, collider count, waypoints and landmark coordinates remain unchanged;
- route art uses the opening-world render loop and the base/player/foreground depth model;
- no independent route overlay canvas exists;
- the browser reaches the route through the existing WP0.6D traversal path;
- force-dark materially changes the real `#visual-reset-stage` route image;
- forcing the dark state cannot move the protagonist;
- force-bright restores the normal route deterministically.

The existing opening-route and mobile traversal regressions remain authoritative for path continuity and controls.

## Explicitly deferred

WP0.6I does not:

- production-upgrade the Master Lab interior;
- production-upgrade the Local Pit interior/exterior;
- schedule ambient/random corruption events;
- add the creditor encounter itself;
- change route collision or hand-off behaviour;
- alter objectives, story progression, battle or economy.

Those remain WP0.6J–L and later roadmap responsibilities.
