# SplicePit Work Packages — Visual-First R0 Rebase

**Status:** AUTHORITATIVE from WP0.4C onward

**Effective:** 18 August 2026

This file replaces the pre-reset WP0.4C+ contracts. The reset exists because human review rejected the direction of the first splice-bench UX, battle prototype and oversized/high-saturation visual pass.

The execution order is intentionally visual-first. Do not resume splice or combat mechanic work until WP0.4J has passed its explicit human gate.

## WP completion rule

For every WP:

- implement only the stated scope;
- preserve useful technical infrastructure where it does not constrain the new design;
- do not preserve rejected interaction/presentation simply because it already exists;
- run relevant automated checks;
- record save/schema impact;
- keep tunable assumptions provisional unless the WP explicitly locks them;
- stop at human gates rather than self-approving subjective direction.

---

# R0.4 — Visual Identity, Player and Workshop Foundation

## WP0.4C — Visual Direction Reset

**Depends on:** existing R0.2/R0.3 technical foundation. WP0.4A/B are reference experiments only.

**Purpose:** establish a new visual target before more mechanics are built.

**Direction to explore:**
- cartoony/animated rather than painterly;
- smaller, more intimate scale;
- high-quality small sprites;
- controlled, slightly darker palette;
- colour used as accent rather than blanket saturation;
- workshop/mad-science atmosphere;
- polished game-animation feel rather than giant illustrated UI cards;
- unsettling biological details embedded in props/creatures/world rather than making every surface horror-themed.

**Deliverables:**
- concise visual-direction specification;
- reference board translated into original visual principles, not direct imitation;
- palette families and contrast rules;
- proposed camera/world scale;
- proposed player/creature sprite scale;
- UI density/spacing target;
- workshop mood/composition sketches or prototype scene treatment;
- explicit list of rejected WP0.4C-v1 traits so they do not creep back in.

**Out of scope:** new splice mechanics, battle mechanics, world progression, production asset volume.

**Human gate:** user chooses/approves the new direction before WP0.4D begins.

**Acceptance:** the prototype no longer reads as oversized, over-saturated or dominated by UI; it clearly points towards a restrained high-quality animated mad-science game.

---

## WP0.4D — Interface Style System

**Depends on:** WP0.4C approved.

**Purpose:** define how information appears without making the interface the visual subject of the game.

**Deliverables:**
- typography hierarchy;
- compact panel/card treatment;
- buttons, prompts, tooltips, dialogue and selection states;
- HUD conventions;
- spacing/grid rules;
- colour-use rules inherited from WP0.4C;
- world-integrated versus overlay UI rules;
- desktop scaling baseline and future controller/touch compatibility;
- short-height viewport checks.

**Out of scope:** detailed splice/battle interaction design.

**Gate:** title/workshop/mock dialogue/inventory-style samples feel like one interface, remain readable and do not recreate the giant-box problem.

---

## WP0.4E — Creature and Player Sprite Design Pipeline

**Depends on:** WP0.4C–D.

**Purpose:** lock the small-sprite visual language before content volume grows.

**Deliverables:**
- player sprite proportions and silhouette rules;
- creature sprite proportions and readability rules;
- direction count and animation-state proposal;
- pixel/vector/raster rendering decision appropriate to the target look;
- modular component rules where customisation requires them;
- shading/outline/material rules;
- representative player sprite;
- representative Rabbit, Goat and Pig or equivalent test creature sprites;
- at least one weird biological variation proving the style can remain readable after mutation/splicing;
- export/naming/runtime asset contract.

**Gate:** sprites look intentional and high quality at actual in-game size, not merely when enlarged.

---

## WP0.4F — Player Character Creation Prototype

**Depends on:** WP0.4E.

**Purpose:** let the player establish a personal on-screen identity and prove that customisation can resolve into a coherent sprite.

**Deliverables:**
- limited but meaningful appearance choices;
- player naming flow;
- live preview;
- deterministic mapping from selected options to sprite presentation;
- save/load persistence;
- no control-key interception while entering text;
- clear limits preventing incompatible visual combinations;
- final small sprite used in the workshop scene.

**Open design inside WP:** exact categories/options. Keep scope deliberately modest until the sprite pipeline proves itself.

**Gate:** a new player can create a recognisable character, name them naturally and see the same high-quality sprite after save/load.

---

## WP0.4G — Workshop Scene Rebuild

**Depends on:** WP0.4C–F.

**Purpose:** make the inherited workshop/pit the visual home of the game before the systems inside it are redesigned.

**Deliverables:**
- rebuilt workshop layout at the approved scale;
- player movement using the approved sprite;
- layered environment art/prototype assets;
- coherent lighting/palette treatment;
- mad-science props, specimen storage, machinery and biological oddities;
- clear future interaction zones without implementing final splice/battle mechanics;
- readable depth/collision/navigation;
- compact contextual prompts using WP0.4D UI;
- ambient animation sufficient to make the workshop feel alive.

**Out of scope:** final splice-bench interaction, final battle access/progression.

**Gate:** walking around the workshop feels like the intended game even with major mechanics temporarily disabled/placeheld.

---

## WP0.4H — Opening Scene Rebuild

**Depends on:** WP0.4C–G.

**Purpose:** introduce the tone and hand the player into character creation/workshop without the old prototype presentation style.

**Deliverables:**
- revised opening composition;
- restrained narrative text/dialogue presentation;
- opening disaster context retained/revised only as already authorised by product direction;
- transition into character creation;
- transition into first workshop control;
- visual continuity with workshop/sprite/UI language;
- no dependence on final splice/battle systems.

**Gate:** opening communicates tone, stakes and world cleanly and feels visually part of the same game as the workshop.

---

## WP0.4I — Opening Flow and Presentation Integration

**Depends on:** WP0.4D–H.

**Purpose:** turn separate visual prototypes into one coherent first-ten-minutes experience.

**Deliverables:**
- title refinement;
- title → opening → creation → workshop flow;
- transition timing;
- consistent UI and input behaviour;
- loading/startup presentation;
- save/continue flow through the new opening state;
- cleanup of old visual artefacts that remain reachable;
- basic presentation QA across common desktop viewport sizes.

**Gate:** no early screen feels like it belongs to the rejected bright prototype or old dark terminal prototype.

---

## WP0.4J — Visual Direction Lock

**Depends on:** WP0.4I.

**Purpose:** explicitly approve the game’s visual baseline before system design resumes.

**Human review must cover:**
1. title/opening tone;
2. player sprite/customisation;
3. workshop composition and scale;
4. creature sprite direction;
5. palette and animation feel;
6. UI density and framing;
7. mad-science/weirdness balance.

**Deliverables:**
- final prototype visual brief;
- approved sprite metrics;
- approved UI rules;
- approved workshop/camera scale;
- recorded unresolved production-art questions for R0.7 rather than blocking mechanic design.

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
- what makes a creature’s body/build tactically meaningful;
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
- browser smoke for all required controls;
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

- Do not merge a superseded PR merely to preserve work.
- If useful code is needed later, cherry-pick/reimplement the smallest relevant portion into the current WP.
- Do not infer mechanic approval from existing tests.
- Automated tests for technical invariants may be retained; tests that enforce rejected UX/mechanics must be rewritten when the corresponding redesign WP begins.

This policy exists specifically to prevent later development from accidentally drifting back to the rejected splice, battle or oversized bright visual prototypes.