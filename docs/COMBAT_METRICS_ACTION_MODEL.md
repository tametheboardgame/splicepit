# WP0.4A Combat Metrics and Capability Action Model

Status: WP0.4A prototype contract.

## Purpose

WP0.4A translates the cumulative functional biology established in R0.3 into a small battle-facing model without promoting the R0.1 `maxHp / attack / defence / speed` prototype or inventing a fixed move loadout.

The combat profile is entirely derived. The persisted source of truth remains the creature's base animal, ordered splice history, functional expression, current biological stability and active capability state.

## Combat metrics

The prototype exposes nine metrics on a 0–100 derived scale:

- **Vitality** — biological tolerance for damage and capacity to remain functional.
- **Force** — ability to deliver useful physical or biological force.
- **Protection** — structural/dermal capacity to absorb or resist force.
- **Mobility** — useful movement, acceleration and repositioning capacity.
- **Perception** — ability to detect, locate and follow relevant battle information.
- **Metabolic capacity** — biological capacity available for demanding activity. This is not yet the WP0.4B stamina/action-economy resource.
- **Reliability** — consistency of current biology, influenced by stability and expression reliability.
- **Reach** — practical body/weapon reach.
- **Mass** — battle-relevant body mass and momentum.

The exact coefficients and 0–100 scaling are **PROTOTYPE / TUNABLE**. Their purpose in WP0.4A is to provide a rational, compact bridge from biology to later combat resolution, not to establish final balance.

Base biological tags establish broad body differences. Current functional capabilities then modify the same metric set. Functional splice expressions contribute according to their realised magnitude/completeness/efficiency/reliability/stability rather than the intended source package label.

## Capability-driven actions

`deriveLegalCombatActions()` consumes the active capability IDs produced by `deriveCreatureBiology()`.

The same path handles:

- base-animal capabilities such as a Pig's bite;
- splice-derived capabilities such as a Rabbit that functionally develops Lion-derived jaw/dentition;
- sensory actions;
- defensive anatomy;
- movement/repositioning capabilities;
- biochemical/electrical actions;
- regenerative actions;
- behavioural/control capabilities.

There are no species branches and no player/enemy branches in the action generator.

Actions can require more than one functional capability. For example, the prototype `Burst Lunge` requires both burst movement and high-output force. Passive/support capabilities may modify metrics without necessarily generating a direct action of their own.

There is deliberately no four-action slot. A creature exposes every currently legal action provided by its functional biology.

## Functional gate

An attempted source package never grants a combat action by itself.

R0.3 stores the actual expression result. Only expressions which passed the current functional-expression gate contribute capability IDs. Injury suppression/death can remove those active capability IDs without deleting the creature's irreversible history. WP0.4A therefore receives functional state rather than guessing from visible anatomy or splice intent.

This is also why WP0.4A does not independently decide whether wings, aquatic traits or similar anatomy qualify a creature for a Fit Pit environment. Final Land / Water / Air qualification remains WP0.4E.

## Automated acceptance coverage

`tests/combat-model.test.mjs` proves:

- Rabbit, Goat and Pig derive materially different metric profiles;
- all derived metric values remain bounded;
- Rabbit, Goat, Pig and a functionally electric-spliced Rabbit expose four distinct legal action sets;
- a creature can expose more than four legal actions;
- attempted but non-functional expression does not create an action;
- the same `offence.bite` capability produces the same Bite action whether it originates from base Pig biology or a functional Lion-derived splice on Rabbit;
- the combined capability/action content catalogue has no broken references.

## Save/schema impact

None.

Combat metrics and legal action sets are derived from already-persisted creature biology. WP0.4A adds no save field and requires no migration.

## Deliberate boundaries

WP0.4A does **not** resolve:

- turn ordering or initiative (`WP0.4B` / `C-OPEN-01`);
- stamina, cooldowns, recovery cadence or strongest-action-spam controls (`WP0.4B` / `C-OPEN-02`);
- training progression or learned techniques (`WP0.4C` / `C-OPEN-06`);
- combat status, persistent injury or pit danger (`WP0.4D` / `C-OPEN-03`);
- final Land / Water / Air qualification thresholds or environment mechanics (`WP0.4E` / `CR-OPEN-01`, `C-OPEN-05`);
- multi-creature bout rules (`WP0.4F` / `C-OPEN-04`);
- final damage, accuracy or balance coefficients.

No open decision is silently promoted to canon by this prototype.

## WP0.4A gate

The gate is satisfied when automated fixtures demonstrate at least four biologically different creatures with genuinely different legal action sets through the same biology-to-capability-to-action pipeline, while the existing repository quality gates remain green.
