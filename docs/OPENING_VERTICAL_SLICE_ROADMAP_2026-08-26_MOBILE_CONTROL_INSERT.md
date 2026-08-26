# SplicePit Opening Vertical Slice Roadmap — Mobile Control Insertion — 26 August 2026

## Authority

This document is an **authoritative dated insertion** into `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`.

Human review on 26 August 2026 established that mobile gameplay testing is blocked after character selection because the opening world currently requires keyboard input. Mobile testability is now a prerequisite for continuing location/content expansion.

Where this insertion changes the R0.6 sequence in the 25 August roadmap, **this newer dated insertion wins**. All other scope and sequencing in the 25 August roadmap remains unchanged.

## R0.6 sequence change

The opening R0.6 sequence is now:

1. `WP0.6A — Controls / Help Tutorial Framework` — complete;
2. `WP0.6B — Bag, Map and Objective Shells` — complete;
3. `WP0.6C — Opening Objective Sequence` — complete;
4. `WP0.6D — Authored Opening Route` — complete;
5. **`WP0.6D1 — Mobile Gameplay Controls` — inserted prerequisite;**
6. `WP0.6E — Master Lab Interior`;
7. `WP0.6F — Local Pit Exterior / Interior Foundation`;
8. `Graphics Tightening Pass B — Yard / Route / Lab / Pit`.

Do not begin WP0.6E until WP0.6D1 is merged and the touch-only mobile regression gate is green.

## WP0.6D1 — Mobile Gameplay Controls

### Goal

Make the current opening world genuinely testable on a phone without creating a separate mobile gameplay implementation.

### Build

- add a touch/coarse-pointer gameplay control surface;
- directional movement controls on the lower-left;
- a large contextual `Action` control on the lower-right;
- a `Back` control;
- compact `Bag` and `Map` controls;
- use the existing semantic action layer rather than wiring touch directly into Yard movement/gameplay logic;
- preserve shared physical-control semantics, so one touch `Action` can resolve to Interact / Confirm / Lab Interact as appropriate, matching the existing keyboard binding model;
- preserve multi-touch so movement can remain held while Action is pressed;
- respect phone safe areas and prevent browser scrolling/gesture interference while operating gameplay controls;
- hide gameplay controls during title/menu/dialogue/character-selection states and on ordinary desktop pointer devices;
- make tutorial hints device-aware so touch players see touch-control labels rather than keyboard keys;
- reserve touch bindings for later Menu, splice and battle actions without prematurely designing their final control surfaces.

### Deliberate scope boundary

WP0.6D1 does **not** design the final battle or splice touch UI. Those systems do not yet have their final opening interactions and should plug into this same semantic touch layer when implemented.

It also does not create a new in-world pause/menu system merely to make a currently unused `MENU` semantic action visible. The touch binding is reserved now; the visible control should appear when a real gameplay menu consumer exists.

### Gate

At a `412 × 915` phone-sized viewport, using touch input only, the player must be able to:

- accept a character at the in-world character selection;
- enter the Apprentice Yard;
- complete movement onboarding;
- complete Interact / Bag / Confirm / Back / Map onboarding;
- hold movement while separately pressing Action;
- reach the Master's Lab staging area through the authored WP0.6D route;
- do so without horizontal page overflow or requiring keyboard input.

This regression becomes part of the normal player-facing browser smoke gate.

## Next package after this insertion

`WP0.6E — Master Lab Interior`
