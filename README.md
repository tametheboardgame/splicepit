# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, experimenting on test animals, irreversibly splicing a small number of persistent creatures, and testing the results in semi-legal Fit Pits.

The project is currently in a deliberate **graphics-first rebuild**. The old player-facing Lab/Splice/Battle presentation is prototype history, not the target game.

Live prototype: https://splicepit.pages.dev/

## Current development target

The immediate playable is intentionally small:

`Boot → Character Select → Apprentice Splicer Yard`

The player chooses one of four authored SpliceApprentices, **Milo, Theo, Ada or Pip**, enters a name, then walks around a completely new yard using polished four-direction sprite animation, collision, depth ordering and camera movement.

Major gameplay systems are deliberately paused until that walking-around experience passes human review.

**Next executable work package: `WP0.4D — Runtime Protagonist Sprite Production`.**

## Visual source of truth

- `docs/VISUAL_DIRECTION_2026-08-23.md`
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

The visual tone is premium GBA-era top-down RPG readability with original SplicePit identity: attractive and readable, but full of reckless apprentice biotech, strange specimens and **cute-but-concerning** biological wrongness.

## Planning source of truth

Start with:

- `docs/ROADMAP.md` — canonical execution roadmap, currently 80 WPs.
- `docs/VISUAL_DIRECTION_2026-08-23.md` — locked current player/environment visual target.
- `docs/DECISION_LOG.md` — authoritative locked/open product decisions except where the newer roadmap/visual lock explicitly resolves a previously open visual prototype detail.
- `docs/work-packages/R0_VISUAL_FIRST_REBASE.md` — authoritative current R0.4–R0.8 contracts.
- `docs/PLANNING_INDEX.md` — planning/document map.
- `docs/MASTER_PLAN.md` — product pillars and development rules.

Other work-package contracts:

- `docs/work-packages/R0_FOUNDATIONS.md`
- `docs/work-packages/R1_ACT1.md`
- `docs/work-packages/R2_ACT2.md`
- `docs/work-packages/R3_BETA.md`
- `docs/work-packages/R4_RELEASE.md`

System plans:

- `docs/SPLICING_SYSTEM.md`
- `docs/COMBAT_SYSTEM.md`
- `docs/WORLD_PROGRESSION.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/CONTENT_AND_PRESENTATION.md`
- `docs/TEST_STRATEGY.md`

A new implementation session should currently begin with `Start WP0.4D` and read the roadmap, visual-direction lock and active R0 work-package contract before touching player-facing code.

## Superseded visual implementation

Do not extend or treat as visual precedent:

- the deleted `VisualDirectionScene` prototype;
- current legacy Lab/Splice/Battle scene presentation;
- previous oversized/high-saturation visual passes;
- old dark-terminal styling;
- giant web-style interface cards/panels;
- removed pre-23-August visual-reference boards;
- old plans that required broad interface design or modular character customisation before movement was proven.

Presentation-independent domain logic, saves, input abstractions, deterministic systems and technical tests may still be reused.

## Local development

Requirements: Node.js 20 or newer.

1. Run `npm ci`.
2. Run `npm run dev`.
3. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Phaser 3.90.0 is a pinned package dependency. The browser no longer loads Phaser from a CDN or expects a global `Phaser` object.

## Verify

- `npm run typecheck` runs strict TypeScript checking.
- `npm test` compiles the TypeScript game modules and runs pure game-system tests against the emitted JavaScript.
- `npm run build` creates the production Vite output in `dist/`.
- `npm run verify` runs typecheck, unit tests and the production build.
- The existing smoke flow is legacy prototype coverage and must be rewritten as WP0.4D–G replace the reachable player flow. It is not a design specification.

## Deployment

Cloudflare Pages should build with `npm run build` and publish the `dist/` directory.

## Save/schema direction

Versioned save compatibility exists from R0.2. WP0.4E will add the selected protagonist identity (`avatarId`) and player name through the existing save/migration architecture rather than inventing a parallel persistence path.

## Canon

`docs/DECISION_LOG.md` remains authoritative for product canon. `docs/ROADMAP.md` and the dated visual-direction lock control current execution and may explicitly resolve visual prototype questions that were previously open.

Prototype code/content does not become canon merely because it exists.