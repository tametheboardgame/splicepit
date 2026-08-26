# WP0.6G — Environment Production-Art System / Bright-Dark Contract

Status: implementation package

## Authority

This package implements `WP0.6G — Environment Production-Art System / Bright-Dark Contract` from `docs/GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

WP0.6G owns the shared environment-art architecture used by the Yard, opening route, Master Lab and Local Pit. It deliberately establishes the contract before WP0.6H–K author the final bright and dark production art for those locations.

## Core visual-state contract

The opening environments now share one runtime vocabulary:

- `bright` is the normal and dominant presentation state;
- `dark` is an explicitly authored alternate state, never a generated colour filter;
- `rupture`, `dark-glimpse` and `recovery` are deterministic transition phases;
- transitions are location-scoped and presentation-only;
- forced bright, forced dark and forced transition controls are available for deterministic testing;
- corruption can be suppressed by named reasons, including opening dialogue and gameplay shells.

The controller owns no player position, collision, objective, inventory, save, story or battle state. Bright/dark changes therefore cannot alter gameplay geometry or progression by design.

## Location capability registry

The four logical opening environments are registered against three existing render surfaces:

- `yard` → `opening-world`;
- `route` → `opening-world`;
- `master-lab` → `master-lab`;
- `local-pit` → `local-pit`.

Yard and route intentionally share `opening-world-v1` geometry because they are currently rendered in one continuous world canvas. The logical split exists so WP0.6H and WP0.6I can author distinct visual treatments without forking traversal or collision architecture.

All four capabilities advertise `bright` and `dark` authored states. Their dark-art status remains `pending` until the relevant location package supplies the actual alternate renderer. When a dark renderer is absent, the shared compositor falls back to bright art rather than synthesising a fake dark state.

## Shared authored compositor

`renderAuthoredEnvironment(...)` is the common hand-off for location art packages.

It can:

- render bright art directly;
- render dark art directly;
- crossfade between actual authored bright/dark render callbacks during a transition;
- fall back to bright when dark art has not yet been authored.

It does not apply hue rotation, saturation reduction, brightness filters or a generic full-scene tint to create a dark world.

## Material and depth language

`src/environment/environmentArtLanguage.ts` locks reusable semantic material contracts for:

- wood;
- brick;
- plaster;
- steel;
- glass;
- dirt;
- grass;
- cages;
- machinery;
- biological residue.

Each material exposes bright and dark palette roles rather than requiring every location to invent unrelated colours for the same substance.

The same module also establishes shared contact-shadow, structural-shadow and crisp pixel-edge conventions plus explicit surface-storytelling rules:

- grime follows edges and traffic rather than uniform overlays;
- rust follows metal joins, scratches and runoff;
- damp follows drains, wall bases, roof failures and low points;
- blood is authored residue with physical context, never a scene tint;
- biological residue connects to containment failure, leakage or disposal;
- damaged surfaces retain readable material identity;
- environmental animation remains subordinate to navigation.

These helpers are intentionally small. Location packages remain responsible for authored composition and detail.

## Runtime and debug controls

`src/environment/environmentVisualRuntime.ts` continuously resolves the active logical environment from the existing runtime debug contracts:

1. Local Pit when its overlay is active;
2. Master Lab when its overlay is active;
3. Yard or route from the player’s opening-world X position;
4. Yard as the safe front-door/default capability.

The browser exposes `globalThis.__SPLICEPIT_ENVIRONMENT__` with deterministic controls:

- `forceBright()`;
- `forceDark()`;
- `clearForce()`;
- `forceTransition(locationId?, durationMs?)`;
- `clearTransition()`;
- `suppress(reason?)`;
- `resume(reason?)`;
- plain `state` and `capabilities` data for regression inspection.

Opening dialogue and Bag/Map shell presentation automatically add/remove suppression reasons. Later authored cutscenes can use the same named suppression contract without inventing another corruption switch.

## Local Pit entry-glitch migration

WP0.6F1’s Local Pit entry glitch now triggers the shared `local-pit` transition contract.

Its existing slice displacement, scan noise and rupture/recovery overlay remain as transition language, but the previous hue/saturation/brightness filter and generic fake “wrong dark layer” drawing have been removed. When WP0.6K supplies authored Local Pit dark art, the transition system can reveal that actual art rather than manufacturing darkness from the bright canvas.

The existing F1 debug phase name `wrong-layer` is retained for browser-regression compatibility; it no longer means a generated dark environment.

## Explicitly deferred

WP0.6G does not:

- redraw the Yard;
- redraw the opening route;
- redraw the Master Lab;
- redraw the Local Pit;
- mark any location’s dark art as authored;
- schedule random corruption events;
- add NPC or creature corruption;
- change collision, traversal, camera, avatar scale or save data.

Those responsibilities remain with WP0.6H–L and later story/mechanics packages.

## Validation

Automated coverage proves:

- all four opening environments exist in the capability registry;
- Yard and route share their existing geometry contract while remaining distinct logical visual capabilities;
- bright, dark and transition forcing are deterministic;
- transitions are location-scoped and recover to bright;
- suppression prevents corruption presentation;
- the compositor blends authored callbacks and refuses to invent dark art when no dark renderer exists;
- the common material/surface vocabulary is present;
- the TypeScript contract compiles under the repository’s strict compiler settings.

Existing Local Pit browser smoke remains compatible with the entry-glitch phase contract. Repository CI remains authoritative for the full typecheck, content/RNG validation, unit/domain/save regressions, production build and browser smoke suite.
