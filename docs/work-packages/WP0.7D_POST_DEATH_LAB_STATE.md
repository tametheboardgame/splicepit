# WP0.7D — Post-Death Lab State

Status: Implemented

## Objective

Convert the RinoCow disaster from a temporary cutscene aftermath into the normal Master Lab story state that follows Viktor's death.

The cutscene owns the irreversible event. WP0.7D owns what the playable world believes after that event has completed.

## State Contract

`src/story/postDeathLabState.ts` owns one shared runtime story state for the opening slice.

Before the disaster completes:

- phase is `pre-disaster`;
- the Master is considered present;
- the Master Lab renders `pre-disaster`;
- the splice bench is not the route-forward interaction.

After `rinocow-disaster-complete = true`:

- phase becomes `post-death` exactly once;
- the Master is no longer present as a normal living-world state;
- the Master Lab renders its authored `aftermath` variant;
- the splice bench becomes ready as the immediate route forward;
- repeated lab exit/re-entry does not reset the lab to `pre-disaster`.

`src/story/postDeathLabBootstrap.ts` listens to the shared cutscene flag event and performs that one-way conversion. It does not duplicate the RinoCow cutscene or its causal flags.

## Master Lab Behaviour

`src/masterLabRuntime.ts` no longer assigns `pre-disaster` every time the player enters the lab. It synchronises its render state from the shared post-death contract.

This means the existing WP0.6J production-art aftermath work becomes the normal playable lab after the cutscene rather than a temporary presentation beat.

The runtime also exposes post-death debug state for browser validation:

- `state`;
- `postDeath`;
- `masterPresent`;
- `spliceBenchReady`;
- `spliceBenchInteractionCount`;
- `nearSpliceBench`.

## Objective Hand-Off

The opening objective catalogue retains its two pre-disaster steps. A third objective is owned by the post-death story state and appears only after the disaster:

**Use the splice bench**

> Viktor is dead, the lab is wrecked, and tonight’s Pit booking is still active. Get to the Primary Splice Bench. You need something that can fight.

The tracker directs the player to the Primary Splice Bench. Bag and Map shells read the same shared objective, including after leaving and re-entering the lab.

## Splice Bench Boundary

When the post-death objective is active and the player reaches the existing `splice-bench` stage, the normal lab runtime presents an interaction prompt and records the interaction through the shared story-state controller.

This is deliberately a hand-off seam, not the splice mechanic itself. WP0.8 remains responsible for locking the first real splice contract and rebuilding the bench interaction around it.

## Persistence Boundary

WP0.7D persistence means the irreversible story state survives ordinary runtime transitions such as leaving and re-entering the Master Lab. It does not add a new save-schema field or introduce the later New Game / Continue / checkpoint system.

That keeps WP0.7D inside the opening-slice roadmap boundary while removing the current resurrection bug caused by lab-entry initialisation.

## Acceptance Criteria

- RinoCow completion activates one shared post-death lab state.
- The Master Lab switches to the authored `aftermath` state.
- Viktor is no longer considered present in normal post-cutscene state.
- Leaving and re-entering the Master Lab cannot restore `pre-disaster`.
- The new `use-splice-bench` objective replaces `find-master` after the disaster.
- The objective remains active in the normal opening UI outside the lab.
- The Primary Splice Bench becomes visibly interactable as the immediate route forward.
- Bench interaction provides a clean runtime hand-off for WP0.8 without implementing splice mechanics early.
- No save-schema migration is introduced.
- Full repository verify and browser smoke gates are green.

## Hand-off

WP0.7E can now introduce the Debt Collector encounter against a stable world state where Viktor is dead, the Master Lab remains damaged, and the player's next practical route is the splice bench.
