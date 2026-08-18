# WP0.4D Interface Style System

**Status:** IMPLEMENTED — HUMAN GATE PENDING

**Date:** 18 August 2026

**Depends on:** approved WP0.4C top-down pixel-RPG direction and the committed visual target board.

## Purpose

Turn the approved SplicePit screenshots into a reusable in-game interface language without allowing the UI to become the visual subject. Exploration remains world-first; overlays exist to answer immediate player questions and then get out of the way.

## Typography hierarchy

The transition baseline uses the system monospace stack already available in the browser. A production pixel font can replace the face later without changing the hierarchy.

- Title: 18 px, bold, uppercase where appropriate.
- Heading: 14 px, bold.
- Body: 12 px.
- Small body/action copy: 10 px.
- Labels/status headings: 9 px, bold.
- Micro/help/meta: 8 px.

Text is sentence case for dialogue and descriptive content. System labels, locations, commands and short HUD headings may use uppercase.

## Panel treatment

- Blackened-metal rather than cream/card surfaces.
- Square or near-square corners, not soft web-card rounding.
- Two-stage frame: dark outer edge, utility-metal inner line.
- Optional 2 px accent witness line near the upper-left edge.
- Default panel fill remains near-black and slightly translucent where world context matters.
- Decorative chrome is deliberately thin; no giant empty headers.

## Spacing grid

Base spacing unit: 4 px.

Primary rhythm: 4 / 8 / 12 / 16 / 24 px.

- 4 px: borders, slot gaps, tiny icon spacing.
- 8 px: compact internal groups.
- 12 px: normal text/panel padding.
- 16 px: major internal separation.
- 24 px: separate functional regions only.

## Colour rules

Inherited from WP0.4C:

- green = viable biotech, player-positive state, active machinery;
- amber/orange = objectives, heat, caution, industrial activity;
- red = danger, hostile state, blood/failure;
- cyan = secondary resource/data/clinical state;
- bruise/plum = rare specialist state, not general decoration;
- neutral dark materials carry most of the screen.

Colour never carries state alone; labels, icons, bars or framing also communicate meaning.

## Buttons and selection

Buttons are 34 px high at the current 960×540 logical resolution. They use a dark raised surface, thin metal border and a narrow left accent strip.

Focus/selection:

- selected control gains a stronger accent border;
- text becomes brighter;
- selection never depends on a large colour fill;
- mouse hover requests the same focus state used by keyboard/controller navigation;
- touch targets remain materially larger than the visible glyph/label.

## Context prompts

World interaction prompts should normally be a compact key/control capsule plus one short action phrase, for example `E  Use splicer`.

Prompts appear close to the relevant world object where practical. They should not open a central card simply to state an available interaction.

## Tooltips

Tooltips are compact information panels with:

- one short label;
- one or two short explanatory lines;
- amber by default when describing an object or warning;
- width driven by content rather than a global large-card size.

## Dialogue

Dialogue occupies a shallow lower-screen strip rather than a large central modal.

- speaker label at the upper-left;
- readable 12 px body copy;
- small continuation prompt at lower-right;
- background remains visible unless accessibility/focus requires stronger separation.

## Inventory and selection grids

Inventory uses compact 42 px slots at the current logical resolution. The selected slot receives a stronger accent frame. Quantity is a small lower-right annotation. Detailed description belongs beside the grid rather than inside every slot.

## HUD conventions

Exploration HUD is distributed to the screen edges:

- player status: upper-left or lower-left depending on scene needs;
- objective/context: upper-right;
- temporary interaction prompt: near the interacted object;
- inventory quick view/action strip: edge-mounted and removable;
- no permanent central HUD.

Battle may dedicate more space to status because combat is the active task, but the same panel, typography, colour and selection language applies.

## World-integrated versus overlay UI

Prefer world integration for:

- shop/stall identity;
- machine purpose;
- room navigation;
- specimen state that can be shown physically;
- doors, cages, benches and interaction zones.

Use overlay UI for:

- exact numbers;
- current objective wording;
- dialogue;
- inventory management;
- accessibility labels;
- combat choices and status;
- information the world cannot communicate reliably at gameplay scale.

## Desktop, controller and touch baseline

- Phaser retains the 960×540 logical canvas with FIT scaling.
- Pixel-art nearest-neighbour rendering remains enabled.
- Existing semantic-input focus menus remain the controller/keyboard contract.
- Pointer hover/click maps onto the same focus/activate path.
- Visible buttons remain compact while interactive hit areas meet or exceed the visual control size.
- Future touch controls should use the same actions rather than scene-specific pointer-only behaviour.

## Short-height viewport rule

The browser shell now has an additional ≤620 px-height layout that collapses non-game chrome before shrinking the gameplay area further. The game remains the dominant viewport subject on laptop screens.

## Review implementation

Open the branch deployment with:

`?interfaceStyle=1`

The sampler shows, together in one workshop view:

- title/location strip;
- player status HUD;
- objective card;
- contextual prompt;
- tooltip;
- focused action button;
- dialogue strip;
- inventory grid and selection state.

Controls:

- `Tab`: cycle selected inventory slot;
- `D`: hide/show dialogue;
- `T`: hide/show tooltip;
- `Esc`: return to title.

## Rejected traits

- cream paper/sticker cards;
- large rounded web-app panels;
- oversized headings occupying gameplay space;
- thick decorative outlines;
- permanent screen-wide HUD bars;
- large central interaction cards for ordinary world actions;
- colour-filled states without shape/text reinforcement;
- serif-heavy interface treatment;
- UI that forces the workshop/market/battle art into the background.

## Save/schema impact

None.

## Gate

Title/workshop/context/dialogue/inventory samples must feel like one game interface, remain legible, and stay subordinate to the world before WP0.4E starts.
