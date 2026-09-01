# YSP-10 — Yard Scene-Image Human Gate Revision

Date: 1 September 2026
Status: REVISION IN PROGRESS — human review approved the scene-image direction and identified integration defects to correct before final approval

## Human review outcome

The authored Yard itself passed the important visual test: it reads substantially more like the intended SplicePit world, the overall look and feel is strongly preferred to the old board-like environment, and the bright/dark glitch language landed correctly.

This is **REVISE**, not architecture rejection.

The on-device review identified five concrete issues:

1. apprentice selection still used the legacy procedural Yard backing;
2. the initial Yard spawn sat too low, so mobile tutorial cards covered the protagonist;
3. a narrow collision seam beside the splice pit allowed the protagonist to descend into/over visually impossible pit geometry;
4. the foreground right-hand cryo/container stack behaved as one huge solid rectangle, preventing behind-object movement and depth;
5. the visible Master Lab tunnel did not behave like the actual route connection because wall collision covered the doorway while the route trigger sat below it.

## Revision contract

### Selection continuity

Apprentice selection now preloads and renders the exact approved Bright Yard image instead of the legacy procedural Yard. The same memoised Bright/foreground/Dark asset set is shared with the production Yard so selection does not introduce a duplicate full-size decode.

### Raised arrival spawn

Production Yard spawn moves from `(575, 660)` to `(575, 430)`. This keeps the protagonist in the authored central court but above the lower tutorial-card presentation on portrait mobile.

### Pit seam correction

The original collision layout left an approximately 50px vertical seam between pit-west machinery and the retaining wall. A new upper guard closes the visually impossible descent while preserving the deliberate horizontal approach corridor below it.

### Foreground container depth

The giant `cryo-container-stack` collider is removed. The physical lower container/base remains solid, while the upper visual stack becomes traversable behind-object space.

An exact approved-pixel foreground crop (`cryo-container-upper-stack`) redraws after the protagonist while their feet are behind its depth line, so the character can disappear naturally behind the foreground stack without repainting the scene.

### Master Lab tunnel connection

The north/east retaining-wall collision is split around the visible tunnel doorway. The exit footprint is moved into that carved doorway/threshold and continues to hand off to the existing `master-lab-route` entry.

The opening semantic anchor is moved with the visible doorway.

## Automated reproduction gate

`scripts/ysp10-human-gate-revision-smoke.mjs` reproduces the human findings in Chromium and must prove:

- apprentice selection has authored-scene visual complexity rather than the old flat backing;
- scene pack `yard-bright-scene-ysp10-r1` is active;
- spawn is at the raised authored location;
- attempting to descend through the old pit seam produces collision before entering the invalid area;
- the protagonist can physically move into the behind-container band and the exact-pixel cryo foreground occluder activates;
- completing onboarding and entering the visible Lab tunnel transitions to `master-lab-route`.

The full YSP-9 lifecycle/mobile suite remains in force. Its preload counters are updated only to account for the intentional earlier selection-stage request; total image decodes remain three for the page lifetime.

## Final YSP-10 decision

After this revision is green and deployed, human review should recheck the same mobile flow.

- **APPROVE:** scene-image Yard architecture is accepted and can be propagated to the weak Opening Route / Local Pit environments in subsequent work packages.
- **REVISE:** make another Yard-only correction.
- **REJECT ARCHITECTURE:** reassess without propagating scene-image conversion.

No Route or Local Pit scene-image conversion begins until explicit final approval.
