# LPSP-2 — Bright Local Pit Master Selection

Status: **COMPLETE / HUMAN APPROVED**

Date: 5 September 2026

Authority: `docs/LPSP1_HOLISTIC_LOCAL_PIT_ART_BRIEF_2026-09-05.md`, `docs/work-packages/LPSP-0_LOCAL_PIT_SCENE_CONTRACT.md`, and the approved scene-image production architecture.

## Selected master

The selected Bright Bramble Pit master is the daytime generation approved by human review on 5 September 2026.

Exact source identity:

- generation ID: `29a7292d-3e04-45ce-9cb9-62d68c458eea`;
- source raster: `1536 × 1024` RGB PNG;
- source bytes: `4,193,815`;
- SHA-256: `751b46842e0630a5cba646f13f5e170a8aae81ee94b21b6f119f32ad014dc6ce`.

The earlier dusk/night candidate `8952e97e-b11b-45a5-96e1-29d6a2bc7249` is rejected because the opening slice is still in daylight and moving from the daylight Route into a night Pit would create an unjustified time-of-day discontinuity.

## Why this master was selected

The approved daytime image satisfies the LPSP-1 composition lock unusually well:

- one continuous Bramble Pit environment rather than disconnected exploration and battle backdrops;
- clear rural livestock-market / agricultural-showground identity;
- warm daylight continuity with the approved Yard, Opening Route and Master Lab exterior language;
- broad lower-left arrival apron and obvious event entrance;
- registration, prep, weigh and decon functions arranged around a believable fighter-processing route;
- dominant central/right fight arena with enough open floor for future runtime creatures and compact battle UI;
- medical and payout/results functions naturally placed on the post-fight route;
- lower-right continuation suitable for the semantic Route exit;
- spectator, trailer, pen, event and agricultural infrastructure make the venue feel active without requiring named runtime NPCs;
- biotech equipment is integrated into agricultural handling infrastructure rather than reading as generic sci-fi;
- the arena is visibly the same physical place the player will traverse into, supporting the LPSP-1 exploration-to-battle continuity rule;
- strong same-geometry Dark-state hooks exist in drains, pens, arena seams, decon equipment, medical/result areas, bunting, fencing and animal-handling infrastructure.

## Human review

The first generated candidate was immediately rejected for time-of-day mismatch.

The regenerated daytime candidate received explicit human approval: **“Love it”**.

That approval locks this exact generation as the Bright Local Pit master for LPSP-3 onward.

## What remains deliberately unlocked

LPSP-2 does **not** lock:

- production raster dimensions or compression;
- world scale or source-to-world mapping;
- camera bounds;
- collision geometry;
- walkability polygons;
- semantic anchor coordinates;
- battle-floor runtime boundaries;
- foreground occluders;
- Dark counterpart asset;
- runtime cutover.

Those remain owned by LPSP-3 through LPSP-7.

## Next

**LPSP-3 — Game-Ready Pit Asset Preparation**: derive a deterministic production asset from this exact approved source, validate identity/decode, and choose world/camera scale without modifying the approved composition.