# SplicePit Opening Vertical Slice Roadmap — 25 August 2026

## Authority

This document is the **authoritative execution override for the post-graphics-first opening slice**.

It records explicit human approval on 25 August 2026 to stop treating the current build as an isolated graphics prototype and begin building the actual game from the accepted visual/movement foundation.

Where this document conflicts with the older broad sequencing in `docs/ROADMAP.md` for R0.4I/J through the old R0.5–R0.8 plan, **this dated roadmap wins for work leading to the first complete opening slice**.

Read together with:

- `docs/ROADMAP.md` — long-range master plan;
- `docs/VISUAL_DIRECTION_2026-08-23.md` — active visual direction;
- `docs/VISUAL_RESET_CORRECTION_2026-08-24.md` — rejected old UI and retained technical foundation;
- `docs/work-packages/R0_VISUAL_FIRST_REBASE_CORRECTION_2026-08-24.md` — graphics-first correction history;
- `docs/DECISION_LOG.md` — product/canon authority unless this newer dated plan explicitly resolves an opening-slice execution choice.

---

# 1. State inherited from the graphics-first rebuild

The following are now accepted foundations, not provisional experiments:

- Milo / Theo / Ada / Pip are the authored protagonist choices;
- accepted 64 × 96 protagonist art remains the player sprite foundation;
- the wider `1280 × 720` gameplay view is the target screen proportion for the current foundation;
- the protagonist is shown at 1× source scale in the world;
- the broad world density / camera scale established in WP0.4G is approved;
- four-direction movement, feet-based collision and camera follow are approved foundations;
- the Apprentice Splicer Yard visual language is approved;
- the in-world character-choice direction from WP0.4E-R is approved;
- the old dark-terminal / browser-form UI direction remains rejected permanently.

Human review also established one important improvement requirement:

> The current world direction is correct, but the environment art should become substantially more detailed and polished. Improve fidelity **without undoing the accepted scale, camera, density or protagonist readability**.

The current environment should therefore be treated as a strong visual blockout / style foundation rather than final production-quality art.

## Save/load note

Current refresh behaviour returning to the opening selector is **not a blocker** for beginning the real game build.

Proper New Game / Continue / autosave / checkpoint behaviour is deliberately implemented later in this roadmap once the opening flow is worth persisting. Do not spend early packages polishing prototype refresh behaviour.

---

# 2. Tone thesis — LOCKED DIRECTION

SplicePit should present itself as a bright, colourful, inviting monster-RPG world with a darker reality repeatedly trying to break through.

The tonal contrast is fundamental:

- cheerful, readable, colourful surface;
- comic enthusiasm for wildly unethical gene splicing;
- increasingly obvious animal brutality and moral vacancy;
- occasional visual corruption / flickers revealing a darker version underneath;
- humour should come from the world treating horrifying things as normal, rather than from constant fourth-wall jokes.

The reference feeling is **bright monster-RPG optimism being periodically punctured by biological horror and consequences**. It should not become a grimdark game visually; the darkness works because the normal layer remains colourful and appealing.

## Title-screen thesis

The splash/title screen should initially present a bright, attractive `SplicePit` identity consistent with the accepted world.

At irregular or authored moments it should briefly flicker/corrupt into the darker visual identity already present in the concept direction, then snap back as though nothing happened.

This bright/dark flicker language becomes a reusable story device throughout the opening.

---

# 3. First complete opening-slice target

The next major playable target is:

`Splash / Title → Main Menu → New Game → Opening narration → Character choice → Basic onboarding → Find Master → RinoCow disaster → Debt confrontation → First splice tutorial → First local Pit fight → result / next hook`

The slice ends only when a fresh player has:

1. understood the basic controls and navigation language;
2. chosen an apprentice;
3. understood the initial master/debt problem;
4. witnessed the Master's death;
5. learned the first usable form of splicing;
6. produced a viable creature;
7. encountered the people who hold the inherited debt;
8. travelled to the local Pit;
9. completed a first battle tutorial;
10. understood the core future loop: **experiment → create/improve creature → fight → survive debt/progression pressure**.

This is the first slice that should be judged as an actual game rather than a visual prototype.

---

# 4. Opening story frame — LOCKED FOR THE SLICE

Exact final dialogue is not locked, but the structure and tone are.

## 4.1 Satirical opening narration

New Game should deliberately parody the familiar optimistic monster-RPG introduction without copying protected text, characters or presentation literally.

Draft tonal examples:

> Welcome to the world of Splicing. You are about to embark on your own glorious adventure of fucked-up genetic alteration and animal brutality. If you are vegan, this may be an excellent point to reconsider your life choices.

Then:

> First, choose your Splice apprentice to quest through this wonderful world of amoral gene splicing and brutality.

The final copy can be tightened later, but it should establish immediately that the game knows exactly what kind of world this is.

## 4.2 Character choice

Use the accepted in-world selection language:

- Milo;
- Theo;
- Ada;
- Pip;
- authored/default name accepted immediately;
- optional rename;
- no mechanical class differences.

## 4.3 Basic onboarding

Before the first disaster, teach only the minimum player language required to move through the opening:

- movement;
- interact / confirm / cancel;
- Bag;
- Map;
- basic objective/help language.

Do not front-load splice or battle mechanics here.

The tutorial should culminate in an objective along the lines of:

> Your Master is waiting for you. The splice fight of his life is about to occur. He owes some very bad people a great deal of money and, if he doesn't win this one, it's reasonably safe to say he's fucked.

Exact wording remains polishable; the information and tone are locked.

## 4.4 Master and RinoCow disaster

The player reaches the Master's lab / fight setup.

A cutscene occurs in which the Master's own spliced **RinoCow** catastrophically turns on him and mauls him to death.

During or immediately around this event, the bright visual world should momentarily rupture into the darker underlying SplicePit visual state before returning.

The event must achieve all of the following:

- establish that splicing is genuinely dangerous, not just silly;
- remove the player's mentor immediately;
- leave the workshop / obligations to the player;
- create a clear reason to learn the splice bench;
- demonstrate the recurring corruption/flicker visual device.

Do not sanitise this into an off-screen disappearance. The exact gore level can be tuned, but the event must read unmistakably as a fatal mauling caused by the Master's creation.

## 4.5 Debt inheritance confrontation

Between the lab aftermath and the first local Pit fight, the player encounters the people the Master owed money to.

They make it unmistakably clear that:

- the Master's death does not erase the obligation;
- the debt is now effectively the player's problem;
- they expect payment / useful results;
- failure has consequences.

The exact creditor faction/name is not forced by this slice roadmap unless an existing locked decision requires it. Their function in the opening is locked.

## 4.6 First splice

The player must learn the first form of the splice bench after the Master's death.

The tutorial should use the already-approved opening animal foundation:

- Rabbit;
- Goat;
- Pig.

The player should make a **viable** first creature, not merely click through a scripted animation.

The tutorial can constrain choices enough to prevent an unusable dead-end, but must teach the actual mental model that later splicing will use.

## 4.7 First local Pit fight

Once the player has a viable creature, the objective becomes entering the local Pit.

The first fight teaches the basic battle language and acts as the final gate of this opening vertical slice.

The outcome should move the game forward even if the player loses. The opening should not hard-lock a new player because of a tutorial battle result.

---

# 5. Graphics policy — repeated tightening, not one final art dump

The user-approved direction is explicitly **not** to leave the environment at its current low-detail blockout quality.

Art quality should move towards the same level of intentional detail and personality as the protagonist sprites.

Target qualities:

- richer ground texture without noisy visual clutter;
- more detailed buildings and roof/wall materials;
- better foliage silhouettes and variation;
- more deliberate water edges/reflections/details;
- authored props rather than large flat pixel rectangles;
- more convincing containment, husbandry and biotech equipment;
- stronger shadows/depth cues while preserving pixel clarity;
- more readable environmental storytelling;
- small animation details where they materially improve life/unease;
- no return to huge chunky "8-bit" forms simply because they are easier to draw.

The desired result is **detailed premium pixel art with GBA-era readability**, not literal low-resolution GBA asset limitations.

## Tightening rule

There are multiple required graphics passes during the opening build. Do not postpone all visual quality until the end.

Each pass should improve the locations/systems introduced immediately before it while preserving the accepted scale.

---

# 6. Authoritative work-package sequence

## R0.5 — Front Door, Tone and New Game Flow

**Goal:** make SplicePit boot like an actual game and establish its bright/dark tonal thesis before story systems expand.

### WP0.5A — Splash / Title Corruption System — READY

Build:

- bright SplicePit splash/title treatment;
- initial logo reveal;
- reusable visual flicker/corruption transition;
- dark-title interruption based on the approved concept direction;
- clean return to bright presentation;
- skip/advance behaviour where appropriate.

Do not add story mechanics here.

**Gate:** the title screen alone communicates "bright appealing monster-RPG surface with something deeply wrong underneath".

### WP0.5B — Main Menu Shell

Build:

- New Game;
- Continue state/slot entry point, allowed to be disabled until R0.10 save implementation;
- Settings;
- clean keyboard and pointer navigation;
- compact world-native UI language.

No giant web panels or admin-screen styling.

### WP0.5C — Opening Narration / Dialogue Presentation

Build reusable opening dialogue presentation capable of:

- authored text sequence;
- advance/skip;
- optional portrait/speaker support without requiring it;
- text speed support hooks;
- bright presentation with controlled corruption events.

Implement the satirical "welcome to the world of Splicing" opening copy as first authored content.

### WP0.5D — Character Selection Integrated into New Game

Move the accepted WP0.4E-R selector into the real New Game sequence.

Requirements:

- no stand-alone prototype boot;
- Milo/Theo/Ada/Pip;
- default name or optional rename;
- clean transition into onboarding;
- selected identity becomes current new-game state.

### Graphics Tightening Pass A — Title / UI / Selection

Tighten:

- logo/title art;
- title background/environment framing;
- corruption visuals;
- menu treatment;
- dialogue frame;
- character-selection environment/props where visible.

**R0.5 gate:** boot → New Game → narration → character choice feels like one coherent game opening.

---

## R0.6 — Onboarding and Opening World Route

**Goal:** teach navigation and establish the physical route from apprentice introduction to the Master.

### WP0.6A — Controls / Help Tutorial Framework

Reusable contextual tutorial system for:

- movement;
- interact;
- confirm/cancel;
- Bag;
- Map;
- later splice/battle tutorial prompts.

Avoid modal interruption spam.

### WP0.6B — Bag, Map and Objective Shells

Implement only enough real behaviour for the opening:

- open/close Bag;
- opening inventory representation;
- open/close Map;
- current objective display;
- basic objective progression state.

Do not build the full economy/inventory system prematurely.

### WP0.6C — Opening Objective Sequence

Author the tutorial sequence culminating in:

- Master waiting;
- imminent high-stakes splice fight;
- serious debt pressure;
- clear route/objective to reach him.

### WP0.6D — Authored Opening Route

Build the minimum connected world needed for the slice:

- Apprentice Splicer Yard;
- route to Master/Lab;
- route from lab towards local Pit;
- suitable location for debt-collector encounter.

Keep world expansion tightly scoped.

### WP0.6E — Master Lab Interior

Build a proper detailed lab interior suitable for:

- Master cutscene;
- RinoCow containment/fight staging;
- splice bench tutorial later;
- post-death changed-state presentation.

### WP0.6F — Local Pit Exterior / Interior Foundation

Build enough of the first local Pit to support:

- arrival;
- introduction/reception if needed;
- first tutorial battle;
- post-fight result.

### Graphics Tightening Pass B — Yard / Route / Lab / Pit

Required art-quality pass over every opening location introduced so far.

Focus on replacing blockout-looking geometry with richer authored pixel art while retaining gameplay scale/collision readability.

**R0.6 gate:** a player can move from character onboarding to the Master's location through a coherent, attractive opening world.

---

## R0.7 — Disaster, Cutscenes and Debt

**Goal:** deliver the opening story event that creates the player's actual problem.

### WP0.7A — Cutscene Runtime

Support:

- player control lock/release;
- camera focus/movement;
- scripted character movement/facing;
- dialogue timing;
- event flags;
- scene transitions;
- corruption-effect hooks.

### WP0.7B — Master / RinoCow Disaster Cutscene

Author and implement the fatal RinoCow event.

Required story outcome:

- Master dies;
- RinoCow is clearly responsible;
- event is memorable and darkly comic rather than generic exposition;
- player understands they are now on their own.

### WP0.7C — Dark-Layer Flicker Story Language

Generalise the title-screen corruption effect into a reusable in-world system.

Use it during the RinoCow event and establish rules so future scenes can deploy it without making every moment visually noisy.

### WP0.7D — Post-Death Lab State

After the cutscene:

- lab visibly changes;
- Master no longer exists in normal state;
- new objective activates;
- splice bench becomes the player's immediate route forward.

### WP0.7E — Debt Collector Encounter

Implement the confrontation between lab and Pit progression.

It must establish inherited debt pressure before the first Pit fight.

### Graphics Tightening Pass C — Cutscene / Horror Contrast

Improve:

- RinoCow presentation;
- lab staging;
- cutscene-specific animation/effects;
- corruption transition;
- environmental aftermath;
- creditor encounter staging.

**R0.7 gate:** the player has experienced the inciting disaster and clearly understands why they now need to splice and fight.

---

## R0.8 — First Real Splice Loop

**Goal:** teach the defining experimentation mechanic in a form that is fun enough to carry forward.

### WP0.8A — Splice Mechanics Design Lock for Opening

Before rebuilding the bench UI, explicitly settle the minimum opening mechanic:

- what the player chooses;
- what uncertainty exists;
- what information is visible;
- what "viable" means;
- how failure/risk is communicated;
- how existing R0.3 technical biology is reused without inheriting its rejected UX.

This is a design package, not a blind resurrection of the old bench.

### WP0.8B — Splice Bench Interaction v1

Implement the newly locked opening model in the detailed Lab environment.

### WP0.8C — Starter Biological Content

Use Rabbit / Goat / Pig and the already-approved starter source-package foundation as the tutorial content set.

Do not expand the bestiary here.

### WP0.8D — Guided First Viable Creature

Teach the bench while allowing enough agency to communicate the real system.

The result must be a usable first creature that can enter the local Pit.

### WP0.8E — Creature Roster / Basic Condition State

Only the minimum information needed for the opening:

- creature identity/name;
- current phenotype/source composition summary;
- basic combat-relevant state;
- current health/condition as required by battle design.

### Graphics Tightening Pass D — Splice Bench / Creature Presentation

Improve:

- bench machinery;
- specimen handling;
- source-selection presentation;
- creature preview/output;
- biological wrongness;
- feedback effects.

The splice interface should feel physical and game-native, not like a web configuration form.

**R0.8 gate:** a fresh player can create a viable first creature and understands the core promise of experimentation.

---

## R0.9 — First Local Pit Fight

**Goal:** teach the second defining mechanic and complete the first core loop.

### WP0.9A — Battle Mechanics Design Lock for Opening

Before rebuilding battle presentation, settle the minimum first-fight model:

- player decisions per turn/beat;
- readable action choices;
- how creature capabilities matter;
- health/condition/stability consequences;
- how a tutorial loss progresses;
- how later complexity can grow without being required now.

Existing combat prototypes are references only.

### WP0.9B — Pit Battle Runtime / UI v1

Implement the locked first-fight model using the local Pit environment and compact game-native UI.

### WP0.9C — First Opponent and Battle Tutorial

Author one intentionally understandable opponent and tutorial flow.

### WP0.9D — Win / Loss / Reward Resolution

Both outcomes must resolve cleanly.

The opening cannot dead-end because the player loses their first fight.

### WP0.9E — Debt / Progression Hook After Fight

End the slice with a clear next pressure/reward signal showing why the player will keep splicing and fighting.

### Graphics Tightening Pass E — Pit / Battle / Creature Action

Improve:

- arena art;
- crowd/background life where appropriate;
- creature battle poses/presentation;
- action effects;
- damage feedback;
- battle UI;
- result presentation.

**R0.9 gate:** first splice → first Pit fight feels like a coherent game loop, not two disconnected prototypes.

---

## R0.10 — Save/Continue, Settings and Vertical-Slice Hardening

**Goal:** turn the assembled opening into a repeatable, resumable first game slice.

### WP0.10A — Real New Game / Continue Save Flow

Implement:

- New Game reset semantics;
- Continue availability after valid save;
- autosave/checkpoints at sensible opening milestones;
- character identity persistence;
- story/event flags;
- creature/tutorial progress;
- safe reload into an appropriate location/state.

This is where refresh/reload behaviour becomes a release requirement.

### WP0.10B — Settings Completion

At minimum:

- music volume;
- SFX volume;
- text speed;
- fullscreen/display behaviour if supported;
- any essential accessibility toggles already justified by the slice.

### WP0.10C — End-to-End Opening Flow Integration

Prove the exact sequence:

`Title → New Game → narration → character → onboarding → Master → RinoCow death → first splice → debt confrontation → local Pit → first fight → result → continue/reload`

### Graphics Tightening Pass F — Opening Slice Final Art Pass

Final pre-gate pass across:

- title/menu;
- Yard;
- route;
- Lab;
- RinoCow event;
- debt encounter;
- splice bench;
- Pit;
- battle presentation;
- UI consistency;
- animation/VFX consistency.

The explicit goal is to move the world away from "low-resolution prototype/blockout" and towards the level of care/readability already present in the protagonists.

### WP0.10D — Opening Slice QA / Soft-Lock Hardening

Test:

- all tutorial paths;
- invalid/edge inputs;
- save/reload at key milestones;
- win/loss first battle;
- event sequencing;
- collision/camera regressions;
- no return of rejected legacy UI.

### WP0.10E — FIRST REAL GAMEPLAY SLICE — HUMAN GATE

Human review must approve:

1. title/menu tone;
2. bright/dark flicker language;
3. opening writing tone;
4. character selection integration;
5. controls/tutorial clarity;
6. world art fidelity and density;
7. Master/RinoCow inciting event;
8. debt pressure clarity;
9. first splice enjoyment/readability;
10. first battle enjoyment/readability;
11. save/continue behaviour;
12. desire to continue beyond the first Pit fight.

Do not begin broad Act 1 content production until this gate passes.

---

# 7. Content scope lock for this vertical slice

Build only what the opening needs.

Expected minimum authored content:

- one splash/title/main-menu flow;
- one opening narration sequence;
- one accepted character-selection flow;
- Apprentice Splicer Yard;
- one route connecting opening locations;
- one Master lab interior;
- one local Pit location;
- one Master/RinoCow disaster sequence;
- one debt-collector encounter;
- one splice tutorial;
- Rabbit / Goat / Pig starter animal content;
- one viable player tutorial creature path;
- one first Pit opponent;
- one battle tutorial;
- win/loss resolution;
- save/continue checkpoints by final integration.

Do **not** expand into:

- full regional map production;
- many towns;
- large bestiary production;
- advanced economy;
- deep quest trees;
- multiple Pit circuits;
- broad NPC relationship systems;
- full Act 1 content;
- production-scale asset generation before the opening art language has passed repeated tightening reviews.

---

# 8. Immediate next command

The graphics-first walking foundation is accepted and the replacement character selector is accepted.

The next executable package is therefore:

> **Start WP0.5A — Splash / Title Corruption System**

A new implementation chat should read this document before the older broad R0.5–R0.8 sequencing and treat this document as the current opening-slice authority.
