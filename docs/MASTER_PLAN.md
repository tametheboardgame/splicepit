# SplicePit Master Plan

## Product promise

SplicePit is a darkly comic adult creature RPG about running an irresponsible gene-splicing pit in a fragmented post-apocalyptic world.

The player does not collect hundreds of interchangeable monsters. They experiment on ordinary/rare animals, learn uncertain biological behaviour through testing, and gradually build a very small number of deeply individual creatures whose irreversible histories matter.

## Core loop

```text
Explore / quest / trade / fight
            ↓
Acquire base animals + physical genetic material
            ↓
Experiment on test animals
            ↓
Improve knowledge / prediction
            ↓
Risk irreversible splice on a main creature
            ↓
Train and fight in Land / Water / Air Fit Pits
            ↓
Earn money, material, access and facility upgrades
            ↓
Explore further / attempt more ambitious biology
```

## Locked design pillars

### 1. Splicing is uncertain even when understood

Repeated experimentation improves prediction but never turns biology into a deterministic recipe. Same source + same base can still produce different valid expression.

### 2. Creatures are histories, not loadouts

A creature can be spliced again and again. Nothing is “unequipped”. Its current body is the accumulated result of irreversible experiments, mutations, injuries and training.

### 3. Small main roster, large experimental space

The player develops at most three serious main combat creatures. Test animals/lab stock exist separately. This focuses attachment and makes risking a valuable creature meaningful.

### 4. Common animals remain strategically useful

Rabbits/other common animals can be excellent test subjects because equivalent replacements are abundant. Rare animals create risk partly because equivalent controlled tests are hard to reproduce.

### 5. Full mad science, not molecular simulation

The system borrows intuitive ideas from real animals but follows playful logic: “put a rhino horn on this fish” is a valid design goal. Internal rules should be coherent without being biologically realistic.

### 6. Capability-driven combat

Turn-based Fit Pit actions come from what a creature physically/biologically can do plus training. No arbitrary four-move limit.

### 7. Environment matters through function

Land, Water and Air pits require actual functional biological capability. Attempting wings/fins/gills is not enough if they do not work. Multi-environment creatures are possible, including theoretical all-three generalists, but the biological burden should naturally trade against peak specialisation.

### 8. Failure creates consequence and stories

Most failure costs material/stability and may injure. Extreme work can permanently damage or rarely kill. Mutations can become desirable research opportunities.

### 9. The world supplies the lab

Genes/material are bought, harvested, won and traded. The laboratory should constantly send the player back into authored regions/quests rather than becoming a self-contained crafting menu.

### 10. Tone is black comedy, not torture spectacle

The concepts are ethically horrific; the presentation is stylised and comic. The game explicitly warns/acknowledges fictional animal harm rather than pretending otherwise.

## Story frame currently locked

- Player is a SpliceApprentice.
- SpliceMaster's creature kills the SpliceMaster during containment failure.
- Emergency gas kills the escaped splice(s) and other apprentices; player survives.
- Player inherits damaged pit/lab, resources and suspicion.
- SpliceMaster had an imminent Fit Pit commitment, forcing an emergency first creature/splice.
- Opening base choices are Rabbit / Goat / Pig and the ten initial source packages are locked in `DECISION_LOG.md`.
- Player inherits real timed debt/obligation.
- Pay by Act 1 deadline → enter Act 2 independent/free to choose direction.
- Fail to pay → no game over; creditors control the player's work/fights until obligation is worked down, opening a different Act 2 route.

Detailed story beyond this structure remains authored separately. Exact creditor identity, geography, debt values and detailed upgrade tiers remain decision-gated rather than silently locked.

## Technical rules

- browser-first;
- TypeScript + Vite + Phaser from R0.2;
- Cloudflare Pages deployment;
- domain logic independent of Phaser where practical;
- seeded RNG;
- validated stable-ID content;
- R0.2 begins versioned-save compatibility contract;
- keyboard first, controller/touch-ready architecture;
- localisation-ready text/data architecture;
- no initial full voice acting.

## Development ordering

```text
R0.2 architecture
  ↓
R0.3 irreversible uncertain splicing + knowledge/testing
  ↓
R0.4 capability-driven turn combat + functional Land/Water/Air
  ↓
R0.5 world/quests/acquisition/debt/upgrades
  ↓
R0.6 production presentation/audio/accessibility
  ↓
R0.7 integrated pre-alpha
  ↓
R1 complete Act 1 / Alpha 1
  ↓
R2 Act 2 expansion / Alpha 2
  ↓
R3 content-complete Beta / feature-freeze gate
  ↓
R4 release candidate / certification
```

Architecture comes before content volume. Prototype content must not become canon through inertia.

The definitive sequence is `ROADMAP.md`, with detailed contracts under `work-packages/`.

## Work-package rule

Every implementation WP defines:

1. dependencies;
2. scope/out-of-scope;
3. concrete deliverables;
4. schema/save impact where relevant;
5. required automated tests;
6. browser/human acceptance path where relevant;
7. explicit exit criteria;
8. open decisions revealed/resolved by the work.

A WP is complete when its gate passes, not when code merely exists.

The current master execution roadmap contains **74 WPs**. Later playtests may create narrowly numbered patch/hardening WPs, but material new features must enter at the earliest dependency-correct point rather than being bolted onto unrelated work.
