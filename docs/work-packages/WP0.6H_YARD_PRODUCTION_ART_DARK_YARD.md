# WP0.6H — Yard Production-Art Upgrade + Dark Counterpart

Status: implementation package

## Authority

This package implements `WP0.6H — Yard Production-Art Upgrade + Dark Counterpart` from `docs/GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

WP0.6H upgrades the accepted Apprentice Splicer Yard composition without changing its traversal topology. The Yard now has a production-detail bright presentation and an explicitly authored dark counterpart driven by the WP0.6G environment visual-state controller.

## Geometry and gameplay lock

The following opening-world contracts remain unchanged:

- world size: `2920 × 1600`;
- Yard viewport: `1280 × 720`;
- Yard spawn: `(900, 562)`;
- existing 19 Yard collision rectangles;
- existing tree-trunk collision behaviour;
- existing 13 opening-route waypoints;
- camera, movement, run, tutorial, objective, Bag and Map behaviour;
- save, inventory, story and battle state.

The production-art module declares `opening-world-v1` as its geometry contract and `collisionTopology: unchanged`. Regression coverage snapshots the accepted world dimensions, spawn, collider count/endpoints and waypoint count.

## Bright Yard production pass

The normal Yard remains colourful and inviting, but now reads as a used apprentice bio-husbandry workplace rather than a simple prototype map.

Authored detail groups include:

- layered foot and service traffic wear through the existing dirt routes;
- workshop roof seams, guttering, downpipe, patch repairs and exposed brick;
- working window ledges, hanging tools, service notices and wiring;
- reinforced pen braces, latch hardware, warning signage and husbandry troughs;
- tank reinforcement, service meter and containment clamps;
- a drainage grate tied to the workshop service area;
- pump/compressor hardware, copper service pipework, gas/sample canisters and wash-down hose;
- storage/workshop clutter positioned against existing structures rather than across traversal lanes;
- more varied weeds, flower clumps and edge vegetation;
- local contact shadows and depth cues around equipment;
- small deterministic ambient motion, including status lights, beacon state and a service drip.

The brighter detailing reuses the common WP0.6G wood, brick, plaster, steel, glass, cage, machinery and biological-material language so later locations can remain visually related.

## Authored dark Yard

The dark state is not a hue, saturation or brightness filter. It draws specific alternate environmental evidence over the same Yard landmarks and footprints.

Dark storytelling includes:

- waterlogged workshop plaster, suspect roof repairs, damaged guttering and dead window interiors;
- failed containment hardware and a visibly compromised pen latch;
- biological intrusion physically attached to pen bases, troughs, tanks and cages;
- a transformed sample tank that implies containment failure inside the same vessel;
- contaminated drain runoff leading towards the existing pond;
- polluted pond surface material and discarded biological evidence;
- dead vegetation and fungal replacement growth at the same planted edges;
- damaged pump hardware, torn hose, leaking canisters and intermittent electrical failure;
- local old blood/residue staining tied to equipment and drainage rather than a scene-wide red tint;
- impossible, twitching silhouettes behind familiar workshop/containment structures.

The result is deliberately the same place with a much worse history visible through it, not a second map.

## Runtime integration

`src/environment/yardProductionArtRuntime.ts` mounts a transparent production-art canvas over the existing opening canvas while the player is physically in the logical `yard` region.

The runtime:

- follows the existing Yard camera exactly;
- draws bright production details every Yard frame;
- samples the shared `EnvironmentVisualController`;
- crossfades the authored dark detail set using the controller's `darkMix` value;
- preserves the desktop objective/tutorial UI by copying those already-rendered canvas regions above the environment layer;
- automatically hides while Bag/Map is open or while Master Lab/Local Pit overlays are active;
- automatically disables on the opening route, leaving WP0.6I ownership intact;
- exposes `globalThis.__SPLICEPIT_YARD_ART__` for deterministic browser regression inspection.

The Yard capability is now marked `darkArtStatus: authored`; route, Master Lab and Local Pit remain `pending` for WP0.6I–K.

## Validation

Automated coverage now verifies:

- the Yard advertises authored bright and dark states against `opening-world-v1`;
- the roadmap's bright production-detail groups are represented;
- the roadmap's dark environmental-storytelling groups are represented;
- accepted Yard traversal topology remains unchanged;
- browser rendering mounts and paints the production-art layer;
- force-dark reaches a materially distinct dark render with substantial changed, dark and biological pixels;
- force-bright restores the normal Yard deterministically.

Existing Yard movement/collision smoke remains authoritative for traversal behaviour, while the new `yard-production-art-smoke.mjs` covers the actual rendered bright/dark contract.

## Explicitly deferred

WP0.6H does not:

- production-upgrade the opening route;
- author the Master Lab dark counterpart;
- author the Local Pit dark counterpart;
- schedule ambient/random corruption events;
- corrupt NPCs or creatures;
- change story progression or gameplay mechanics.

Those remain WP0.6I–L responsibilities.
