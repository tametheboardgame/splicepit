# Hybrid Phenotype Composition Prototype

WP0.3G proves that visible hybrid creatures can be composed from cumulative biology without requiring a bespoke complete asset for every genotype.

## Contract

The phenotype system is derived from persistent creature state. It does not add a second biological truth.

Inputs are:

- base animal identity;
- the creature's stable `phenotypeSeed`;
- ordered splice history;
- successfully expressed `phenotypeHooks` and their resolved expression quality.

The output is a deterministic `PhenotypeBlueprint` containing:

- one authored base body/skeleton;
- seeded proportion parameters;
- modular anatomical components assigned to body-region slots;
- layered surface treatments;
- explicit fallback records for unsupported or conflicting visible expressions;
- a reproducible phenotype signature for diagnostics/tests.

## Authored opening bodies

Rabbit, Goat and Pig each have a distinct authored skeleton identifier, body-region anchors and baseline proportions. These definitions establish different silhouettes before any splice-derived modules are applied.

This is deliberately a composition system rather than a library of final hybrid animals.

## Modular visible expressions

The WP0.3A phenotype hooks now have prototype visual modules covering the opening content, including:

- predatory jaws and claws;
- horn growth/patterning, heavy brow and reinforced neck;
- whole-body growth and supporting-tissue proportion changes;
- regenerative asymmetry and adhesive pads;
- sprint-frame proportion changes;
- dermal plates;
- owl-like eye geometry;
- toxin-gland clusters and glandular texture;
- dynamic colour/pattern zones and independent eye tracking.

Multiple hooks can contribute to the same compatible module. For example, a Goat's baseline horns, rhinoceros horn growth and horn-pattern regulation merge into one horn-array slot rather than creating three unrelated complete-head assets.

## Seeded variation

`phenotypeSeed` controls small individual proportion differences and component/surface variants. Composition does not consume the simulation RNG stream and therefore cannot alter biological outcomes.

The same creature state and seed must always produce the same phenotype blueprint, including after save/load.

## Fallback behaviour

A visible biological expression is never removed merely because the renderer cannot currently display it.

- Unknown hooks become `unsupported_hook` fallbacks and remain present in the biological splice record.
- Mutually exclusive component slots retain the stronger visible component and record the suppressed hook as a `slot_conflict` fallback.
- Compatible hooks targeting the same module are merged.

This makes missing art a presentation limitation rather than a mutation of creature biology.

## Rendering boundary

`PhenotypeRenderer` draws a blueprint from the same modular data. It supports different Rabbit/Goat/Pig silhouettes, proportion changes, anatomical components and layered surfaces.

The legacy R0.1 slice renderer remains available unchanged in behaviour. WP0.3H owns player-facing lab integration of the cumulative R0.3 creature state and phenotype renderer.

## Save/schema impact

None.

WP0.2C/WP0.3E already persist the stable `phenotypeSeed`, base animal and ordered splice history required to reconstruct appearance. No derived phenotype blueprint is persisted, avoiding stale visual state after composition rules evolve.

## Prototype/tuning boundary

The following are prototype presentation values rather than canon balance/content decisions:

- exact body-region anchor geometry;
- proportion clamps and seed-jitter ranges;
- module strengths and visual dimensions;
- surface coverage/intensity mapping;
- conflict-slot priorities where future art direction requires a more specific authored combination.

The locked rule is architectural: appearance derives deterministically from actual cumulative biology and stable phenotype data, not from a bespoke final asset per genotype.
