# SplicePit Technical Architecture Plan

## 1. Current R0.1 architecture

R0.1 intentionally optimised for getting a working browser loop quickly:

- static HTML/CSS/JavaScript
- Phaser loaded as a browser CDN global
- Phaser scenes for title, intro, world, splice and battle
- pure-ish JavaScript modules for splice/battle logic
- localStorage persistence
- GitHub Actions syntax/unit/browser smoke tests
- Cloudflare Pages static deployment

This was appropriate for proving viability. It should not be allowed to become the permanent architecture by inertia.

## 2. R0.2 target stack — PLANNED

```text
TypeScript (strict)
    +
Vite build/dev server
    +
Phaser (pinned package dependency)
    +
Validated data/content definitions
    +
Pure domain/system modules
    +
Versioned save data
    +
Automated unit/system/browser tests
    +
Cloudflare Pages static `dist/`
```

The game remains browser-first and should not require a backend for the core single-player game.

## 3. Proposed source layout

```text
src/
  app/
    main.ts
    config.ts
  domain/
    ids.ts
    animals/
    genes/
    creatures/
    mutations/
    combat/
    inventory/
    quests/
    progression/
  systems/
    splicing/
    combat/
    saves/
    quests/
    inventory/
    rng/
  content/
    animals/
    genes/
    mutations/
    moves/
    items/
    quests/
    dialogue/
    opponents/
    locations/
  game/
    scenes/
    world/
    input/
    rendering/
    audio/
  ui/
    components/
    screens/
    theme/
  dev/
    diagnostics/
    simulation/
    fixtures/
```

Exact folder names can change. The architectural boundary is more important than the spelling.

## 4. Domain purity

Core rules should not require Phaser objects.

Examples that should be callable from Node tests:

- calculate splice compatibility
- resolve seeded splice outcome
- derive creature biology/stats
- resolve a combat action/turn
- evaluate quest objectives
- apply inventory transaction
- migrate save data

Phaser should present and orchestrate these systems rather than *be* the systems.

## 5. IDs and references

Every content entity should have a stable string ID independent of display name.

Examples:

```text
animal.rabbit_common
 gene.gecko.regeneration
mutation.calcification
move.charge
quest.chapter1.obtain_base
location.pit.main
npc.example
```

These examples do not canonise content; they illustrate ID structure.

Benefits:

- saves reference stable IDs
- display names can change
- content validation can detect missing references
- authored data can cross-reference systems safely

## 6. Content status metadata

Definitions should include a status or live in status-aware collections:

```text
prototype
 draft
 canon
 deprecated
```

Build/test tooling can warn if production chapter manifests reference prototype content accidentally.

## 7. Content validation

Before runtime, validate at least:

- unique IDs
- referenced IDs exist
- numeric ranges are sane
- required tags/fields exist
- mutually exclusive fields are not both set
- dialogue/quest graphs have valid targets
- save-visible content uses stable/versioned definitions

Validation can use TypeScript plus lightweight runtime assertions/schema tooling. Avoid adding a large dependency solely for fashion; choose what materially improves reliability.

## 8. RNG architecture

Introduce an RNG interface/service:

```text
RandomSource
- nextFloat()
- nextInt(min, max)
- pick(list)
- fork(label)       optional
- seed metadata
```

Production can use seeded PRNG state. Tests can use fixed sequences/seeds.

Do not call `Math.random()` directly inside core domain logic after R0.2.

## 9. Save architecture

### Save envelope

Indicative structure:

```text
SaveFile
- schemaVersion
- gameVersion
- savedAt
- player/progression state
- inventory/sample state
- creature roster
- world/quest state
- pit state
- generated creature seeds/history
```

Settings should be separable from gameplay save so resetting a run does not necessarily reset volume/key settings.

### Migrations

Use sequential migrations:

```text
v1 -> v2 -> v3
```

Tests should load representative old fixtures and assert the latest valid shape.

### Failure handling

Never overwrite the only readable copy with a failed migration. In-browser implementation can maintain a backup key/version before destructive writes.

## 10. State management

Avoid one global mutable object accumulating every subsystem.

Use explicit stores/services or a root game state composed of typed domains. Mutations should pass through methods/commands where invariants matter.

The project does not need a heavy frontend state framework unless complexity proves it useful.

## 11. Scene architecture

Scenes should own presentation lifecycle, not business rules.

Potential scenes/screens:

- boot/preload
- title/save selection
- world/exploration
- lab/splicing
- Fit Pit combat
- transitions/overlays as appropriate

World maps should preferably reuse one world scene with data-driven map loading rather than create a new Phaser Scene class per location.

## 12. Input architecture

Map physical inputs to semantic actions:

```text
MOVE_UP
MOVE_DOWN
MOVE_LEFT
MOVE_RIGHT
INTERACT
CANCEL
MENU
CONFIRM
BATTLE_ACTION_1...
```

This supports keyboard remapping and later controller/touch bindings without changing game logic.

## 13. UI architecture

Build reusable components for:

- panels/modals
- dialogue
- choices
- lists/inventory
- tooltips/inspection
- tabs
- confirmation prompts
- progress/health/resource displays

Avoid screen-specific hard-coded positioning becoming the only UI mechanism. The game still uses Phaser, but layout utilities should be reusable and responsive to the fixed logical canvas/window scale.

## 14. Rendering architecture

Separate:

- world tile/environment rendering
- character rendering
- creature phenotype rendering
- UI

Creature rendering should consume phenotype instructions/data, not directly inspect every gene ID with `if (gene === ...)` in one giant renderer.

A registry/renderer component approach is preferable:

```text
phenotype instruction -> renderer implementation
```

## 15. Audio architecture

Add an audio manager rather than scene-specific direct sound calls.

Needs:

- master/music/SFX levels
- mute
- settings persistence
- scene/state music transitions
- graceful handling if audio assets fail

## 16. Build and deployment

R0.2 target:

```text
npm ci
npm run typecheck
npm test
npm run build
```

Cloudflare Pages:

- production/preview builds from GitHub
- build output: `dist`
- no server-side dependency required for core game

Deployment should remain replaceable/rollback-friendly through Git history.

## 17. CI gates

Every PR should eventually run:

1. TypeScript typecheck.
2. Content/schema validation.
3. Unit/system tests.
4. Save migration tests.
5. Production build.
6. Headless browser smoke.

Later phases add:

- combat simulation checks
- bundle/performance budgets
- broken content graph checks
- asset/licensing checks where automatable

## 18. Debug/developer tooling

Development builds should expose useful diagnostics without shipping intrusive debug UI by default.

Useful tools:

- current location/quest state
- save export/import
- grant sample/item
- spawn/load creature fixture
- show creature genotype/phenotype seed
- force RNG seed/outcome
- launch Fit Pit fixture
- content search/ID display

Developer tooling should speed testing and not be implemented as permanent cheats in production saves.

## 19. Performance principles

Primary risks are likely to be asset/content growth and creature phenotype composition rather than raw 2D simulation.

Plan for:

- asset atlases/lazy loading by region where useful
- reuse/caching of generated phenotype textures
- deterministic cache keys
- avoiding enormous DOM overlays
- limiting active world entities
- profiling before speculative optimisation

## 20. Security/privacy scope

Core game remains local/static, so avoid collecting user data or introducing authentication/backend services without a real feature need.

If cloud saves/accounts/telemetry are later proposed, treat them as separate architecture decisions with privacy/security implications.

## 21. R0.2 technical acceptance criteria

R0.2 completes when:

- TypeScript strict build is green.
- Phaser is bundled/pinned locally.
- Cloudflare deploys `dist` successfully.
- Current R0.1 behaviour is preserved.
- Core domain tests run without Phaser/browser globals.
- Direct core `Math.random()` use is eliminated.
- Content references are validated.
- Save data is versioned and migration-tested.
- Input is semantic/remapping-ready.
- Browser end-to-end test remains green.
