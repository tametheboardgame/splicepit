# SplicePit Master Plan

## 1. Purpose

SplicePit is moving from proof-of-concept to deliberate production. R0.1 proved that the core loop can exist in a browser: move through a top-down space, obtain a base animal and genes, splice a creature, fight it in a Fit Pit, receive progression feedback and persist state.

The next objective is not to make that prototype larger. The objective is to establish systems that can support a large game without every new animal, gene, quest or arena multiplying technical debt.

## 2. Product promise — LOCKED

SplicePit is a dark, adult creature-collection RPG built around experimental gene splicing rather than collecting fixed species variants.

The player fantasy is:

1. Explore a strange world and discover animals, people, places and opportunities.
2. Acquire useful genetic material and base animals through exploration and quests.
3. Experiment with combinations in a gene lab where there is no arbitrary gene-count ceiling and outcomes are not perfectly deterministic.
4. Produce creatures whose mechanics and appearance reflect what was actually spliced into them.
5. Test those creatures in Fit Pits where design decisions have consequences.
6. Use rewards, access and pit development to reach new genes, animals, opponents and authored story content.

The intended feeling is less “complete a collection” and more “run an increasingly alarming biological workshop that happens to fund itself through creature fighting”.

## 3. Design pillars — LOCKED

### 3.1 Exploration is the source of possibility

Genes and base animals should be connected to the world rather than primarily purchased from menus. Exploration, quests, encounters and relationships create new options in the lab.

### 3.2 Splicing is the centre of the game

The lab is not a cosmetic upgrade screen. It is the system that differentiates SplicePit. Interesting decisions should arise from compatibility, complexity, risk, scarce material, desired traits and unintended outcomes.

### 3.3 Creatures are compositions, not predefined evolutions

A creature is represented by its base animal, gene set, mutations, derived properties and a persistent identity/seed. The architecture must not require hand-authoring every possible combination.

### 3.4 Failure should create stories, not only reloads

The same splice attempt can produce different results. Failure, instability and mutation should be meaningful. The long-term system should avoid making “reload until perfect” the obviously correct way to play.

### 3.5 Fit Pits make laboratory choices legible

Combat exists to expose the practical effects of splicing. A gene that changes speed, armour, senses, regeneration, behaviour or anatomy should matter in the arena in a way the player can understand.

### 3.6 The world is an RPG, not a laboratory menu

Most play remains top-down 2D exploration with tile-based spatial logic. The lab and arena are major systems inside an RPG structure, not replacements for it.

### 3.7 The presentation should be recognisably SplicePit

The visual target is “storybook wrongness” / “pastoral biotech”: natural, handmade, clinical and grotesque elements occupying the same world. It should not settle into generic SNES fantasy or generic sci-fi laboratory styling.

## 4. Narrative boundary — LOCKED

The following opening elements are established and may be implemented:

- The player begins as a SpliceApprentice under a SpliceMaster.
- There were multiple apprentices.
- A rampaging splice animal kills the SpliceMaster.
- The player releases emergency gas to stop the escaped mutants.
- The other apprentices die; the player survives.
- The player inherits the damaged pit and remaining resources.
- The first practical objective is obtaining a new base animal.
- The disaster creates distrust/suspicion around the survivor.
- Crime/syndicate pressure is part of the inherited situation.

The complete storyline beyond this opening is intentionally not authored by these planning documents. Systems must be able to host later authored plot, dialogue and characters without embedding invented story beats into engine code.

## 5. Development principles

### 5.1 Architecture before content volume

Do not add dozens of genes, animals, maps or opponents until their schemas and runtime systems are stable enough that content is data rather than bespoke code.

### 5.2 Separate genotype, phenotype and combat expression

A gene has at least three concerns:

- **Genotype:** what genetic modification the creature contains.
- **Phenotype:** how that modification changes visible anatomy/appearance.
- **Expression:** how the modification affects stats, traits, moves, behaviour or other gameplay systems.

These layers may share data but should not be collapsed into one renderer or one combat script.

### 5.3 Determinism where testing needs it; randomness where design needs it

Splice outcomes can be stochastic, but random generation must accept explicit seeds/RNG sources so tests and bug reports are reproducible.

### 5.4 Prototype content is labelled

Temporary Rabbits, genes, opponents, currency values, dialogue and debt figures remain `prototype` until explicitly promoted. Implementation convenience must not create canon by accident.

### 5.5 Save data is a product contract

As soon as external playtesting starts, save versions and migrations matter. New releases should not casually invalidate existing saves.

### 5.6 Browser-first remains the delivery target

The game should continue to deploy as a static/browser application through the existing GitHub → Cloudflare Pages workflow. Native/mobile packaging can be considered later without making the core game dependent on it.

### 5.7 Every release has an exit gate

A release is complete when its acceptance criteria pass, not when its task list merely appears implemented.

## 6. System dependency order

The broad dependency graph is:

```text
Technical foundation
      │
      ├── Content schemas ───────────────┐
      │                                  │
      ├── Save/state/versioning          │
      │                                  │
      ├── Input/UI framework             │
      │                                  │
      └── Deterministic RNG/testing      │
                                         ▼
Base animals ──► Genes ──► Splice resolution ──► Creature model
                                         │             │
                                         │             ├── Phenotype/rendering
                                         │             └── Combat expression
                                         │
                                         ▼
Inventory/acquisition ◄── Quests/world ◄── Progression/economy
                                         │
                                         ▼
                             Fit Pit progression/opponents
                                         │
                                         ▼
                             Integrated authored chapter
```

This ordering is why R0.2 is primarily foundation work rather than new content.

## 7. Product layers

### Layer A — Domain model

Pure data and logic: animals, genes, creatures, mutations, stats, moves, combatants, inventory, quests, progression and save state. This layer should be testable without Phaser.

### Layer B — Game systems

Splicing, combat, quest evaluation, inventory transactions, rewards, dialogue state, map transitions and persistence.

### Layer C — Presentation

Phaser scenes, maps, sprite/phenotype composition, UI panels, animation, audio and input.

### Layer D — Content

Actual animals, genes, quests, locations, opponents, dialogue, items and authored story assets.

The target is to let content expand mainly by editing validated data, not by adding new engine branches.

## 8. Core quality bars

A major system is not production-ready until it satisfies all relevant bars:

- **Readable:** the player can understand cause and effect.
- **Composable:** new content does not require modifying unrelated code.
- **Testable:** deterministic unit/system tests can verify important rules.
- **Persistent:** the state survives save/load correctly.
- **Performant:** combinations do not produce uncontrolled runtime or asset growth.
- **Accessible:** core interactions have keyboard support and a path to controller/touch support.
- **Debuggable:** important generated outcomes can be reconstructed from IDs/seeds/logged inputs.
- **Content-safe:** prototype content cannot silently become canon.

## 9. Work-package discipline

Each work package should contain:

1. Purpose and dependencies.
2. Explicit in-scope/out-of-scope boundaries.
3. Files/systems expected to change.
4. Automated tests required.
5. Browser acceptance flow where relevant.
6. Migration impact on saves/content.
7. Exit criteria.
8. Follow-on risks or open decisions.

Large releases should be composed of mergeable work packages rather than one long-lived feature branch.

## 10. Immediate objective

R0.2 should make the current vertical slice structurally trustworthy without materially expanding the game. When R0.2 is complete, subsequent work can focus on game design and content rather than repeatedly rebuilding foundations.
