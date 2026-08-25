# SplicePit Master Execution Roadmap

## Purpose

This is the canonical development roadmap for SplicePit.

It answers:

- what is accepted;
- what gets built next;
- what is deliberately deferred;
- which dated planning document controls the current work;
- where human playtest gates stop autonomous implementation.

`docs/DECISION_LOG.md` remains the product/canon authority. This roadmap controls execution order. Newer explicitly dated human-review records override older prototype execution assumptions.

---

# Current authority — 25 August 2026

The graphics-first reset has succeeded. The project is no longer trying to prove whether the game should use the current protagonist/world direction; that foundation has now received explicit human approval.

The current detailed execution plan is:

- `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md` — **authoritative from the accepted graphics-first foundation through the first local Pit fight**.

Supporting visual/history authority:

- `docs/VISUAL_DIRECTION_2026-08-23.md`;
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md`;
- `docs/work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md`;
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`.

Where the 25 August opening-slice roadmap conflicts with older R0.4I/J or old R0.5–R0.8 sequencing, **the 25 August roadmap wins**.

## Next executable work package

> **Start WP0.5A — Splash / Title Corruption System**

A new development chat should begin there unless repository/PR state shows that package has already advanced.

---

# Accepted graphics-first foundation — LOCKED FORWARD

Human review has accepted the following foundation:

- four authored protagonists: Milo, Theo, Ada and Pip;
- accepted 64 × 96 directional protagonist source art;
- 1× protagonist display scale in the world;
- 1280 × 720 gameplay viewport direction;
- wider world density / more world visible at once;
- Apprentice Splicer Yard visual direction;
- four-direction movement;
- feet-based collision;
- camera follow and current gameplay-scale feel;
- in-world character-selection direction;
- authored/default protagonist name with optional rename.

The project should **not** restart these decisions merely because later art gets more detailed.

## Explicit visual-quality correction

The current Yard/world implementation is an accepted **direction, scale and composition foundation**, not final environment fidelity.

The user explicitly wants the game substantially more detailed than the present blockout-like environment art.

Future art should move towards the same care and personality as the protagonist sprites:

- richer authored ground/material texture;
- better buildings;
- improved foliage;
- better water;
- detailed props;
- convincing biotech/containment equipment;
- stronger depth/shadow cues;
- environmental storytelling;
- small animated detail where useful.

The target remains **premium detailed pixel art with GBA-era readability**, not crude chunky 8-bit-looking scenery.

Do not solve this by changing the accepted world scale back to a close view. Improve the assets at the accepted scale.

---

# Permanently rejected presentation direction

Do not restore or extend:

- old `VisualDirectionScene` presentation;
- legacy player-facing Lab/Splice/Battle presentation;
- old dark-terminal styling;
- the dark brown/olive `APPRENTICE REGISTRATION` screen;
- character tabs plus boxed preview as the default character-choice metaphor;
- giant browser/web cards as the main game UI;
- visible HTML-form composition as the default game boot;
- previous oversized/high-saturation visual experiments;
- any assumption that existing prototype UI deserves to survive because it already exists.

Presentation-independent domain logic, saves, input abstractions, deterministic systems and tests can be reused where appropriate.

---

# Core tonal direction — LOCKED

SplicePit presents a bright, colourful, inviting monster-RPG surface while something darker repeatedly tries to break through.

The contrast is part of the game's identity:

- cheerful world;
- readable colourful environments;
- enthusiasm for wildly unethical gene splicing;
- comic moral vacancy;
- genuine animal brutality and consequences;
- brief visual ruptures revealing a darker layer underneath.

The game should not become permanently grimdark. The darker moments work because the normal world remains attractive and optimistic.

The reusable visual language begins at the title screen: bright `SplicePit` presentation → brief corruption/flicker into the darker concept-art identity → snap back to normal.

---

# First real game vertical slice

The next major human-playable target is:

`Splash / Title → Main Menu → New Game → Opening narration → Character choice → Basic onboarding → Find Master → RinoCow disaster → Debt confrontation → First splice tutorial → First local Pit fight → result / next hook`

This is the first milestone to judge as **the actual game**, rather than an isolated movement or mechanics prototype.

## Locked opening story frame

Exact final dialogue can still be tightened, but these beats are locked for the slice:

1. **Title / menu**
   - bright monster-RPG presentation;
   - dark flicker/corruption underneath;
   - New Game / Continue / Settings.

2. **Satirical opening narration**
   - deliberately parody the optimistic monster-RPG introduction without directly copying another game's protected text, characters or exact presentation;
   - establish immediately that the world regards gene alteration and animal brutality with absurd enthusiasm.

3. **Choose apprentice**
   - Milo / Theo / Ada / Pip;
   - authored name accepted immediately;
   - optional rename;
   - no class/stat difference between protagonists.

4. **Basic onboarding**
   - movement;
   - interact/confirm/cancel;
   - Bag;
   - Map;
   - objective/help language.

5. **Master objective**
   - the Master is waiting;
   - he is about to undertake the splice fight of his life;
   - he owes dangerous people a large amount of money;
   - losing is likely to leave him comprehensively fucked.

6. **RinoCow disaster**
   - the Master's own spliced RinoCow turns on him;
   - the Master is mauled to death;
   - the bright world briefly ruptures into the darker underlying visual state;
   - the player is left with the workshop and consequences.

7. **Debt inheritance**
   - the people the Master owed confront the player between the aftermath and first Pit progression;
   - they make clear death did not erase the obligation;
   - the debt is now effectively the player's problem.

8. **First splice**
   - player learns the newly designed splice bench;
   - opening biological foundation uses Rabbit / Goat / Pig;
   - tutorial must create a viable creature;
   - player learns the real mental model, not a fake one-off interaction.

9. **First local Pit fight**
   - take the viable creature to the local Pit;
   - learn first battle model;
   - both tutorial win and loss must progress cleanly;
   - result establishes the next debt/progression pressure.

---

# Save / Continue direction

The current prototype returning to character selection on browser refresh is **not a blocker** for the present development stage.

Proper save behaviour becomes mandatory in R0.10 after the actual opening flow exists.

Final opening-slice persistence must cover:

- New Game reset semantics;
- Continue availability;
- protagonist/name;
- story/event flags;
- location/checkpoints;
- first creature/tutorial progress;
- first battle progress/result;
- safe browser reload.

Do not spend early packages polishing prototype refresh behaviour instead of building the game.

---

# Authoritative opening-slice sequence

## R0.5 — Front Door, Tone and New Game Flow — NEXT

**Goal:** make SplicePit boot like an actual game and establish the bright/dark tonal thesis.

### WP0.5A — Splash / Title Corruption System — READY

Build the bright title/splash, dark flicker identity and reusable corruption transition.

**Human/visual gate:** the title alone should communicate "appealing colourful monster RPG with something badly wrong underneath".

### WP0.5B — Main Menu Shell

New Game / Continue / Settings with keyboard and pointer support. Continue may remain unavailable until real saves arrive.

### WP0.5C — Opening Narration / Dialogue Presentation

Reusable game-native authored-text presentation plus the first satirical opening sequence.

### WP0.5D — Character Selection Integrated into New Game

Put the accepted in-world Milo/Theo/Ada/Pip selector into the real New Game flow.

### Graphics Tightening Pass A

Title/logo, title background, corruption effect, main menu, dialogue frame and visible character-selection scene.

**R0.5 gate:** boot → New Game → narration → character selection feels like one coherent opening.

---

## R0.6 — Onboarding and Opening World Route

**Goal:** teach navigation and connect the physical opening locations.

### WP0.6A — Controls / Help Tutorial Framework

Contextual reusable prompts for movement, interaction, Bag, Map and later mechanics.

### WP0.6B — Bag, Map and Objective Shells

Only enough real functionality for the opening slice.

### WP0.6C — Opening Objective Sequence

Teach basics and send player to the Master with the debt/fight setup.

### WP0.6D — Authored Opening Route

Connect Apprentice Splicer Yard → Master/Lab → route towards local Pit, including a suitable debt encounter location.

### WP0.6E — Master Lab Interior

Detailed lab suitable for the RinoCow event, splice bench and post-death state.

### WP0.6F — Local Pit Exterior / Interior Foundation

Enough authored Pit space to support arrival, first fight and result.

### Graphics Tightening Pass B

Yard, routes, Lab and Pit receive a substantial authored-detail pass.

**R0.6 gate:** character onboarding → Master's location works as a coherent playable world route.

---

## R0.7 — Disaster, Cutscenes and Debt

**Goal:** deliver the inciting story event and inherit the central pressure.

### WP0.7A — Cutscene Runtime

Control lock/release, camera focus, scripted movement/facing, dialogue timing, event flags and corruption hooks.

### WP0.7B — Master / RinoCow Disaster Cutscene

Author and implement the fatal mauling.

### WP0.7C — Dark-Layer Flicker Story Language

Generalise title corruption into a reusable in-world story effect.

### WP0.7D — Post-Death Lab State

Changed environment and objective state after Master death.

### WP0.7E — Debt Collector Encounter

Confront player and make inherited debt pressure explicit.

### Graphics Tightening Pass C

RinoCow, cutscene staging, Lab aftermath, corruption effects and debt encounter receive a dedicated polish pass.

**R0.7 gate:** player understands why they are now forced to splice and fight.

---

## R0.8 — First Real Splice Loop

**Goal:** rebuild the defining experimentation mechanic against the accepted game presentation.

### WP0.8A — Splice Mechanics Design Lock for Opening

Design first. Decide the minimum real player decisions, uncertainty, information, risk and viability model. Reuse useful R0.3 biology infrastructure but not its rejected player-facing UX.

### WP0.8B — Splice Bench Interaction v1

Build only the newly accepted bench interaction.

### WP0.8C — Starter Biological Content

Rabbit / Goat / Pig and the already-approved opening source-package foundation.

### WP0.8D — Guided First Viable Creature

Tutorial with enough agency to teach the actual system and guarantee a usable path forward.

### WP0.8E — Creature Roster / Basic Condition State

Minimum creature identity, phenotype summary and battle-relevant state.

### Graphics Tightening Pass D

Splice machinery, specimen handling, source selection, creature output and biological feedback.

**R0.8 gate:** a fresh player creates a viable creature and understands why experimentation is interesting.

---

## R0.9 — First Local Pit Fight

**Goal:** rebuild the defining battle mechanic and complete the first core loop.

### WP0.9A — Battle Mechanics Design Lock for Opening

Design first. Settle the minimum first-fight decision model, capability readability, condition consequences and tutorial-loss progression.

### WP0.9B — Pit Battle Runtime / UI v1

Implement only the accepted first-fight design.

### WP0.9C — First Opponent and Battle Tutorial

One readable opponent and guided first battle.

### WP0.9D — Win / Loss / Reward Resolution

Both outcomes progress without a hard lock.

### WP0.9E — Debt / Progression Hook After Fight

End the slice with clear future pressure/reward.

### Graphics Tightening Pass E

Arena, crowd/background life, creature presentation, actions/effects, damage feedback, combat UI and results.

**R0.9 gate:** first splice → first Pit fight feels like one coherent game loop.

---

## R0.10 — Save/Continue, Settings and Vertical-Slice Hardening

**Goal:** turn the assembled opening into a repeatable, resumable first game slice.

### WP0.10A — Real New Game / Continue Save Flow

Autosave/checkpoints, state persistence and safe reload.

### WP0.10B — Settings Completion

Music, SFX, text speed and essential display/accessibility settings justified by the slice.

### WP0.10C — End-to-End Opening Flow Integration

Prove:

`Title → New Game → narration → character → onboarding → Master → RinoCow death → first splice → debt confrontation → local Pit → first fight → result → continue/reload`

### Graphics Tightening Pass F — Final Opening Art Pass

Final pre-gate visual pass over title/menu, Yard, route, Lab, RinoCow event, debt encounter, bench, Pit, battle and UI consistency.

### WP0.10D — Opening Slice QA / Soft-Lock Hardening

Test event sequencing, saves, battle win/loss, tutorial paths, controls, collision/camera and legacy-UI regression.

### WP0.10E — FIRST REAL GAMEPLAY SLICE — HUMAN GATE

Human approval required for:

- title/menu tone;
- corruption/flicker language;
- writing tone;
- character selection integration;
- tutorial clarity;
- environment art fidelity;
- RinoCow event;
- debt pressure;
- first splice;
- first battle;
- save/continue;
- desire to continue beyond the first Pit fight.

Do not begin broad Act 1 production until this gate passes.

---

# Opening-slice scope lock

Build only what the slice needs:

- one title/main-menu flow;
- one opening narration;
- one character-selection flow;
- Apprentice Splicer Yard;
- one opening route;
- one Master lab;
- one local Pit;
- one Master/RinoCow disaster;
- one debt confrontation;
- one splice tutorial;
- Rabbit/Goat/Pig starter biological content;
- one viable player creature path;
- one first opponent;
- one battle tutorial;
- win/loss resolution;
- final save/continue checkpoints.

Do not expand yet into:

- full regional map production;
- many towns;
- large bestiary production;
- deep economy;
- broad quest trees;
- multiple Pit circuits;
- large NPC relationship systems;
- full Act 1 content.

---

# Later roadmap after the opening slice

The earlier long-range planning remains useful at a strategic level but is not allowed to override the opening-slice work above.

## R1 — Alpha 1 / Complete Act 1 — PLANNED

After R0.10 human approval:

- lock Act 1 canon and production content;
- expand geography;
- build NPC/dialogue/relationships;
- expand biological content;
- add acquisition economy/quests;
- introduce full Pit progression and Water/Air content;
- build pit upgrades/training/recovery;
- deliver the debt deadline and major Act 1 outcomes;
- complete Alpha 1 integration/QA.

## R2 — Alpha 2 / Act 2 Expansion — PLANNED

- branch architecture;
- independent/creditor-controlled routes;
- Water/Air/specialist circuits;
- advanced biology/mutations;
- high-risk Pit progression;
- branch convergence tuning;
- integration/scale/save/performance QA.

## R3 — Content-Complete Beta — PLANNED

- content completion;
- biology balance;
- battle balance;
- economy/progression balance;
- UX/accessibility/controller/localisation;
- browser performance;
- full-game regression and feature freeze.

## R4 — Release Candidate — PLANNED

- defect triage / release discipline;
- save compatibility and recovery;
- deployment/browser certification;
- licensing/credits/warnings;
- final presentation/localisation/performance polish;
- release candidate certification.

---

# Core decision gates

- **DG-PLAYER-SPRITE — LOCKED:** Milo/Theo/Ada/Pip and accepted current sprite foundation.
- **DG-WORLD-SCALE — LOCKED:** 1280 × 720 gameplay view direction, 1× protagonist scale, wider-world presentation.
- **DG-YARD-VISUAL — LOCKED DIRECTION / FIDELITY OPEN:** accepted visual language; environment requires repeated quality passes.
- **DG-CHARACTER-SELECT — ACCEPTED:** in-world selection direction; integrate into New Game.
- **DG-SAVE-OPENING — DEFERRED TO R0.10:** prototype refresh behaviour is not a current blocker.
- **DG-TITLE-TONE — LOCKED DIRECTION:** bright presentation with darker corruption/flicker underneath.
- **DG-OPENING-STORY — LOCKED FRAME:** satire → Master/debt setup → RinoCow death → inherited debt → first splice → first Pit.
- **DG-SPLICE-PLAY — OPEN UNTIL WP0.8A:** old bench UX is superseded; design the first real interaction before coding it.
- **DG-BATTLE-PLAY — OPEN UNTIL WP0.9A:** old battle UX is superseded; design the first real fight before coding it.
- **DG-OPENING-GATE — HARD HUMAN STOP AT WP0.10E.**

---

# Parallelism rule

Do not parallelise work where one package is still defining the contract consumed by the next.

In particular:

- title/menu/narration/character-flow packages should remain sequential enough to establish one presentation language;
- splice design WP0.8A must precede splice implementation;
- battle design WP0.9A must precede battle implementation;
- graphics tightening happens repeatedly after each introduced content cluster rather than as one late art dump;
- do not mass-produce later world/NPC/creature content before WP0.10E passes.

Technical cleanup may proceed only when it does not silently constrain unresolved design.

---

# Change-control rule

Human playtest is authority on subjective presentation/game feel.

When a prototype reveals a wrong direction:

1. stop extending it;
2. record what survived;
3. explicitly supersede the rejected part;
4. return to the earliest unresolved design contract;
5. do not compensate for weak fundamentals by adding more systems.

The 24 August character-select rejection and the successful Yard-first correction remain the model for this process.
