# SplicePit Development Roadmap

## Current state

**R0.1 — First playable vertical slice: COMPLETE / MERGED**

R0.1 proved the end-to-end browser loop and is now the historical baseline. Its specific Rabbit/genes/economy/combat UI remain prototype content.

---

# Phase R0 — Build the real foundations

## R0.2 — Architecture hardening

### Goal

Turn the proof-of-concept into a maintainable foundation without expanding content scope.

### WP0.2A — Toolchain migration

- Move to Vite + strict TypeScript.
- Pin Phaser as a package dependency.
- Remove runtime CDN/global dependency.
- Build production `dist/` output for Cloudflare Pages.

**Gate:** behavioural R0.1 loop survives; typecheck/tests/build/browser smoke/deployment pass.

### WP0.2B — Domain/data boundaries

- Typed stable IDs/schemas for animals, genetic sources, mutations, creatures, capabilities, items and progression.
- Pure domain logic separated from Phaser presentation.
- Content status metadata (`prototype`, `draft`, `canon`, `deprecated`).
- Build-time content validation.
- Schema supports cumulative irreversible splice history, main roster and test stock.

**Gate:** invalid content fails validation; splice/combat domain rules run without Phaser.

### WP0.2C — Save/versioning foundation

- R0.1 saves may reset cleanly.
- Establish R0.2 schema as first compatibility contract.
- Save schema version/migration pipeline.
- Separate settings where useful.
- Represent material stock separately from research/knowledge.
- Persist creature history/phenotype seed.

**Gate:** R0.2 round-trip/migration/corrupt-save tests pass; old prototype save handled safely.

### WP0.2D — Input, UI and scene framework

- Semantic input layer.
- Keyboard-first implementation.
- Controller/touch-ready bindings architecture.
- Reusable modal/dialogue/menu components.
- Scene transition framework.
- Dialogue IDs/content storage localisation-ready.

**Gate:** no core interaction is hard-wired to one physical key; existing slice uses shared framework.

### WP0.2E — Deterministic simulation and diagnostics

- Seeded RNG service.
- Inject RNG into splicing/combat/procedural systems.
- Developer diagnostics/exportable state.
- Improve browser smoke toward player-facing controls.

**Gate:** generated splice/battle can be reproduced from state + seed; core tests no longer depend on global `Math.random()`.

### R0.2 release gate

Existing gameplay still works, deployment is stable, saves/content are versioned/validated, and later systems can grow without scene-specific rewrites.

---

## R0.3 — Real splicing prototype

### Goal

Prove the defining game system: uncertain, irreversible, cumulative experimental biology with learnable-but-never-certain outcomes.

### WP0.3A — Gene/source model and taxonomy

- Formalise six locked biological classes.
- Represent broad source packages spanning multiple classes.
- Define complexity, expression tags, compatibility requirements, phenotype instructions and acquisition metadata.
- Define how base animals modify expression.

### WP0.3B — Compatibility and epistasis

- Systemic tag/rule interactions.
- Positive/negative/conditional relationships.
- Occasional authored special interactions.
- Human-readable conflict/synergy explanations.

### WP0.3C — Splice resolution and expression variance

- Implement eight agreed outcome bands.
- Resolve expression magnitude/quality separately from outcome band.
- Existing biology influences later attempts.
- No hard gene-count ceiling.
- Knowledge affects prediction, not actual guaranteed result.

### WP0.3D — Mutation research system

- Persistent mutation categories.
- Analysis.
- Attempted stabilisation.
- Attempted preservation/extraction/cultivation.
- Follow-up operations remain uncertain.

### WP0.3E — Phenotype composition prototype

- Hybrid authored/modular/procedural composition.
- Stable phenotype identity across save/load.
- Multi-gene sequential history visibly represented.

### WP0.3F — Lab experimentation UX

- Main creature versus test-animal workflow.
- Physical sample consumption.
- Persistent experiment records/knowledge.
- Diagnostic confidence/range presentation.
- Explicit irreversible commitment.
- Creature history/inspection.

### R0.3 release gate

A player can deliberately test a source across disposable animals, become better at predicting it, then risk a valued creature and receive a plausible but still non-guaranteed individual outcome.

---

## R0.4 — Fit Pit combat system

### Goal

Build the locked turn-based, capability-driven battle system where biology and tactical decisions both matter.

### WP0.4A — Turn structure and action economy

- Prototype within the locked turn-based model: alternating versus initiative/action-speed resolution.
- Define stamina/cooldown/recovery/setup mechanics preventing strongest-action spam.
- Lock final turn ordering.

### WP0.4B — Capability and training expression

- Generate actions from anatomy/physiology/behaviour.
- Individual metrics modify actions.
- Training improves use of existing capabilities without granting impossible anatomy.
- Avoid fixed four-move loadout.

### WP0.4C — Status, injury and Pit danger

- Temporary statuses.
- Persistent injury representation.
- Early safe-pit versus later dangerous rulesets.
- Rare creature-loss path at high-risk tiers.
- Recovery-system integration.

### WP0.4D — Arena classes and multi-creature architecture

- Land / Water / Air eligibility.
- Environment-specific biological requirements/effects.
- Do not force one creature of each class.
- Support main roster max three.
- Architecture for switching/team/asymmetric formats including later 3v1.

### WP0.4E — Opponent AI

- Capability-aware AI archetypes.
- Fair knowledge rules.
- Same creature model as player where practical.

### WP0.4F — Balance harness

- Headless seeded simulations.
- Representative splice archetypes.
- Detect dominant actions/stats, stalemates and degenerate strategies.
- Arena-class and Pit-danger test fixtures.

### R0.4 release gate

Distinct biological builds create distinct tactical decisions; Land/Water/Air constraints are meaningful; early combat is survivable while higher-tier rules can credibly threaten long-term creatures.

---

## R0.5 — World, quests, acquisition and pit progression

### Goal

Turn lab + arena into a complete RPG loop.

### WP0.5A — Authored map framework

- Interconnected hub/route maps.
- Collision, exits, layered decoration, triggers, persistent state.
- Camera/transition conventions.
- Physical creature-transport hooks where needed.

### WP0.5B — Dialogue and NPC state

- Data-driven dialogue/choices/conditions.
- Persistent NPC state.
- Localisation-ready string IDs.
- Optional future voice-reference fields.

### WP0.5C — Quest and story-clock system

- Objective/reward framework.
- Branches/conditions.
- Quest journal.
- Timed debt-pressure support without real-time urgency.
- Act 1 paid/unpaid branch state.

### WP0.5D — Genetic material/base-animal acquisition

- Buy.
- Harvest.
- Win.
- Trade.
- Common test animals versus rare main-base opportunities.
- Inventory/knowledge integration.

### WP0.5E — Inventory and economy

- Material stock/reagents/test animals/money.
- Real debt sum/deadline once authored.
- Failure/experiment costs.
- Trading/selling where appropriate.
- Avoid grind and unrestricted save-retry trivialisation.

### WP0.5F — Pit/base upgrade system

- Implement the approved form of nine branches: diagnostics, splice safety, recovery, storage, mutation analysis, housing, training/Fit Pit, workshop, cosmetic restoration.
- Strategic dependencies/cross-links.
- Upgrades change options/information, not only percentages.

### R0.5 release gate

Player can leave the pit, acquire material through the world, use test animals to learn, alter a main creature, fight, earn/progress, upgrade the pit and advance a branching quest/debt state.

---

## R0.6 — Production presentation pipeline

### Goal

Replace proof graphics with a scalable SplicePit identity before content volume explodes.

### WP0.6A — Art direction specification

- Formal palette/shape/material/UI/tone guide.
- Adult dark-comic boundary.
- Content-warning/disclaimer final treatment.
- “What is not SplicePit” examples.

### WP0.6B — Environment/character asset pipeline

- Lock tile/sprite resolution and camera metrics.
- Reusable environment kit.
- Character animation conventions.
- Post-collapse pastoral-biotech material language.

### WP0.6C — Creature phenotype production pipeline

- Production hybrid renderer/compositor.
- Authored base bodies + modular/procedural expressions.
- Layer/anchor/deformation rules.
- Stable individual phenotype.

### WP0.6D — UI production pass

- World HUD/dialogue/inventory/lab/battle UI.
- Experiment records/diagnostic confidence presentation.
- Responsive/focus states.
- Localisation-friendly layout.

### WP0.6E — Audio framework/content integration

- Music/SFX manager.
- Volume controls/settings.
- Placeholder tracks during development.
- Integrate final supplied music when available.
- Creature/lab/world/arena SFX.

### WP0.6F — Accessibility/settings

- Key remapping.
- Controller baseline.
- Text/contrast support.
- Reduced shake/flash.
- Audio settings.
- Touch only if promoted by then.

### R0.6 release gate

The game has a coherent reusable production presentation system rather than prototype scene art.

---

## R0.7 — Integrated pre-alpha slice

### Goal

Combine foundations into a substantial coherent slice before full content production.

Scope should include:

- authored opening disaster
- emergency starter choice/splice
- first Land bout
- functional inherited pit
- test-animal experimentation
- material acquisition via multiple channels
- first hub/routes
- debt clock and at least a representative branch point
- real pit upgrades
- production splicing/combat/presentation
- save/versioning

**Gate:** playable new game → slice end without developer intervention, with automated regression coverage and structured human playtest.

---

# R1 — First real game chapter / Alpha 1

Build the complete authored Act 1 on proven systems:

- starting region/hubs
- final starter/source content
- full debt-clock progression
- quests/NPCs
- first real gene/material roster
- Land circuit and introductions to Water/Air possibilities
- meaningful pit upgrade choices
- creature history/naming/training
- Act 1 paid/unpaid branch into Act 2

---

# R2 — Systems/content expansion / Alpha 2

- additional regions/hubs
- Water/Air circuits and specialist paths
- broader biological interaction matrix
- higher-risk Pit rules
- creditor/free Act 2 branches
- expanded base animals/material sources
- balance/performance/save migration testing

---

# R3 — Content-complete Beta

- intended story/content set present
- full progression/economy pass
- balance/exploit analysis
- accessibility/browser/device review
- performance optimisation
- art/audio consistency
- branch/progression blocker testing

---

# R4 — Release candidate

- regression/stability focus
- save migration/recovery
- final browser compatibility
- deployment/rollback procedure
- legal/licensing/credits
- final performance budgets
- repeated full-game completion testing

---

# Deferred/non-core backlog

Not dependencies for the initial release unless explicitly promoted:

- native/mobile wrapper
- cloud accounts/saves
- multiplayer/PvP
- creature trading/sharing between players
- modding/editor tooling
- procedural world generation
- runtime generative-AI creature art
- large backend architecture
