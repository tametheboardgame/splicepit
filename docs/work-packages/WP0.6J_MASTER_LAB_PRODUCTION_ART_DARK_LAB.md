# WP0.6J — Master Lab Production Art + Dark Lab

Status: implementation package

## Authority

This package implements `WP0.6J — Master Lab Production Art + Dark Lab` from `docs/GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

It upgrades the accepted WP0.6E Master Lab interior for close scrutiny during the RinoCow disaster and later splice tutorial without redrawing its gameplay structure.

## Geometry and gameplay lock

WP0.6J preserves:

- Master Lab world size: `1960 × 1200`;
- entry spawn: `(980, 1040)`;
- interior exit and exterior hand-off zones;
- all 16 accepted Lab collision rectangles;
- the entry, Viktor demonstration, RinoCow containment, primary splice bench and aftermath staging positions;
- existing cutscene/tutorial walkability between those staging points;
- camera, movement, run, Bag, Map and objective behaviour;
- the separate `pre-disaster` / `aftermath` story-state contract.

The production-art contract uses `master-lab-v1` and declares `collisionTopology: unchanged`.

## Bright Lab production pass

The bright state keeps the deliberately cheerful questionable-biotech tone while making the Lab feel like a real obsessive working space.

Authored detail includes:

- denser splice-bay machinery, clamps, gauges, control hardware and articulated service feeds;
- specimen racks, jars, cold-storage clutter and containment support equipment;
- tools, handwritten notes, reagent trays and consumables around active work surfaces;
- tubing, cabling, copper service lines, wall junctions and power indicators;
- drains, grates and containment-service points that make later leakage spatially credible;
- extra shelves and accumulated workplace clutter rather than decorative filler;
- stronger local contact shadows, equipment depth and three readable lighting centres;
- visual jokes and warning paperwork that frame routine gene-splicing malpractice as ordinary workshop procedure.

The accepted splice bench, Viktor stage and RinoCow tank remain visually dominant and readable for later interactions.

## Authored dark Lab

The dark state is a separately authored environmental reading of the same Lab, not a colour grade or global red overlay.

Location-specific corruption includes:

- failed specimens preserved badly in jars and an occupied discard cage;
- corrupted RinoCow containment fluid, tissue accumulation and implied hidden anatomy;
- blood, tissue and biological leakage following work surfaces, tank bases and drains;
- damaged control boxes, broken service hardware, intermittent sparks and hanging organic cabling;
- a contaminated primary splice bay and ruptured specimen column;
- wrong silhouettes and watching shapes in areas that were harmless in the bright state;
- darker local lighting while preserving the readable floorplan and interaction staging.

The environment visual state remains independent of the Lab's `pre-disaster` / `aftermath` story state. Forcing dark for corruption cannot trigger, advance or replace the RinoCow disaster state.

## Runtime integration and depth

WP0.6J uses the WP0.6G `EnvironmentVisualController` and renders through the existing `#master-lab-stage` canvas and animation loop.

The Lab frame order is:

1. accepted WP0.6E Lab base;
2. bright production-art base plus the authored dark base at the controller's `darkMix`;
3. protagonist;
4. bright production-art foreground plus authored dark foreground where spatially appropriate;
5. accepted Lab foreground;
6. objective and shell UI.

There is no independent production-art canvas and no second animation loop.

`src/environment/masterLabProductionArtRuntime.ts` exposes `globalThis.__SPLICEPIT_MASTER_LAB_ART__` for deterministic regression inspection. The Master Lab capability is now `darkArtStatus: authored`; Local Pit remains pending for WP0.6K.

## Validation

Automated coverage verifies:

- both visual states are authored against `master-lab-v1`;
- all bright-detail and dark-story groups are represented;
- Lab dimensions, spawn, exit, staging coordinates and collider count remain unchanged;
- accepted staging points and the doorway remain walkable where required;
- production art uses the existing Lab render loop and base/player/foreground depth order;
- no independent production-art canvas exists;
- browser force-dark materially changes the real Lab canvas;
- force-dark cannot move the player or change Lab story state;
- force-bright restores the normal Lab deterministically.

The existing WP0.6E Master Lab browser smoke remains authoritative for movement, Bag/Map behaviour, staging routes and Yard hand-off.

## Explicitly deferred

WP0.6J does not:

- alter the RinoCow disaster sequence or trigger it;
- implement the later splice tutorial interaction logic;
- change Lab collision, doors or cutscene staging;
- production-upgrade the Local Pit;
- schedule ambient/random corruption events;
- alter objectives, story progression, battle, inventory or economy.

Those remain WP0.6K–L and later roadmap responsibilities.
