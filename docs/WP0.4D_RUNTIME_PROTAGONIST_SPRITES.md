# WP0.4D — Runtime Protagonist Sprite Production

**Status:** ANIMATED SANDBOX PLAYTEST CANDIDATE

WP0.4D establishes the four approved protagonists as the visual foundation for the graphics-first reset and proves that they can be selected, faced and moved cleanly before any old Lab/gameplay presentation is reintroduced.

## Current sandbox contract

The branch boots directly into a full-screen black movement sandbox.

- protagonists: Milo, Theo, Ada and Pip;
- approved directional source frames: 64 × 96 px;
- directions: down, left, right and up;
- review scale: 2× nearest-neighbour rendering;
- Arrow keys / WASD move continuously;
- diagonal movement is speed-normalised;
- 1 / 2 / 3 / 4 switch Milo / Theo / Ada / Pip;
- R resets the protagonist to centre;
- movement is clamped to the viewport;
- no Lab, title flow, collisions, interactions, HUD or gameplay systems are present in this review build.

## Movement animation

The earlier generated `*-hd-v2.png` 256 × 384 sheets contain invalid/blank walk cells and are not trusted as runtime animation sources.

The sandbox instead loads the approved 64 × 96 directional protagonist artwork from `src/assets/frames/` and creates a four-phase walk cycle at runtime. The cycle uses integer-pixel torso bob and opposing lower-body step offsets so the approved artwork remains crisp and recognisable while moving.

Idle returns to the unmodified directional frame immediately when movement stops.

This procedural cycle is the current WP0.4D movement-animation implementation and is deliberately isolated from the rest of the game so it can be visually accepted or rejected without contaminating later world work.

## Source-art boundary

The approved protagonist identities remain Milo, Theo, Ada and Pip. Preserve their detailed hair, layered clothing, boots, straps, grime and cyan biotech accents.

Small later customisation may include skin tone and a limited number of authored accent/accessory variants. Do not use a whole-sprite tint because that would recolour clothing and equipment. Prefer targeted masks, authored palette variants or overlays. A broad modular character creator remains deferred.

## Automated checks

Repository validation remains required:

- strict TypeScript typecheck;
- content validation;
- RNG-boundary validation;
- unit/domain/save tests;
- production Vite build;
- player-facing Chromium smoke.

The browser smoke verifies all four protagonists, all four directions, visible animated movement, frame progression, return to idle, correct displacement, character switching and a single full-screen canvas.

## Save/schema impact

None. WP0.4D is presentation/runtime rendering only. Character choice and cosmetic persistence are deferred until the protagonist presentation is accepted and integrated into the rebuilt world path.

## Next gate

Human visual review of the deployed movement sandbox. Do not reintroduce the old Lab/runtime presentation until the four protagonists and their movement feel acceptable.
