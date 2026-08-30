# YSP-3 — Game-Ready Asset Preparation

Date: 30 August 2026
Status: REOPENED / BLOCKED — incomplete Bright Yard raster discovered during YSP-4 start

## Purpose

Convert the user-approved YSP-2 open-centre Bright Yard master into deterministic production inputs without changing gameplay geometry yet.

## Approved source

- selected direction: **open-centre Yard**
- clean generation ID: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`
- selected raw generation: 1536 × 1024
- intended production crop: **1280 × 720 WebP**

## What PR #73 implemented

PR #73 added the intended scene-pack plumbing:

- deterministic base64-chunk materialisation;
- 1280 × 720 production metadata;
- aligned transparent foreground staging layer;
- scene manifest and asset hashes;
- atomic base/foreground preload contract;
- build and CI integration;
- independent emitted-pack checks.

The old Pass D Yard remains the normal production renderer until YSP-7, so this integrity failure does not currently replace the live Yard with a broken image.

## Integrity failure discovered at YSP-4 start

YSP-4 began by exporting the materialised Bright Yard from CI as a workflow artifact so collision could be authored against the actual scene pixels rather than legacy coordinates.

Independent inspection found that the committed high-quality source is truncated:

- RIFF header declares total WebP length: **214,308 bytes**;
- committed source reconstructs to: **102,975 bytes**;
- independent WebP decoders reject the payload;
- therefore the file cannot be used as a visual or runtime source of truth.

The preserved historical q20 candidate was also reconstructed and checked:

- RIFF header declares total WebP length: **95,908 bytes**;
- historical source reconstructs to: **24,000 bytes**;
- it is also truncated and unusable.

There is no complete Bright Yard raster preserved in Git history.

## Why the original gate missed this

The original YSP-3 validator checked:

- RIFF/WebP signature;
- VP8 key-frame marker;
- encoded width and height;
- deterministic hashes;
- emitted file/hash consistency.

Those checks proved that the same bytes flowed through the build, but did not prove that the RIFF/VP8 payload was complete. Because width/height live near the beginning of a VP8 frame, the truncated file could still report 1280 × 720 and produce stable hashes.

The player-facing browser smoke also did not exercise the YSP-3 image in the production Yard path because YSP-7 has not activated that renderer yet.

## Corrective validation

Draft PR #74 adds strict source-integrity checks before YSP-4 can proceed:

- the RIFF-declared total length must exactly equal the actual buffer length;
- the VP8 chunk length must exactly terminate at the end of the file;
- truncated scene sources fail `validate:ysp3` immediately.

The new check correctly fails the current source with:

`YSP-3 Yard base is truncated or malformed: RIFF declares 214308 bytes but source contains 102975`

This guard must remain when the complete raster is restored or replaced.

## Current gate state

YSP-3 is **not complete** until a complete approved Bright Yard raster is available and passes:

- full RIFF/VP8 payload integrity;
- successful independent image decode;
- exact 1280 × 720 production dimensions;
- deterministic source and emitted-pack hashes;
- production build;
- player-facing browser regression;
- by-eye confirmation that the restored/replacement image is the intended approved Yard.

YSP-4 collision authoring is deliberately blocked until that happens. Collision will not be guessed from the written brief or copied from the legacy Yard.
