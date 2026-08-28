# SplicePit Graphics Tightening Pass D Roadmap — 28 August 2026

## Authority

This document records the human visual review immediately after Graphics Tightening Pass C.

Pass C is technically complete, but human review found that its quality gain landed unevenly: the **Master Lab is substantially better and is now the accepted environment benchmark**, while the Apprentice Splicer Yard, opening route and Local Pit still read as visually messy, layered and below the protagonist/Lab quality bar.

This dated document therefore overrides the older use of the name **Graphics Tightening Pass D — Splice Bench / Creature Presentation** in `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` and `docs/ROADMAP.md`.

From this point forward:

- **Graphics Tightening Pass D = Full Environment Redraw**;
- the previously planned splice-bench graphics pass becomes **Graphics Tightening Pass E**;
- the previously planned Pit/battle graphics pass becomes **Graphics Tightening Pass F**;
- the previously planned final opening art pass becomes **Graphics Tightening Pass G**.

This renumbering changes visual-pass labels only. R0.8, R0.9 and R0.10 gameplay sequencing does not move.

**Status: IN PROGRESS — GTD-0 complete; GTD-1 through GTD-4 implemented; GTD-5 cleanup in progress; GTD-6 exact-tree/browser sign-off pending.**

---

## Locked quality decision

The current Master Lab is the mandatory reference environment for the opening slice.

The goal is no longer to "improve" Yard, route and Pit relative to their own previous versions. They must instead be rebuilt until they plausibly belong in the same game as:

1. the approved 64 × 96 protagonist sprites;
2. the current Master Lab;
3. the authored Viktor/RinoCow/creditor hero art.

A screenshot with the protagonist removed must still look deliberately authored, readable and attractive rather than like procedural browser-game scenery.

### What is explicitly rejected

- adding another decorative overlay on top of weak old scenery;
- retaining bad geometry because it already exists;
- repeated evenly spaced props, tiles or rectangles that create visual noise;
- treating material texture as a substitute for composition;
- generic paths that only exist to join gameplay points;
- keeping legacy art active underneath a replacement purely for rollback convenience once the replacement is proven;
- using a colour filter as the main dark-state treatment;
- changing gameplay scale or zoom to hide weak assets.

### What remains locked

Unless a genuine bug is found, Pass D does **not** change:

- world dimensions;
- protagonist scale;
- camera scale;
- traversal topology;
- collision topology;
- objectives/interactions;
- cutscene/event semantics;
- save/story state contracts.

The art must improve around the game, not force the game to be rebuilt around the art.

---

# Work-package sequence

## GTD-0 — Environment Redraw Contract / Legacy Audit — COMPLETE

Purpose: stop Pass D becoming another layer accumulation exercise.

Completed:

- froze Master Lab as the visual benchmark;
- audited the active Yard, route and Local Pit Pass B/Pass C stacks;
- established separate Pass D authored renderers;
- locked replacement-mode metadata into each production-art contract;
- kept gameplay geometry/data independent from the replaced art layers;
- switched the active Yard, route and Local Pit paths away from legacy + Pass C stacking.

Gate result:

- each problem environment now has one explicit Pass D active art path rather than a new overlay on top of the previous generation.

## GTD-1 — Apprentice Splicer Yard Full Redraw — IMPLEMENTED / VALIDATING

Purpose: rebuild the first normal gameplay area to the Lab benchmark.

Implemented:

- replaced the active layered Yard renderer with an opaque authored core redraw;
- rebuilt the arrival/work path with irregular ground transitions and clear desire lines;
- established a patched apprentice workshop as the principal architectural focal point;
- added animal-handling pen, specimen vat, quarantine cage and biotech service bench;
- clustered waste, repairs, hose and service equipment instead of scattering decorative clutter;
- added directional lighting, contact shadows and controlled foreground service-rail depth;
- authored physically different dark-state specimens, pipe intrusions, runoff and tissue;
- preserved world dimensions, colliders, spawn, tutorial and objective topology;
- removed superseded Yard production-art and foreground legacy files from the branch.

Validation already passed before later branch advances:

- strict TypeScript;
- content/RNG validation;
- all unit/domain/save tests;
- production build.

Full browser validation is being repeated on the combined final redraw tree.

## GTD-2 — Opening Route Full Redraw — IMPLEMENTED / VALIDATING

Purpose: make the route feel like an authored place rather than connective terrain.

Implemented:

- replaced the active legacy + Pass C route stack with one Pass D route renderer;
- rebuilt the Yard/Lab road with irregular shoulders, hand-patched road wear and authored drainage;
- gave the Lab approach its own utility/checkpoint identity;
- rebuilt the Old Toll/debt lay-by as a deliberate confrontation location while retaining the accepted walk-through inspection bay;
- added a crashed animal-transport cage and debt/ledger staging props;
- rebuilt the lower Pit road around haulage remnants, drainage and a stronger Local Pit approach billboard;
- authored location-specific dark road intrusions, contaminated drainage, wrong toll shadows and Pit-bound residue;
- preserved every existing route landmark, corridor and collider contract;
- removed the superseded route production-art legacy file from the branch.

## GTD-3 — Local Pit Exterior / Arrival Redraw — IMPLEMENTED / VALIDATING

Purpose: make arriving at the Local Pit feel like reaching a real underground animal-fighting operation.

Implemented:

- replaced generic exterior frontage with an authored arrival apron and a single strong venue silhouette;
- built a large Bramble Pit frontage/sign as the architectural focal point;
- retained the exact entrance gate collider geometry while visually rebuilding its towers and overhead structure;
- added waiver/ticket hatch, fight board, loading queues, security floodlights and purposeful service fencing;
- added animal holding/loading cages, wash-down gear, crates, rubbish and repair clusters;
- authored exterior dark-state tissue intrusion, mutated holding silhouettes, blood/runoff and corrupted entrance supports;
- kept the arrival-to-interior route visually clear.

## GTD-4 — Local Pit Interior / Arena Redraw — IMPLEMENTED / VALIDATING

Purpose: bring the Pit interior up to the same authored standard as the Lab.

Implemented:

- replaced the repeated tiled-floor look with large authored floor/material zones and clear traffic flow;
- rebuilt reception/registration as a functioning intake business with forms, specimen jars, terminal and queue board;
- rebuilt prep/weigh, holding and decon infrastructure around the locked collider footprint;
- rebuilt results/payout/medical staging as an operational desk rather than generic props;
- made the tutorial arena the dominant interior hero composition with worn rails, strong fight lighting, grouped spectator/business infrastructure and a readable battle floor;
- concentrated grime/blood/scuff evidence around believable traffic/impact areas instead of spreading it uniformly;
- authored physical dark-state arena rail/floor intrusion, warped holding equipment and biological contamination;
- preserved all R0.9 battle-floor staging and Local Pit collision topology.

## GTD-5 — Cross-Location Consistency / Legacy Removal — IN PROGRESS

Purpose: make the opening world read as one art-directed game.

Completed so far:

- normalised Pass D contracts around the Master Lab/protagonist quality reference;
- moved Yard, route and Local Pit to replacement-mode render paths;
- removed superseded `yardProductionArtLegacy.ts`;
- removed superseded `yardProductionArtDepthLegacy.ts`;
- removed superseded `routeProductionArtLegacy.ts`;
- removed superseded `localPitProductionArtLegacy.ts`;
- deliberately retained Master Lab Pass C production art because it is the accepted benchmark;
- preserved player scale, camera scale and gameplay geometry.

Remaining before GTD-5 completion:

- exact-tree browser review of foreground occlusion and mobile framing;
- confirm no remaining active imports rely on deleted generations;
- address any visual/runtime regression found by the combined smoke suite.

## GTD-6 — Pass D Integration / Sign-off — PENDING EXACT-TREE BROWSER GATE

Required validation:

- typecheck;
- content validation;
- RNG boundary validation;
- unit/domain/save tests;
- production build;
- Yard movement/tutorial/objective smokes;
- route movement/collision/corruption smokes;
- Master Lab regression smokes;
- Local Pit exterior/interior smokes;
- RinoCow/post-death/creditor regression smokes;
- mobile gameplay/layout smokes;
- final opening visual integration smoke.

Human visual gate:

- Yard, route and Local Pit must be judged against the **current Master Lab**, not against their pre-Pass-D versions.

Pass D is not complete if automated tests are green but the environments still look visually messy or prototype-grade.

---

# Execution order

Autonomous implementation order is locked as:

`GTD-0 → GTD-1 Yard → GTD-2 Route → GTD-3 Pit Exterior → GTD-4 Pit Interior → GTD-5 Consistency/Cleanup → GTD-6 Sign-off`

The implementation should proceed without repeated human approval between packages unless a genuinely subjective art-direction fork or technical hard stop appears.
