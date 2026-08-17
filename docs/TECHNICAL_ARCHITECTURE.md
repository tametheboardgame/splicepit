# SplicePit Technical Architecture Plan

## Locked R0.2 stack

- TypeScript in strict mode
- Vite
- Phaser as a pinned package dependency
- browser-first static deployment
- GitHub + Cloudflare Pages
- pure domain/system logic separated from Phaser presentation where practical
- validated content definitions with stable IDs
- versioned save schema from R0.2 onward
- seeded deterministic RNG for stochastic systems/tests
- CI with typecheck, tests, content validation, production build and browser smoke

## R0.1 save policy

R0.1 saves are disposable prototype data.

R0.2 establishes the compatibility contract. Migration code does **not** need to carry the R0.1 prototype schema forever. On first R0.2 launch we may explicitly reset/replace old prototype save data with a clear message.

From R0.2 onward, save migrations are required where practical.

## Input policy

Keyboard is the supported foundation input.

Core game code maps physical controls to semantic actions so later controller/touch support can be added without rewriting gameplay systems.

Examples:

```text
MOVE_UP / MOVE_DOWN / MOVE_LEFT / MOVE_RIGHT
INTERACT
CONFIRM
CANCEL
MENU
BATTLE_PRIMARY...
```

No core system should depend directly on a specific key code after R0.2.

## Domain model priorities

R0.2 must support future concepts already locked:

- persistent named creatures
- chronological irreversible splice history
- variable expression outcome data
- main roster max three
- separate lab/test-animal stock
- material inventory separate from knowledge records
- Land/Water/Air eligibility/capabilities, including multi-environment qualification
- persistent injury/mutation fields even if later mechanics are not fully implemented yet
- age/history fields without building a punitive ageing timer

Schemas should leave room for these concepts rather than forcing later breaking rewrites.

## RNG

All important stochastic systems accept a `RandomSource`/seeded generator.

Do not use global `Math.random()` in core splice/combat/procedural domain rules after migration.

A stored splice event should be reproducible from:

- creature prior state
- material/source IDs
- lab modifiers
- knowledge state if relevant
- seed
- resulting outcome/expression data

## Save envelope

Indicative R0.2 shape:

```text
SaveFile
- schemaVersion
- gameVersion
- savedAt
- player/progression
- money/debt/story clocks
- inventory/material stock
- knowledge/research records
- main creature roster (max 3)
- lab/test animal stock
- world/quest state
- pit facility state
- settings reference/separate settings store
```

Generated creature state stores biological history and phenotype seed/parameters rather than relying only on recomputation from latest visible stats.

## Content status

Every scalable content entity is labelled:

- prototype
- draft
- canon
- deprecated

Production chapter manifests should fail/warn when they accidentally depend on prototype content.

## Localisation / future voice readiness

Dialogue is data-driven and identified by stable dialogue/node IDs.

Text should not be embedded in scene logic.

Architecture should support:

- language packs/string tables later
- locale selection
- text expansion/layout variation
- optional audio/voice reference on a dialogue line/node in the future

No initial voice acting is required.

## Deployment

R0.2 target commands:

```text
npm ci
npm run typecheck
npm test
npm run build
```

Cloudflare Pages deploys Vite `dist/` output.

## CI gates

- typecheck
- content/schema validation
- unit/domain tests
- save tests (R0.2+ formats)
- production build
- browser smoke

Later:

- combat/splice simulations
- performance/bundle budgets
- quest/content graph checks
- asset/licensing checks

## R0.2 acceptance criteria

1. Current R0.1 behavioural loop survives migration.
2. R0.1 save may reset cleanly; R0.2 save is versioned.
3. Phaser is bundled/pinned.
4. Core splice/combat calculations are browser-independent.
5. Content definitions validate.
6. RNG is injectable/seeded.
7. Input is semantic and remapping-ready.
8. Creature schema supports cumulative irreversible history and persistent identity.
9. Save schema distinguishes main roster, lab stock, material and knowledge.
10. Browser build/deployment/tests pass.

## Execution mapping

The architecture is implemented by `ROADMAP.md` and the detailed contracts in `work-packages/R0_FOUNDATIONS.md`, especially WP0.2A–E. Later domain contracts are extended deliberately by the splicing/combat/world WPs rather than through ad-hoc scene changes.
