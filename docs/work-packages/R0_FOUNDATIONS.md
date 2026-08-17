# SplicePit Work Packages — R0 Foundations and Pre-Alpha

This file is the execution contract for R0.2 through R0.7. `ROADMAP.md` controls order; the specialist design documents control game-system intent. If a WP conflicts with `DECISION_LOG.md`, the decision log wins.

## WP completion rule

For every WP:

- work stays inside the stated scope unless a blocker requires a documented follow-up;
- automated checks relevant to the changed systems must pass;
- save/schema impact must be recorded;
- new assumptions must be marked `PROVISIONAL` or `OPEN`, not silently canonised;
- the WP is complete only when its explicit gate passes.

---

# R0.2 — Architecture Hardening

## WP0.2A — Toolchain Migration

**Depends on:** R0.1 merged baseline.

**Purpose:** Replace the intentionally temporary static/CDN development setup with the production browser toolchain while preserving behaviour.

**Deliverables:**
- Vite + strict TypeScript project.
- Phaser pinned as a package dependency; no runtime CDN/global dependency.
- Existing scenes/modules migrated with equivalent R0.1 behaviour.
- production `dist/` build suitable for Cloudflare Pages.
- scripts for dev, typecheck, test, build and verify.

**Out of scope:** redesigning splicing, combat, maps or visual content.

**Gate:** R0.1 flow runs under the new build; typecheck, unit tests, production build and browser smoke are green; Cloudflare preview can serve `dist/`.

## WP0.2B — Domain, IDs and Content Boundaries

**Depends on:** WP0.2A.

**Purpose:** Establish stable data contracts before content volume grows.

**Deliverables:**
- typed stable IDs and definitions for base animals, source packages/material, creatures, splice attempts, mutations, capabilities, actions, items, locations, quests and progression state;
- explicit content status: `prototype`, `draft`, `canon`, `deprecated`;
- runtime/build validation for duplicate IDs, broken references and invalid ranges;
- domain logic separated from Phaser presentation where practical;
- schemas support irreversible ordered splice history, research knowledge, physical material stock, test animals and the three-main-creature roster;
- arena capability model can represent Land/Water/Air independently and simultaneously.

**Out of scope:** final formulas for splicing/combat.

**Gate:** invalid fixtures fail validation; representative domain objects can be constructed/tested without Phaser.

## WP0.2C — State, Save Versioning and Persistence Contract

**Depends on:** WP0.2B.

**Purpose:** Make R0.2 the first save-compatible foundation release.

**Deliverables:**
- versioned save envelope and migration pipeline;
- safe treatment of R0.1 saves, including reset/archival path rather than permanent compatibility;
- persistent creature identity, age/history, phenotype seed, ordered splice history, injuries, training and arena capabilities;
- separate persistence for research knowledge and physical stock;
- separate settings storage where useful;
- corrupt/incompatible save recovery and backup strategy;
- representative migration/round-trip fixtures.

**Gate:** latest and historical test fixtures round-trip correctly; failed migration does not destroy the only readable save.

## WP0.2D — Semantic Input, UI Shell and Localisable Dialogue Framework

**Depends on:** WP0.2A, WP0.2B.

**Purpose:** Stop physical keys and one-off UI from leaking into every later system.

**Deliverables:**
- semantic actions (`MOVE_*`, `INTERACT`, `CONFIRM`, `CANCEL`, `MENU`, battle/lab actions);
- keyboard-first bindings with controller/touch-ready mapping architecture;
- reusable panel/modal/menu/dialogue primitives;
- scene transition/fade framework;
- dialogue/string IDs separated from display text;
- optional audio-reference field architecture for future voice work;
- focus/selection conventions usable later by controller.

**Gate:** current slice uses semantic input/shared UI; no core interaction depends directly on a hard-coded physical key.

## WP0.2E — Deterministic RNG, Diagnostics and CI Hardening

**Depends on:** WP0.2A–D.

**Purpose:** Make stochastic systems reproducible before they become complex.

**Deliverables:**
- seeded/injectable RNG service used by core stochastic logic;
- no direct `Math.random()` in domain systems;
- developer diagnostics for IDs, save state, RNG seed, creature biology and scene state;
- export/import debug-state hooks for development builds;
- CI gates for typecheck, content validation, tests, production build and browser smoke;
- browser smoke driven through player-facing controls wherever practical.

**Gate:** generated fixtures can be reproduced from saved inputs + seed; all R0.2 CI gates are green.

### R0.2 release gate

R0.1 behaviour remains playable, but the project is now a typed, versioned, deterministic, validated foundation on which later systems can be built without rewriting scene-specific code.

---

# R0.3 — Real Splicing Prototype

## WP0.3A — Source Package Taxonomy and Biological Data Model

**Depends on:** R0.2.

**Purpose:** Convert the six locked biological classes into an implementable content model.

**Deliverables:**
- schema/rules for anatomical, physiological, sensory, biochemical, behavioural/neurological and regulatory expression;
- source packages may contain multiple potential expressions rather than one guaranteed effect;
- base-animal biological tags/body-plan metadata;
- source requirements, compatibility tags, complexity inputs and phenotype/capability hooks;
- locked Rabbit/Goat/Pig and ten opening source packages represented as canonical content definitions without final balance numbers.

**Gate:** source/base definitions validate and can express multiple plausible outcomes without bespoke code per pairing.

## WP0.3B — Physical Material, Reagents and Research-Knowledge Model

**Depends on:** WP0.3A.

**Purpose:** Implement the locked distinction between knowing a source and possessing enough physical material to use it.

**Deliverables:**
- sample/material lots with quantity/source/quality metadata as required;
- reagent/attempt-cost abstraction;
- persistent research record per source and relevant base/context;
- experiment observations update knowledge while attempts consume physical stock;
- common/test-animal experimentation supported independently of the three-main roster;
- no infinite material generation through “discovery”.

**Open detail resolved inside WP:** initial prototype quantities/costs may be tuning values, not canon economy.

**Gate:** repeated tests increase stored knowledge while consuming stock, and the same learned source still requires new physical material for future attempts.

## WP0.3C — Compatibility and Epistasis Engine

**Depends on:** WP0.3A–B.

**Purpose:** Make combinations systemic rather than a hard-coded pair table.

**Deliverables:**
- tag/rule-based requirements, conflicts, synergies, redundancy and regulatory interactions;
- existing creature biology participates in later compatibility checks;
- exceptional authored interactions can override/augment general rules;
- explanations generated for major known conflicts/synergies;
- hidden versus observable information separated so diagnostics can reveal more without changing biology.

**Gate:** fixtures prove at least one systemic synergy, one conflict and one context-dependent interaction across more than one base animal.

## WP0.3D — Splice Resolution, Outcome Bands, Variance and Stability

**Depends on:** WP0.3A–C, WP0.2E.

**Purpose:** Implement the central uncertain outcome engine.

**Deliverables:**
- eight locked outcome bands;
- band probability distribution derived from complexity, compatibility, current stability, facilities and other explicit inputs;
- intended-expression selection and expression strength resolved separately from band;
- two `normal success` results can differ materially;
- stability/instability represented across repeated irreversible splices;
- rare catastrophic path can include permanent damage/death only when the risk distribution supports it;
- seeded reproducibility.

**Gate:** same nominal recipe under different seeds produces several legitimate outcomes; replaying a seed reproduces exactly; no hard gene-count ceiling exists.

## WP0.3E — Cumulative Creature Biology and Capability Derivation

**Depends on:** WP0.3D.

**Purpose:** Make a creature an irreversible history rather than a current equipment set.

**Deliverables:**
- ordered splice-attempt history persisted;
- current expression derived/updated from cumulative state;
- later attempts can interact with previous expression, mutation and injury;
- capabilities derived from actual functional outcome, not attempted gene labels;
- Land/Water/Air qualification fields can emerge independently from functional biology;
- age/history stored, with no harsh retirement mechanic introduced.

**Gate:** one creature receives several sequential splices, preserves its history through save/load and gains/loses capabilities only according to actual expression.

## WP0.3F — Mutation Research Prototype

**Depends on:** WP0.3D–E.

**Purpose:** Prove mutations can become research opportunities instead of generic random modifiers.

**Deliverables:**
- persistent mutation definitions/instances;
- analysis operation;
- at least one uncertain stabilisation operation;
- at least one uncertain preservation/extraction operation;
- mutation-derived material can be represented without becoming an automatic infinite-copy source;
- mutation outcomes recorded in lab history.

**Gate:** a generated mutation can be analysed and subjected to a follow-up operation whose seeded success/failure persists correctly.

## WP0.3G — Hybrid Phenotype Composition Prototype

**Depends on:** WP0.3A, WP0.3E.

**Purpose:** Prove combinatorial creature appearance can scale without hand-authoring every final animal.

**Deliverables:**
- authored base body/skeleton representation;
- modular anatomical/body-region components;
- layered/procedural surface and proportion changes;
- stable phenotype seed/parameters;
- fallback behaviour for conflicting/unsupported visible expressions;
- representative Rabbit/Goat/Pig multi-splice matrix.

**Gate:** multiple animals with overlapping source history remain visually distinct and reproduce exactly after save/load without one bespoke complete asset per genotype.

## WP0.3H — Lab Experimentation UX and Splicing Playtest Gate

**Depends on:** WP0.3B–G.

**Purpose:** Turn the systems into the intended player-facing experimentation loop.

**Deliverables:**
- choose test animal or main creature;
- inspect physical stock and accumulated research;
- show confidence ranges/known warnings rather than exact guaranteed outcomes;
- explicit irreversible commit step;
- outcome inspection, mutation/injury feedback and creature history;
- experiment record comparison across attempts/base animals;
- structured human playtest and formula tuning.

**Gate:** a player can test repeatedly on common animals, learn something meaningful, then make an informed-but-still-risky splice on a valued creature and understand the result.

### R0.3 release gate

The lab is demonstrably a game of experimentation and risk, not a deterministic crafting screen.

---

# R0.4 — Fit Pit Combat Prototype

## WP0.4A — Combat Metrics and Capability Action Model

**Depends on:** R0.3E.

**Purpose:** Translate actual biology into the smallest useful set of battle properties/actions.

**Deliverables:**
- rationalised metrics such as vitality, force, protection, mobility, perception, metabolic capacity, stability/reliability, reach/mass where justified;
- actions generated from functional anatomy/physiology/biochemistry/behaviour;
- no fixed four-move loadout;
- base-animal and splice-derived capabilities use the same action-generation path.

**Gate:** at least four biologically different creatures expose genuinely different legal action sets without enemy/player special cases.

## WP0.4B — Turn Structure and Action Economy

**Depends on:** WP0.4A.

**Purpose:** Lock the internal cadence of the already-decided turn-based combat model.

**Deliverables:**
- prototype/compare alternating, initiative/action-speed or simultaneous-declaration variants as appropriate;
- stamina/metabolic cost, recovery/cooldown/setup mechanisms sufficient to stop strongest-action spam;
- deterministic order/resolution rules;
- human-readable combat log/events.

**Decision gate:** final turn-order/action-economy model is locked by the end of this WP through playtest evidence.

**Gate:** chosen model is readable, deterministic under seed/state and creates repeated tactical decisions rather than one dominant action.

## WP0.4C — Training and Individual Skill Expression

**Depends on:** WP0.4A–B.

**Purpose:** Add earned proficiency without allowing training to invent impossible anatomy.

**Deliverables:**
- training record/progression for existing capabilities;
- reliability/accuracy/efficiency/specialised-technique improvements where appropriate;
- age/history hooks without heavy decay;
- safe practice operation usable later by pit facilities.

**Gate:** two biologically similar creatures with different training histories use the same capability differently while remaining bounded by their actual bodies.

## WP0.4D — Status, Injury, Recovery and Pit Danger

**Depends on:** WP0.4A–B, R0.3 stability model.

**Purpose:** Represent consequences from safe sparring through dangerous high-tier bouts.

**Deliverables:**
- temporary biologically grounded statuses;
- persistent injury model;
- early safe-pit rules with strong protection from permanent loss;
- configurable higher-risk rules permitting serious injury/rare death;
- recovery hooks for later pit facilities;
- clear pre-bout danger communication.

**Gate:** safe and dangerous rulesets use one system; persistent injury survives save/load; loss cannot occur as an unexplained arbitrary roll in low-risk bouts.

## WP0.4E — Land, Water and Air Functional Eligibility

**Depends on:** WP0.3E, WP0.4A.

**Purpose:** Implement the locked rule that environment access comes from demonstrated function, not attached-looking parts.

**Deliverables:**
- functional tests/thresholds for Land, Water and Air qualification;
- partial/nonfunctional capabilities represented (e.g. useless wings do not unlock Air);
- multi-environment qualification allowed, including theoretical all-three animals;
- environment-specific mechanics such as traction, breathing/propulsion, lift/endurance kept systemic;
- generalists acquire trade-offs through biological demands rather than an arbitrary “generalist penalty”.

**Gate:** fixtures include Land-only, Water-only, Air-only, dual-class, all-three and misleading-but-nonfunctional anatomy cases.

## WP0.4F — Multi-Creature and Special-Bout Architecture

**Depends on:** WP0.4B, WP0.4D–E.

**Purpose:** Avoid hard-coding forever-1v1 while keeping initial battles simple.

**Deliverables:**
- 1v1 remains default;
- battle model supports a roster of up to three mains;
- switching/tag/team participant model where a ruleset allows;
- asymmetric participant counts including future 3v1;
- endurance/special-bout rules hooks;
- no requirement that player owns one creature per arena class.

**Gate:** automated fixture resolves 1v1 and one asymmetric/multi-participant scenario using the same combat core.

## WP0.4G — Opponent Construction and AI

**Depends on:** WP0.4A–F.

**Purpose:** Build opponents through the same biology/capability model and make them tactically coherent.

**Deliverables:**
- opponent creature recipes/persisted definitions;
- AI archetypes such as pressure, endurance, status, setup and reactive;
- AI knowledge rules that do not grant unjustified hidden information;
- deterministic test mode;
- rule-aware arena/danger behaviour.

**Gate:** representative opponents choose legal coherent actions and can be replayed deterministically.

## WP0.4H — Balance Harness and Combat Playtest Lock

**Depends on:** WP0.4A–G.

**Purpose:** Detect obvious dominant systems before world/content scale multiplies them.

**Deliverables:**
- headless seeded battle simulation;
- representative specialist/generalist archetypes;
- round-robin reports for win rates, turns, action usage, damage/status sources and stalemates;
- human playtest across Land/Water/Air fixtures;
- tuning pass and recorded unresolved balance risks.

**Gate:** no universal dominant action/build is evident, specialist and generalist trade-offs are intelligible, and turn-based combat is accepted as fun/readable enough to build content on.

### R0.4 release gate

Biology creates legal capabilities, tactical play matters, environment matters, and the combat engine can scale beyond the first 1v1 without assuming fixed moves or fixed elemental types.

---

# R0.5 — World, Quests, Acquisition and Pit Progression

## WP0.5A — Authored World/Map Runtime

**Depends on:** R0.2D.

**Purpose:** Build one reusable top-down world scene/runtime for interconnected authored hubs and routes.

**Deliverables:**
- map loading, collision, layers, triggers, exits, interactables and persistent location state;
- camera/transition conventions;
- reusable route/hub data rather than one Scene class per map;
- hooks for physical creature transport/visibility when required.

**Gate:** two authored test maps support round-trip transitions, persistent interactable state and save/load.

## WP0.5B — Dialogue, NPC and Relationship State

**Depends on:** WP0.2D, WP0.5A.

**Purpose:** Support authored characters without embedding story logic in scene code.

**Deliverables:**
- data-driven dialogue nodes/choices/conditions/actions;
- persistent NPC/relationship/state flags;
- localisation-ready string IDs and optional future voice asset references;
- dialogue validation for broken links.

**Gate:** one NPC changes dialogue/state across a quest and save/reload without bespoke scene branching.

## WP0.5C — Quest, Story Clock and Branch-State Framework

**Depends on:** WP0.5A–B, WP0.2C.

**Purpose:** Support Act 1 debt pressure and later story branching without real-time urgency.

**Deliverables:**
- objective types: talk, visit, acquire, harvest, deliver, splice-condition, fight, interact and state-choice;
- quest journal/state;
- explicit in-world day/time/story-clock abstraction;
- deadlines and branch conditions;
- paid/unpaid debt-state hooks without locking exact debt numbers yet;
- quest graph validation.

**Gate:** representative quest crosses maps, advances time, meets/misses a deadline and produces two persistent branch states.

## WP0.5D — Acquisition, Inventory and Economy Framework

**Depends on:** WP0.3B, WP0.5A–C.

**Purpose:** Connect world activity to laboratory resources through the four locked acquisition channels.

**Deliverables:**
- buy, harvest, win and trade transaction paths;
- money, material lots, reagents, quest items and animal acquisition represented cleanly;
- shop/market/trade abstractions;
- harvesting encounter/interaction abstraction;
- Pit rewards can include money/material/access;
- initial economy metrics remain tunable data, not canon.

**Gate:** one source/material can be acquired through each of the four channels in fixtures and reaches the lab inventory correctly.

## WP0.5E — Test Stock, Housing and Physical Creature Handling

**Depends on:** WP0.3E, WP0.5A, WP0.5D.

**Purpose:** Make animals physical persistent world assets rather than inventory icons.

**Deliverables:**
- separate main-creature and test-stock management;
- housing capacity model;
- handling/transport state for ordinary, large, aquatic, aerial or dangerous animals;
- cages/leads/transport requirements represented where relevant;
- main roster cap of three enforced separately from lab-stock capacity;
- age/history carried through acquisition/ownership.

**Gate:** player can own three mains plus additional test stock, encounter a housing limit and move/prepare a specialised creature without magical pocket storage.

## WP0.5F — Pit Upgrade Framework

**Depends on:** WP0.3, WP0.4, WP0.5D–E.

**Purpose:** Implement a data-driven upgrade system around the nine locked domains while leaving exact production costs/tier ordering tunable.

**Deliverables:**
- foundation prerequisites and upgrade dependency graph;
- domains: diagnostics, splice safety, recovery, sample storage, mutation analysis, housing, Fit Pit/training, workshop and cosmetic restoration;
- upgrades can unlock information/actions/capacity/facilities, not only percentage modifiers;
- cross-branch dependencies supported;
- proposal in `PIT_UPGRADE_TREE_PROPOSAL.md` usable as a tuning/reference candidate, not silently canonised.

**Gate:** representative upgrades from several branches alter real player capability and persist across save/load.

## WP0.5G — Fit Pit Ladder, Circuits and Reward Progression Framework

**Depends on:** R0.4, WP0.5C–D.

**Purpose:** Turn individual fights into semi-legal regional progression.

**Deliverables:**
- Pit definitions, ranks/tiers/rulesets and rewards;
- Land/Water/Air circuits can progress independently;
- specialist play supported without requiring all three classes;
- early safe and later dangerous rules attach to Pit definitions;
- access/reputation/story prerequisites;
- reward hooks for money/material/access/quest progression.

**Gate:** test player can progress a Land circuit while leaving Water/Air untouched, and a separate multi-environment creature can legally enter more than one eligible circuit.

## WP0.5H — Integrated World Loop Prototype

**Depends on:** WP0.5A–G.

**Purpose:** Prove the complete non-production loop before art/story volume.

**Deliverables:**
- leave pit → travel → quest/interact → buy/harvest/win/trade material → manage test stock → experiment → splice main → train/fight → receive reward → buy upgrade → advance story clock;
- browser acceptance flow;
- playtest focused on pacing, friction and missing system links.

**Gate:** entire loop is playable without developer intervention and no core system requires one-off scene hacks.

---

# R0.6 — Production Presentation Pipeline

## WP0.6A — Art Direction, Tone and Content-Warning Specification

**Depends on:** R0.3/R0.4 visual/system findings.

**Purpose:** Turn “storybook wrongness / pastoral biotech” into an enforceable production guide.

**Deliverables:** palette/shape/material/lighting/UI language; grotesque-vs-comic boundary; examples of what is not SplicePit; adult animal-harm warning/disclaimer presentation proposal; reference screens/asset rules.

**Gate:** art/content contributors can judge whether a new asset belongs in the game without relying on R0.1 visuals.

## WP0.6B — Environment and Character Asset Pipeline

**Depends on:** WP0.6A, WP0.5A.

**Purpose:** Lock production scale and repeatable asset workflow.

**Deliverables:** tile/sprite/camera metrics; environment kit conventions; character proportions/animation states; atlas/export/naming rules; map-decoration workflow that avoids rigid tile-looking environments.

**Decision gate:** final tile/sprite/camera metrics become locked here.

**Gate:** one production-quality hub/route kit and one character animation standard function in browser.

## WP0.6C — Production Creature Phenotype Renderer

**Depends on:** WP0.3G, WP0.6A.

**Purpose:** Convert the phenotype prototype into the production combinatorial renderer.

**Deliverables:** authored base bodies, modular anchors/layers, surface/proportion/deformation instructions, caching, battle/world scale handling, graceful incompatibility fallbacks, stable identity.

**Gate:** a representative multi-splice matrix renders consistently at production quality without bespoke complete sprites per final creature.

## WP0.6D — UI Design System and World/Dialogue Production Pass

**Depends on:** WP0.2D, WP0.6A.

**Purpose:** Establish reusable production UI rather than scene-by-scene styling.

**Deliverables:** typography, panels, buttons/focus, HUD, dialogue, choice lists, quest journal, inventory/creature inspection, responsive scaling and localisation-safe layouts.

**Gate:** representative world/dialogue/inventory flows use one coherent design system and remain usable with longer localisation strings.

## WP0.6E — Lab and Combat Production UI

**Depends on:** WP0.3H, WP0.4H, WP0.6D.

**Purpose:** Give the two core gameplay systems final information architecture.

**Deliverables:** research records, confidence/risk display, material selection, irreversible confirmation, outcome/creature history, capability/action combat UI, status/injury/danger feedback and readable combat log.

**Gate:** playtesters understand what they know, what is uncertain, what an action does and why a major outcome occurred.

## WP0.6F — Audio, Settings, Accessibility and Localisation Runtime

**Depends on:** WP0.2D, WP0.6D.

**Purpose:** Establish production-ready non-visual presentation infrastructure without blocking on final music.

**Deliverables:** music/SFX manager, master/music/SFX volumes, mute, saved settings, placeholder music support, creature/world/lab/arena SFX hooks, key remapping, controller baseline, reduced shake/flash, non-colour-only state communication, localisation runtime/fallback.

**Gate:** settings persist; keyboard/controller core navigation works; localisation swap can occur without code changes; final supplied music can later be dropped into declared slots.

## WP0.6G — Asset Performance and Presentation Integration Gate

**Depends on:** WP0.6A–F.

**Purpose:** Ensure production presentation remains viable in the browser before content scale expands.

**Deliverables:** asset-loading strategy, phenotype texture caching, bundle/load profiling, repeated scene-transition memory checks, browser smoke of production UI/art/audio, presentation QA checklist.

**Gate:** production slice meets documented performance targets on the supported baseline browser/device set and has no major asset/UI pipeline blocker.

---

# R0.7 — Integrated Pre-Alpha Slice

R0.7 is where systems become a deliberately authored slice. It must not silently lock still-provisional full-game geography, creditor identity or exact debt balance.

## WP0.7A — Pre-Alpha Content Lock and Slice Manifest

**Depends on:** R0.2–R0.6.

**Purpose:** Define exactly which content the pre-alpha will contain before authoring it.

**Deliverables:** approved slice map list, NPC list, quest list, first opponent, material/sample list, starter content manifest, temporary debt values if final Act 1 balance is not yet locked, asset checklist and explicit end point.

**Decision gates:** approve the subset of world-map/upgrade/story proposals actually used by the slice.

**Gate:** every subsequent R0.7 WP has a bounded authored-content target and no unanswered blocker.

## WP0.7B — Opening Disaster and Emergency Starter

**Depends on:** WP0.7A.

**Purpose:** Implement the established opening as real game content.

**Deliverables:** apprenticeship introduction, containment failure, fail-safe gas event, aftermath, surviving Rabbit/Goat/Pig choice, ten source-package records/material, emergency irreversible first splice and transition toward the booked bout.

**Gate:** new game reaches a unique persistent first creature through player choice without debug shortcuts.

## WP0.7C — Inherited Pit Production Location

**Depends on:** WP0.7A, WP0.6B.

**Purpose:** Replace the prototype room with the first persistent home-base location.

**Deliverables:** damaged lab/pit map, functional lab areas, housing/test stock, records, basic recovery/storage, visible restoration states and hooks for upgrades/visiting NPCs.

**Gate:** pit supports every core system required by the pre-alpha and persists visible state changes.

## WP0.7D — Starting Hub and Routes

**Depends on:** WP0.7A, WP0.5A–B, WP0.6B.

**Purpose:** Build the first production exploration geography around the inherited pit.

**Deliverables:** starting hub, enough connecting routes/harvest spaces for the slice, NPC population, common test-animal sources and physical travel/transport logic.

**Gate:** player can explore the slice geography naturally and return with animals/material without developer intervention.

## WP0.7E — Authored Acquisition and Experimentation Loop

**Depends on:** WP0.7C–D.

**Purpose:** Teach the distinctive “test before you risk the main” behaviour through authored play.

**Deliverables:** common test-animal acquisition, repeatable/quest source material, experiment-record tutorialisation, at least two acquisition channels beyond automatic grant, one meaningful decision to risk or protect the main creature.

**Gate:** fresh tester discovers the testing/knowledge mechanic from play rather than documentation.

## WP0.7F — First Fit Pit, Debt Pressure and Early Upgrades

**Depends on:** WP0.7B–E.

**Purpose:** Connect the opening creature to combat/economy/progression.

**Deliverables:** booked first Land bout, local early-safe Pit presentation, first purses/rewards, debt/obligation reveal using provisional or approved creditor wrapper, visible in-world deadline support, several meaningful first pit upgrades.

**Gate:** player completes first bout, understands debt pressure and can make an upgrade/economy choice without exact full-Act-1 balance being final.

## WP0.7G — Save, Onboarding and End-to-End Integration

**Depends on:** WP0.7B–F.

**Purpose:** Make the slice robust as a standalone build.

**Deliverables:** new/continue/reset flow, autosave checkpoints, onboarding without debug prose, settings access, browser acceptance tests across opening/lab/world/combat/save, recovery from reload at representative points.

**Gate:** end-to-end smoke reaches slice completion and survives reloads at major transitions.

## WP0.7H — Structured Pre-Alpha Playtest and Hardening

**Depends on:** WP0.7A–G.

**Purpose:** Decide whether foundations are good enough for full Act 1 production.

**Deliverables:** playtest questionnaire/telemetry notes if used, defect fixes, pacing/usability findings, splice/combat/economy observations, exploit review, performance regression pass, documented design changes fed back to `DECISION_LOG.md` and system docs.

**Gate:** no high-severity blocker remains in the core loop and the team explicitly accepts the systems for R1 content production.

### R0 completion gate

A new player can start from the opening disaster, create an individual irreversible creature, explore, acquire/test biological material, fight, earn, upgrade, save/continue and understand the game's core promise without developer explanation.
