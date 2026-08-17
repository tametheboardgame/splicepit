# SplicePit Domain and Content Contract

## Status

Introduced by WP0.2B. This document records the foundation contract only; later biological, combat, world and persistence work packages deliberately extend it.

## Stable IDs

The domain layer provides typed stable IDs for:

- base animals;
- source packages;
- physical material lots;
- creatures;
- splice attempts;
- mutation definitions and mutation instances;
- capabilities;
- actions;
- items;
- locations;
- quests;
- progression states.

Stable IDs are machine-facing keys. Display names are not identifiers and may change without changing identity.

## Content status

Scalable content definitions carry one explicit status:

- `prototype`;
- `draft`;
- `canon`;
- `deprecated`.

The surviving R0.1 Rabbit, gene-like samples, house opponent concepts and quest-stage adapters remain explicitly `prototype`. WP0.2B does not promote prototype content to canon.

## Content catalogue boundary

`src/domain/` contains Phaser-independent ID, model and validation contracts.

`src/content/` adapts currently playable content into the domain catalogue and performs runtime/build validation.

The catalogue can represent base animals, source packages, mutations, capabilities, actions, items, locations, quests and progression states with references between them. Validation rejects duplicate IDs, invalid stable IDs/statuses/revisions and broken references.

## Creature and laboratory state boundary

The foundation state can represent:

- persistent named creatures with base-animal identity, age metadata and phenotype seed;
- an ordered, irreversible splice-attempt history;
- mutation, injury and training history;
- a serious-combat main roster capped at three creatures;
- separate test-animal/lab stock;
- physical material lots with quantities;
- research knowledge records that do not themselves create physical stock;
- independent Land, Water and Air functional qualification, including simultaneous qualification for multiple environments;
- quest and progression state references.

State validation rejects duplicate runtime IDs, negative ranges, over-sized main rosters, role mismatches, broken references and non-chronological splice histories.

## Deliberately unresolved mechanics

WP0.2B does not decide any later design gate. In particular it does not lock:

- the final six-class biological taxonomy schema;
- splice compatibility, epistasis, probability or stability formulas;
- material quantities, reagents or replication rules;
- knowledge/diagnostic progression formulas;
- exact Land/Water/Air functional thresholds;
- final combat actions, turn cadence or balance.

Those remain owned by the later WPs already named in the roadmap and decision log.

## Save/schema impact

WP0.2B introduces the domain contract but does not replace the current R0.1-compatible local-storage shape. No existing save key or persisted save payload is deliberately changed by this WP.

WP0.2C is responsible for making R0.2 the first supported versioned save schema and for mapping the new persistent domain structures into that save envelope.

## Validation gates

- `npm run typecheck` checks the TypeScript model.
- `npm run validate:content` compiles and validates the current content catalogue.
- `npm test` includes Phaser-independent domain fixtures and invalid-fixture tests.
- `npm run verify` includes typecheck, content validation, tests and production build.
