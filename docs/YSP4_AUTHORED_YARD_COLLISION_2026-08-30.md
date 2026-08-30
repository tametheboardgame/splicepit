# YSP-4 — Re-author Walkable Space / Collision to the Scene

Date: 30 August 2026
Status: COMPLETE — awaiting PR #76 merge

## Purpose

Make movement fit the recovered, user-approved Bright Yard scene rather than preserving the geometry of the previous procedural Yard.

## Visual source of truth

YSP-4 is authored against the exact YSP-3 production raster recovered and locked by PR #75:

- production canvas: 1280 × 720;
- WebP byte length: 177,808 bytes;
- SHA-256: `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`;
- scene direction: open-centre Yard.

The old `YARD_COLLIDERS` and previous Yard coordinates were not used as the geometry source.

## Authored scene geometry

The image-backed Yard now owns a 1280 × 720 world and matching camera bounds. The scene pack provides:

- feet-based protagonist collision;
- a safe lower-centre spawn at `(575, 660)`;
- explicit blocked geometry for the major visible physical masses;
- a deliberately open central movement court;
- a visible Master Lab tunnel exit footprint at the right-side retaining wall;
- no YSP-5 interaction anchors yet.

Major solid regions include:

- the GENECO workshop and attached service stack;
- THE HUT and north perimeter services;
- north vats;
- west storage;
- the lower-left containment compound and fence return;
- pit machinery and retaining walls;
- the splice pit itself;
- CRYO/container storage masses;
- the lower-right service ring.

Small surface clutter remains traversable where treating every decorative object as a collider would damage the generous movement rhythm established by YSP-1.

## Runtime integration

The isolated `?yardRenderer=scene-image` path now renders the exact recovered YSP-3 Bright Yard asset instead of the temporary YSP-0 raster.

The normal/live Yard renderer remains unchanged. Production replacement is still owned by YSP-7.

The YSP-0 compatibility alias remains temporarily available to the isolated spike, but it points at the YSP-4 scene pack and is widened to the `YardScenePack` interface so the intentionally empty YSP-4 anchor collection remains compatible until YSP-5 populates semantic anchors.

## Traversal proof

Automated geometry coverage performs deterministic reachability search from the authored spawn to the Master Lab tunnel while respecting the protagonist feet hitbox.

The mobile Chromium smoke additionally drives the actual protagonist through the scene:

1. starts at the authored lower-centre spawn;
2. collides with the visible lower-right service-ring geometry;
3. completes the existing movement/action/Bag/Map onboarding sequence;
4. preserves the mobile objective HUD and `Find your Master` objective;
5. traverses the authored open court around the pit infrastructure;
6. reaches the visible Master Lab tunnel footprint;
7. confirms the recovered Bright Yard base/foreground layers render without the legacy Yard underneath.

## Validation

GitHub Actions run #1124 passed:

- TypeScript typecheck;
- content validation;
- RNG-boundary validation;
- strict YSP-3 source integrity validation;
- all unit/domain/save tests, including YSP-4 scene-pack reachability;
- production build and emitted YSP-3 asset validation;
- full player-facing browser regression suite;
- YSP-4 mobile scene-image collision/traversal smoke.

## Scope boundary

YSP-4 deliberately does not choose final interaction coordinates, tutorial anchors, NPC/action anchors, or route-handoff behaviour. Those are YSP-5 responsibilities and must be authored semantically against this new layout rather than copied from the legacy Yard.

YSP-4 also does not activate the image-backed Yard as the normal production path. That remains YSP-7 after interaction and foreground-depth work are complete.
