# SplicePit Yard Scene-Image Proof of Concept Roadmap — 29 August 2026

## Why this exists

Human review of the merged Pass D build found a structural visual problem that automated tests could not detect: the new environment art still reads as if it has been pasted onto the footprint of the old board-like Yard rather than authored as one holistic scene.

The correction is architectural, not another detail pass.

For the Apprentice Splicer Yard proof of concept, the environment will be treated as an **authored scene image with gameplay data layered over it**, rather than a procedural/code-drawn collection of scenery shapes.

If this Yard proof of concept succeeds visually and technically, the same architecture can then be considered for the opening route and Local Pit. Those conversions are deliberately deferred until the Yard passes a human visual gate.

**Status: READY.**

---

# Locked decisions

## What remains locked

The proof of concept keeps:

- the approved Milo / Theo / Ada / Pip protagonist art;
- protagonist world display scale;
- 1280 × 720 desktop gameplay-view direction;
- existing mobile controls and UI semantics;
- four-direction movement;
- feet-based player grounding/collision behaviour;
- Bag / Map / Action / objective semantics;
- the opening story requirement that the player begins in the Apprentice Splicer Yard and can leave towards the Master Lab;
- save/story/event contracts that do not depend on exact Yard coordinates.

## What is explicitly unlocked

Unlike Pass D, the following Yard details may change if the authored scene benefits from it:

- Yard world dimensions;
- internal Yard layout;
- exact road/path shape;
- building placement;
- prop placement;
- spawn coordinates;
- exit coordinates;
- collision geometry;
- walkable-space topology inside the Yard;
- interaction-anchor coordinates;
- camera bounds inside the Yard.

The gameplay **meaning** of the Yard remains the same, but the old map footprint is no longer a constraint.

This is essential. Reusing the old geometry underneath a new generated background would recreate the same visual failure in another form.

---

# Target architecture

The Yard scene pack should be conceptually split into four concerns.

## 1. Authored base scene

A full-scene raster image supplies the visible environment:

- coherent ground and path composition;
- buildings and workshop architecture;
- animal-handling / containment areas;
- biotech equipment and service infrastructure;
- vegetation, waste, repairs and environmental storytelling;
- baked material detail, shadows and lighting;
- no old Yard renderer visible beneath it.

The scene should be generated as a complete composition and then normalised into a game-ready asset. It must not be assembled by stamping disconnected generated props onto the previous map.

## 2. Gameplay geometry

Gameplay is authored to match the approved scene rather than the other way around.

The scene receives:

- a walkable-space / collision mask or equivalent compiled collision representation;
- feet-based collision checks for the protagonist;
- spawn point;
- Lab-route exit trigger;
- interaction anchors;
- camera/world bounds.

The visible background image is never trusted by itself for gameplay. Movement remains deterministic because collision and trigger data are explicit.

## 3. Foreground / occlusion layer

A transparent authored foreground layer supplies objects the player can pass behind, for example:

- fences;
- gantries;
- pipes;
- hanging cables;
- bench edges;
- tree canopies;
- containment structures.

The rendering order becomes approximately:

`base scene → behind-player actors/effects → player/NPCs → foreground occlusion → UI/effects`.

This is how the location can look like one finished picture without flattening the player on top of every object.

## 4. Dark/corrupted counterpart

Once the bright scene is approved technically, author a matching dark scene pack rather than relying on a colour filter.

The dark version should preserve navigational readability but physically change the environment through things such as:

- breached containment;
- biological growth through architecture;
- failed specimens;
- contaminated runoff;
- damaged equipment;
- wrong silhouettes;
- changed lighting sources;
- persistent aftermath where story state requires it.

---

# Work-package sequence

## YSP-0 — Yard Scene Contract / Technical Spike

Purpose: prove the image-backed renderer can coexist safely with current movement, camera, UI and story systems before spending time on final art.

Build/decide:

- define the scene-pack runtime interface;
- define base-image and transparent-foreground loading;
- define how world dimensions are read from scene metadata;
- define collision/walkable representation;
- define spawn, exit and interaction-anchor metadata;
- define camera bounds from the new scene rather than the old Yard constants;
- add a development-only renderer switch if useful for comparison, but never draw the old and new Yard simultaneously;
- keep the current Pass D Yard available only as a temporary fallback on the proof-of-concept branch until the new renderer is proven.

Gate:

- a temporary test image can replace the Yard visually;
- Milo can walk over it with deterministic collision;
- camera, mobile controls, Bag, Map, Action and objective UI still function;
- the old Yard is not visible underneath the test scene.

## YSP-1 — Holistic Yard Art Brief / Composition Lock

Purpose: define the whole location before generating final scene art.

The brief must establish:

- one strong visual identity for the Apprentice Splicer Yard;
- one primary focal composition around apprentice biotech work/containment;
- a clear player arrival/spawn area;
- a readable route towards the Master Lab exit;
- workshop/service architecture that feels built for irresponsible gene-splicing apprentices;
- believable animal holding, specimen containment, tanks, pipes, cages, drains, workbenches, repairs and waste;
- attractive bright-world colour and warmth;
- environmental storytelling without procedural-looking clutter;
- enough open walkable space for movement and touch controls;
- composition that works at the accepted gameplay camera scale.

Visual constraints:

- premium detailed pixel-art appearance;
- environment detail density compatible with the approved protagonist sprites;
- readable silhouettes at mobile gameplay size;
- no board-game rectangles, arbitrary lawn panels or isolated pasted-on prop islands;
- paths and architecture must belong to one designed place.

Gate:

- the scene can be described as one coherent location before any collision data is considered.

## YSP-2 — Generate and Select Bright Yard Master Scene

Purpose: create the actual holistic scene rather than another code-drawn approximation.

Process:

- generate full-scene Yard concepts using the approved SplicePit visual direction, protagonist scale and Master Lab quality target;
- favour a small number of strong complete compositions rather than many minor variations;
- select the strongest composition autonomously unless there is a genuine art-direction fork;
- iterate obvious generation defects before integration;
- preserve the selected master as the visual source of truth for the scene.

Important:

- generation is for the entire scene composition;
- generated text/signage should not be trusted where exact readable wording matters; exact signs can be repaired/authored during asset preparation;
- gameplay geometry is not derived until the selected image exists.

Gate:

- by-eye screenshot review of the raw scene should already look substantially better and more holistic than the current deployed Yard before runtime integration begins.

## YSP-3 — Game-Ready Asset Preparation

Purpose: turn the selected generated master into deterministic production assets.

Build:

- crop/extend the chosen scene to the final Yard world aspect and dimensions;
- preserve crisp pixel presentation when resized/normalised;
- repair obvious generation seams, malformed props and unreadable critical signage;
- separate foreground-occluding elements into a transparent foreground image where required;
- ensure base and foreground layers align exactly;
- store scene metadata with explicit dimensions/versioning;
- preload assets so the player never sees an empty/half-loaded Yard.

Suggested scene-pack shape:

- bright base image;
- bright foreground image;
- metadata describing world dimensions and authored anchors;
- later dark base/foreground counterparts.

Gate:

- base + foreground composite reproduces the approved master scene at game scale without blur, seams or offset drift.

## YSP-4 — Re-author Walkable Space / Collision to the Scene

Purpose: make movement fit the art rather than forcing the art to fit legacy colliders.

Build:

- create a Yard-specific walkable/collision mask or equivalent authored representation;
- use protagonist feet/hitbox checks against the new geometry;
- create a safe spawn area;
- create a clear Lab-route exit corridor;
- keep important visual objects solid where expected;
- make paths, gates, fences, buildings and water visually agree with collision;
- update camera/world bounds to the new scene;
- remove dependence on old `YARD_COLLIDERS` for the image-backed Yard path once replacement geometry is proven.

Gate:

- no invisible walls in visually open space;
- no walking through visually solid architecture;
- player can reach all required Yard tutorial/objective points and the Lab-route exit;
- movement remains reliable with keyboard and touch controls.

## YSP-5 — Interaction Anchors / Tutorial and Objective Integration

Purpose: reconnect opening gameplay semantics to the new layout.

Re-author coordinates for:

- opening spawn/arrival;
- tutorial interaction points;
- Bag/Map onboarding expectations where spatially relevant;
- any Yard NPC/action anchors;
- route-to-Lab handoff;
- camera focus targets used by the opening sequence.

Rules:

- interaction positions must be chosen because they make sense in the new scene;
- do not preserve old coordinates merely to avoid changing tests;
- tests must follow semantic anchors/IDs where possible instead of brittle legacy x/y assumptions.

Gate:

- fresh new-game onboarding completes naturally in the new Yard;
- objective progression reaches `Find your Master` and exits correctly toward the Lab route.

## YSP-6 — Foreground Depth / Character Grounding

Purpose: make protagonist sprites feel embedded in the image rather than pasted over it.

Build:

- integrate the transparent foreground layer;
- establish intentional behind/in-front relationships;
- ensure foreground never hides critical controls, interaction points or large parts of the protagonist unintentionally;
- align protagonist contact shadow and foot position with the scene lighting/materials;
- verify foreground behaviour across vertical movement and camera scrolling.

Gate:

- screenshots show the character occupying the same visual world as the background;
- player can walk behind appropriate objects without depth popping or incorrect occlusion.

## YSP-7 — Bright Yard Runtime Replacement

Purpose: make the image-backed Yard the real production path for the proof of concept.

Build:

- switch normal Yard rendering to the scene pack;
- stop drawing Pass D procedural Yard scenery in the active path;
- retain old renderer only behind an explicit temporary development fallback until human approval if rollback safety is useful;
- ensure asset loading failure produces a controlled error/fallback rather than a partially layered scene;
- update visual/runtime contracts and smoke tests to assert the image-backed scene mode.

Gate:

- deployed bright Yard contains no visible old-board scenery underneath or around the scene image;
- full onboarding and route handoff work on the image-backed renderer.

## YSP-8 — Authored Dark Yard Scene Pack

Purpose: prove the architecture also supports SplicePit’s bright/dark story language.

Process:

- use the approved bright Yard as the layout reference;
- generate/author a matching dark counterpart with physical environmental changes;
- normalise dark base and foreground to the exact bright-scene dimensions and anchor system;
- keep collision stable unless a story beat explicitly requires an authored movement change;
- transition corruption/flicker between coherent scene states rather than between procedural overlays.

Gate:

- bright ↔ dark transitions preserve player position/camera correctly;
- dark state is recognisably the same Yard but physically wrong;
- no alignment jump between scene packs.

## YSP-9 — Mobile / Performance / Regression Hardening

Purpose: prove the approach is practical, not merely prettier.

Validate:

- 1280 × 720 desktop composition;
- current portrait mobile layout;
- landscape mobile layout;
- touch movement and run controls;
- camera bounds at all Yard edges;
- image decode/preload time;
- memory footprint acceptable for the opening slice;
- no browser canvas smoothing/blur regressions;
- Bag/Map/Action objective UI unchanged;
- route handoff into the existing opening route;
- save/story state compatibility;
- title/narration/selection/Yard integration regression.

Gate:

- image-backed Yard performs smoothly on the target mobile browser and desktop browser used by current smoke tests;
- no new soft lock or traversal regression.

## YSP-10 — Yard Scene-Image Human Gate

This is a hard visual decision point.

User review should answer:

1. Does the Yard finally read as one holistic authored place rather than scenery pasted onto a board?
2. Does it look like it belongs in the same game as the protagonist sprites and Master Lab?
3. Does the protagonist look naturally embedded in it?
4. Is movement/readability still good on mobile?
5. Is the scene-image architecture good enough to propagate to the opening route and Local Pit?

Outcomes:

- **APPROVE:** scene-image architecture becomes the preferred environment model for the remaining weak opening locations; create follow-on Route and Local Pit conversion packages.
- **REVISE:** iterate the Yard scene only; do not propagate yet.
- **REJECT ARCHITECTURE:** keep the experiment isolated and reassess without destabilising the rest of the game.

No Route or Local Pit scene-image conversion begins before this human gate.

---

# Implementation order

Autonomous order is locked as:

`YSP-0 Technical Spike → YSP-1 Art Brief → YSP-2 Bright Master Generation → YSP-3 Asset Preparation → YSP-4 Collision/Walkability → YSP-5 Interactions → YSP-6 Foreground Depth → YSP-7 Bright Runtime Replacement → YSP-8 Dark Scene → YSP-9 Hardening → YSP-10 Human Gate`

The implementation should proceed autonomously between technical packages. Stop for user input only if a genuine visual choice cannot be made from the existing direction, or when YSP-10 is reached.

---

# Success criterion

The proof of concept is successful only if the deployed Yard looks like **one authored scene first and a navigable game map second**, while still playing reliably.

Automated tests are necessary but cannot pass YSP-10 on their own.
