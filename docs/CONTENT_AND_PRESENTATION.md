# SplicePit Content and Presentation Plan

## Current authority

The current player/environment visual execution is governed by:

- `VISUAL_DIRECTION_2026-08-23.md`
- `visual-reference/splicepit-protagonists-biotech-v2.webp`
- `ROADMAP.md`
- `work-packages/R0_VISUAL_FIRST_REBASE.md`

This broader presentation plan must not be used to revive superseded R0.4 visual work.

## Visual identity

Locked high-level direction remains **storybook wrongness / pastoral biotech**, now made concrete as a premium original GBA-era top-down pixel-RPG presentation with **cute-but-concerning apprentice biotech**.

The world mixes:

- countryside/animal husbandry;
- improvised science;
- specimen labels and institutional paperwork;
- damaged post-collapse infrastructure;
- black humour;
- biological unease;
- stylised/cartoon presentation;
- attractive environments whose details reveal increasingly questionable experimentation.

The game should be disturbing in concept without becoming realistic animal gore.

## Player protagonists

The current locked prototype uses four authored protagonists:

- Milo — biotech tinkerer;
- Theo — scavenger field collector;
- Ada — obsessive field scientist;
- Pip — chaos experimenter.

They are visual identities rather than gameplay classes. Current player identity is protagonist choice plus player-entered name. Broad modular appearance customisation is deferred.

## Tone boundary

Locked target is **blackly comic unethical biotech**, not an animal-torture simulator.

The world may normalise deeply irresponsible treatment of animals and splices, but presentation should use stylisation, absurdity and dark humour to avoid voyeuristic suffering.

## Opening content warning / disclaimer

A warning/disclaimer is required before or around starting a new game. Final wording is open, but intended content includes:

- adult/mature-targeted game;
- fictional animal experimentation;
- mutation/injury/creature combat;
- explicit non-endorsement of real animal cruelty.

Tone may include a joke, provided the actual warning remains clear.

## World presentation scale

Top-down tile-based readability broadly comparable to classic compact handheld monster RPGs, with original SplicePit art rather than copied sprite/tile language.

Current R0.4 player-sprite prototype contract is locked at:

- 24 × 32 px per frame;
- down / left / right / up;
- one idle + three walk frames per direction;
- nearest-neighbour scaling;
- fixed-grid runtime sprite sheets.

These metrics are the active prototype contract. Later production changes require explicit human approval rather than being silently re-opened by an older document.

The first approved environment proof is the **Apprentice Splicer Yard**, a fresh small location built to prove movement, collision, depth and camera before mechanics expand.

## Graphics-first gate

Before broad presentation/system work continues, the player must be able to:

`Boot → Character Select → Apprentice Splicer Yard`

and simply walking around must feel good.

Do not use interface, story, combat, splicing or content volume to compensate for weak player/world feel.

## UI presentation rule

UI should support the world rather than become the visual subject.

Avoid:

- giant web-style cards;
- full-screen dashboard density where not necessary;
- old dark-terminal styling;
- oversized high-saturation panels;
- broad interface-system work before the graphics-first walking gate.

Use compact contextual UI, dialogue boxes and menus only when the accepted world/player foundation requires them.

## Creature phenotype direction

Locked direction is **hybrid composition** using the best combination of:

- authored/layered base sprites;
- modular body parts;
- procedural/compositing techniques where useful;
- pre-rendered combinable pieces.

The underlying phenotype model should remain renderer-independent.

A creature's visual identity is persistent and tied to its individual phenotype seed/parameters and irreversible splice history.

Creature production art is deliberately not allowed to delay the current Milo/Theo/Ada/Pip walking proof.

## Character/environment pipeline

The current player pipeline is deliberately concrete rather than abstract:

1. approved protagonist concept;
2. clean 24 × 32 runtime frames;
3. in-engine actual-size animation test;
4. selection/persistence;
5. fresh yard scene;
6. movement/collision/depth/camera playtest.

Future production requirements remain:

- scalable authored environment kit;
- consistent sprite proportions;
- animation conventions;
- reusable anchors/components for creature body modifications;
- no requirement to draw every possible splice combination manually.

## Superseded presentation

The following are historical evidence only:

- deleted `VisualDirectionScene`;
- legacy Lab/Splice/Battle player-facing presentation;
- previous oversized/high-saturation pass;
- old dark-terminal presentation;
- removed earlier WP0.4C visual-reference board;
- pre-23-August plans that put broad interface design, creature pipeline design, modular player creation or opening production before the walking-around gate.

Presentation-independent domain code may still be reused.

## Dialogue

Initial dialogue is text-box based; no full voice acting.

Requirements:

- stable dialogue IDs;
- text stored outside scene logic;
- future localisation support;
- UI that tolerates text expansion;
- optional future voice/audio reference field so adding voice-over later does not require rewriting dialogue architecture.

## Music/audio

Final music will be supplied separately later.

Development should provide:

- master/music/SFX volume;
- mute;
- settings persistence;
- scene/state track switching;
- placeholder/dev audio support;
- creature/lab/world/combat SFX architecture.

Do not block development waiting for final music.

## Accessibility baseline

- keyboard-first during foundations;
- controller/touch architecture-ready;
- later remapping;
- readable scalable text;
- visible focus states;
- reduced shake/flash options;
- audio controls;
- no critical information conveyed solely by audio or colour.

## Content entities

Production content remains data-driven with stable IDs/status:

- base animals;
- genetic source/material definitions;
- mutations;
- capability actions/training definitions;
- items/reagents;
- opponents;
- locations;
- quests;
- dialogue;
- pit rules/circuits;
- facility upgrades.

## Asset/legal discipline

Third-party/generated assets must retain source/licence/provenance information where relevant. Final release must verify commercial/distribution rights and attribution requirements.