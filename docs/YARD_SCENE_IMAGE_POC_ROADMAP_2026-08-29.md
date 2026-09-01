# SplicePit Yard Scene-Image Proof of Concept Roadmap — 29 August 2026

## Why this exists

Human review of the merged Pass D build found a structural visual problem that automated tests could not detect: the environment art still read as scenery pasted onto the footprint of the old board-like Yard rather than one holistic authored location.

The correction is architectural. For the Apprentice Splicer Yard proof of concept, the environment is treated as an **authored scene image with explicit gameplay data layered over it**, rather than a procedural/code-drawn collection of scenery shapes.

If the Yard proof of concept succeeds visually and technically, the same architecture can then be considered for the opening route and Local Pit. Those conversions remain deferred until the Yard passes the YSP-10 human visual gate.

**Status: HUMAN GATE — YSP-0 through YSP-9 complete. YSP-10 Yard Scene-Image Human Gate is now required.**

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

The dark Yard is a matching authored scene pack with physical environmental changes, not merely a colour filter. Navigation remains aligned with the Bright Yard while the presentation becomes visibly wrong.

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

The strengthened YSP-3 gate prevents header-valid but truncated images from passing again.

Merged by PR #75.

## YSP-4 — Re-author Walkable Space / Collision to the Scene — COMPLETE

Source of truth: `docs/YSP4_AUTHORED_YARD_COLLISION_2026-08-30.md`.

Purpose: make movement fit the approved scene rather than forcing the scene to fit legacy colliders.

Completed:

- authored geometry directly against the recovered 1280 × 720 Yard pixels;
- scene/world/camera bounds match the production raster;
- retained the established feet-based protagonist hitbox;
- safe lower-centre spawn at `(575, 660)`;
- major visible structures made solid, including GENECO, THE HUT, containment, vats, pit infrastructure, retaining walls and storage masses;
- broad central court and movement rhythm preserved;
- visible right-side Master Lab tunnel authored as the route exit footprint;
- deterministic reachability from spawn to that tunnel;
- opt-in scene-image renderer wired to the exact recovered YSP-3 production raster;
- touch movement, collision, onboarding UI and physical traversal verified in Chromium;
- interaction anchors deliberately deferred to YSP-5 rather than copying legacy coordinates.

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
- visible tunnel performs the intended Master Lab route handoff;
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
- verified in Chromium that the service-ring foreground activates after Milo moves behind it;
- retained semantic interaction, onboarding, `Find your Master` and the Master Lab route handoff.

Gate result:

- exact approved scene pixels occlude the protagonist in intended depth relationships;
- player grounding is improved without changing collision or feet position;
- mobile interaction and traversal remain functional;
- GitHub Actions run #1131 passes the full verify and player-facing browser suites.

PR #78 is the YSP-6 delivery PR.

## YSP-7 — Bright Yard Runtime Replacement — COMPLETE

Purpose: make the image-backed Yard the normal production path.

Completed:

- normal Yard rendering now uses the authored scene-image pack after identity confirmation;
- old Pass D Yard scenery is absent from the active production path;
- Bright Yard assets preload before activation so a half-loaded scene cannot flash over the legacy Yard;
- legacy Yard remains only as an atomic failure fallback;
- all four approved protagonists retain their animated movement and save/selection flow;
- YSP-6 collision, foreground depth, interactions and visible tunnel route handoff are authoritative in production;
- runtime and browser contracts assert `yardRenderer = scene-image` on the normal path.

Gate result:

- production Bright Yard renders without old-board scenery underneath it;
- onboarding, Bag/Map/objective flow and Master Lab route handoff pass on the production scene renderer;
- all four protagonists pass the production Yard visual smoke.

Merged by PR #79.

## YSP-8 — Authored Dark Yard Scene Pack — COMPLETE

Purpose: prove the architecture supports SplicePit’s bright/dark story language.

Completed:

- exact approved 1280 × 720 Dark Yard counterpart packaged deterministically;
- Dark production identity: **143,796 bytes**, SHA-256 `f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b`;
- structural source/dist validation and Chromium image decode gate;
- Bright base, foreground staging layer and Dark base preload atomically;
- existing Yard `darkMix` drives the authored Dark scene rather than a procedural Yard overlay;
- Bright and Dark foreground occlusion use the same transition mix, avoiding Bright seams around the protagonist;
- collision, semantic anchors, player position and camera remain stable through Bright ↔ Dark transitions;
- cross-location opening visual integration now requires authored Dark Yard pixels alongside Route, Master Lab and Local Pit dark-state behaviour.

The final YSP-8 pass also hardened authored-Yard browser navigation where loose timing could stop just outside a narrow safe corridor.

Gate result:

- Bright → Dark → Bright transitions preserve gameplay state and alignment;
- Dark Yard is materially different while remaining the same navigable place;
- no legacy procedural Yard leaks into the transition;
- full verify and player-facing browser suites pass.

Merged by replacement PR #81 after the connector could not mark draft PR #80 ready for review.

## YSP-9 — Mobile / Performance / Regression Hardening — COMPLETE

Source of truth: `docs/YSP9_MOBILE_PERFORMANCE_REGRESSION_HARDENING_2026-08-31.md`.

Purpose: harden the production Bright/Dark scene-image Yard before human visual sign-off.

Completed:

- memoised the atomic Bright + foreground + Dark decode for page lifetime;
- failed atomic preload remains retryable rather than caching rejection forever;
- runtime exposes preload, cache-hit, decode, successful/failed-load and decode-duration evidence;
- repeated selector → Yard → selector → Yard entry proves **2 preload requests, 1 cache hit and only 3 total image decodes**;
- conservative three-surface decoded RGBA footprint is **11,059,200 bytes**, below the locked **12 MiB** guardrail;
- authored compressed Bright + Dark bases total **321,604 bytes**;
- image smoothing remains disabled through desktop, portrait and landscape viewport changes;
- forced Dark state preserves player/camera state on mobile;
- existing Bag corruption-suppression semantics are preserved: shell presentation temporarily returns Bright while forced Dark remains armed, then Dark resumes after close;
- ACTION/RUN touch targets and portrait/landscape containment remain valid;
- touch-only onboarding and tunnel traversal remain valid;
- brittle fixed-duration Yard and post-death Master Lab test movement was replaced with geometry/state-driven movement, without changing gameplay geometry.

Gate result:

- GitHub Actions run #1216 passes typecheck, content validation, RNG boundary, unit/domain/save tests, exact asset validation, production build and the complete player-facing browser suite;
- targeted YSP-9 lifecycle/mobile smoke passes with a hosted-Chromium first atomic load of 55.2 ms on that run;
- post-death Lab leave/re-enter/splice-bench persistence also passes after regression-test hardening;
- final cross-location opening visual integration passes.

PR #82 is the YSP-9 delivery PR.

## YSP-10 — Yard Scene-Image Human Gate — NEXT / REQUIRED

This is the hard visual decision point. Automated tests cannot pass it.

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

`YSP-0 ✓ → YSP-1 ✓ → YSP-2 ✓ → YSP-3 ✓ → YSP-4 ✓ → YSP-5 ✓ → YSP-6 ✓ → YSP-7 ✓ → YSP-8 ✓ → YSP-9 ✓ → YSP-10 HUMAN GATE`

Autonomous technical implementation is complete through YSP-9. Stop here for the explicit YSP-10 visual decision before converting the Opening Route or Local Pit to scene images.

---

# Success criterion

The proof of concept succeeds only if the deployed Yard looks like **one authored scene first and a navigable game map second**, while still playing reliably.

Automated tests are necessary but cannot pass YSP-10 on their own.
