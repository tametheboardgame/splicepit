# SplicePit Fit Pit Combat Plan

## 1. Role

Fit Pit combat is the practical test of what the player has built. Splicing is one player-skill layer; tactical turn-based combat is another.

Preparation gives the player the tools. Tactical play determines whether they use them well.

## 2. Locked combat model

Combat is **turn-based**.

It should retain the readability of classic creature RPG battles while avoiding the fixed “four named moves” model.

A creature's actions come from what its body can actually do.

Examples:

- use horns
- bite
- claw
- ram/run down
- constrict
- kick
- discharge electricity
- spray/secrete toxin
- fly/dive
- use armour defensively
- exploit enhanced senses

The exact internal turn-order/initiative formula is intentionally deferred to WP0.4B.

## 3. Capability-driven actions

Actions are derived from:

1. base-animal capabilities
2. expressed anatomy
3. expressed physiology/biochemistry
4. senses/behavioural instincts
5. individual metrics
6. training

A horn source should not merely add a button called `Horn Attack`. It gives the creature horn anatomy; combat exposes useful horn-related actions only when the resulting anatomy/body/training can actually support them.

## 4. Training

Training is separate from genetic construction.

It may improve:

- reliability/accuracy using an existing capability
- tactical discipline
- stamina/resource efficiency
- specialised forms of an action
- reactions/defence

Training must not magically grant anatomy/capabilities the creature does not possess. Exact training progression is resolved in WP0.4C and tuned later.

## 5. Creature metrics

Combat metrics are derived from current biology rather than unrelated RPG numbers.

Candidate domains:

- vitality/injury tolerance
- force/impact
- structural protection
- mobility
- perception/reaction
- metabolic capacity/endurance
- stability/reliability
- regeneration
- reach
- mass/size

WP0.4A rationalises these into the smallest useful set.

## 6. Main roster

The player develops at most **three main combat creatures**.

Test animals/lab stock are separate and can be more numerous subject to housing/resources.

Battle formats begin 1v1 but the architecture must support:

- 1v1
- switching between available main creatures where rules permit
- team formats if later authored
- asymmetric encounters such as 3v1
- endurance/special bouts

## 7. Arena classes — LOCKED

Initial top-level Fit Pit environments are:

- **Land**
- **Water**
- **Air**

Eligibility is based on **functional capability**, not species, intended gene package or cosmetic anatomy.

Examples:

- a wolf with malformed/useless wings remains Land-only;
- a creature with gill-like tissue but no useful propulsion or aquatic endurance may still fail Water qualification;
- a creature that can genuinely sustain controlled flight can qualify for Air even if its base species was terrestrial.

A creature may qualify for more than one arena class. It is theoretically possible for one animal to qualify for all three.

The game should not apply an arbitrary “generalist penalty”. The likely cost comes naturally from carrying enough successful anatomy, metabolism, structural support, training and stability to function well in several incompatible environments.

Players may therefore:

- maintain a diversified roster;
- specialise one or more creatures heavily;
- double/triple down on one circuit;
- create difficult multi-environment generalists;
- ignore some competitive circuits where the story allows.

Exact functional thresholds/tests are resolved in WP0.4E.

## 8. Environmental mechanics

Arena class must be more than a label.

Examples to test:

### Land
- mass/traction
- charging space
- obstacles/cover
- climbing/burrowing if useful

### Water
- buoyancy
- propulsion
- oxygen/breathing
- depth
- electro/chemical interactions

### Air
- lift/endurance
- manoeuvrability
- dive/altitude
- wing/body damage consequences

Exact positioning complexity remains open. WP0.4 should avoid adding a tactical grid unless space genuinely improves biology-driven decisions.

## 9. Pit danger progression

Early local pits are comparatively controlled — closer to sparring with handlers and rules designed to avoid unnecessary death.

As the player advances:

- fights become harder;
- rules become looser;
- persistent injury becomes more relevant;
- illegal/remote/high-status pits may accept severe injury;
- eventual bouts can carry genuine risk of permanently losing a creature.

This lets the game build attachment before making loss possible. Exact risk rules are resolved/tuned by WP0.4D and later content phases.

## 10. Action economy

The final system must prevent “always click the strongest body part”.

Mechanisms to prototype include:

- stamina/metabolic cost
- action speed/initiative cost
- cooldown/recovery
- positional/setup requirements
- limited biological resources such as venom/electric charge
- risk of self-injury/instability
- counter/reaction windows

The solution should remain intuitive enough that the player thinks about the animal, not a spreadsheet.

## 11. Status and injury

Candidate biologically grounded states include:

- bleeding/tissue trauma
- impaired limb/mobility
- sensory disruption
- exhaustion/metabolic strain
- toxin/venom
- instability/misexpression
- armour/body-structure damage

Status UI must explain cause/effect clearly.

## 12. Opponent AI

AI uses the same capability rules as player creatures where possible.

Archetypes can include:

- aggressive pressure
- defensive/endurance
- opportunistic/status
- setup/burst
- reactive/counter

AI should not have unjustified perfect knowledge of hidden player biology.

## 13. Balance philosophy

There should be no universally optimal creature.

- Powerful specialisation creates vulnerabilities/costs.
- Rare sources create new possibilities, not simply bigger numbers.
- Generalists trade peak performance for flexibility through actual biological burden.
- A well-built creature should still be piloted badly.
- A skilled player should not be able to make biological construction irrelevant.

## 14. R0.4 execution order

R0.4 is no longer deciding the combat genre. The detailed work packages are in `work-packages/R0_FOUNDATIONS.md`:

1. metrics/capability action model;
2. turn structure/action economy;
3. training;
4. status/injury/danger;
5. functional Land/Water/Air eligibility;
6. multi-creature architecture;
7. AI;
8. balance harness/playtest lock.

## 15. R0.4 acceptance targets

1. At least four distinct splice archetypes play differently.
2. Actions appear because the creature possesses corresponding functional capabilities.
3. Training changes use of a capability without replacing the need to possess it.
4. No generic action dominates nearly every state.
5. Fixtures include Land-only, Water-only, Air-only, dual-environment, all-three and misleading-but-nonfunctional anatomy cases.
6. Early safe-pit rules and at least one higher-risk persistent-injury ruleset can be represented.
7. Up to three main creature records are supported without assuming all participate simultaneously.
8. AI uses coherent strategies.
9. Seeded battle simulations are deterministic.
10. Human playtest confirms the chosen internal turn structure is readable and tactically meaningful.
