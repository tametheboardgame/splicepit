# SplicePit Visual Direction Lock Candidate — 23 August 2026

## Status

**APPROVED DIRECTION / SOURCE OF TRUTH FOR THE NEXT VISUAL BUILD**

Human review approved the attached protagonist/environment concept board as the direction to build from.

Primary visual reference:

- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

This reference supersedes earlier player-facing visual prototypes where they conflict with it.

## Core visual target

SplicePit should read as a premium, original GBA-era top-down monster-RPG descended from the readability of games such as FireRed/LeafGreen, without copying their characters, maps, UI or assets.

The target is:

- top-down pixel-art exploration;
- small, highly readable character sprites;
- warm, attractive environments with controlled colour;
- compact UI that gets out of the world’s way;
- eccentric improvised biotechnology everywhere;
- **cute but concerning** rather than generic wholesome monster collecting;
- black-comic biological wrongness without realistic gore.

The player characters are gene-splicing apprentices. They should look like children/young apprentices who routinely conduct reckless, unethical and technically impressive bio-experiments, not clean generic adventure protagonists.

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

## Player sprite specification

Initial production target:

- **24 × 32 px per frame**;
- four movement directions: down, left, right, up;
- three walk frames per direction;
- one idle frame per required facing, with down-facing idle mandatory for the first playable;
- nearest-neighbour scaling;
- test at **4× display scale**;
- strong silhouette and palette separation at actual game size;
- no reliance on enlarged concept-sheet detail that disappears in play.

The concept board is an art-direction reference, **not a production-ready sprite sheet**. Exact sprite frames must be produced as clean runtime assets on a fixed grid and tested in-engine.

## Initial environment target — apprentice splicer yard

The first playable environment should be deliberately small and attractive. It exists to prove character choice, movement, collision, camera and the visual language before any major gameplay system returns.

Include:

- compact workshop/lab building;
- grass and dirt paths;
- trees, shrubs, flowers and odd plants;
- water feature/stream or pond and a small bridge;
- crates, barrels and specimen tables;
- fenced test pens/cages;
- subtle creature-husbandry and containment details;
- strange biological props that create mild unease without turning the area into horror scenery;
- enough open space to make walking and animation easy to judge.

Do **not** add splice UI, combat UI, economy UI, quest systems or large information panels to this first test scene.

## Existing visual implementation policy

The current player-facing visual implementation is disposable prototype material.

Specifically, do not preserve a scene, layout, procedural graphic, UI panel or colour treatment merely because it already exists. The following may be removed, bypassed or rewritten when implementing the new playable:

- `VisualDirectionScene` presentation;
- existing player-facing Lab/Splice/Battle scene presentation;
- oversized/high-saturation visual treatments;
- old dark-terminal presentation language;
- prototype procedural artwork that conflicts with this direction;
- tests whose only purpose is to enforce rejected presentation behaviour.

Useful domain logic, deterministic systems, data models, save infrastructure, input abstractions and technical tests should be retained where they are presentation-independent.

## Immediate playable milestone

The next graphics-first milestone is intentionally narrow:

1. Produce clean runtime sprite sheets for Milo, Theo, Ada and Pip.
2. Build a minimal character-selection screen showing the four authored protagonists.
3. Store the selected protagonist in game state/save data.
4. Load the selected protagonist into a new small apprentice-splicer-yard scene.
5. Support smooth four-direction movement and animation.
6. Add collision, depth ordering and camera behaviour.
7. Remove/bypass old visual routes so the test build opens into this new flow.
8. Stop and playtest the result before adding systems.

Success means choosing a character and simply walking around already feels substantially more like the intended game.
