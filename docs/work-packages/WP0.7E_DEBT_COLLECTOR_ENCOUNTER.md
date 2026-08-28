# WP0.7E — Debt Collector Encounter

Status: Implemented

## Objective

Deliver the opening creditor confrontation between the post-death Lab sequence and first local Pit progression so the player understands that Viktor's death did not remove the operation's debt and that tonight's Pit booking is now practical financial pressure.

## Story Boundary

WP0.7E deliberately locks only the story facts already accepted by the roadmap and decision log:

- Viktor is dead;
- the operation still carries a real debt/obligation;
- the surviving player is now treated as responsible for dealing with it;
- the debt creates pressure to keep the operation functioning and earn through Pit progression;
- failure to clear the eventual Act 1 debt will not be a game-over.

WP0.7E does **not** lock:

- creditor faction name;
- exact debt amount;
- exact deadline;
- original reason Viktor borrowed;
- exact collateral/security;
- detailed repayment/default mechanics.

`docs/CREDITOR_FACTION_PROPOSAL.md` therefore remains provisional. The encounter uses the neutral speaker title **Creditor Representative** and explicitly defers figures/dates rather than silently canonising open design.

## Sequence / Trigger

The detailed opening-slice plan establishes:

`RinoCow disaster → persistent post-death Lab → splice-bench route-forward hand-off → debt confrontation on route → first local Pit fight`

The encounter is staged at the already-authored `debt-encounter` route landmark, **Old Toll Lay-by**.

For the current pre-WP0.8 runtime, the existing WP0.7D splice-bench interaction is the arming seam. `src/story/debtEncounterBootstrap.ts` watches the shared post-death state and arms the route encounter only when:

- the disaster aftermath is active; and
- the splice-bench hand-off has been used.

WP0.8 may later replace the timing source with its stronger "first viable creature created" completion signal while retaining the same debt encounter state/runtime.

## Encounter State

`src/story/debtEncounterState.ts` owns a one-way story lifecycle:

- `locked` — unavailable before the post-death bench hand-off;
- `armed` — representative is waiting at the Old Toll Lay-by;
- `running` — confrontation is active;
- `completed` — inherited debt has been explicitly confirmed and the encounter cannot replay.

Cancellation/failure returns a running encounter to `armed`, allowing a safe retry instead of permanently losing the story beat.

## Dialogue / Tone

The encounter is intentionally threatening through calm administration rather than generic gang posturing.

It establishes:

- Viktor's account survived Viktor;
- the operation's obligations now sit with the surviving operator;
- tonight's Pit booking is the immediate route to earning;
- exact figures/dates will follow later;
- dying would mainly create more paperwork.

The sequence uses no dark-layer corruption cue. The institutional threat is more effective when delivered in the normal bright world, preserving the WP0.7C dark-layer language for moments that genuinely require rupture.

## Presentation

`src/cutscene/debtCollectorEncounterRuntime.ts`:

- renders a restrained creditor representative with ledger/document case at the Old Toll Lay-by;
- automatically starts the confrontation when an armed player reaches the landmark;
- uses the shared WP0.7A cutscene runtime for control lock, dialogue advance and event flags;
- hides irrelevant mobile movement/utility controls during dialogue while retaining ACTION;
- restores normal controls/presentation after completion;
- prevents replay after the story state completes.

A dedicated Graphics Tightening Pass C follows WP0.7E and remains responsible for final collector character art and scene polish.

## Story Flags

- `debt-collector-encounter-started`
- `inherited-debt-confirmed`
- `debt-collector-encounter-complete`

## Acceptance Criteria

- Encounter cannot begin before its post-death Pit-route hand-off is armed.
- The Old Toll Lay-by is the authored physical encounter location.
- The representative is visible while the encounter is armed/running.
- Entering the encounter runs through the shared cutscene runtime and locks player control.
- Dialogue clearly states that Viktor's death did not clear the debt and the player must now deal with it.
- Tonight's Pit booking is framed as immediate pressure to earn/progress.
- No exact debt amount, deadline or provisional creditor-faction name is canonised.
- No dark-layer flicker is used merely to make the collector seem threatening.
- Completion sets `inherited-debt-confirmed` and cannot replay.
- Failed/cancelled playback can safely retry.
- Portrait mobile dialogue remains readable and does not overlap the retained ACTION control.
- Full repository verify and browser smoke gates are green.

## Hand-off

WP0.7 is now mechanically complete once applicable gates are green. Graphics Tightening Pass C can polish the RinoCow disaster, aftermath and creditor presentation before WP0.8 locks the first real splice design.
