# WP0.4C Visual Direction Reset

**Status:** CANDIDATE — HUMAN GATE PENDING

**Date:** 18 August 2026

**Authoritative WP contract:** `docs/work-packages/R0_VISUAL_FIRST_REBASE.md`

## Purpose

Reset the presentation target before more mechanics are built. This package deliberately does not redesign splicing, combat, world progression, character creation or production assets.

The intended read is a small, animated mad-science game with restrained colour, compact characters and creatures, an intimate workshop and biological wrongness concentrated in details. The game world should be the visual subject. Interface should support it rather than occupy it.

## Visual thesis

- Cartoony and animated rather than painterly or photoreal.
- Small, deliberate silhouettes rather than giant illustrated subjects.
- Intimate top-down/three-quarter spaces rather than broad display-case compositions.
- Dark-neutral environment values with muted material colour.
- Strong colour reserved for lamps, fluids, alerts, wounds, specimens and other meaningful accents.
- Workshop first: metal, aged wood, ceramic, glass, rubber tubing, cages, notes, improvised repairs and practical lighting.
- Biological strangeness appears in creatures, jars, discarded tissue, asymmetry and machinery interfaces instead of turning every surface into horror decoration.
- Animation should make the room feel occupied and unstable through small loops, not constant screen-wide motion.

## Reference-board translation into original principles

This direction uses references only as evidence for qualities, not as assets or compositions to copy.

- Animated adventure readability becomes clean silhouettes, simplified material groups and strong foreground/background separation.
- Small-sprite charm becomes compact characters with readable posture and a few decisive shape cues at actual game size.
- Mad-science atmosphere becomes functional machinery with implausible biological attachments, specimen light, patched cables and improvised containment.
- Darker mood becomes low overall saturation and value-controlled rooms, not a return to black terminal panels.
- Horror influence becomes selective biological contradiction: something twitching in a jar, an extra eye, an unsuitable limb, a stain where it should not be. The room itself remains usable and legible.
- Polished game feel becomes restrained ambient animation, deliberate staging, compact prompts and consistent visual hierarchy rather than large decorative cards.

## Palette families

The WP0.4C direction study uses these provisional families. Exact production values remain adjustable until the visual lock.

- Void / deepest shadow: `#111414`
- Charred wall: `#1B1F1E`
- Workshop wall: `#292D2A`
- Floor neutral: `#242826`
- Utility metal: `#4A4F49`
- Highlight metal: `#6F756D`
- Aged bone / readable light: `#D1C8B5`
- Muted bone: `#9F9889`
- Moss utility colour: `#66715A`
- Deep moss: `#394139`
- Oxidised copper accent: `#A56849`
- Deep copper: `#684433`
- Bruise plum accent: `#70566E`
- Clinical cyan accent: `#6F989A`
- Acid/specimen accent: `#A6B96E`
- Blood/warning accent: `#874744`
- Warm task light: `#E4B978`

## Contrast and colour rules

- Most of the screen should sit in dark neutral, low-saturation values.
- Accent colours should normally occupy a small minority of the visible frame.
- Do not colour whole panels, floors or walls with accent hues simply to make the scene lively.
- Warm task lighting and cool specimen lighting may overlap, but neither should wash the whole room.
- Important text should target WCAG-style readable contrast against its immediate backing surface even though it is rendered inside the game canvas.
- State must never be communicated by colour alone.
- Red/blood colour is for biological consequence, danger or failed containment, not general decoration.
- Acid green is rare enough to feel meaningful when it appears.

## Proposed camera and world scale

These are WP0.4C planning values, not production locks.

- Retain the existing `960 × 540` logical game canvas for the direction study.
- Use a provisional `24 px` environmental planning grid rather than treating the current `48 px` tile as the visual scale target.
- At `24 px`, the camera sees roughly 40 columns by 22.5 rows, producing a denser and more intimate room without making the player tiny.
- Use mostly fixed or gently following top-down/three-quarter framing. Avoid dramatic zoom changes as a substitute for composition.
- Player proxy target: roughly `20–26 px` tall at the logical resolution.
- Common-creature proxy target: roughly `18–32 px` depending on species and posture.
- Large-creature proxy target: roughly `34–48 px`, used sparingly so size remains meaningful.
- Furniture should use multiple planning cells where required; the grid is for proportion and placement, not a requirement that every object visibly tile.
- WP0.4E owns the final player/creature sprite metric and rendering decision.

## UI density and spacing target

WP0.4D will define the component style. WP0.4C only sets the density target.

- Persistent HUD should use approximately 0–8% of the viewport in ordinary workshop exploration.
- Contextual information should appear close to the relevant object or edge rather than opening a large central card by default.
- Ordinary contextual prompts should normally be one or two short lines.
- Temporary panels should normally remain below roughly one third of the viewport width unless the task genuinely requires a larger surface.
- Prefer 8 / 12 / 16 px internal spacing rhythms, with 24 px reserved for major separation.
- Preserve clear negative space around the playable world. Do not fill unused space with decorative boxes.
- No giant hero cards, screen-wide sticker panels or oversized illustrated buttons.
- World content should remain visible behind most transient UI unless focus or accessibility requires otherwise.

## Workshop mood and composition

The prototype scene at `?visualDirection=1` is a composition study, not the WP0.4G final workshop.

The study uses four functional clusters:

1. Specimen wall: cool light, glass containment and the clearest concentrated biological oddities.
2. Central operating island: the visual centre, lit warmly, large enough to read but physically modest inside the room.
3. Machinery cluster: mostly neutral equipment with tiny status accents, patched lines and practical utility.
4. Holding pens / exit: darker secondary spaces that imply future movement and creature handling without implementing those systems.

The player and one common creature are represented by intentionally primitive scale proxies. Their purpose is to test scene proportion only. Final sprite shape language belongs to WP0.4E.

Ambient movement is limited to specimen glow, bubbles and one warning pulse. The goal is a room that feels alive without looking like every prop is demanding attention.

## Explicitly rejected WP0.4C-v1 traits

The superseded bright visual experiment remains forensic evidence only. The following traits must not creep back into the new direction:

- Bright pastoral sky-and-grass presentation as the primary SplicePit identity.
- Blanket high saturation across the world or browser shell.
- Cream sticker/card UI as the dominant framing device.
- Thick plum outlines around most interface surfaces.
- Oversized hero art, giant titles or giant illustrated UI cards competing with the playable space.
- Colourful focus states everywhere simply because the prototype can support them.
- Treating old scenes as visually solved by applying a global colour remap.
- Cheerful/funny surface treatment dominating the workshop mood.
- Making every screen look equally colourful regardless of narrative or functional context.
- Preserving rejected layout or interaction solely because code already exists for it.

The reset also rejects the opposite over-correction: returning to a black terminal aesthetic or coating every surface in gore. Restraint is part of the direction.

## Prototype implementation

- `src/scenes/VisualDirectionScene.ts` provides the isolated workshop treatment.
- `src/scenes/BootScene.ts` routes to it only when `visualDirection=1` is present in the URL.
- Normal Title → Intro → Lab → Splice → Battle behaviour remains the default path so technical smoke coverage is not repurposed into a subjective visual test.
- Press Enter, Space or click inside the direction study to continue into the existing prototype for comparison.

## Acceptance review

Human approval should answer these questions before WP0.4D begins:

1. Does the smaller world scale feel materially closer to the intended game?
2. Is the darker controlled palette restrained without becoming muddy or terminal-like?
3. Does the workshop feel like mad science rather than pastoral fantasy or generic horror?
4. Is colour localised enough that specimens, warnings and biological details matter?
5. Does the composition leave the world dominant rather than the interface?
6. Is the biological weirdness present but sufficiently selective?

If the answer is broadly yes, WP0.4D can define the interface system inside this direction. If not, WP0.4C should iterate rather than carrying uncertainty into later visual WPs.

## Save/schema impact

None. WP0.4C introduces no save fields, migration, gameplay state or domain rule changes.

## Deliberately unresolved for later WPs

- Typography and final interface components: WP0.4D.
- Pixel/vector/raster choice, sprite proportions, directions and animation states: WP0.4E.
- Character creation choices and persistence: WP0.4F.
- Final workshop layout, navigation and interactions: WP0.4G.
- Production art and animation pipeline: R0.7.
