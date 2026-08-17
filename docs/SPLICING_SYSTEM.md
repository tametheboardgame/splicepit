# SplicePit Splicing System Plan

## 1. Role

Splicing is the defining mechanic. The player is not selecting deterministic upgrades; they are performing irreversible biological experiments whose likely outcomes become more understandable through repeated testing, better records and improved equipment.

The target fantasy is closer to an irresponsible five-year-old with a genetics laboratory — “put a rhino horn on this fish” — than to realistic molecular genetics.

## 2. Locked principles

1. No arbitrary gene-count ceiling.
2. Splicing is irreversible.
3. A living creature can be spliced repeatedly through its life.
4. Identical nominal recipes do not guarantee identical results.
5. Even two attempts in the same success band can express at different strength/stat levels.
6. Players learn by experimentation; knowledge improves prediction but never creates total certainty.
7. Valuable animals create tension because equivalent test subjects may be difficult to obtain.
8. Physical genetic material/resources are consumed even when the underlying gene/source has already been studied.
9. Extreme experimentation can permanently damage or rarely kill a creature.
10. Mutations may become valuable discoveries and can be investigated/stabilised/preserved through further uncertain work.

## 3. Gene/material taxonomy

Initial locked direction uses broad classes rather than treating every “gene” as one clean superpower:

- **Anatomical** — horns, claws, teeth, scales, limbs, body structures.
- **Physiological** — regeneration, metabolism, muscle performance, temperature control, oxygen use.
- **Sensory** — vision, smell, hearing, echolocation, electroreception and related perception.
- **Biochemical** — venom, toxins, secretions, bioelectricity, pigments and chemical defences.
- **Behavioural / neurological** — predator drive, reflex patterns, aggression, social instincts, battle cognition.
- **Regulatory** — growth, expression amplification/suppression, size, developmental timing and other genes that alter how other material expresses.

These are implementation classes, not hard realism. A harvested “lion package” may contain tendencies across several classes, with each attempt expressing a different subset or strength.

## 4. Creature model

A persistent creature records:

```text
identity
- creatureId
- name
- age/history
- creation/base animal
- phenotypeSeed

biological history
- splice attempts in order
- source material used
- expression outcomes
- mutations
- permanent injuries/instability

current genotype/expression
- intended inserted material
- expressed traits
- partial/suppressed expressions
- mutations

capabilities
- anatomy
- physiology
- senses
- biochemical systems
- behaviours/instincts
- regulatory effects

combat expression
- derived metrics
- capability actions
- training modifiers

presentation
- phenotype component instructions
```

The order/history matters because later splices operate on an already modified creature rather than a clean base template.

## 5. Testing and knowledge loop

This is now a core gameplay loop:

```text
Acquire material
      ↓
Acquire common/cheap test animal(s)
      ↓
Attempt splice
      ↓
Observe outcome / update records
      ↓
Repeat with more material/subjects
      ↓
Build confidence about likely expression and risks
      ↓
Commit to a valuable main creature
```

A player can choose to skip testing and take the risk.

Testing should improve information such as:

- likely expression families
- observed strength range
- known side effects
- compatibility conflicts
- mutation tendencies
- base-animal-specific behaviour

It should never produce a guarantee.

## 6. Knowledge versus material

The system separates:

### Knowledge
Persistent records about a source/gene/context. Knowledge is not consumed.

### Physical material
Actual harvested/bought/won/traded genetic stock and required laboratory reagents. These are consumed by attempts.

This creates a reason to return to the world even after a gene is well understood.

Exact sample quantities, storage/decay and reagent rules remain to be designed.

## 7. Compatibility / epistasis

Compatibility uses systemic tags/rules with occasional special authored interactions.

The engine should reason about concepts such as:

- body-plan requirements
- metabolic demands
- structural support
- competing developmental pathways
- incompatible surfaces/organs
- synergistic systems
- regulatory amplification/suppression
- accumulated instability

`X + Y` must not deterministically equal `Z`.

A combination can alter the probability distribution and expression range, while randomness and the individual animal still matter.

## 8. Splice resolution pipeline

Planned staged resolution:

```text
1. Validate animal + physical material + lab capability
2. Read creature's existing biological history
3. Calculate added complexity
4. Evaluate compatibility, requirements and existing conflicts
5. Apply knowledge/diagnostic information available to UI
6. Apply lab/facility modifiers
7. Determine distribution across outcome bands
8. Resolve seeded outcome band
9. Resolve which intended expressions take hold
10. Resolve expression strength/quality independently within valid ranges
11. Resolve mutation/side effects/permanent injury
12. Recompute capabilities and combat metrics
13. Generate/update stable phenotype instructions
14. Consume material/reagents
15. Persist attempt and outcome to creature/lab records
```

## 9. Initial outcome spectrum

The initial model to prototype is:

1. **Clean rejection** — intended material fails to establish; limited/no lasting biological change, resources lost.
2. **Damaging failure** — rejection plus injury/stability damage.
3. **Partial expression** — some traits take hold, or intended trait expresses weakly/incompletely.
4. **Unstable viable creature** — intended result broadly works but with significant instability/ongoing cost.
5. **Normal success** — useful intended expression with ordinary variance.
6. **Mutated success** — intended expression plus unintended mutation(s).
7. **Exceptional synergy** — unusually beneficial interaction/expression, still potentially carrying quirks.
8. **Catastrophic result** — severe permanent damage, unusable outcome or rare death.

The bands are not deterministic stat templates. Two normal successes can be substantially different.

## 10. Expression variance

For every applicable expression, resolve dimensions such as:

- magnitude
- completeness
- anatomical placement/form
- efficiency
- reliability
- stability
- side effects

Example:

A gecko-derived regeneration package inserted into two comparable pandas may produce:

- Panda A: rapid limb/tissue regeneration with very high metabolic demand.
- Panda B: slow wound repair and limited regrowth but low metabolic burden.

Both can be classified as successful.

## 11. Repeated splicing

Later attempts are made against the creature's current state.

Example:

```text
Rabbit
  → lion-derived material
     = larger claws/teeth + stronger predatory drive
  → elephant-derived material
     = increased mass/growth, altered metabolic and structural requirements
  → later sensory/armour/etc.
```

The creature becomes a history of experiments, not a current “loadout”.

Repeated modification may increase complexity/instability but the exact curve is still open.

## 12. Mutation research

Mutations are persistent biological events rather than generic random stat bonuses.

The player can later gain systems allowing attempts to:

- analyse the mutation
- preserve biological material from it
- stabilise its expression
- reproduce it in test animals
- extract/cultivate a useful derived sample

None of those attempts are guaranteed.

A mutation can be beneficial, harmful, mixed or simply strange.

## 13. Failure and death

Normal experimentation should not make the central mechanic prohibitively punitive.

Locked direction:

- common failure → material/reagent loss and perhaps temporary/permanent stability cost
- damaging failure → injury or lasting defect
- extreme/catastrophic attempt → potential permanent destruction of useful traits or animal viability
- death → rare, foreseeable as part of an extreme-risk distribution rather than arbitrary routine punishment

The UI should communicate that a valuable creature is entering extreme danger even if exact odds are uncertain.

## 14. Phenotype

Appearance is persistent and derived from biological history.

Production direction is hybrid:

- authored base-animal body/skeleton
- modular anatomical components
- layered sprite/material changes
- procedural/composited variation
- persistent phenotype seed/parameters

The same genotype class can look different between individuals without changing every scene load.

## 15. Acceptance targets for R0.3

R0.3 should prove all of the following:

1. Same base + same material can yield different successful expressions under different seeds.
2. Repeat testing measurably improves pre-splice information.
3. Physical material is consumed while knowledge persists.
4. A creature can receive multiple irreversible sequential splices.
5. Existing biology changes the risk/distribution of later work.
6. At least one systemic compatibility conflict and one synergy exist.
7. Eight outcome bands can be represented even if some are rare.
8. Mutation research can attempt at least one follow-up operation.
9. Phenotype remains stable across save/load.
10. Valuable-creature risk feels meaningfully different from disposable test-animal experimentation.
