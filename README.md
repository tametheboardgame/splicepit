# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, experimenting on test animals, irreversibly splicing a small number of persistent creatures, and testing the results in semi-legal Fit Pits.

R0.1 is the accepted first browser vertical slice. Development now proceeds through the detailed execution roadmap committed under `docs/`.

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

A future implementation session can start with a WP command such as `Start WP0.2A`. The WP contract and decision log define the scope/gate.

## Current R0.1 local run

The merged R0.1 implementation is deliberately static. No package install is required for that historical baseline.

1. Run `npm run dev` (or any static HTTP server).
2. Open `http://localhost:8080`.

R0.2A will migrate the project to Vite + strict TypeScript + a pinned Phaser dependency and generate a production `dist/` build.

## Verify

- `npm run check` checks current JavaScript syntax.
- `npm test` runs current pure game-system tests.
- `npm run verify` runs both.
- GitHub Actions also runs the full headless browser smoke flow.

## Deployment

R0.1 is deployed through Cloudflare Pages. R0.2A changes deployment output to the Vite production `dist/` directory.

## Canon

`docs/DECISION_LOG.md` is authoritative.

Prototype code/content does not become canon merely because it exists. Provisional world, creditor and detailed upgrade-tree proposals remain labelled until explicitly approved at the decision gate recorded in the roadmap.
