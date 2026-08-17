# SplicePit Content and Presentation Plan

## 1. Purpose

SplicePit needs a production pipeline that can grow content without losing its identity or creating one-off implementation work for every creature, map and interface screen.

This document covers content modelling, visual direction, creature presentation, UI, audio and accessibility.

## 2. Content architecture principles

### Stable IDs, replaceable presentation

Display names, descriptions and art can change without breaking saves because systems reference stable IDs.

### Data before bespoke code

A new gene, animal, item, opponent or quest should usually be added through content data/assets. New engine code should be required when the content introduces a genuinely new mechanic.

### Explicit content status

Every production-relevant definition should distinguish prototype/draft/canon/deprecated status.

### Human-editable authored content

Dialogue, quests and descriptive text should remain practical to review and edit directly rather than being buried in source logic.

## 3. Planned content entities

### Base animals

Likely fields:

- ID/status/name/description
- body-plan/size tags
- baseline biological capabilities
- baseline combat properties
- compatibility tags
- phenotype skeleton/anchors
- world/acquisition metadata
- content version

### Genes

Defined in `SPLICING_SYSTEM.md`.

### Mutations

- ID/status/name/description
- category
- triggers/affinities
- mechanical effects
- phenotype instructions
- severity/stability effects
- persistence rules

### Moves/actions

- ID/name/description
- requirements/capabilities
- costs/cooldowns if adopted
- targeting
- effect definition
- presentation/SFX/animation hooks

### Items/materials

- ID/category/name/description
- stack/quantity rules
- use/effect
- economic metadata
- quest flags if relevant

### Opponents

Prefer compositions referencing the same creature model:

- identity/name
- creature recipe or explicit persisted creature definition
- AI archetype
- arena/rules
- rewards/rank

### Quests/dialogue/locations

Defined primarily in `WORLD_PROGRESSION.md`.

## 4. Visual identity — LOCKED DIRECTION

The high-level target is **storybook wrongness / pastoral biotech**.

The visual language should make these ideas coexist:

- countryside/natural materials
- animal husbandry
- improvised scientific apparatus
- institutional labels/forms/ledgers
- biological unease
- handmade imperfection
- dark humour

It should feel like this world has normalised practices that look deeply questionable to the player.

## 5. What SplicePit should avoid

Unless later deliberately chosen:

- generic bright monster-collector presentation
- generic neon cyberpunk biotech
- generic medieval fantasy tiles
- a straight Pokémon visual parody
- uniform clean futuristic laboratories
- excessive gore as a substitute for unsettling design
- UI that looks like an unrelated modern SaaS dashboard

The tone can be grotesque without every screen being visually exhausting.

## 6. Environment art pipeline — OPEN DETAILS

R0.6 should lock:

- logical tile/grid scale
- source art resolution
- camera scale
- sprite proportions
- environmental layer conventions
- collision/interaction markers
- animation export format
- atlas strategy

The production map approach should support authored irregularity on top of tile-based navigation; a tile grid should not force every room to look mechanically tiled.

## 7. Creature phenotype production

This is the largest visual scalability risk.

### Requirements

- base animals remain recognisable enough to understand body plan
- gene expression visibly changes relevant anatomy
- multiple genes can coexist
- mutation variation creates identity
- combinations do not require bespoke complete sprites for every genotype
- appearance is stable across save/load
- battle/world views can use the same underlying phenotype identity even if rendered at different scales

### Candidate production approaches

R0.3/R0.6 should compare:

1. Layered modular sprites.
2. Vector/canvas procedural components.
3. Pre-rendered modular component compositing.
4. Hybrid: authored body + procedural/modular gene features.

The current R0.1 Canvas shapes demonstrate composition logic only; they do not lock the final style.

### Component metadata

A component system may need:

- anchor points
- body-region compatibility
- front/back/depth order
- orientation
- scale/deformation ranges
- palette/material rules
- animation attachment rules

The renderer should fail gracefully when a visible expression cannot be rendered rather than breaking the creature entirely.

## 8. Player/NPC character presentation

Character art should belong to the same world but does not need the combinatorial complexity of creatures.

Plan for:

- reusable character base/animation conventions
- authored distinctive NPC silhouettes/details
- consistent interaction facing/idle/walk states
- portrait system only if later justified by dialogue presentation

No full NPC roster should be created before authored story content exists.

## 9. UI language

The R0.1 ledger/clinical-label direction is a useful prototype clue but not locked art.

Potential motifs consistent with the identity:

- specimen tags
- pit ledgers
- typed/stamped forms
- handwritten corrections
- worn laboratory labels
- agricultural/industrial signage

Functional rules:

- readability beats decoration
- risk/compatibility information must be visually distinguishable
- player choices should have clear focus/hover/selected states
- biological stats/traits need consistent icon/text vocabulary
- generated creature information must remain inspectable

## 10. Lab UI requirements

The production lab UI should support:

- selecting a base animal
- browsing available samples
- comparing intended expressions
- showing known compatibility/risk information
- committing an attempt
- clearly presenting outcome/mutation
- inspecting and naming/saving the result
- reviewing previous attempts/records if adopted

The interface should make experimentation inviting, not feel like editing JSON in a disguised menu.

## 11. Combat UI requirements

Final form depends on combat model, but must show:

- combatant identity
- current condition/resources
- actions available and why others are unavailable
- major trait/status effects
- clear target information
- readable combat feedback

Do not overload the player with every hidden biological calculation during normal play; deeper inspection can exist separately.

## 12. Audio direction — PLANNED, STYLE OPEN

Audio categories:

### Music

- title/menu
- pit/lab
- exploration/regions
- tension/story states
- Fit Pit combat
- victory/defeat/transition stings

The eventual music style should be developed as its own art-direction exercise rather than inferred from generic retro RPG music.

### SFX

- footsteps/world interaction
- UI/stamps/mechanical controls
- lab machinery
- biological wet/dry/tissue effects used with restraint
- creature vocalisations
- combat impacts/traits
- crowd/arena ambience where appropriate

### Controls

At minimum:

- master volume
- music volume
- SFX volume
- mute
- persistent settings

## 13. Accessibility and comfort

Planned baseline:

- keyboard remapping-ready controls
- controller path
- readable text at browser scaling
- high-contrast focus states
- reduced screen shake
- reduced flashing where effects use flashes
- volume controls
- avoid requiring audio alone to communicate mechanics
- avoid colour alone as the only indicator for important states

Touch/mobile controls are a later target unless promoted; architecture should not make them impossible.

## 14. Content tooling — LATER R0 / R1

As content volume grows, simple developer tools may provide large returns:

- content validator reports
- searchable content index
- creature preview lab
- phenotype preview matrix
- quest graph validation
- dialogue preview
- map trigger diagnostics
- opponent/build simulator

Do not build a full editor before the schemas stabilise. Small purpose-built tools are preferable first.

## 15. Asset/legal discipline

For every third-party asset/library/sample:

- record source
- record licence
- record attribution requirement
- ensure commercial-use compatibility if release intent includes sale/distribution

Generated/procedural assets should also retain provenance where relevant.

## 16. Presentation acceptance gate for R0.6

R0.6 should prove:

1. At least one production-quality environment kit.
2. At least one production-quality player/NPC animation set or equivalent reference standard.
3. Multiple creatures generated through the production phenotype method.
4. Lab and battle UI use one coherent design system.
5. Audio settings persist.
6. Reduced-flash/shake options work where applicable.
7. Production assets load efficiently from the browser build.
8. New phenotype/content assets can be added using documented conventions.
