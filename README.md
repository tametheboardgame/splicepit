# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, experimenting on test animals, irreversibly splicing a small number of persistent creatures, and testing the results in semi-legal Fit Pits.

The project is currently in a deliberate **graphics-first rebuild**. Old player-facing Lab/Splice/Battle presentation and the rejected first WP0.4E registration-form character selector are prototype history, not the target game.

Live prototype: https://splicepit.pages.dev/

## Current development target

The eventual first graphics-first playable remains intentionally small:

`Boot → accepted Character Select → Apprentice Splicer Yard`

The development order was corrected on 24 August 2026 after human review rejected the first visible WP0.4E character-selection screen.

The current sequence is:

**accepted Milo/Theo/Ada/Pip sprites → retained identity/save plumbing → rejected terminal/form boot removed → brand-new Apprentice Splicer Yard → in-world scale/movement/collision/depth/camera language → character-select presentation redesigned from that world language → HUMAN PLAYTEST STOP**

Major gameplay systems remain paused until that choose-and-walk experience passes human review.

**Next executable work package: `WP0.4F — Apprentice Splicer Yard Rebuild`.**

## Visual source of truth

- `docs/VISUAL_DIRECTION_2026-08-23.md`
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md`

The visual tone is premium GBA-era top-down RPG readability with original SplicePit identity: attractive and readable, but full of reckless apprentice biotech, strange specimens and **cute-but-concerning** biological wrongness.

WP0.4D human review accepted the current 64 × 96 directional protagonist source art and integer-pixel movement treatment for Milo, Theo, Ada and Pip. Final in-world display scale remains deliberately unresolved until the protagonists are judged inside the Yard.

## Planning source of truth

Start with:

- `docs/ROADMAP.md` — canonical execution roadmap.
- `docs/VISUAL_DIRECTION_2026-08-23.md` — locked current player/environment visual target, corrected 24 August.
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md` — explicit human rejection of the first visible WP0.4E screen and rules for what survives.
- `docs/DECISION_LOG.md` — authoritative locked/open product decisions except where newer dated visual execution records explicitly resolve a prototype detail.
- `docs/work-packages/R0_VISUAL_FIRST_REBASE.md` — base R0 graphics-first contracts.
- `docs/work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md` — authoritative override for affected WP0.4E–H sequencing and presentation.
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

A new implementation session should currently begin with `Start WP0.4F` and read the roadmap, visual-direction lock, visual-reset correction and active R0 contract override before touching player-facing code.

## Explicitly rejected presentation

Do not extend or treat as visual precedent:

- the deleted `VisualDirectionScene` prototype;
- legacy Lab/Splice/Battle scene presentation;
- previous oversized/high-saturation visual passes;
- old dark-terminal styling;
- the dark brown/olive `APPRENTICE REGISTRATION` WP0.4E screen;
- character tabs plus boxed preview as the default character-choice metaphor;
- visible web-form composition as the game boot;
- giant web-style interface cards/panels;
- removed pre-23-August visual-reference boards;
- old plans that required broad interface design or modular character customisation before movement/world language was proven.

Presentation-independent domain logic, saves, input abstractions, deterministic systems and technical tests may still be reused.

Automated technical success does not constitute human visual approval.

## Current boot

The rejected WP0.4E registration-form boot has been removed from source. Until the Yard exists, a deliberately temporary canvas-only protagonist harness may be used to keep the four accepted characters and identity persistence testable.

That temporary harness is **non-canon**. It is not the final character-select design. Final visible character choice is rebuilt after WP0.4F/G in repair package `WP0.4E-R` so it can inherit the actual game's world language.

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
- `npm run verify` runs typecheck, content/RNG validation, unit tests and the production build.
- `npm run smoke` runs the current player-facing browser smoke. The visual-reset smoke explicitly fails if the rejected WP0.4E form DOM becomes reachable again.

## Deployment

Cloudflare Pages should build with `npm run build` and publish the `dist/` directory from the current `main` branch.

The repository CI verifies the production build but does not itself contain a Cloudflare deployment workflow. Cloudflare Pages therefore needs its project/Git deployment configuration to be following current `main` for the live URL to update automatically.

## Save/schema direction

Versioned save compatibility exists from R0.2. The retained WP0.4E identity foundation stores the selected protagonist identity (`avatarId`) and player name through the existing save architecture rather than a parallel persistence path.

## Canon

`docs/DECISION_LOG.md` remains authoritative for product canon. `docs/ROADMAP.md` and the dated visual-direction/correction records control current execution and may explicitly resolve visual prototype questions that were previously open.

Prototype code/content does not become canon merely because it exists.
