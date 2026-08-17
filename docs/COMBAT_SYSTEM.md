# SplicePit Fit Pit Combat Plan

## 1. Role of combat

Fit Pit combat exists to make the consequences of biological construction playable.

Combat should answer the question:

> “What did the thing I built actually become good or bad at?”

It should therefore reward experimentation and understanding more than simply acquiring the highest numerical tier.

The R0.1 `Attack / Use Trait / Brace` system is a PROTOTYPE only. The final cadence is an explicit design gate.

## 2. Combat design goals

### 2.1 Build expression

A fast sensory splice, a dense armoured splice, a regenerative endurance splice and an unstable glass-cannon splice should produce meaningfully different battle decisions.

### 2.2 Readable causality

The player should understand important interactions: why an attack missed, why armour reduced damage, why regeneration triggered, why a gland was disabled, why a creature moved first, etc.

### 2.3 Low filler

Battles should not require repeating a basic attack for many turns after the outcome is already obvious.

### 2.4 Counterplay without rigid type charts

SplicePit should avoid becoming a renamed fixed elemental type triangle unless later deliberately chosen. Counterplay should preferably emerge from anatomy, physiology, behaviour, moves and arena context.

### 2.5 Player decisions matter

A strong build should provide advantages, not automatically play itself. Conversely, tactical skill should not make creature construction irrelevant.

### 2.6 Same creature model for players and opponents

Where practical, Fit Pit opponents should be constructed through the same underlying creature/gene system. Hand-authored opponent behaviours/builds can then showcase possibilities rather than using unrelated enemy-only rules.

## 3. Combat model decision — OPEN

R0.4 should prototype and lock the cadence before extensive move/status content is built.

Candidate families could include:

- strict turn-based command combat
- initiative/continuous-turn system
- compact tactical positioning
- simultaneous action selection
- another model discovered during prototyping

The decision should be judged against:

- clarity of gene effects
- pace
- browser/controller usability
- AI requirements
- ability to support unusual body plans
- animation/art workload
- balance complexity
- whether movement/position adds genuine strategy or only friction

The existence of turn-based R0.1 code is not evidence that turn-based is final.

## 4. Creature combat expression — PLANNED

The combat layer should derive from biology rather than maintain a separate unrelated build definition.

Potential derived concepts:

- vitality / injury tolerance
- force / attack capability
- structural protection
- mobility / initiative
- perception / accuracy / anticipation
- metabolic capacity / endurance
- stability / reliability
- regeneration
- reach
- mass/size
- toxin/venom capability
- environmental tolerances

Exact stats are OPEN. The objective is to minimise stats that merely duplicate each other.

## 5. Actions and moves — OPEN STRUCTURE

Possible action sources:

1. Base-animal natural actions.
2. Anatomy-enabled actions (horn, jaws, wings, armour, glands, tail, etc.).
3. Gene-granted physiological actions.
4. Learned/trained actions if later desired.
5. Generic defensive/reposition/recovery actions.

A key design question is whether actions are directly granted by genes or inferred from resulting anatomy/capabilities. The latter is more systemic but also more complex.

R0.4 should select the minimum model that still lets build composition matter.

## 6. Resources, cooldowns and spam prevention — OPEN

If the optimal turn is always “use strongest gene move”, the combat system fails.

Possible constraints include:

- stamina/metabolic cost
- cooldowns
- setup requirements
- positional requirements
- injury risk
- limited-use biological resources (venom, secretion, etc.)
- conditional triggers

The chosen system should feel biologically grounded enough for the setting without becoming an opaque physiology simulation.

## 7. Initiative and speed

Speed should matter, but repeated first-turn dominance can make slower builds nonviable.

R0.4 should test whether mobility affects:

- action order
- number of actions
- dodge/avoidance
- positioning
- disengagement
- interrupt/reaction windows

Avoid letting one numeric speed stat become simultaneously initiative, evasion, accuracy and action economy unless that concentration is intentional and balanced.

## 8. Defence and damage

Armour and biological defence should have readable trade-offs.

Potential distinctions:

- structural armour reduces certain physical damage
- flexible hide reduces another class of injury
- regeneration repairs damage after it occurs
- avoidance prevents contact
- toxin resistance prevents secondary effects

Do not lock a detailed damage-type taxonomy until enough real genes exist to justify it.

## 9. Status effects

Statuses should connect to biological systems rather than being a generic RPG checklist.

Possible families:

- bleeding/tissue damage
- toxin/venom
- impaired movement
- sensory disruption
- exhaustion/metabolic strain
- instability/misexpression
- armour/body-part damage if body-part systems are adopted

Every status needs clear application, duration/removal logic and UI communication.

## 10. Injury, knockout and death — OPEN DESIGN GATE

This decision strongly affects attachment and willingness to experiment.

Options range from consequence-light knockout to persistent injury or death.

The decision must account for:

- time investment in creating a unique creature
- how replaceable gene samples are
- whether failure is already costly in the lab
- risk of encouraging reloads
- tone of the world
- emotional attachment to creatures

Do not implement permanent death simply because the setting is dark; it must improve the game loop.

## 11. Fit Pit formats — OPEN

R0.1 is one-versus-one. Future formats may include:

- 1v1
- team battles
- endurance bouts
- restricted gene/body rules
- environmental arenas
- challenge fights built around a specific counterproblem

The initial real chapter does not need every format. The engine should avoid hard-coding “one player combatant and one enemy forever” if team formats are plausibly desirable.

## 12. Opponent AI

AI should operate through goals/archetypes rather than random action selection.

Example archetypes:

- pressure/aggressive
- defensive/endurance
- opportunistic/status
- setup/burst
- reactive/counter

AI can know its own build and observable opponent state. Whether it has hidden perfect knowledge of the player’s genes is a design choice; default should avoid unfair omniscience.

## 13. Arena/environment interaction

Positioning/environment is OPEN. If adopted, environmental features should interact with biology in meaningful ways (mobility, reach, water, obstacles, hazards, visibility, etc.).

If arenas are merely decorative, the combat engine should stay simpler and avoid tactical-grid complexity for its own sake.

## 14. Rewards and progression

Combat rewards should feed the core loop without making Fit Pits the only rational source of progress.

Potential rewards:

- money/resources
- access/rank
- rare gene/sample opportunities
- pit reputation
- story/quest progression
- facility opportunities

Exact structure belongs to world/progression design.

## 15. Balance philosophy

There should not be one universally optimal creature.

Balance targets:

- strengths carry costs or vulnerability
- specialised builds can dominate appropriate matchups
- generalists retain value through flexibility
- rare genes create new possibilities rather than simply larger numbers
- synergy matters but does not create unavoidable instant wins
- unstable/high-risk builds can be powerful without being strictly superior

## 16. Simulation tooling — PLANNED

Once combat rules stabilise, build a headless simulator using the same pure domain logic as live combat.

Use it to:

- run thousands of seeded battles
- measure win rates between representative builds
- identify dominant actions/stats
- detect infinite loops/stalemates
- test AI behaviours
- regression-test balance changes

Simulation should inform human balancing, not automatically decide what “fair” means.

## 17. Combat acceptance tests for R0.4

R0.4 should not be considered locked until:

1. At least four substantially different splice archetypes play differently.
2. Gene-derived traits visibly alter tactical decisions.
3. No one generic action is optimal in nearly every state.
4. Slow/defensive and fast/offensive builds both have viable strategies.
5. Combat logs/UI clearly explain major events.
6. AI opponents use coherent strategies.
7. Seeded simulations are deterministic.
8. Large batch simulations reveal no obvious universal dominant build.
9. Save/load preserves creature combat configuration exactly.
10. A human playtest supports locking the chosen combat cadence.
