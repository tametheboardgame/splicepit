# YSP-1 — Holistic Yard Art Brief / Composition Lock

Status: **COMPLETE / COMPOSITION LOCKED**

Date: 29 August 2026

Authority: `docs/YARD_SCENE_IMAGE_POC_ROADMAP_2026-08-29.md`, `docs/VISUAL_DIRECTION_2026-08-23.md`, and the current Master Lab quality benchmark established by Graphics Tightening Pass D.

This document is the visual source of truth for YSP-2 Bright Yard Master Generation. It defines the Apprentice Splicer Yard as one authored place before gameplay geometry is derived.

---

## 1. The scene in one sentence

The Apprentice Splicer Yard is a **warm, overgrown, semi-rural biotech work yard built around a crooked apprentice workshop and a visibly questionable specimen-handling operation**: inviting at first glance, then increasingly alarming as the player notices cages, drains, patched containment gear, failed experiments and improvised biological infrastructure woven into the same coherent location.

It must look like a place that existed before the player arrived, not a game board assembled from functional rectangles.

---

## 2. Core visual identity

The Yard should combine three readings at once:

1. **Pastoral warmth** — grass, dirt, trees, flowers, timber, warm plaster/brick, sunlight and a little water.
2. **Working-yard practicality** — worn service paths, drainage, repair patches, loading areas, stacked equipment, sheds, hoses, pipes, benches and animal handling infrastructure.
3. **Cute-but-concerning biotechnology** — specimen tanks, quarantine cages, sample jars, biological residue, odd grafted plants, labels, improvised containment and evidence that children with too much scientific confidence routinely make bad decisions here.

The first two readings make the space attractive. The third makes it unmistakably SplicePit.

The Yard is not a horror scene in its bright state. It is a cheerful working environment whose normality becomes ethically dubious under inspection.

---

## 3. Composition lock

### Overall composition

Use a **diagonal, asymmetrical yard composition** running broadly from the player’s arrival in the lower-left / lower-centre foreground towards the Master Lab route in the upper-right / right background.

The scene should feel naturally enclosed by workshop architecture, trees, fencing, service structures and terrain rather than by a rectangular map border.

The dominant visual mass is the apprentice workshop complex slightly left of centre and towards the upper half of the scene. It should not sit squarely in the middle like a board-game building. Its roofline, extensions, pipes and attached lean-tos should create an irregular silhouette.

A second visual mass—the animal/specimen handling area—sits to the right of the workshop, visually connected to it by hoses, pipes, drains, work surfaces and worn traffic routes. It must feel part of the same operation, not a separate prop island.

A shallow drainage/water feature and softer vegetation occupy portions of the lower/right edge and help break hard geometry while giving the yard believable runoff logic.

### Primary eye path

At first glance the eye should travel:

**arrival apron → workshop / specimen focal cluster → service lane / Lab-route exit**.

Secondary details should reward looking around without competing with that route.

The player should not need arrows painted on the floor. Composition, worn ground, fencing, open space and architectural orientation should imply where movement is possible.

---

## 4. Zone layout

These are compositional zones, not collision rectangles. Exact coordinates are intentionally deferred until YSP-4.

### A. Arrival / apprentice apron — lower-left to lower-centre

The player begins in a relatively open, readable patch of yard where the protagonist is immediately legible against the ground.

Features:

- compact dirt-and-grass arrival apron;
- wheelbarrow, crate stack or delivery trolley pushed to one edge, not centred in the route;
- boot-worn desire lines leading naturally deeper into the yard;
- one low sign, notice board or battered apprentice marker that establishes ownership without becoming UI-like;
- enough negative space for tutorial movement and touch controls;
- no tall foreground occluder directly over spawn.

The player should feel they have arrived at a real work yard and can choose to nose around, while the strongest visual pull remains towards the workshop.

### B. Apprentice workshop / splice shed — upper-left / centre-left

This is the architectural anchor and strongest single silhouette in the bright Yard.

It should read as an old rural outbuilding repeatedly modified for biotech work by apprentices who are clever, underfunded and reckless.

Features:

- warm plaster/brick/timber shell rather than clean sci-fi architecture;
- patched roof sections, mismatched windows and one or more small extensions;
- teal/green machinery bolted onto older building fabric;
- external pipes, extractor ducting, cabling and specimen hoses;
- a loading/service doorway rather than a grand front entrance;
- workbench spill-out under an awning or lean-to;
- hazard-yellow repairs/markings used sparingly as functional accents;
- little evidence of repeated mishaps: scorched patch, repaired panel, dented tank, hastily replaced fence post;
- windows or vents that imply interior activity without demanding a playable interior here.

The building must feel embedded in the ground with contact shadows, wear, drainage and accumulated service clutter at believable edges.

### C. Central biotech work court — centre

This is the visual storytelling heart of the location, but it remains traversable rather than being filled edge-to-edge with props.

Use one strong focal cluster rather than many evenly distributed objects.

Recommended focal cluster:

- a squat specimen-processing tank or transparent vat;
- an improvised hoist/gantry or pipe arch feeding it;
- a nearby stained worktable with sample jars/tools;
- hoses running from workshop services into the cluster;
- a drain or runoff channel physically connected to the work area;
- one conspicuously wrong but non-gory biological detail, such as a plant growing tissue-like nodules around an irrigation line or a small contained specimen that clearly should not exist.

The cluster should look used and useful. Nothing should resemble decorative icons placed for density.

### D. Animal handling / quarantine run — centre-right / upper-right

This area establishes the practical animal experimentation side of the apprentices’ work and foreshadows the opening animals without turning the Yard into a zoo.

Features:

- one irregular fenced handling run rather than several identical pens;
- a quarantine cage or reinforced small holding bay attached to the service edge;
- feed/water trough, tagged buckets and handling tools;
- a shade canopy, patched shelter or part-roofed pen;
- restraint/inspection point integrated into fencing;
- evidence of different-sized animals having passed through: repaired rails, gnaw marks, scraped ground, hoof prints, a reinforced corner;
- limited creature presence in the master artwork unless the composition benefits from tiny ambient animals; the critical Rabbit/Goat/Pig opening state remains a later gameplay/story concern.

Fencing should be visually permeable and rhythmically irregular. Avoid perfect grids that read like map tiles.

### E. Drainage / runoff garden — lower-right edge

The Yard needs a soft natural counterweight to the workshop machinery and a believable destination for all the pipes, washing and containment runoff.

Features:

- shallow stream, drainage ditch, pond edge or constructed runoff channel;
- small footbridge, stepping slab or service crossing only if compositionally useful;
- reeds, flowers, weeds and odd apprentice-grown plants;
- one or two pipes discharging clean-looking water in the bright state, with staining around their mouths suggesting a less innocent history;
- damp soil and moss clustered around actual low points;
- a few mutated or grafted plants that are charmingly wrong rather than threatening.

This area must not become a large scenic obstacle that starves the Yard of walkable space.

### F. Master Lab route / service gate — right / upper-right background

This is the required semantic exit and the long-term destination pull.

It should read as a continuation of the same facility rather than a glowing level exit.

Features:

- worn service lane or narrow track leaving the yard;
- utility fencing / gateposts / pipe crossing that visually frames the route;
- distant hint of more serious institutional infrastructure beyond the apprentice yard;
- cleaner or more disciplined construction language as the route leaves the apprentices’ messy domain, subtly anticipating the Master Lab;
- open sightline and sufficient compositional breathing room that players identify the route naturally.

Do not use a giant arrow, portal, symmetrical gatehouse or arbitrary empty rectangle.

---

## 5. Spatial rhythm and walkable-space intent

The Yard should be approximately **60–65% visually open/traversable ground** and **35–40% structures, vegetation, water and hard clutter** when judged at whole-scene scale.

That does not mean empty grass. Open ground should contain restrained surface storytelling—ruts, repairs, drainage seams, weeds, stains, fallen leaves and worn tracks—without turning into visual noise.

The player’s plausible movement should form a loose loop rather than a single corridor:

- arrival into central court;
- option to pass left/below the workshop or right past specimen handling;
- reconnection near the Lab service lane;
- small optional pockets to inspect without dead-end maze design.

Touch control requires generous corner radii and readable gaps between solid-looking structures. Avoid narrow decorative channels that appear walkable but would be frustrating to traverse.

---

## 6. Scale and camera composition

The Yard is authored for the accepted current protagonist scale and the existing 1280 × 720 desktop gameplay-view direction.

Rules:

- major structures must remain legible when only a camera-sized portion of the full scene is visible;
- each typical camera view should contain one clear dominant mass and one or two supporting detail clusters, not equal-detail noise everywhere;
- silhouettes should survive portrait-mobile reduction;
- avoid tiny critical props whose meaning depends on reading individual pixels at desktop zoom;
- open routes should remain visually recognisable when mobile UI occupies screen edges;
- no composition may depend on the player seeing the entire Yard at once.

YSP-2 may choose the exact world aspect ratio and pixel dimensions based on the strongest generated master, provided it supports sensible camera travel and asset preparation.

---

## 7. Material and colour direction

Use the existing SplicePit environment language as anchors, not as a procedural palette recipe.

Bright-world material family:

- warm dirt / straw-gold paths;
- fresh but controlled yellow-green grass;
- warm plaster, brick and timber architecture;
- desaturated teal machinery / tanks / pipes;
- pale green-blue glass and liquid highlights;
- hazard yellow only as a small functional accent;
- restrained pink/coral biological accents where life looks slightly wrong;
- deep green/brown contact shadows rather than black outlines around everything.

The scene should feel sunlit, warm and attractive. Contrast should come from material relationships and local lighting, not from saturation everywhere.

Avoid:

- neon toxic-green as the main biotech colour;
- large flat lawn-green fields;
- excessive brown mud that makes the bright Yard dingy;
- generic grey industrial sci-fi surfaces;
- uniform dirt/grime overlays;
- equal saturation on every prop.

---

## 8. Environmental storytelling rules

Every detail should answer at least one of these questions:

- What work happens here?
- What animal/specimen passed through here?
- What broke and how was it repaired?
- Where does waste, water or biological material go?
- What have the apprentices improvised because they lacked the proper equipment?
- What looks harmless until you inspect it more closely?

Preferred examples:

- a feed sack repurposed to cushion a specimen cylinder;
- three different repairs on the same fence corner;
- a hose patched with tape and a metal clamp;
- a sample rack stored beside ordinary gardening tools;
- a tiny handwritten warning nailed over an older, more official warning;
- flower beds using laboratory drip lines;
- a quarantine latch upgraded after something clearly bent the first one;
- feathers/fur stuck in a drain grate;
- one clean rectangle where a heavy piece of equipment was recently moved;
- a specimen jar cooling in an ordinary bucket of water.

Avoid anonymous clutter that has no physical relationship to nearby architecture or work.

---

## 9. Foreground / depth opportunities to preserve in the master

YSP-2 should deliberately include several elements that can later become YSP-3 foreground occlusion assets:

- edge of a tree canopy or tall shrub;
- one fence/rail segment that the player can plausibly pass behind;
- a pipe arch, gantry or hanging hose crossing over a path;
- workshop awning/roof lip near a traversable edge;
- small foreground service structure at the lower scene boundary.

These must create depth without turning the environment into a visual obstacle course.

Do not scatter tall occluders across every route. Occlusion should be occasional and compositionally meaningful.

---

## 10. Bright-state biological wrongness

The bright Yard must already contain enough biological specificity that removing the word “SplicePit” would not make it look like a generic farm workshop.

Required cues:

- visible specimen containment or processing equipment;
- animal handling infrastructure;
- biological sample storage;
- at least one visibly abnormal plant/organism detail;
- signs of improvised genetic/biological work integrated with ordinary rural tools;
- at least one containment repair that implies a previous incident.

Tone:

- no realistic gore;
- no horror-wall flesh coating;
- no piles of corpses;
- no torture imagery;
- no grimdark lighting.

The discomfort comes from casual normalisation of irresponsible experimentation.

---

## 11. Dark-state hooks to bake into the bright composition

YSP-8 will author a physical dark counterpart. The bright master should therefore contain structures that can later change coherently rather than requiring arbitrary corruption overlays.

Good future transformation hooks:

- specimen vat that can rupture or contain a wrong silhouette;
- runoff channel that can become contaminated;
- pipe/gantry structure that can sprout biological intrusion;
- quarantine cage that can be breached;
- patched workshop wall/roof that can fail further;
- grafted plants that can overgrow;
- service lights that can switch from warm functional illumination to pathological or emergency sources.

Do **not** make the bright master look pre-corrupted just to prepare for YSP-8.

---

## 12. Generation brief for YSP-2

YSP-2 should generate a **complete top-down / high three-quarter pixel-art game environment composition**, not a collection of separate concept props.

The generated master should show:

- one coherent Apprentice Splicer Yard;
- diagonal lower-left-to-upper-right spatial flow;
- irregular apprentice workshop as the main architectural mass;
- central specimen/work cluster connected physically to the workshop;
- animal/quarantine handling area to the right;
- soft drainage/water/vegetation counterweight near the lower/right edge;
- readable service route towards the Master Lab at upper-right/right;
- substantial open ground around and between these masses;
- warm rural-biotech palette;
- dense hand-authored pixel detail at the quality level required to sit beside the accepted protagonists and Master Lab;
- convincing material wear, repairs, shadows and functional connections;
- no visible UI and no protagonist baked into the master scene.

### Negative generation constraints

Reject or regenerate compositions that contain:

- rectilinear board-game lawns or tiled zones;
- isolated prop islands with empty margins around each object;
- evenly spaced crates, flowers, trees, cages or barrels;
- perfectly centred symmetrical workshop composition;
- straight paths whose only purpose is connecting game nodes;
- generic cosy-farm scenery with biotechnology pasted on afterwards;
- generic cyberpunk/sci-fi laboratory architecture;
- overgrown post-apocalypse framing;
- realistic gore or horror imagery;
- unreadably tiny clutter over all available ground;
- strong perspective that would make top-down movement visually incoherent;
- baked text that must be preserved verbatim;
- giant decorative foreground objects blocking the arrival or Lab route.

---

## 13. Selection criteria for YSP-2 concepts

Choose the strongest complete composition autonomously using this priority order:

1. **Holistic place-read** — does it look like one location before examining details?
2. **Protagonist compatibility** — would Milo/Theo/Ada/Pip look native to this image at gameplay scale?
3. **Readable movement space** — are there obvious, generous areas where a character could walk?
4. **Visual hierarchy** — workshop and biotech work cluster dominate without swallowing the scene.
5. **SplicePit specificity** — pastoral biotech and casual biological wrongness are intrinsic to the scene.
6. **Master Lab quality compatibility** — materials, density and finish plausibly belong beside the Lab benchmark.
7. **Mobile readability** — major shapes and routes remain understandable when reduced.
8. **Asset-separation potential** — useful foreground elements can be cleanly isolated later.
9. **Dark-state potential** — the same scene could be physically corrupted without changing its identity.

A technically convenient composition must lose to a visibly stronger one. Gameplay data will be authored to the chosen image later.

---

## 14. Locked composition decision

YSP-1 locks the following for YSP-2:

- **Identity:** warm pastoral apprentice biotech work yard; attractive first, concerning second.
- **Flow:** asymmetrical diagonal arrival-to-Lab movement, broadly lower-left/lower-centre to upper-right/right.
- **Primary mass:** crooked apprentice workshop / splice shed left-of-centre in the upper half.
- **Primary focal activity:** connected central specimen-processing/work cluster.
- **Secondary mass:** animal handling/quarantine area to the right.
- **Soft counterweight:** drainage/water/vegetation along portions of the lower/right edge.
- **Exit language:** believable facility service lane/gate towards the Master Lab, not a game portal.
- **Space:** generous negative space and loose-loop traversal intent; no board geometry.
- **Depth:** a small number of deliberately separable foreground/occlusion structures.
- **Tone:** premium GBA-descended pixel-art readability, warm colour, improvised biotechnology, cute-but-concerning rather than horror.

Exact image dimensions, prop positions, walkable mask, colliders, spawn coordinates, interaction coordinates and exit trigger geometry remain **unlocked until the selected YSP-2 master exists**.

---

## 15. YSP-1 gate result

**PASS.**

The Apprentice Splicer Yard can now be described as one coherent place without reference to legacy Yard coordinates or collision data.

YSP-2 may proceed directly to **Bright Yard Master Generation and Selection** using this document as the composition contract.
