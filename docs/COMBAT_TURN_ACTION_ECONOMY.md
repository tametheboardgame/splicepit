# WP0.4B Combat Turn Structure and Action Economy

Status: **CANDIDATE — human playtest gate pending**.

This document records the WP0.4B prototype comparison and the candidate combat cadence. It does **not** lock `C-OPEN-01` or `C-OPEN-02` until the browser playtest is deliberately accepted.

## Purpose

WP0.4B must make Fit Pit combat turn-based, readable and tactical without collapsing back to a fixed move-slot system or allowing the player to press the strongest available body-part action every round.

The model consumes the biology-derived combat profile established by WP0.4A. It does not alter creature biology, persistence, training, injury, arena qualification or final damage balance.

## Cadence variants compared

### 1. Fixed alternating turns

Each side acts in a fixed order.

Advantages:

- extremely readable;
- minimal presentation burden;
- simple reactions and interruption rules.

Problems found:

- fast or perceptive biology has little influence on when an action resolves;
- a permanently fixed first actor becomes strategically important in a way that is detached from the creature;
- later multi-creature bouts require increasingly arbitrary side-order rules.

Conclusion: useful baseline, but it underuses the biological combat metrics created in WP0.4A.

### 2. Initiative rounds — candidate

Each living creature commits one action for the round. The declarations are then ordered by action speed plus the acting creature's current biology and setup state. Resolution is sequential and fully logged.

Advantages:

- preserves a clear one-decision-per-creature round rhythm;
- lets fast defensive, sensing or mobility actions plausibly resolve before slower committed attacks;
- makes mobility/perception matter without turning the battle into real-time timing;
- reactions, guards, defeat-before-action and later team formats remain explainable;
- scales naturally from 1v1 to several declarations in a round.

Conclusion: strongest candidate for the intended combination of readability, biology and later multi-creature architecture.

### 3. True simultaneous declaration/resolution

Both sides commit without knowing the opponent's choice and effects are treated as simultaneous.

Advantages:

- strong commitment/read-the-opponent mind-game;
- avoids a simple first-mover advantage.

Problems found:

- true simultaneous damage, guards, interruptions, recovery and defeat are considerably harder to explain;
- biological speed becomes less meaningful unless a second ordering layer is reintroduced;
- later 2v2/3v1 cases create a large number of simultaneous-state edge cases.

Conclusion: interesting as a special bout rule later, but too opaque as the baseline cadence.

## Candidate round sequence

1. Both living creatures choose one currently legal action.
2. Legality is checked against functional biology, metabolic reserve, cooldown and any setup requirement.
3. Initiative is calculated from the action's speed modifier plus Mobility, Perception and current setup.
4. Declarations are resolved in deterministic initiative order. Exact ties use stable combatant ID order.
5. A creature defeated before its declaration resolves loses that declaration.
6. Surviving creatures receive passive metabolic recovery.
7. Cooldowns, reserve, setup and the ordered event log are shown for the next decision.

The current initiative coefficients are **PROTOTYPE / TUNABLE**:

`action speed + (Mobility × 0.45) + (Perception × 0.25) + (setup × 5)`

They exist to test cadence, not to establish final balance.

## Action economy

### Metabolic reserve

Every action has a metabolic cost. The maximum reserve is derived from the creature's WP0.4A Metabolic Capacity. A small amount returns after each round.

The player can always choose **Recover Breath**. This restores a larger amount of reserve and grants one setup point, but gives up offensive pressure for that round.

### Cooldowns / recovery time

Ordinary actions can be used repeatedly when their biology and reserve support it. More committed actions carry explicit recovery windows.

Prototype examples:

- Burst Lunge: high reserve cost, two-round cooldown, requires setup;
- Impact Charge: high reserve cost, two-round cooldown, requires setup;
- Electrical Discharge: high reserve cost, two-round cooldown;
- Ram / Body Drive / Horn Strike: moderate reserve cost and short recovery;
- active wound repair/regrowth: meaningful reserve cost and recovery time.

This prevents a high-output biological capability from becoming a generic every-round button while preserving it as a powerful part of the creature.

### Setup

`setup` is a prototype battle-facing representation of having useful footing, angle, target information or readiness. It ranges from 0–2.

Mobility, defence, sensing, concealment and control actions can create setup. High-commitment actions may consume it.

The exact final presentation term is not locked by WP0.4B. The mechanic is being tested because it turns utility biology into preparation for stronger actions rather than making non-damage actions dead buttons.

## Determinism

`resolveCombatRound()` receives an injected `RandomFn`; it never calls `Math.random()`.

With the same:

- combat state;
- declarations;
- cadence;
- seed / RNG state;

the resulting declaration order, hit/miss rolls, damage, reserve changes, cooldown state and human-readable event log reproduce exactly.

## Human-readable event stream

The combat core emits ordered events rather than presentation text being inferred from mutated state. The current event vocabulary includes:

- round start/end;
- action declaration/resolution;
- miss;
- damage;
- guard;
- setup;
- recovery;
- defeat.

The Phaser scene renders this event stream, but the domain model has no Phaser dependency.

## Automated acceptance evidence

`tests/combat-turn.test.mjs` proves:

- all three cadence candidates are explicitly represented in the comparison;
- initiative rounds allow action speed and creature biology to change order relative to fixed alternation;
- Burst Lunge cannot be used from neutral state, requires setup, consumes reserve and then enters cooldown;
- lower-cost setup and recovery choices remain available after the burst;
- identical state + declarations + seed reproduce the exact same combat state and log;
- emitted round events form a stable, ordered, human-readable transcript.

The repository's normal typecheck, content validation, RNG boundary, unit/domain/save tests, production build and browser smoke remain merge gates.

## Browser human-playtest gate

The branch includes an isolated playtest route:

`?combatPlaytest=1&seed=wp04b-playtest`

It does not replace the current R0.1 Fit Pit compatibility battle.

The fixture deliberately uses a functionally spliced Rabbit with more than four legal actions against a Goat. It is intended to make the cadence/economy visible quickly rather than test final balance.

The human gate should answer:

1. Is “choose once, then initiative resolves the round” immediately understandable?
2. Does the order of fast defence/setup versus slower attacks feel biologically plausible rather than arbitrary?
3. Do reserve and cooldowns stop strongest-action spam without creating annoying bookkeeping?
4. Does using a utility/setup action before a committed burst feel like a tactical choice rather than a compulsory tax?
5. Is Recover Breath a meaningful pressure-release option rather than an obvious default?
6. Does the event log make it clear why the round happened in the order it did?

## Decision gate

If the human playtest answers the above positively, WP0.4B should:

- lock `C-OPEN-01` as **initiative rounds with one declaration per active creature and deterministic action-speed/biology ordering**;
- lock `C-OPEN-02` as **metabolic reserve + action recovery/cooldown + limited setup requirements, with a universal voluntary recovery action**;
- retain exact coefficients, individual action costs and final UI terminology as tunable balance/presentation data.

If the cadence is not readable or the action economy feels procedural rather than tactical, the candidate remains provisional and the relevant part is revised before the decision log changes.

## Deliberate boundaries

WP0.4B does **not** lock:

- training progression (`WP0.4C`);
- persistent injury/death rules (`WP0.4D`);
- Land / Water / Air thresholds or environment positioning (`WP0.4E`);
- switching/team/asymmetric bout rules (`WP0.4F`);
- opponent AI strategy (`WP0.4G`);
- final damage, accuracy, reserve, cooldown or initiative coefficients (`WP0.4H` tuning);
- final name/visual treatment of the prototype `setup` state.

## Save/schema impact

None.

The WP0.4B combat state is encounter-local. Persisted creature biology remains the source of truth from which combat profiles are derived.
