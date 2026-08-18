# WP0.4C — Visual Direction Pivot and Presentation Pass

## Status

IMPLEMENTED CANDIDATE — human visual acceptance pending.

## Why this WP exists

The WP0.4B browser playtest exposed a presentation failure before the combat cadence could be judged fairly:

- the bottom combat controls sat partly outside the playable canvas and were not reliably clickable;
- the browser shell and scene UI made the game feel as though everything happened inside a dark rectangular terminal;
- the existing muted brown/black prototype styling did not match the intended personality of SplicePit.

The visual direction supplied during playtest is now the prototype target: **bright, colourful, cartoon/pastoral readability on the surface, with visibly grotesque, irresponsible biotech underneath it.**

This is deliberately a prototype presentation pass, not the final production art pipeline owned by WP0.6A–E.

## Locked prototype direction

The prototype should read as:

- colourful and immediately legible rather than muddy or grim;
- playful, rounded and cartoon-like rather than terminal-like;
- pastoral/farm-sim adjacent in environmental colour and friendliness;
- medically questionable in the lab machinery and creature mutations;
- funny and unsettling at the same time;
- happy flowers, grass and sky sitting next to wrong limbs, specimen tubes, grafts and illegal Fit Pit activity.

The target is not gore-first horror. The contrast is the point: the world can look cheerful while the biology is clearly not all right.

## Implementation decisions

### Browser shell

The page outside the Phaser canvas is now part of the presentation instead of a black frame around it:

- sky/grass background;
- sticker-like header labels;
- chunky outlined SplicePit wordmark treatment;
- rounded, thick-bordered game frame;
- control hints rendered as small cream badges.

### Shared UI

Prototype panels/buttons now use:

- warm cream surfaces;
- dark plum outlines;
- offset cartoon shadows;
- rounded sticker/card geometry;
- bright accent fills on focus;
- sans-serif typography rather than a terminal/serif-heavy presentation.

### Existing scene bridge

Several older prototype scenes still contain near-black colours inline. WP0.4C adds a deliberately narrow Phaser Graphics colour remap for those known prototype neutrals so the lab/world/battle surfaces participate in the new direction without rewriting large scene files that WP0.6 will replace later.

This bridge is temporary and must not become the production asset strategy.

### Title screen

The title now reads as an actual place rather than a menu inside a box:

- blue sky, rolling grass, flowers and farm fencing;
- oversized cartoon wordmark;
- a visibly mutated meadow creature with an attached specimen tube and extra limb;
- menu actions placed on the scene rather than inside a dark menu plate.

### Combat cadence playtest

The combat playtest now uses the whole 960×540 scene:

- field/pit environment instead of three large dark panels;
- cartoon creature stand-ins in the arena;
- status/log information as floating light labels;
- actions arranged in an adaptive 3/4-column grid at the bottom;
- Reset and Back controls moved to the top-right, fully inside the canvas.

The layout supports up to twelve visible action choices in three rows without clipping at the current prototype resolution.

## Acceptance gate

WP0.4C passes when a human playtest confirms all of the following:

1. every combat control is fully visible and clickable at the supported desktop playtest size;
2. the game no longer feels dominated by a dark rectangle/terminal presentation;
3. title, lab/world, splice and combat visibly belong to the same bright cartoon prototype direction;
4. the contrast between cheerful pastoral colour and grotesque biotech reads as intentional SplicePit personality;
5. existing gameplay remains usable and CI/browser smoke remains green.

## Deferred to R0.6

WP0.4C does not lock final production art metrics or authored assets. R0.6 still owns:

- final tile/sprite/camera scale;
- authored environment and character asset pipeline;
- final phenotype renderer quality;
- production UI system and localisation-safe layout;
- final lab/combat information architecture;
- accessibility and presentation performance certification.
