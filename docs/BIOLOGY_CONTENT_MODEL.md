# SplicePit Biological Content Model

## Status

Introduced by WP0.3A. This document resolves the foundation taxonomy gate for biological source/base content without locking splice probabilities, compatibility scoring or final balance values.

## Six biological classes

Every potential expression has exactly one primary implementation class:

- `anatomical` — persistent body structures such as horns, claws, teeth, scales, glands or altered organs;
- `physiological` — how existing tissues and systems function, including healing, muscle performance, metabolism and thermal support;
- `sensory` — perception and sensory processing such as vision, hearing, smell, electroreception or target tracking;
- `biochemical` — produced chemicals, secretions, toxins, pigments, electrical discharge and related chemical/electrical systems;
- `behavioural_neurological` — instinct, reflex, drive and battle behaviour while remaining animal intelligence;
- `regulatory` — developmental or expression control that changes growth, timing, amplification, suppression or how other biology develops.

The primary class is an implementation boundary, not a claim of strict scientific realism. A source package can span several classes.

## Source packages

A source package is a bundle of possible biological expressions. It is not a deterministic one-gene/one-power upgrade.

Each package records:

- source species;
- the biological classes represented by the package;
- multiple potential expressions;
- generic biological requirements;
- compatibility tags for later systemic interaction rules;
- categorical complexity inputs;
- phenotype hooks for later visual composition;
- capability hooks for later functional capability derivation;
- optional concrete capability/action references when those systems eventually define them.

Each potential expression independently records its primary class, requirements, compatibility tags, biological tags created by successful expression, phenotype hooks and capability hooks. This allows one source package to produce different subsets and strengths later without bespoke code for each base/source pairing.

## Requirements and tags

Requirements are data-driven tag selectors:

- `allOfTags` — every listed tag is required;
- `anyOfTags` — at least one listed tag is required;
- `noneOfTags` — listed tags are incompatible with the expression/package.

Base animals expose body-plan and biological tags. Later compatibility work can evaluate those tags alongside the creature's accumulated expressed biology. WP0.3A deliberately does not implement compatibility scoring or epistasis rules.

## Complexity inputs

Source-package complexity uses four categorical dimensions:

- integration;
- structural demand;
- metabolic demand;
- regulatory volatility.

Each dimension is `low`, `moderate`, `high` or `extreme`.

These are qualitative inputs for later formulas, not final balance numbers. WP0.3C/D own the actual scoring and probability distribution.

## Phenotype and capability hooks

Hooks are semantic future-facing identifiers. They describe what later phenotype/capability systems may derive if an expression actually establishes.

A hook is not proof that a creature possesses a functional capability. In particular, attempted wings, aquatic traits or similar anatomy must not automatically grant Air/Water eligibility. Functional capability derivation remains WP0.3E and arena thresholds remain WP0.4E.

## Canonical opening bases

WP0.3A represents the three locked opening bases as canonical biological definitions:

- `rabbit`;
- `goat`;
- `pig`.

The definitions describe body plan, biological tendencies and baseline presentation/capability hooks without introducing final combat-stat balance.

## Canonical opening source packages

The ten locked opening source packages are represented as canonical multi-expression content:

- `lion_predatory_suite`;
- `rhinoceros_impact_suite`;
- `elephant_growth_mass_regulation`;
- `gecko_regeneration`;
- `cheetah_sprint_suite`;
- `pangolin_dermal_plate_suite`;
- `owl_nocturnal_sensory_suite`;
- `electric_eel_electrocyte_suite`;
- `toad_toxin_gland_suite`;
- `chameleon_visual_adaptation_suite`.

The existing R0.1 stable IDs `rabbit` and `gecko_regeneration` are intentionally retained. Their canonical biological definitions supersede the prototype domain adapters while the old playable R0.1 gameplay data remains untouched until later systems replace it.

## Validation contract

Content validation now rejects:

- unknown biological classes or complexity levels;
- empty canonical source packages;
- canonical source packages with fewer than two potential expressions;
- biological classes declared by a canonical package but represented by no expression;
- duplicate expression IDs within a package;
- invalid or contradictory requirement/tag data;
- invalid biological/phenotype/capability hook IDs;
- the pre-existing duplicate IDs, invalid statuses/revisions and broken content references.

This validates the taxonomy and content contract, not biological plausibility or final game balance.

## Save/schema impact

None. WP0.3A extends content definitions only. The WP0.2C player-save envelope and migration version remain unchanged.

## Later ownership

- WP0.3B: physical material, reagents and research knowledge;
- WP0.3C: compatibility and epistasis evaluation;
- WP0.3D: outcome bands, variance, stability and seeded splice resolution;
- WP0.3E: cumulative expression and functional capability derivation;
- WP0.3G: phenotype composition;
- WP0.4+: combat actions and arena functionality.
