# SplicePit Work Packages — Graphics-First R0 Rebase

**Status:** AUTHORITATIVE from WP0.4C onward

**Effective:** 23 August 2026

This file replaces all earlier WP0.4C+ contracts where they conflict with the 23 August graphics-first reset.

The active visual source of truth is:

- `docs/VISUAL_DIRECTION_2026-08-23.md`
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

The immediate objective is not to rebuild the whole game. It is to prove that choosing one of four protagonists and walking around a small SplicePit environment already feels good.

Do not resume splice or combat mechanic development until WP0.4J has passed its explicit human gate.

## WP completion rule

For every WP:

- implement only the stated scope;
- preserve technical infrastructure only where it is genuinely presentation-independent;
- do not preserve rejected interaction/presentation because code already exists;
- run relevant automated checks;
- record save/schema impact;
- stop at human gates rather than self-approving subjective art/game-feel decisions;
- do not pull future-system work forward into the active graphics-first milestone.

---

# R0.4 — Graphics-First Player and World Foundation

## WP0.4C — Visual Direction and Protagonist Lock — COMPLETE

**Depends on:** existing R0.2/R0.3 technical foundation. WP0.4A/B remain reference experiments only.

**Purpose:** establish the visual target and protagonist set before further player-facing development.

**Locked result:**

- premium original GBA-era top-down RPG readability;
- biotech-apprentice art direction described as **cute but concerning**;
- four authored protagonists: Milo, Theo, Ada and Pip;
- no mechanical class differences between the four;
- warm attractive environments with biological wrongness embedded in props and details;
- compact world-first UI rather than giant panels;
- 24 × 32 px player frames;
- four directions;
- one idle plus three walk frames per direction;
- nearest-neighbour scaling;
- broader modular character customisation deferred.

**Authoritative artefacts:**

- `docs/VISUAL_DIRECTION_2026-08-23.md`
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`

**Superseded:** previous WP0.4C reference boards and earlier visual prototype treatments.

---

## WP0.4D — Runtime Protagonist Sprite Production — READY

**Depends on:** WP0.4C complete.

**Purpose:** turn the approved concepts into clean production-shaped runtime assets before building more screens.

**Deliverables:**

- clean runtime sprite sheet for Milo;
- clean runtime sprite sheet for Theo;
- clean runtime sprite sheet for Ada;
- clean runtime sprite sheet for Pip;
- fixed frame grid and naming convention;
- consistent foot/origin position across all frames and protagonists;
- down/left/right/up rows or equivalent deterministic runtime layout;
- one idle + three walk frames per direction;
- nearest-neighbour asset loading;
- Phaser animation definitions or asset metadata needed by the next WP;
- in-engine sprite test proving each character at actual play size.

**Asset contract:**

- frame size: 24 × 32 px;
- four directions;
- four frames per direction when idle is included;
- concept sheets are references only and must not be treated as directly sliceable runtime sheets;
- no painterly scaling/filtering;
- silhouettes, hair shape, major colour blocks and key biotech accessories must remain identifiable at actual size.

**Out of scope:** character-selection UX, environment art, creature sprites, splice/battle UI, broad UI style system.

**Gate:** all four protagonists look deliberate, animate cleanly and remain recognisable at actual in-game scale.

---

## WP0.4E — Character Selection and Identity Persistence

**Depends on:** WP0.4D.

**Purpose:** let the player choose one of the four authored protagonists and persist that identity.

**Deliverables:**

- minimal character-selection scene;
- Milo / Theo / Ada / Pip choices;
- live small-sprite preview using the actual runtime asset;
- player name entry;
- persisted `avatarId` and player name in game state/save data;
- load/continue returns the same protagonist;
- keyboard-safe text entry with no movement/control-key interception;
- simple mouse/touch-ready selection architecture where practical;
- no protagonist-specific mechanical bonuses.

**Deliberately deferred:**

- generic gender selector;
- modular hair/clothes/face builder;
- large wardrobe/customisation system;
- complex biography/class selection.

**Out of scope:** workshop mechanics, splicing, combat, quests, economy.

**Gate:** a player can choose one of the four, enter a name, save/reload and reliably see the same selected protagonist.

---

## WP0.4F — Apprentice Splicer Yard Rebuild

**Depends on:** WP0.4E.

**Purpose:** create a completely fresh small environment that embodies the approved visual direction and exists solely to prove exploration feel.

**Implementation rule:** this is not a reskin of the existing Lab scene. Reuse technical helpers only where they do not dictate old layout or presentation.

**Deliverables:**

- new Apprentice Splicer Yard scene/map;
- compact workshop/lab building;
- grass and dirt path structure;
- trees, shrubs, flowers and strange plants;
- water feature/stream/pond and small bridge where suitable;
- crates, barrels and specimen tables;
- fenced pens/cages and containment details;
- improvised biotech props, tubes, tanks or workshop clutter;
- readable collision geometry prepared for WP0.4G;
- layered foreground/background art suitable for player depth sorting;
- enough open walking space to evaluate movement cleanly.

**Visual tone:**

- charming and inviting at first glance;
- increasingly questionable on inspection;
- clear evidence that irresponsible apprentice gene-splicing happens here;
- no realistic gore or horror-scene treatment.

**Out of scope:** splice bench mechanics, battle access, inventory/economy, quests, NPC systems, large menus.

**Gate:** a static screenshot of the yard already reads as a specific SplicePit place rather than generic RPG scenery.

---

## WP0.4G — Movement, Collision, Depth and Camera Polish

**Depends on:** WP0.4F.

**Purpose:** make simply moving the chosen protagonist through the yard feel good.

**Deliverables:**

- responsive four-direction movement;
- correct directional animation switching;
- correct idle facing when movement stops;
- collision against buildings, fences, trees, water and props;
- sensible feet-based hitbox/origin;
- depth ordering so the player passes behind canopies, awnings and tall props where appropriate;
- smooth camera follow;
- nearest-neighbour rendering without blur/shimmer;
- keyboard baseline through the existing semantic input architecture;
- viewport behaviour suitable for common desktop browser sizes;
- removal/bypass of old visual routes so the test build reaches the new graphics-first flow cleanly.

**Movement direction:** use free top-down movement unless playtest proves strict tile-step movement is preferable. Visual animation remains four-directional.

**Out of scope:** interactions beyond minimal test/debug hooks, final touch controls, final controller implementation, gameplay systems.

**Gate:** movement itself feels responsive, readable and pleasant.

---

## WP0.4H — Graphics-First Playable Gate — HUMAN GATE

**Depends on:** WP0.4D–G.

**Purpose:** deliberately stop development and judge the player/world foundation before adding more game.

**Required playable flow:**

`Boot → Character Select → Apprentice Splicer Yard`

The player must be able to:

1. choose Milo, Theo, Ada or Pip;
2. enter a name;
3. enter the yard as that protagonist;
4. walk around smoothly;
5. collide with the world correctly;
6. pass behind/in front of layered scenery correctly;
7. experience stable camera behaviour;
8. save/reload the selected identity where applicable.

**Human review questions:**

- are the characters the correct size?
- do they look good at actual play scale?
- does selection feel like choosing a real protagonist?
- does walking feel good?
- do the animations have enough personality?
- is the environment attractive enough to explore without objectives?
- is there enough biotech wrongness to feel specifically like SplicePit?
- does collision/depth make the character feel embedded in the environment?
- does the result make the user want to keep building from it?

**HARD STOP:** if the answer is not clearly yes, return to WP0.4D–G. Do not add systems to hide a weak foundation.

---

## WP0.4I — Post-Gate Presentation Expansion

**Depends on:** explicit human approval of WP0.4H.

**Purpose:** only after movement/world feel is accepted, expand enough presentation to prove the same language can support the beginning of the actual game.

**Important:** exact scope must be revalidated after WP0.4H rather than blindly inherited from older plans.

**Candidate deliverables, subject to post-gate confirmation:**

- minimal title/start presentation;
- restrained opening/dialogue treatment;
- compact interface samples that do not dominate the world;
- first creature visual proof at the accepted scale/style;
- save/continue presentation cleanup;
- removal of old reachable presentation artefacts.

**Not automatically included:** full opening production, broad inventory UI, final splice UI, battle UI, mass creature/NPC asset production.

**Gate:** all added presentation still feels like the same game as the accepted yard rather than reintroducing giant-box/web-app presentation.

---

## WP0.4J — Visual Direction Lock for Mechanic Re-entry — HUMAN GATE

**Depends on:** WP0.4I.

**Purpose:** explicitly confirm that the visual/game-feel baseline is strong enough for splice-mechanic redesign to resume.

**Human review must cover:**

1. protagonist sprite quality;
2. character-selection identity;
3. yard/world composition and scale;
4. movement/camera/depth feel;
5. palette and animation feel;
6. compact interface language where introduced;
7. creature visual proof where introduced;
8. mad-science/weirdness balance;
9. absence of rejected legacy presentation.

**Deliverables:**

- final R0.4 visual brief;
- approved sprite metrics;
- approved movement/camera/world scale;
- approved minimum UI rules;
- recorded production-art questions deferred to R0.7.

**HARD GATE:** do not begin WP0.5A until explicit human approval.

---

# R0.5 — Core Mechanic Redesign

## WP0.5A — Splice Mechanics Design Reset

**Depends on:** WP0.4J.

**Purpose:** decide what splicing actually feels like to play before rebuilding the bench.

**Method:** design conversation/specification first, implementation second.

**Questions to resolve:**

- what exactly the player chooses before an attempt;
- what a disposable test tells the player;
- whether/when repeated tests are useful;
- how physical samples are consumed;
- how knowledge transfers between test and main creatures;
- how much uncertainty is visible;
- how the player commits to a valued creature;
- how repeat splicing on one creature should feel;
- what failure/death/injury risks are fun rather than merely systemic;
- how the mechanic is presented spatially in the workshop;
- what information belongs in-world versus in UI.

**Deliverables:**

- approved player loop;
- state diagram;
- resource/knowledge rules;
- main-versus-test-animal rules;
- commit/failure/recovery rules;
- UX wireflow aligned with WP0.4 visual language;
- list of R0.3 domain components that can be reused unchanged, adapted or discarded.

**Human gate:** approve the splice design before bench implementation.

---

## WP0.5B — Splice Bench Interaction Prototype

**Depends on:** WP0.5A approved.

**Purpose:** build the newly approved splice experience, not repair the rejected one.

**Deliverables:**

- workshop-integrated bench interaction;
- approved test/main loop;
- correct material/knowledge behaviour;
- clear irreversible commit;
- animated feedback consistent with visual direction;
- creature outcome reflected in sprite/phenotype presentation where supported;
- deterministic domain test coverage;
- browser playtest path;
- save/load behaviour.

**Gate:** human playtest confirms the bench is understandable, interesting and worth repeating.

---

## WP0.5C — Battle Mechanics Design Reset

**Depends on:** WP0.5B human acceptance.

**Purpose:** decide what battles actually feel like after the creature/splice experience is understood.

**No current cadence is sacred.** WP0.4A/B output is reference evidence only.

**Questions to resolve:**

- turn-based versus any revised cadence still desired;
- how position/arena space is represented;
- how capability-derived actions appear to the player;
- how speed/initiative/reactions work;
- how resource pressure prevents obvious spam;
- how much state is visible at once;
- what makes a creature's body/build tactically meaningful;
- how environmental capability affects battles;
- battle duration and pacing;
- injury/defeat/death stakes;
- 1v1 baseline and later roster/multi-creature implications.

**Deliverables:**

- approved battle loop;
- battle-state model/wireflow;
- action/resource/cadence specification;
- arena presentation specification;
- list of reusable/superseded WP0.4A/B components.

**Human gate:** approve battle design before implementation.

---

## WP0.5D — Battle Interaction Prototype

**Depends on:** WP0.5C approved.

**Purpose:** build the accepted battle model at prototype depth.

**Deliverables:**

- workshop/world entry into a test bout;
- approved cadence/action/resource interaction;
- player and opponent creature sprites in the accepted arena presentation;
- readable feedback/log/state;
- deterministic resolution test mode;
- representative capability differences;
- browser smoke for required controls;
- post-bout return flow.

**Gate:** human playtest accepts the battle loop as readable and enjoyable enough for progression/world content to be built around it.

---

# R0.6 — World, Quests, Acquisition and Pit Progression

## WP0.6A — Authored World/Map Runtime
Build reusable top-down authored map runtime, collision, layers, triggers, exits, camera and persistent location state.

## WP0.6B — Dialogue, NPC and Relationship State
Build authored NPC/dialogue state without embedding story logic into scene classes.

## WP0.6C — Quest, Story Clock and Branch-State Framework
Create data-driven quest/branch/progression state and time/trigger hooks.

## WP0.6D — Acquisition, Inventory and Economy Framework
Support Buy / Harvest / Win / Trade, physical stock, ordinary items/currency and economy hooks.

## WP0.6E — Test Stock, Housing and Physical Creature Handling
Define how animals exist, are housed, selected, moved and replaced outside the bench UI.

## WP0.6F — Pit Upgrade Framework
Implement the locked upgrade domains as data-driven dependencies without final economy balance.

## WP0.6G — Fit Pit Ladder, Circuits and Reward Progression Framework
Implement bout availability, arena/circuit eligibility, rewards and progression hooks after battle acceptance.

## WP0.6H — Integrated World Loop Prototype
Prove workshop → acquisition → splice/preparation → battle → reward/upgrade → progression end to end.

**R0.6 gate:** the RPG loop works without bespoke scene hacks.

---

# R0.7 — Production Presentation Pipeline

## WP0.7A — Production Art Specification and Content-Warning Treatment
Convert the approved R0.4 direction into production rules and define mature/weird content treatment.

## WP0.7B — Environment, Player and NPC Asset Pipeline
Lock production tile/sprite/camera/animation metrics and asset build/export process.

## WP0.7C — Production Creature Phenotype Renderer
Scale the approved creature language to cumulative biological variation.

## WP0.7D — Production UI, World and Dialogue Pass
Replace prototype UI/world/dialogue presentation while preserving the locked visual language.

## WP0.7E — Production Lab and Combat Presentation
Production-quality animation/feedback for the accepted WP0.5 systems.

## WP0.7F — Audio, Settings, Accessibility and Localisation Runtime
Add scalable audio/settings/accessibility/localisation infrastructure.

## WP0.7G — Asset Performance and Presentation Integration Gate
Validate browser performance, memory, loading and visual consistency.

---

# R0.8 — Integrated Pre-Alpha Slice

## WP0.8A — Pre-Alpha Content Lock and Slice Manifest
Approve the exact authored subset used by the pre-alpha.

## WP0.8B — Opening Disaster and Emergency Starter
Produce the accepted opening at authored slice quality.

## WP0.8C — Inherited Workshop/Pit Production Location
Produce the workshop as a real location with authored interactions.

## WP0.8D — Starting Hub and Routes
Build the first external geography around the workshop.

## WP0.8E — Authored Acquisition and Experimentation Loop
Create authored opportunities to acquire animals/material and use the accepted splice system.

## WP0.8F — First Fit Pit, Debt Pressure and Early Upgrades
Author first competition/progression/debt pressure around the accepted battle system.

## WP0.8G — Save, Onboarding and End-to-End Integration
Harden onboarding, save/resume, failure recovery and full slice flow.

## WP0.8H — Structured Pre-Alpha Playtest and Hardening
Run fresh-player playtests, fix blockers/confusion/exploits and record remaining risks.

**R0 gate:** the real game is understandable and compelling from play rather than explanation.

---

# Superseded implementation policy

The rejected branches/PRs remain useful forensic evidence but are not active implementation targets.

The following specific R0.4 contracts are deleted from the active plan:

- Interface Style System before player movement proof;
- combined Creature and Player Sprite Design Pipeline before player movement proof;
- modular Player Character Creation Prototype;
- Workshop Scene Rebuild that assumes the existing Lab presentation should be preserved;
- Opening Scene Rebuild before the walking-around gate;
- Opening Flow Integration before the walking-around gate.

Their useful goals may reappear later only after WP0.4H proves the player/world foundation.

General rules:

- do not merge a superseded PR merely to preserve work;
- remove/bypass old visual routes as the new playable replaces them;
- if useful code is needed later, cherry-pick/reimplement the smallest presentation-independent portion;
- do not infer mechanic or visual approval from existing tests;
- retain automated tests for technical invariants;
- rewrite/delete tests that enforce rejected presentation behaviour when touched by the active WP;
- never use sunk cost as a reason to preserve a visual design the user has rejected.

The graphics-first milestone succeeds when the player can choose Milo, Theo, Ada or Pip and simply walking around the Apprentice Splicer Yard already feels like the right game.