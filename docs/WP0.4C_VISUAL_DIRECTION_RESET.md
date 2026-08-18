# WP0.4C Visual Direction Reset

**Status:** DIRECTION APPROVED — IN-ENGINE STUDY IMPLEMENTED

**Date:** 18 August 2026

**Authoritative WP contract:** `docs/work-packages/R0_VISUAL_FIRST_REBASE.md`

## Approved direction

The visual reset is now explicitly a **top-down pixel-RPG presentation with richer modern detail**, using late-era 2D handheld RPG readability as the structural reference point while remaining an original SplicePit visual language.

The target is not painterly concept art, not an isometric action RPG and not a giant-card interface. The intended game view is small, readable and tile-based: the player moves through compact authored environments, characters and creatures are expressive small sprites, and SplicePit atmosphere comes from the materials, props, lighting, creatures and biological details embedded in those spaces.

The approved mood setter remains the SplicePit logo/splash identity: blackened metal, biotech machinery, acid/specimen green, hot amber/orange industrial light, restrained horror and visibly questionable genetic engineering.

## Visual thesis

- Orthographic/top-down exploration, approximately the readability and scale of a polished 2D handheld RPG.
- Pixel art as the core rendering language, with more environmental detail, animation, lighting accents and creature complexity than the classic reference point.
- Compact player and NPC sprites rather than large illustrated characters during exploration.
- Creatures remain identifiable at small scale but may become larger and more detailed in battle or inspection views.
- Tile-built rooms and streets should feel dense and authored, not empty rectangular prototype boxes.
- The world is the interface wherever practical: tanks, cages, market stalls, benches, signs and machinery communicate purpose visually.
- UI is small and contextual during exploration. Larger panels appear only when a task genuinely needs them.
- Green biotech light and orange industrial light are accents, not blanket colour washes.
- Biological wrongness is selective and readable: grafts, unsuitable limbs, fluid tanks, tissue samples, cages, stains, mutated silhouettes and machinery designed around living subjects.

## Reference translation

The late-era handheld RPG reference is being translated into original design principles rather than copied literally.

- Clear tile logic → immediately understandable navigation and collision.
- Small character sprites → the player can read a populated room without the camera needing to pull far back.
- Distinct building/prop silhouettes → workshop stations and market traders can be recognised before reading text.
- Strong scene-to-scene identity → workshop, underground market, streets and battle spaces can share one visual language without looking interchangeable.
- Simple interaction language → a small prompt or marker is enough when the environment already communicates what an object is.
- Battle readability → creatures can be presented larger than exploration sprites with clean status framing and concise action choice.

The increased-detail layer adds richer metalwork, pipes, stains, wiring, tank contents, machinery, market clutter, ambient animation, creature grafts and more complex battle sprites while preserving the readability of the underlying 2D structure.

## Core palette families

Exact production values remain tunable, but the direction is now locked around these families:

- Deep background / shadow: `#0D0F0E`
- Blackened wall: `#1B1F1D`
- Workshop stone/metal: `#2A2F2B`
- Neutral floor range: approximately `#34352F` to `#403A32`
- Utility metal: `#535A52`
- Metal highlight: `#788074`
- Dark wood: `#4A3025`
- Worn wood: `#744936`
- Copper/rust: `#A6673F`
- Industrial amber: `#E19A43`
- Deep biotech green: `#355530`
- Main biotech green: `#77A94F`
- Bright specimen green: `#B3D867`
- Fluid green: `#7BC84A`
- Clinical cyan: `#619A94`
- Bruise/plum: `#745472`
- Blood/warning red: `#8D3D37`
- Bone/skin/light neutral: warm cream and tan families rather than pure white.

## Colour and contrast rules

- Most exploration pixels should be neutral/dark material colours.
- Bright green is primarily living biotech, active machinery, specimen fluid or important system feedback.
- Amber/orange is primarily heat, lamps, market signage and industrial activity.
- Red is primarily danger, blood, failure or hostile battle state.
- A room should still read correctly if its accent lighting is mentally removed.
- Characters and interactable silhouettes must remain separable from floors at actual gameplay size.
- State must not rely on colour alone.
- Avoid screen-wide bloom, fog or gradients that undermine pixel readability.

## Camera and tile scale

WP0.4C now proposes the following baseline for subsequent visual WPs:

- Existing browser logical canvas remains `960 × 540` during the transition.
- Exploration composition uses a provisional `24 px` world planning grid.
- Final production may render a lower internal pixel resolution and upscale by an integer factor once WP0.4E proves the sprite pipeline.
- Camera remains orthographic/top-down for ordinary exploration.
- No isometric perspective for the main game world.
- No fake 3D perspective that makes tile navigation ambiguous.
- Small vertical overlap, foreground props and lighting can provide a modest 2.5D sense of depth without changing the navigation plane.

## Sprite scale target

Provisional exploration targets:

- Player/NPC: roughly `24–32 px` tall before any integer display scaling.
- Small/common creature: roughly `20–36 px` depending on body plan.
- Large exploration creature: roughly `36–56 px`, used when physical size matters.
- Battle creature: deliberately larger dedicated sprite/presentation, not merely the exploration sprite magnified.

WP0.4E owns the final sprite dimensions, direction count, animation frames and production asset format.

## UI density target

- Exploration HUD should remain minimal, normally under roughly 8% of the visible play area.
- Location/object prompts should use one short title and one short action line where possible.
- Menus should resemble compact game interfaces, not web cards.
- Battle can temporarily dedicate more screen area to status and actions because combat is itself the current task.
- Inventory, creature summary and splicing interfaces may use larger dedicated screens, but should preserve pixel-art framing, compact spacing and the same material/palette language.
- Avoid huge headers, oversized title text inside gameplay, cream sticker panels and decorative empty UI chrome.

## In-engine visual sampler

`?visualDirection=1` now contains three switchable views rendered directly by Phaser rather than as concept art.

### 1. Workshop

- True top-down/tile-based composition.
- Compact player sprite at gameplay scale.
- Small mutated creature on the central splice platform.
- Specimen tanks, test cages, benches, chemistry stock, control machinery, drains and market exit.
- Sparse contextual prompt rather than large interface panels.
- Biotech green and industrial amber limited to meaningful objects.

### 2. Underground market

- Same tile scale and player sprite language as the workshop.
- Dense stalls around a navigable centre rather than a wide cinematic bazaar.
- Genes, augments, live stock, mutagen and questionable biological goods represented as physical stalls and props.
- Multiple small NPC sprites establish the target population density.
- Sewer/fluid channels and industrial construction keep the area visually related to the wider SplicePit world.

### 3. Battle

- A dedicated 2D battle presentation rather than an isometric arena.
- Creatures use larger battle sprites so grafts and body construction matter visually.
- Status framing is compact and readable.
- Action choice is contained in a small lower command area.
- Industrial spectators and arena construction retain the SplicePit setting while keeping the creatures as the subject.

Use `1`, `2`, `3` or Left/Right to switch views. Escape returns to the inherited prototype.

## Explicitly rejected directions

The following must not return unless explicitly reconsidered:

- Painterly/concept-art gameplay presentation.
- Diablo-like/isometric action-RPG camera.
- Photoreal or pre-rendered-looking environments pretending to be gameplay.
- Giant rooms where the player is a tiny unreadable figure.
- Giant illustrated cards dominating the game world.
- Bright pastoral sky/grass identity as the default SplicePit look.
- Blanket high saturation.
- Cream sticker/card interface framing.
- Thick plum outlines around most UI.
- Black terminal-style prototype presentation.
- Global colour remapping presented as a substitute for actual art direction.
- Gore covering every surface merely to make the game feel mature.

## Save/schema impact

None. WP0.4C changes presentation only and introduces no save data, migrations, gameplay rules or domain-state changes.

## Rendering impact

The branch now enables Phaser pixel-art rendering and nearest-neighbour canvas scaling so the approved direction can be assessed without smoothing the intended hard edges.

## Handoff to later WPs

- WP0.4D: formalise the compact pixel UI language shown provisionally in the sampler.
- WP0.4E: build the actual player/creature sprite pipeline and representative production-quality sprites.
- WP0.4F: character creation using that sprite pipeline.
- WP0.4G: replace the workshop sampler with the real navigable workshop scene.
- WP0.4H–I: rebuild the opening and integrate the first-ten-minutes presentation.
- WP0.4J: final visual lock before mechanic redesign resumes.
