# WP0.6K — Local Pit Production Art + Dark Pit

Status: implementation package

## Authority

This package implements `WP0.6K — Local Pit Production Art + Dark Pit` from `docs/GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

It upgrades the accepted WP0.6F Bramble Pit foundation while preserving its grimy local-sports identity, traversal and WP0.6F1 entry corruption.

## Geometry and gameplay lock

WP0.6K preserves:

- Local Pit world size: `2360 × 1480`;
- entry spawn: `(1180, 1320)`;
- exit lane and Yard hand-off contract;
- all 19 accepted Pit collision rectangles;
- all six accepted staging anchors: arrival gate, reception, prep bay, arena gate, tutorial battle floor and result desk;
- the same arena floor, entrances, reception route and prep traversal;
- camera, movement, run, Bag, Map and objective behaviour.

The production-art contract uses `local-pit-v1` and declares `collisionTopology: unchanged`.

## Bright Pit production pass

The bright state remains colourful and attractive at first glance, but now reads as a cheap, heavily used local gene-combat venue rather than a clean placeholder arena.

Authored detail includes:

- denser exterior facade repairs, patched fencing, queue furniture, cheap lights and local sponsor boards;
- richer registration and payout clutter, waiver piles, jars, receipts, stamps and failing business hardware;
- reinforced creature cages, weigh controls, restraint hardware, improvised decon plumbing and maintenance equipment;
- drains, localised damp, floor plates, old tape, grease, rust, repair bolts and traffic-aware grime;
- stronger arena construction, braces, rails, gate winch hardware and visibly bodged repairs;
- sponsor boards, odds signage, spectator clutter and small local-league jokes;
- arena-floor scuffs and cleaned historic stains that imply routine violence without turning the bright state into the horror state;
- stronger contact shadows and cheap venue lighting while retaining clear navigation.

The established WP0.6F grime remains part of the accepted base and the production pass builds on it rather than replacing it with uniform darkening.

## Authored dark Pit

The dark state is a separately authored reading of the same Bramble Pit, not a global red or black tint.

Location-specific corruption includes:

- old blood and organic residue attached to rails, counters, drains and cleanup paths;
- visibly failed cleanup around floor drains and traffic lanes;
- warped holding cages, restraint-table implications and damaged gate equipment;
- wrong, compressed spectator silhouettes behind the same arena construction;
- biological growth attached to decon runoff, drains, cages and fight-floor residue;
- tissue, teeth/bone and other brutality evidence on the same tutorial battle floor;
- darker local lighting and failing hardware without obscuring the accepted route.

The result is intended to make the underlying animal brutality unmistakable while preserving the exact same playable map.

## WP0.6F1 entry-corruption harmonisation

WP0.6K retains the existing `localPitEntryGlitch` sequence and its shared `EnvironmentVisualController` transition.

Because the Local Pit now has authored dark production art, the WP0.6F1 rupture no longer reveals a generic wrong-colour treatment. Its `darkMix` exposes the actual dark Pit layer during rupture, wrong-layer and recovery phases, then returns to the bright venue through the same deterministic controller.

No second transition system is introduced.

## Runtime integration and depth

WP0.6K renders through the existing `#local-pit-stage` canvas and Local Pit animation loop.

The frame order is:

1. accepted WP0.6F Pit base and grime;
2. bright production-art base plus authored dark base at the controller's `darkMix`;
3. protagonist;
4. bright production-art foreground plus authored dark foreground where spatially credible;
5. accepted Pit foreground;
6. objective and shell UI.

There is no independent production-art canvas and no second animation loop.

`src/environment/localPitProductionArtRuntime.ts` exposes `globalThis.__SPLICEPIT_LOCAL_PIT_ART__` for deterministic regression inspection. The Local Pit capability is now `darkArtStatus: authored`, completing authored bright/dark coverage for all four WP0.6G opening environments.

## Validation

Automated coverage verifies:

- both visual states are authored against `local-pit-v1`;
- all bright-detail and dark-story groups are represented;
- Pit dimensions, spawn, exit, staging coordinates and collider count remain unchanged;
- key staging points and the exit remain walkable where required;
- production art uses the existing Pit render loop and base/player/foreground depth order;
- no independent production-art canvas exists;
- the existing WP0.6F1 entry rupture drives the authored dark Pit layer;
- browser force-dark materially changes the real Pit canvas;
- force-dark cannot move the player or change Pit zone/stage state;
- force-bright restores the normal Pit deterministically.

The existing WP0.6F Local Pit browser smoke remains authoritative for movement, collision, Bag/Map behaviour and Yard hand-off.

## Explicitly deferred

WP0.6K does not:

- change the tutorial battle rules or start a combat system;
- add NPC behaviour, betting, payouts or economy logic;
- alter Local Pit collision or staging;
- schedule ambient/random corruption events;
- alter objectives, inventory or story progression;
- replace the WP0.6F1 entry glitch with a new transition system.

Those remain later roadmap responsibilities, including WP0.6L final opening visual integration and sign-off.
