# RSP-8 — Route Mobile / Regression / Visual Acceptance

Date: 4 September 2026

Status: IN PROGRESS

PR: #93

## Purpose

Close the Opening Route propagation phase by validating the production-authored Route as a player-facing environment rather than reopening its architecture.

RSP-7 already established the production contract: authored Bright/Dark rasters, 3072 × 2049 world ownership, scene-owned collision/camera, semantic Yard/Lab/Pit transitions, creditor weighbridge staging and full automated integration. RSP-8 is therefore an acceptance package.

Production behaviour must remain frozen unless this acceptance pass exposes a genuine defect.

## Automated acceptance gate

RSP-8 adds `scripts/rsp8-route-visual-acceptance-smoke.mjs` to the normal browser suite.

The harness must prove:

- normal production is using `routeRenderer = scene-image`;
- `productionCutoverReady` is true with no cutover blockers or procedural fallback;
- the Route remains the locked 3072 × 2049 authored world;
- Bright and Dark assets are both decoded and available;
- Bright → Dark changes actual rendered pixels without moving the player;
- the protagonist remains safely inside the rendered viewport at representative Route positions;
- desktop Route entry, Master Lab approach, biosecurity weighbridge and Local Pit approach remain readable traversal beats;
- portrait and landscape mobile layouts contain the game canvas without horizontal overflow;
- visible mobile controls remain at least 44 × 44 CSS pixels;
- visible mobile controls do not obscure the protagonist at the review point;
- the existing full browser regression suite remains green after the acceptance harness is added.

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

The Route is accepted only if the review frames show all of the following:

- Bright Route feels continuous with the approved Apprentice Splicer Yard and Master Lab rather than like a separate board/map screen;
- the route, Lab approach, weighbridge and Pit-bound continuation read immediately without UI markers compensating for unclear environment art;
- Dark Route is recognisably the same physical place with no apparent geometry jump during corruption;
- Dark storytelling reads as localised contamination/biological wrongness rather than a generic night tint;
- the protagonist feels grounded into the scene at normal scale;
- foreground depth does not create bright seams, accidental opaque rectangles or implausible player clipping;
- portrait and landscape layouts retain enough environmental context around the player while keeping touch controls usable;
- no retired procedural Route scenery is visible beneath or around the authored scene.

## Revision boundary

If automated evidence fails, fix the concrete integration defect and rerun RSP-8.

If human review finds a visual-only problem, make the smallest visual/presentation correction that preserves RSP-7 architecture, semantic anchors, collision ownership and save/story contracts.

Do not reintroduce retired procedural coordinates, Old Toll geometry or broad foreground masks to solve a visual issue.

## Completion gate

RSP-8 can be marked complete only when:

- `verify` is green on the final PR head;
- the complete player-facing browser suite is green on the final PR head;
- the RSP-8 review artifact exists and contains the expected frames plus manifest;
- Bright/Dark visual delta and mobile containment checks pass;
- human visual review is recorded as ACCEPT, or any requested visual revision is completed and re-reviewed.

After RSP-8 acceptance, Phase 1 Opening Route Scene Propagation is closed and execution moves to LPSP-0, Local Pit Scene Contract / Fight-Space Audit.
