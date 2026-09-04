# RSP-7 — Authored Dark Route + Production Replacement

Date: 2 September 2026

Last updated: 4 September 2026

Status: COMPLETE ✓

PR: #92

## Purpose

Complete the Opening Route scene-image propagation by adding an authored Dark counterpart to the approved Bright Route and replacing the live procedural Route with the RSP-4/RSP-5/RSP-6 scene-owned world.

RSP-7 activates the authored Route only when Bright and Dark dependencies decode atomically and the semantic Lab/Pit bridge is ready. No Bright-only or partially integrated production cutover is permitted.

## Locked production assets

### Bright Route

- format: JPEG;
- dimensions: `1024 × 683`;
- bytes: `120,561`;
- SHA-256: `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- world mapping: integer `3×` to `3072 × 2049`.

### Dark Route

The authoritative Dark Route source was recovered on 4 September 2026 and matched back to the previously stored 93,000-byte production prefix. The complete deterministic production identity is now repository-owned:

- format: JPEG;
- dimensions: `1024 × 683`;
- bytes: `138,388`;
- Base64 characters: `184,520`;
- SHA-256: `5bff87c2bfe36bfb60bf6562afd8f66bfd3405a8ce85a6ef87bf92ba54d85be6`.

Commit `a21466ff21997c4f267306c278dc90f9575fa5f7` is the recoverability safety boundary that permanently stores the previously missing continuation in Git. The Dark source is no longer dependent on a chat/session or external local copy.

## Dark Route art contract

The accepted Dark Route is an exact-composition counterpart of the locked Bright scene rather than a new map or generic tint. It preserves the gameplay-critical geometry used by RSP-4 through RSP-6:

- road centre-lines, widths and junctions;
- Viktor Lab footprint and entrance;
- decommissioned biosecurity weighbridge deck, booth and rails;
- Yard-side and Local-Pit-side route openings;
- cliffs, fences, structures and collision-readable masses;
- traversal and foreground-occlusion alignment.

The Dark state adds localised contaminated runoff, diseased verge material, biological intrusion, damaged infrastructure and Pit-bound residue without changing traversal geometry.

## Completed engineering

### Deterministic asset integrity

RSP-7 tooling now:

- reconstructs the canonical Dark transport deterministically;
- rejects malformed Base64 and incomplete JPEG streams;
- validates JPEG SOI, EOI and SOF structure;
- locks `1024 × 683` decode dimensions;
- rejects accidental Bright-as-Dark input;
- locks exact bytes and SHA-256;
- materialises `public/generated/rsp7/route-dark-base.jpg` and its manifest;
- verifies emitted `dist` identity;
- independently decodes the emitted JPEG in Chromium.

These checks run through the normal verification/build/browser gates.

### Atomic Bright + Dark lifecycle

`src/environment/routeSceneAssetPack.ts` and `src/environment/routeSceneImageRuntime.ts`:

- preload Bright and Dark as one production dependency;
- expose independent lifecycle readiness;
- refuse `productionCutoverReady` when either image is missing or invalid;
- render the approved Bright raster into the `3072 × 2049` world;
- cross-fade the exact-aligned Dark base through the existing Route `darkMix` contract;
- expose deterministic renderer/debug state for regression coverage.

### Foreground depth parity

`src/environment/routeDepthGroundingRuntime.ts`:

- preserves the four RSP-6 exact-base foreground occluders;
- redraws matching Bright/Dark crops using the same `darkMix` as the base scene;
- retains the RSP-6 feet contact shadow;
- prevents Bright seams around the protagonist during corruption transitions.

### Production cutover and semantic interiors

`src/world/routeProductionCutover.ts`, `src/world/routeRuntimeBridge.ts`, `src/environment/routeInteriorBridgeRuntime.ts` and `src/productionYardRuntime.ts` now provide:

- authored Yard → Route entry;
- authored `3072 × 2049` Route world/camera/collision ownership;
- semantic Yard return;
- semantic Master Lab entry and safe return;
- semantic Local Pit entry and safe return;
- no raw interior-return coordinates carried by bridge events;
- exact authored safe-return ownership through Route anchors;
- procedural Route retained only as atomic fallback when scene-image dependencies cannot become ready.

### Debt encounter production placement

The creditor encounter now resolves to the authored decommissioned biosecurity weighbridge rather than the retired Old Toll/procedural coordinate path.

Browser integration verifies the authored world anchor at approximately `(1953, 1272)` while keeping the encounter correctly locked/hidden before story eligibility. Dedicated debt smokes continue to own arming, confrontation, flags, control lock and completion behaviour.

### Environment and corruption ownership

RSP-7 exposed an obsolete environment-location assumption: ambient corruption still classified Yard versus Route using the retired `playerX >= 1720` world split.

`src/environment/environmentVisualRuntime.ts` now prefers production semantic `sceneMode`:

- `sceneMode === 'yard'` → Yard;
- `sceneMode === 'master-lab-route'` → Route;
- Master Lab and Local Pit overlays retain precedence;
- the old X split remains only as compatibility fallback for legacy runtimes that do not expose scene mode.

This keeps ambient corruption, authored Dark rendering and global environment debug state aligned with the actual production scene.

## Regression evidence

The final engineering head `c4fa360e68df0114a2cc6170e5212f65e566bcc2` passed GitHub Actions run #1336 before documentation closure:

- TypeScript/typecheck: pass;
- content/RNG validation: pass;
- YSP-3 Bright Yard validation: pass;
- RSP-3 Bright Route validation: pass;
- RSP-7 Dark Route validation/tooling: pass;
- unit/domain/save suite: pass;
- production build and exact dist identity checks: pass;
- full player-facing browser smoke suite: pass.

The browser suite includes:

- exact Bright/Dark asset decode;
- authored Yard → Route handoff;
- Bright/Dark Route transition without player displacement;
- Master Lab entry and safe return `(1725, 825)`;
- authored creditor weighbridge placement;
- Local Pit entry and safe return `(2247, 1824)`;
- mobile onboarding and authored Route traversal;
- ambient corruption across Yard, authored Route, Master Lab and Local Pit;
- cutscene cleanup/control release;
- RinoCow disaster desktop/mobile;
- persistent post-death Lab state;
- creditor encounter desktop/mobile;
- final opening visual integration across all four locations;
- existing Yard scene-image regression coverage.

## RSP-7 merge gate

All engineering conditions are satisfied:

- complete repository-owned Dark Route bytes ✓
- exact Dark JPEG/hash/dimension validation ✓
- atomic Bright + Dark preload ✓
- authored production cutover readiness ✓
- semantic Master Lab and Local Pit bridge ✓
- authored creditor placement without normal-production procedural coordinates ✓
- desktop/mobile Route browser coverage ✓
- ambient/environment ownership migrated to semantic Route state ✓
- full verify/build/browser workflow green ✓

The documentation-only closure commit must receive the same final CI result before PR #92 is marked ready and merged.

## Next work

RSP-8 — Route Mobile / Regression / Visual Acceptance.

RSP-8 is the human-facing acceptance pass. It should review the authored Bright/Dark Route in production at representative desktop/mobile sizes, verify navigation/readability and visual continuity with the approved Yard/Master Lab, and record any visual-only revisions without reopening RSP-7's locked asset/integration architecture unless a genuine defect is found.
