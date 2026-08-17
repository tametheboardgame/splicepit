# SplicePit Planning Index

This directory is the implementation/design source of truth.

## Status language

- **LOCKED** — explicitly agreed.
- **PLANNED** — agreed direction, details still being proved.
- **PROVISIONAL** — concrete proposal for discussion, not canon.
- **OPEN** — explicit decision still required.
- **PROTOTYPE** — implementation used only to prove behaviour.

## Core control documents

- `DECISION_LOG.md` — **authoritative locked/open decisions**. If another planning document conflicts with it, this wins.
- `ROADMAP.md` — **master execution sequence/index**: 74 implementation WPs from R0.2 to R4.
- `MASTER_PLAN.md` — product pillars and development rules.
- `DESIGN_BASELINE.md` — original concept/opening baseline; retained for history and established opening decisions.
- `TEST_STRATEGY.md` — automated/simulation/manual quality philosophy.

## Work-package execution contracts

These contain dependencies, purpose, deliverables, scope boundaries and completion gates for each WP.

- `work-packages/R0_FOUNDATIONS.md` — WP0.2A–WP0.7H: architecture, splicing, combat, world systems, presentation and integrated pre-alpha.
- `work-packages/R1_ACT1.md` — WP1A–WP1I: complete Act 1 / Alpha 1.
- `work-packages/R2_ACT2.md` — WP2A–WP2H: Act 2 expansion / Alpha 2.
- `work-packages/R3_BETA.md` — WP3A–WP3G: content-complete Beta and feature-freeze gate.
- `work-packages/R4_RELEASE.md` — WP4A–WP4F: release-candidate certification.

A future development chat can start with e.g. `Start WP0.2A`; the assistant should load the decision log, the relevant WP contract and only the necessary specialist design docs before implementation.

## System documents

- `SPLICING_SYSTEM.md` — irreversible cumulative splicing, expression variance, knowledge/testing, mutations.
- `COMBAT_SYSTEM.md` — turn-based capability combat, training, Land/Water/Air pits and danger progression.
- `WORLD_PROGRESSION.md` — hubs, quests, acquisition, debt branch, main creatures versus lab stock.
- `TECHNICAL_ARCHITECTURE.md` — TypeScript/Vite/Phaser, saves, RNG, input, localisation readiness.
- `CONTENT_AND_PRESENTATION.md` — visual/tone/audio/dialogue direction and warning boundary.

## Approved opening content

- `OPENING_CONTENT_PROPOSAL.md` — despite the historical filename, Rabbit/Goat/Pig and the ten opening source packages in this document are now **LOCKED**. Exact implementation numbers/tutorial tuning remain planned.

## Proposals awaiting approval/tuning

- `PIT_UPGRADE_TREE_PROPOSAL.md` — nine upgrade domains are locked; detailed tiers/costs/dependencies remain proposed/tunable.
- `WORLD_MAP_PROPOSAL.md` — provisional full-region layout/hubs/circuits.
- `ACT1_STORY_FRAMEWORK.md` — authorised overall debt-clock Act 1 structure; detailed authored beats/names/values still require production lock.
- `CREDITOR_FACTION_PROPOSAL.md` — proposed creditor faction, **The Clearing House**, and its role in the paid/unpaid debt branches.

The exact point at which each proposal must be approved is recorded as a decision gate in `ROADMAP.md` and the relevant WP contract. They do not block WP0.2A.

## Canon rule

A proposal does not become canon because it is detailed or already implemented. Promote it to LOCKED only after explicit approval or deliberate acceptance of a prototype.
