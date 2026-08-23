# WP0.4D — Runtime Protagonist Sprite Production

**Status:** APPROVED ART INTEGRATION CANDIDATE

WP0.4D converts the four approved protagonist sheets into real runtime assets and replaces the rejected ultra-minimal 24×32 pass.

## Approved runtime asset contract

Each protagonist has one PNG spritesheet at `public/assets/protagonists/<id>.png`.

- protagonists: Milo, Theo, Ada and Pip;
- frame size: 64 × 96 px;
- sheet size: 256 × 384 px;
- columns: idle, walk 1, walk 2, walk 3;
- rows: down, left, right, up;
- frame indices: 0–15 in row-major order;
- gameplay scale: 1×;
- review scale: 2×;
- nearest-neighbour texture filtering;
- bottom-centre sprite origin so feet remain anchored during movement.

Stable protagonist IDs are `milo`, `theo`, `ada` and `pip`. Runtime texture keys are `protagonist-<id>` and animation keys are `protagonist-<id>-<direction>-<idle|walk>`.

## Actual game integration

The existing Lab gameplay remains mechanically unchanged, but its temporary procedural figure is replaced at runtime with the approved protagonist renderer. Milo is the default until WP0.4E implements character selection and persistence.

For WP0.4D branch testing only, the protagonist can be changed with:

- `?protagonist=milo`
- `?protagonist=theo`
- `?protagonist=ada`
- `?protagonist=pip`

The isolated visual review route remains available with `?spriteTest=1`.

To review a protagonist immediately inside the real Lab without replaying the intro, use `?labTest=1&protagonist=<id>`.

## Cosmetic extension boundary

WP0.4D does not implement a character creator, but the protagonist definition now separates authored identity from future cosmetic choices.

WP0.4E may add a small set of controlled options, particularly skin tone and limited authored accent/accessory variants. Do not apply whole-sprite tinting because that would recolour clothes, hair and biotech equipment. Use targeted masks, authored palette variants or overlays instead.

The protagonists must remain recognisably Milo, Theo, Ada and Pip rather than becoming fully modular avatars.

## Automated checks

`tests/protagonist-sprites.test.mjs` verifies:

- the exact four protagonist IDs;
- 64 × 96 frame dimensions;
- four rows and four columns;
- deterministic direction/frame ordering;
- exact 256 × 384 PNG dimensions;
- the lightweight appearance boundary;
- removal of the failed base64-in-TypeScript asset experiment.

Existing typecheck, content, RNG, domain/save tests, production build and browser smoke remain required.

## Save/schema impact

None. WP0.4D changes presentation/runtime rendering only. Character choice and cosmetic persistence belong to WP0.4E.
