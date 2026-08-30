# YSP-6 — Foreground Depth / Character Grounding

Date: 30 August 2026
Status: COMPLETE

## Purpose

Make the approved protagonist sprite feel embedded in the recovered Bright Yard scene without generating or repainting another environment image.

## Implementation

YSP-6 preserves the complete YSP-5 gameplay contract:

- 1280 × 720 approved Bright Yard base;
- YSP-4 collision geometry;
- YSP-5 semantic interaction anchors;
- `Find your Master` objective progression;
- Master Lab tunnel handoff into the existing authored route.

The scene contract is versioned as `yard-bright-scene-ysp6-v1`.

### Exact-pixel foreground depth

Rather than introducing a separately generated foreground image, YSP-6 redraws selected regions from the already-decoded approved Bright Yard base after the protagonist when the protagonist's feet are behind those features.

This keeps foreground pixels exactly identical to the approved scene and avoids colour, compression, alignment and seam drift.

Authored foreground regions:

- service-ring front rim;
- west front rail of the splice pit;
- east front rail of the splice pit;
- Master Lab tunnel rail and threshold.

Each region has an authored `sortY`. It is only rendered over the protagonist when the protagonist's feet are physically behind that feature.

The original transparent YSP-3 foreground staging plate remains aligned in the scene pack, but current YSP-6 occlusion does not depend on newly painted pixels.

### Character grounding

The Yard uses a restrained scene-specific contact shadow:

- vertical offset: -4 px;
- horizontal radius: 20 px;
- vertical radius: 6 px;
- alpha: 0.24.

The player feet position remains the authoritative movement, collision and depth reference.

## Regression coverage

Automated scene-pack tests verify:

- YSP-6 collision is unchanged from YSP-5;
- semantic anchors and exits are unchanged;
- all foreground regions remain inside the 1280 × 720 scene;
- foreground sorting changes correctly as the player's feet move through the scene;
- the contact-shadow contract remains stable.

The player-facing Chromium smoke verifies:

- the recovered Bright Yard is the active raster;
- the YSP-6 scene pack is selected;
- the service-ring foreground activates after the player moves behind it;
- the authored service-ring interaction still resolves;
- onboarding still reaches `Find your Master`;
- the player can still traverse to the visible tunnel;
- the tunnel still hands off into the existing Master Lab route;
- no legacy Yard renderer is mixed underneath the scene-image path.

## CI result

GitHub Actions run #1131 passed:

- typecheck;
- content validation;
- RNG validation;
- YSP-3 image-integrity validation;
- all unit/domain/save tests;
- production build;
- full player-facing browser smoke suite.

An earlier run #1130 exposed a test-route coupling caused by the extra movement used to probe foreground depth. The smoke was corrected to return to the proven YSP-5 route baseline after the isolated depth probe; no scene geometry or gameplay behaviour was weakened.

## Gate result

YSP-6 passes its technical gate:

- the protagonist has a scene-specific contact shadow;
- foreground scene features can naturally occlude the protagonist;
- occlusion uses exact approved scene pixels;
- interaction, objective and route semantics remain intact;
- mobile touch traversal remains functional.

Visual acceptance of the overall scene remains reserved for the YSP-10 human gate.

## Next

YSP-7 — Bright Yard Runtime Replacement.
