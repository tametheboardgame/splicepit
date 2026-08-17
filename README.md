# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, experimenting on test animals, irreversibly splicing a small number of persistent creatures, and testing the results in semi-legal Fit Pits.

R0.1 is the accepted first browser vertical slice. R0.2A migrates that same behavioural slice onto the production browser toolchain.

Live prototype: https://splicepit.pages.dev/

## Planning source of truth

Start with:

- `docs/DECISION_LOG.md` — authoritative locked/open decisions.
- `docs/ROADMAP.md` — master execution roadmap with 74 WPs from R0.2 through release candidate.
- `docs/PLANNING_INDEX.md` — planning/document map.
- `docs/MASTER_PLAN.md` — product pillars and development rules.

Detailed work-package contracts:

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

A future implementation session can start with a WP command such as `Start WP0.2B`. The WP contract and decision log define the scope/gate.

## Local development

Requirements: Node.js 20 or newer.

1. Run `npm install` (use `npm ci` once the lockfile is present).
2. Run `npm run dev`.
3. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Phaser 3.90.0 is a pinned package dependency. The browser no longer loads Phaser from a CDN or expects a global `Phaser` object.

## Verify

- `npm run typecheck` runs strict TypeScript checking.
- `npm test` compiles the TypeScript game modules and runs the pure game-system tests against the emitted JavaScript.
- `npm run build` creates the production Vite output in `dist/`.
- `npm run verify` runs typecheck, unit tests and the production build.
- `npm run smoke` drives the built `dist/` through the R0.1 Title → Intro → Lab → Splice → Battle flow. It requires a Chromium/Chrome executable at `CHROME_PATH` or `/usr/bin/chromium`.

## Deployment

Cloudflare Pages should build with `npm run build` and publish the `dist/` directory.

## Save/schema impact

WP0.2A deliberately preserves the existing R0.1 prototype local-storage key and save shape so the toolchain migration does not mix in persistence redesign. R0.1 saves remain disposable prototype data. Versioned R0.2 save compatibility is introduced by WP0.2C as planned.

## Canon

`docs/DECISION_LOG.md` is authoritative.

Prototype code/content does not become canon merely because it exists. Provisional world, creditor and detailed upgrade-tree proposals remain labelled until explicitly approved at the decision gate recorded in the roadmap.
