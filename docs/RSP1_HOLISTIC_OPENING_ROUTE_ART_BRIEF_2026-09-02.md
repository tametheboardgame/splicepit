# RSP-1 — Holistic Opening Route Art Brief / Composition Lock

Status: **COMPLETE / COMPOSITION LOCKED**

Date: 2 September 2026

Authority: `docs/work-packages/RSP-0_OPENING_ROUTE_SCENE_CONTRACT.md`, `docs/SCENE_IMAGE_PROPAGATION_ROADMAP_2026-09-02.md`, `docs/VISUAL_DIRECTION_2026-08-23.md`, and the YSP-10 approved scene-image production model.

This document is the visual source of truth for RSP-2 Bright Opening Route Master generation. It defines the route as one authored place before collision, exits, trigger geometry and runtime coordinates are derived from the selected raster.

The core rule remains the RSP-0 rule:

> Preserve gameplay meaning and story topology. Do not preserve obsolete geometry merely because the current implementation happens to use it.

---

## 1. The scene in one sentence

The Opening Route is a **warm semi-rural biotech service corridor where the apprentice Yard’s improvised messiness gives way to Viktor’s more serious laboratory infrastructure, then bends through a redundant livestock/biosecurity inspection pull-in before continuing towards the rougher local Pit**.

It should feel like a real service road between related gene-splicing operations, not a level-select strip connecting three game rooms.

---

## 2. Core visual identity

The Route should combine four readings at once:

1. **Rural continuity** — hedges, verge grass, drainage, field edges, old farm infrastructure, trees and warm daylight connect it naturally to the approved Yard.
2. **Biotech service infrastructure** — pipes, wash-down points, containment crates, utility cabinets, decontamination equipment, sample transport remnants and modified livestock hardware make the route specifically SplicePit.
3. **Increasing institutional seriousness** — the approach to Viktor’s Lab is cleaner, more deliberate and more technically competent than the apprentice Yard, without becoming sterile generic sci-fi.
4. **A working route with a history** — patched surfacing, obsolete inspection hardware, changed traffic patterns, repaired fencing and repurposed agricultural structures imply that this road existed before the current story and has been repeatedly adapted for experimental-animal work.

The bright state is not threatening. It should be attractive, slightly eccentric and credible as an ordinary working landscape whose ethical wrongness has been normalised.

---

## 3. Composition lock

### Overall topology

Use a **hooked / broken-S service-route composition**, not a straight connector.

The route should be readable as four sequential spatial beats:

**Yard-side arrival → Viktor’s Lab approach / forecourt → inspection/weighbridge pull-in → Local Pit continuation**.

The scene should be one continuous authored environment. Technical asset preparation may later split it into raster chunks if required, but the artwork must be conceived and selected as one place.

### Locked relative placement

The selected Bright master should broadly place:

- the **Yard-side arrival** at the lower-left / left side of the authored world;
- the **Master Lab exterior** as the strongest architectural destination in the upper-right / upper-centre region;
- the **inspection/weighbridge pull-in** below and beyond the Lab on the route towards the Pit, separated from the Lab threshold by a clear traversal beat;
- the **Local Pit continuation** at the lower-right / far-right edge, reached after the encounter staging area.

Exact coordinates, world dimensions and camera bounds remain deferred until a raster is selected.

### Primary eye path

During the first `find-master` journey, the eye should travel:

**Yard arrival → worn service lane → Lab mass / entrance**.

The Pit continuation must not compete with the Lab as the player’s first obvious destination. It may be hinted through distant utility lights, battered event signage, heavier traffic wear or fencing direction, but it should not visually shout “go here first”.

Post-disaster, when the player exits the Lab, the composition should naturally reveal the route continuing away from the Lab and towards the inspection pull-in, then onward to the Pit.

This story ordering must be achieved by composition and spatial hierarchy, not by painted floor arrows.

---

## 4. Why this route exists

The environment should answer the practical question: **why are the Yard, Viktor’s Lab and the Pit connected by this route?**

The route is a former agricultural / livestock service lane that has been progressively adapted for gene-splicing operations.

It carries or once carried:

- experimental animals;
- feed and bedding;
- specimen transport cases;
- waste and wash-down traffic;
- lab supplies and gas cylinders;
- repaired containment equipment;
- occasional Pit-bound creatures and handlers.

This premise should guide prop placement and wear patterns. The route is not a scenic country path with random biotech props added afterwards.

---

## 5. Zone layout

These are compositional zones, not collision rectangles. RSP-4 will derive gameplay geometry from the selected image.

### A. Yard-side convergence / service arrival — lower-left / left

This is where the approved Yard hands the player into the Route.

The Yard currently has more than one visible route-out option. The authored Route does not need to reproduce two separate world-space entrances, but its arrival should make it believable that multiple Yard-side tracks or service passages converge just off-scene.

Features:

- a broad dirt-and-gravel service arrival widening into more established road surface;
- worn wheel tracks and boot paths arriving from slightly different angles;
- old fencing / hedge openings that imply a messy apprentice-side network behind the player;
- one pipe or utility run continuing from the Yard’s visual language;
- stacked empty containment crates, feed sacks, a battered trolley or similar edge dressing;
- enough negative space for safe entry, return-to-Yard placement and touch steering;
- no large foreground object directly over the arrival seam.

The player should immediately understand that they have left the enclosed Yard and entered the shared service route.

### B. Rural biotech service lane — left-centre into upper-right

This is the connective tissue between Yard arrival and Viktor’s Lab.

The lane should be broad and irregular rather than a perfectly straight road rectangle.

Features:

- patched tarmac / compacted gravel / old concrete sections rather than one uniform surface;
- grass and wildflower verges with evidence of repeated vehicle overrun;
- shallow drainage ditch or culvert that follows believable terrain;
- timber and wire livestock fencing modified with newer containment mesh or sensor boxes;
- utility poles, pipe bridges, wash hoses, service cabinets and biosecurity equipment placed where they make physical sense;
- occasional animal-transport evidence: bedding, tagged straps, hoof scuffs, feathers/fur in a drain, reinforced gate corners;
- one or two visually wrong but non-horror biological details integrated into ordinary rural features, for example grafted hedge growth around a utility pipe or an irrigation plant with suspicious tissue-like nodules.

Open ground must remain the dominant movement read. The lane may curve, split around a verge island or narrow slightly, but it must remain forgiving under touch input.

### C. Viktor’s Lab approach / controlled forecourt — upper-right / upper-centre

This is the strongest destination in the first journey and the largest architectural mass in the Route scene.

The exterior should communicate that Viktor is operating at a more professional and established level than the apprentices, while still belonging to the same eccentric world.

Features:

- a substantial converted rural/institutional building or compound edge, not a futuristic bunker;
- warm masonry/plaster/timber remnants integrated with more disciplined concrete, steel, teal machinery and glass;
- cleaner utility runs, labelled tanks, proper ducting and more deliberate containment infrastructure;
- a clear entrance threshold with believable approach apron;
- a service forecourt large enough for deliveries, animal transport and player movement;
- restrained hazard / biosecurity markings used functionally rather than as decorative stripes everywhere;
- one or two exterior details that connect clearly to the interior Lab language, such as containment pipework, ventilation, specimen transfer equipment or wash-down plumbing;
- visible contact with the ground: drainage, tyres/ruts, patched slabs, loading wear, moss at edges and accumulated service clutter.

The Lab entrance must be readable from ordinary camera distance without relying on tiny text.

The entrance apron must also support a safe return from the Lab without immediately placing the player into another trigger.

### D. Post-Lab route turn — right-centre into lower-centre

After the Lab, the route should visibly continue rather than ending in a cul-de-sac.

The road should turn or dog-leg away from the Lab, creating a new visual beat before the creditor staging area.

This section serves three purposes:

- prevents the debt trigger from overlapping the Lab threshold;
- gives the player a moment of normal traversal after the post-death Lab hand-off;
- allows the encounter staging area to reveal naturally as the player moves towards the Pit.

Useful features:

- a hedge / retaining edge / pipe run that partially screens the pull-in until the player commits to the Pit direction;
- tyre-worn road curvature;
- service signage or fencing orientation that guides movement without functioning as UI;
- a small drainage crossing or culvert that reinforces the turn;
- signs of heavier animal transport as the route moves closer to the Pit.

Do not turn this into a narrow corridor. The bend should be visually strong but mechanically generous.

### E. Decommissioned livestock / biosecurity inspection pull-in — lower-centre / right-centre

This replaces the old toll-lay-by **composition** while retaining its story role.

The locked visual concept is a **redundant livestock inspection / weighbridge pull-in that has been partially repurposed for biotech traffic**.

It should feel like exactly the sort of place where a calm creditor representative could wait with paperwork and intercept somebody travelling from a laboratory to an illegal-ish local fight venue.

Features:

- a broad hardstanding bay offset from the through-route;
- an old weighbridge plate, inspection pad or embedded vehicle scale;
- a small weathered inspection hut, canopy or service kiosk positioned to one side rather than in the centre of movement;
- remnants of barrier arms / gate hardware / bollards;
- a disused wash-down or hoof-bath/decontamination station;
- paperwork box, old notice board, numbered tags or faded operational markings as environmental dressing;
- drainage and staining consistent with animal transport and wash-down use;
- enough clear ground for the waiting creditor, player approach, automatic trigger detection and dialogue framing;
- a route mouth that makes the representative visible before the player crosses the encounter trigger;
- believable places for the representative to stand without appearing to block the road like a battle NPC.

The exact name of this location is not canonised by RSP-1. “Inspection pull-in”, “weighbridge” and similar terms describe its visual function only.

The creditor must not be baked into the environment master. The scene must work both before and after the encounter.

### F. Pit-bound continuation — lower-right / far-right

This is the semantic hand-off towards the Local Pit.

It should feel rougher and more public-facing than Viktor’s Lab route without showing the full Pit venue.

Features:

- road surface becoming more heavily worn, muddy or patched by repeated creature transport;
- improvised parking / trailer scuffs / temporary fencing cues;
- low utility lighting, distant bunting, battered venue-direction boards or event infrastructure used sparingly;
- thicker barriers or containment rails where larger creatures plausibly pass;
- glimpses of rougher construction language that anticipates the Local Pit;
- a clear, generous exit / entrance approach that can later host the semantic `local-pit-entrance` anchor.

The Pit continuation should read as “something is down there” during the first Lab journey, but only become the obvious next destination after the post-disaster route-forward hand-off.

---

## 6. Spatial rhythm and traversable-space intent

The Route should contain **three distinct camera-scale movement beats**, not one long road strip:

1. Yard arrival and Lab approach;
2. Lab forecourt and route turn;
3. inspection pull-in and Pit continuation.

A typical camera view should contain one dominant destination or environmental mass, not all major story nodes simultaneously.

The critical traversal path should remain broad enough that touch steering errors do not cause constant collision corrections.

Guidelines:

- major movement lanes should feel several protagonist widths wide;
- Lab entrance, encounter pull-in and Pit hand-off need generous approach aprons;
- decorative fences / drainage / vegetation should shape movement rather than pinch it;
- optional inspection pockets may exist, but the main story path must not require weaving through clutter;
- avoid dead ends that look like the intended road;
- avoid visually open shoulders that are secretly blocked by broad invisible colliders;
- allow small natural lateral freedom so walking feels exploratory rather than rail-guided.

The composition should be roughly **55–65% visually traversable/open ground and 35–45% architecture, vegetation, drainage and hard infrastructure** at whole-scene scale.

Open ground should still contain surface storytelling: tyre wear, cracks, patched utility cuts, verge encroachment, wash stains, drain covers and localised debris.

---

## 7. Camera and world-footprint direction

The gameplay view remains 1280 × 720.

RSP-2 should prefer a **landscape authored world approximately 3:2 to 16:10 in overall feel**, large enough for the three camera beats above but compact enough that the route remains a memorable place rather than a long travel tax.

Exact pixel dimensions are deliberately not locked until the best Bright master is selected.

Rules:

- the Lab should not be fully visible from the initial Yard-side arrival camera unless only as a partial distant mass / clear destination cue;
- the inspection pull-in should not share the Lab entrance trigger space;
- the Pit entrance should not dominate the initial Yard-to-Lab camera view;
- every required route anchor must be frameable without revealing unpainted void;
- major silhouettes and route mouths must remain readable under portrait-mobile HUD overlays;
- camera travel should feel like moving through one continuous environment, not panning across a giant static board.

---

## 8. Visual hierarchy

The route has a strict hierarchy.

### Primary mass: Viktor’s Lab exterior

This is the strongest architectural feature and first-journey destination.

It should be visibly more competent and better funded than the Yard, but not so monumental that it stops feeling like a strange semi-rural gene-splicing business.

### Secondary stage: inspection/weighbridge pull-in

This is the strongest non-building spatial composition after the Lab.

Its identity comes from open hardstanding, obsolete livestock/biosecurity infrastructure and road geometry, not from a giant prop in the middle.

### Tertiary cues: Yard-side origin and Pit-bound destination

These should be readable but subordinate.

The Yard side communicates where the player came from. The Pit side communicates where the route continues.

Neither should visually compete with the Lab during the initial objective.

---

## 9. Material and colour direction

Use the approved Yard as the Bright-world colour and material family, then increase institutional order near the Lab and roughness again towards the Pit.

Bright material family:

- warm straw-gold dirt and dry compacted gravel;
- muted grey-brown patched tarmac / old concrete;
- controlled yellow-green grass and hedgerows;
- warm plaster, brick, timber and weathered rural construction;
- desaturated teal tanks, cabinets, pipes and biotech machinery;
- pale green-blue glass / fluid highlights;
- galvanised steel, worn fencing and livestock hardware;
- restrained hazard yellow and faded red as functional accents;
- pink/coral/organic accents only where biological wrongness is intentional;
- deep green/brown contact shadows rather than black outlining around every object.

Lighting should remain warm daylight, consistent with the approved Bright Yard.

Avoid:

- generic grey industrial estate scenery;
- pristine white sci-fi laboratory exteriors;
- neon cyberpunk route lighting;
- large uniform asphalt rectangles;
- endless brown mud;
- oversaturated toxic green;
- post-apocalyptic ruin language;
- equal grime over every surface.

---

## 10. Environmental storytelling rules

Every major detail should help answer at least one of these questions:

- What travelled along this road?
- Which part belongs to apprentice work, Viktor’s operation or Pit traffic?
- Where are animals inspected, washed or transferred?
- Where do water and contaminated runoff go?
- What old agricultural infrastructure has been repurposed?
- What broke and was repaired?
- What became obsolete when gene-splicing traffic replaced ordinary livestock traffic?
- What looks completely normal to locals but alarming to an outsider?

Preferred detail examples:

- an old cattle-grid sensor retrofitted with specimen scanners;
- a livestock trailer wheel rut beside a modern containment case;
- decontamination hose reels attached to an ancient timber fence;
- numbered ear-tag strips mixed with sample barcodes;
- a cracked weighbridge plate patched around a cable trench;
- bedding or feathers caught in a drain grate;
- a proper Lab waste cylinder sitting beside ordinary farm chemical storage;
- a biosecurity footbath now used for something much larger than boots;
- a hedge section repeatedly cut back around a warm utility pipe;
- a repaired gate corner strengthened after an animal clearly hit it hard;
- cleaner Lab-side kerbing gradually degrading into rough Pit-bound verge.

Avoid anonymous decorative clutter with no relationship to nearby work or traffic.

---

## 11. Bright-state biological wrongness

The Route must remain unmistakably SplicePit even without dialogue or labels.

Required Bright-state cues:

- at least one specimen/animal transport object;
- at least one rural object visibly modified for biotech use;
- at least one abnormal living detail integrated into the landscape;
- containment / biosecurity infrastructure that exceeds ordinary farm requirements;
- evidence of past animal or specimen traffic;
- one casually concerning detail that rewards inspection without turning the scene into horror.

Tone limits:

- no realistic gore;
- no corpses as scenery;
- no torture imagery;
- no flesh-covered roads;
- no grimdark lighting;
- no constant emergency state.

The bright scene should remain pleasant enough that the later Dark counterpart has something meaningful to violate.

---

## 12. Foreground / depth opportunities

RSP-2 should deliberately include elements that can later support RSP-6 exact-pixel foreground occlusion and character grounding.

Useful opportunities:

- hedge or tree canopy edge beside, not over, the main path;
- one overhead pipe / cable / livestock gantry crossing a traversable lane;
- Lab awning / loading-bay lip near a walk-behind edge;
- inspection canopy edge where the player can briefly pass behind it;
- fence / barrier segment with a clear front/back relationship;
- lower-scene verge vegetation or service equipment providing occasional foreground framing.

Do not build the route around constant occlusion.

The YSP-10 rule is locked: foreground crops must not redraw ordinary clear ground over the protagonist, and solid-looking scenery must match believable collision.

---

## 13. Debt encounter composition contract

The inspection pull-in must be composed specifically for the existing debt encounter runtime to be reattached later.

The selected master must provide:

- a clear waiting position for the creditor representative that is visible from the player’s approach;
- enough separation between representative and through-route that the NPC looks intentionally placed rather than randomly blocking travel;
- an approach path that makes accidental trigger activation unlikely from unrelated movement;
- a broad dialogue staging area that reads cleanly at the 1280 × 720 gameplay view;
- background detail strong enough to establish place, but not so busy that the creditor sprite disappears;
- no mandatory tall foreground occluder over the representative or player during the confrontation;
- visual room for the mobile dialogue layer while ACTION remains available;
- a clear continuation towards the Pit after the encounter completes.

The encounter remains Bright. The composition must not rely on darkness, lightning, corruption or horror cues to make the representative threatening.

The threat is administrative confidence in an ordinary working place.

---

## 14. Dark-state hooks to bake into the Bright master

RSP-7 will create the authored Dark counterpart using the same geometry and semantic anchors.

The Bright scene should therefore include several coherent transformation hooks:

- drainage / wash-down channels that can become biologically contaminated;
- hedgerow or verge growth that can become invasive or tissue-like;
- utility pipes / gantries that can acquire organic intrusion;
- Lab-side glass / tanks / service lights that can show wrong silhouettes or pathological colour changes;
- weighbridge / inspection canopy shadows that can become spatially impossible without changing collision;
- road repairs or cable trenches that can appear to pulse / split in the Dark state;
- Pit-bound animal traffic residue that can become more disturbing;
- fencing / containment hardware that can appear stressed, bent or partially absorbed.

Do not pre-corrupt the Bright master merely to prepare these changes.

Bright and Dark must remain spatially identical for traversal and interactions.

---

## 15. Generation brief for RSP-2

RSP-2 should generate a **complete top-down / high three-quarter pixel-art game environment master**, not a set of route tiles or separate concept props.

The generated Bright master should show:

- one continuous semi-rural biotech service route;
- Yard-side convergence at lower-left / left;
- broad irregular lane rising towards Viktor’s Lab;
- substantial Lab exterior / forecourt as the strongest architectural mass in upper-right / upper-centre;
- route dog-leg away from the Lab towards a distinct inspection/weighbridge pull-in;
- broad creditor staging hardstanding with obsolete livestock/biosecurity infrastructure;
- clear continuation towards the Local Pit at lower-right / far-right;
- believable hedges, drainage, field/service edges and utility infrastructure shaping the scene;
- warm Bright-world rural palette consistent with the approved Yard;
- hand-authored material wear, repairs, traffic history and functional connections;
- enough open ground for mobile traversal at accepted protagonist scale;
- no visible UI;
- no protagonist, Viktor, creditor or other critical NPC baked into the environment;
- no text that must be reproduced exactly for gameplay meaning.

### Negative generation constraints

Reject or regenerate compositions containing:

- a straight horizontal or vertical road connecting labelled nodes;
- board-game paths, tiled lawns or evenly spaced destination zones;
- a centred symmetrical Lab with roads radiating like a hub map;
- a tiny Lab that fails to read as the first destination;
- a giant Pit sign / gate that competes with the Lab during `find-master`;
- a narrow corridor between walls/hedges for most of the route;
- generic British countryside with a few science props pasted on;
- generic industrial estate scenery;
- cyberpunk / futuristic sterile lab architecture;
- post-apocalyptic ruin or abandoned-world framing;
- perfectly repeated barriers, bollards, trees, crates or lights;
- isolated prop islands surrounded by empty margins;
- unreadable micro-clutter covering traversable ground;
- strong perspective that conflicts with top-down four-direction movement;
- giant decorative foreground objects blocking critical routes;
- realistic gore or horror imagery;
- the old procedural east-road / south-road layout recreated out of habit;
- the old toll booth preserved merely because it exists in legacy code.

---

## 16. Selection criteria for RSP-2 concepts

RSP-2 should select the strongest complete composition autonomously using this priority order:

1. **Holistic place-read** — does the image look like one believable working route before individual props are examined?
2. **Story topology readability** — does Yard → Lab → inspection pull-in → Pit continuation read naturally without UI arrows?
3. **Lab destination hierarchy** — is Viktor’s Lab clearly the first major destination during `find-master`?
4. **Debt staging quality** — can the inspection pull-in host the existing creditor encounter cleanly and visibly?
5. **Protagonist compatibility** — would the approved 64 × 96 protagonists look native to the scene at gameplay scale?
6. **Mobile traversal readability** — are the major paths, entrances and approach aprons generous and understandable when reduced?
7. **SplicePit specificity** — is rural biotech / experimental-animal infrastructure intrinsic rather than decorative?
8. **Approved Yard compatibility** — does the scene plausibly continue from the YSP-10 Yard in palette, density, depth and material treatment?
9. **Camera rhythm** — does the world provide several distinct camera beats rather than exposing every story node at once?
10. **Asset-separation potential** — can useful foreground occluders be isolated cleanly later?
11. **Dark-state potential** — can the same physical place be meaningfully corrupted without changing route geometry?

A technically easy image must lose to a visibly stronger one. Geometry and runtime data will be authored to the selected master later.

---

## 17. Locked composition decision

RSP-1 locks the following for RSP-2:

- **Identity:** warm semi-rural biotech service corridor connecting related animal/genetic operations.
- **Format:** one continuous authored top-down / high-three-quarter pixel-art world scene.
- **Spatial flow:** hooked / broken-S route, broadly Yard-side lower-left/left → Lab upper-right/upper-centre → inspection pull-in lower/right → Pit continuation lower-right/far-right.
- **Primary mass:** Viktor’s Lab exterior and forecourt, visually more competent than the Yard but still rural-biotech rather than sci-fi.
- **First-journey hierarchy:** the Lab is the obvious destination; Pit continuation remains subordinate.
- **Encounter concept:** decommissioned livestock/biosecurity inspection or weighbridge pull-in repurposed by biotech traffic.
- **Encounter staging:** broad open hardstanding, visible NPC waiting position, safe automatic-trigger approach, clean dialogue framing and clear onward route.
- **Traversal:** broad forgiving movement lanes and generous semantic-anchor approaches suitable for touch controls.
- **World rhythm:** at least three distinct camera-scale beats; no requirement to see all route nodes simultaneously.
- **Environment logic:** old agricultural infrastructure progressively modified for experimental-animal transport, Lab servicing and Pit traffic.
- **Bright tone:** warm, attractive and casually unethical, never grimdark.
- **Depth:** selective meaningful foreground opportunities only, following the YSP-10 exact-pixel occlusion lessons.
- **Dark preparation:** Bright composition must contain coherent transformation hooks while remaining visibly uncorrupted.
- **Disposable legacy:** old route dimensions, road rectangles, waypoint chain, toll-booth geometry, current landmark coordinates and Pass D collision topology remain rejected as composition constraints.
- **Technical freedom:** exact raster dimensions, collision shapes, semantic coordinates and camera bounds remain deferred until the Bright master is selected.

---

## 18. RSP-1 acceptance gate

RSP-1 is complete when the RSP-2 generation process can answer all of these questions without inventing new layout policy:

- What kind of place is the Opening Route?
- Where does the player visually come from?
- What is the first dominant destination?
- How does the route continue after the Lab?
- What physical place hosts the debt confrontation?
- How does the player continue towards the Pit?
- What parts must remain open and mobile-friendly?
- Which visual details make this specifically SplicePit?
- What should later become foreground depth?
- What can change in the Dark state while preserving geometry?
- Which legacy route features are explicitly not requirements?

All are now answered by this document.

## Next package

`RSP-2 — Generate and Select Bright Opening Route Master`
