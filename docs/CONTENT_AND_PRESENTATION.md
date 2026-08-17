# SplicePit Content and Presentation Plan

## Visual identity

Locked high-level direction: **storybook wrongness / pastoral biotech**.

The world mixes:

- countryside/animal husbandry
- improvised science
- specimen labels and institutional paperwork
- damaged post-collapse infrastructure
- black humour
- biological unease
- stylised/cartoon presentation

The game should be disturbing in concept without becoming realistic animal gore.

## Tone boundary

Locked target is **blackly comic unethical biotech**, not an animal-torture simulator.

The world may normalise deeply irresponsible treatment of animals and splices, but presentation should use stylisation, absurdity and dark humour to avoid voyeuristic suffering.

## Opening content warning / disclaimer

A warning/disclaimer is required before or around starting a new game. Final wording is open, but intended content includes:

- adult/mature-targeted game
- fictional animal experimentation
- mutation/injury/creature combat
- explicit non-endorsement of real animal cruelty

Tone may include a joke, e.g. a final line along the lines of “also, do not put a rhinoceros horn on a fish”, provided the actual warning remains clear.

## World presentation scale

Top-down tile-based readability broadly comparable to classic compact monster RPGs, with original SplicePit art rather than copied sprite/tile language.

Exact tile/sprite resolution remains an R0.6 production decision.

## Creature phenotype direction

Locked direction is **hybrid composition** using the best combination of:

- authored/layered base sprites
- modular body parts
- procedural Canvas/vector/compositing
- pre-rendered combinable pieces

The underlying phenotype model should be renderer-independent.

A creature's visual identity is persistent and tied to its individual phenotype seed/parameters and irreversible splice history.

## Character/environment pipeline

Exact pipeline is delegated to implementation/art prototyping. Requirements:

- scalable authored environment kit
- consistent sprite proportions
- animation conventions
- reusable anchors/components for creature body modifications
- no requirement to draw every possible splice combination manually

## Dialogue

Initial dialogue is text-box based; no full voice acting.

Requirements:

- stable dialogue IDs
- text stored outside scene logic
- future localisation support
- UI that tolerates text expansion
- optional future voice/audio reference field so adding voice-over later does not require rewriting dialogue architecture

## Music/audio

Final music will be supplied separately later.

Development should provide:

- master/music/SFX volume
- mute
- settings persistence
- scene/state track switching
- placeholder/dev audio support
- creature/lab/world/combat SFX architecture

Do not block development waiting for final music.

## Accessibility baseline

- keyboard-first during foundations
- controller/touch architecture-ready
- later remapping
- readable scalable text
- visible focus states
- reduced shake/flash options
- audio controls
- no critical information conveyed solely by audio or colour

## Content entities

Production content remains data-driven with stable IDs/status:

- base animals
- genetic source/material definitions
- mutations
- capability actions/training definitions
- items/reagents
- opponents
- locations
- quests
- dialogue
- pit rules/circuits
- facility upgrades

## Asset/legal discipline

Third-party/generated assets must retain source/licence/provenance information where relevant. Final release must verify commercial/distribution rights and attribution requirements.
