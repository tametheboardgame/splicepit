# Splice Resolution Prototype Contract

## Status

This document records the WP0.3D implementation contract for stochastic splice resolution.

The eight outcome bands are LOCKED by the decision log. The probability weights, risk coefficients, catastrophe threshold, strength ranges and stability deltas introduced here are **PROTOTYPE / TUNABLE** under `S-OPEN-04` and `S-OPEN-07`. Merging this WP accepts the engine shape for R0.3; it does not canonise final balance numbers.

## Purpose

A splice is not deterministic crafting. The resolver turns biological context plus an injected seeded RNG into a reproducible but uncertain individual result.

The engine deliberately separates:

1. biological risk and outcome-band distribution;
2. seeded outcome-band selection;
3. which intended expressions establish;
4. the strength and quality of each established expression;
5. mutation/injury/catastrophic consequences;
6. resulting stability change.

This means two attempts can both be `normal_success` while producing materially different expression sets, magnitudes, reliability and stability.

## Inputs

`SpliceResolutionInput` consumes:

- one or more incoming source-package definitions;
- the full `CompatibilityAssessment` produced by WP0.3C;
- current creature stability on a 0–1 scale;
- accumulated biological complexity as an unbounded non-negative value;
- facility safety;
- facility precision;
- material quality.

Knowledge/diagnostic visibility is intentionally absent from the biological resolver. Better information may reveal risk more accurately later, but observation alone does not change the underlying biology.

## Complexity and no hard gene ceiling

Incoming complexity is derived from each source package's integration, structural, metabolic and regulatory complexity profile.

Accumulated complexity is supplied separately so WP0.3E can derive it from the creature's irreversible history. The value has no maximum and is transformed into progressively increasing risk pressure with a saturating curve. Therefore very heavily modified creatures can become increasingly difficult to splice without introducing an arbitrary maximum number of genes or splice attempts.

## Compatibility

The compatibility score is converted into a bounded favourable/hostile influence. Failed source/expression requirements are also counted explicitly.

Compatibility affects the outcome distribution and the chance of individual intended expressions establishing. It does not map directly to a single success percentage.

## Outcome distribution

The resolver always constructs weights for the locked bands in this order:

1. `clean_rejection`
2. `damaging_failure`
3. `partial_expression`
4. `unstable_viable`
5. `normal_success`
6. `mutated_success`
7. `exceptional_synergy`
8. `catastrophic_result`

Weights are derived from incoming complexity, accumulated complexity, compatibility, requirement failures, current stability, facility safety/precision and material quality, then normalised into probabilities.

The exact coefficients are prototype tuning values. They are intentionally data-free domain logic rather than content-specific base/source pair tables.

## Catastrophic gate and death

`catastrophic_result` receives zero probability unless aggregate risk pressure reaches the prototype extreme-risk threshold.

Once catastrophe is eligible it remains a small weighted path rather than replacing ordinary bad outcomes. Death can only occur inside a catastrophic result, with the conditional death chance scaling from roughly 3% to 20% as risk moves from the catastrophe threshold to the prototype maximum. This keeps death rare overall and prevents routine ordinary-risk splicing from killing a creature arbitrarily.

Permanent damage can also occur through damaging failure without death.

## Intended-expression selection

After the band is selected, each potential expression is resolved independently.

Selection chance is influenced by:

- the selected band's broad semantic tendency;
- compatibility;
- facility precision;
- material quality;
- incoming complexity;
- failed source/expression requirements.

Bands that semantically require a viable result (`partial_expression`, `unstable_viable`, `normal_success`, `mutated_success`, `exceptional_synergy`) guarantee at least one intended expression establishes when candidate expressions exist, but the specific expression is still selected from independently rolled candidates.

## Expression quality and variance

Every established expression resolves separate seeded dimensions:

- magnitude;
- completeness;
- efficiency;
- reliability;
- local expression stability.

Band-specific ranges shape these values without fixing them. `normal_success` therefore describes a useful successful region, not a single stat template.

Exceptional synergy can exceed ordinary magnitude, while unstable viable outcomes may achieve useful magnitude with poor reliability/stability.

## Stability

Each attempt produces a stability delta and new 0–1 stability value.

The prototype makes biological modification generally costly to stability even when successful. Higher-risk bands and permanent/lethal consequences produce larger losses. Local expression stability can soften or worsen the exact change, but this WP does not introduce a free healing/stability-restoration mechanic.

Later mutation/stabilisation work can build deliberate recovery or stabilisation operations on top of this state.

## Seeded reproducibility

The resolver consumes the WP0.2E `RandomSource` only; it does not call `Math.random()`.

Every result records RNG snapshots immediately before and after resolution. Replaying from the same input and seed/snapshot reproduces the same band, expressions, quality dimensions, consequences and stability result exactly.

## Save/schema impact

WP0.3D itself did not mutate persisted creature state. WP0.3E now consumes this result and persists resolved expression quality, attempt stability, added complexity and consequences in save schema v2.

See `CREATURE_BIOLOGY_MODEL.md` for the cumulative-history and migration contract.

## Acceptance coverage

Automated tests prove:

1. all eight locked bands exist in the distribution;
2. ordinary-risk distributions cannot resolve catastrophe;
3. extreme-risk distributions can include catastrophe;
4. the same nominal recipe produces several legitimate bands across different seeds;
5. replaying the same seed reproduces the complete result exactly;
6. two normal successes can materially differ in expression/strength;
7. accumulated complexity and low stability increase risk without a hard ceiling;
8. death occurs only inside an eligible catastrophic result.
