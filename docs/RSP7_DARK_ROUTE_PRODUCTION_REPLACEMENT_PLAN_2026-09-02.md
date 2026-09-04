# RSP-7 — Authored Dark Route + Production Replacement

Date: 2 September 2026

Last updated: 4 September 2026

Status: blocked on exact Dark Route source completion

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

## Dark source recovery audit — 4 September 2026

The previous working conversation produced a source-bound Dark candidate derived from the locked Bright composition. Before that conversation failed, portions of its 1024 × 683 JPEG transport were copied into the RSP-7 branch as repository-owned Base64 fragments.

The branch now contains one continuous accepted transport assembled from:

- `route-dark-base.part00.txt` through `part04.txt`;
- accepted `tail00` through `tail15` fragments, including the deliberately split 05, 06, 07, 08 and 09 sections.

The accepted transport is exactly 124,000 Base64 characters and decodes to exactly 93,000 bytes. New deterministic validation proves that it begins as a JPEG but is incomplete: the byte stream has no JPEG EOI (`FF D9`) marker and `tail15` ends without Base64 padding. The candidate therefore remains truncated and cannot be treated as an image asset.

An exhaustive repository audit found no valid continuation:

- no `tail16` or later fragment;
- no alternate RSP-7 Dark JPEG/WebP;
- no hidden Dark manifest containing a complete payload;
- no second complete source under another RSP-7 path;
- no usable continuation in the deliberately removed mismatched chunk/tail commits.

The earlier removed fragments were overlapping or mismatched transfers and are not the missing continuation of the accepted stream. Appending an artificial JPEG EOI marker, guessing bytes, or approving the partial file would corrupt the deterministic asset contract and is explicitly prohibited.

The exact missing tail must therefore be recovered from the original Dark candidate, or the source-bound Dark edit must be recreated from the locked Bright source and immediately canonicalised in Git.

## Engineering completed on PR #92

### Atomic Bright + Dark lifecycle

`src/environment/routeSceneAssetPack.ts`

- declares the exact RSP-3 Bright identity;
- declares the RSP-7 Dark source-grid contract;
- validates expected 1024 × 683 decode dimensions;
- provides atomic Bright + Dark preload semantics;
- exposes independent Bright/Dark readiness and lifecycle debug state;
- refuses production readiness when either authored base is unavailable.

### Deterministic Dark materialisation and integrity gates

New RSP-7 tooling now:

- reconstructs the accepted Dark transport in one deterministic order;
- rejects malformed Base64;
- validates JPEG SOI, EOI and SOF structure;
- validates 1024 × 683 dimensions;
- rejects accidental Bright-as-Dark input;
- calculates the exact Dark SHA-256 only after a complete valid image exists;
- materialises the accepted source to `public/generated/rsp7/route-dark-base.jpg`;
- emits a deterministic Dark scene manifest;
- verifies emitted `dist` bytes and SHA against that manifest;
- independently decodes the emitted JPEG in Chromium.

These checks are part of normal `verify`, build and browser-smoke gates. The current branch intentionally fails Dark validation at the missing-EOI check rather than silently shipping corrupt art.

### Scene-image Bright/Dark renderer

`src/environment/routeSceneImageRuntime.ts`

- prepares Bright + Dark atomically;
- renders the approved Bright raster into the 3072 × 2049 world;
- cross-fades the exact-aligned Dark base using the existing Route corruption `darkMix`;
- reuses the RSP-6 feet-based contact shadow;
- exposes Dark mix/render state for regression/debugging;
- refuses production cutover until both authored bases decode successfully.

### Foreground depth parity

`src/environment/routeDepthGroundingRuntime.ts`

- preserves the exact RSP-6 foreground occluder geometry;
- redraws the matching Bright/Dark source crops with the same `darkMix` as the base scene;
- prevents Bright halos or seams around the protagonist while they pass behind authored foreground objects during corruption transitions.

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

`routeSafeReturnPosition()` remains the owner of authored Route-side return coordinates. The semantic bridge is complete and is no longer a cutover blocker.

### Production runtime staging

`src/productionYardRuntime.ts`

- keeps the live procedural Route as the atomic fallback while cutover readiness is false;
- switches Yard-to-Route entry, Route camera, collision and world dimensions together when readiness becomes true;
- stages authored Route rendering behind that same gate;
- handles the authored `yard-return` interaction without carrying old Yard target-entry coordinates into the new scene;
- handles semantic Master Lab/Local Pit returns through authored safe-return anchors;
- exposes Route renderer/readiness/interaction state for debugging and downstream story consumers.

### Regression hardening

The WP0.7A browser cutscene smoke exposed a completion/cleanup observation race. The regression now waits for the actual released state: completed cutscene, controls unlocked, ambient suppression false and the cutscene corruption suppression reason removed. Runtime behaviour itself was not changed.

Before Dark integrity became the blocking gate, the current engineering path passed TypeScript and all unit/domain/save tests, including 207 tests in the observed CI run. Dark materialisation then correctly failed on the missing JPEG EOI marker.

## Remaining sequence

1. Recover the exact remaining bytes of the accepted Dark candidate, or recreate the source-bound Dark edit from the locked Bright source.
2. Canonicalise the complete accepted Dark image immediately using `npm run package:rsp7-dark -- <path>`.
3. Lock its exact byte length and SHA-256 once deterministic validation succeeds.
4. Run the complete verify/build/browser suite with the now-complete Dark asset.
5. Migrate any remaining normal-production Route/debt assertions to the authored path and remove the legacy normal-production fallback only after cutover readiness is true.
6. Close RSP-7 documentation and merge PR #92 only with full automated gates green.
7. Human visual acceptance remains the following gate, not a reason to weaken RSP-7 asset integrity.

## Merge gate

PR #92 must remain draft and unmerged while any of the following are true:

- authored Dark Route bytes are incomplete;
- Dark JPEG/hash/dimension validation is not green;
- Bright + Dark atomic preload cannot complete;
- normal production Route cutover readiness remains false;
- creditor encounter still requires a legacy normal-production fallback after authored cutover;
- authored Route browser coverage is incomplete;
- full CI/browser suite is not green.

## Current blocker

The only irreducible external dependency is the missing exact tail of the accepted Dark Route JPEG. The repository contains 124,000 Base64 characters / 93,000 decoded bytes but the stream ends before JPEG EOI. Repository history, current trees and superseded fragments contain no valid continuation.

Do not merge, fabricate, patch or silently replace those bytes. Resume from the exact candidate if it can be recovered; otherwise recreate the Dark edit from the locked Bright raster and canonicalise it immediately.
