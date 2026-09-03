# RSP-7 — Authored Dark Route + Production Replacement

Date: 2 September 2026

Status: in progress

Draft PR: #92

## Purpose

Complete the Opening Route scene-image propagation by adding an authored Dark counterpart to the approved Bright Route and replacing the live procedural Route with the RSP-4/RSP-5/RSP-6 scene-owned world.

RSP-7 must not activate a Bright-only or partially integrated Route. Bright and Dark authored dependencies must be prepared atomically, and the semantic Lab/Pit bridge must be complete, before production cutover can become ready.

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

## Art-generation recovery state

Four image-generation attempts on 2 September ignored the supplied/redisplayed Bright Route raster and generated unrelated project-status or GitHub screenshots instead. Those outputs are discarded and are not repository assets.

A later source-bound Bright-preserving Dark candidate was selected in the previous working conversation and reduced to the required 1024 × 683 dimensions. However, that candidate was not committed into repository-owned canonical chunks before the conversation failed. Its exact bytes are therefore not a reproducible project dependency and it must not be treated as complete RSP-7 art.

Do not substitute the discarded images, a generated dashboard, a generic dark filter, procedural Pass D art, or an untracked local candidate as the authored Dark Route.

The locked Bright source remains fully recoverable from the repository-owned RSP-3 canonical chunks. To finish the authored Dark dependency, the source-bound image edit must be available as a usable image input again, then its accepted production derivative must immediately be canonicalised in Git so the asset cannot be lost between chats.

## Staged implementation on PR #92

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
- exposes explicit production cutover blockers;
- refuses production cutover while the authored Dark dependency is incomplete.

### Production cutover contract

`src/world/routeProductionCutover.ts`

- owns the authored Yard-to-Route entry;
- wraps RSP-6 collision and camera ownership;
- resolves Route interactions semantically;
- resolves Lab/Pit returns through authored safe-return anchors;
- derives a safe Yard-side return from the current approved Yard geometry;
- explicitly disallows legacy Route coordinates in the authored cutover contract.

### Semantic interior bridge

`src/world/routeRuntimeBridge.ts` and `src/environment/routeInteriorBridgeRuntime.ts`

- reserve one semantic `splicepit:route-interior-return` event;
- carry only the semantic target (`master-lab` or `local-pit`), never raw return coordinates;
- bind Master Lab and Local Pit entry consumers to authored semantic exit bounds only while scene-image Route is active;
- observe interior closure and dispatch the semantic return event;
- restore legacy entry behaviour whenever the authored Route is inactive.

`routeSafeReturnPosition()` remains the owner of the authored Route-side return coordinates.

This bridge is complete and covered by RSP-7 tests. It is no longer a cutover blocker.

### Production runtime staging

`src/productionYardRuntime.ts`

- preloads the Route staging dependency after the approved Yard dependency;
- keeps the live procedural Route as the atomic fallback while cutover readiness is false;
- switches Yard-to-Route entry, Route camera, collision and world dimensions together when readiness becomes true;
- stages authored Route rendering behind that same gate;
- handles the authored `yard-return` interaction without carrying the old Yard target-entry coordinates into the new scene;
- handles semantic Master Lab/Local Pit returns through authored safe-return anchors;
- exposes Route renderer/readiness/interaction state for debugging and downstream story consumers.

The gate is intentionally still false because the Dark raster is missing. This is staging, not a production activation.

## 3 September continuation and CI

Continuation commits added the authored production contract, semantic Master Lab/Local Pit bridge and gated runtime wiring. The first new unit assertion incorrectly tested the `yard-arrival` entry anchor as though it were itself an exit trigger; CI correctly rejected that assumption. The test now validates the centre of each authored exit bound instead.

The semantic bridge is now installed and covered without exposing legacy coordinates to the authored Route. `semanticInteriorBridgeReady` is true; the remaining production-cutover blocker is the missing Dark scene image.

The subsequent player-facing browser smoke exposed a separate brittle mobile test. Its simultaneous movement + ACTION assertion moved right from a position already adjacent to the approved Yard west-pit collision and could legitimately hit that collision before its arbitrary movement threshold. Commit `faca754dc83450fa8de20d1ea5d5a6b50eb0d8b2` isolates that input test by moving left across clear ground, while retaining the following dedicated rightward west-pit collision assertion.

After that fix, the verify job again passes typecheck, all unit/domain/save tests, content/RNG/YSP/RSP validation and production build. The player-facing browser suite is rerunning as the final non-art validation gate.

## Remaining implementation sequence

1. Re-establish a usable source-bound Dark counterpart from the locked Bright Route source.
2. Approve and preserve the deterministic production derivative at exactly 1024 × 683.
3. Store the Dark image as repository-owned canonical chunks, following the RSP-3/YSP-8 materialisation model.
4. Add deterministic Dark byte/hash/dimension validation and dist materialisation.
5. Extend `routeSceneAssetPack.ts` so Bright + Dark decode as one atomic dependency.
6. Extend `routeSceneImageRuntime.ts` to cross-fade Bright/Dark bases and matching RSP-6 foreground crops with the same `darkMix`.
7. Remove the legacy debt-placement path from normal authored production use; the creditor encounter must use the authored weighbridge placement after cutover.
8. Replace legacy Route browser assertions with scene-image traversal, Lab entry/return, debt staging, Pit entry/return and Bright/Dark transition coverage.
9. Run full typecheck, unit/domain/save tests, production build and player-facing browser smoke.
10. Human visual acceptance remains RSP-8, not RSP-7.

Already staged behind the inactive gate:

- authored Yard-to-Route entry;
- authored Route camera/collision/world dimensions;
- authored Route Bright scene-image renderer path;
- authored Yard return interaction;
- semantic Master Lab/Local Pit entry and safe-return bridge;
- debug renderer/readiness/interaction contract.

## Merge gate

PR #92 must remain draft and unmerged while any of the following are true:

- authored Dark Route missing;
- Dark hash/dimension validation missing;
- Bright + Dark atomic preload missing;
- normal production Route cutover readiness remains false;
- creditor encounter still has a legacy normal-production fallback after authored cutover;
- authored Route browser coverage is incomplete;
- full CI/browser suite is not green.

## Next action

Finish the authored Dark Route dependency first, canonicalise its exact accepted bytes immediately, then complete Bright/Dark atomic preload and production cutover. Do not activate or merge RSP-7 with a Bright-only Route.
