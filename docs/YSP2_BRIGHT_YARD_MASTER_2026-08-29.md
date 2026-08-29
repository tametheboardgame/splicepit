# YSP-2 — Bright Yard Master Scene

Status: **COMPLETE — MASTER SELECTED**

Date: 29 August 2026

Authority: `docs/YSP1_HOLISTIC_YARD_ART_BRIEF_2026-08-29.md` and `docs/YARD_SCENE_IMAGE_POC_ROADMAP_2026-08-29.md`.

## Objective

Generate and select the single bright Apprentice Splicer Yard master image that becomes the visual source of truth for YSP-3 onward.

The selected scene must read as one authored place first and a navigable game map second.

## Locked visual contract

- warm pastoral apprentice-biotech yard, attractive first and concerning second;
- high three-quarter / top-down pixel-art environment compatible with the approved protagonist sprites;
- diagonal lower-left/lower-centre arrival to upper-right/right Master Lab service-route flow;
- crooked apprentice workshop / splice shed as the primary architectural mass, left of centre in the upper half;
- physically connected central specimen-processing court with vat/tank, gantry/pipework, workbench, hoses and drainage logic;
- irregular animal-handling / quarantine run to the right;
- drainage/runoff garden or shallow water feature as a softer lower-right counterweight;
- approximately 60–65% visually open/traversable ground and 35–40% structures, vegetation, water and hard clutter;
- meaningful wear, repairs, animal traces, specimen handling and improvised biological infrastructure rather than anonymous clutter;
- enough foreground-depth opportunities for later YSP-3/YSP-6 separation without blocking core routes;
- no protagonist or UI baked into the master.

## Automatic rejection criteria

Reject any generated scene that reads as:

- a rectangular board or tiled lawn;
- centred/symmetrical level design;
- disconnected prop islands;
- generic cosy farm scenery with biotech pasted on afterwards;
- generic sterile sci-fi laboratory architecture;
- a narrow corridor with insufficient touch-friendly movement space;
- strong perspective incompatible with four-direction top-down traversal;
- indiscriminate micro-clutter that destroys mobile readability.

## Selection order

1. Holistic place-read.
2. Compatibility with Milo / Theo / Ada / Pip at gameplay scale.
3. Readable generous movement space.
4. Strong hierarchy around workshop and central biotech activity.
5. Intrinsic SplicePit specificity.
6. Finish compatible with the Master Lab benchmark.
7. Mobile silhouette/readability.
8. Foreground separation potential.
9. Dark-state corruption potential.

A visibly stronger composition wins over one that would be easier to integrate technically.

## Generation and selection result

A small concept pass was generated and the user approved the **open-centre composition** as the direction to carry forward.

The concept presentation was then regenerated as a clean scene with:

- no presentation frame or thumbnail strip;
- no protagonist or NPC baked into the environment;
- a broad central dirt/grass court with strong movement readability;
- the largest architectural mass on the upper-left side;
- a smaller workshop/service building near upper-centre;
- a large contained biotech/pit structure on the right as the secondary mass;
- specimen tanks, pipes, service clutter and containment language integrated into the same physical yard;
- vegetation, puddles, flowers and weathering softening the industrial construction;
- strong foreground-depth candidates around fences, tank infrastructure, the pit rail and right-side service structures.

The selected image intentionally follows the approved generated direction rather than attempting to force every YSP-1 suggested prop literally into the frame. User approval of the generated composition is the controlling art-direction decision where it differs from the initial written brief.

## Canonical master identity

Clean selected generation:

- image generation ID: `4e7d4d4d-fabd-4839-b155-15ca1b4053fe`;
- source dimensions: `1536 × 1024`;
- source format: generated RGB PNG;
- no baked player characters;
- selected composition: **open-centre Yard**.

A production-oriented 1280 × 720 crop/export was also prepared for YSP-3 evaluation:

- format: WebP;
- quality: 90;
- dimensions: `1280 × 720`;
- SHA-256: `76087e56f15bdfd5358575cbb164317332fc3c24aa80ab1307376721fed0febc`.

The 1280 × 720 export is an asset-preparation candidate, not a replacement for the clean source generation. YSP-3 owns final crop, repair, foreground separation, deterministic repository packaging and preload integration.

## By-eye gate result

**PASS.**

The selected scene is substantially more holistic than the Pass D Yard. It reads as one finished location rather than a set of procedural scenery pieces placed on a board. The large open court gives the protagonist room to move, the structures establish clear visual hierarchy, and the biotech/industrial details are physically integrated with the environment.

Known YSP-3 repair items:

- treat all generated signage as decorative until explicitly accepted or repainted;
- remove or repaint any wording that becomes distracting at gameplay scale;
- decide the exact crop/world dimensions without cutting critical route or occlusion geometry;
- isolate only the foreground elements that materially improve character grounding;
- preserve the selected composition rather than redrawing it to legacy Yard coordinates.

## Completion gate

**YSP-2 COMPLETE.**

The Bright Yard master is selected and approved for production preparation. Gameplay geometry remains deliberately untouched until the scene is prepared in YSP-3 and collision is re-authored in YSP-4.
