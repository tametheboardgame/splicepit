# SplicePit Planning Index

This directory is the implementation/design source of truth.

## Status language

- **LOCKED** — explicitly agreed.
- **PLANNED** — agreed direction, details still being proved.
- **PROVISIONAL** — concrete proposal for discussion, not canon.
- **OPEN** — explicit decision still required.
- **PROTOTYPE** — implementation used only to prove behaviour.
- **SUPERSEDED** — retained only as history/evidence and must not direct new implementation.

## Authority and conflict rule

Use the control documents together:

- `DECISION_LOG.md` — authoritative product/canon decisions.
- `ROADMAP.md` — authoritative development sequence and current WP status.
- `VISUAL_DIRECTION_2026-08-23.md` — authoritative current player/environment visual contract; it explicitly resolves current prototype visual details that were previously open.
- `work-packages/R0_VISUAL_FIRST_REBASE.md` — authoritative implementation contracts for the active graphics-first R0 sequence.

If an older planning document or prototype conflicts with the newer roadmap/visual lock on **current visual execution**, the 23 August roadmap and visual lock win. Existing code is never authority merely because it exists.

## Core control documents

- `ROADMAP.md` — master execution sequence/index: 80 implementation WPs from R0.2 to R4.
- `VISUAL_DIRECTION_2026-08-23.md` — locked graphics-first art/player/environment direction.
- `DECISION_LOG.md` — locked/open product decisions.
- `MASTER_PLAN.md` — product pillars and development rules.
- `DESIGN_BASELINE.md` — original concept/opening baseline; retained for history and established opening decisions.
- `TEST_STRATEGY.md` — automated/simulation/manual quality philosophy.

## Current visual reference

The sole active visual reference board for the current player/world build is:

- `visual-reference/splicepit-protagonists-biotech-v2.webp`

Previous WP0.4C visual-reference files were removed on 23 August 2026 so future work cannot accidentally treat them as alternatives.

## Current executable priority

**Next WP: `WP0.4D — Runtime Protagonist Sprite Production`.**

The immediate sequence is:

1. WP0.4D — production-ready Milo/Theo/Ada/Pip runtime sprite sheets;
2. WP0.4E — four-character selection + player name + persisted identity;
3. WP0.4F — completely fresh Apprentice Splicer Yard;
4. WP0.4G — movement, animation, collision, depth and camera polish;
5. WP0.4H — **HUMAN PLAYTEST STOP**.

The required playable at WP0.4H is:

`Boot → Character Select → Apprentice Splicer Yard`

Do not add splice/battle/economy/quest systems to compensate for weak movement or visuals.

## Work-package execution contracts

These contain dependencies, purpose, deliverables, scope boundaries and completion gates for each WP.

- `work-packages/R0_FOUNDATIONS.md` — historical/technical contracts through WP0.4B only where later visual-first docs supersede it.
- `work-packages/R0_VISUAL_FIRST_REBASE.md` — current authoritative WP0.4C–WP0.8H contracts.
- `work-packages/R1_ACT1.md` — WP1A–WP1I: complete Act 1 / Alpha 1.
- `work-packages/R2_ACT2.md` — WP2A–WP2H: Act 2 expansion / Alpha 2.
- `work-packages/R3_BETA.md` — WP3A–WP3G: content-complete Beta and feature-freeze gate.
- `work-packages/R4_RELEASE.md` — WP4A–WP4F: release-candidate certification.

A new development chat should currently start with `Start WP0.4D`; the assistant should load the roadmap, visual-direction lock, decision log and active R0 WP contract before implementation.

## Superseded visual path

Do not continue:

- deleted `VisualDirectionScene` prototype;
- legacy player-facing Lab/Splice/Battle presentation as a target design;
- oversized/high-saturation visual treatments;
- old dark-terminal styling;
- giant web-card UI as the dominant visual language;
- old WP0.4D broad Interface Style System before movement proof;
- old combined creature/player pipeline before movement proof;
- old modular character-creation plan before the authored four characters are proven;
- opening/presentation integration before the WP0.4H walking-around gate.

Technical/domain infrastructure can be reused where genuinely independent of those rejected visuals.

## System documents

- `SPLICING_SYSTEM.md` — irreversible cumulative splicing, expression variance, knowledge/testing, mutations.
- `COMBAT_SYSTEM.md` — turn-based capability combat, training, Land/Water/Air pits and danger progression.
- `WORLD_PROGRESSION.md` — hubs, quests, acquisition, debt branch, main creatures versus lab stock.
- `TECHNICAL_ARCHITECTURE.md` — TypeScript/Vite/Phaser, saves, RNG, input, localisation readiness.
- `CONTENT_AND_PRESENTATION.md` — broader visual/tone/audio/dialogue direction and warning boundary; current visual execution is governed by the newer dated visual lock.

## Approved opening content

- `OPENING_CONTENT_PROPOSAL.md` — despite the historical filename, Rabbit/Goat/Pig and the ten opening source packages in this document are now **LOCKED**. Exact implementation numbers/tutorial tuning remain planned.

## Proposals awaiting approval/tuning

- `PIT_UPGRADE_TREE_PROPOSAL.md` — nine upgrade domains are locked; detailed tiers/costs/dependencies remain proposed/tunable.
- `WORLD_MAP_PROPOSAL.md` — provisional full-region layout/hubs/circuits.
- `ACT1_STORY_FRAMEWORK.md` — authorised overall debt-clock Act 1 structure; detailed authored beats/names/values still require production lock.
- `CREDITOR_FACTION_PROPOSAL.md` — proposed creditor faction, **The Clearing House**, and its role in the paid/unpaid debt branches.

The exact point at which each proposal must be approved is recorded as a decision gate in `ROADMAP.md` and the relevant WP contract.

## Canon rule

A proposal does not become canon because it is detailed or already implemented. Promote it to LOCKED only after explicit approval or deliberate acceptance of a prototype.

Likewise, rejected visual code does not regain authority through age, test coverage or sunk cost.