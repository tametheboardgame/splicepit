# WP0.7A — Cutscene Runtime

## Scope

WP0.7A adds the reusable sequencing layer required by the authored RinoCow disaster work in WP0.7B–WP0.7D. It deliberately contains no RinoCow story scripting.

The runtime supports:

- player control lock and guaranteed release;
- camera focus and release hooks;
- scripted actor movement and facing hooks;
- timed or externally advanced dialogue cues;
- event flags and browser events;
- scene-transition hooks;
- authored corruption triggers through the shared WP0.6L corruption runtime;
- suppression of ambient corruption while authored cutscenes are active;
- cancellation and failure cleanup so input, camera and corruption state cannot be stranded.

## Runtime contract

Cutscenes are data-driven `CutsceneDefinition` objects containing ordered typed steps. The executor owns ordering and cleanup, while scene-specific movement, camera and presentation code is supplied through adapters/registrations.

`BrowserCutsceneRegistry` is the hand-off point for scene actors and the active camera. WP0.7B can register the player, Viktor and RinoCow without adding story-specific branches to the generic executor.

Browser dialogue, event-flag and transition hooks are exposed as DOM events. Dialogue may be timed or wait for explicit advancement.

## Control contract

The browser runtime installs a capture-level input gate for keyboard and semantic/mobile input while the cutscene owns player control. Dialogue advance remains available through Confirm/Interact while an untimed cue is waiting.

Control locking uses a reasoned gate rather than a single global boolean, so later systems can compose locks without accidentally releasing each other.

## Corruption contract

The cutscene runtime does not implement a second corruption renderer or scheduler.

At cutscene start it suppresses ambient corruption through WP0.6L. Authored `corruption` steps call the existing `triggerAuthored` hook, which is intentionally allowed through suppression. Normal ambient scheduling resumes during cleanup.

## Validation

WP0.7A adds:

- unit coverage for all sequencing primitives, cleanup, cancellation and composable control locks;
- a browser smoke proving live player input is blocked during a cutscene and restored afterwards;
- browser verification that event flags, transition events and authored corruption hooks fire through the integrated runtime.

The next package is **WP0.7B — RinoCow Disaster Cutscene**.
