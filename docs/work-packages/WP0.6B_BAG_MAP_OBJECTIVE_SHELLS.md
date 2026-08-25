# WP0.6B — Bag, Map and Objective Shells

Status: IMPLEMENTED ON PACKAGE BRANCH

## Scope

WP0.6B implements only the opening-slice shell behaviour required by the authoritative 25 August opening roadmap.

It adds:

- a Bag shell opened and closed through the semantic `BAG` action (`B` on the current keyboard profile);
- a deliberately small opening inventory representation;
- a Map shell opened and closed through the semantic `MAP` action (`M` on the current keyboard profile);
- a compact always-visible current-objective tracker in the Apprentice Splicer Yard;
- the current objective inside the Map shell;
- a reusable two-step runtime objective controller that WP0.6C can author against;
- `Escape` precedence that closes an open Bag/Map shell before leaving the Yard runtime.

Bag and Map are mutually exclusive. Opening one while the other is open switches directly to the requested shell. Toggling the currently open shell closes it.

## Opening inventory

The opening inventory is intentionally tiny:

- Apprentice Kit ×1;
- Empty Sample Vials ×3.

These entries are presentation/state scaffolding only. WP0.6B does not introduce item consumption, stacking rules, equipment mechanics, currencies, shops, crafting, encumbrance or the future biological material economy.

## Objective state

The runtime controller currently contains the minimum opening progression skeleton:

1. `yard-orientation` — Get your bearings;
2. `find-master` — Find your Master.

The controller supports current-objective lookup, direct objective selection and forward progression. WP0.6C owns the authored onboarding sequence and the exact story/tutorial triggers that move between these states.

Objective progress is not persisted yet. That remains aligned with the roadmap's R0.10 save/checkpoint work.

## Map scope

The Map is an opening-route shell, not the final world map. It renders:

- the Apprentice Splicer Yard as a simple readable schematic;
- the player's current relative position;
- the current objective.

New locations and route detail are added only when the opening slice reaches them. WP0.6D owns the authored connected route to the Master/Lab and local Pit.

## Validation

Automated coverage includes:

- unit tests for shell toggling, inventory shape and objective progression;
- browser smoke proving Bag and Map open in the real Yard runtime;
- Map carries the current objective;
- `Escape` closes the shell without leaving the Yard;
- the Bag shell visibly renders on the production canvas.

## Explicit deferrals

WP0.6B does not build:

- the complete inventory/economy system;
- full world-map discovery/fast travel;
- authored onboarding progression triggers (WP0.6C);
- connected world expansion (WP0.6D);
- save-schema changes or persisted objective/tutorial state (R0.10).

Save/schema impact: none.
