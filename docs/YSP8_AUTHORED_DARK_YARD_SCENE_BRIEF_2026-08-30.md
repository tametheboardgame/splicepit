# YSP-8 — Authored Dark Yard Scene Pack

Date: 30 August 2026
Status: ACTIVE — dark visual source required before runtime integration

## Purpose

Create the dark/corrupted counterpart to the approved 1280 × 720 Bright Apprentice Splicer Yard while preserving the exact scene layout, gameplay geometry, player position, camera, semantic anchors, foreground-depth behaviour and Master Lab tunnel handoff.

This is not a colour-grade pass. The dark Yard must read as the same physical place after something biological and structurally wrong has happened to it.

## Bright source of truth

The controlling reference is the recovered YSP-3 Bright Yard master:

- composition: open-centre Yard;
- production dimensions: 1280 × 720;
- production Bright WebP SHA-256: `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`;
- scene geometry/anchors: `YSP6_YARD_SCENE_PACK`;
- production runtime: YSP-7 scene-image Yard merged to `main`.

The dark master must preserve the Bright source framing pixel-for-pixel at the canvas edge. Major hard geometry must remain in the same place.

## Locked visual intent

The Bright Yard is attractive first and concerning second. The dark version reverses that balance while remaining recognisably the same apprentice facility.

Target read:

- the same crooked workshop, processing court, containment infrastructure, drainage/vegetation and right-side Master Lab tunnel;
- clear physical corruption rather than a global tint;
- readable movement space on mobile;
- unsettling biological wrongness integrated into existing machinery and architecture;
- enough retained local colour/material information that the player immediately understands where they are;
- no generic horror fog, generic red filter, generic abandoned-lab makeover or unrelated replacement scene.

## Required physical transformations

### Workshop / upper-left architectural mass

Keep the footprint, roofline and access geometry unchanged.

Transform through details such as:

- warped or bowed cladding and patched panels;
- biological growth emerging through vents, seams or drain lines;
- one or two failing practical lights rather than uniform darkness;
- specimen residue, stretched membrane, wet cabling or root-like tissue integrated into existing services;
- signs/labels damaged or partially obscured rather than replaced with new architecture.

### Central processing court / service ring

Keep the ring, pit, pipework and traversable court geometry aligned.

Dark-state changes should include a combination of:

- pipework that appears swollen, constricted or partly organic;
- ruptured hosework or leaking dark specimen fluid;
- abnormal fluid/glass content in tanks or vats;
- stains, drag marks or growth following the existing drainage logic;
- bent guards, stressed fasteners or improvised repairs that imply recent physical failure;
- restrained internal glow from biological material where it improves readability.

The central movement area must remain visually navigable.

### Animal handling / containment area

Keep fences, walls and blocked footprints stable.

Physical wrongness may include:

- sagging mesh or distorted containment panels that still occupy the same collision boundary;
- claw/scrape marks and biological residue;
- evidence something pushed against the enclosure from the wrong side;
- dark organic growth using existing fence posts, pipes or drains as structure;
- ambiguous specimen silhouettes only where they do not create false gameplay affordances.

### Drainage / water / vegetation counterweight

The softer area should become biologically implicated rather than merely darker.

Use changes such as:

- oily or translucent contamination following the existing water/runoff shape;
- roots, reeds or flowers bending toward contaminated flow;
- fungal/vascular growth following wet edges;
- small bioluminescent or reflective details for navigation contrast;
- local dieback mixed with unnatural vigorous growth.

Do not move the drainage boundary in a way that implies different collision.

### Master Lab tunnel / right-side exit

The tunnel footprint and visible entrance must remain exactly readable and open.

Dark-state treatment can include:

- failing emergency/service lighting;
- wet cables, condensation or organic tissue following the tunnel frame;
- signs of pressure or damage around the entrance;
- subtle visual pull toward the route rather than blocking or disguising it.

The tunnel must never look sealed, collapsed or non-interactive.

## Lighting and palette

- Preserve the source light direction and three-quarter spatial read.
- Lower ambient warmth selectively rather than crushing the full scene into black.
- Use colder dirty greens, bruised purples, dried biological reds and contaminated amber sparingly.
- Retain enough Bright-state material identity for immediate spatial recognition.
- Use local practical/biological light to support silhouettes and route readability.
- No full-scene monochrome treatment.

## Geometry and gameplay contract

YSP-8 must not change:

- 1280 × 720 world/canvas dimensions;
- lower-centre spawn at the current scene-owned position;
- YSP-4 blocked geometry;
- feet-based hitbox behaviour;
- YSP-5 semantic interaction anchors;
- the Master Lab tunnel exit footprint and target entry;
- YSP-6 depth regions;
- Bag / Map / Action / tutorial semantics;
- save/story contracts.

Any apparent visual deformation must remain compatible with those same blocked/walkable boundaries.

## Foreground / depth requirement

YSP-6 redraws selected foreground regions from the currently decoded Yard base after the protagonist. Therefore the dark runtime must redraw those same regions from the dark base, not from the Bright image.

During a Bright ↔ Dark transition, base and occlusion layers must use the same transition mix so there is no bright halo, colour seam or foreground mismatch around the protagonist.

## Runtime transition contract

The intended production rendering order for the Yard becomes conceptually:

`Bright base → Dark base at darkMix → protagonist → Bright occlusion regions → Dark occlusion regions at darkMix → UI/effects`

Equivalent implementation is acceptable if it produces exact aligned results.

Requirements:

- preload Bright and Dark Yard bases atomically before activating the production Yard;
- preserve player position and camera while darkMix changes;
- never show the legacy procedural Yard during transitions;
- no one-frame alignment jump when darkMix enters or leaves zero;
- corruption overlay effects may still appear above the coherent scene transition, but they do not substitute for the dark authored scene.

## Dark asset acceptance gate

The supplied/generated dark master is acceptable only if all are true:

1. Exact 1280 × 720 dimensions.
2. Camera framing matches the Bright master exactly.
3. Workshop, central ring, containment, drainage and Master Lab tunnel remain spatially aligned.
4. The state is recognisably the same Yard.
5. The state contains obvious physical environmental changes, not only colour/lighting changes.
6. Central movement and tunnel readability remain clear at gameplay scale.
7. No new painted object creates a false apparent wall/opening across locked collision geometry.
8. No protagonist or UI is baked into the scene.
9. Dark-state foreground crops can be taken from the dark base using the existing YSP-6 regions without seam drift.

## Asset transport / repository identity

Once the dark master is accepted, YSP-8 will package it deterministically using the same integrity principles as YSP-3:

- exact byte length;
- SHA-256 identity;
- complete image-structure validation;
- decoded 1280 × 720 dimension validation;
- deterministic repository transport;
- production build verification;
- Chromium decode smoke.

The final runtime asset name should be `yard-dark-base.webp`, with scene-pack metadata versioned for YSP-8.

## Human input boundary

The repository contains the exact approved Bright raster as deterministic encoded source, but the image-editing system requires the Bright image itself to be present as an image in the current conversation before it can create a faithful edited counterpart.

Therefore the only required human handoff for the visual-authoring step is the approved 1280 × 720 Bright Yard image. Once supplied in the current conversation, the dark master can be generated against this locked brief and then integrated without further layout decisions unless the result fails the acceptance gate.
