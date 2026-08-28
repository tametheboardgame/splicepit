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

**Status: IN PROGRESS.**

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

## GTD-0 — Environment Redraw Contract / Legacy Audit — IN PROGRESS

Purpose: stop Pass D becoming another layer accumulation exercise.

Build/decide:

- freeze Master Lab as the visual benchmark;
- inventory active Yard/route/Pit Pass B and Pass C layers;
- identify which assets/shapes survive, which are redrawn and which are deleted;
- define a Pass D authored-environment module boundary separate from legacy production art;
- require replacements to supersede legacy scenery rather than always drawing over it;
- retain only gameplay-relevant geometry/data from older implementations where practical.

Gate:

- there is a clear active art path for each environment;
- no package is allowed to call itself complete merely because a new overlay exists.

## GTD-1 — Apprentice Splicer Yard Full Redraw

Purpose: rebuild the first normal gameplay area to the Lab benchmark.

Required result:

- remove the current layered/messy visual composition;
- establish one clear hero focal area for apprentice work/containment;
- create coherent workshop, animal-handling and biotech infrastructure;
- replace repetitive rectangular ground/path treatment with irregular authored edges and material transitions;
- reduce random clutter while increasing meaningful detail;
- add believable workbenches, pens/cages, tanks, pipes, waste, repairs, stains and discarded experiment equipment;
- use directional lighting, cast/contact shadows and controlled foreground depth;
- preserve obvious playable routes and interaction readability;
- author a true dark Yard in which objects physically become wrong rather than simply darker;
- retire superseded Yard Pass B/C decoration once the new scene is proven.

Gate:

- Yard can sit beside the current Master Lab without looking like an earlier prototype phase;
- player path remains immediately readable on desktop and mobile;
- existing Yard movement/tutorial/objective smokes remain green.

## GTD-2 — Opening Route Full Redraw

Purpose: make the route feel like an authored place rather than connective terrain.

Required result:

- redesign the route around a readable path hierarchy and recognisable landmarks;
- integrate the Lab approach, debt lay-by and Pit road into a coherent journey;
- replace long generic road rectangles with irregular shoulders, drainage, verge damage and hand-authored surface transitions;
- add believable utility/industrial/animal-transport remnants linked to the setting;
- strengthen the creditor encounter location without turning the whole route into clutter;
- create foreground/background separation and local lighting/focal moments;
- author physical dark-state changes specific to route objects and landmarks;
- retain the current traversal/collision corridor exactly unless a genuine bug is found.

Gate:

- the route is visually memorable even without NPCs;
- debt encounter staging reads naturally from the environment;
- route/corruption/integration smokes remain green.

## GTD-3 — Local Pit Exterior / Arrival Redraw

Purpose: make arriving at the Local Pit feel like reaching a real underground animal-fighting operation.

Required result:

- redesign approach, entrance, signage, queue/service/loading areas and external animal-handling infrastructure;
- create one strong architectural silhouette/focal entrance;
- communicate illegal/improvised venue operation through repairs, rubbish, cages, transport gear, betting/fight signage and security/barriers;
- remove generic frontage and decorative noise;
- maintain clean route from arrival to interior trigger;
- create authored dark-state physical corruption around the entrance.

Gate:

- the exterior instantly communicates "local underground splice-fighting venue" before dialogue explains it;
- entrance and interaction points remain readable on mobile and desktop.

## GTD-4 — Local Pit Interior / Arena Redraw

Purpose: bring the Pit interior up to the same authored standard as the Lab.

Required result:

- rebuild reception/service zone, holding infrastructure and arena focal composition;
- make the space look operational rather than like a generic dark room with props;
- establish believable crowd/betting/service/animal-flow architecture;
- give the arena a strong hero silhouette and lighting hierarchy;
- use grime/blood/damage intentionally rather than as uniform noise;
- build foreground rails, overhead structures, cage/holding details and selective background life;
- preserve first-fight staging requirements for R0.9;
- author a physically wrong dark counterpart instead of a palette-only variant.

Gate:

- Pit interior reaches the Lab benchmark for composition, materials and environmental storytelling;
- battle staging remains unobstructed and readable.

## GTD-5 — Cross-Location Consistency / Legacy Removal

Purpose: make the opening world read as one art-directed game.

Required result:

- normalise pixel density, outline weight, highlight/shadow language and material contrast across Yard, route, Lab and Pit;
- align protagonist contact shadows/grounding with each environment;
- verify foreground layers never hide interaction-critical space;
- remove superseded Pass B/C environment wrappers/legacy art where they no longer serve an active purpose;
- preserve the Master Lab unless a small consistency correction is necessary;
- verify bright/dark transitions across all locations;
- validate portrait/landscape mobile framing and accepted 1280 × 720 desktop composition.

Gate:

- no opening environment looks like it belongs to an older visual generation;
- screenshot review should show one coherent visual language across the full opening route.

## GTD-6 — Pass D Integration / Sign-off

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
