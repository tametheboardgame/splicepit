# SplicePit Graphics Tightening Pass B Roadmap — 26 August 2026

## Authority

This document is the authoritative execution refinement of **Graphics Tightening Pass B — Yard / Route / Lab / Pit** in `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`.

It records the human-reviewed direction after WP0.6F / WP0.6F1 landed on `main`.

Where the older opening-slice roadmap describes Graphics Tightening Pass B as one broad art-quality pass, this document supersedes that single-line scope and splits it into executable work packages. R0.7 begins only after the final Pass B integration gate below is green.

This refinement also brings the reusable **ambient in-world dark-layer flicker system** forward from the old WP0.7C scope. WP0.7C remains responsible for story-specific corruption language around the RinoCow disaster, but must reuse the system established here rather than build a second corruption runtime.

---

# 1. Locked visual goal

Every major opening environment must exist as two authored visual states sharing the same gameplay topology:

1. **Bright layer** — colourful, attractive, readable, detailed premium pixel art. The world can be dirty, eccentric and ethically dubious, but it remains inviting on the surface.
2. **Dark layer** — an authored corrupted counterpart of the same physical location, revealing biological horror, decay, failed experimentation, wrong shadows, damaged containment, blood/organic residue and other unsettling implications.

The dark layer must **not** be a simple colour filter. Important surfaces, props, stains, silhouettes and environmental storytelling should genuinely differ.

The player should occasionally and unpredictably glimpse the dark layer during normal exploration. These ambient glitches are short and irregular. They should feel like reality briefly failing rather than like a recurring UI animation.

## Non-negotiable consistency rules

- Keep the accepted `1280 × 720` gameplay scale, camera behaviour and protagonist size.
- Preserve current collision topology and authored traversal routes unless a genuine bug requires correction.
- Bright and dark versions of a location must share gameplay geometry. Corruption is visual/story presentation, not a collision-state swap.
- The bright world remains dominant. Do not turn normal exploration into permanent grimdark presentation.
- Environment detail should approach the intentionality and personality of the protagonist sprites.
- Prefer authored pixel detail over large flat procedural rectangles.
- Materials must read consistently across locations: wood, brick, plaster, steel, glass, dirt, grass, cages, machinery, biological residue and lighting should feel like one game.
- Random ambient glitches must never alter saves, objectives, movement position, collision, inventory, story flags or battle state.
- Random corruption must be suppressible during authored cutscenes/dialogue so story beats can control timing explicitly.
- Automated tests need deterministic hooks even if normal gameplay timing is random.

---

# 2. Work-package sequence

## WP0.6G — Environment Production-Art System / Bright-Dark Contract

**Goal:** establish the shared technical and visual contract before individual locations are redrawn.

Build / lock:

- a reusable environment rendering contract supporting `bright` and `dark` authored states;
- shared corruption/compositing hooks that do not change gameplay geometry;
- common material/detail helpers where they genuinely improve consistency;
- shared shadow/depth conventions;
- shared rules for grime, rust, damp, blood, biological residue, damaged surfaces and environmental animation;
- explicit debug/test controls for forcing bright, forcing dark and forcing a transition;
- a location capability contract so Yard, route, Lab and Pit expose dark-state rendering consistently.

Do **not** attempt to make one generic filter generate the dark world.

**Gate:** every opening environment can plug into the same bright/dark runtime without duplicating corruption architecture.

---

## WP0.6H — Apprentice Splicer Yard Production Art + Dark Yard

**Goal:** take the accepted Yard composition from strong blockout to high-quality authored environment art.

Bright Yard focus:

- richer ground texture and worn traffic paths;
- better fencing, gates, pens and containment details;
- more convincing biotech / husbandry equipment;
- pipes, cables, drains, patched structures, storage and workshop clutter;
- improved building materials and roof/wall detail;
- foliage variation and better silhouettes;
- stronger but readable shadows and depth cues;
- small ambient animation where useful;
- environmental storytelling that makes this feel like a real apprentice splicing workplace.

Dark Yard focus:

- failed/abandoned containment implications;
- more invasive biological growth or residue;
- wrong/dead vegetation details;
- darker runoff, staining and damaged equipment;
- unsettling silhouettes and evidence that the cheerful workplace is hiding something much worse;
- same traversable layout and collision geometry as the bright Yard.

**Gate:** screenshots of both Yard states read as the same location and same game, but the dark version reveals a substantially more disturbing reality.

---

## WP0.6I — Opening Route Production Art + Dark Route

**Goal:** make the journey between Yard, Lab, debt-encounter lay-by and Local Pit feel authored rather than connective blockout.

Bright Route focus:

- deliberate road/path edges and terrain transitions;
- drainage, verges, worn ground, fencing and signage;
- vegetation clusters rather than repeated filler;
- small infrastructure and local-world props;
- readable landmarks supporting navigation;
- environmental storytelling linking Yard, Lab and Pit as one local area;
- stronger depth and material variation without making traversal visually noisy.

Dark Route focus:

- contaminated runoff / drainage details;
- malformed or dead vegetation;
- strange biological intrusion into ordinary infrastructure;
- damaged or ominously altered signage/props;
- wrong shadow pockets and glimpses of off-route horror;
- same route, hand-off zones and collision contract as the bright version.

**Gate:** travelling the route feels like moving through a specific place with visual identity, and the dark state is recognisably the same geography rather than a generic horror overlay.

---

## WP0.6J — Master Lab Production Art + Dark Lab

**Goal:** make the Master Lab the strongest environment in the opening so it can support the RinoCow disaster and later splice tutorial without needing another structural redraw.

Bright Lab focus:

- detailed splice machinery and credible workbench construction;
- specimen storage, tanks, cages, tools, notes, shelving and consumables;
- tubing, cabling, power, drains and containment systems;
- messy evidence of an obsessive working splicer;
- stronger lighting hierarchy and shadow depth;
- readable staging for Master, RinoCow containment and future splice interaction;
- visual humour that the world regards highly questionable biotech as routine.

Dark Lab focus:

- failed specimens / discarded biological evidence where appropriate;
- much nastier containment implications;
- blood, tissue, organic leakage, damaged equipment and bad cleanup;
- corrupted specimen tanks / work surfaces;
- shadows and silhouettes implying things that the bright state deliberately hides;
- same usable floorplan, bench position, doors and cutscene staging geometry.

**Gate:** the Lab is detailed enough to carry close visual scrutiny during the upcoming disaster cutscene and already contains a convincing authored dark counterpart.

---

## WP0.6K — Local Pit Production Art + Dark Pit

**Goal:** move the Local Pit beyond WP0.6F foundation quality while preserving its established grime and entry-glitch direction.

Bright Pit focus:

- retain a colourful local-sports identity, but make it visibly cheap, filthy and heavily used;
- richer exterior facade, entrance, fencing and venue signage;
- better reception, registration and payout clutter;
- more convincing cages, prep/weigh equipment and decon area;
- drains, stains, patched flooring, rust, old tape, worn rails and maintenance bodges;
- stronger arena construction, spectator/business clutter and local personality;
- detailed grime rather than uniform darkening.

Dark Pit focus:

- amplify the underlying brutality of the venue;
- older blood and organic residue, failed cleanup and nastier drains;
- warped/damaged cages and equipment implications;
- unsettling crowd/arena silhouettes where appropriate;
- biological wrongness around the prep and fight areas;
- same battle floor, entrances, reception and traversal geometry.

Retain and harmonise the WP0.6F1 entry corruption beat with the new shared visual language.

**Gate:** the bright Pit looks like an attractive but revoltingly maintained local combat venue; the dark version makes the animal-brutality reality unmistakable without becoming a different map.

---

## WP0.6L — Ambient World Corruption / Random Dark-Layer Glitches

**Goal:** make the dark world occasionally break through during ordinary exploration in every completed opening location.

Implement:

- irregular low-frequency ambient glitch scheduling while the player explores Yard, route, Lab or Pit;
- short transitions that expose the **actual authored dark state of the current location**;
- several visual intensities/durations so every event is not identical;
- screen tearing / slice displacement / scan corruption / palette rupture only as transition language, not as a replacement for dark environment art;
- clean recovery to the bright state;
- cooldowns and anti-spam rules;
- suppression during menus, major dialogue and authored cutscenes unless explicitly requested;
- authored trigger API for RinoCow and later story moments;
- deterministic test/debug hooks for forcing and observing corruption.

Default experience target:

- unpredictable enough that the player cannot time it;
- rare enough that normal bright exploration remains dominant;
- usually brief, with occasional slightly longer glimpses that let the player register location-specific dark details;
- never allowed to repeatedly fire back-to-back.

Exact probability/timing values are implementation-tunable and should be judged by feel, not treated as canon constants.

**Gate:** a player can stand in any of the four opening environments and, over time, occasionally see that specific location rupture into its authored dark counterpart and recover without affecting gameplay state.

---

## WP0.6M — Cross-Location Consistency / Production-Art Integration Gate

**Goal:** make the entire R0.6 world read as one polished game rather than four separately improved scenes.

Perform a deliberate final Pass B review across Yard, route, Lab and Pit:

- material consistency;
- pixel density / detail consistency;
- shadow and lighting consistency;
- prop scale consistency;
- protagonist readability;
- bright-layer colour harmony;
- dark-layer visual language consistency;
- corruption-transition consistency;
- environmental animation restraint;
- hand-off transitions between locations;
- camera and collision regression;
- mobile/keyboard presentation regressions;
- Bag/Map/objective overlays against both bright and corrupted visuals.

Fix any location that visibly falls below the quality bar of the others. Do not declare Pass B complete merely because every individual sub-package merged.

**R0.6 / Pass B final gate:**

1. Yard, route, Lab and Pit all look intentionally authored rather than blockout-like.
2. Each has a genuine bright and dark visual state.
3. The four locations share one coherent visual/material language.
4. Random corruption can reveal the correct dark location and recover cleanly.
5. Traversal, collision, controls and UI remain stable.
6. The Lab and Pit are visually strong enough to support the next story/mechanics phases without structural art rework.
7. Automated validation is green and a human visual review can assess the complete connected route.

Only after this gate should execution move to **WP0.7A — Cutscene Runtime**.

---

# 3. Relationship to later roadmap packages

## WP0.7C — Dark-Layer Flicker Story Language

WP0.7C no longer owns creation of the generic in-world corruption runtime.

Instead it should:

- use the Pass B system for authored RinoCow timing;
- establish story-specific intensity/composition rules;
- add any cutscene-only corruption behaviours genuinely required by the disaster;
- avoid duplicating the ambient scheduler or environment bright/dark contracts.

## Graphics Tightening Pass C and later passes

Pass B is a major production-art pass, not the final art pass.

Later tightening passes still own newly introduced content:

- Pass C: RinoCow event, aftermath and creditor staging;
- Pass D: splice bench interaction and creature presentation;
- Pass E: battle action, opponent/crowd/result presentation;
- Pass F: final opening-slice consistency and polish.

Later passes should refine the Pass B environments where necessary, but should not postpone basic environment production quality or dark-state authoring that is explicitly owned here.

---

# 4. Immediate execution order

Current `main` includes WP0.6F / WP0.6F1.

Execute next in this order:

`WP0.6G → WP0.6H → WP0.6I → WP0.6J → WP0.6K → WP0.6L → WP0.6M → WP0.7A`

Do not collapse the location art packages into one enormous unreviewable commit. They are one coherent Pass B programme, but each sub-package should be independently testable, mergeable and reversible while preserving the locked shared visual direction.
