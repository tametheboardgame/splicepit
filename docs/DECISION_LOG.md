# SplicePit Decision Log

This file is the authoritative record of decisions that should not drift merely because a prototype happens to do something differently.

## Status language

- **LOCKED** — deliberately agreed. Implementation should respect it unless explicitly reopened.
- **PLANNED** — agreed direction, detail still to be proven.
- **PROVISIONAL** — useful proposal/working assumption, not canon.
- **OPEN** — needs an explicit design decision later.
- **PROTOTYPE** — exists only to prove a system.

---

# Locked product decisions

| ID | Decision |
|---|---|
| D-001 | SplicePit is a dark/adult creature-collection RPG centred on irresponsible gene splicing and Fit Pit combat. |
| D-002 | Most world play is top-down 2D exploration with tile-based spatial movement at a broadly classic monster-RPG scale, without copying another game's visual identity. |
| D-003 | Core loop is acquire animals/genetic material → experiment/test → irreversibly splice chosen creatures → Fit Pit combat → resources/access → more exploration and experimentation. |
| D-004 | Splicing has no arbitrary fixed maximum number of combined genes. Practical limits emerge from complexity, compatibility, accumulated biology, risk and available facilities. |
| D-005 | Identical nominal splice inputs are not guaranteed to create identical outcomes. Even two successful attempts on the same base animal with the same material may express at different strengths or in different ways. |
| D-006 | Creature architecture must support freeform cumulative composition rather than hand-authored evolution paths. |
| D-007 | A creature can be spliced repeatedly throughout its life. Splicing is irreversible. |
| D-008 | Players are expected to use expendable/common test animals and material to learn likely outcomes before risking valued main creatures. |
| D-009 | Splice creatures are individual characters: persistent animals with names, age/history and identity. They are not carried in magical storage devices; transport is physical (lead, cage, vehicle/other world-appropriate means). |
| D-010 | Splicing does not raise animals toward human intelligence. Cognitive/instinctive traits can improve battle behaviour while remaining recognisably animal intelligence. |
| D-011 | Tone is blackly comic unethical biotech, not an animal-torture simulator. Presentation should keep the subject deliberately stylised/comic rather than realistic gore. |
| D-012 | The game requires an adult-content/animal-harm warning and a clear fictional/non-endorsement disclaimer, with final wording allowed to retain SplicePit's dark humour. |
| D-013 | Terms `SpliceMaster` and `SpliceApprentice` are established. |
| D-014 | Opening disaster: a rampaging splice kills the SpliceMaster; the lab fail-safe gas is released; the escaped splice(s) and other apprentices die; the player survives and inherits the damaged pit/lab/resources. |
| D-015 | Distrust/suspicion surrounds the surviving player. Debt/obligation to dangerous creditors is part of the inherited situation. |
| D-016 | Browser deployment through GitHub/Cloudflare is the primary delivery route. |
| D-017 | Visual direction is “storybook wrongness” / “pastoral biotech”, not generic SNES fantasy or bright monster-collector parody. |

---

# Locked technical decisions

| ID | Decision |
|---|---|
| T-001 | R0.2 migrates to TypeScript + Vite + pinned Phaser dependency. |
| T-002 | Core domain logic should remain independent of Phaser where practical. |
| T-003 | Content uses validated data/modules with stable IDs and explicit content status. |
| T-004 | Save compatibility contract begins at R0.2; R0.1 saves may be wiped rather than permanently supported. |
| T-005 | Saves become versioned and migration-capable from R0.2 onward. |
| T-006 | Seeded/deterministic RNG is required for reproducible splice/combat outcomes and automated tests. |
| T-007 | Keyboard is the primary input during foundation work; controller/touch must be architecturally possible but are implemented later. |
| T-008 | Automated unit/system/content/build/browser checks remain merge gates. |

---

# Locked splicing decisions

| ID | Decision |
|---|---|
| S-001 | Gene/material model uses broad biological classes rather than treating every sample as a single guaranteed superpower. Initial taxonomy direction: anatomical, physiological, sensory, biochemical, behavioural/neurological and regulatory. |
| S-002 | Biology follows “full mad science”: very loosely inspired by real animals/science but driven by intuitive childlike logic such as “put a rhino horn on a fish”. Fun/system coherence beats molecular realism. |
| S-003 | Gene expression is stochastic. A successful gecko-derived regeneration splice might produce superb regeneration in one panda and slow/weak regeneration in another. |
| S-004 | Genetic knowledge and physical material are separate. Discovering/testing a gene improves knowledge/prediction, but actual splice attempts consume harvestable/buyable/tradable material/reagents. |
| S-005 | Repeated experiments with a gene/base context improve the player's predictive knowledge without ever making outcomes perfectly guaranteed. |
| S-006 | Compatibility uses systemic tags/rules with occasional authored special interactions. `X + Y` must not always equal one deterministic `Z`. |
| S-007 | Candidate outcome spectrum is: clean rejection; damaging failure; partial expression; unstable viable creature; normal success; mutated success; exceptional synergy; catastrophic result. The bands are locked as the initial model to prototype, while exact probabilities/effects remain tunable. |
| S-008 | Outcome band does not fully determine expression magnitude; two “normal successes” can still produce meaningfully different stats/expression. |
| S-009 | Mutations can be investigated. The player may attempt to stabilise, preserve, cultivate or otherwise exploit useful mutations, but those follow-up attempts can themselves fail. |
| S-010 | Information shown before a splice depends heavily on accumulated experimentation/records and diagnostic capability. Knowledge progression is a core mechanic. |
| S-011 | Ordinary failures primarily cost material/resources and/or stability. Extreme failure can permanently damage a creature. Death is possible but rare and associated with clearly extreme risk. |
| S-012 | Splicing is irreversible; the main protection for a valuable creature is research/testing before commitment, not an undo button. |
| S-013 | The six biological classes are implemented as expression categories: anatomical, physiological, sensory, biochemical, behavioural/neurological and regulatory. Every potential expression has one primary class; a source package may span several classes and contains multiple independently resolvable potential expressions. Base/source compatibility is described through generic biological tags/requirements plus categorical complexity and phenotype/capability hooks, not base+source pairing tables or final balance values. |

---

# Locked creature/roster decisions

| ID | Decision |
|---|---|
| CR-001 | The intended fantasy is a small number of deeply developed “main” creatures rather than a huge interchangeable squad. |
| CR-002 | Active serious combat roster is capped at three creatures. Test animals/lab stock do not count as three main creatures and can exist separately. |
| CR-003 | Main creatures retain persistent names, history, age and splice/combat record. |
| CR-004 | Common base animals are strategically valuable because they make repeat testing easier; rare base animals are powerful/interesting partly because reproducing tests on equivalent animals is difficult. |
| CR-005 | Arena classification is capability-based, not species- or gene-label-based. A creature qualifies for Land, Water or Air only if it can genuinely function/fight in that environment. Cosmetic or non-functional wings do not make a creature Air-capable; a creature that can genuinely sustain flight may qualify. |
| CR-006 | Multi-environment qualification is allowed. A sufficiently successful creature can qualify for two or even all three arena classes, but extreme generalisation should tend to carry biological/build trade-offs rather than becoming the obvious optimum. |
| CR-007 | Age is primarily identity/history rather than a harsh retirement timer. Age may have modest species-appropriate effects across the game's roughly five-year-or-less story timespan, particularly for naturally short-lived animals, but should not massively degrade a valued creature merely because time passed. |

---

# Locked combat decisions

| ID | Decision |
|---|---|
| C-001 | Fit Pit combat is turn-based. It may evoke familiar monster-RPG readability but must not use a fixed “four moves” design. |
| C-002 | Available combat actions come primarily from physical/biological capabilities: e.g. use horns, bite, ram, claw, constrict, discharge, fly/dive, etc. |
| C-003 | Capability actions are modified/expanded by training and the individual creature's metrics/experience. |
| C-004 | Preparation/build quality gives the player tools; tactical decisions determine how well those tools are used. Both splicing skill and combat decisions are player skill. |
| C-005 | Early Fit Pits are comparatively safe/sparring-like. Higher-level pits become progressively more dangerous, including persistent injuries and eventual risk of losing a creature. |
| C-006 | Battles begin primarily 1v1. The engine must support up to three main creatures and later asymmetric/team formats including 3v1 where rules/story allow. |
| C-007 | Pit environments have biological eligibility. Initial top-level arena classes are Land, Water and Air. A creature cannot simply enter an environment in which it cannot function. |
| C-008 | Players may diversify across Land/Water/Air or specialise heavily in one arena class. The game should not force one creature of each class. |
| C-009 | Arena eligibility must be assessed from expressed functional capability. Successful anatomy is not assumed from attempted splicing: wings may be malformed/useless, aquatic traits may not provide meaningful swimming/respiration, and only functional results unlock the corresponding Pit circuit. |

---

# Locked world/progression decisions

| ID | Decision |
|---|---|
| W-001 | World structure is interconnected authored regions/hubs, initially targeting roughly the exploration/content scale of a classic compact monster RPG rather than a giant open world. |
| W-002 | Opening practical loop: after inheriting the lab, the player has an imminent match and must quickly construct something viable from one of several caged base animals plus stored gene records/material. |
| W-003 | The three opening base animals are Rabbit, Goat and Pig. None is intended as a disposable starter tier; a player may develop the chosen original animal through the entire game. |
| W-004 | The initial ten stored source packages are Lion Predatory Suite; Rhinoceros Cranial Keratin/Impact Suite; Elephant Growth/Mass Regulation; Gecko Regeneration Suite; Cheetah Fast-Twitch/Sprint Suite; Pangolin Dermal Plate Suite; Owl Nocturnal Sensory Suite; Electric Eel Electrocyte Suite; Toad Toxin/Gland Suite; and Chameleon Chromatophore/Visual Adaptation Suite. Individual outcomes remain stochastic and source packages may express only some tendencies. |
| W-005 | Debt is a real sum and a timed Act 1 pressure, but failure to pay does not produce a game-over. It changes the narrative branch and what opportunities are available. |
| W-006 | If Act 1 debt is not paid in time, Act 2 places the player under the creditors' control, fighting for them to work down the obligation. |
| W-007 | If Act 1 debt is paid, Act 2 begins with meaningful freedom: the player can choose where to fight, what path to pursue and whether to specialise. |
| W-008 | Pit/base progression includes at least: diagnostics, safer splice bench, animal recovery, sample storage, mutation analysis, creature housing, Fit Pit facilities, workshop and cosmetic repair. Exact tree is a design proposal pending tuning. |
| W-009 | Four primary genetic-material acquisition channels are: buy, harvest, win and trade. Harvesting includes local/common sources and quest/travel to rare sources. |
| W-010 | Fit Pits are semi-legal in a fragmented post-apocalyptic world with weak central governance. Many people dislike them, but no authority is consistently capable of stopping the practice. |
| W-011 | The full game's main storyline is expected to span no more than roughly five in-world years; exact day/week structure and Act 1 debt deadline remain open until Act 1 production. |

---

# Locked presentation/audio decisions

| ID | Decision |
|---|---|
| A-001 | World camera/scale should broadly use a classic top-down tile RPG readability, while SplicePit's actual art direction remains distinct. |
| A-002 | Creature phenotype production direction is hybrid: authored/layered base art + modular body parts + procedural/compositing techniques as useful. Exact implementation is to be proven. |
| A-003 | No full voice acting is planned for initial production. Dialogue is text-box based. |
| A-004 | Dialogue/content architecture must be localisation-ready for future multiple languages. |
| A-005 | Architecture should not make future voice-over impossible; dialogue IDs/events should be able to reference audio later. |
| A-006 | Music will be supplied separately later; engine should provide a clean music/SFX pipeline and controls without blocking development on final tracks. |

---

# Prototype-only R0.1 elements

These remain non-canon unless explicitly promoted:

- R0.1 exact Rabbit stats/implementation. (Rabbit itself is now canon as one of three opening base-animal choices.)
- Gecko Regeneration, Boar Myofibre, Moth Chemosense and Toad Dermal Gland exact prototype definitions. (Gecko and Toad source concepts are now canon in the new source-package model; R0.1 implementations are not.)
- R0.1 stat scales/viability formula.
- £12 / £860 / £30 economic values.
- Pit Scrap No. 7.
- Attack / Trait / Brace UI.
- R0.1 procedural graphics/palette.
- One-room damaged-pit layout.

---

# Remaining open design gates

These are the meaningful questions still open after Design Round 1 and the WP0.3A taxonomy lock.

## Splicing/system detail

- **S-OPEN-02:** Exact material economy: quantities, reagents, how samples are stored/replicated, and what experimentation consumes.
- **S-OPEN-03:** Exact compatibility/epistasis scoring/rules and how hidden versus visible interactions work.
- **S-OPEN-04:** Probability/distribution rules for the eight outcome bands and variable expression strength.
- **S-OPEN-05:** Concrete stabilisation/preservation/extraction mechanics for mutations.
- **S-OPEN-06:** Exact knowledge/diagnostic progression model and UI.
- **S-OPEN-07:** Stability model across repeated irreversible splices.

## Creature/arena detail

- **CR-OPEN-01:** Exact functional thresholds/tests for Land/Water/Air qualification and how partial capabilities are represented.
- **CR-OPEN-02:** How many non-main test animals/lab-stock animals the pit can practically hold and how housing constrains them.
- **CR-OPEN-03:** Exact modest ageing modifiers for short-lived species, if any, and how they are communicated without creating a punitive timer.

## Combat detail

- **C-OPEN-01:** Exact turn structure: simple alternating turns, initiative order, action-speed system, etc.
- **C-OPEN-02:** Resource/cooldown/stamina model preventing strongest-action spam.
- **C-OPEN-03:** Exact persistent injury/death rules by Pit tier.
- **C-OPEN-04:** Switching/tag/team rules when more than one creature participates.
- **C-OPEN-05:** Exact Land/Water/Air environment mechanics and how much spatial positioning exists inside a turn-based battle.
- **C-OPEN-06:** Training progression model and whether creatures learn improved ways to use existing capabilities.

## World/story detail

- **W-OPEN-01:** Final world geography, hub names and route layout. A proposal exists but is not yet canon.
- **W-OPEN-02:** Exact debt amount and Act 1 deadline.
- **W-OPEN-03:** Creditor identity, culture, terms and role in the unpaid-debt Act 2 branch. A proposal may be drafted before locking.
- **W-OPEN-04:** Detailed pit upgrade tree costs/dependencies/effects. A proposal exists but remains subject to tuning.
- **W-OPEN-05:** Detailed Fit Pit ladder/rules/ranks and Land/Water/Air circuit structure.
- **W-OPEN-06:** Story beyond the agreed Act 1 → Act 2 debt branch framework.

## Presentation

- **A-OPEN-01:** Exact tile/sprite resolution/camera metrics.
- **A-OPEN-02:** Exact production implementation of the hybrid phenotype renderer.
- **A-OPEN-03:** Character/environment asset workflow.
- **A-OPEN-04:** Final music style/tracks when supplied.
- **A-OPEN-05:** Final content-warning/disclaimer wording and rating/age presentation.

## Decision rule

An OPEN item becomes LOCKED only through explicit approval or a deliberately accepted prototype. Existing code alone is not a design decision.
