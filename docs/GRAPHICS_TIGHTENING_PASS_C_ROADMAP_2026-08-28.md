# SplicePit Graphics Tightening Pass C Roadmap — 28 August 2026

## Authority

This document refines **Graphics Tightening Pass C — Cutscene / Horror Contrast** from `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`.

Pass C begins after WP0.7E and is explicitly a quality escalation, not another generic decoration pass. The protagonist sprites remain the visual quality reference.

**Status: COMPLETE — implementation and automated integration gates passed before final merge.**

## Locked quality target

- Major figures and hero props must read as authored pixel art rather than block geometry.
- The Master Lab is the benchmark environment for the opening slice.
- Pixel density, outline discipline, highlights, shadows, material wear and silhouette quality must feel compatible with the approved 64 × 96 protagonists.
- Important cutscene subjects must survive close visual scrutiny at the accepted 1280 × 720 gameplay scale.
- Bright/dark contrast remains authored. Horror is produced by changed objects, residue, containment damage, shadows and staging, not by a colour filter alone.
- Existing traversal geometry, collision and camera scale remain locked unless a genuine bug is found.
- Prefer replacement of weak hero art over endless layering of extra detail onto weak shapes.

## Completed work packages

### GTC-1 — Master Lab benchmark and RinoCow hero art — COMPLETE

- Replaced coarse cutscene hero presentation with authored pixel assets.
- Added protagonist-compatible Viktor artwork.
- Added authored RinoCow living/dead presentation with stronger anatomy, horn silhouette and splice detail.
- Replaced the coarse containment breach with a dedicated shattered-containment plate.
- Integrated restrained Lab lighting, material and depth accents around the hero staging.

Gate result: the disaster no longer relies on prototype-grade hero figures or containment art.

### GTC-2 — Post-disaster environmental aftermath — COMPLETE

- Preserved physical evidence of the disaster in normal post-death Lab exploration.
- Retained broken glass, damaged containment hardware, biological residue, blood, gouges and failed-cleanup evidence.
- Kept obsolete cutscene actors out of normal exploration state.
- Preserved splice-bench readability and post-death interaction.

Gate result: the changed Lab communicates the disaster visually before explanatory text is required.

### GTC-3 — Creditor encounter staging — COMPLETE

- Replaced the coarse creditor representative with an authored protagonist-scale NPC sprite.
- Added clothing, silhouette and carried ledger/debt-prop detail.
- Added route-local composition and grounding around the confrontation.
- The authored Pass C runtime visually supersedes the old primitive creditor canvas.

Gate result: creditor and protagonist now share a compatible visual quality level.

### GTC-4 — Opening-environment benchmark propagation — COMPLETE

The Master Lab benchmark was propagated without changing gameplay geometry or collision topology.

- Yard: stronger workshop/containment focal hierarchy, irregular silhouettes, service hardware, stepped lighting and foreground depth.
- Route: stronger debt-encounter framing, worn infrastructure, local props, dark residue and foreground separation.
- Master Lab: strengthened containment gantry, lighting hierarchy, foreground rails and dark-state physical wrongness.
- Local Pit: stronger arena gantry/lighting, crowd silhouettes, banners, foreground rails and dark organic intrusion.
- Existing Pass B material/detail work remains intact and is wrapped rather than replaced wholesale.
- Bright/dark counterparts continue to alter physical storytelling, not merely colour balance.

Gate result: the opening environments retain their accepted gameplay scale while presenting clearer focal composition and greater authored depth.

### GTC-5 — Pass C integration and sign-off — COMPLETE

- Added a stable gameplay-aware bootstrap so Pass C hero assets load only after the gameplay runtime exists.
- Removed the abandoned procedural Pass C hero prototype from the active codebase.
- Strengthened RinoCow and creditor browser regression coverage to verify authored-asset mode and legacy-layer supersession.
- Desktop and mobile presentation validated.
- Cutscene dialogue/control overlays validated.
- Dark-layer transitions and ambient corruption validated.
- Persistent post-death Lab state validated.
- Debt encounter validated.
- Yard, route, Lab and Local Pit traversal/render integrations validated.
- TypeScript, content validation, RNG validation, unit/domain/save tests and production build validated.
- Full player-facing browser smoke chain validated across the complete opening path.

## Final implementation contract

Pass C uses authored pixel assets for the key cutscene subjects and a dedicated focal-composition/depth layer for the opening environments. Existing Pass B production art is deliberately retained beneath that layer. No traversal geometry or collision topology was changed by the pass.

The final visual hierarchy is:

1. approved protagonist sprites as the character-scale quality reference;
2. authored Pass C Viktor, RinoCow, broken-containment and creditor hero assets;
3. Master Lab as the opening environment benchmark;
4. Yard, route and Local Pit focal composition/depth brought up towards that benchmark while preserving their established material art;
5. persistent physical aftermath and authored dark-state object changes supplying the horror contrast.

**Graphics Tightening Pass C is complete and ready for the project’s normal autonomous merge flow once the final exact-tree CI run is green.**
