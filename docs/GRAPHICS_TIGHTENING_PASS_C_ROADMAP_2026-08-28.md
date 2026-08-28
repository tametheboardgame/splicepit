# SplicePit Graphics Tightening Pass C Roadmap — 28 August 2026

## Authority

This document refines **Graphics Tightening Pass C — Cutscene / Horror Contrast** from `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`.

Pass C begins after WP0.7E and is explicitly a quality escalation, not another generic decoration pass. The protagonist sprites remain the visual quality reference.

## Locked quality target

- Major figures and hero props must read as authored pixel art rather than block geometry.
- The Master Lab is the benchmark environment for the opening slice.
- Pixel density, outline discipline, highlights, shadows, material wear and silhouette quality must feel compatible with the approved 64 × 96 protagonists.
- Important cutscene subjects must survive close visual scrutiny at the accepted 1280 × 720 gameplay scale.
- Bright/dark contrast remains authored. Horror is produced by changed objects, residue, containment damage, shadows and staging, not by a colour filter alone.
- Existing traversal geometry, collision and camera scale remain locked unless a genuine bug is found.
- Prefer replacement of weak hero art over endless layering of extra detail onto weak shapes.

## Execution sequence

### GTC-1 — Master Lab benchmark and RinoCow hero art

- replace coarse cutscene figures with authored pixel-sprite treatment;
- improve RinoCow silhouette, anatomy, splice seams, containment hardware, cow/rhino read and animation accents;
- improve Viktor’s cutscene figure to protagonist-compatible detail density;
- replace the simple broken-containment block with shattered glass, bent steel, tubing, fluid and readable depth;
- add restrained Lab lighting/material accents so the scene and characters belong to the same art language.

Gate: a disaster screenshot no longer contains visibly prototype-grade character or containment art.

### GTC-2 — Post-disaster environmental aftermath

- make the Lab retain physical evidence of the event without leaving obsolete cutscene actors permanently painted into normal exploration;
- add authored glass fragments, damaged rails, biological residue, hoof/gouge marks, displaced equipment and cleanup failure;
- keep splice-bench readability and post-death interaction clear.

Gate: returning to the Lab communicates what happened before any text is read.

### GTC-3 — Creditor encounter staging

- replace the route representative’s coarse block figure with a protagonist-compatible authored NPC sprite;
- strengthen silhouette, clothing/material detail and carried debt/ledger props;
- use restrained ground shadow and local staging accents so the encounter feels deliberately composed rather than an overlay pasted onto the route.

Gate: the creditor can share the screen with the protagonist without a visible quality mismatch.

### GTC-4 — Opening-environment benchmark propagation

Use the Lab benchmark to review Yard, route and Local Pit for:

- hero asset quality;
- repeated flat geometry;
- material definition;
- focal-point hierarchy;
- foreground/midground/background depth;
- authored irregularity;
- protagonist/environment integration;
- bright/dark counterpart quality.

Replace genuinely weak hero assets rather than merely adding more clutter.

### GTC-5 — Pass C integration and sign-off

Validate:

- desktop and mobile presentation;
- cutscene dialogue/control overlays;
- dark-layer transitions;
- post-death state;
- debt encounter;
- Lab traversal/collision;
- opening visual integration;
- TypeScript/build/smoke suites.

Pass C is complete only when the inciting-event presentation and its immediate aftermath no longer fall below the approved protagonist quality bar.

## Immediate implementation decision

GTC-1 starts with the largest visible mismatch currently present: the existing RinoCow disaster runtime draws Viktor, RinoCow and containment damage from coarse rectangular primitives. Those legacy figures will be visually superseded by a dedicated authored hero-art layer while preserving the existing cutscene timing, flags, actor coordinates, collision and story logic.
