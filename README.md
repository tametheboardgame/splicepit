# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, splicing creatures, and testing the results in the Fit Pits.

R0.1 is the first complete browser vertical slice proving the established loop: obtain a base animal, recover genes, splice a viable creature, then fight it in a Fit Pit.

Live prototype: https://splicepit.pages.dev/

## Planning source of truth

Before expanding the prototype, the project now uses a detailed planning pack under `docs/`.

Start with:

- `docs/PLANNING_INDEX.md` — planning map and status language.
- `docs/MASTER_PLAN.md` — product pillars, development rules and system dependencies.
- `docs/ROADMAP.md` — staged roadmap from R0.2 architecture hardening through release candidate.
- `docs/DECISION_LOG.md` — locked, planned, provisional, prototype-only and open decisions.

System plans:

- `docs/SPLICING_SYSTEM.md`
- `docs/COMBAT_SYSTEM.md`
- `docs/WORLD_PROGRESSION.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/CONTENT_AND_PRESENTATION.md`
- `docs/TEST_STRATEGY.md`

## Run R0.1 locally

The current R0.1 implementation is deliberately static. No package install is required.

1. Run `npm run dev` (or any static HTTP server).
2. Open `http://localhost:8080`.

Phaser 3.90.0 is loaded from cdnjs by `index.html`. The roadmap plans migration to TypeScript + Vite + a pinned Phaser dependency during R0.2.

## Verify

- `npm run check` checks JavaScript syntax.
- `npm test` runs pure game-system tests.
- `npm run verify` runs both.
- GitHub Actions also runs the full headless browser smoke flow.

## Deployment

R0.1 is deployed through Cloudflare Pages. R0.2 will introduce a production build pipeline and deploy a generated `dist/` directory.

## Canon

See `docs/DESIGN_BASELINE.md` and `docs/DECISION_LOG.md`.

Prototype animals, genes, combat rules, debt values, opponents and other implementation examples are not locked story/game canon unless deliberately promoted.
