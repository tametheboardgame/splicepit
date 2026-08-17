# SplicePit Persistence Contract

## Status

Introduced by WP0.2C. R0.2 is the first release line whose saves are treated as a supported compatibility contract.

R0.1 local-storage data remains disposable prototype data under technical decision T-004. It is not promoted into a permanent compatibility burden.

## Current save envelope

The current save format is `splicepit-save`, schema version `1`.

The envelope records:

- save schema version;
- game version;
- save timestamp;
- the currently playable prototype gameplay snapshot;
- persistent creature records;
- main-creature and test-animal roster IDs;
- physical material stock;
- research knowledge;
- domain progression state.

Creature records persist identity-bearing and biology-bearing data rather than relying only on the latest visible stats. The foundation schema includes name, base-animal identity, age metadata, phenotype seed, ordered splice history, mutations, injuries, training, capabilities and independent Land/Water/Air functional state.

Physical material and research knowledge are separate persisted sections. Knowing a source does not create material stock.

## Migration policy

`src/persistence/saveSchema.ts` owns save decoding and sequential schema migrations.

- saves older than the current supported schema are migrated one version at a time when a migration exists;
- saves newer than the running build are treated as incompatible and are not rewritten;
- every future breaking save-shape change must add a migration and fixture before the current schema version is increased;
- migration failure must not delete the source data.

A schema-0 R0.2 development fixture is retained in automated tests to prove the migration pipeline. Schema 1 is the first written supported R0.2 format.

## R0.1 treatment

The previous prototype key is `splicepit-r0-save`.

On an R0.2 persistence operation, any R0.1 value is copied unchanged to `splicepit-r0-save-archive` before the old live key is removed. If the archive cannot be verified, the original key is left in place.

The archived R0.1 payload is not automatically converted into the supported R0.2 schema. This deliberately implements the agreed reset/archive policy rather than creating permanent compatibility with prototype state.

## Write and recovery strategy

The live save key is `splicepit-save`.

Writes use a staging key and decode the staged value before replacing the live save. If the existing live save is readable, it is copied to `splicepit-save-backup` before replacement.

If the existing live value is unreadable, it is not allowed to overwrite a readable backup. The first such raw value is retained at `splicepit-save-corrupt` for diagnostic/recovery purposes.

Loads attempt the primary save first and then the backup. A readable backup can restore gameplay even when the primary value is corrupt or incompatible. Failed decode or migration does not delete the only readable copy.

## Settings

Settings use the independent `splicepit-settings` key and a separate settings schema. Starting a new game or clearing game-save data does not erase settings.

The foundation settings store accepts simple string, number and boolean values. Later input, audio, accessibility and localisation WPs can define the player-facing setting names without changing the game-save payload.

## State ownership

`src/state/GameState.ts` remains the adapter for the accepted R0.1 playable loop during architecture hardening.

`src/state/DomainState.ts` owns the Phaser-independent persistent domain state introduced by WP0.2B. The save envelope persists both until later WPs replace the remaining prototype gameplay adapter with production domain systems.

## Validation gates

WP0.2C adds automated fixtures covering:

- current-schema round trip;
- historical versioned migration;
- persistent creature history/phenotype/injury/training/capability data;
- physical stock and research separation;
- primary-save corruption with backup recovery;
- R0.1 archival;
- settings separation;
- rejection of future incompatible schema versions;
- browser smoke verification of the versioned save envelope after the accepted R0.1 gameplay flow.

Save/schema impact: the live supported key changes from the unversioned R0.1 prototype payload to the versioned `splicepit-save` envelope. R0.1 data is archived rather than silently destroyed or permanently supported.
