# SplicePit Visual Direction — LOCKED 23 August 2026

## Status

**LOCKED SOURCE OF TRUTH FOR CURRENT VISUAL DEVELOPMENT**

Human review explicitly approved the biotech-apprentice protagonist/environment concept board and the graphics-first rebuild sequence.

Primary visual reference:

- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

This is the sole active visual reference for the current build. Earlier visual-reference boards, prototype UI treatments and player-facing visual implementations are superseded where they conflict with this document.

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

For the current graphics-first milestone:

- the player chooses **Milo, Theo, Ada or Pip**;
- the chosen protagonist has no mechanical class/stat advantage;
- the player may enter their own character name;
- broader appearance customisation is deliberately deferred;
- do not introduce a generic gender selector, modular wardrobe builder or combinatorial character creator before the four authored sprites are proven in-engine.

The first goal is four excellent coherent characters, not hundreds of mediocre combinations.

## Player sprite specification

Initial production contract:

- **24 × 32 px per frame**;
- four directions: down, left, right, up;
- one idle frame plus three walk frames per direction;
- fixed clean grid suitable for Phaser animation slicing;
- nearest-neighbour scaling;
- test at **4× display scale**;
- strong silhouette and palette separation at actual game size;
- no reliance on enlarged concept-sheet detail that disappears in play;
- consistent foot position/origin across every frame and every protagonist.

The concept board is an art-direction reference, **not a production-ready sprite sheet**. Runtime sheets must be produced as clean pixel assets and judged in-engine at actual play scale.

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

## Existing visual implementation policy

The current player-facing visual implementation is disposable prototype material.

Do not preserve a scene, layout, procedural graphic, UI panel or colour treatment merely because it already exists. The following are superseded and must be removed, bypassed or rewritten as the new playable replaces them:

- `VisualDirectionScene` presentation;
- existing player-facing Lab/Splice/Battle scene presentation;
- oversized/high-saturation visual treatments;
- old dark-terminal presentation language;
- prototype procedural artwork that conflicts with this direction;
- old visual-reference boards that conflict with the approved biotech-apprentice concept;
- tests whose only purpose is to enforce rejected presentation behaviour.

Useful domain logic, deterministic systems, data models, save infrastructure, input abstractions and technical tests should be retained where they are genuinely presentation-independent.

## Immediate graphics-first milestone

The next work is intentionally narrow and sequential:

1. **Runtime Sprite Production** — produce clean Milo, Theo, Ada and Pip directional sprite sheets.
2. **Character Select** — create a minimal four-character chooser, name entry and persisted `avatarId`/player identity.
3. **Apprentice Splicer Yard** — build a completely fresh small environment based on this visual direction, not a reskin of the old lab.
4. **Movement Polish** — four-direction movement/animation, collision, depth ordering and camera behaviour.
5. **STOP FOR HUMAN PLAYTEST** — do not add major systems until simply choosing a protagonist and walking around feels good.

The test build should effectively be:

`Boot → Character Select → Apprentice Splicer Yard`

No splice system, battle system, economy, quest flow or large menu layer is required for this gate.

## Graphics-first acceptance gate

Before proceeding, human review must answer yes to the following:

- do the four characters look good at actual in-game size?
- does choosing one feel like choosing a proper protagonist rather than a placeholder?
- does walking feel responsive and pleasant?
- is the sprite/world scale correct?
- does the yard look attractive enough to invite exploration?
- does the environment contain enough biological wrongness to feel specifically like SplicePit?
- do collision, depth and camera make the character feel embedded in the world rather than pasted over it?

If this gate fails, fix the graphics/movement foundation. Do not hide the problem under more systems.

Success means choosing one of four questionable little gene-splicing apprentices and walking around their equally questionable yard already feels like a game worth building on.