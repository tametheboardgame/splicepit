# WP0.6C — Opening Objective Sequence

Status: **IMPLEMENTED**

Authoritative parent: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`

## Goal

Turn the reusable WP0.6A tutorial surface and WP0.6B Bag/Map/objective shells into the authored opening onboarding sequence, ending with a clear reason and route to reach the player's Master.

## Delivered sequence

The opening Yard tutorial now progresses in this order:

1. movement;
2. interact;
3. Bag;
4. Confirm / Back;
5. Map.

The prompts remain contextual and non-modal. Each completed prompt fades away before the next prompt appears, leaving a short visual gap rather than forming a blocking tutorial carousel.

The Confirm / Back lesson is deliberately contextualised after the Bag opens. Confirm and Back must both be used. During this lesson Back is consumed safely, so it cannot accidentally return the player to character selection.

## Objective hand-off

The player begins on `yard-orientation` while learning the controls.

Completing the Map lesson switches the active objective to `find-master` while the Map remains open. The final objective establishes all locked WP0.6C information:

- the Master is waiting;
- the splice fight of his life is about to start;
- he owes dangerous people a large amount of money;
- the player should follow the marked Master / Lab route to reach him.

The opening Map gains a Master / Lab route marker when this objective becomes active.

## Scope boundary

WP0.6C authors the tutorial and objective hand-off only. It does not add the connected Yard → Lab → Pit world geometry, Master NPC encounter or route completion trigger. Those remain WP0.6D and later packages as defined by the opening vertical-slice roadmap.

## Implementation

- `src/onboarding/openingObjectiveSequence.ts` owns ordered onboarding progression and inter-prompt timing.
- `src/tutorial/tutorialFramework.ts` contains the contextual prompt copy and semantic completion rules.
- `src/main.ts` feeds real semantic input into the sequence and advances the objective.
- `src/onboarding/openingShells.ts` contains the authored Master/debt objective copy.
- `src/ui/openingShells.ts` keeps tracker copy compact and reveals the Master / Lab map marker.

## Regression coverage

Automated coverage verifies:

- exact five-step authored order;
- inter-prompt progression and final objective hand-off;
- Confirm / Back requires both semantic actions;
- Escape during the Confirm / Back lesson closes the Bag rather than leaving the Yard;
- the Map remains open when the final Master objective is revealed;
- final objective copy retains both the imminent high-stakes fight and serious debt pressure.

## Next package

`WP0.6D — Yard → Lab → Pit Route`
