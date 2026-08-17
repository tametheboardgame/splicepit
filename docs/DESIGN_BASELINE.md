# SplicePit Design Baseline

## Status
This document records implementation-facing decisions already established for SplicePit. It intentionally does not invent the full story.

## Core identity
- A grim/adult, deliberately wrong creature-collection RPG rather than a straight Pokémon parody.
- Vast majority of play is top-down 2D RPG exploration with tile-by-tile movement.
- Visual target: "storybook wrongness" / "pastoral biotech", not generic SNES fantasy pixel art.

## Core loop
1. Explore and complete quests to acquire base animals and desirable genetic material from other animals.
2. Use a freeform gene-splicing system to alter a base animal.
3. Splicing has variable complexity and can succeed, fail or mutate.
4. The system should not impose an arbitrary maximum number of combined genes. Difficulty/risk should emerge from complexity and compatibility instead.
5. Test created creatures in Fit Pit arena battles.
6. Wins and progression create resources/access that feed back into exploration and experimentation.

## Opening canon
- The player is a SpliceApprentice working under a SpliceMaster.
- There were multiple apprentices.
- A rampaging splice animal kills the SpliceMaster during the opening disaster.
- The player releases emergency gas to kill the escaped mutants.
- The other apprentices die in the disaster; the player survives.
- The player inherits the damaged pit and remaining resources.
- The first practical objective is to obtain a new base animal.
- Distrust/suspicion around the disaster exists in the wider story.
- The complete storyline remains deliberately undefined here because it is to be authored separately.

## R0.1 prototype content
The first browser slice uses a Rabbit base animal and several example genes purely to prove the systems. These implementation examples are not treated as locked story canon.
