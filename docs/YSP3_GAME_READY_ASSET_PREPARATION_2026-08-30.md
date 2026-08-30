# YSP-3 — Game-Ready Asset Preparation

Date: 30 August 2026
Status: COMPLETE — approved Bright Yard master recovered and independently validated

## Purpose

Convert the user-approved YSP-2 open-centre Bright Yard master into deterministic production inputs without changing gameplay geometry yet.

## Approved recovered source

The original YSP-3 repository transport was discovered to be truncated when YSP-4 began inspecting the materialised scene for collision authoring. The user then supplied the approved Bright Yard image directly, allowing the intended scene to be recovered rather than regenerated.

Production identity:

- selected direction: **open-centre Yard**
- original selected generation lineage: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`
- recovery source: exact user-supplied approved Bright Yard image
- production canvas: **1280 × 720**
- runtime format: WebP
- exact byte length: **177,808 bytes**
- SHA-256: `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`
- RIFF declared total length: **177,808 bytes**
- VP8 payload end: **177,808 bytes**

## Original integrity failure

PR #73 created the intended scene-pack plumbing, but the stored raster source was incomplete. The failure was detected before YSP-4 collision authoring proceeded:

- original high-quality transport contained 102,975 bytes while its RIFF header declared 214,308 bytes;
- historical q20 transport contained 24,000 bytes while its RIFF header declared 95,908 bytes;
- independent decoders rejected both files;
- the live production Yard was unaffected because YSP-7 has not yet activated the new scene-image renderer.

Draft PR #74 was used to diagnose the issue and was abandoned once the correct recovery path was established.

## Recovery implementation

PR #75 replaces the broken transport with the recovered approved asset and hardens the pipeline so the same class of failure cannot silently pass again.

Implemented:

- deterministic repository transport for the exact recovered WebP;
- segment 06 stored as two smaller exact fragments after the original single-segment transfer proved unreliable;
- deterministic recovery wrapper before normal materialisation;
- exact byte-length and SHA-256 validation;
- RIFF declared-length validation;
- VP8 payload-length validation;
- VP8 key-frame and 1280 × 720 dimension validation;
- independent `dist` verification after the production build;
- exact manifest byte/hash identity;
- aligned 1280 × 720 transparent foreground staging layer for YSP-6;
- Chromium `image.decode()` smoke validation of the emitted WebP;
- complete existing browser regression suite retained.

## Gate result

GitHub Actions run #1119 passed completely.

The verify job proved:

- YSP-3 source reconstruction succeeds at exactly 177,808 bytes;
- reconstructed SHA-256 is exactly `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`;
- source RIFF/VP8 structure is complete;
- TypeScript, content and RNG validation pass;
- unit/domain/save tests pass;
- production build succeeds;
- emitted production pack independently matches the same dimensions, byte length and SHA-256.

The browser job proved:

- Chromium successfully fetches and decodes the recovered Bright Yard at **1280 × 720 / 177,808 bytes**;
- the full existing player-facing smoke suite remains green, including desktop/mobile opening flow, Yard, route, Master Lab, Local Pit, cutscenes and scene-image spike coverage.

## Completion state

YSP-3 is complete again. The approved Bright Yard raster is now a trustworthy source of truth for gameplay authoring.

YSP-4 may proceed by authoring collision and walkable space directly against these recovered scene pixels. Legacy Yard coordinates must not be treated as the geometry source of truth.
