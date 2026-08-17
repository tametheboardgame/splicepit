# R0.2 Deterministic RNG, Diagnostics and CI Contract

## Status

Introduced by WP0.2E. This document records the implementation contract for deterministic stochastic behaviour, developer reproduction hooks and the R0.2 CI merge gate.

## Seeded RNG

`src/random/RandomSource.ts` owns the browser-independent seeded generator and serialisable RNG snapshot. `src/runtime/runtimeRandom.ts` owns the single runtime stream used by the current playable slice.

Core stochastic logic receives an injected `RandomFn`. Splicing, battle damage variance and enemy action selection therefore consume the same explicit runtime stream rather than global `Math.random()`.

A deterministic run can be requested with a URL seed, for example `?seed=bug-1234`. When no seed is supplied, the runtime creates one from browser cryptographic entropy where available and reports it through developer diagnostics.

The RNG snapshot contains:

- the original seed;
- current unsigned 32-bit generator state;
- number of values consumed.

Restoring the snapshot resumes at the exact next random value.

## Generated fixture reproduction

A stochastic fixture is reproducible when the same operation inputs and RNG seed/state are supplied. Tests now cover a complete splice attempt reproduced from identical base/source inputs, fixed metadata and a fixed seed.

Wall-clock metadata such as a normal gameplay creature creation timestamp is not itself stochastic. Tests that require byte-for-byte fixture identity pass fixed metadata explicitly.

## RNG boundary

`npm run validate:rng` scans the core stochastic boundary and fails if direct `Math.random()` is introduced into:

- domain code;
- system code;
- RNG/runtime code;
- Splice scene stochastic execution;
- Battle scene stochastic execution.

Purely cosmetic presentation noise remains outside this boundary and may use non-simulation randomness because it does not alter game state or outcomes.

## Developer diagnostics

On localhost/127.0.0.1, or when `?debug=1` is supplied, the game exposes `globalThis.__SPLICEPIT_DEBUG__`.

The diagnostics snapshot includes:

- registered base-animal and gene IDs;
- current/domain creature IDs;
- current gameplay state;
- current domain state;
- current creature prototype biology, including base, genes, stats and mutation;
- RNG seed/state/call count;
- active and registered Phaser scene keys;
- readable persisted save envelope and whether it came from primary or backup storage.

The API provides:

- `diagnostics()`;
- `exportState()`;
- `importState(serialised, options)`;
- `setSeed(seed)`.

Debug exports are a development reproduction format, not a player save format. Import restores gameplay/domain state and exact RNG continuation. It can optionally persist the imported state and restart the captured active scene.

## Save/schema impact

WP0.2E does **not** change the R0.2 save envelope or schema version introduced by WP0.2C.

The RNG/debug export is deliberately separate from the supported player save contract. Later stochastic event records can persist their own event seeds/outcome data as the real splicing/combat schemas are implemented.

## Browser smoke

The smoke test now launches the production build with a fixed seed rather than monkey-patching `Math.random()`. It then exercises the established semantic controls through Title, Intro, Lab interaction, Splice selection/attempt and Battle action, while retaining only narrow fixture shortcuts for state acquisition and shortening the demonstration battle.

The smoke also asserts:

- the requested seed is visible in diagnostics;
- a successful splice consumed the deterministic stream and exposes creature biology;
- debug state exports contain the seed/state;
- debug import restores the exact RNG snapshot;
- the final versioned save remains readable and complete.

## CI gate

GitHub Actions exposes explicit blocking stages for:

1. locked dependency install;
2. strict TypeScript typecheck;
3. content validation;
4. RNG-boundary validation;
5. unit/domain/save tests;
6. production Vite build;
7. headless browser smoke against the built `dist/` artifact.

The browser smoke waits for the main verification job, so a failing architectural/unit gate does not consume browser-test time unnecessarily.

## R0.2E exit condition

WP0.2E passes when deterministic fixtures reproduce from captured inputs and seed/state, developer diagnostics/export/import hooks work, the core randomness boundary contains no uncontrolled random calls, and all CI gates are green.
