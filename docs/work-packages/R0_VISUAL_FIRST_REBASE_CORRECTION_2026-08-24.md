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

## WP0.4F — Apprentice Splicer Yard Rebuild — COMPLETE / HUMAN ACCEPTED 24 AUGUST 2026

**Purpose:** establish the actual game's world language before final interface language is designed.

The completely fresh top-down Apprentice Splicer Yard direction was implemented and human-reviewed on 24 August 2026.

Human review result:

- the **visual direction is approved**;
- the Yard reads as the right SplicePit world language and should be built forward rather than discarded;
- the first static 960 × 540 framing was too close / too large on screen;
- the preferred correction is to show **substantially more world at once**, making the protagonist and existing scenery feel smaller in the viewport, rather than merely sharpening the same close composition;
- the inability to move in the WP0.4F preview was expected to be fixed immediately in WP0.4G.

The accepted WP0.4F foundation was merged in PR #26. Do not use the scale criticism as justification to revert to the old Lab or abandon the accepted Yard art direction.

Hard rules remain:

- do not resurrect or reskin the old Lab;
- do not use the rejected WP0.4E interface as a shell around the Yard;
- do not add splice, battle, economy, quest or broad menu systems before the graphics-first gate;
- preserve the warm, attractive, cute-but-concerning biotech language established by the accepted Yard.

## WP0.4G — In-World Scale, Movement, Collision, Depth and Camera Polish — COMPLETE / HUMAN ACCEPTED 24 AUGUST 2026

WP0.4G was implemented in PR #27, technically validated, human-reviewed and merged on 24 August 2026.

Accepted baseline:

- **1280 × 720 Yard viewport**;
- **1760 × 1080 world** around the accepted core Yard composition;
- accepted 64 × 96 protagonist rendered at **1× source scale** in-world;
- held-key four-direction movement using the existing semantic action bindings;
- feet-based collision against buildings, props, pens/cages, water, trees and world bounds;
- axis-separated collision so sliding along obstacles remains possible;
- smooth camera follow with integer-rounded render coordinates;
- basic depth sorting through tree canopies;
- expanded quarantine, nursery, stream/bridge and vegetation areas around the original Yard core.

Human review described the result as effectively the right direction and specifically approved the wider scale/movement feel. **Do not re-enlarge the protagonist or return to the close WP0.4F framing.**

The user also noted that the graphics can become higher quality. Treat this as **future production/polish work rather than a rejection of the current scale, composition or visual language**. Improve tiles, props, environment art and detail fidelity later without changing the accepted world proportions merely to make the art sharper.

## WP0.4E-R — Character-Selection Presentation Redesign — READY

**Depends on:** visually accepted WP0.4F and WP0.4G — now satisfied.

**Purpose:** redesign character choice using the accepted game world as the source of interface language.

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

The temporary canvas-only protagonist harness has completed its purpose. WP0.4E-R must replace it before WP0.4H.
