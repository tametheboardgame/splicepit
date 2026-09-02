# SplicePit Scene-Image Propagation Roadmap — 2 September 2026

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

## RSP-1 — Holistic Opening Route Art Brief / Composition Lock — NEXT

Design the opening route as one believable authored place rather than a connector strip between game rooms.

The composition must visually explain where the player came from and where they are going, provide readable traversal on mobile, and include natural staging space for the debt encounter.

## RSP-2 — Generate and Select Bright Opening Route Master

Produce candidate authored route scenes and select the strongest composition against the locked RSP-1 brief.

## RSP-3 — Game-Ready Route Asset Preparation

Prepare exact production assets, deterministic hashes, decode validation and aligned foreground staging data.

## RSP-4 — Re-author Route Walkability / Collision / Exits

Author collision directly against the approved raster. Connect visible exits to Yard, Master Lab and onward progression semantics as required by the opening flow.

## RSP-5 — Route Story / Interaction / Debt Encounter Integration

Reconnect all route-specific objective, dialogue, encounter and semantic anchors to visible authored locations.

## RSP-6 — Route Foreground Depth / Character Grounding

Add only meaningful occlusion regions and contact grounding. Avoid broad foreground masks over ordinary traversable ground.

## RSP-7 — Authored Dark Route + Production Replacement

Create the matching corrupted route state and move the normal production route to the scene-image path with atomic fallback behaviour.

## RSP-8 — Route Mobile / Regression / Visual Acceptance

Run full automated regression and human visual check. The route must read as the same game as the approved Yard and Master Lab.

---

# Phase 2 — Local Pit Scene Propagation

Begins after the Route scene is production-stable. The architecture itself does not require re-approval.

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

`YSP-10 APPROVED ✓ → RSP-0 COMPLETE ✓ → RSP-1 NEXT → RSP-2 → RSP-3 → RSP-4 → RSP-5 → RSP-6 → RSP-7 → RSP-8 → LPSP-0 → ... → LPSP-8`

## Immediate next action

**Start RSP-1 — Holistic Opening Route Art Brief / Composition Lock.**
