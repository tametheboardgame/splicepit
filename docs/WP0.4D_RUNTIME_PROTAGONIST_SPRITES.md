# WP0.4D — Runtime Protagonist Sprite Production

**Status:** IMPLEMENTATION CANDIDATE — HUMAN VISUAL GATE PENDING

This package converts the four approved SpliceApprentice concepts into fixed-grid runtime pixel assets. It does not implement character selection or the Apprentice Splicer Yard.

## Runtime asset contract

Each protagonist has one PNG spritesheet at `public/assets/protagonists/<id>.png`.

- frame size: 24 × 32 px;
- sheet size: 96 × 128 px;
- columns: idle, walk 1, walk 2, walk 3;
- rows: down, left, right, up;
- frame indices: 0–15 in row-major order;
- runtime review scale: 4×;
- feet share a consistent bottom origin across frames and protagonists;
- Phaser textures explicitly use nearest-neighbour filtering.

Stable protagonist IDs are `milo`, `theo`, `ada` and `pip`. Runtime texture keys are `protagonist-<id>`.

Animation keys follow:

`protagonist-<id>-<direction>-<idle|walk>`

The shared metadata and animation helpers live in `src/player/protagonists.ts` and `src/render/protagonistSprites.ts` so WP0.4E can consume the same assets without re-declaring frame numbers.

## In-engine review route

Open the build with:

`?spriteTest=1`

The isolated `ProtagonistSpriteTestScene` loads the real runtime PNGs, displays all four at the locked 4× scale and automatically cycles down/left/right/up walking animations.

The review is deliberately neutral. It does not introduce character-selection UX, environment art or a new UI system.

## Automated checks

`tests/protagonist-sprites.test.mjs` verifies:

- the exact four protagonist IDs;
- the 24 × 32 frame contract;
- four rows and four columns;
- deterministic direction/frame ordering;
- exact 96 × 128 dimensions for every PNG.

Existing typecheck, content, RNG, domain/save tests, production build and browser smoke remain required.

## Save/schema impact

None. WP0.4D introduces presentation assets and runtime animation metadata only.

## Human gate

Before WP0.4E begins, human review must confirm that all four protagonists:

1. remain individually recognisable at play scale;
2. preserve their approved silhouette, hair and major colour identity;
3. retain at least one readable biotech/scavenger accessory cue;
4. animate cleanly in all four directions;
5. keep their feet visually locked instead of bobbing or sliding incorrectly;
6. look deliberate rather than like enlarged concept-art fragments or procedural placeholders.
