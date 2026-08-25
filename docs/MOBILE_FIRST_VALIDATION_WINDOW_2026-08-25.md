# SplicePit Mobile-First Validation Window

Status: **ACTIVE TEMPORARY DELIVERY RULE**

Effective: **25 August 2026 through 1 September 2026 inclusive**.

The user will only have mobile devices available for live review during this period. Player-facing development and validation must therefore treat mobile/touch behaviour as the primary review context while preserving existing desktop compatibility and automated coverage.

## Delivery rule for this window

For any player-facing UI, navigation, opening-flow, world-interaction or presentation work completed during this period:

1. Keep the existing desktop/typecheck/unit/build/browser gates. Mobile-first does not mean desktop regressions are acceptable.
2. Add or extend an automated mobile browser regression when the work changes something the player sees or interacts with.
3. Use a representative modern phone viewport around **412×915 CSS pixels**, mobile emulation and touch input as the minimum mobile gate.
4. Exercise the real player interaction path with touch/pointer events rather than only checking static layout or calling internal functions.
5. Check for horizontal overflow, inaccessible controls, keyboard-only blockers, hover-only behaviour, clipped text/art and touch targets that become impractical at phone scale.
6. Where the feature meaningfully differs on larger mobile devices, add a tablet-sized check as appropriate rather than redesigning purely for one phone resolution.
7. Preserve the game's locked **1280×720 internal presentation space** unless a roadmap package explicitly changes that contract. Mobile work should adapt presentation/input around that contract, not silently redefine it.
8. Merge completed green work to `main` under `docs/AUTONOMOUS_DELIVERY_POLICY.md`, then use the live Cloudflare build for human mobile review.

## Review priority

During this window, when desktop and mobile presentation choices compete and neither violates a locked design contract, prefer the option that gives the cleaner mobile/touch experience. Desktop should remain functional and tested, but the user's live visual/playtest feedback will come from mobile devices.

## Expiry

After **1 September 2026**, this temporary priority expires automatically. The mobile regressions added during the window should remain unless there is a concrete reason to remove them.
