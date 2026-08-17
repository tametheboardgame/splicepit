# SplicePit Splicing System Plan

## 1. Role of the system

Splicing is the defining mechanic of SplicePit. It must support experimentation for an entire game, not merely function as an upgrade menu with a success percentage.

The system must satisfy four locked requirements:

1. No arbitrary maximum number of combined genes.
2. The same nominal splice can produce different outcomes.
3. Genes materially change both creature behaviour/mechanics and visible phenotype where appropriate.
4. The number of possible creatures must scale through composition rather than requiring a hand-authored asset for every combination.

## 2. Conceptual model

A creature should be represented approximately as:

```text
Creature
├── identity
│   ├── stable creature ID
│   ├── optional player name
│   ├── creation/history metadata
│   └── phenotype seed
├── base animal
├── genotype
│   ├── expressed genes
│   ├── latent/suppressed genes (if later used)
│   └── gene variants/quality (OPEN)
├── mutations
├── derived biology
│   ├── body capabilities
│   ├── physiological capabilities
│   ├── behavioural/sensory capabilities
│   └── stability/health properties
├── combat expression
│   ├── stats
│   ├── traits
│   ├── actions/moves
│   └── resistances/vulnerabilities
└── phenotype instructions
    ├── body layers/components
    ├── material/skin changes
    ├── appendages/features
    └── deformation/variation parameters
```

The important architectural decision is that a creature is not stored as only a final set of stats. Its biological construction remains available so other systems can reason about it.

## 3. Gene data model — PLANNED

Each gene definition should have a stable ID and data fields that can evolve without scene-specific logic.

Indicative schema:

```text
GeneDefinition
- id
- contentStatus
- displayName
- sourceAnimalTags
- taxonomy/category                OPEN
- rarity/tier                      OPEN
- description
- complexity
- compatibilityTags
- incompatibilityTags
- requirements/conditions
- expressionTags
- stat/derived-property effects
- trait/action grants
- phenotype instructions
- mutation affinities              optional
- world-use effects                optional
- acquisition metadata
- version
```

The exact taxonomy is intentionally OPEN. The schema should support categories without requiring the engine to know every category in advance.

## 4. Complexity — LOCKED PRINCIPLE, OPEN FORMULA

Complexity is one mechanism that makes ambitious splices risky without imposing a hard gene-count cap.

Complexity should not simply equal `number of genes × constant`. It can eventually account for:

- number of inserted modifications
- how radical each modification is
- distance from base-animal biology
- conflicting regulatory requirements
- body-plan changes
- number of simultaneous new systems
- existing mutations/instability
- laboratory capability/upgrades

A three-gene splice with naturally compatible systems may be easier than a two-gene splice that asks incompatible anatomy to coexist.

The formula remains OPEN until R0.3 prototypes establish useful behaviour.

## 5. Compatibility and epistasis

### Design objective

Gene combinations should create interactions that make experimentation interesting without requiring every gene pair to be manually coded.

### Planned approach

Use tags/rules rather than exhaustive pairwise tables as the default.

Example conceptual tags:

```text
body:quadruped
structure:heavy
structure:light
system:regeneration
system:venom
requirement:external_gland
requirement:high_metabolism
conflict:low_metabolism
sense:chemical
surface:armoured
```

Rules can then reason about classes of interactions:

- requirements satisfied / unsatisfied
- mutually hostile expressions
- positive synergy
- redundant expressions
- scaling penalties
- base-animal suitability

Specific handcrafted interactions can still exist for notable combinations, but should be exceptions layered over a general system.

### Player-facing requirement

The engine should be able to explain major known interactions in human terms. “Compatibility -18” is less useful than “Dense armour restricts the external gland structures this splice is trying to grow.”

How much of this is visible before the attempt remains OPEN.

## 6. Splice attempt pipeline — PLANNED

A splice attempt should eventually resolve through explicit stages rather than one opaque roll:

```text
1. Validate recipe
2. Calculate biological complexity
3. Evaluate compatibility / unmet requirements
4. Apply lab/operator/facility modifiers
5. Determine viability distribution
6. Resolve seeded stochastic outcome
7. Resolve intended gene expression
8. Resolve suppression/partial expression if used
9. Resolve mutations/side effects
10. Build derived biology
11. Build combat expression
12. Build phenotype instructions/seed
13. Persist result and attempt history
```

This staged model makes balancing, explanations and debugging possible.

## 7. Outcome model — OPEN DESIGN GATE

R0.1 has binary success/failure plus optional mutation. That is sufficient for a prototype but probably too shallow for the full game.

R0.3 should test a richer outcome space. Candidate bands include:

- clean rejection — attempt fails without lasting expression
- damaging rejection — failure has meaningful cost
- partial expression — some intended genes hold, others do not
- unstable expression — viable creature with increased ongoing instability/trade-offs
- clean success — intended expression without major side effects
- mutated success — intended expression plus one or more unintended changes
- exceptional synergy — rare unusually coherent result

These are candidates, not locked outcomes. The chosen model must be understandable enough that players can learn from attempts.

## 8. Randomness and reproducibility — PLANNED

Randomness is design, not implementation noise.

Every attempt should record or derive a seed from stable state so a bug report can reconstruct:

- base animal
- genes selected
- lab modifiers
- compatibility state
- RNG seed
- outcome
- mutation rolls
- phenotype seed

Automated tests should be able to provide a deterministic RNG and assert exact outcomes.

## 9. Retry economy — OPEN DESIGN GATE

Free retries would undermine the intended risk because players could repeatedly reload until a high-risk splice succeeds perfectly.

Potential constraints to prototype include:

- gene samples consumed on attempt
- base animal recovery time/injury
- monetary/material cost
- lab resource cost
- irreversible mutation/instability accumulation
- autosave on commitment
- rare samples that cannot be trivially replaced

No specific model is locked yet. The eventual design should make failure consequential without making experimentation so punitive that the player avoids the central mechanic.

## 10. Mutation design

Mutations should not be a generic random `+3/-2` table.

Long-term mutation categories may include:

- anatomical overgrowth/reduction
- regulatory instability
- metabolic changes
- sensory changes
- pigmentation/material changes
- behavioural changes
- expression amplification/suppression
- structural side effects

A useful mutation can still create a cost; a harmful mutation can sometimes enable an unusual strategy. This supports creatures feeling discovered rather than optimised from a spreadsheet.

Open questions:

- Can mutations be stabilised?
- Can mutated material be harvested as a new gene source?
- Can a desirable mutation become part of future planned work?
- Are some mutations transient/injury-like rather than permanent?

## 11. Creature phenotype

### Requirement

Visible results must scale combinatorially.

### Planned architecture

The phenotype renderer should consume structured instructions generated from base animal + genes + mutations + seed.

Possible instruction types:

```text
add_appendage(type, anchor, parameters)
replace_surface(material, region)
modify_proportion(region, parameters)
add_pattern(type, palette, seed)
add_growth(type, anchor, parameters)
modify_head(feature)
modify_limb(feature)
modify_eye(feature)
```

The production implementation may use layered sprites, modular rendered components, canvas/vector drawing or a hybrid. The underlying phenotype instructions should avoid depending on one rendering technology.

### Stable identity

A creature should not visibly change every time a scene loads. Procedural variation belongs to creation time and should be persisted through a phenotype seed/parameters.

## 12. Base animals

Base animals provide more than initial stats. They can define:

- body plan
- default anatomical anchors
- natural compatibility tags
- baseline capabilities
- size class
- movement type
- baseline temperament/behaviour tags if used
- phenotype renderer skeleton

This lets the same gene behave differently on different base animals without requiring separate gene definitions.

## 13. Gene acquisition integration

The splicing system should not determine story-specific acquisition methods. It only needs a clean contract:

```text
Player inventory/lab has N usable samples or access rights for Gene X.
```

World/quest systems determine how those samples arrive.

Open questions include whether a sample is consumed, whether extracted genes have quality, whether samples can be copied, and whether living creatures can become future sources.

## 14. Lab progression

Pit/lab upgrades should modify *how* the player can experiment rather than merely increasing one percentage.

Potential upgrade dimensions for later design:

- diagnostic information quality
- complexity tolerance
- recovery/safety
- sample storage
- mutation analysis
- phenotype prediction
- ability to stabilise/harvest unusual outcomes

Specific upgrades remain OPEN.

## 15. Splicing acceptance tests for R0.3

At minimum R0.3 should prove:

1. Two different base animals can respond differently to the same gene set.
2. A multi-gene recipe can be accepted without an engine-level count cap.
3. Adding a gene can improve one biological goal while worsening compatibility/risk.
4. Identical nominal recipes can produce different legitimate outcomes under different seeds.
5. The same result is reproducible when its seed is replayed.
6. At least one gene has a visible phenotype effect and a meaningful combat effect.
7. At least one gene interaction creates a synergy or conflict the player can understand.
8. Creature appearance persists exactly across save/load.
9. Invalid gene definitions fail content validation.
10. The player receives enough information to form a hypothesis for the next experiment.
