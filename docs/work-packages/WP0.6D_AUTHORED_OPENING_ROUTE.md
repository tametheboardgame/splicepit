# WP0.6D — Yard → Lab → Pit Route

Status: **IMPLEMENTED**

Authoritative parent: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`

Sequencing addendum: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-26_MOBILE_CONTROL_INSERT.md`

## Goal

Turn the WP0.6C `find-master` hand-off into a real connected opening world: the player can leave the Apprentice Splicer Yard, follow a readable route to the Master's lab, pass a deliberately reserved future creditor-encounter location, and continue towards the local Pit.

## Delivered world route

WP0.6D keeps the existing Yard as the opening anchor and extends the same continuous walkable canvas world rather than introducing a loading seam.

The authored route is:

1. Apprentice Splicer Yard;
2. east across the existing stream bridge;
3. signed approach to the Master's lab;
4. Master's lab exterior and entrance staging area;
5. south through the Old Toll lay-by reserved for the later debt-collector encounter;
6. onward to the signed local Pit road;
7. a deliberate hard boundary before the Pit itself.

The Master's lab exterior is present so the WP0.6C objective has a visible destination, but its interior remains deferred to WP0.6E.

The local Pit is signposted and spatially established, but its exterior/interior foundation remains deferred to WP0.6F.

## Encounter staging

The Old Toll lay-by is intentionally authored as a broad, readable roadside space on the Lab-to-Pit route. It provides room for the later creditor encounter without introducing the creditor NPCs, dialogue, combat or cutscene logic in this package.

## Route contract

`src/world/yard.ts` now exposes:

- opening-world dimensions large enough to contain the connected route;
- authored route landmarks for Yard, Master lab, debt encounter and local Pit road;
- traversable route waypoints;
- landmark proximity lookup;
- collisions that preserve the established Yard while keeping the full opening route walkable.

The existing Yard spawn, protagonist movement, camera behaviour, pond collision and opening onboarding remain unchanged in role.

## Scope boundary

WP0.6D does **not** add:

- the Master NPC conversation;
- Master lab interior gameplay;
- creditor/debt-collector NPCs or encounter scripting;
- the local Pit exterior/interior;
- Pit registration or bracket gameplay;
- a new objective after `find-master`.

Those remain subsequent packages in the opening vertical-slice roadmap.

## Regression coverage

Automated route coverage verifies:

- all four opening-world landmarks exist;
- the world has expanded beyond the original Yard bounds;
- collision sampling remains clear from the Yard spawn through the lab destination and down the Pit road;
- the lab building, Old Toll furniture and Pit-road package boundary remain physically solid;
- the existing Yard/browser regressions continue to run through the normal CI suite.

## Next package

`WP0.6D1 — Mobile Gameplay Controls`

This package was inserted after human mobile testing established that the authored route could not be tested beyond character selection without a keyboard. WP0.6E now follows WP0.6D1.
