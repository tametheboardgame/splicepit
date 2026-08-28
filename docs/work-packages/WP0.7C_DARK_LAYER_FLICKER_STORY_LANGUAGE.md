# WP0.7C — Dark-Layer Flicker Story Language

Status: Implemented

## Objective

Turn the title-screen corruption language into a reusable authored story device for in-world scenes, while keeping the bright layer dominant and preventing cutscenes from becoming a continuous glitch effect.

WP0.6L already owns random ambient corruption and the shared bright/dark environment transition architecture. WP0.7C adds the semantic authored layer on top of that system rather than introducing another renderer or scheduler.

## Shared Visual Language

`src/render/darkLayerFlicker.ts` owns the reusable base corruption overlay first established on the title screen:

- dark veil;
- displaced horizontal glitch bands;
- restrained red fault bands;
- scan-line breakup;
- deterministic seeded movement.

The title screen continues to add its own front-door polish after the shared pass. In-world corruption combines the same shared pass with displaced samples of the active environment canvas, so the actual authored dark environment remains the reveal rather than being replaced by generic noise.

## Semantic Story Roles

Authored cutscenes no longer select raw visual intensity directly. A corruption step must have a unique `cueId` and one of three roles:

- `omen` → `blink`, 360 ms. A warning or brief contradiction before the event is understood.
- `rupture` → `rupture`, 760 ms. A decisive reveal attached to a major causal story beat.
- `consequence` → `linger`, 1320 ms. A longer look reserved for the meaning or consequence of an irreversible choice/event.

The browser cutscene adapter holds each cue for its mapped duration before advancing the authored sequence. This gives the dark layer time to read and prevents the following effect from immediately overwriting it.

## Anti-Noise Contract

`validateDarkLayerStorySequence()` is enforced by the shared cutscene runtime.

Current rules are:

- maximum three authored dark-layer cues in one scene;
- every cue requires a semantic role and unique id;
- at least two ordinary authored steps must separate dark-layer cues;
- a dark-layer cue may not sit immediately beside a transition effect;
- ambient corruption remains suppressed while authored cutscenes run;
- authored story cues deliberately override ordinary visual suppression;
- the bright layer must recover between authored cues.

These values are presentation rules, not story canon. If a later scene genuinely needs a different grammar, the shared contract should be deliberately revised rather than bypassed with local effects.

## RinoCow Application

The WP0.7B disaster now uses exactly three authored cues:

1. `rinocow-horn-omen` (`omen`) after Viktor's horn warning.
2. `rinocow-master-death` (`rupture`) when Viktor has been killed by RinoCow.
3. `rinocow-gas-choice` (`consequence`) after the player confirms the lethal fail-safe warning and before gas release.

The previous extra corruption around containment breach and gas presentation has been removed. Those beats already have strong dedicated transition effects, so adding another dark-layer interruption there weakened the story language rather than strengthening it.

## Runtime / Debug Contract

`globalThis.__SPLICEPIT_CORRUPTION__` retains the WP0.6L low-level controls and adds:

- `triggerStory({ cueId, role }, location?)` for semantic authored use;
- `state.storyCueId` for the active authored story cue;
- `state.storyRole` for its active semantic role.

`triggerAuthored(location?, intensity?)` remains available as the lower-level deterministic presentation hook for debugging and non-cutscene infrastructure, but story cutscenes should use the semantic cutscene primitive.

## Gameplay Invariants

Dark-layer flicker remains presentation only. WP0.7C does not alter collision, player position, objectives, inventory, save data, battle state, environment topology or disaster story flags.

## Acceptance Criteria

- Title and in-world corruption share the same base flicker renderer.
- Cutscene corruption is authored through semantic roles rather than raw intensity.
- The shared runtime rejects visually noisy authored sequences that violate the contract.
- Ambient corruption remains suppressed during authored cutscenes.
- Authored story cues can still show through ordinary suppression.
- RinoCow presents omen → rupture → consequence exactly once each.
- The gas and containment transition effects are not redundantly stacked with extra corruption cues.
- Existing WP0.7B causal story ordering remains locked.
- Full repository verify and browser smoke gates are green.

## Hand-off

WP0.7D can now treat the dark-layer flicker as established story vocabulary and focus on the persistent post-death Master Lab state rather than inventing another corruption effect.
