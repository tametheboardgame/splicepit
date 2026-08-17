# SplicePit Decision Log

This file prevents assumptions from becoming canon simply because they appeared in a prototype.

## Locked decisions

| ID | Decision | Notes |
|---|---|---|
| D-001 | SplicePit is a dark/adult creature-collection RPG centred on gene splicing. | Core identity. |
| D-002 | Most world play is top-down 2D exploration with tile-based spatial movement. | Presentation may evolve; fundamental RPG perspective is retained. |
| D-003 | Core loop is gene/base-animal acquisition → splicing → Fit Pit testing/progression → more world access/resources. | Individual reward structures remain tunable. |
| D-004 | Splicing has no arbitrary fixed maximum number of combined genes. | Complexity/compatibility/risk create practical limits. |
| D-005 | Identical splice inputs do not have to produce identical outcomes. | Stochastic success/failure/mutation is intentional. |
| D-006 | Creature architecture must support freeform composition rather than hand-authoring every combination. | Applies to mechanics and appearance. |
| D-007 | Terms `SpliceMaster` and `SpliceApprentice` are established. | Opening canon. |
| D-008 | Opening disaster kills the SpliceMaster and other apprentices; player survives after using emergency gas. | Exact scene scripting remains to be authored. |
| D-009 | Player inherits the damaged pit/resources and initially needs a new base animal. | Opening gameplay objective. |
| D-010 | Distrust/suspicion and crime/syndicate pressure exist around the inherited situation. | Wider plot deliberately unwritten here. |
| D-011 | Visual direction is “storybook wrongness” / “pastoral biotech”, not generic SNES fantasy. | Production art direction still needs a formal guide. |
| D-012 | Browser deployment through GitHub/Cloudflare is the current primary delivery route. | Packaging targets can expand later. |

## Planned technical decisions

| ID | Decision | Status |
|---|---|---|
| T-001 | Migrate the prototype from global/CDN Phaser JavaScript to a bundled TypeScript + Vite project. | PLANNED for R0.2. |
| T-002 | Pin Phaser as a project dependency rather than relying on a runtime CDN global. | PLANNED for R0.2. |
| T-003 | Keep domain logic independent of Phaser where practical. | PLANNED. |
| T-004 | Introduce versioned save format and migrations before wider playtesting. | PLANNED for R0.2. |
| T-005 | Introduce deterministic RNG/seed injection for splice/combat procedural behaviour. | PLANNED for R0.2. |
| T-006 | Store scalable game content in validated data modules/files with stable IDs. | PLANNED for R0.2/R0.3. |
| T-007 | Keep automated unit/system tests and browser smoke tests as merge gates. | PLANNED/ACTIVE. |

## Prototype-only decisions

These exist in R0.1 to prove systems and are not canon unless explicitly promoted.

| ID | Prototype element |
|---|---|
| P-001 | Rabbit as the initial base animal. |
| P-002 | Gecko Regeneration, Boar Myofibre, Moth Chemosense and Toad Dermal Gland samples. |
| P-003 | Current numeric stat scales and viability formula. |
| P-004 | Current £12 cash / £860 debt values and £30 demonstration purse. |
| P-005 | Pit Scrap No. 7 opponent. |
| P-006 | Current turn-based Attack / Trait / Brace combat. |
| P-007 | Current procedural creature drawing style and exact UI palette. |
| P-008 | Current one-room damaged pit layout. |

## Open design gates

These require explicit decisions before their dependent production systems are considered locked.

### Splicing

- **S-OPEN-01:** Gene taxonomy: anatomical parts, physiological systems, behaviours, biochemical traits, regulatory genes, or another classification model.
- **S-OPEN-02:** How gene samples are consumed/reused and what prevents infinite low-cost retrying.
- **S-OPEN-03:** Exact compatibility/epistasis model between genes.
- **S-OPEN-04:** Outcome bands: rejection, partial expression, unstable success, clean success, mutation, catastrophic outcomes, etc.
- **S-OPEN-05:** Whether mutations can be stabilised, inherited, extracted or deliberately cultivated.
- **S-OPEN-06:** How much information the player sees before committing to a risky splice.
- **S-OPEN-07:** Whether splicing can injure/kill/retire a base animal and how punitive failure should be.

### Combat

- **C-OPEN-01:** Final combat cadence/model. Current strict turn-based combat is only a prototype.
- **C-OPEN-02:** Creature move-selection model: learned moves, gene-granted moves, body actions, stamina/cooldowns, or combination.
- **C-OPEN-03:** Injury, knockout and death rules.
- **C-OPEN-04:** Team size and whether battles are always one creature versus one creature.
- **C-OPEN-05:** Environmental/arena effects and positioning requirements.
- **C-OPEN-06:** How player skill versus creature build quality should divide responsibility for winning.

### World and progression

- **W-OPEN-01:** Exact world/region structure and geography.
- **W-OPEN-02:** Real first base animal and first recoverable genes.
- **W-OPEN-03:** Currency/economy model and actual inherited debt/pressure numbers.
- **W-OPEN-04:** Pit upgrade tree and which facilities are mechanically meaningful.
- **W-OPEN-05:** Gene acquisition modes: quests, sampling, capture, trade, rewards, salvage, extraction, etc.
- **W-OPEN-06:** Fit Pit ladder structure, legality and progression rules.
- **W-OPEN-07:** Story beyond the established opening. This remains intentionally user-authored.

### Presentation

- **A-OPEN-01:** Final tile/sprite resolution and camera scale.
- **A-OPEN-02:** Production creature phenotype approach: layered sprites, modular vector/canvas components, generated sprite sheets, or hybrid.
- **A-OPEN-03:** Final character/environment asset pipeline.
- **A-OPEN-04:** Music direction and adaptive/non-adaptive implementation.
- **A-OPEN-05:** Voice/audio scope.

## Decision rule

An OPEN item should only move to LOCKED after an explicit design decision or after a prototype is tested and deliberately accepted. “It already exists in code” is not sufficient.
