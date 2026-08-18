# SplicePit Work Packages — Historical Foundations Through WP0.4B

> **18 August 2026 roadmap reset**
>
> This file is authoritative only for the already-executed technical foundation work from WP0.2A through WP0.4B. All previous WP0.4C+ contracts that used to live here are superseded.
>
> For current work beginning at **WP0.4C — Visual Direction Reset**, use `R0_VISUAL_FIRST_REBASE.md` and `../ROADMAP.md`.

The purpose of retaining this file is historical clarity: the architecture, biological domain prototypes and early combat experiments produced useful technical evidence, but their player-facing implementations are not automatically the target design.

## Completion rule used by the historical packages

- work stayed inside the stated scope unless a blocker required a documented follow-up;
- automated checks relevant to changed systems passed;
- save/schema impact was recorded;
- assumptions remained provisional/open unless explicitly locked;
- a WP was complete only when its gate passed.

---

# R0.2 — Architecture Hardening — COMPLETE

## WP0.2A — Toolchain Migration

**Purpose:** replace temporary static/CDN development setup with the production browser toolchain while preserving behaviour.

**Delivered:**
- Vite + strict TypeScript;
- Phaser pinned as a package dependency;
- production `dist/` build for Cloudflare Pages;
- dev/typecheck/test/build/verify scripts;
- current scenes migrated from the temporary runtime.

## WP0.2B — Domain, IDs and Content Boundaries

**Purpose:** establish stable data contracts before content volume grows.

**Delivered:**
- typed IDs/definitions for biological, creature, action, item, location, quest and progression concepts;
- content status and validation boundaries;
- domain logic separated from Phaser where practical;
- creature state supports irreversible history, research, material stock, test animals, roster state and multi-environment capability fields.

## WP0.2C — State, Save Versioning and Persistence Contract

**Purpose:** create the first durable save foundation.

**Delivered:**
- versioned save envelope/migration path;
- persistent creature identity/history/phenotype/injury/training/capability state;
- separate research/material state;
- recovery/backup behaviour;
- migration and round-trip fixtures.

## WP0.2D — Semantic Input, UI Shell and Localisable Dialogue Framework

**Purpose:** stop physical keys and scene-specific UI from becoming systemic dependencies.

**Delivered:**
- semantic input actions;
- reusable panel/menu/dialogue primitives;
- transition framework;
- string/localisation IDs;
- focus/selection conventions.

## WP0.2E — Deterministic RNG, Diagnostics and CI Hardening

**Purpose:** make stochastic systems reproducible before they become complex.

**Delivered:**
- seeded/injectable RNG;
- domain RNG boundary validation;
- debug diagnostics/export hooks;
- CI for typecheck/content/RNG/tests/build/browser smoke.

---

# R0.3 — Biological/Splicing Technical Prototype — COMPLETE AS EXPERIMENT

These WPs proved technical viability. Their data/domain work remains reusable. The player-facing bench flow is superseded and will be redesigned in R0.5.

## WP0.3A — Source Package Taxonomy and Biological Data Model

Implemented the biological class/source/base model and canonical opening animals/source packages.

## WP0.3B — Physical Material, Reagents and Research-Knowledge Model

Separated persistent knowledge from consumable physical material and laboratory attempt costs.

## WP0.3C — Compatibility and Epistasis Engine

Proved systemic requirements/conflicts/synergies and context-sensitive compatibility.

## WP0.3D — Splice Resolution, Outcome Bands, Variance and Stability

Proved seeded uncertain outcomes, expression variance, cumulative instability and catastrophic paths.

## WP0.3E — Cumulative Creature Biology and Capability Derivation

Proved irreversible ordered biological history and function-derived capabilities.

## WP0.3F — Mutation Research Prototype

Proved persistent mutations and follow-up analysis/stabilisation/preservation style operations.

## WP0.3G — Hybrid Phenotype Composition Prototype

Proved that phenotype instructions can be derived from biology without one complete bespoke asset per genotype.

## WP0.3H — Lab Experimentation UX and Splicing Playtest Gate

**Historical result:** the technical loop worked, but human review did **not** accept the current bench interaction as the desired final mechanic. The implementation is retained only as evidence and reusable code.

**Do not continue this UX as the target splice system.** Current redesign begins at WP0.5A after the visual lock.

---

# R0.4 — Early Combat Technical Experiments

## WP0.4A — Combat Metrics and Capability Action Model

**Purpose:** translate functional biology into combat properties/actions without a fixed four-move loadout.

**Historical result:** useful technical model for capability-derived actions. Retain as reference/infrastructure only. Later battle design may reuse, revise or replace presentation and interaction assumptions.

## WP0.4B — Turn Structure and Action Economy

**Purpose:** prototype candidate turn cadence and anti-spam resource/recovery behaviour.

**Historical candidate implemented:** declaration + initiative resolution with metabolic reserve, cooldown/setup and deterministic events.

**Human-gate result:** **NOT LOCKED.** The playtest was overtaken by broader dissatisfaction with the battle experience and visual presentation. The candidate remains evidence only and must be re-evaluated from first principles in WP0.5C.

---

# Supersession boundary

Everything after WP0.4B from the pre-reset plan is intentionally removed from this file.

Current execution continues in:

- `../ROADMAP.md`
- `R0_VISUAL_FIRST_REBASE.md`

A future agent must not resurrect old WP0.4C+ numbering or assume the rejected splice/combat/bright-visual prototypes are canonical.