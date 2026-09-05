# LPSP-1 — Holistic Local Pit Art Brief / Composition Lock

Status: **COMPLETE / COMPOSITION LOCKED**

Date: 5 September 2026

Authority: `docs/work-packages/LPSP-0_LOCAL_PIT_SCENE_CONTRACT.md`, `docs/SCENE_IMAGE_PROPAGATION_ROADMAP_2026-09-02.md`, `docs/VISUAL_DIRECTION_2026-08-23.md`, `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`, and the approved Yard/Route scene-image production model.

This document is the visual source of truth for LPSP-2 Bright Local Pit master generation.

Core rule:

> Preserve the Local Pit’s gameplay and story meaning. Do not preserve `local-pit-v1` geometry merely because the current prototype happens to use it.

---

## 1. The scene in one sentence

**The Bramble Pit is a cheerful, shabby rural livestock-auction/fairground that has been converted into a small local gene-splicing fight venue: muddy creature trailers feed into registration and weigh/prep bays, then a visibly improvised fighters’ route carries animals into a large contained arena before winners and losers alike spill past payouts, medical forms and the road home.**

It should feel like a place where genetic combat has become an ordinary Saturday family activity, not a generic fantasy arena, sci-fi battle room or detached combat screen.

---

## 2. Composition decision — one holistic authored world

LPSP-1 locks **one continuous authored Bright Pit master scene** as the preferred composition.

Do not split exploration and the first fight into unrelated environment masters unless LPSP-2 proves a single master technically impossible.

The reason is player-facing continuity:

- the player should arrive from the Opening Route and see the venue as a real place;
- registration and prep should physically lead towards the arena;
- the arena should be visible as part of that same venue before combat begins;
- the first tutorial fight should use a camera framing of the same authored fight floor rather than swapping to a generic battle backdrop;
- results/payout/medical should exist physically on the post-fight route out.

Technical asset preparation may crop or chunk the selected raster later, but the art must be conceived and selected as one place.

---

## 3. Core visual identity

The Bramble Pit combines five visual ideas:

1. **Old livestock market / agricultural showground** — pens, trailer gates, weigh equipment, wash-down drains, auction-yard concrete, timber rails, corrugated sheds and practical animal handling.
2. **Small-town sporting venue** — modest bleachers, banners, ticket/registration windows, PA speakers, event lights, score/result infrastructure and a recognisable fight ring.
3. **Improvised biotech retrofit** — scanners, sample fridges, decon hoses, containment sensors, tagged transport crates, fluid canisters and repaired laboratory equipment bolted into agricultural infrastructure.
4. **Questionably wholesome local entertainment** — warm daylight, bunting/event colour, food/drink clutter, family-league energy and a venue that treats unethical animal experimentation as normal sport.
5. **Physical mess and wear** — mud, straw, fur/feathers, hose-water staining, cracked concrete, patched rails, discarded bandages, trailer tyre tracks and hurried repairs.

The bright layer should be attractive and lively enough that the player wants to enter. The disturbing reading should arrive through details, not through making the whole scene grim or hostile.

---

## 4. Overall topology — looped fighters’ flow

Use a **broad horseshoe / looped fighters’ route** around a dominant arena mass.

The scene should read as seven sequential semantic beats:

**Route arrival → registration → prep/weigh/decon → arena threshold → battle floor → results/medical/payout → Route exit**.

### Locked relative placement

Prefer:

- **Route arrival** on the lower-left / lower-centre edge;
- **registration** immediately inside and slightly left of centre, visually obvious from arrival;
- **prep/weigh/decon** further left / upper-left, giving the player a meaningful traversal beat before combat;
- **arena threshold** near the middle of the venue;
- **battle floor** as the largest open functional space in the upper-right / right-centre region;
- **results / payout / medical** on the player’s post-arena route in the right-centre / lower-right region;
- **Route exit** on the lower-right edge, near enough to arrival that both can plausibly reconnect to the same road off-scene without forcing backtracking through the arena.

This creates a physical progression loop rather than a corridor ending at a fight room.

Exact coordinates, source resolution, world dimensions and camera limits remain LPSP-2/LPSP-3 work.

---

## 5. Public flow versus fighters’ flow

The player follows the fighters’ route. Spectators should have a believable but mostly separate public flow.

### Fighters’ route

- trailer / creature arrival;
- registration/check-in;
- weigh and handling prep;
- contained arena gate;
- battle floor;
- result/medical/payout;
- exit.

### Public/spectator route

Imply a second access path along the upper/right perimeter leading to:

- bleachers or standing terraces;
- food/drink/event clutter;
- betting/result-board style infrastructure where appropriate;
- safe spectator barriers.

The player does not need full access to every public area in the opening slice. These areas exist to make the venue believable and alive.

Do not make spectator geometry obstruct the main fighter traversal route.

---

## 6. Zone A — Route arrival / trailer yard

This is the hand-off from the authored Opening Route.

The player should arrive into a rough but clearly public-facing creature transport yard.

Features:

- broad muddy/gravel or worn-concrete arrival apron;
- trailer tyre arcs and parking wear;
- reinforced gate posts and containment fencing;
- small trailer/loading remnants without blocking the spawn area;
- stacked straw/bedding, feed sacks, washable crates, animal tags or transport straps;
- event colour/bunting or venue branding that immediately distinguishes the Pit from Viktor’s Lab;
- one strong visual line leading towards registration;
- enough open ground for a safe Route→Pit spawn and future touch steering;
- no foreground canopy or large prop over the entry seam.

The Pit should feel rougher, busier and more public than the route and Lab, but still part of the same rural-biotech region.

---

## 7. Zone B — Registration / waivers / local-league administration

Registration is the first close-range destination after arrival.

It should look like a livestock market office collided with a tiny sports venue front desk.

Features:

- practical counter/window or open-sided booth;
- clipboards, numbered tags, specimen paperwork, waiver folders and small monitors;
- a compact bout/result board shape visible from ordinary camera distance;
- a cooler/sample fridge or basic scanner nearby;
- worn bench/chairs or queue rail;
- staff working space reserved for runtime NPCs;
- event signage as visual flavour, never required readable text.

Tone: bureaucratic normalisation of something ethically absurd.

Do not bake a named staff member or first-fight opponent into the master image.

---

## 8. Zone C — Prep / weigh / decontamination

This is the strongest specifically-animal-handling area outside the arena.

It should explain how bizarre creatures are processed safely enough for a local bout.

Features:

- embedded weigh bed or livestock scale;
- wash-down drainage and hoses;
- decon arch / spray frame / scanner gantry assembled from agricultural and lab parts;
- short-term holding pens or gates;
- restraints, transport hardware and reinforced rails;
- specimen/sample station;
- water/straw/grime accumulation in believable places;
- enough clear ground for future creature staging and handler sprites;
- a natural line from prep towards the arena threshold.

Avoid filling the entire zone with machinery. Open handling space matters more than equipment density.

---

## 9. Zone D — Arena threshold

The arena threshold should feel like crossing from ordinary venue circulation into controlled competition.

Features:

- a broad reinforced creature gate rather than a normal human door;
- double-gate / crush-barrier / containment logic where visually useful;
- hazard/decon equipment placed functionally;
- a small staging apron on the fighter side;
- line of sight into the arena floor before the player crosses;
- space for future opponent reveal, tutorial confirmation or handler positioning;
- no narrow funnel that makes touch movement irritating.

The gate should frame the arena as a destination without becoming an opaque foreground wall over the player.

---

## 10. Zone E — Battle floor — primary scene mass

The battle floor is the dominant functional space of the whole Pit.

### Shape

Use an **irregular rounded rectangular / oval livestock-show ring**, not a square tactical board and not a perfectly symmetrical gladiator circle.

The floor should be packed sand, sawdust, dirt or a mixed absorbent arena surface inside layered timber/steel/containment barriers.

### Readability

A normal 1280 × 720 gameplay camera framing must be able to show:

- the player creature side;
- the opponent side;
- both creature silhouettes with breathing room;
- enough arena boundary to make the physical space obvious;
- some crowd/venue context;
- room for compact battle UI and tutorial feedback without hiding both combatants.

The central fight floor should be visually quieter than the surrounding venue. Surface detail belongs mostly at edges and in restrained wear/stain patterns.

### Environmental features

- layered rail/containment barrier with believable animal scale;
- handler-safe gaps or recessed corners;
- small emergency isolation/decon hardware;
- PA/score/result fixtures around, not in, the fight floor;
- modest bleachers or standing spectator areas on the far/back side;
- a partial canopy, awning or old livestock-market roof structure may frame the arena edges, but **must not cover the battle floor with a huge opaque roof**;
- warm daylight should remain the dominant lighting source.

### Battle-system flexibility

Do not paint:

- spawn circles;
- turn grids;
- action markers;
- creature silhouettes;
- opponent positions;
- attack telegraphs;
- tutorial arrows.

LPSP-5/WP0.9 owns those runtime semantics after the battle model is locked.

The floor must support a readable 1v1 tutorial without structurally preventing later switching, team or asymmetric fight formats.

---

## 11. Zone F — Results / payout / medical

This sits on the route out of the arena, not hidden in an unrelated room.

It should naturally support **both victory and defeat**.

Features:

- results/payout counter or booth;
- small medical/condition-check station;
- treatment trolley, bandages, cleaning supplies and creature first-aid infrastructure;
- cash/token/envelope/paperwork visual language without making currency UI part of the raster;
- result-board or bout-ticket shapes;
- staff/NPC standing space;
- a visible continuation towards the exit.

The environment must not visually imply “winner’s podium only”. A battered creature after a tutorial loss should still belong naturally in this space.

---

## 12. Zone G — Route exit

The exit should be a separate but nearby mouth on the same lower edge as arrival, so the full Pit visit reads as a loop.

Features:

- broad service gate / path back to the road;
- vehicle/creature wear consistent with outward movement;
- view back towards the arrival yard or shared exterior frontage so the player understands where they are;
- enough clear ground for semantic safe return and future checkpoint restore;
- no immediate battle/result trigger overlap.

Arrival and exit may plausibly converge off-scene onto the same Opening Route connection.

---

## 13. Spectators, staff and environmental life

The Pit should not look abandoned, but the master image must remain state-flexible.

### May be baked into the Bright master

- distant generic spectator clusters / tiny silhouettes in rear bleachers;
- static venue workers too small to be mistaken for interactable named NPCs;
- parked trailers, crates, food/event clutter and maintenance activity;
- generic creature-handling evidence with no required identity.

### Must remain runtime/separate where story or gameplay depends on it

- named registration staff;
- first-fight opponent creature;
- opponent handler;
- tutorial characters;
- creditors or story NPCs;
- foreground crowd members whose reactions matter;
- player creature;
- result-state-specific characters.

The arena should have obvious reserved positions where runtime crowd/handler layers can be added without covering the combatants.

---

## 14. Spatial rhythm and camera beats

The scene should support at least **four distinct camera-scale beats**:

1. arrival + registration;
2. prep/weigh/decon;
3. arena threshold + fight floor;
4. results/medical + exit.

The player should not see the whole venue as a board from every position.

Guidelines:

- movement lanes should be several protagonist widths wide;
- avoid narrow fence mazes;
- major gates need generous approach aprons;
- optional corners may contain flavour, but the opening path should remain clear;
- visually open ground should generally be walkable unless a visible barrier explains otherwise;
- arena spectator infrastructure should shape the camera without creating hidden collision walls;
- whole-scene open/traversable space should be roughly 50–60%;
- within the battle camera, the actual fight floor should be roughly 60–70% visually quiet/open space.

Exact collision comes later and must follow the selected raster.

---

## 15. Visual hierarchy

### Primary mass — arena and spectator structure

The fight ring, barrier system and partial roof/bleacher silhouette should be the largest visual identity in the Pit.

The player should understand “this place exists for creature fights” before reading any sign.

### Secondary mass — prep/weigh infrastructure

This is the strongest specifically gene-splicing/animal-handling read.

### Tertiary anchors — registration and results

These should be clear destinations but smaller than the arena.

### Framing cues — arrival/exit gates and public edge

These explain circulation and connect the Pit to the Route.

---

## 16. Material and colour direction

Stay inside the approved Bright-world family while making the Pit rougher and more event-like than the Lab.

Bright material family:

- warm straw-gold dirt / sawdust / arena sand;
- muddy trailer-yard brown and patched grey concrete;
- faded red / burgundy venue paint as a stronger Pit-specific accent;
- desaturated teal biotech machinery and decon equipment;
- galvanised steel and repaired containment rails;
- weathered timber livestock gates;
- warm cream plaster/painted boards in admin areas;
- controlled yellow hazard accents;
- muted green verge/weeds at exterior edges;
- pale glass/fluid highlights;
- coral/pink/organic accents used sparingly for questionable biological detail;
- deep green/brown contact shadows rather than harsh black outlines everywhere.

The scene should feel sun-warmed and busy, with cooler industrial tones concentrated around prep/decon hardware.

Avoid:

- giant neon signage;
- generic grey warehouse interiors;
- clean white sci-fi laboratories;
- medieval colosseum motifs;
- casino/gladiator spectacle;
- cyberpunk fight-club lighting;
- huge flat red/brown rectangles;
- a single uniform dirt texture across the whole venue.

---

## 17. Humour and environmental storytelling

The Bright Pit should generate black-comic unease by treating dangerous biology as routine administration.

Useful details:

- over-repaired containment rails;
- wash-down drains that have clearly seen too much;
- numbered creature tags and abandoned straps;
- specimen coolers beside ordinary event supplies;
- medical trolley positioned with suspicious familiarity;
- family-event bunting beside decon equipment;
- reinforced areas patched after previous impacts;
- waivers/forms stacked as normal venue clutter;
- bedding, feathers, fur or odd shed material caught in drains;
- one or two biologically questionable plant/animal residues that nobody seems concerned about.

Do not depend on legible joke text. Text-like signage is flavour only.

---

## 18. Dark-state transformation hooks

LPSP-2 generates Bright only, but the selected composition must give LPSP-7 strong same-geometry corruption opportunities.

Preferred Dark hooks:

- organic intrusion following wash-down drains and arena seams;
- contaminated runoff collecting around weigh/decon equipment;
- holding-gate bars apparently fused with tissue/root-like growth;
- arena sand carrying impossible stains, vein-like cracking or embedded biological residue;
- far spectators becoming sparse/wrong silhouettes without moving major geometry;
- event lights failing asymmetrically;
- medical/result area showing evidence of cleanup that did not work;
- trailer-yard mud containing unsettling tracks/remains;
- bunting/signage still present but damaged or subtly biologically incorporated.

The Dark state must remain recognisably the same Bramble Pit. No geometry teleport, generic night tint or entirely different horror arena.

---

## 19. Foreground/depth opportunities

LPSP-6 will author final foreground occlusion, but the Bright composition should provide useful natural depth features:

- near-side arena rail segments;
- gate posts / partial gate frames;
- canopy supports at edges;
- hanging hoses/cables positioned away from critical navigation lanes;
- stacked crates or trailer corners near non-critical paths;
- low spectator barrier edges.

Avoid huge foreground roofs, giant opaque fences or broad masks that would hide the player/creatures.

The protagonist and combat creatures must be able to pass naturally behind selected rails/posts while remaining visible elsewhere.

---

## 20. Mobile composition requirements

The master must tolerate portrait and landscape presentation from the start.

Rules:

- arrival, registration and exit should not rely on details at the extreme lower corners where touch controls sit;
- battle creature staging should stay away from persistent control clusters where practical;
- arena boundaries should remain visible even when compact battle/tutorial UI occupies part of the screen;
- navigation cues must come from large spatial shapes, gates and route direction rather than tiny signs;
- no required path should be only one protagonist wide;
- camera framings should retain useful environmental context after mobile cover/crop presentation if that model is reused.

---

## 21. Generation constraints for LPSP-2

Generate as a premium top-down pixel-art environment with the approved SplicePit/GBA-era readability, not as an isometric illustration or concept painting.

Required:

- landscape master scene;
- consistent top-down / slight elevated game view matching Yard/Route language;
- full environment, not a cropped arena portrait;
- strong readable ground planes;
- clear fighter circulation;
- arena large enough to support one full gameplay camera;
- warm Bright-world daylight;
- detailed but controlled pixel-art material work;
- no protagonist;
- no player creature;
- no opponent creature;
- no named/critical NPC;
- no UI;
- no battle menu;
- no floor grid;
- no painted objective arrows;
- no dependency on readable text;
- no dark/corrupted state baked into the Bright master.

Preferred overall aspect: approximately **3:2 to 16:10**. Exact source dimensions are selected with the winning image, not pre-imposed.

---

## 22. Rejection conditions

Reject a candidate if any of the following is true:

- it looks like a generic RPG battle arena;
- it reads as a board/map instead of a place;
- exploration and combat appear to be separate unrelated spaces;
- the fight floor is too small to frame two creatures cleanly;
- the arena dominates so completely that registration/prep/results have no physical logic;
- the player route is a narrow maze of fences;
- it looks like a huge professional stadium rather than a local Pit;
- it looks primarily illegal/hostile instead of regulated-ish local entertainment;
- it loses rural/livestock infrastructure and becomes generic sci-fi;
- it has a giant opaque roof over the gameplay area;
- it bakes in combatants or critical NPCs;
- it relies on readable text/arrows for navigation;
- it cannot plausibly support a same-geometry Dark counterpart;
- it preserves current prototype geometry at the expense of a better composition.

---

## 23. LPSP-2 selection order

When comparing Bright candidates, select in this priority order:

1. **Does it feel unmistakably like SplicePit’s local genetic-sport venue?**
2. **Does arrival → registration/prep → arena → results/exit read as one physical place?**
3. **Can the battle floor carry a readable first 1v1 without looking like a board?**
4. **Does the scene feel inviting, scrappy and ethically questionable rather than generically grim?**
5. **Does it provide broad forgiving exploration lanes and mobile-safe framing?**
6. **Do rural livestock and biotech systems feel functionally integrated rather than decorated on afterwards?**
7. **Does the arena have enough spectator/staff/background-life structure without overwhelming combat readability?**
8. **Does it offer strong depth/foreground opportunities?**
9. **Does it contain convincing hooks for a same-geometry Dark transformation?**
10. **Is the pixel-art detail quality high enough to sit beside the accepted protagonists, Yard and Route?**

Do not choose a candidate because it happens to resemble the current Pit prototype.

---

## 24. Composition lock

LPSP-1 locks the following for generation:

- one holistic Bright Bramble Pit authored world;
- converted livestock-market / local-fair genetic-sport identity;
- looped fighters’ flow from lower-left/centre arrival to lower-right exit;
- registration first, then prep/weigh/decon, then arena threshold;
- large upper-right/right-centre contained battle floor as primary functional mass;
- results/payout/medical on the post-fight route out;
- separate implied spectator/public flow;
- early-Pit controlled/local-league safety language;
- warm daylight and approved Bright-world palette family;
- no combatants, critical NPCs or UI baked into the master;
- broad mobile-safe lanes and a battle camera with substantial quiet floor area;
- Dark transformation hooks designed into the same physical geometry.

## Next package

**LPSP-2 — Generate and Select Bright Local Pit Master.**
