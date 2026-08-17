# SplicePit Test Strategy

## 1. Purpose

SplicePit contains stochastic procedural systems, persistent generated creatures, authored quest graphs and combinatorial combat. These are exactly the kinds of systems that become difficult to debug if testing is added late.

Testing is therefore part of the architecture, not only release hardening.

## 2. Test pyramid

### Layer 1 — Pure unit tests

Fast tests for isolated logic:

- stat/biology derivation
- compatibility rules
- seeded RNG
- mutation selection
- damage/action effects
- inventory transactions
- quest condition evaluation
- ID/content helpers
- save migration functions

These should not require Phaser or a browser.

### Layer 2 — Domain/system tests

Test complete operations:

- splice attempt from recipe to creature result
- combat sequence/turn resolution
- quest advancement through events
- acquisition → inventory → splice flow
- save/load round trip
- generated creature persistence

### Layer 3 — Content validation

Run on every build/PR:

- duplicate IDs
- broken references
- invalid ranges
- missing required fields
- invalid quest/dialogue graph links
- unsupported phenotype instructions
- production content referencing prototype-only IDs

### Layer 4 — Headless browser smoke

Verify the integrated Phaser build starts and major player flows work.

The R0.1 browser test is the baseline and should evolve with the game.

### Layer 5 — Simulation/balance tests

Headless large-batch simulations once splicing/combat rules stabilise.

### Layer 6 — Human playtesting

Automated tests cannot judge whether experimentation is fun, whether risk feels fair, whether UI communicates biology well, or whether the tone works.

## 3. Deterministic randomness

No core stochastic test should rely on uncontrolled randomness.

Tests should use:

- fixed seeds
- injectable deterministic RNG
- fixtures containing expected results

Bug reports involving generated outcomes should include or allow recovery of the relevant seed/state.

## 4. Splicing test matrix

Test categories:

### Basic validity

- valid base + valid genes
- unknown IDs rejected
- duplicate genes handled according to design
- empty recipe behaviour

### Complexity

- complexity increases appropriately
- no hard gene-count rejection unless biological validation requires something specific
- facility/modifier effects

### Compatibility

- requirements satisfied
- requirements missing
- synergy
- conflict
- multiple overlapping rules

### Outcomes

- deterministic clean success fixture
- deterministic failure fixture
- deterministic mutation fixture
- partial/unstable fixtures if adopted

### Persistence

- creature genotype survives save/load
- phenotype seed survives
- mutation state survives
- derived state can be rebuilt/validated

## 5. Combat test matrix

Once final combat model is chosen:

- action legality
- resource/cooldown use
- damage/defence
- status application/removal
- initiative/order
- trait triggers
- knockout/death/injury rules
- AI legal action selection
- battle-end conditions
- rewards

Regression fixtures should include representative build archetypes.

## 6. Save compatibility tests

Maintain fixtures for important historical save versions.

CI should:

1. Load old fixture.
2. Run migrations.
3. Validate latest schema.
4. Assert important semantic state remains correct.
5. Round-trip save/load again.

Never test migrations only with synthetic empty saves.

## 7. Quest/content graph tests

Automated checks should detect:

- unreachable required quest nodes where statically detectable
- missing dialogue targets
- invalid reward IDs
- circular chains that have no intended exit
- objectives referencing missing locations/NPCs/items
- duplicate quest IDs

Some authored logic will still require playthrough testing.

## 8. Browser smoke strategy

R0.1 currently drives the build through the major loop. As real UI stabilises, prefer browser tests that interact through player-facing controls rather than call internal scene methods directly.

Target smoke flows over time:

### Smoke A — New game

Title → new game → opening → world control acquired.

### Smoke B — Save/continue

Create state → reload page → continue → state preserved.

### Smoke C — Splice

Acquire fixtures legitimately or through test fixture setup → perform splice via UI → creature created.

### Smoke D — Combat

Enter Fit Pit → perform actions → reach victory/defeat → reward/state recorded.

### Smoke E — Quest loop

Accept/advance/complete a representative quest across map transitions.

Browser smoke should stay small enough to be reliable; deeper permutations belong in domain tests.

## 9. Combat simulation plan

After R0.4 rules stabilise:

- construct representative creature archetypes
- run seeded round-robin battles
- collect win rate, turns, action use, damage sources, stalemates
- flag extreme matchup results for review
- compare results before/after balance changes

Do not enforce simplistic “every build must have 50% win rate”. Specialisation and counters are expected.

## 10. Splice simulation plan

Run large sets of recipes/seeds to inspect:

- viability distributions
- mutation rates
- frequency of unusable outcomes
- risk curve versus complexity
- synergy/conflict impact
- lab upgrade impact

This helps find formulas that technically work but produce boring or punitive distributions.

## 11. Performance testing

Later milestones should track:

- initial load time/bundle size trend
- scene/map transition time
- phenotype generation cost
- cached creature-render cost
- large roster/save load time
- memory growth across repeated scene transitions

Use measured regressions rather than arbitrary premature optimisation.

## 12. Manual playtest cadence

Suggested major playtest gates:

- R0.3: Is splicing interesting enough?
- R0.4: Is combat the right model?
- R0.5: Does the complete exploration → acquisition → splice → fight loop work?
- R0.7: Does the integrated pre-alpha feel like one game?
- R1: Can a fresh player learn and complete the first real chapter?
- R2+: balance/content/usability regression.

Each gate should capture:

- what player tried to do
- what confused them
- what strategy emerged
- where they stopped experimenting
- perceived fairness of failure
- memorable creature/build outcomes
- technical defects

## 13. CI merge gate

Target required checks before merging gameplay PRs:

- typecheck
- content validation
- unit/system tests
- save migration tests
- production build
- browser smoke

Simulation checks can initially report rather than block until thresholds are meaningful.

## 14. Definition of a regression

A regression includes more than a crash. Examples:

- same saved creature changes appearance unexpectedly
- gene description no longer matches its effect
- quest cannot progress after reload
- compatibility explanation disagrees with calculation
- combat action becomes impossible for a valid build
- old save loads but silently loses a mutation
- input no longer works with an existing binding

Tests should protect player-visible contracts, not only functions.
