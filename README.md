# SplicePit

SplicePit is a top-down 2D RPG about acquiring animals and genetic material, splicing creatures, and testing the results in the Fit Pits.

This repository starts from a greenfield browser implementation. The first milestone is a small but complete vertical slice proving the established loop: obtain a base animal, recover genes, splice a viable creature, then fight it in a Fit Pit.

## Run locally

The game is deliberately static for R0.1. No package install is required.

1. Run `npm run dev` (or any static HTTP server).
2. Open `http://localhost:8080`.

Phaser 3.90.0 is loaded from cdnjs by `index.html`.

## Verify

- `npm run check` checks JavaScript syntax.
- `npm test` runs pure game-system tests.
- `npm run verify` runs both.

## Cloudflare Pages

R0.1 needs no build step. When it is ready to publish, connect this repository to Cloudflare Pages and deploy the repository root as the static output. A later release can introduce a bundler/asset pipeline without changing the game model.

## Canon

See `docs/DESIGN_BASELINE.md`. Prototype animals/genes used to prove systems are implementation examples, not locked story canon.
