# YSP-10 Final Human Approval — 2 September 2026

## Decision

**APPROVED.**

The final on-device review of YSP-10B confirmed that the revised Apprentice Splicer Yard works correctly and the scene-image architecture is accepted for forward production use.

## What is now locked

- the authored Bright/Dark scene-image environment model is the preferred production architecture for comparable opening locations;
- explicit scene-owned collision, walkability, exits, interaction anchors and camera bounds remain authoritative rather than inferred from pixels;
- protagonist feet-based grounding and selective foreground occlusion remain the depth model;
- mobile readability and touch traversal remain release gates;
- the Bright/Dark corruption language remains part of the environmental contract;
- visible scenery must correspond to believable gameplay geometry and route semantics;
- invisible routes through visually solid scenery are not acceptable;
- the old board-like procedural environment presentation is not to be restored as the normal production path.

## Final YSP-10B corrections accepted

- south dirt path behaves as a real Master Lab route with objective guidance;
- right-hand tunnel remains a valid alternate route;
- `DON'T LOOK DOWN` warning sign collision matches its visible footprint;
- cryo/container foreground crops no longer redraw ordinary clear ground over the protagonist;
- foreground locator appears only when the protagonist is materially obscured;
- north perimeter remains blocked because the current raster has no visible traversable opening.

## Delivery evidence

- PR #86: `YSP-10B Yard Spatial and Depth Audit`;
- final reviewed head: `d3ad5dde988d06e3159df2ee35e02623507ee40b`;
- GitHub Actions run #1239: PASS;
- merge commit: `cc2dcac4449e9936eb16aa6cf7aec35094c4271b`.

## Consequence

The previous prohibition on propagating scene-image architecture to the Opening Route and Local Pit is lifted.

The next workstream is the Opening Route conversion, followed by Local Pit conversion, using the Yard implementation as the production reference rather than re-inventing the rendering architecture.
