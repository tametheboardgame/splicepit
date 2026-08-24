# R0 Graphics-First Work-Package Correction — 24 August 2026

## Authority

This file overrides the affected WP0.4E–H sequencing/presentation wording in `R0_VISUAL_FIRST_REBASE.md` following explicit human rejection of the first visible WP0.4E screen.

It does not alter later mechanics or production scope except where needed to preserve the corrected graphics-first order.

Read together with:

- `docs/ROADMAP.md`;
- `docs/VISUAL_DIRECTION_2026-08-23.md`;
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md`.

## WP0.4E — Identity Foundation / Presentation Rejected

**Technical status:** COMPLETE.

Retain:

- Milo/Theo/Ada/Pip IDs;
- player-name validation;
- `avatarId` + player-name save persistence;
- old-save compatibility;
- keyboard-safe name capture;
- presentation-independent mouse/touch architecture.

**Visual status:** REJECTED.

The dark monospace `APPRENTICE REGISTRATION` screen, character tabs, boxed preview and form composition are superseded. They must not be restored, polished or used as the basis of later UI.

Automated tests may prove technical persistence. They cannot self-approve visual design.

## WP0.4F — Apprentice Splicer Yard Rebuild — READY

**Purpose:** establish the actual game's world language before final interface language is designed.

Build a completely fresh small top-down Apprentice Splicer Yard from the approved concept direction.

Hard rules:

- do not resurrect or reskin the old Lab;
- do not use the rejected WP0.4E interface as a shell around the Yard;
- do not use procedural placeholder scenery that becomes visually dominant;
- do not add splice, battle, economy, quest or broad menu systems;
- put an accepted protagonist visibly into the scene at provisional gameplay scale during the first meaningful review.

Required ingredients remain:

- compact workshop/lab building;
- grass/dirt route structure;
- trees, shrubs, flowers and strange plants;
- water feature and bridge where composition supports it;
- crates, barrels and specimen tables;
- fenced pens/cages;
- creature husbandry/containment detail;
- improvised biotech and questionable experiments;
- warm attractive surface with increasingly concerning biological detail;
- clear walking space.

**Gate:** a screenshot with the real protagonist visibly present reads immediately as a specific SplicePit place derived from the approved concept, not generic RPG scenery and not the old Lab.

## WP0.4G — In-World Scale, Movement, Collision, Depth and Camera Polish — PLANNED

Take the accepted WP0.4D protagonist movement and make it belong in the accepted Yard.

Required:

- lock actual gameplay display scale from real world proportion;
- four-direction movement and idle facing;
- sensible feet origin/hitbox;
- collisions against world geometry;
- foreground/background depth treatment;
- smooth camera follow;
- nearest-neighbour presentation without blur/shimmer;
- keyboard baseline through existing semantic input architecture.

**Gate:** simply moving around the Yard feels pleasant and the protagonist appears to inhabit the space rather than float over it.

## WP0.4E-R — Character-Selection Presentation Redesign — PLANNED REPAIR PACKAGE

**Depends on:** visually accepted WP0.4F and movement/world language from WP0.4G.

**Purpose:** redesign character choice using the game world as the source of interface language.

Technical identity plumbing from WP0.4E is reused. The visible design starts again.

Required outcome:

- choose Milo/Theo/Ada/Pip;
- enter a player name;
- restore saved identity;
- no mechanical differences;
- keyboard works cleanly;
- mouse/touch remains practical;
- presentation feels like part of SplicePit, not a browser registration page;
- no dark-terminal admin screen;
- no giant web cards/panels;
- no boxed character tabs/preview simply because they already exist.

Candidate forms may be spatial, in-world, scene-based or another game-native solution. No candidate is pre-approved.

**Human gate:** the user explicitly approves the character-choice presentation before WP0.4H is allowed to pass.

## WP0.4H — Graphics-First Playable Gate — HUMAN GATE

The final test flow remains:

`Boot → accepted character-choice presentation → Apprentice Splicer Yard`

Human review must approve:

1. protagonist size/readability;
2. character-choice presentation;
3. name entry feel;
4. walking responsiveness;
5. animation personality;
6. camera behaviour;
7. collision/depth feeling;
8. environment richness;
9. fidelity to the approved concept-world direction;
10. biotech wrongness / SplicePit specificity;
11. absence of rejected legacy presentation;
12. desire to keep exploring even before major systems return.

If this gate fails, return to D/F/G/E-R as appropriate. Do not compensate by adding systems.

## Temporary boot harness

A temporary canvas-only protagonist harness is permitted while F/G are being built solely to ensure the rejected page is no longer the default boot and to keep identity persistence testable.

It is non-canon, must stay visually lightweight, and must be replaced by WP0.4E-R before the human gate.
