# SplicePit Planning Index

This directory is the implementation planning source of truth for SplicePit.

## Status language

Every design statement should be read using one of these states:

- **LOCKED** — already established and should not be changed accidentally during implementation.
- **PLANNED** — agreed development direction, but details may change during testing.
- **PROVISIONAL** — useful working assumption required to build/test something; not canon or a final mechanic.
- **OPEN** — requires an explicit design decision before the dependent work is considered complete.
- **PROTOTYPE** — exists only to prove a system and must not silently become canon.

## Documents

- `DESIGN_BASELINE.md` — locked concept and opening decisions already established.
- `MASTER_PLAN.md` — product vision, design pillars, dependency order and development rules.
- `ROADMAP.md` — release/work-package sequence from the current R0.1 slice through production readiness.
- `DECISION_LOG.md` — locked, planned, provisional and open decisions in one place.
- `SPLICING_SYSTEM.md` — gene acquisition, genotype, splice resolution, mutation and phenotype planning.
- `COMBAT_SYSTEM.md` — Fit Pit combat goals, architecture, balance requirements and unresolved combat decisions.
- `WORLD_PROGRESSION.md` — exploration, quests, pit/base progression, economy boundaries and story integration.
- `TECHNICAL_ARCHITECTURE.md` — browser stack, data model, save/versioning, rendering, testing and deployment.
- `CONTENT_AND_PRESENTATION.md` — content schemas, visual language, UI, audio, accessibility and production asset pipeline.
- `TEST_STRATEGY.md` — automated, browser, content, balance and save-compatibility testing.

## Canon boundary

The planning documents are not a licence to write the full story. Story beyond the established opening remains intentionally reserved for separate authorship. Systems should provide hooks for authored story content rather than inventing it.
