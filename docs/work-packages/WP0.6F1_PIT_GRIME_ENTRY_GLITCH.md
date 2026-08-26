# WP0.6F1 — Local Pit Grime / Entry Glitch

Status: implementation follow-up

## Authority

This follow-up records human review of WP0.6F on 26 August 2026.

The Local Pit foundation was approved directionally, with two immediate changes requested before the later full Graphics Tightening Pass B:

1. the Pit should already feel noticeably grimier even while the game is showing its normal bright / happy graphical layer;
2. entering the Pit should briefly rupture into the darker underlying visual language before returning to the normal presentation.

This package deliberately remains a small tightening pass. It does not attempt final production art for the Pit.

## Happy-layer grime

The normal Local Pit presentation now carries permanent authored grime including:

- churned mud and traffic marks on the exterior approach;
- rust bleed on gates, fencing and arena metalwork;
- patched / worn signage and surfaces;
- damp staining and scuffing through interior traffic lanes;
- dirty prep machinery and cage runoff;
- sticky / badly cleaned reception and results surfaces;
- arena-edge grime, old blood staining and dirty sand;
- small wall cracks and damp streaks.

The important tonal rule is that this remains the colourful world layer. The venue is still visually inviting enough to belong to normal SplicePit, but it should no longer read as clean or hygienic.

## Entry corruption beat

`src/localPitEntryGlitch.ts` adds a transient overlay triggered whenever the Local Pit changes from inactive to active.

The beat lasts approximately 760 ms and progresses through:

- `rupture` — initial jitter / contrast flash;
- `wrong-layer` — a darker, desaturated, red-biased corrupted rendering with scan noise, displaced image slices and unsettling biological marks;
- `recovery` — distortion rapidly falls away and the normal Pit presentation returns.

The effect is intentionally brief. It should feel like the game accidentally showed the player what the Pit really is, rather than turning normal exploration into a permanently dark presentation.

This is an early local implementation of the visual language that R0.7C will later generalise for authored story use.

## Runtime contract

The glitch runtime:

- does not alter Local Pit collision or navigation;
- does not replace the normal Pit canvas;
- is pointer-transparent;
- clears itself completely after recovery;
- exposes `globalThis.__SPLICEPIT_PIT_ENTRY_GLITCH__` for browser regression coverage;
- increments its glitch count on each fresh Pit entry.

Stable debug phases are:

- `idle`
- `rupture`
- `wrong-layer`
- `recovery`

## Validation

The Local Pit production browser smoke now verifies:

- the corruption overlay becomes visible after Pit entry;
- at least one corrupted phase is observed;
- the overlay is 1280 × 720 and renders above the Pit during the beat;
- the corruption resolves back to `idle` and the overlay becomes hidden;
- the normal Local Pit remains active after recovery;
- the happy layer contains a minimum grime/dark-detail density;
- Bag / Map behaviour, reception travel and Yard return remain intact.

## Deferred polish

Graphics Tightening Pass B still owns the later production-quality art pass for the Pit. WP0.6F1 establishes the direction and visual contrast now so later artwork can amplify it rather than rediscover it.
