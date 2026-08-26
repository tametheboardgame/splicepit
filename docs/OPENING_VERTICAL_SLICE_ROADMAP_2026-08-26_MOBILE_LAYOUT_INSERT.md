# SplicePit Opening Vertical Slice Roadmap — Mobile Layout Insertion — 26 August 2026

## Authority

This document is an **authoritative dated insertion** into `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` and follows the earlier mobile-control insertion in `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-26_MOBILE_CONTROL_INSERT.md`.

Human mobile review on 26 August 2026 confirmed that WP0.6D1 controls work well, but exposed a second testing blocker: canvas-anchored objective/tutorial text becomes undersized or misaligned in portrait and can be obscured by the touch controls in landscape. Display comfort and full-screen access are also useful before story-heavy packages expand.

Where this insertion changes the R0.6 sequence, **this newer dated insertion wins**. All other scope remains unchanged.

## R0.6 sequence change

The opening R0.6 sequence is now:

1. `WP0.6A — Controls / Help Tutorial Framework` — complete;
2. `WP0.6B — Bag, Map and Objective Shells` — complete;
3. `WP0.6C — Opening Objective Sequence` — complete;
4. `WP0.6D — Authored Opening Route` — complete;
5. `WP0.6D1 — Mobile Gameplay Controls` — complete;
6. **`WP0.6D2 — Mobile Text Layout & Display Comfort` — inserted prerequisite;**
7. `WP0.6E — Master Lab Interior`;
8. `WP0.6F — Local Pit Exterior / Interior Foundation`;
9. `Graphics Tightening Pass B — Yard / Route / Lab / Pit`.

Do not begin WP0.6E until WP0.6D2 is merged and its portrait/landscape mobile regression is green.

## WP0.6D2 — Mobile Text Layout & Display Comfort

### Goal

Keep opening text readable and testable on real phones in both portrait and landscape without changing the accepted 1280 × 720 world/camera contract.

### Build

- move mobile objective/tutorial presentation out of the scaled gameplay canvas into a responsive DOM HUD;
- preserve the existing canvas HUD on keyboard/desktop devices;
- anchor objective text to phone safe areas rather than fixed 1280 × 720 coordinates;
- keep tutorial/field-note text clear of the D-pad and Action/Back/Bag/Map controls;
- use separate portrait and landscape placement rules rather than scaling one layout blindly;
- preserve touch tutorial labels and fade/completion behaviour;
- hide the compact objective card while Bag/Map shells are open where appropriate;
- add a persistent `Dim Screen` display-comfort toggle;
- add a user-gesture `Full Screen` control where the browser supports the Fullscreen API, allowing browser chrome to be reduced during play;
- keep both display controls inside the existing Settings screen rather than creating another gameplay menu system prematurely.

### Deliberate scope boundary

WP0.6D2 does not redesign the full Bag/Map presentation or future story-dialogue system. It fixes the currently observed mobile HUD blockers and establishes the responsive pattern future mobile text surfaces should follow.

It also does not make full-screen state persistent across browser sessions, because browsers require a fresh user gesture to enter full screen.

### Gate

At `412 × 915` portrait and `915 × 412` landscape touch viewports:

- objective text remains fully inside the viewport and readable;
- tutorial text remains visible and readable;
- objective/tutorial cards do not overlap the touch-control clusters;
- no horizontal page overflow is introduced;
- desktop canvas HUD behaviour remains unchanged;
- `Dim Screen` can be toggled and persists across reload;
- Settings exposes Full Screen when the browser supports it;
- the existing WP0.6D1 touch-only gameplay regression continues to pass.

## Next package after this insertion

`WP0.6E — Master Lab Interior`
