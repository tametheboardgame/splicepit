# WP0.6F — Local Pit Exterior / Interior Foundation

Status: implementation package

## Authority

This package implements `WP0.6F — Local Pit Exterior / Interior Foundation` from `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`.

The package owns the physical venue foundation required for the first local Pit sequence. It deliberately stops before R0.7 story scripting, R0.8 splice mechanics and R0.9 battle mechanics.

## Delivered foundation

### Arrival and exterior

- extends the WP0.6D Local Pit road hand-off into a playable destination;
- provides an exterior arrival path, venue gate and readable fight-venue identity;
- keeps a clear return interaction back to the opening Yard/world route;
- preserves the established 1280 × 720 gameplay/camera scale and approved protagonist scale.

### Reception and prep concourse

The interior provides stable authored staging for:

- reception / registration;
- fight-slot introduction;
- creature weigh / prep;
- holding and decontamination props;
- environmental storytelling appropriate to the bright/amoral SplicePit tone.

### First-fight foundation

The venue contains explicit staging points for:

- arena approach;
- arena gate;
- tutorial battle floor;
- results / payout desk after the fight.

These are geometry/runtime contracts for later packages. WP0.6F does not implement battle turns, opponents, victory/loss logic, rewards or tutorial prompts owned by R0.9.

## Runtime contract

`src/localPitRuntime.ts` provides the same basic playable-world contract already established by the Yard and Master Lab:

- selected protagonist identity and 64 × 96 directional sprites;
- four-direction movement;
- feet-based collision;
- hold-to-run using the shared semantic RUN action;
- camera follow at the locked 1280 × 720 view;
- keyboard and mobile semantic input support;
- Bag / Map shell continuity;
- explicit Yard → Pit and Pit → Yard transitions;
- debug state for permanent browser regression coverage.

The Local Pit is rendered as its own world overlay so later battle/cutscene work can change presentation without coupling arena logic to Yard geometry. The runtime is loaded before the main boot module, matching the Master Lab overlay integration order so its capture-phase input listener is available as soon as gameplay becomes active.

## Authored stage contract

The following stage identifiers are stable hand-off points for later packages:

- `arrival-gate`
- `reception`
- `prep-bay`
- `arena-gate`
- `tutorial-battle-floor`
- `result-desk`

Later work should attach sequence logic to these authored points rather than rediscovering screen coordinates ad hoc.

## Venue naming note

`The Bramble Pit` is the current authored local-venue label used to give this environment identity and readable signage. It is not intended to lock the final canon name; a later content-polish decision may rename the venue without changing the WP0.6F geometry or stage contract.

## Explicitly deferred

WP0.6F does not add:

- receptionist NPC dialogue or final reception flow;
- debt-collector scripting;
- Master/RinoCow aftermath progression;
- splice tutorial mechanics;
- a functioning battle system;
- tutorial opponent AI;
- win/loss result logic;
- rewards, payouts or economy changes;
- save/checkpoint changes;
- the R0.6 Graphics Tightening Pass B.

## Validation

Automated coverage must prove:

- world/view dimensions remain compatible with the established game scale;
- arrival, reception, prep, arena and result staging points are present;
- critical paths between those staging points remain walkable;
- arena rails / venue walls retain collision while the battle floor remains usable;
- the Yard hand-off zones are explicit;
- the production browser can enter the Pit, render the authored exterior/interior, retain Bag/Map behaviour, walk from exterior arrival to reception, return to the exit and hand control back to the Yard.

CI remains authoritative for typecheck, content/RNG validation, unit/domain/save regressions, production build and the complete player-facing browser smoke suite.
