# RSP-7 — Authored Dark Route + Production Replacement

Date: 2 September 2026

Status: in progress

Draft PR: #92

## Purpose

Complete the Opening Route scene-image propagation by adding an authored Dark counterpart to the approved Bright Route and replacing the live procedural Route with the RSP-4/RSP-5/RSP-6 scene-owned world.

RSP-7 must not activate a Bright-only Route. Bright and Dark authored dependencies must be prepared atomically so an ambient or story corruption transition cannot snap back to the obsolete procedural world.

## Already locked

RSP-7 inherits without redesign:

- RSP-3 Bright raster: 1024 × 683 JPEG, SHA-256 `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- 3× world mapping: 3072 × 2049;
- RSP-4 collision, camera, exits and semantic anchors;
- RSP-5 objective, interaction, safe-return and debt encounter semantics;
- RSP-6 foreground occlusion and contact-grounding contract.

## Dark Route art contract

The Dark Route must be an edit/counterpart of the locked Bright scene, not a new composition and not a generic tint/night filter.

Hard geometry constraints:

- same camera and perspective;
- same road centre-lines and widths;
- same Viktor Lab footprint and entrance location;
- same weighbridge deck, booth and rails;
- same Yard-side and Local-Pit-side route openings;
- same cliffs, major fences, structures and collision-readable masses;
- no protagonist, creditor representative, creature, UI or required text baked into the image.

Required physical Dark storytelling:

- contaminated drainage and runoff;
- diseased/dead verge patches rather than universal darkness;
- organic intrusion around Viktor's Lab services and lower structure;
- corrupted/biological material around the decommissioned weighbridge without blocking its staging space;
- damaged route infrastructure and transport remnants;
- Pit-bound residue/drag language on the lower-right approach;
- localised wrongness that can cross-fade against Bright without making traversal unreadable.

## Art-generation blocker observed on 2 September

Four image-generation attempts ignored the supplied/redisplayed Bright Route raster and generated unrelated project-status or GitHub screenshots instead.

Those outputs are discarded and are not repository assets.

Do not substitute any of those images, a generated dashboard, a generic dark filter, or procedural Pass D art as the authored Dark Route.

If the image service cannot bind the repository-derived source image, the correct recovery is to supply the Bright Route raster as an explicit user image attachment and retry as an image edit.

## Staged implementation already on PR #92

### Bright asset lifecycle

`src/environment/routeSceneAssetPack.ts`

- declares the exact RSP-3 Bright asset identity;
- validates expected 1024 × 683 decode dimensions;
- memoises the decoded Bright image;
- tracks lifecycle/debug state;
- exposes `darkReady`, initially false.

### Scene-image staging renderer

`src/environment/routeSceneImageRuntime.ts`

- renders the approved Bright raster into the 3072 × 2049 world;
- reuses RSP-6 feet-based contact shadow;
- reuses RSP-6 exact-base foreground occluders;
- exposes `productionCutoverReady`;
- refuses to report cutover readiness while `darkReady` is false.

### Interior return bridge

`src/world/routeRuntimeBridge.ts`

- reserves one semantic `splicepit:route-interior-return` event;
- carries only the semantic target (`master-lab` or `local-pit`);
- does not expose raw return coordinates to interior runtimes.

`routeSafeReturnPosition()` remains the owner of the authored Route-side return coordinates.

## Remaining implementation sequence

1. Generate and approve a valid Dark counterpart from the Bright Route source.
2. Prepare a deterministic production derivative at exactly 1024 × 683.
3. Store the Dark image as repository-owned canonical chunks, following the RSP-3/YSP-8 materialisation model.
4. Add deterministic Dark byte/hash/dimension validation and dist materialisation.
5. Extend `routeSceneAssetPack.ts` so Bright + Dark decode as one atomic dependency.
6. Extend `routeSceneImageRuntime.ts` to cross-fade Bright/Dark bases and matching RSP-6 foreground crops with the same `darkMix`.
7. Update `productionYardRuntime.ts` so Yard exits enter the authored Route at `yard-arrival` rather than the legacy target entry.
8. Switch authored Route camera/collision to `RSP6_ROUTE_SCENE_PACK` when the complete asset set is ready.
9. Update Master Lab entry detection to use the semantic `master-lab` Route interaction when the authored Route is active, retaining legacy detection only for fallback.
10. Update Local Pit entry detection in the same way.
11. On interior exit, dispatch the semantic return event; the Route runtime resolves `master-lab-return` or `local-pit-return` via `routeSafeReturnPosition()`.
12. Handle authored `yard-return` interaction without carrying legacy Route coordinates back into the new scene.
13. Remove `routeDebtEncounterPlacementForRuntime(false)` from the normal production path; the creditor encounter must use the authored weighbridge placement after cutover.
14. Update Route debug contracts so active geometry/renderer no longer claim `opening-world-v1` / Pass D.
15. Replace legacy Route browser assertions with scene-image traversal, Lab entry/return, debt staging, Pit entry/return and Bright/Dark transition coverage.
16. Run full typecheck, unit/domain/save tests, production build and player-facing browser smoke.
17. Human visual acceptance remains RSP-8, not RSP-7.

## Merge gate

PR #92 must remain draft and unmerged while any of the following are true:

- authored Dark Route missing;
- Dark hash/dimension validation missing;
- Bright + Dark atomic preload missing;
- normal production Route still uses legacy collision/camera;
- Lab/Pit returns still rely on raw legacy Route coordinates;
- creditor encounter uses Old Toll placement on the normal production path;
- full CI/browser suite is not green.

## Next action

Obtain a valid source-bound Dark Route edit, then continue the deterministic asset and production cutover steps above.
