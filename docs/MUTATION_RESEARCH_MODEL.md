# Mutation Research Prototype Contract

## Status

This document records the WP0.3F implementation contract for mutation research.

The product rules are LOCKED: mutations are persistent biological events, they may become useful discoveries, and follow-up attempts to stabilise, preserve or exploit them can fail.

The exact probabilities, attempt budgets and extraction-quality formula in this prototype are **PROTOTYPE / TUNABLE** under `S-OPEN-05`. They prove the system without silently locking production balance.

## Mutation creation

WP0.3D records whether a splice result triggered a mutation. WP0.3E persists the irreversible splice attempt and its consequences. WP0.3F adds the bridge from that historical event to a real persistent mutation instance.

A mutation instance may only be materialised when:

- the creature exists;
- the referenced splice attempt belongs to that creature;
- the splice attempt records `mutationTriggered: true`;
- the mutation definition exists in the content catalogue; and
- the mutation-instance ID is unique.

This prevents mutation research from inventing mutations disconnected from creature history.

## Persistent research state

Research state is stored additively on the mutation instance:

- analysed / unanalysed state;
- analysis timestamp;
- unstable / stabilised state;
- finite stabilisation attempts remaining;
- finite extraction attempts remaining;
- successful extraction count;
- ordered research-operation history.

Existing schema-v2 mutation instances which pre-date WP0.3F remain valid. When research first touches an older instance, absent research fields are normalised to the prototype defaults.

## Analysis

Analysis is the deterministic first operation.

It resolves the mutation definition, records the definition's currently observable tags and writes an `analysis_complete` event into that mutation's research history.

Analysis does not guarantee that the mutation can be safely controlled or copied. It only makes follow-up work available.

## Stabilisation

Stabilisation is an uncertain seeded operation.

The prototype success distribution uses:

- laboratory precision;
- laboratory safety;
- a prototype mutation-research difficulty.

The operation records:

- calculated probability;
- resolved roll;
- RNG snapshot immediately before the roll;
- RNG snapshot immediately after the roll;
- success/failure outcome;
- remaining attempt capacity.

A successful result changes the instance to `stabilised`. A failed result leaves it unstable and still consumes one finite attempt.

Identical state plus identical RNG state therefore reproduces the same result exactly.

## Preservation / extraction prototype

WP0.3F proves the preservation/exploitation requirement through a seeded extraction operation.

Extraction requires prior analysis and consumes one finite extraction attempt whether it succeeds or fails. A successful attempt creates exactly one finite physical `MaterialLot` with:

- quantity `1`;
- acquisition channel `extract`;
- seeded/tunable quality;
- explicit provenance back to the mutation instance;
- an authored source-package ID supplied to the operation as the prototype material carrier.

The existing material model requires a source-package ID, so WP0.3F does not invent a new mutation-material taxonomy while `S-OPEN-05` is still open. Later content work may introduce dedicated mutation-derived packages where appropriate.

## Infinite-copy protection

A mutation is not an automatic renewable sample factory.

Each mutation instance has a finite extraction-attempt budget. Both successful and failed attempts consume that budget. Successful extraction creates finite stock only; it does not create a producer, recipe or self-replenishing inventory source.

Production progression may later provide deliberate cultivation/reproduction mechanics, but those must be explicitly designed rather than emerging accidentally from this prototype.

## Lab history

Every mutation operation writes an ordered record on the mutation instance.

Analysis records observed tags. Seeded follow-up operations additionally record probability, roll and RNG snapshots. Extraction records any material lot that was actually produced.

This gives later lab UX a direct history to display without reconstructing outcomes from current state.

## Save/schema impact

WP0.3F does **not** advance the save schema beyond v2.

Mutation research fields are additive nested data on an already-persisted mutation instance, and mutation-derived material uses the existing material-stock collection. The v2 decoder already preserves these values through structured cloning while remaining compatible with mutation instances that contain only the older base fields.

Acceptance coverage explicitly round-trips a seeded mutation-research result, its RNG audit trail and extracted material through save/load.

## Scope boundary

WP0.3F does not:

- define final production mutation probabilities or costs;
- make stabilisation automatically alter combat statistics;
- implement phenotype rendering for mutations;
- implement cultivation or reproduction loops;
- build the player-facing lab UI.

Phenotype composition belongs to WP0.3G. The player-facing experimentation loop belongs to WP0.3H. Advanced authored mutation content expands later in R2.

## Acceptance coverage

Automated tests prove:

1. only a mutation-triggering splice can create the corresponding persistent mutation instance;
2. analysis records mutation knowledge/history;
3. seeded stabilisation can legitimately succeed or fail and replays exactly;
4. seeded extraction can legitimately succeed or fail;
5. successful extraction creates finite mutation-derived physical material with provenance;
6. extraction capacity is finite and cannot become an automatic infinite-copy source;
7. mutation research outcome, RNG evidence and derived material survive save/load.
