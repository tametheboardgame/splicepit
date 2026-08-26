# WP0.6D1 — Mobile Gameplay Controls

Status: **IMPLEMENTED**

Authoritative insertion: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-26_MOBILE_CONTROL_INSERT.md`

## Goal

Remove the mobile playtest blocker between character selection and WP0.6E by giving touch devices a real gameplay control surface that feeds the existing semantic input contract.

## Implementation

- `src/input/actions.ts` now defines physical touch-control bindings alongside keyboard bindings.
- `src/input/BrowserSemanticInput.ts` accepts semantic input events in addition to keyboard events.
- `src/input/mobileGameplayControls.ts` renders touch controls only while the accepted Yard/opening-world runtime is active on a touch-capable device.
- The touch Action control resolves through the binding profile to Interact, Confirm and Lab Interact, matching the existing shared keyboard Space behaviour.
- Back resolves to Cancel / Lab Cancel.
- Bag and Map remain dedicated semantic actions.
- Direction buttons are holdable and separate pointer IDs are retained so movement can continue while another action is pressed.
- `viewport-fit=cover`, safe-area offsets, `touch-action: none` on gameplay controls and overscroll suppression protect phone interaction from browser gestures.
- Tutorial prompt hints use touch labels automatically when touch input is available.

## Visible control surface

Lower-left:

- Up;
- Left;
- Right;
- Down.

Lower-right:

- Action;
- Back;
- Bag;
- Map.

The semantic Menu touch binding is reserved but no visible gameplay Menu button is exposed yet because the current opening-world runtime has no real in-game menu consumer. Final splice and battle touch layouts remain deliberately deferred until those interactions are designed.

## Regression coverage

Unit coverage verifies touch bindings and ensures the mobile control module emits semantic events rather than synthetic keyboard events.

The player-facing mobile smoke uses a `412 × 915` emulated touch viewport and verifies:

- controls stay hidden during character selection;
- default-character confirmation works by touch;
- touch controls appear in the Yard;
- tutorial hints switch to touch labels;
- D-pad movement works;
- Interact / Bag / Confirm / Back / Map onboarding can be completed by touch;
- simultaneous movement + Action pointers preserve movement;
- the authored Yard → Master Lab route can be traversed using only the touch D-pad;
- the mobile UI introduces no horizontal page overflow.

## Validation

The complete repository gate passed on PR #46:

- TypeScript typecheck;
- content validation;
- RNG boundary validation;
- unit/domain/save tests;
- production build;
- full player-facing browser smoke suite, including the new touch-only mobile gameplay regression.

## Next package

After merge: `WP0.6E — Master Lab Interior`.
