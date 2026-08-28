# WP0.7B — RinoCow Disaster Cutscene

Status: Implemented

## Objective

Deliver the opening Master Lab disaster using the WP0.7A cutscene runtime so the player directly witnesses the event that removes Viktor and leaves them responsible for what comes next.

## Locked Story Outcome

- Dr Viktor Splicenstein is visibly present before the disaster.
- RinoCow breaches containment and is clearly the direct cause of Viktor's death.
- The event is blackly comic and stylised rather than realistically gory.
- The emergency gas fail-safe is a deliberate player-confirmed action.
- The gas kills RinoCow and the other unsealed apprentices/organisms after Viktor is already dead.
- The player survives and is explicitly left alone.
- The existing Pit booking remains active, creating the immediate pressure that follows the disaster.

## Implementation

- `src/cutscene/rinocowDisaster.ts`
  - owns the authored sequence, dialogue, flags and transition identifiers;
  - owns the three semantic WP0.7C dark-layer cue identifiers.
- `src/cutscene/rinocowDisasterRuntime.ts`
  - registers Viktor and RinoCow with the WP0.7A actor registry;
  - uses the shared camera hook for authored focus/release;
  - presents text-box dialogue and system notices;
  - stages containment breach, impact, gas haze, blackout and aftermath beats;
  - leaves a temporary visual aftermath hand-off for WP0.7D.
- `src/cutscene/rinocowDisasterBootstrap.ts`
  - loads WP0.7B during normal play;
  - keeps legacy `labTest=1` harnesses isolated unless `rinocowTest=1` is also supplied.
- `scripts/rinocow-disaster-smoke.mjs`
  - browser-validates scene lock, dialogue, authored corruption, flags, transitions and runtime cleanup.
- `tests/rinocow-disaster.test.mjs`
  - locks the required causal ordering and story contract.

## Story Flags

- `rinocow-containment-breach-started`
- `master-dead`
- `gas-released`
- `rinocow-dead`
- `other-apprentices-dead`
- `player-survived`
- `player-alone`
- `rinocow-disaster-complete`

## WP0.7C Dark-Layer Hand-off

The disaster now consumes the semantic story language established by WP0.7C rather than choosing raw corruption intensities directly:

- horn warning → `omen` / blink;
- Viktor death → `rupture` / rupture;
- lethal fail-safe confirmation → `consequence` / linger.

Containment breach and gas release retain their dedicated transition effects without additional stacked corruption. This keeps the dark layer meaningful and leaves the bright presentation dominant between story breaks.

## Acceptance Criteria

- RinoCow's charge occurs before `master-dead` is set.
- Gas release cannot occur until the player advances the explicit fail-safe confirmation.
- `rinocow-dead` and `other-apprentices-dead` occur only after gas release.
- Player movement is locked while the cutscene is active.
- Ambient corruption is suppressed during the authored sequence and restored afterwards.
- The scene emits exactly one semantic `omen`, `rupture` and `consequence` dark-layer cue.
- Camera and cutscene registrations are released after completion.
- The final state clearly communicates that the player survived and is now alone.
- No permanent Master Lab state conversion is introduced here.

## Scope Boundary / WP0.7D Hand-off

WP0.7B owns the disaster itself and the immediate visual aftermath only. WP0.7D remains responsible for converting the Master Lab into its persistent post-death gameplay state, removing Viktor from the native lab state, updating the objective chain, and routing the player onwards to the splice bench.

## Validation

Run:

- `npm run verify`
- `npm run smoke`
