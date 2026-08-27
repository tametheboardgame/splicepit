# WP0.6L — Ambient World Corruption / Random Dark-Layer Glitches

## Status

Implementation package for Graphics Tightening Pass B.

This package sits on top of the shared WP0.6G environment visual contract and the authored bright/dark production art delivered by WP0.6H through WP0.6K. It does not create a second dark-world renderer.

## Runtime behaviour

During ordinary exploration of the Yard, opening route, Master Lab and Local Pit, the runtime schedules occasional low-frequency corruption events.

Current implementation-tunable feel values are:

- 22–52 seconds between eligible ambient events;
- `blink`: 360 ms;
- `rupture`: 760 ms;
- `linger`: 1320 ms;
- 12-second recovery buffer after a suppressed/cancelled ambient event.

The exact values are not story canon. They exist to keep the bright world dominant while making the dark layer unpredictable and occasionally readable.

Each event drives the actual authored dark state for the active location through `EnvironmentVisualController`. Screen slices, scan corruption and restrained rupture tint are transition language only, never a substitute for the location-specific dark artwork.

## Suppression and anti-spam rules

Ambient events do not accumulate while the player is outside active exploration. The scheduler resets on location changes and does not fire through unrelated forced visual states or another active authored transition.

Ambient corruption is suppressed during:

- opening dialogue;
- Bag/Map opening shells;
- any future runtime that calls the explicit corruption suppression API.

If suppression begins during an ambient event, the event is cancelled, the environment recovers to bright, and the scheduler applies a recovery buffer before another ambient event can occur.

## Story trigger API

`globalThis.__SPLICEPIT_CORRUPTION__` exposes deterministic runtime hooks for tests and later story packages:

- `forceAmbient(location?, intensity?)` forces the normal ambient presentation contract;
- `triggerAuthored(location?, intensity?)` starts a deliberate story-owned corruption event;
- `suppress(reason?)` / `resume(reason?)` manage external suppression;
- `setEnabled(enabled)` disables or enables ambient scheduling;
- `reschedule()` restarts the ambient timer.

An authored trigger can intentionally render through ordinary suppression. This is required so WP0.7C and later cutscenes can own exact corruption timing without duplicating the scheduler or bright/dark environment architecture.

## Gameplay invariants

Corruption remains visual presentation only. It must not alter:

- player position or movement state;
- collision geometry;
- environment topology or hand-off zones;
- objectives;
- inventory;
- save data;
- battle state or future story flags.

## Validation

Unit coverage makes scheduling, intensity selection, suppression, location reset and authored suppression override deterministic.

The WP0.6L browser gate forces corruption in all four completed opening environments and verifies:

- the correct authored dark location becomes visible;
- transition corruption is present without replacing the authored dark art;
- gameplay state remains unchanged;
- recovery returns cleanly to bright;
- Bag suppression cancels an ambient event;
- the route is reached through the accepted traversal path rather than a test teleport;
- the future authored trigger can deliberately override suppression.

## Hand-off

WP0.6L completes the reusable ambient corruption runtime brought forward from the old WP0.7C scope.

The next package is **WP0.6M — Cross-Location Consistency / Production-Art Integration Gate**, which owns the final opening visual integration and Pass B sign-off before WP0.7A.
