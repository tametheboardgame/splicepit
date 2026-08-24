# SplicePit Visual Direction — LOCKED 23 August 2026, corrected 24 August 2026

## Status

**LOCKED SOURCE OF TRUTH FOR CURRENT VISUAL DEVELOPMENT**

Human review approved the biotech-apprentice protagonist/environment concept board and the graphics-first rebuild sequence on 23 August 2026.

Human review on 24 August 2026 then explicitly rejected the first visible WP0.4E character-selection implementation. That rejection is recorded in `docs/VISUAL_RESET_CORRECTION_2026-08-24.md` and supersedes any earlier wording that could be read as visual acceptance of that screen.

Primary visual reference:

- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

This remains the sole active visual reference for the current build. Earlier visual-reference boards, prototype UI treatments and player-facing visual implementations are superseded where they conflict with this document or the 24 August correction.

## Core visual target

SplicePit should read as a premium, original GBA-era top-down monster-RPG descended from the readability of late handheld monster RPGs, without copying their characters, maps, UI or assets.

The target is:

- top-down pixel-art exploration;
- small, highly readable character sprites;
- warm, attractive environments with controlled colour;
- compact UI that gets out of the world's way;
- eccentric improvised biotechnology everywhere;
- **cute but concerning** rather than generic wholesome monster collecting;
- black-comic biological wrongness without realistic gore;
- a world that looks inviting at first glance and increasingly questionable as the player notices what the apprentices are actually doing.

The player characters are gene-splicing apprentices. They should look like kids who routinely conduct reckless, unethical and technically impressive bio-experiments, not clean generic adventure protagonists.

## Locked protagonist set

The initial player choice is between four authored protagonists. They are not gameplay classes and must not have mechanical advantages.

### Milo — biotech tinkerer

- messy dark hair;
- battered/scratched goggles;
- patched red-orange jacket;
- fingerless gloves, straps, tool belt and rough satchel;
- specimen vials and improvised splicing tools;
- workshop grime and evidence of repeated bad ideas.

### Theo — scavenger field collector

- lighter hair and backwards teal cap;
- rugged explorer/scavenger clothing;
- field notebook and tagged samples;
- utility straps, knee protection, charms and asymmetric equipment;
- slightly feral, survivalist field-biologist energy.

### Ada — obsessive field scientist

- dark hair and purple accents;
- practical asymmetric research coat;
- gloves, vials and loose respirator/mask;
- specimen case containing something biologically questionable;
- more intense and clinically competent than the others.

### Pip — chaos experimenter

- large unruly hair/bunches;
- oversized patched green jacket with yellow accents;
- plasters/bandages, pins, stitched details and creature charms;
- test tubes and strange tools hanging from bags/pockets;
- gleefully dangerous curiosity.

Across all four, visual motifs may include stitches, feather/tooth/bone charms, sample jars, tubes, hazard markings, repaired clothing, muddy boots, improvised lab equipment and creature-handling gear. They remain human protagonists, not mutants or monsters.

## Character-selection scope

The technical identity contract is retained:

- the player chooses **Milo, Theo, Ada or Pip**;
- the chosen protagonist has no mechanical class/stat advantage;
- the player may enter their own character name;
- `avatarId` and player name persist through the normal save system;
- broader appearance customisation is deliberately deferred.

The **presentation** of that choice is not yet locked.

The rejected WP0.4E screen used a dark monospace registration form, character tabs and a boxed preview. It must not be restored or polished. Final character-choice presentation is deliberately revisited only after the Yard and in-world movement language exist, so the interface can feel native to the game rather than like a web form placed in front of it.

Candidate future approaches may be in-world, scene-based, spatial or otherwise game-native. No candidate is canon until human review accepts it.

## Player sprite specification

The current accepted runtime foundation is the WP0.4D human-approved **64 × 96 directional protagonist source art** with the integer-pixel movement treatment.

Locked current facts:

- Milo, Theo, Ada and Pip use the accepted directional source art;
- four directions: down, left, right, up;
- nearest-neighbour presentation;
- consistent feet/origin treatment is required when integrated into the world;
- the black movement sandbox and its 2× review display were test harness choices, not final world-scale decisions;
- the generated `*-hd-v2.png` secondary walk cells are rejected as runtime animation sources;
- final **in-world display scale** remains unresolved until the accepted protagonist is judged inside the Yard.

The earlier 24 × 32 production assumption is superseded for the accepted prototype. Do not redraw or shrink the accepted protagonists merely to satisfy that old numeric assumption.

## Initial environment target — Apprentice Splicer Yard

The first playable environment is deliberately small and attractive. It exists to prove character choice, movement, collision, camera and visual language before major gameplay systems return.

Include:

- compact workshop/lab building;
- grass and dirt paths;
- trees, shrubs, flowers and odd plants;
- water feature/stream or pond and a small bridge;
- crates, barrels and specimen tables;
- fenced test pens/cages;
- subtle creature-husbandry and containment details;
- strange biological props that create mild unease without turning the area into horror scenery;
- enough open space to make movement and animation easy to judge.

Do **not** add splice UI, combat UI, economy UI, quest systems or large information panels to this first test scene.

The accepted protagonist must be visibly present in the Yard at provisional gameplay scale during visual review. The environment is designed around the actual character, not around an empty map.

## Existing visual implementation policy

The current player-facing visual implementation remains disposable prototype material unless explicitly accepted by human review.

Do not preserve a scene, layout, procedural graphic, UI panel or colour treatment merely because it already exists. The following are superseded and must be removed, bypassed or rewritten as the new playable replaces them:

- `VisualDirectionScene` presentation;
- existing player-facing Lab/Splice/Battle scene presentation;
- oversized/high-saturation visual treatments;
- old dark-terminal presentation language;
- the rejected 24 August `APPRENTICE REGISTRATION` WP0.4E screen;
- dark brown/olive form-style character-selection presentation;
- prototype procedural artwork that conflicts with this direction;
- old visual-reference boards that conflict with the approved biotech-apprentice concept;
- tests whose only purpose is to enforce rejected presentation behaviour.

Useful domain logic, deterministic systems, data models, save infrastructure, input abstractions and technical tests should be retained where they are genuinely presentation-independent.

## Immediate graphics-first milestone — corrected order

The next work is intentionally narrow and sequential:

1. **Runtime Sprite Production — COMPLETE**: accepted Milo, Theo, Ada and Pip runtime protagonist foundation.
2. **Identity Persistence — TECHNICALLY COMPLETE**: `avatarId` and player name survive normal save/load. The first visible character-select implementation is rejected.
3. **Visual Reset — ACTIVE CORRECTION**: old terminal/form boot is removed and may be replaced temporarily by a disposable canvas-only protagonist harness.
4. **Apprentice Splicer Yard — NEXT REAL VISUAL BUILD**: completely fresh environment based on this visual direction, not a reskin of the old Lab.
5. **Movement / Scale / Camera Polish**: make the accepted protagonist genuinely inhabit the Yard.
6. **Character Select Presentation Redesign**: only after the world language is visible, create a game-native way to choose Milo/Theo/Ada/Pip and enter a name.
7. **STOP FOR HUMAN PLAYTEST**: do not add major systems until the complete choose-and-walk experience feels good.

The eventual test build should still effectively be:

`Boot → Character Select → Apprentice Splicer Yard`

But development order is now intentionally **world before final character-select presentation**, because the first attempt proved that designing the interface in isolation pulled the project back toward rejected web/admin presentation.

No splice system, battle system, economy, quest flow or large menu layer is required for this gate.

## Graphics-first acceptance gate

Before proceeding, human review must answer yes to the following:

- do the four characters look good at actual in-game size?
- does choosing one feel like choosing a proper protagonist rather than filling in a form?
- does walking feel responsive and pleasant?
- is the sprite/world scale correct?
- does the yard look attractive enough to invite exploration?
- does the environment contain enough biological wrongness to feel specifically like SplicePit?
- do collision, depth and camera make the character feel embedded in the world rather than pasted over it?
- is the rejected terminal/web-form presentation absent from the player-facing path?

If this gate fails, fix the graphics/movement/interface foundation. Do not hide the problem under more systems.

Success means choosing one of four questionable little gene-splicing apprentices and walking around their equally questionable yard already feels like a game worth building on.
