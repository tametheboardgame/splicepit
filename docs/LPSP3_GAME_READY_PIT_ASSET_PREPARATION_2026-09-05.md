# LPSP-3 — Game-Ready Pit Asset Preparation

Status: **IMPLEMENTED / VALIDATION PENDING**

Date: 5 September 2026

Authority: `docs/LPSP2_BRIGHT_LOCAL_PIT_MASTER_2026-09-05.md`, `docs/LPSP1_HOLISTIC_LOCAL_PIT_ART_BRIEF_2026-09-05.md`, and the approved Yard/Route scene-image architecture.

## Purpose

Turn the exact human-approved LPSP-2 daytime Bramble Pit master into a deterministic repository-owned production asset without changing composition, collision, story semantics or battle mechanics.

## Approved source identity

- generation ID: `29a7292d-3e04-45ce-9cb9-62d68c458eea`;
- source raster: `1536 × 1024` RGB PNG;
- source bytes: `4,193,815`;
- source SHA-256: `751b46842e0630a5cba646f13f5e170a8aae81ee94b21b6f119f32ad014dc6ce`.

The source itself remains the LPSP-2 visual authority. LPSP-3 locks only its production derivative.

## Production derivative

The selected deterministic derivative is:

- `1024 × 683` RGB JPEG;
- `250,783` bytes;
- SHA-256 `ee9fe9b78c0165131abb3e014177e39cc52d7c5595266fefb10f3ee9092d8b81`;
- repository canonical source: `src/assets/lpsp3/local-pit-bright-base64.txt` (Base64 encoding of the exact production JPEG).

Exact derivation recipe used for the canonical production JPEG:

- source converted/read as RGB;
- resize `1536 × 1024 → 1024 × 683`;
- Pillow `12.3.0`;
- Lanczos resampling;
- JPEG quality `75`;
- chroma subsampling `2` / 4:2:0;
- `optimize=True`;
- `progressive=False`.

The 1024 × 683 derivative was visually checked against the approved source before lock. It retains the arena, registration/prep functions, livestock infrastructure, route mouths and environmental detail at game-asset scale.

## Canonical storage decision

The connector does not accept a local binary file directly, so LPSP-3 stores the exact production JPEG bytes as one canonical Base64 text source at `src/assets/lpsp3/local-pit-bright-base64.txt`.

This remains an exact-byte contract rather than a loose image reference:

- the Base64 source decodes to exactly `250,783` bytes;
- decoded SHA-256 must equal `ee9fe9b78c0165131abb3e014177e39cc52d7c5595266fefb10f3ee9092d8b81`;
- decoded dimensions must equal `1024 × 683`;
- materialisation fails before build if any byte changes;
- CI verifies the built JPEG independently after Vite output;
- Chromium then fetches and decodes the production web asset independently.

Unlike the older RSP-3 transport, this uses one canonical Base64 file rather than many ordered fragments, eliminating fragment-order bookkeeping while retaining connector-safe text storage.

## Generated production outputs

`scripts/materialize-lpsp3-pit.mjs` validates and decodes the canonical Base64 source and, with `--write`, produces:

- `/generated/lpsp3/local-pit-bright-base.jpg`;
- `/generated/lpsp3/local-pit-bright-foreground.png`;
- `/generated/lpsp3/local-pit-bright-scene.json`.

The foreground PNG is an exact-size fully transparent staging layer reserved for LPSP-6 foreground/depth authoring. It is not production foreground art yet.

## World mapping

LPSP-3 locks an integer `3×` source-pixel world mapping:

- source raster: `1024 × 683`;
- world: `3072 × 2049`;
- camera reference: `1280 × 720`;
- source pixel scale: `3`;
- minimum intended distinct traversal beats: `4`.

Rationale:

- preserves integer nearest-neighbour presentation;
- matches the proven authored Route scale;
- gives sufficient world footprint for arrival/registration, prep, arena and result/exit camera beats;
- avoids shrinking the holistic Pit back into a one-screen board;
- leaves the arena large enough to feel like a physical venue while allowing LPSP-5 to choose a fight camera framing within the same authored world.

This does **not** freeze player or creature spawn coordinates. LPSP-4 derives those from visible geometry.

## Battle-space rule

The production manifest records one battle-specific invariant only:

> The opening tutorial battle must frame the same authored `pit-battle-floor` physically reached through exploration.

LPSP-3 does not define combatant positions, turn UI, attack areas, grid/marker logic or exact battle boundaries. Those remain LPSP-4/LPSP-5/WP0.9 responsibilities.

## Validation contract

LPSP-3 adds four independent gates:

1. source validation: exact JPEG byte length, SHA-256 and dimensions;
2. deterministic materialisation: exact generated base + exact-size foreground + manifest;
3. dist verification after Vite build: exact byte/hash/dimension and manifest/world contract;
4. Chromium decode smoke: fetch the built JPEG through the production web path, decode it as an image, and verify exact dimensions/byte length.

`npm run verify` owns source/tool/dist validation. `npm run smoke` owns independent browser decode.

## Deliberately unchanged

LPSP-3 does not activate the new Pit scene in production.

Unchanged until later packages:

- `localPitRuntime.ts` rendering path;
- current exploration geometry/collision;
- current semantic stage coordinates;
- route ↔ Pit interaction bridge;
- Pit entry glitch;
- Bright/Dark runtime ownership;
- first-fight mechanics;
- crowd/NPC runtime behaviour;
- foreground occlusion.

## Next

**LPSP-4 — Re-author Pit Walkability / Collision / Battle Boundaries** against the exact `3072 × 2049` authored world derived here.
