# SplicePit Planning Index

This directory is the implementation/design source of truth.

## Status language

- **LOCKED** — explicitly agreed.
- **ACCEPTED** — explicitly approved through human visual/gameplay review.
- **PLANNED** — agreed direction, details still being proved.
- **PROVISIONAL** — concrete proposal for discussion, not canon.
- **OPEN** — explicit decision still required.
- **PROTOTYPE** — implementation used only to prove behaviour.
- **SUPERSEDED** — retained only as history/evidence and must not direct new implementation.

## Authority and conflict rule

Use the control documents together:

- `DECISION_LOG.md` — authoritative product/canon decisions.
- `OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` — **current authoritative execution override from the accepted graphics-first foundation through the first local Pit fight**.
- `ROADMAP.md` — long-range master roadmap. Its older R0.4I/J through R0.8 sequencing is superseded where the 25 August opening-slice roadmap conflicts.
- `VISUAL_DIRECTION_2026-08-23.md` — authoritative player/environment visual contract.
- `VISUAL_RESET_CORRECTION_2026-08-24.md` — explicit rejection of the first visible WP0.4E screen.
- `work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md` — graphics-first correction history and accepted R0.4 foundation.

Newer explicitly dated human-review records override older prototype execution assumptions. Existing code is never authority merely because it exists.

## Core control documents

- `OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` — current detailed execution route from title screen through the first Pit fight, including six graphics-tightening passes.
- `ROADMAP.md` — long-range execution sequence beyond the opening-slice override.
- `VISUAL_DIRECTION_2026-08-23.md` — locked graphics-first art/player/environment direction.
- `VISUAL_RESET_CORRECTION_2026-08-24.md` — old visible character-registration rejection and retained technical foundation.
- `DECISION_LOG.md` — locked/open product decisions.
- `MASTER_PLAN.md` — product pillars and development rules.
- `DESIGN_BASELINE.md` — original concept/opening baseline; retained for history and established opening decisions.
- `TEST_STRATEGY.md` — automated/simulation/manual quality philosophy.

## Current visual reference

The active protagonist reference remains:

- `visual-reference/splicepit-protagonists-biotech-v2.webp`

The accepted world direction is the Apprentice Splicer Yard established through WP0.4F/G.

The environment art is now treated as an **accepted composition/scale/style foundation but not final fidelity**. Future graphics passes must make the world more detailed and authored while preserving the approved 1280 × 720 view, 1× protagonist scale, movement readability and broad world density.

Target: detailed premium pixel art with GBA-era readability, not crude 8-bit blockout art.

## Graphics-first foundation status

Accepted through human review:

1. WP0.4C — visual direction / protagonists;
2. WP0.4D — runtime protagonist sprites;
3. WP0.4F — Apprentice Splicer Yard direction;
4. WP0.4G — wider in-world scale, movement, collision and camera;
5. WP0.4E-R — in-world character selection.

The missing production-style Continue/reload experience is not a blocker. Full New Game / Continue / checkpoint persistence is scheduled in R0.10 of the opening-slice roadmap.

The project is now authorised to build the actual opening game flow rather than remain in isolated walking-prototype work.

## Current executable priority

**Next WP: `WP0.5A — Splash / Title Corruption System`.**

The immediate opening-slice sequence is:

1. **R0.5 — Front Door, Tone and New Game Flow**
   - splash/title bright-to-dark corruption language;
   - main menu;
   - satirical opening narration;
   - accepted character select integrated into New Game;
   - Graphics Tightening Pass A.
2. **R0.6 — Onboarding and Opening World Route**
   - controls/help;
   - Bag/Map/objective shells;
   - Master objective;
   - Yard → Lab → Pit route;
   - Lab and local Pit foundations;
   - Graphics Tightening Pass B.
3. **R0.7 — Disaster, Cutscenes and Debt**
   - cutscene runtime;
   - Master killed by RinoCow;
   - reusable dark-layer flicker;
   - post-death Lab state;
   - creditor/debt encounter;
   - Graphics Tightening Pass C.
4. **R0.8 — First Real Splice Loop**
   - opening splice-mechanic design lock;
   - new bench interaction;
   - Rabbit/Goat/Pig tutorial content;
   - first viable creature;
   - Graphics Tightening Pass D.
5. **R0.9 — First Local Pit Fight**
   - opening battle design lock;
   - first battle runtime/tutorial/opponent;
   - win/loss resolution;
   - next debt/progression hook;
   - Graphics Tightening Pass E.
6. **R0.10 — Save/Continue and Vertical-Slice Hardening**
   - real New Game / Continue / checkpoints;
   - settings completion;
   - full opening integration;
   - Graphics Tightening Pass F;
   - QA and final human gate.

The target end-to-end playable is:

`Title → New Game → narration → character → onboarding → Master → RinoCow death → first splice → debt confrontation → local Pit → first fight → result → continue/reload`

## Locked opening tone/story direction

The surface is bright, colourful and inviting, with a darker reality trying to break through.

Locked opening beats:

- title/splash periodically flickers into the darker concept-art identity;
- New Game parodies the optimistic monster-RPG introduction without directly copying another game's protected text or characters;
- player chooses Milo/Theo/Ada/Pip;
- basic controls, Bag, Map and objective language are introduced;
- player is told their Master is about to undertake the splice fight of his life because of serious debt;
- Master's own spliced **RinoCow** mauls him to death;
- the dark visual layer ruptures through during/around the event;
- debt collectors make clear the Master's obligation survives him and is now the player's problem;
- player learns the first real splice bench and creates a viable creature;
- player takes that creature to the local Pit for the first battle tutorial.

Exact authored wording, names and tuning can still be refined unless separately locked.

## Work-package execution contracts

Historical/current supporting contracts:

- `work-packages/R0_FOUNDATIONS.md` — technical contracts through WP0.4B where not superseded.
- `work-packages/R0_VISUAL_FIRST_REBASE.md` — original graphics-first R0 contracts; superseded where dated corrections conflict.
- `work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md` — corrected graphics-first execution history.
- `work-packages/R1_ACT1.md` — later complete Act 1 / Alpha 1.
- `work-packages/R2_ACT2.md` — Act 2 expansion / Alpha 2.
- `work-packages/R3_BETA.md` — content-complete Beta.
- `work-packages/R4_RELEASE.md` — release-candidate certification.

A new development chat should currently start with `Start WP0.5A` and read `OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` before relying on the older broad R0.5–R0.8 plan.

## Superseded visual path

Do not continue:

- deleted `VisualDirectionScene` prototype;
- legacy player-facing Lab/Splice/Battle presentation as target design;
- oversized/high-saturation visual treatments;
- old dark-terminal styling;
- giant web-card UI as the dominant visual language;
- old `APPRENTICE REGISTRATION` character selector;
- broad modular character customisation before gameplay needs it;
- assumption that environment art should remain at current blockout fidelity because the scale was approved.

Technical/domain infrastructure can be reused where genuinely independent of rejected presentation.

## System documents

- `SPLICING_SYSTEM.md` — irreversible cumulative splicing, expression variance, knowledge/testing, mutations.
- `COMBAT_SYSTEM.md` — capability-based combat foundations and later danger progression; current player-facing battle UX must be redesigned for the opening.
- `WORLD_PROGRESSION.md` — hubs, quests, acquisition, debt branch, main creatures versus lab stock.
- `TECHNICAL_ARCHITECTURE.md` — TypeScript/Vite/Phaser, saves, RNG, input, localisation readiness.
- `CONTENT_AND_PRESENTATION.md` — broader tone/audio/dialogue direction.

## Approved opening biological content

- `OPENING_CONTENT_PROPOSAL.md` — Rabbit/Goat/Pig and the ten opening source packages are **LOCKED**. Exact tutorial implementation and balancing remain tunable.

## Later proposals awaiting approval/tuning

- `PIT_UPGRADE_TREE_PROPOSAL.md` — nine upgrade domains locked; detailed tiers/costs/dependencies tunable.
- `WORLD_MAP_PROPOSAL.md` — provisional full-region layout/hubs/circuits.
- `ACT1_STORY_FRAMEWORK.md` — authorised wider debt-clock Act 1 structure.
- `CREDITOR_FACTION_PROPOSAL.md` — proposed creditor faction, The Clearing House; the opening requires a creditor encounter but this roadmap does not independently lock the faction name unless another authority already does.

## Canon rule

A proposal does not become canon because it is detailed or already implemented. Promote it to LOCKED only after explicit approval or deliberate acceptance of a prototype.

Likewise, rejected visual code does not regain authority through age, test coverage or sunk cost.
