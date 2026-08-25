# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, experimenting on test animals, irreversibly splicing a small number of persistent creatures, and testing the results in semi-legal Fit Pits.

Live prototype: https://splicepit.pages.dev/

## Current development state

The graphics-first reset has passed its intended purpose.

Human review has accepted the foundation established across WP0.4C–G and WP0.4E-R:

- Milo / Theo / Ada / Pip as the four authored protagonists;
- accepted 64 × 96 directional protagonist art;
- 1× protagonist gameplay scale;
- 1280 × 720 gameplay viewport direction;
- wider-world density and camera language;
- Apprentice Splicer Yard visual direction;
- four-direction movement, collision and camera feel;
- in-world character-selection presentation.

The old player-facing Lab/Splice/Battle presentation and the rejected dark registration-form character selector are prototype history and must not return.

The current environment art is **not final fidelity**. Its direction and scale are approved, but future work must progressively replace the blockout-like low-detail environment treatment with richer, more authored pixel art matching the care and personality of the protagonist sprites.

## Current game target

Development now proceeds towards the first real opening vertical slice:

`Splash / Title → Main Menu → New Game → Opening narration → Character choice → Basic onboarding → Find Master → RinoCow disaster → Debt confrontation → First splice tutorial → First local Pit fight → result / next hook`

The core tonal thesis is a bright, colourful, inviting monster-RPG surface with biological horror, brutality and a darker visual layer repeatedly trying to break through.

The title screen should establish this immediately: cheerful `SplicePit` presentation, brief corruption/flicker into the darker concept-art identity, then back to normal.

The opening deliberately satirises the optimistic monster-RPG introduction, then teaches controls, Bag, Map and objectives before sending the player to their Master. The Master is killed by his own spliced **RinoCow**, the inherited debt becomes the player's problem, the player learns the splice bench, creates a viable first creature, and completes the first local Pit fight.

Proper New Game / Continue / autosave behaviour is deliberately scheduled near the end of this opening-slice build. Current refresh behaviour is not a blocker.

## Next executable work package

> **Start WP0.5A — Splash / Title Corruption System**

## Planning source of truth

A new implementation session should read these in order:

- `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` — **current authoritative execution override from the accepted graphics-first foundation through the first Pit fight**.
- `docs/ROADMAP.md` — long-range master execution roadmap; older R0.4I/J–R0.8 sequencing is overridden where the dated opening-slice roadmap conflicts.
- `docs/VISUAL_DIRECTION_2026-08-23.md` — locked player/environment visual direction.
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md` — explicit rejection of the old visible WP0.4E form and rules for what survives.
- `docs/work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md` — graphics-first correction history and accepted foundation.
- `docs/DECISION_LOG.md` — product/canon authority except where a newer dated execution record explicitly resolves an opening-slice decision.
- `docs/PLANNING_INDEX.md` — planning/document map.
- `docs/MASTER_PLAN.md` — product pillars and development rules.

System plans:

- `docs/SPLICING_SYSTEM.md`
- `docs/COMBAT_SYSTEM.md`
- `docs/WORLD_PROGRESSION.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/CONTENT_AND_PRESENTATION.md`
- `docs/TEST_STRATEGY.md`

## Visual direction

The active player-facing tone is premium detailed pixel art with GBA-era readability and original SplicePit identity: attractive, readable and colourful, but full of reckless apprentice biotech, strange specimens and **cute-but-concerning** biological wrongness.

Do not interpret “GBA-era readability” as permission for crude 8-bit-looking environment blocks. The approved world scale remains, but graphics should be tightened repeatedly through the opening build with richer materials, foliage, water, buildings, props, containment equipment, shadows and environmental storytelling.

The dated opening-slice roadmap includes six explicit graphics-tightening passes rather than deferring all art quality until the end.

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
- removed pre-23-August visual-reference boards.

Presentation-independent domain logic, saves, input abstractions, deterministic systems and technical tests may still be reused.

Automated technical success does not constitute human visual approval.

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
- `npm run smoke` runs the current player-facing browser smoke.

## Deployment

Cloudflare Pages should build with `npm run build` and publish the `dist/` directory from the current `main` branch.

The repository CI verifies the production build but does not itself contain a Cloudflare deployment workflow. Cloudflare Pages therefore needs its project/Git deployment configuration to follow current `main`.

## Save/schema direction

Versioned save compatibility exists from R0.2. Proper opening-slice New Game / Continue / checkpoint persistence is scheduled in R0.10 after the story/splice/battle opening flow exists.

## Canon

`docs/DECISION_LOG.md` remains authoritative for product canon. The newer dated execution roadmaps control current implementation order and may explicitly resolve prototype questions.

Prototype code/content does not become canon merely because it exists.
