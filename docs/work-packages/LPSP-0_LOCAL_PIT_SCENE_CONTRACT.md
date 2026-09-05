# LPSP-0 — Local Pit Scene Contract / Fight-Space Audit

Date: 5 September 2026

Status: COMPLETE ✓

## Purpose

Define exactly what the Local Pit environment must preserve before its current procedural/Pass-D presentation is replaced by the scene-image architecture already proven by the Apprentice Splicer Yard and Opening Route.

This package is an audit and contract lock. It does **not** select new art, re-author collision, implement the first battle, or resurrect rejected historical combat UX.

The Local Pit must ultimately support both exploration and the first tutorial fight as one believable place. New art is allowed to replace the present map geometry completely as long as the semantic and story contracts below survive.

---

## 1. Current implementation evidence

The current Local Pit is a useful gameplay/art prototype, not a geometry authority.

Current runtime evidence:

- logical gameplay viewport: `1280 × 720`;
- current world: `2360 × 1480`;
- current entry spawn: `(1180, 1320)`;
- current exterior exit zone near the south edge;
- current stage labels:
  - `arrival-gate`;
  - `reception`;
  - `prep-bay`;
  - `arena-gate`;
  - `tutorial-battle-floor`;
  - `result-desk`;
- Bag and Map remain usable while exploring the Pit;
- player walking/running, feet-based collision and camera following already work;
- the Pit currently exposes Bright/Dark environment states through the shared environment visual controller;
- entering the Pit triggers a short authored corruption/glitch event before recovery;
- current Pass-D production art already distinguishes exterior arrival, venue frontage, handling/loading, registration, prep/weigh/decon, results/payout/medical, arena and spectator activity.

These are evidence of useful semantic beats. The raw dimensions, coordinates, primitive collision layout and Pass-D drawing topology are disposable.

---

## 2. Locked opening-story role

The Local Pit is the destination that closes the first real SplicePit core loop.

The opening authority requires:

1. the Master/RinoCow disaster occurs;
2. the player inherits the debt pressure;
3. the player learns the first splice and creates a viable first creature;
4. the objective sends the player to the local Pit;
5. the first Pit fight teaches the basic battle language;
6. **both win and loss move the game forward**;
7. the result leaves a clear debt/progression pressure showing why the player will keep splicing and fighting.

The Local Pit environment must make that sequence physically legible. It cannot become a decorative arena disconnected from the exploration route, and it cannot require the player to win the tutorial battle to escape or progress.

---

## 3. Locked semantic spaces

The replacement scene or scene set must provide the following semantic spaces. Their exact coordinates, shape, scale and ordering inside the artwork are re-authorable.

### `pit-arrival`

A clear exterior arrival from the authored Opening Route.

Requirements:

- safe player spawn/landing area;
- immediate venue identity;
- obvious route into the venue;
- enough space for the entry-corruption event without obscuring navigation;
- reversible route connection until story state deliberately says otherwise.

### `pit-registration`

Reception / registration / waiver / bout-check-in function.

Requirements:

- reads as the first administrative stop of a scrappy local genetic-sport venue;
- can host staff/NPC interaction later;
- does not need to become a compulsory modal checkpoint unless first-fight design requires it.

### `pit-prep`

Creature preparation, weigh, decontamination/handling and pre-bout staging.

Requirements:

- credible space for the player’s creature and handler activity;
- room for weighing/inspection/holding language;
- provides a natural physical transition from ordinary exploration into fight preparation;
- should remain useful after the tutorial rather than looking like one-use scenery.

### `pit-arena-threshold`

The physical threshold between venue circulation and combat space.

Requirements:

- unmistakable transition into the fight area;
- safe pre-battle staging point;
- suitable place for tutorial/bout confirmation or opponent reveal if WP0.9A chooses that presentation;
- no dependency on the current `arena-gate` coordinates.

### `pit-battle-floor`

The first-fight combat space.

Requirements:

- visually readable 1v1 presentation at opening scale;
- enough negative space around combatants for creature silhouettes, capability effects, injury/status feedback and compact battle UI;
- environmental edges/boundaries that read physically rather than as an arbitrary rectangular game board;
- room to imply handlers, barriers and comparatively controlled early-Pit safety measures;
- architecture must not prevent later switching/team/asymmetric formats even though the first fight begins as 1v1;
- the environment should remain recognisably the same Pit visited during exploration.

The precise battle camera, creature positions, turn cadence, action menu and tactical positioning model are **not locked by LPSP-0**.

### `pit-results`

Post-bout results / payout / medical / admin resolution space.

Requirements:

- supports both win and loss outcomes;
- can communicate reward, damage/condition consequences and the next progression/debt hook;
- must not assume victory-only presentation;
- must have a clean route back to exploration/progression.

### `pit-route-exit`

Semantic return to the Opening Route.

Requirements:

- safe return point outside the combat flow;
- no tutorial-fight soft lock;
- future save/checkpoint systems can restore by semantic location/state rather than raw map coordinates.

---

## 4. Fight-space contract versus battle-system contract

LPSP-0 deliberately separates **space requirements** from **battle mechanics**.

Still authoritative at the broad design level:

- combat is turn-based;
- useful actions should derive from actual creature capabilities rather than a fixed four-move template;
- early local Pit bouts are comparatively controlled and should build attachment before later severe-risk fights;
- first-fight loss must progress;
- the opening battle is a tutorial and the final gate of the first core loop.

Not authoritative / not yet locked:

- the historical WP0.4B declaration/initiative prototype;
- exact initiative/action economy;
- exact action-choice UI;
- exact tactical positioning model;
- exact opponent creature and script;
- exact health/stability/injury presentation;
- exact win/loss rewards;
- exact battle camera or whether combat uses a constrained crop of the exploration scene versus a tightly linked battle presentation.

Those decisions belong to WP0.9A and the later battle WPs. LPSP-1/LPSP-2 must therefore create fight space that can support the battle design without pre-deciding it.

---

## 5. Crowd, staff and background-life contract

The Bramble Pit should feel operational before the player arrives.

Required environmental roles, whether represented as baked scene life, animated layers, runtime sprites, or a mixture:

- venue staff / registration presence;
- animal handlers or handling infrastructure;
- prep/weigh/decon activity;
- spectators or local regulars around the arena where composition allows;
- visible barrier/safety/containment language around the first fight;
- signs of payouts/results/medical administration;
- biological-sport mess, maintenance and imperfect cleanliness.

The early Pit should read as a **scrappy local regulated-ish venue**, not a giant stadium and not an underground death chamber. Later Pits can become more dangerous and prestigious.

Critical NPCs, opponent creatures, tutorial prompts and outcome-dependent characters must not be baked irreversibly into the base scene image.

---

## 6. Bright/Dark and entry-corruption contract

The replacement Pit must remain connected to the global environment visual language.

Locked:

- environment location identity remains `local-pit`;
- Bright and Dark presentation must be able to occupy the same physical geometry without traversal jumps;
- entering the Pit retains an authored corruption/rupture hook;
- the entry effect uses the shared environment visual controller rather than becoming a disconnected bespoke state machine;
- opening shells/cutscenes must still be able to suppress or coordinate corruption where appropriate;
- later LPSP-7 owns the final authored Dark Pit production replacement.

Disposable:

- current scanline/noise rectangles;
- current exact entry-glitch timings;
- current Pass-D Dark drawing implementation;
- current blood/organic effect coordinates.

Dark storytelling should transform the same venue through biological intrusion, contamination, wrong crowd/shadow behaviour, failed cleanup and residue, rather than reading as a generic night filter.

---

## 7. Exploration and interaction contract

The authored Pit must preserve:

- four selectable protagonist sprites and their current semantic movement controls;
- walking and hold-to-run;
- feet-based collision semantics;
- Bag and Map access during ordinary exploration;
- contextual Action/interact behaviour;
- safe input handoff between Route, Pit exploration and future battle runtime;
- no duplicate handling of the same semantic input by Pit and underlying Route/Yard runtimes;
- deterministic safe return after leaving the Pit.

The replacement scene may use entirely new collision polygons/rectangles and camera bounds when LPSP-4 authors them against visible art.

---

## 8. Mobile/readability contract

LPSP-1 and later must assume the Pit will be played on desktop and coarse-pointer mobile layouts.

The scene composition must provide:

- broad traversal lanes that remain understandable with touch controls overlaid;
- important interaction/battle staging away from persistent control clusters where practical;
- enough fight-space context in portrait and landscape presentations;
- no required environmental text so small that progression depends on reading baked pixels;
- room for compact tutorial/battle UI without hiding both combatants or arena boundaries.

LPSP-8 will own final mobile/battle visual acceptance, but the composition must be designed for it now.

---

## 9. Save/progression contract

R0.10 will own final save/continue behaviour. The scene architecture must prepare for it by using stable semantic state instead of public raw coordinates.

Future-restorable concepts must include at least:

- outside / arrived at Pit;
- ordinary Pit exploration;
- pre-bout / battle-ready state;
- battle in progress only if the eventual save policy allows it;
- post-fight result resolved;
- progression/debt hook completed;
- safe return/continue location.

No new scene contract should require persistence of today's `2360 × 1480` geometry or current stage coordinates.

---

## 10. Current geometry: retain as reference, not authority

Current `local-pit-v1` values are explicitly **not** design locks for LPSP-1+:

- `2360 × 1480` world dimensions;
- entry `(1180,1320)`;
- current south-edge exit rectangle;
- current raw stage centres/radii;
- current rectangular collision topology;
- current exterior/interior boundary line;
- current Pass-D foreground crop/draw regions;
- the current one-canvas arrangement purely because it already exists.

They may be reused only where the new authored composition independently justifies them.

Likewise, the Pass-D contract field `collisionTopology: unchanged` ends with the old production-art pass. LPSP-4 is expected to author collision directly against the selected scene image.

---

## 11. Art/composition freedom for LPSP-1 and LPSP-2

The art phase may choose:

- one holistic authored Pit world image; or
- a small coherent scene set if exterior/circulation/battle readability genuinely benefits from separation.

The choice must be driven by player-facing spatial coherence, not by preserving existing code layout.

Whatever composition is selected must make these relationships understandable:

`Opening Route arrival → Pit exterior/entrance → registration/prep → arena threshold → fight space → results → progression/return`

It should look like a place built for local gene-splicing sport, animal handling and questionable family entertainment, not a web UI, generic RPG battle board or disconnected arena backdrop.

---

## 12. Required semantic IDs for later packages

Later LPSP packages should converge on stable semantic anchors/regions equivalent to:

- `pit-arrival`;
- `pit-registration`;
- `pit-prep`;
- `pit-arena-threshold`;
- `pit-battle-floor`;
- `pit-results`;
- `pit-route-exit`.

Names may be refined once the scene-pack type is implemented, but public consumers should reference semantics rather than raw coordinates.

Additional anchors may be added for staff, opponent reveal, spectator focus, creature staging or future repeat bouts without invalidating this minimum contract.

---

## 13. LPSP-0 completion gate

LPSP-0 is complete when the repository records that:

- existing Local Pit runtime/art behaviour has been audited;
- semantic spaces required by exploration and the first fight are separated from disposable geometry;
- first-fight requirements are preserved without locking the rejected historical battle prototype;
- win and loss both have a valid result/progression path;
- Bright/Dark and entry-corruption responsibilities are explicit;
- crowd/background and mobile readability needs are explicit;
- LPSP-1 is free to design a holistic Local Pit composition against this contract.

This document satisfies that gate.

## Next package

**LPSP-1 — Holistic Local Pit Art Brief / Composition Lock.**
