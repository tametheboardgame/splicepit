# SplicePit Yard Scene-Image Proof of Concept Roadmap — 29 August 2026

## Why this exists

Human review of the merged Pass D build found a structural visual problem that automated tests could not detect: the environment art still read as scenery pasted onto the footprint of the old board-like Yard rather than one holistic authored location.

The correction is architectural. For the Apprentice Splicer Yard proof of concept, the environment is treated as an **authored scene image with explicit gameplay data layered over it**, rather than a procedural/code-drawn collection of scenery shapes.

If the Yard proof of concept succeeds visually and technically, the same architecture can then be considered for the opening route and Local Pit. Those conversions remain deferred until the Yard passes the YSP-10 human visual gate.

**Status: ACTIVE — YSP-0 through YSP-6 complete. YSP-7 Bright Yard Runtime Replacement is next.**

---

# Locked decisions

The proof of concept keeps:

- the approved Milo / Theo / Ada / Pip protagonist art;
- protagonist world display scale;
- 1280 × 720 desktop gameplay-view direction;
- existing mobile controls and UI semantics;
- four-direction movement;
- feet-based player grounding/collision behaviour;
- Bag / Map / Action / objective semantics;
- the opening story requirement that the player begins in the Apprentice Splicer Yard and can leave towards the Master Lab;
- save/story/event contracts that do not depend on exact Yard coordinates.

The following Yard details remain free to change when required by the authored scene:

- internal layout and exact route shape;
- prop/building placement;
- spawn and exit coordinates;
- collision geometry and walkable-space topology;
- interaction-anchor coordinates;
- camera bounds.

The gameplay **meaning** of the Yard remains locked. Legacy map geometry is not.

---

# Target architecture

## 1. Authored base scene

A complete raster supplies coherent ground, paths, architecture, containment areas, biotech infrastructure, vegetation, material detail, lighting and environmental storytelling. The old procedural Yard must not remain visible beneath it.

## 2. Explicit gameplay geometry

The scene owns deterministic gameplay data rather than deriving gameplay from pixels at runtime:

- walkable/blocked space;
- feet-based collision;
- spawn;
- Lab-route exit;
- interaction anchors;
- camera/world bounds.

## 3. Foreground / occlusion layer

An authored foreground treatment supplies objects the player can pass behind. Rendering is conceptually:

`base scene → behind-player actors/effects → player/NPCs → foreground occlusion → UI/effects`.

YSP-6 implements this without generating a second painted scene: selected approved base-image regions are redrawn after the player when their feet are behind those features, guaranteeing exact pixel alignment.

## 4. Dark/corrupted counterpart

The dark Yard will be a matching authored scene pack with physical environmental changes, not merely a colour filter. Navigation should remain recognisable unless a story beat deliberately changes it.

---

# Work-package sequence

## YSP-0 — Yard Scene Contract / Technical Spike — COMPLETE

Purpose: prove an image-backed Yard can coexist safely with movement, camera, mobile controls, UI and story systems.

Completed:

- scene-pack runtime interface;
- image base/foreground loading contract;
- scene-owned world/camera dimensions;
- explicit blocked-geometry representation;
- feet-based collision;
- scene-owned spawn, exit and anchor metadata;
- opt-in `?yardRenderer=scene-image` path;
- renderer isolation from the live Pass D Yard;
- mobile controls/HUD, Bag, Map, Action and objective regression coverage.

Merged by PR #69.

## YSP-1 — Holistic Yard Art Brief / Composition Lock — COMPLETE

Source of truth: `docs/YSP1_HOLISTIC_YARD_ART_BRIEF_2026-08-29.md`.

Locked direction:

- warm pastoral-biotech identity, attractive first and concerning second;
- asymmetrical authored composition rather than board geometry;
- crooked apprentice workshop as the primary architectural mass;
- connected biotech work cluster and animal/quarantine area;
- drainage/vegetation counterweight;
- believable service route towards the Master Lab;
- generous movement space suitable for keyboard and touch;
- limited intentional foreground-depth opportunities;
- no procedural-looking lawns, prop islands or generic sci-fi/farm layout.

## YSP-2 — Generate and Select Bright Yard Master Scene — COMPLETE

Source of truth: `docs/YSP2_BRIGHT_YARD_MASTER_2026-08-29.md`.

Selected direction:

- **open-centre Yard**;
- clean generation lineage `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`;
- raw generation dimensions 1536 × 1024;
- broad central movement space;
- strong integrated workshop/containment/service composition;
- no baked protagonist characters.

The selected scene passed the human composition gate as substantially more like one authored location than the Pass D Yard.

## YSP-3 — Game-Ready Asset Preparation — COMPLETE

Source of truth: `docs/YSP3_GAME_READY_ASSET_PREPARATION_2026-08-30.md`.

The first YSP-3 transport merged by PR #73 was later found to be truncated when YSP-4 attempted to use the actual emitted pixels. The recovery work did not accept the broken source or guess geometry around it.

PR #75 restored the exact approved Bright Yard image supplied by the user and established the production identity:

- canvas: **1280 × 720**;
- format: WebP;
- exact byte length: **177,808 bytes**;
- SHA-256: `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`;
- complete RIFF and VP8 payload validation;
- Chromium `image.decode()` validation;
- deterministic emitted-pack hashes;
- aligned transparent foreground staging layer for YSP-6.

The strengthened YSP-3 gate now prevents header-valid but truncated images from passing again.

Merged by PR #75.

## YSP-4 — Re-author Walkable Space / Collision to the Scene — COMPLETE

Source of truth: `docs/YSP4_AUTHORED_YARD_COLLISION_2026-08-30.md`.

Purpose: make movement fit the approved scene rather than forcing the scene to fit legacy colliders.

Completed:

- authored geometry directly against the recovered 1280 × 720 Yard pixels;
- scene/world/camera bounds now match the production raster;
- retained the established feet-based protagonist hitbox;
- established a safe lower-centre spawn at `(575, 660)`;
- made major visible structures solid, including GENECO, THE HUT, containment, vats, pit infrastructure, retaining walls and storage masses;
- preserved the broad central court and usable movement rhythm;
- authored the visible right-side Master Lab tunnel as the route exit footprint;
- proved deterministic reachability from spawn to that tunnel;
- wired the opt-in scene-image renderer to the exact recovered YSP-3 production raster rather than the YSP-0 placeholder;
- verified touch movement, collision, onboarding UI and physical traversal in Chromium;
- retained the current normal/live Yard renderer unchanged until YSP-7;
- deliberately left interaction anchors empty for YSP-5 instead of copying legacy coordinates.

Gate result:

- production/type/unit/build checks pass;
- full browser regression passes;
- mobile character collides with authored visible geometry and can traverse from spawn to the Master Lab tunnel;
- old Yard geometry is not used by the image-backed path.

Merged by PR #76.

## YSP-5 — Interaction Anchors / Tutorial and Objective Integration — COMPLETE

Purpose: reconnect opening gameplay semantics to the new layout.

Completed:

- versioned the scene contract as `yard-bright-scene-ysp5-v1` without changing YSP-4 collision;
- authored semantic locations against approved scene pixels for the GENECO workshop door, containment inspection point, service-ring inspection point and Master Lab tunnel;
- kept each interaction anchor on reachable feet-safe ground;
- mapped the visible right-side tunnel to the existing authored Master Lab approach at `(1760, 655)`;
- added semantic exit lookup rather than depending on brittle legacy coordinates;
- resolved the tutorial ACTION against the authored service-ring interaction anchor;
- preserved Bag/Map onboarding and progression to `Find your Master`;
- handed the scene-image Yard into the existing authored opening-route world through the visible tunnel without restarting onboarding or objective state;
- verified the semantic interaction and route handoff through mobile Chromium smoke.

Gate result:

- fresh onboarding completes in the image-backed Yard;
- objective reaches `Find your Master`;
- the visible tunnel performs the intended Master Lab route handoff;
- full verify and browser suites pass.

Merged by PR #77.

## YSP-6 — Foreground Depth / Character Grounding — COMPLETE

Source of truth: `docs/YSP6_FOREGROUND_DEPTH_GROUNDING_2026-08-30.md`.

Purpose: make the protagonist feel embedded in the authored scene without generating or repainting another Yard image.

Completed:

- versioned the scene contract as `yard-bright-scene-ysp6-v1` while preserving all YSP-5 collision, interaction and route semantics;
- authored four depth regions around the service ring, pit front rail and Master Lab tunnel;
- redraws those regions from the exact already-decoded approved Bright Yard base after the protagonist only when the protagonist's feet are behind the feature;
- retained the precisely aligned transparent foreground staging layer while avoiding a second lossy/colour-shifted painted source;
- added a restrained scene-specific contact shadow tied to the protagonist feet;
- verified deterministic depth sorting at multiple vertical positions;
- verified in Chromium that the service-ring foreground actually activates after Milo moves behind it;
- retained semantic interaction, onboarding, `Find your Master` and the Master Lab route handoff;
- retained complete separation from the normal/live Yard path until YSP-7.

Gate result:

- exact approved scene pixels occlude the protagonist in intended depth relationships;
- player grounding is improved without changing collision or feet position;
- mobile interaction and traversal remain functional;
- GitHub Actions run #1131 passes the full verify and player-facing browser suites.

PR #78 is the YSP-6 delivery PR.

## YSP-7 — Bright Yard Runtime Replacement — NEXT

Purpose: make the image-backed Yard the normal production path.

Build:

- switch normal Yard rendering to the scene pack;
- stop drawing Pass D Yard scenery in the active path;
- retain an explicit temporary development fallback only if useful for rollback;
- fail/fallback atomically if scene assets cannot load;
- update runtime/smoke contracts to assert the image-backed production path.

Gate:

- deployed Bright Yard contains no visible old-board scenery underneath or around the authored scene;
- onboarding and route handoff work on the production scene-image renderer.

## YSP-8 — Authored Dark Yard Scene Pack

Purpose: prove the architecture supports SplicePit’s bright/dark story language.

Process:

- use the approved bright Yard as the layout reference;
- author a matching dark counterpart with physical environmental changes;
- keep dimensions and anchors aligned with the bright scene;
- keep collision stable unless a story beat explicitly requires a movement change;
- transition between coherent scene states rather than procedural overlays.

Gate:

- bright/dark transitions preserve player position and camera correctly;
- dark state is recognisably the same Yard but physically wrong;
- no scene-pack alignment jump.

## YSP-9 — Mobile / Performance / Regression Hardening

Validate:

- 1280 × 720 desktop composition;
- portrait and landscape mobile layout;
- touch movement and run controls;
- image decode/preload time and memory footprint;
- canvas smoothing/blur behaviour;
- Bag/Map/Action/objective UI;
- route handoff;
- save/story compatibility;
- title/narration/selection/Yard integration.

Gate:

- smooth target-browser performance on mobile and desktop;
- no new soft lock, traversal or presentation regression.

## YSP-10 — Yard Scene-Image Human Gate

This is the hard visual decision point.

User review should answer:

1. Does the Yard finally read as one holistic authored place rather than scenery pasted onto a board?
2. Does it look like it belongs in the same game as the protagonist sprites and Master Lab?
3. Does the protagonist look naturally embedded in it?
4. Is movement/readability good on mobile?
5. Is the scene-image architecture good enough to propagate to the opening route and Local Pit?

Outcomes:

- **APPROVE:** scene-image architecture becomes the preferred environment model for remaining weak opening locations; create follow-on Route and Local Pit conversion packages.
- **REVISE:** iterate the Yard only; do not propagate yet.
- **REJECT ARCHITECTURE:** keep the experiment isolated and reassess without destabilising the rest of the game.

No Route or Local Pit scene-image conversion begins before this gate.

---

# Implementation order

Autonomous order:

`YSP-0 Technical Spike → YSP-1 Art Brief → YSP-2 Bright Master Generation → YSP-3 Asset Preparation → YSP-4 Collision/Walkability → YSP-5 Interactions → YSP-6 Foreground Depth → YSP-7 Bright Runtime Replacement → YSP-8 Dark Scene → YSP-9 Hardening → YSP-10 Human Gate`

Current position:

`YSP-0 ✓ → YSP-1 ✓ → YSP-2 ✓ → YSP-3 ✓ → YSP-4 ✓ → YSP-5 ✓ → YSP-6 ✓ → YSP-7 NEXT`

Proceed autonomously between technical packages. Stop for user input only if a genuine visual choice cannot be resolved from the approved direction, or when YSP-10 is reached.

---

# Success criterion

The proof of concept succeeds only if the deployed Yard looks like **one authored scene first and a navigable game map second**, while still playing reliably.

Automated tests are necessary but cannot pass YSP-10 on their own.
