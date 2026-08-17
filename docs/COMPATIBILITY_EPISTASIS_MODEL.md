# Compatibility and Epistasis Prototype Contract

## Status

This document records the WP0.3C implementation contract for systemic compatibility and epistasis.

The engine structure is the accepted R0.3 prototype direction. Exact rule weights, profile thresholds and the eventual amount of player-visible information remain **PROTOTYPE / TUNABLE** under `S-OPEN-03`. This work does not define WP0.3D splice-outcome probabilities.

## Purpose

Compatibility is a biological context calculation, not a base-animal/source lookup table. The same incoming material can therefore be favourable, awkward or dangerous depending on:

- the base animal's body plan and biological tags;
- biology already expressed by previous splices;
- source-package context already present in the creature's history;
- other source packages included in the same incoming attempt;
- generic systemic rules;
- rare authored exceptions where a specific interaction is worth modelling deliberately.

## Assessment inputs

`evaluateCompatibility()` accepts:

- one base-animal definition;
- one or more incoming source packages;
- optional existing source packages;
- optional explicit tags representing biology that actually expressed previously;
- a rule set, defaulting to the R0.3 prototype systemic rules;
- optional authored compatibility interactions.

Existing source packages contribute only package-level context automatically. Their potential expressions are not assumed to have occurred. Later cumulative-biology work should pass actual expressed biological tags explicitly.

## Requirements

Source-package and individual-expression requirements are evaluated against the host's current biological context.

- A failed source-level requirement is a major, observable compatibility conflict.
- A failed expression-level requirement is retained as a more granular diagnostic signal.
- Requirement failure does not itself resolve the splice. WP0.3D consumes compatibility information when constructing outcome distributions.

## Systemic interactions

The initial prototype rules demonstrate reusable families rather than pair recipes:

- structural demand supported by an already robust/heavy frame;
- structural demand conflicting with a light/fragile frame;
- sprint-biased expression favouring light/mobile hosts and conflicting with heavy hosts;
- stacked metabolic burden;
- competition between incompatible surface-development programmes;
- redundant keratin programmes;
- sensory-system integration;
- regenerative biology mitigating some self-damaging systems;
- regenerative developmental reset interfering with established regulatory programmes;
- competing growth and proportion regulation.

The numeric deltas are tuning values. They are deliberately not canon balance numbers.

## Epistasis between incoming sources

When an attempt contains multiple source packages, the same systemic rules are evaluated between those incoming packages as well as between incoming biology and the host.

This permits interactions such as two competing surface systems to be detected from their biological tags without introducing a `Toad + Pangolin = X` table.

## Existing biology

Later splices are assessed against the creature as it currently exists. Explicit `existingBiologicalTags` can therefore change compatibility even when the base animal and incoming source are unchanged.

This is the WP0.3C hook used by WP0.3E when cumulative expression state is derived from irreversible history.

## Authored interactions

`AuthoredCompatibilityInteraction` provides an escape hatch for genuinely interesting exceptions.

An authored interaction can:

- constrain itself to a base animal, incoming source, existing source or required biological tags;
- add an extra synergy, conflict, redundancy or regulatory signal;
- suppress named generic rules when a deliberate override is required;
- remain explicitly `prototype`, `draft` or `canon`.

The opening prototype includes one non-canon Goat/Rhinoceros horn-bed synergy solely to prove the authored augmentation path. Its existence does not establish a general balance rule or story canon.

## Observable versus hidden information

The biological assessment always computes the full signal set first. `projectCompatibilityInformation()` then creates an information view:

- `observable` exposes only interactions intended to be reasonably apparent at the current baseline;
- `diagnostic` reveals both observable and hidden diagnostic signals and may use a more precise explanation.

Changing information access never recalculates or changes the underlying biological compatibility result. Better diagnostics reveal biology; they do not improve it merely by observing it.

The R0.3H lab UX and later research/diagnostic progression can build richer confidence rules on top of this boundary.

## Compatibility profile

The prototype produces a net compatibility score and a coarse profile:

- strongly favourable;
- favourable;
- mixed;
- strained;
- hostile.

These values are inputs for later splice resolution. They are not direct success percentages, outcome bands or guarantees.

## Save/schema impact

None in WP0.3C.

Compatibility assessments are derived from content plus creature biological context and do not add a new persisted field to the versioned save schema. Existing saves therefore remain readable without migration.

WP0.3D/E may persist resolved expression state/history as already planned, but that is outside this WP.

## WP0.3C acceptance coverage

Automated fixtures prove:

1. systemic structural synergy and conflict across Rabbit, Goat and Pig;
2. systemic interaction between multiple incoming source packages without a pair table;
3. prior expressed biology changing a later compatibility result;
4. distinct redundancy and regulatory interaction types;
5. authored interactions augmenting and overriding generic rules;
6. observable and diagnostic information revealing different detail without altering the underlying assessment.
