# RSP-8 — Route Mobile / Regression / Visual Acceptance

Date: 4 September 2026

Status: COMPLETE ✓

PR: #93

## Purpose

Close the Opening Route propagation phase by validating the production-authored Route as a player-facing environment rather than reopening its architecture.

RSP-7 already established the production contract: authored Bright/Dark rasters, 3072 × 2049 world ownership, scene-owned collision/camera, semantic Yard/Lab/Pit transitions, creditor weighbridge staging and full automated integration. RSP-8 is therefore an acceptance package.

Production behaviour remained frozen except for the visual-only portrait presentation correction justified by the acceptance evidence.

## Automated acceptance gate

RSP-8 adds `scripts/rsp8-route-visual-acceptance-smoke.mjs` to the normal browser suite.

The harness proves:

- normal production is using `routeRenderer = scene-image`;
- `productionCutoverReady` is true with no cutover blockers or procedural fallback;
- the Route remains the locked 3072 × 2049 authored world;
- Bright and Dark assets are both decoded and available;
- Bright → Dark changes actual rendered pixels without moving the player;
- the protagonist remains safely inside the rendered viewport at representative Route positions;
- desktop Route entry, Master Lab approach, biosecurity weighbridge and Local Pit approach remain readable traversal beats;
- portrait and landscape mobile layouts avoid horizontal page overflow;
- visible mobile controls remain at least 44 × 44 CSS pixels;
- visible mobile controls do not obscure the protagonist at the review point;
- the existing full browser regression suite remains green.

## Human-review artifact

Each RSP-8 CI browser run emits `rsp8-route-visual-acceptance-<sha>` containing PNG review frames plus `manifest.json`.

Required review frames:

1. `desktop-route-entry-bright.png`
2. `desktop-route-entry-dark.png`
3. `desktop-lab-approach-bright.png`
4. `desktop-weighbridge-bright.png`
5. `mobile-portrait-weighbridge-bright.png`
6. `mobile-portrait-weighbridge-dark.png`
7. `mobile-landscape-weighbridge-bright.png`
8. `mobile-landscape-weighbridge-dark.png`
9. `desktop-pit-approach-bright.png`

The manifest records Route scene identity, world dimensions, Dark asset SHA, sampled Bright/Dark pixel delta, viewport geometry, player projection and visible touch-control geometry for every capture.

CI uploads the artifact with `if: always()` so partial evidence remains available if a later smoke fails.

## Human visual acceptance criteria

The Route was reviewed against the following criteria:

- Bright Route feels continuous with the approved Apprentice Splicer Yard and Master Lab rather than like a separate board/map screen;
- the route, Lab approach, weighbridge and Pit-bound continuation read immediately without UI markers compensating for unclear environment art;
- Dark Route is recognisably the same physical place with no apparent geometry jump during corruption;
- Dark storytelling reads as localised contamination/biological wrongness rather than a generic night tint;
- the protagonist feels grounded into the scene at normal scale;
- foreground depth does not create bright seams, accidental opaque rectangles or implausible player clipping;
- portrait and landscape layouts retain enough environmental context around the player while keeping touch controls usable;
- no retired procedural Route scenery is visible beneath or around the authored scene.

## Visual revision completed during RSP-8

The first review artifact found one visual-only defect: portrait mobile technically worked but compressed the Route into a narrow 16:9 strip with excessive empty space.

RSP-8 corrected that without changing production geometry or gameplay:

- portrait Route presentation is now scoped only to active authored Route gameplay;
- the internal 16:9 render remains undistorted;
- a contained `object-fit: cover` presentation uses a 412 × 457.5 CSS-pixel Route viewport on the 412 × 915 reference device;
- Bright/Dark and Route-time overlay layers stay aligned to the same presentation frame;
- Yard, character selection, Master Lab and Local Pit presentation are unchanged;
- touch controls remain clear of the protagonist and the page does not horizontally overflow.

## Final automated evidence

Accepted implementation head before this closure commit:

- commit: `f5f3046177d742455a53d9f18e5e3cafd4df8500`;
- workflow: GitHub Actions run #1350;
- `verify`: PASS;
- `browser-smoke`: PASS on rerun of the exact unchanged head;
- 9/9 RSP-8 visual captures produced;
- rerun artifact ID: `9965275789`;
- sampled Bright → Dark pixel change: 29,297 / 33,345 = 87.86%;
- portrait Route viewport: 412 × 457.5 CSS px;
- visible touch controls covering protagonist: 0.

The first browser attempt ended later in unrelated WP0.7D Master Lab movement with a sub-nudge target miss. The RSP-8 capture had already passed on that attempt, and the full unchanged browser suite passed on rerun, confirming that failure was transient rather than caused by RSP-8.

## Human acceptance record

Decision: **ACCEPT**

Date: **5 September 2026**

The final Bright/Dark desktop, portrait and landscape review evidence was accepted with the portrait presentation revision in place.

## Completion gate

All RSP-8 completion conditions are satisfied:

- `verify` is green on the accepted implementation head;
- the complete player-facing browser suite is green on the accepted implementation head;
- the RSP-8 review artifact exists and contains the expected frames plus manifest;
- Bright/Dark visual delta and mobile presentation checks pass;
- human visual review is recorded as ACCEPT.

Phase 1 Opening Route Scene Propagation is closed. Execution moves to LPSP-0, Local Pit Scene Contract / Fight-Space Audit.
