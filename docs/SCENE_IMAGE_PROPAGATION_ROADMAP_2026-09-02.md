# SplicePit Scene-Image Propagation Roadmap — 2 September 2026

Last updated: 4 September 2026

## Authority

YSP-10 is human approved. The authored Apprentice Splicer Yard is now the production reference for environment rendering architecture.

This roadmap governs propagation of that model to the remaining weak opening environments without reopening the approved Yard architecture.

## Execution principle

Reuse the proven Yard system wherever possible:

- authored Bright and Dark scene rasters;
- scene-owned dimensions, collision and walkability;
- semantic exits and interaction anchors;
- feet-based protagonist grounding;
- selective exact-pixel foreground occlusion;
- mobile-safe navigation and objective readability;
- atomic preload/decode and deterministic asset validation;
- no procedural board-like scenery visible beneath the authored scene.

Do not force new art to preserve obsolete map geometry. Preserve gameplay meaning, story contracts, save state and route semantics instead.

---

# Phase 1 — Opening Route Scene Propagation

## RSP-0 — Opening Route Scene Contract / Existing Semantics Audit — COMPLETE ✓

Purpose: inventory exactly what the current opening route must preserve before replacing its environment presentation.

Locked:

- Yard ↔ Master Lab connectivity;
- Master Lab ↔ Local Pit progression path;
- debt encounter staging requirements;
- story/event triggers;
- required interaction anchors;
- mobile traversal expectations;
- camera and save/checkpoint semantics;
- Bright/Dark corruption behaviour.

Output: `docs/work-packages/RSP-0_OPENING_ROUTE_SCENE_CONTRACT.md`.

The audit explicitly separates semantic requirements from disposable `opening-world-v1` geometry, raw landmark coordinates, legacy waypoints, Old Toll geometry and the old collision-topology constraint.

## RSP-1 — Holistic Opening Route Art Brief / Composition Lock — COMPLETE ✓

Design the opening route as one believable authored place rather than a connector strip between game rooms.

Locked:

- one continuous warm semi-rural biotech service corridor;
- hooked / broken-S flow from Yard-side arrival to Viktor’s Lab, then through an inspection/weighbridge pull-in towards the Local Pit;
- Viktor’s Lab as the first dominant destination during `find-master`;
- a decommissioned livestock/biosecurity inspection pull-in as the physical debt-encounter staging concept;
- broad mobile-safe movement lanes, generous approach aprons and at least three distinct camera-scale traversal beats;
- Bright-world rural/biotech material storytelling with coherent Dark-state transformation hooks;
- the old toll booth, procedural road layout, Pass D geometry and legacy coordinates remain disposable.

Output: `docs/RSP1_HOLISTIC_OPENING_ROUTE_ART_BRIEF_2026-09-02.md`.

## RSP-2 — Generate and Select Bright Opening Route Master — COMPLETE ✓

Generated and evaluated multiple complete authored Bright route scenes against the locked RSP-1 selection order.

Selected:

- generation ID `36419539-1a20-4646-b1be-d92b04955e40`;
- `1536 × 1024` RGB PNG source;
- integrated hooked-service-route composition;
- lower-left Yard-side arrival language;
- dominant upper-right Viktor Lab mass;
- offset livestock/biosecurity weighbridge hardstanding suitable for the debt encounter;
- lower-right continuation towards the Local Pit;
- no protagonist, critical NPC, UI or required gameplay text baked into the selected master.

Output: `docs/RSP2_BRIGHT_OPENING_ROUTE_MASTER_2026-09-02.md`.

Exact production scale, raster preparation, deterministic packaging and camera/world dimensions remained deliberately owned by RSP-3.

## RSP-3 — Game-Ready Route Asset Preparation — COMPLETE ✓

Prepared a deterministic production derivative of the selected RSP-2 scene:

- `1024 × 683` JPEG, `120,561` bytes;
- SHA-256 `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- repository-owned canonical Base64 source fragments;
- deterministic materialisation, JPEG identity/dimension checks, dist verification and browser decode smoke;
- transparent exact-size foreground staging layer for later RSP-6 depth work;
- integer `3×` source-pixel mapping to a `3072 × 2049` route world, preserving the whole selected composition and supporting at least three 1280 × 720 camera-scale traversal beats.

Output: `docs/RSP3_GAME_READY_ROUTE_ASSET_PREPARATION_2026-09-02.md`.

Gameplay geometry and semantic anchors remained deliberately untouched until RSP-4.

## RSP-4 — Re-author Route Walkability / Collision / Exits — COMPLETE ✓

Authored the replacement Route gameplay geometry directly against the approved RSP-3 raster:

- scene-owned `3072 × 2049` world and 1280 × 720 camera limits;
- feet-based collision around visible buildings, cliffs, machinery, fenced masses and environmental boundaries;
- broad visible roads, Lab approach, weighbridge/debt staging ground and Pit approach retained as forgiving traversable space;
- stable semantic anchors for `yard-arrival`, `master-lab-entrance`, `master-lab-return`, `debt-encounter`, `local-pit-entrance` and `local-pit-return`;
- explicit Action/interact exits to Yard, Master Lab and Local Pit with safe route-side returns;
- deterministic reachability and approach-clearance tests replacing legacy raw-coordinate, waypoint and Old Toll assertions.

Output: `docs/RSP4_AUTHORED_ROUTE_COLLISION_EXITS_2026-09-02.md`.

Production rendering and story/runtime consumers remained deliberately unchanged until RSP-5.

## RSP-5 — Route Story / Interaction / Debt Encounter Integration — COMPLETE ✓

Reconnected Route gameplay meaning to the authored scene geometry without activating the new renderer early:

- versioned the semantic scene contract as `opening-route-bright-rsp5-v1` while preserving RSP-4 collision;
- mapped `find-master` to the authored `master-lab-entrance` anchor;
- defined shared ACTION/interact semantics for Yard return, Master Lab entry and Local Pit entry;
- bound Master Lab and Local Pit safe returns to `master-lab-return` and `local-pit-return` rather than public raw coordinates;
- moved the authored creditor staging contract from the retired Old Toll to the decommissioned biosecurity weighbridge at `debt-encounter`;
- preserved automatic armed-state triggering, retry-safe cutscene lifecycle and normal Bright-world presentation;
- migrated the creditor runtime away from a direct `OPENING_ROUTE_LANDMARKS` dependency;
- retained one central procedural-route compatibility fallback until RSP-7 activates the scene-image Route;
- replaced the Old Toll unit assertion with semantic weighbridge coverage and added dedicated Route objective/interaction/debt tests.

Output: `docs/RSP5_ROUTE_STORY_INTERACTION_DEBT_INTEGRATION_2026-09-02.md`.

## RSP-6 — Route Foreground Depth / Character Grounding — COMPLETE ✓

Added selective Bright Route depth and protagonist grounding without changing RSP-5 gameplay geometry or semantics:

- versioned the depth scene contract as `opening-route-bright-rsp6-v1`;
- authored four tight exact-base foreground crops for the Master Lab entry frame, west weighbridge rail, weighbridge booth front and Local Pit gate front;
- deliberately excluded ordinary dirt road, grass, the central junction and the weighbridge deck from foreground redraw;
- kept total foreground crop coverage below five per cent of the Route world;
- added deterministic feet-based `sortY` activation for every authored occluder;
- added one restrained feet contact shadow at 0.22 alpha;
- added renderer-agnostic Bright foreground/shadow helpers for RSP-7 to consume;
- preserved all RSP-5 source, world, camera, collision, anchor, exit, objective and debt contracts unchanged;
- added regression tests that fail if broad foreground masking is reintroduced.

The Yard-side chain-link gate remains deliberately outside the exact-base foreground set because a rectangular crop would incorrectly make the open mesh opaque over the protagonist.

Output: `docs/RSP6_ROUTE_FOREGROUND_DEPTH_GROUNDING_2026-09-02.md`.

## RSP-7 — Authored Dark Route + Production Replacement — COMPLETE ✓

PR: #92.

Completed production contract:

- RSP-3 Bright Route remains locked at `1024 × 683`, `120,561` bytes, SHA-256 `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- authoritative Dark Route is repository-owned at `1024 × 683`, `138,388` bytes, SHA-256 `5bff87c2bfe36bfb60bf6562afd8f66bfd3405a8ce85a6ef87bf92ba54d85be6`;
- Bright + Dark preload/decode is atomic and production cutover cannot activate partially;
- the scene-image renderer owns the `3072 × 2049` Route world, camera and RSP-4 collision;
- the exact-aligned Dark raster cross-fades through the existing Route `darkMix` contract;
- RSP-6 foreground occluders redraw matching Bright/Dark source crops and preserve character grounding;
- Yard, Master Lab and Local Pit transitions use semantic interactions and authored safe-return anchors;
- the creditor encounter resolves to the authored decommissioned biosecurity weighbridge rather than retired procedural/Old Toll coordinates;
- ambient environment ownership now follows semantic production `sceneMode`, with the old X-threshold retained only as legacy fallback;
- desktop and mobile authored Route traversal is covered by browser regression;
- final opening visual integration verifies Bright/Dark pixel change, UI suppression compatibility and unchanged gameplay state across Yard, Route, Master Lab and Local Pit.

The complete verify/build/player-facing browser suite passed on engineering head `c4fa360e68df0114a2cc6170e5212f65e566bcc2` in GitHub Actions run #1336 before documentation closure.

Implementation record: `docs/RSP7_DARK_ROUTE_PRODUCTION_REPLACEMENT_PLAN_2026-09-02.md`.

## RSP-8 — Route Mobile / Regression / Visual Acceptance — NEXT

Run the human-facing acceptance pass on the production-authored Route.

Required review:

- Bright Route visual quality and continuity with the approved Yard/Master Lab;
- Dark Route alignment, corruption readability and absence of geometry drift;
- protagonist grounding and foreground occlusion at representative traversal points;
- Master Lab, weighbridge and Local Pit approach readability;
- mobile portrait/landscape navigation and HUD coexistence;
- no residual procedural-board presentation visible in normal production;
- record visual-only revisions without reopening RSP-7 architecture unless a genuine integration defect is found.

---

# Phase 2 — Local Pit Scene Propagation

Begins after the Route scene is production-stable and visually accepted. The architecture itself does not require re-approval.

## LPSP-0 — Local Pit Scene Contract / Fight-Space Audit

Inventory exterior/interior, arrival, battle entry, result flow, crowd/background requirements, story anchors, camera behaviour and existing first-fight contracts.

## LPSP-1 — Holistic Local Pit Art Brief / Composition Lock

Design a distinctive local gene-splicing fight venue that supports both traversal and battle presentation without reading as a board or generic arena.

## LPSP-2 — Generate and Select Bright Local Pit Master

Produce and select the authored Pit master scene or scene set required by the locked contract.

## LPSP-3 — Game-Ready Pit Asset Preparation

Prepare deterministic production assets and validation.

## LPSP-4 — Re-author Pit Walkability / Collision / Battle Boundaries

Author traversal geometry and battle-space boundaries directly against visible scene features.

## LPSP-5 — Pit Interaction / Battle / Result Integration

Reconnect arrival, first fight, spectator/background life, result and progression semantics to the authored Pit.

## LPSP-6 — Pit Foreground Depth / Creature and Player Grounding

Ensure player and creature sprites belong naturally in the environment during exploration and combat.

## LPSP-7 — Authored Dark Pit + Production Replacement

Create corrupted counterpart behaviour where story language requires it and replace the weak production environment path.

## LPSP-8 — Pit Mobile / Battle / Regression / Visual Acceptance

Validate traversal, fight readability, touch controls, story progression and final opening-scene consistency.

---

# Current execution position

`YSP-10 APPROVED ✓ → RSP-0 COMPLETE ✓ → RSP-1 COMPLETE ✓ → RSP-2 COMPLETE ✓ → RSP-3 COMPLETE ✓ → RSP-4 COMPLETE ✓ → RSP-5 COMPLETE ✓ → RSP-6 COMPLETE ✓ → RSP-7 COMPLETE ✓ → RSP-8 NEXT → LPSP-0 → ... → LPSP-8`

## Immediate next action

**Finish the RSP-7 documentation-only CI/merge gate, then start RSP-8 Route Mobile / Regression / Visual Acceptance.**
