# WP0.6A — Controls / Help Tutorial Framework

Status: **IMPLEMENTED**

Authority: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`

## Goal

Provide a reusable contextual tutorial/help framework for the opening world without pausing play or introducing modal tutorial spam.

## Implemented scope

- reusable tutorial prompt definitions and controller state;
- semantic control hints resolved from the shared binding profile rather than hard-coded physical keys;
- opening prompt hooks for:
  - movement;
  - interact;
  - confirm/cancel;
  - Bag;
  - Map;
  - later splice tutorial guidance;
  - later battle tutorial guidance;
- automatic completion modes for action-driven prompts plus manual completion for authored sequences;
- compact in-world `FIELD NOTE` prompt renderer that sits over the world without taking control away from the player;
- first real integration in the Apprentice Splicer Yard, where the movement prompt appears on entry and fades after the player moves;
- Bag semantic action on `B`;
- Map semantic action on `M`;
- generic menu semantic action retained on `Tab`, avoiding overlapping `M` semantics.

## Deliberately deferred

WP0.6A does not author the full onboarding sequence and does not implement Bag, Map or objective screens.

- WP0.6B owns the Bag, Map and objective shells.
- WP0.6C owns the authored opening tutorial/objective sequence.
- R0.8 and R0.9 will consume the existing splice and battle tutorial hooks when those real mechanics enter the opening slice.

## Validation

Automated coverage includes:

- unit coverage for prompt catalogue, semantic hints, completion/fade behaviour, manual future hooks and reset behaviour;
- browser smoke proving the Yard prompt visibly renders, world movement remains active while it is shown, real movement completes it, it fades cleanly, and no modal tutorial DOM is introduced;
- the tutorial smoke is part of the normal `npm run smoke` gate.

The normal repository CI remains the merge gate for this implementation.

## Save/schema impact

None. Tutorial persistence across browser reloads is deliberately deferred with the wider opening-slice save/checkpoint work in R0.10.
