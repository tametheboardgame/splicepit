# SplicePit Development Roadmap

## Current state

**R0.1 — First playable vertical slice: COMPLETE / ACCEPTED FOR PLANNING**

The deployed browser slice proves the minimum end-to-end loop:

- title/opening aftermath
- top-down movement and interaction
- acquire a prototype base animal
- recover prototype genes
- select and attempt a splice
- stochastic success/failure/mutation
- derived creature stats and visible phenotype markers
- Fit Pit combat
- reward/debt feedback
- local persistence
- automated logic tests and a headless browser end-to-end test

R0.1 is a behavioural reference, not the architectural foundation for the full game.

---

# Phase R0 — Build the real foundations

## R0.2 — Architecture hardening

### Goal

Turn the current proof-of-concept into a maintainable browser game foundation without expanding content scope.

### WP0.2A — Toolchain migration

**Work**
- Move project to Vite + TypeScript.
- Pin Phaser as a package dependency.
- Remove runtime dependence on the Phaser CDN/global.
- Enable strict TypeScript checks.
- Establish consistent module aliases/import boundaries.
- Generate production `dist/` output for Cloudflare Pages.

**Exit criteria**
- Current R0.1 flow behaves equivalently after migration.
- `npm run build`, typecheck, unit tests and browser smoke all pass.
- Cloudflare preview deploys the bundled build successfully.

### WP0.2B — Domain/data boundaries

**Work**
- Define typed IDs and schemas for animals, genes, mutations, creatures, stats, moves, items and progression state.
- Split pure domain logic from Phaser scenes.
- Add content status metadata (`prototype`, `draft`, `canon`).
- Add content validation at test/build time.
- Replace ad-hoc mutable state with explicit domain operations.

**Exit criteria**
- Invalid content definitions fail tests/build.
- Core splice/combat calculations run without Phaser.
- Prototype content is visibly labelled in data.

### WP0.2C — Save/versioning foundation

**Work**
- Introduce save schema version.
- Add migration pipeline.
- Separate settings from gameplay save data.
- Define autosave checkpoints and manual/new-game reset behaviour.
- Record RNG seeds/important generated creature data required for reproducibility.

**Exit criteria**
- R0.1-style save can be migrated or intentionally reset through a documented migration.
- Save/load round-trip tests pass.
- Corrupt/incompatible save handling fails safely.

### WP0.2D — Input, UI and scene framework

**Work**
- Centralise keyboard input actions rather than scene-specific raw keys.
- Define action names (`move`, `interact`, `cancel`, `menu`, battle actions).
- Add remapping-ready input abstraction.
- Create reusable modal/dialogue/menu components.
- Add scene transition/fade framework.
- Establish controller/touch compatibility path without implementing full mobile UI yet.

**Exit criteria**
- Existing vertical slice uses the shared input/UI layer.
- No core interaction is hard-wired to one physical key.

### WP0.2E — Deterministic simulation and diagnostics

**Work**
- Add seeded RNG service.
- Inject RNG into splicing/combat/procedural rendering decisions.
- Add developer diagnostics for creature IDs, genotype, phenotype seed and stats.
- Improve browser smoke to run from public player-facing controls where practical.

**Exit criteria**
- A reported splice/battle can be reproduced from saved inputs/seed.
- Unit tests do not depend on global `Math.random()`.

### R0.2 release gate

R0.2 is complete only when the current game loop is functionally preserved, all automated checks are green, deployment works, and later content can be defined without editing scene-specific logic.

---

## R0.3 — Splicing System Prototype 2

### Goal

Prove the actual SplicePit differentiator before investing heavily in world content.

### WP0.3A — Gene model and taxonomy

- Resolve `S-OPEN-01` gene classification.
- Define gene data: source, category, expression tags, complexity, compatibility tags, phenotype instructions, combat/world effects and rarity/acquisition metadata.
- Decide whether genes can exist in multiple quality/variant forms.

### WP0.3B — Compatibility and epistasis

- Build compatibility rules between genes/base animals.
- Support positive, negative and conditional interactions.
- Avoid pairwise hard-coding that grows O(n²) without structure.
- Produce human-readable explanations for major conflicts/synergies.

### WP0.3C — Splice resolution model

- Resolve outcome bands and retry economy.
- Model complexity, compatibility, operator/lab modifiers and randomness separately.
- Ensure no hard gene-count cap.
- Ensure risk escalates naturally with ambitious combinations.
- Add deterministic seeded resolution.

### WP0.3D — Mutation system

- Define mutation categories and persistence.
- Separate random mutation from intended gene expression.
- Decide stabilisation/extraction/inheritance rules.
- Ensure mutations can create interesting trade-offs rather than only penalties/bonuses.

### WP0.3E — Phenotype composition prototype

- Build a scalable visible-composition system driven by genotype/mutations.
- Verify at least several base-animal × multi-gene combinations without bespoke creature art per combination.
- Ensure phenotype seed preserves a creature’s appearance across saves.

### WP0.3F — Lab UX

- Replace simple checkbox screen with a proper experimental workflow.
- Show known information, uncertainty and compatibility warnings without revealing every hidden outcome.
- Add before/after inspection and a permanent creature record.

### R0.3 release gate

A tester should be able to make materially different creatures from the same base animal, understand why their builds differ, experience non-identical outcomes from repeated attempts, and see those differences reflected visually and mechanically.

---

## R0.4 — Combat System Prototype 2

### Goal

Determine the final Fit Pit battle model and make genetic choices meaningfully testable.

### WP0.4A — Combat decision prototype

- Resolve `C-OPEN-01` final cadence/model through targeted prototypes.
- Compare strict turn-based prototype against any competing model before locking.
- Define desired battle length, decision density and readability.

### WP0.4B — Combat expression model

- Map genes/anatomy to combat properties.
- Define moves/actions, initiative/order, defence, accuracy/evasion if used, resource/cooldown model and trait triggers.
- Avoid a design where raw stat stacking dominates interesting gene expression.

### WP0.4C — Status/injury system

- Define temporary status effects.
- Resolve injury/knockout/death rules.
- Establish how regeneration, armour, senses, toxins, anatomy and behavioural genes interact with statuses.

### WP0.4D — Opponent AI

- Build readable AI archetypes rather than random move selection.
- Add deterministic test mode.
- Support opponent builds using the same creature model as player creatures where possible.

### WP0.4E — Balance harness

- Add simulation tooling to run large numbers of battles headlessly.
- Detect dominant stats/genes, unwinnable matchups and degenerate strategies.
- Keep simulation outputs as development diagnostics, not player-facing balance automation.

### R0.4 release gate

Combat is locked only when different splice builds demand different decisions and no obvious single build strategy invalidates the purpose of gene experimentation.

---

## R0.5 — World, quests and acquisition loop

### Goal

Turn laboratory + arena systems back into an RPG.

### WP0.5A — Authored map framework

- Define map data/prefab approach.
- Support collision, exits, interactables, layered decoration, triggers and persistence.
- Add camera/transition conventions.

### WP0.5B — Dialogue and NPC state

- Data-driven dialogue nodes/choices/conditions.
- Persistent NPC state.
- Story-variable hooks without embedding story text in engine code.

### WP0.5C — Quest system

- Objective types: talk, reach, acquire, sample, deliver, fight, inspect, etc.
- Conditional branching/rewards.
- Quest journal/status UI.
- Explicit authored content boundary.

### WP0.5D — Gene/base-animal acquisition

- Resolve actual acquisition mechanics.
- Integrate inventory/sample storage with quests and exploration.
- Make acquisition interesting enough that genes feel discovered/earned rather than simply unlocked.

### WP0.5E — Inventory/economy

- Define consumables, samples, equipment/resources and money/debt model.
- Resolve how failed splices cost the player.
- Prevent unrestricted save-scumming/retry loops from trivialising risk.

### WP0.5F — Pit/base progression

- Define mechanically meaningful facilities/upgrades.
- Separate cosmetic restoration from system unlocks.
- Ensure pit development feeds the exploration/splicing/combat loop.

### R0.5 release gate

A tester can leave the pit, complete an authored quest, obtain biological material through world play, return, splice, fight and receive progression that opens another meaningful option.

---

## R0.6 — Production presentation pipeline

### Goal

Replace prototype appearance with a scalable SplicePit visual/audio identity before large-scale content production.

### WP0.6A — Art direction specification

- Formalise palette, line/shape language, environment materials, UI motifs, lighting/contrast and grotesque-vs-charming balance.
- Define examples of what is specifically *not* SplicePit.

### WP0.6B — Environment/character asset pipeline

- Lock tile/sprite scale and export conventions.
- Build reusable environment kit.
- Establish animation conventions.

### WP0.6C — Creature phenotype production pipeline

- Convert R0.3 phenotype prototype into production method.
- Define layer/component naming, anchoring, deformation and animation rules.
- Establish fallback handling for incompatible visible parts.

### WP0.6D — UI production pass

- Production HUD, dialogue, inventory, lab and battle UI.
- Consistent controller/keyboard focus states.
- Readable typography and responsive scaling.

### WP0.6E — Audio

- Music direction and scene/state transitions.
- SFX taxonomy: world, UI, lab, biological, arena.
- Volume controls/mute/settings persistence.

### WP0.6F — Accessibility/settings

- Key remapping architecture completion.
- Text scale/contrast options where practical.
- Flash/shake reduction.
- Audio controls.
- Controller support baseline.

### R0.6 release gate

The game has a reusable production presentation system rather than prototype graphics attached directly to individual scenes.

---

## R0.7 — Integrated pre-alpha slice

### Goal

Combine all foundational systems into one substantial, internally coherent slice before authoring the full game.

### Scope

- established opening implementation
- damaged pit as a real persistent location
- first authored exterior area(s)
- real first base animal and gene set
- quest-driven acquisition
- production splicing flow
- production combat prototype
- pit progression
- save migration/versioning
- production presentation/audio baseline

### Gate

R0.7 must be playable from new game through the end of the chosen slice without developer intervention, with automated regression coverage and a structured playtest questionnaire.

---

# Phase R1 — First real game chapter / Alpha 1

## Goal

Build the first genuine authored chapter on top of systems proven during R0.

### Workstreams

- authored story supplied separately
- locations/maps
- NPCs/dialogue/quests
- real animal roster
- real gene roster
- first Fit Pit ladder/opponents
- meaningful pit upgrades
- economy tuning
- creature management/naming/history
- tutorialisation integrated into play rather than debug text

### Gate

A new player can understand the game, complete the chapter without external instructions and finish with multiple meaningfully different viable creatures.

---

# Phase R2 — Systems/content expansion / Alpha 2

## Goal

Prove the game scales beyond the first chapter.

### Priorities

- additional regions/biomes
- broader animal/gene interaction matrix
- more Fit Pit formats/opponents
- additional progression systems only where they reinforce the core loop
- balance simulation at larger content scale
- performance profiling with larger saves/content sets
- save migrations across multiple releases
- expanded controller/touch support if still desired

### Gate

New content can be added predominantly through data/assets, not engine rewrites. No major core system remains dependent on one chapter’s assumptions.

---

# Phase R3 — Content-complete Beta

## Goal

All intended major systems and authored content are present; development emphasis moves from invention to quality.

### Priorities

- complete intended story/content set
- balance pass
- progression/economy pass
- exploit/save-scum analysis
- accessibility review
- performance optimisation
- browser/device compatibility matrix
- UX/onboarding refinement
- audio/art consistency pass

### Gate

No known blocker prevents a player completing the intended game from a fresh save.

---

# Phase R4 — Release candidate

## Goal

Stabilise rather than expand.

### Priorities

- regression-only feature policy unless a blocker requires change
- save migration/failure recovery testing
- final browser compatibility
- deployment/rollback procedures
- telemetry/error-reporting decision if desired
- legal/licensing/credits checks for all third-party assets and libraries
- final performance budgets

### Gate

Release candidate survives repeated full-game playthroughs and automated suites without save corruption, progression blockers or high-severity defects.

---

# Backlog after core release

These are explicitly not dependencies for the initial full game unless later promoted:

- native/mobile wrapper
- online accounts/cloud saves
- multiplayer/PvP
- creature sharing/trading
- modding/content tools
- procedural world generation
- runtime generative-AI creature art
- large backend/service architecture

The browser game should not carry architectural complexity for these speculative features before they are actually required.
