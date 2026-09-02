# RSP-3 — Game-Ready Route Asset Preparation

Status: **COMPLETE**

Date: 2 September 2026

Authority: `docs/work-packages/RSP-0_OPENING_ROUTE_SCENE_CONTRACT.md`, `docs/RSP1_HOLISTIC_OPENING_ROUTE_ART_BRIEF_2026-09-02.md`, `docs/RSP2_BRIGHT_OPENING_ROUTE_MASTER_2026-09-02.md`, and the approved Yard scene-image production architecture.

## Objective

Turn the selected RSP-2 Bright Opening Route master into deterministic repository-owned production assets without re-authoring route gameplay geometry ahead of RSP-4.

## Locked selected source

- generation ID: `36419539-1a20-4646-b1be-d92b04955e40`;
- selected direction: holistic hooked semi-rural biotech Bright route;
- selected source composition remains authoritative;
- no crop or redraw was introduced to preserve legacy `opening-world-v1` coordinates.

## Production raster

The production derivative is locked as:

- format: JPEG;
- dimensions: `1024 × 683`;
- byte length: `120,561`;
- SHA-256: `b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c`;
- materialised path: `/generated/rsp3/route-bright-base.jpg`.

The exact encoded source is repository-owned as 22 canonical Base64 fragments under `src/assets/rsp3/`. The materialiser reconstructs the raster and rejects any byte-length, SHA-256 or JPEG-dimension mismatch.

## World mapping

The raster is not cropped down to the old route world. Instead RSP-3 defines a stable integer production mapping:

- source-pixel scale: `3×`;
- world footprint: `3072 × 2049`;
- reference camera: `1280 × 720`;
- intended traversal read: at least three distinct camera-scale beats;
- image smoothing: disabled.

This preserves the entire selected scene while giving RSP-4 sufficient physical room to author mobile-safe walkability and collision directly against visible features. One source pixel always maps to exactly three world pixels.

## Foreground staging

RSP-3 also materialises an exact `1024 × 683` transparent foreground PNG aligned to the base raster.

This is intentionally empty. RSP-6 owns meaningful foreground/occlusion authoring; RSP-3 only establishes deterministic layer alignment and asset identity.

## Deterministic validation

The production path now validates:

- all 22 source fragments reconstruct valid Base64;
- reconstructed byte length is exactly `120,561`;
- reconstructed SHA-256 exactly matches the locked production raster;
- JPEG decode metadata is exactly `1024 × 683`;
- the generated foreground layer is dimensionally aligned;
- the generated manifest carries the selected generation identity and `3072 × 2049` world mapping;
- production build output preserves the same bytes, dimensions and manifest values;
- headless-browser smoke decodes the built JPEG and confirms natural dimensions and byte length.

## Scope boundary

RSP-3 does **not** move or rewrite:

- walkability;
- collision;
- Yard/Lab/Pit exits;
- Viktor interaction staging;
- debt-encounter staging anchors;
- story triggers;
- save/checkpoint semantics.

Those systems remain on their existing runtime path until RSP-4 and later integration packages re-author them against the approved raster.

## Completion gate

**PASS.**

The selected Bright Opening Route now has a deterministic, repository-owned, decode-validated production asset contract. RSP-4 may author route walkability, collision and exits directly against this raster and its integer world mapping.
