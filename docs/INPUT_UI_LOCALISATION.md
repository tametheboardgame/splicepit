# SplicePit Input, UI and Localisation Contract

## Status

Introduced by WP0.2D. This is the R0.2 foundation contract for player input, reusable UI, scene transitions and localisable dialogue/string content.

## Semantic input

Gameplay scenes consume semantic actions rather than physical keys.

The initial action catalogue includes:

- movement: `MOVE_UP`, `MOVE_DOWN`, `MOVE_LEFT`, `MOVE_RIGHT`;
- shared interaction: `INTERACT`, `CONFIRM`, `CANCEL`, `MENU`;
- current Lab context: `LAB_INTERACT`, `LAB_CANCEL`;
- current Battle context: `BATTLE_PRIMARY`, `BATTLE_SECONDARY`, `BATTLE_TERTIARY`.

`src/input/actions.ts` owns default binding profiles. `src/input/SemanticInput.ts` converts physical keyboard controls into those actions.

Keyboard is the supported R0.2 device. The public input service accepts additional semantic adapters and the binding profile already has gamepad/touch mapping slots, so later device work does not require gameplay scenes to learn physical controller buttons or touch regions.

Physical key codes must remain inside the input adapter layer. Scenes must not use Phaser key codes or bind the keyboard directly.

## Keyboard foundation bindings

- movement: arrows or WASD;
- interact/Lab interact: E or Space;
- confirm: Enter or Space;
- cancel/Lab cancel: Escape;
- menu: Tab or M;
- Battle primary/secondary/tertiary shortcuts: 1/2/3.

The visible Lab interaction prompt is generated from the semantic binding hint rather than hard-coding `E` into scene text.

## Focus and selection

Shared focusable controls expose the same contract for pointer and keyboard navigation.

`FocusMenu` owns selection order and visible focus. Pointer hover requests the same focus state used by keyboard navigation, rather than maintaining a separate mouse-only selection model.

Foundation conventions:

- vertical menus use movement up/down, with left/right accepted as equivalent navigation;
- horizontal menus use left/right, with up/down accepted as equivalent navigation;
- `CONFIRM` activates the focused control;
- focus is visibly represented by a stronger outline/fill state;
- custom controls, such as splice gene cards, implement the same `FocusableControl` interface as shared buttons.

## UI primitives

`src/ui/primitives.ts` owns reusable:

- panels;
- focusable buttons;
- focus menus;
- modals;
- dialogue boxes.

The current slice uses these primitives in Title, Intro, Lab, Splice and Battle UI. `src/ui/helpers.ts` is limited to low-level presentation helpers rather than interaction policy.

## Scene transitions

`src/ui/transitions.ts` owns fade-in, fade-out transition and fade-restart behaviour.

Playable scenes use the shared transition functions rather than calling `scene.start()` directly. This keeps transition timing/presentation replaceable without scene-by-scene rewrites.

## Localisation and dialogue

`src/localisation/strings.ts` owns stable string IDs, locale packs, interpolation and active-locale selection. The initial locale is `en-GB`.

`src/dialogue/catalogue.ts` separates stable dialogue IDs from display strings. Each dialogue definition contains a string ID and can optionally contain a future `audioRef`. No voice content is required or supplied by WP0.2D.

Scene-authored narrative, headings, prompts and current prototype UI labels are resolved through string IDs. Existing data definitions such as prototype animal/gene names remain content data and can be moved into production localisation manifests when those content systems are replaced by later WPs.

## Save/schema impact

WP0.2D does **not** change the R0.2 save-envelope schema introduced by WP0.2C.

Input remapping is not yet a supported player feature, so no binding data is persisted in this WP. The separate settings store created by WP0.2C remains the intended future persistence location for remapping, locale, audio and accessibility settings.

## Validation gates

WP0.2D adds automated coverage that verifies:

- required semantic actions and default mappings exist;
- controller/touch extension slots remain present;
- localisation IDs/interpolation resolve correctly;
- dialogue IDs resolve through string IDs and permit an optional audio reference;
- playable scenes do not own physical key codes or direct keyboard bindings;
- playable scenes use the shared transition framework;
- browser smoke enters Title/Intro through keyboard confirmation, performs Lab movement/interaction/cancel through semantic controls, selects/attempts a splice through focused controls and executes a Battle action through the semantic shortcut.

Save/schema impact: none.
