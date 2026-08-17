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

The exact turn-order/initiative formula remains open.

## 3. Capability-driven actions

Actions are derived from:

1. base-animal capabilities
2. expressed anatomy
3. expressed physiology/biochemistry
4. senses/behavioural instincts
5. individual metrics
6. training

A horn gene should not merely add a button called `Horn Attack`. It gives the creature horn anatomy, and the combat system exposes appropriate ways to use it depending on body, mass, training and situation.

## 4. Training

Training is a separate layer from genetic construction.

It may improve:

- reliability/accuracy using an existing capability
- tactical discipline
- stamina/resource efficiency
- specialised forms of an action
- reactions/defence

Training must not magically grant anatomy/capabilities the creature does not possess.

Exact training progression remains open.

## 5. Creature metrics

Combat metrics should be derived from current biology rather than exist as unrelated RPG numbers.

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

R0.4 will rationalise these into the smallest useful set.

## 6. Main roster

The player develops at most **three main combat creatures**.

This is deliberately not a large squad-collection game.

Test animals/lab stock are separate and can be numerous subject to housing/resources.

Battle formats begin 1v1 but architecture must later support:

- 1v1
- switching between available main creatures if a ruleset permits
- 2v2 / 3v3 if later designed
- asymmetric encounters such as 3v1
- endurance/special bouts

## 7. Arena classes

Initial top-level Fit Pit environments are:

- **Land**
- **Water**
- **Air**

Biological functionality controls eligibility. A normal land animal cannot simply fight in an aquatic pit, and an animal incapable of meaningful flight cannot fight an Air bout.

Players may:

- maintain a diversified roster
- double/triple down on one arena class
- become a specialist
- ignore some circuits entirely where story progression allows

Whether a sufficiently modified creature can qualify for more than one arena class remains open.

## 8. Environmental mechanics

Arena class must be more than a label.

Examples to test:

### Land
- mass/traction
- charging space
- obstacles/cover
- climbing/burrowing if implemented

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

Exact positioning complexity remains open. R0.4 should avoid adding a tactical grid unless space genuinely improves the biology-driven decisions.

## 9. Pit danger progression

Early local pits are comparatively controlled — closer to sparring with handlers and rules designed to avoid unnecessary death.

As the player advances:

- fights become harder
- rules become looser
- persistent injury becomes more likely/relevant
- illegal/remote/high-status pits may accept severe injury
- eventual bouts can carry genuine risk of permanently losing a creature

This lets the game build attachment before making loss possible.

Exact injury/death probabilities/rules are still open.

## 10. Action economy

The final system must prevent “always click the strongest body part”.

Potential mechanisms to prototype:

- stamina/metabolic cost
- action speed/initiative cost
- cooldown/recovery
- positional/setup requirements
- limited biological resources (venom/electric charge/etc.)
- risk of self-injury/instability
- counter/reaction windows

The solution should remain intuitive enough that the player thinks about the animal, not a spreadsheet.

## 11. Status/injury

Candidate biologically grounded states:

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
- Rare genes create new possibilities, not simply bigger numbers.
- Generalists trade peak performance for flexibility.
- A well-built creature should still be piloted badly.
- A skilled player should not be able to make biological construction irrelevant.

## 14. R0.4 work now that turn-based is locked

R0.4A should no longer ask “what combat genre are we making?”. Instead it should prototype the **turn structure within a locked turn-based model**:

- simple alternate actions
- initiative/action-speed ordering
- simultaneous declaration + resolution, if useful

Then select the version that best exposes capability-driven biology.

## 15. R0.4 acceptance targets

1. At least four distinct splice archetypes play differently.
2. Actions appear because the creature possesses corresponding capabilities.
3. Training changes use of a capability without replacing the need to possess it.
4. No generic action dominates nearly every state.
5. Land/Water/Air eligibility is enforced in test fixtures.
6. Early safe-pit rules and at least one higher-risk persistent-injury ruleset can be represented.
7. Up to three main creature records are supported without assuming all participate simultaneously.
8. AI uses coherent strategies.
9. Seeded battle simulations are deterministic.
10. Human playtest confirms the turn structure is readable and tactically meaningful.
