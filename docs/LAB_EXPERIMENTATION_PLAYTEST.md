# R0.3 Lab Experimentation Playtest Gate

Status: WP0.3H prototype contract. Human playtest sign-off remains required before the work package is treated as complete.

## Purpose

WP0.3H turns the R0.3 biology systems into the intended player loop:

1. spend finite physical material on common test animals;
2. accumulate evidence rather than unlock recipes;
3. compare outcomes across repeated attempts and base animals;
4. decide whether the evidence is good enough to risk a valued creature;
5. make an explicit irreversible commitment;
6. inspect the actual individual result, including partial/non-functional expression, injury, mutation, death risk and cumulative creature history.

The release gate is qualitative as well as technical: the lab must feel like experimentation and risk, not deterministic crafting.

## Implemented player-facing contract

- The bench opens on a test animal, not the main creature.
- Rabbit, Goat and Pig are available as R0.3 test subjects so the same source can produce comparable evidence across hosts.
- Source stock and general reagent stock are finite and persisted.
- Each actual splice attempt consumes one material unit and one reagent unit.
- Research is contextual to source package and base animal.
- Forecasts expose broad confidence ranges for likely viable expression and adverse outcomes. Exact outcome probabilities and random rolls are not shown.
- Observable compatibility warnings may be shown. Diagnostic-only compatibility information remains hidden.
- More observations narrow the displayed ranges, but never to an exact percentage.
- Test results append irreversible biology to the selected test animal only.
- Main-creature work requires a separate prepare action followed by `CONFIRM IRREVERSIBLE COMMIT`.
- Results show the outcome band, established expression, functional/non-functional state, stability change, injury, mutation detection and cumulative attempt count.
- The WP0.3G phenotype composer renders the selected creature from its actual cumulative history.
- Recent comparable experiment records remain visible across Rabbit/Goat/Pig attempts.
- A living spliced main creature is bridged into the existing Fit Pit prototype so R0.1 accepted behaviour is not lost.

## Prototype/tunable values

These values exist to make the R0.3 playtest possible. They are not canon balance decisions.

- Lab safety: 0.72
- Lab precision: 0.68
- Initial material per recovered source: 8 units
- Initial general reagent: 24 units
- Material quality: 0.82
- Forecast half-width by matching observations:
  - 0 observations: 30 percentage points
  - 1 observation: 25 points
  - 2-3 observations: 20 points
  - 4-7 observations: 15 points
  - 8+ observations: 10 points

The forecast ranges deliberately remain approximate even when well observed.

## Structured human playtest

Use a fresh save for the cleanest result.

1. Reach the damaged pit, obtain the Rabbit and recover at least one viable sample from the gene cabinet.
2. Open the splice bench.
3. Confirm that a TEST animal is selected by default and that the forecast is expressed as ranges rather than a single success percentage.
4. Run a test splice. Inspect the source stock, research observation count, outcome details and changed creature appearance/history.
5. Repeat the same source on the same base animal at least twice. Confirm that knowledge improves but the next outcome is still uncertain.
6. Switch to a different test base animal and run the same source. Compare the recent experiment records and differences in visible warnings/forecast.
7. If an attempt produces injury, mutation or non-functional expression, confirm that the result is understandable without opening developer diagnostics.
8. Select the MAIN creature. Confirm that the normal test action disappears and an explicit main-creature commit action replaces it.
9. Choose `COMMIT MAIN CREATURE...`, read the irreversible warning, then decide whether to proceed.
10. If proceeding, choose `CONFIRM IRREVERSIBLE COMMIT`. Confirm that the result is appended to the main creature rather than replacing its prior biology.
11. Return to the pit. If the main creature survived, confirm the existing Fit Pit path remains available.
12. Save/continue and return to the bench. Confirm stock, research, histories, injuries/mutations and the cumulative phenotype survived reload.

## Questions to answer during playtest

Record a short answer for each item rather than only pass/fail.

- Did starting on a disposable test animal make the intended experimentation loop obvious?
- Did spending material on tests feel meaningful rather than like wasted clicks?
- Did the confidence ranges become more useful as evidence accumulated without feeling like a recipe unlock?
- Were the known warnings understandable, and was it clear that unknown factors still existed?
- Could you compare Rabbit/Goat/Pig evidence without needing developer information?
- Did the second main-creature confirmation create an appropriate sense of consequence, or only friction?
- After a result, could you understand what expressed, what was functional, what damage occurred and what changed visually?
- Did any part of the bench still read like deterministic crafting?
- Were repeated tests too cheap, too expensive, too safe, too lethal, too similar or too noisy?
- At what point did you personally feel you had enough evidence to risk the main creature?

## Formula-tuning response guide

- If testing feels pointless because forecasts barely change, narrow the observation bands faster or improve the evidence presentation before changing underlying biology odds.
- If research becomes a recipe unlock, keep a wider minimum range and/or expose fewer diagnostic signals.
- If the main-creature decision feels obvious, increase meaningful host/source variance or reduce early evidence quality before simply increasing lethality.
- If results feel random rather than learnable, strengthen visible compatibility differences and contextual research signalling.
- If test animals feel disposable in a bad way, make their individual history/phenotype more legible before adding economic punishment.
- If finite stock prevents useful experimentation too early, adjust prototype stock quantities. Do not create free material from research knowledge.
- If the confirmation step feels like nuisance rather than tension, improve the information shown at the commit point before removing irreversibility protection.

## Automated acceptance coverage

`tests/lab-experimentation.test.mjs` covers:

- uncertain range-based forecasts;
- research-driven range narrowing without certainty;
- finite material/reagent consumption;
- test/main state separation;
- cross-base experiment comparison;
- irreversible main-creature history;
- depletion blocking free attempts;
- seeded transaction reproducibility;
- mutation materialisation into persistent follow-up research state.

`scripts/browser-smoke.mjs` covers the player-facing path from the existing R0.1 lab into:

- a test-first R0.3 bench;
- uncertainty framing;
- a persisted test experiment;
- a persisted main-creature commit;
- the versioned save;
- the existing Fit Pit path.

## Save/schema impact

No new save-schema version is required. WP0.3H writes the domain fields introduced and migrated in the R0.2/R0.3 foundations:

- creatures and ordered splice history;
- material and reagent stock;
- research knowledge;
- experiment history;
- mutation research state when a mutation is triggered.

The R0.1 `currentCreature` field is maintained only as a temporary compatibility bridge for the existing Fit Pit prototype.

## Human sign-off

Pending.

WP0.3H should not be marked complete until the structured playtest above demonstrates the release gate:

> A player can test repeatedly on common animals, learn something meaningful, then make an informed-but-still-risky splice on a valued creature and understand the result.
