# YSP-3 — Game-Ready Asset Preparation

Date: 30 August 2026
Status: IMPLEMENTED ON BRANCH, CI GATE PENDING

## Purpose

Convert the user-approved YSP-2 open-centre Bright Yard master into deterministic production inputs without changing gameplay geometry yet.

## Approved source

- selected direction: **open-centre Yard**
- clean generation ID: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`
- selected raw generation: 1536 × 1024
- production crop already encoded on the YSP-3 branch: **1280 × 720 WebP**

The production crop is the high-quality candidate. The earlier q20 experiment has been removed so there is only one authoritative Bright Yard source.

## Production source transport

The WebP is stored as ordered base64 source chunks under `src/assets/ysp3/` because repository text writes are deterministic through the connected GitHub workflow.

The chunks are not loaded by the browser directly.

`scripts/materialize-ysp3-yard.mjs`:

- joins the seven authoritative chunks;
- validates base64 content;
- validates RIFF/WebP identity;
- validates the VP8 key-frame header;
- validates exact 1280 × 720 dimensions;
- writes `/generated/ysp3/yard-bright-base.webp` into the build's public asset tree;
- generates an exactly aligned 1280 × 720 transparent foreground PNG;
- writes a versioned manifest containing SHA-256 identities and rendering requirements.

The script is now part of both `npm run dev` and `npm run build`, so a build cannot silently use an incomplete or malformed Yard source.

## Scene-pack asset contract

`src/environment/yardSceneAssetPack.ts` records:

- pack ID `yard-bright-scene-v1`;
- generation provenance;
- exact source dimensions;
- production asset URLs;
- no-smoothing requirement;
- exact base/foreground alignment requirement;
- atomic preload requirement.

`preloadYsp3BrightYardAssets()` decodes base and foreground together and rejects either image if its decoded dimensions differ from 1280 × 720. This prepares the pack for later runtime activation without allowing a half-loaded Yard.

## Foreground decision

YSP-3 creates the final-size transparent foreground production layer but does **not** move visible pixels out of the approved base yet.

That is deliberate. YSP-4 and YSP-5 will establish the new walkable geometry and interaction anchors against the authored scene. YSP-6 then owns the actual occlusion/depth extraction, allowing foreground choices to be made against proven player routes rather than guessing before traversal is authored.

Until YSP-6, base + transparent foreground reproduces the approved production crop exactly and cannot introduce edge duplication or layer drift.

## Rendering rules locked by YSP-3

- production canvas is 1280 × 720;
- browser canvas smoothing remains disabled for the scene image;
- base and foreground must decode completely before activation;
- base and foreground must always share identical dimensions;
- the old Pass D Yard remains the normal production renderer until YSP-7;
- YSP-3 does not change spawn, collision, exits, camera bounds or interaction coordinates.

## Removed ambiguity

The discarded q20 compression candidate has been deleted. Future packages must use the seven-part high-quality Bright Yard source only.

## Gate

YSP-3 is complete when CI confirms:

- TypeScript still passes;
- the materialiser accepts the source and confirms 1280 × 720;
- the production build successfully emits the Yard assets;
- existing tests and browser smoke remain green.

After that gate, the next package is **YSP-4 — Re-author Walkable Space / Collision to the Scene**.
