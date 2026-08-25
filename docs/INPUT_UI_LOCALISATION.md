# SplicePit Input, UI and Localisation Contract

## Status

Introduced by WP0.2D. This is the R0.2 foundation contract for player input, reusable UI, scene transitions and localisable dialogue/string content.

Extended by WP0.6A for opening-world Bag/Map actions and reusable contextual tutorial prompts.

## Semantic input

Gameplay scenes consume semantic actions rather than physical keys.

The action catalogue includes:

- movement: `MOVE_UP`, `MOVE_DOWN`, `MOVE_LEFT`, `MOVE_RIGHT`;
- shared interaction: `INTERACT`, `CONFIRM`, `CANCEL`, `MENU`;
- opening-world access: `BAG`, `MAP`;
- current Lab context: `LAB_INTERACT`, `LAB_CANCEL`;
- current Battle context: `BATTLE_PRIMARY`, `BATTLE_SECONDARY`, `BATTLE_TERTIARY`.

`src/input/actions.ts` owns default binding profiles. `src/input/SemanticInput.ts` and `src/input/BrowserSemanticInput.ts` convert physical keyboard controls into those actions for the applicable runtime.

Keyboard is the currently supported device. The public input service accepts additional semantic adapters and the binding profile already has gamepad/touch mapping slots, so later device work does not require gameplay code to learn physical controller buttons or touch regions.

Physical key codes must remain inside the input adapter layer. Scenes must not use Phaser key codes or bind the keyboard directly.

## Keyboard foundation bindings

- movement: arrows or WASD;
- interact/Lab interact: E or Space;
- confirm: Enter or Space;
- cancel/Lab cancel: Escape;
- generic menu: Tab;
- Bag: B;
- Map: M;
- Battle primary/secondary/tertiary shortcuts: 1/2/3.

`M` is reserved for the Map semantic action from WP0.6A onward rather than also firing the generic `MENU` action.

Visible interaction/tutorial hints are generated from semantic binding hints rather than hard-coding physical keys into player-facing copy.

## Contextual tutorial/help framework

WP0.6A adds `src/tutorial/tutorialFramework.ts` and the compact `src/ui/tutorialPrompt.ts` renderer.

The framework supports reusable contextual prompts for:

- movement;
- interact;
- confirm/cancel;
- Bag;
- Map;
- later splice tutorial guidance;
- later battle tutorial guidance.

Prompts resolve their displayed control hints from the binding profile, can complete automatically from observed semantic actions or manually from authored sequences, and fade away without pausing gameplay. The Apprentice Splicer Yard movement prompt is the first real integration. WP0.6C owns the authored onboarding sequence rather than WP0.6A hard-coding one.

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

The legacy/prototype scenes continue to use these primitives where retained as technical foundations. Current opening-slice canvas presentation may use newer game-native renderers where the visual reset has replaced the old player-facing UI.

## Scene transitions

`src/ui/transitions.ts` owns fade-in, fade-out transition and fade-restart behaviour for the Phaser scene foundation.

Playable Phaser scenes use the shared transition functions rather than calling `scene.start()` directly. This keeps transition timing/presentation replaceable without scene-by-scene rewrites.

## Localisation and dialogue

`src/localisation/strings.ts` owns stable string IDs, locale packs, interpolation and active-locale selection. The initial locale is `en-GB`.

`src/dialogue/catalogue.ts` separates stable dialogue IDs from display strings. Each dialogue definition contains a string ID and can optionally contain a future `audioRef`. No voice content is required or supplied by WP0.2D.

Scene-authored narrative, headings, prompts and current prototype UI labels are resolved through string IDs. Existing data definitions such as prototype animal/gene names remain content data and can be moved into production localisation manifests when those content systems are replaced by later WPs.

## Save/schema impact

WP0.2D did **not** change the R0.2 save-envelope schema introduced by WP0.2C. WP0.6A also makes no save/schema change.

Input remapping is not yet a supported player feature, so no binding data is persisted here. The separate settings store created by WP0.2C remains the intended future persistence location for remapping, locale, audio and accessibility settings.

Tutorial persistence across reloads is deliberately deferred with the opening-slice save/checkpoint work in R0.10.

## Validation gates

Automated coverage verifies:

- required semantic actions and default mappings exist;
- controller/touch extension slots remain present;
- localisation IDs/interpolation resolve correctly;
- dialogue IDs resolve through string IDs and permit an optional audio reference;
- playable scenes do not own physical key codes or direct keyboard bindings;
- playable Phaser scenes use the shared transition framework;
- browser smoke exercises the player-facing semantic controls;
- WP0.6A tutorial unit tests cover prompt definitions, binding-derived hints, action-driven/manual completion and reset behaviour;
- WP0.6A browser smoke proves the Yard prompt renders without modal interruption, movement remains active, real movement completes the prompt and the prompt fades cleanly.

Save/schema impact: none.
