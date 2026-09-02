# RSP-0 — Opening Route Scene Contract / Existing Semantics Audit

Status: **COMPLETE / LOCKED**

Date: 2 September 2026

Authority: `docs/SCENE_IMAGE_PROPAGATION_ROADMAP_2026-09-02.md`

Reference environment: YSP-10 approved Apprentice Splicer Yard scene-image architecture.

## Purpose

RSP-0 defines what the Opening Route must continue to mean after its current procedural / Pass D presentation is replaced by authored scene imagery.

The central rule is:

> Preserve gameplay meaning, story ordering, transition semantics and production behaviour. Do not preserve obsolete coordinates or geometry merely because current code happens to use them.

This contract is the input to RSP-1. It intentionally does not design the replacement composition.

## Audit sources

The contract was derived from the current production implementation and locked opening packages, primarily:

- `src/productionYardRuntime.ts`;
- `src/world/yardScenePack.ts`;
- `src/world/yard.ts`;
- `src/masterLabRuntime.ts` and `src/world/masterLab.ts`;
- `src/localPitRuntime.ts` and `src/world/localPit.ts`;
- `src/story/postDeathLabState.ts`;
- `src/story/debtEncounterState.ts` and `src/story/debtEncounterBootstrap.ts`;
- `src/cutscene/debtCollectorEncounterRuntime.ts`;
- `src/environment/environmentVisualContract.ts`;
- `src/environment/darkLayerStoryLanguage.ts`;
- `src/world/routeProductionArtPassD.ts`;
- `src/onboarding/openingObjectiveSequence.ts`;
- `src/persistence/saveSchema.ts` and `src/types.ts`;
- `tests/opening-route.test.mjs`;
- WP0.6D, WP0.6E, WP0.6F and WP0.7E work-package records.

## 1. Locked route identity

The Opening Route is the playable connective environment between the approved Apprentice Splicer Yard, the Master Lab and the Local Pit.

It must support two distinct progression readings:

1. early opening progression, where the player leaves the Yard to find Viktor at the Master Lab;
2. post-disaster progression, where the surviving player leaves the changed Master Lab, passes through the armed debt confrontation and continues towards the Local Pit.

The route must therefore feel like a real place that can be traversed in more than one story state, not a disposable corridor shown once.

## 2. Locked connectivity contract

### Yard to Route

The approved Yard exposes semantic exits targeting `master-lab-route`.

The replacement Route must provide a compatible arrival seam from the Yard. The exact Yard-side raster coordinates and the existing route-side target coordinate are not locked.

The player must not be able to enter the route before the opening onboarding has advanced to the `find-master` objective. This objective gate is semantic and must survive replacement.

### Route to Master Lab

The route must contain an unambiguous, reachable Master Lab entrance.

Entering the Master Lab remains an explicit interaction using the shared Action / interact semantic input. The Master Lab runtime owns gameplay while active and returns control to the route when the player exits.

The exact current exterior entry rectangle and exterior return coordinate are disposable implementation details. RSP-4/RSP-5 must reconnect the Lab runtime to a new semantic route anchor instead of retaining raw legacy coordinates.

### Master Lab back to Route

The Lab south exit / return function must remain available before and after the disaster. Returning from the Lab must place the player at a safe, readable route-side arrival point immediately associated with the Lab entrance.

The return must not place the player inside collision, inside the debt trigger, or in a location that instantly re-enters the Lab.

### Route to Local Pit

The route must contain a clear, reachable Local Pit hand-off after the debt-encounter staging area.

Entering the Local Pit remains an explicit interaction using the shared Action / interact semantic input. The Pit runtime owns gameplay while active and can return the player to the route.

The exact current `LOCAL_PIT_YARD_ENTRY_ZONE`, `LOCAL_PIT_YARD_RETURN` coordinate and legacy Pit-road boundary are disposable. Their semantic function is locked.

### Local Pit back to Route

Returning from the Local Pit must restore the player to a safe route-side arrival point associated with the Pit entrance, without immediately retriggering Pit entry.

## 3. Locked progression ordering

The replacement scene must support this opening order without requiring legacy geometry:

`Yard onboarding → find-master → Route → Master Lab → RinoCow disaster → persistent post-death Lab → splice-bench route-forward hand-off → Route debt encounter → Local Pit progression`

The route composition may allow spatial freedom, but it must not make the Local Pit the visually or mechanically dominant first destination during the initial `find-master` journey.

Post-disaster, the route from the Lab towards the Pit must naturally carry the player through the debt confrontation staging area before normal Pit progression. This ordering is semantic. It does not require reproducing the old south road or Old Toll coordinates.

## 4. Debt encounter contract

The route must expose a stable semantic encounter anchor with the role currently represented by `debt-encounter`.

Required behaviour:

- the encounter begins unavailable (`locked`);
- it becomes `armed` only after the post-death Lab state is active and the splice-bench route-forward hand-off has been used;
- while armed, the creditor representative is visibly waiting in the route scene;
- approaching the semantic encounter area automatically starts the encounter;
- the cutscene locks ordinary player control while dialogue runs;
- cancellation/failure returns the encounter to `armed` so it can retry safely;
- successful completion is one-way and prevents replay;
- completion confirms the inherited-debt story fact and preserves the existing story flags;
- the encounter remains in the normal Bright world. It must not use a Dark-layer cue merely to make the creditor threatening.

### Staging requirement

The authored Route must contain enough clear, believable ground for:

- the player to approach naturally from the Master Lab side;
- a waiting creditor representative to be visible before trigger entry;
- automatic trigger detection without accidental activation from unrelated nearby traversal;
- dialogue/cutscene composition at the locked 1280 × 720 gameplay view;
- portrait-mobile presentation with the movement/utility controls hidden during dialogue while ACTION remains usable.

The current Old Toll Lay-by is a staging **role**, not a mandatory visual design. RSP-1 may retain, reinterpret or replace the toll-lay-by idea if another composition fulfils the same story and gameplay function more convincingly.

## 5. Required semantic anchors

RSP-4/RSP-5 must author stable named semantic anchors or exits for at least:

- `yard-arrival` / Yard return seam;
- `master-lab-entrance`;
- `master-lab-return` arrival position;
- `debt-encounter` staging / trigger area;
- `local-pit-entrance`;
- `local-pit-return` arrival position.

Raw world coordinates must not be treated as the public contract. Runtime consumers should resolve these semantic anchors from the Route scene pack.

The existing `apprentice-yard`, `master-lab`, `debt-encounter` and `local-pit-route` landmark concepts remain useful compatibility meanings, but their current coordinate values and radii are not locked.

## 6. Traversal and collision contract

The authored Route must provide a continuous walkable progression path between its required semantic anchors.

Locked movement behaviour:

- four-direction protagonist movement;
- shared semantic input actions across keyboard and mobile;
- hold-to-run behaviour;
- feet-based collision and grounding consistent with the approved Yard character scale;
- collision must follow visible scene features;
- exits and interaction areas must be reachable without precision movement;
- the critical progression route must not contain blind collision traps, narrow sprite-scale choke points or decorative obstacles that read as traversable ground.

The replacement collision map must be authored from the selected raster. No requirement exists to retain current route blockers, waypoint coordinates or collision topology.

## 7. Mobile traversal contract

The Route must be comfortably traversable on portrait and landscape touch layouts.

RSP-1/RSP-4 must therefore provide:

- major paths visibly wider than the protagonist feet hitbox and forgiving under touch steering;
- destination entrances readable without relying on tiny signage;
- enough open approach space around Lab, encounter and Pit anchors to correct imperfect touch movement;
- no progression interaction that requires hovering on a one-pixel or visually ambiguous threshold;
- camera framing that keeps the player and immediate destination context readable despite mobile HUD overlays;
- debt dialogue presentation compatible with the existing mobile rule that hides movement/utility controls and retains ACTION.

## 8. Camera contract

The production gameplay view remains 1280 × 720 with smooth player-follow behaviour consistent with the Yard, Master Lab and Local Pit.

The replacement Route may use different world dimensions and camera bounds from `opening-world-v1`.

Locked camera semantics are:

- the player remains legible at approved protagonist scale;
- route entrances, encounter staging and destination approaches can be framed without exposing invalid void / unrendered space;
- camera bounds are derived from the authored scene, not inherited from the old 2920 × 1600 world;
- entering or returning from an overlay scene initialises the Route camera around the relevant safe arrival point without a disruptive jump to unrelated legacy coordinates.

## 9. Save / checkpoint audit

Current save schema v2 persists gameplay/domain progression such as avatar identity, player name, quest stage, creature/economy state and core progression. It does **not** persist:

- Opening Route world coordinates;
- camera position;
- route landmark coordinates;
- Master Lab / Local Pit overlay coordinates;
- `postDeathLabState` controller state;
- `debtEncounterState` controller state.

Therefore no save-compatibility requirement exists to preserve legacy Route geometry or raw coordinates.

RSP work must not silently worsen existing save behaviour. If later work introduces persistent route/story checkpoint state, it must use semantic scene/anchor identifiers rather than coupling saves to the retired `opening-world-v1` coordinate system.

## 10. Bright / Dark corruption contract

`route` remains a first-class environment capability with authored `bright` and `dark` states.

Locked behaviour:

- Bright is the normal steady presentation;
- Dark presentation is a matching authored counterpart of the same navigable scene and semantic anchors;
- story corruption can blend Bright → Dark → Bright using the shared environment visual controller;
- ordinary suppression rules and authored story-cue override rules remain intact;
- authored dark cues must obey the established omen / rupture / consequence story language;
- Bright must recover between authored cues;
- the debt collector encounter itself does not trigger Dark merely for threat presentation;
- Bright and Dark variants must preserve the same gameplay-critical walkability, exits and interaction meaning.

The current Pass D dark motifs, including contaminated drainage, organic road intrusion, damaged signage and Pit-bound residue, are visual-language references only. Their exact placement is disposable.

## 11. Presentation contract for RSP-1

The RSP-1 art brief must design the route holistically as one believable SplicePit place.

It should visually communicate:

- where the player has come from, with a credible connection back towards the Apprentice Yard;
- the Master Lab as the first strong destination during `find-master`;
- a plausible continuation towards the local Pit;
- a natural intermediate place where the creditor can wait and confront the player;
- rural / improvised biotech / animal-operation infrastructure consistent with the Yard and Master Lab rather than generic fantasy-road scenery;
- enough asymmetry, foreground depth, environmental storytelling and destination hierarchy to avoid reading as a board-game connector strip;
- a composition that remains understandable on mobile without depending on labels painted onto the ground.

RSP-1 is free to change the route shape, world dimensions, road directions, staging layout and environmental props to achieve this.

## 12. Explicitly disposable legacy implementation

The following are **not** production requirements for the authored Route replacement:

- `opening-world-v1` geometry identity;
- `YARD_WORLD_WIDTH = 2920` and `YARD_WORLD_HEIGHT = 1600` as Route dimensions;
- `OPENING_ROUTE_ENVIRONMENT_X = 1720` as the Yard/Route presentation boundary;
- current raw `OPENING_ROUTE_LANDMARKS` x/y coordinates and radii;
- `OPENING_ROUTE_WAYPOINTS` and their exact path sequence;
- the old east-road → south-road shape;
- current stream-bridge alignment as a compulsory route feature;
- current Master Lab exterior rectangle / doorway coordinates;
- current Old Toll booth, lamp/post, lay-by geometry and furniture placement;
- current Local Pit road alignment and hard boundary;
- Pass D drainage-channel placement, utility checkpoint, verge shapes and foreground tissue positions;
- the old procedural road rectangles and legacy environment underlay;
- `collisionTopology: 'unchanged'` from `ROUTE_PRODUCTION_ART_CONTRACT`;
- exact return coordinates currently exported by Master Lab and Local Pit world modules;
- tests whose only purpose is to prove the retired raw coordinates or old map dimensions.

Where tests currently assert these details, RSP-4/RSP-5 must replace them with semantic scene-pack assertions and end-to-end traversal checks.

## 13. What must survive replacement

A replacement is acceptable only if automated coverage can prove:

- the approved Yard can hand off into the Route after the correct objective gate;
- the Route can reach and enter the Master Lab;
- the Master Lab can return safely to the Route;
- post-death splice-bench progression still arms the debt encounter;
- the armed creditor is presented at the new semantic encounter anchor;
- approaching that anchor starts the existing one-way/retry-safe encounter lifecycle;
- the player can continue from the encounter to the Local Pit and enter it;
- the Local Pit can return safely to the Route;
- desktop and mobile semantic controls still work through all route transitions;
- the 1280 × 720 camera contract remains valid;
- Bright/Dark Route rendering uses the same scene geometry and semantic anchors;
- no procedural legacy Route art is visible beneath the authored production scene;
- existing save data does not depend on retired route coordinates.

## RSP-0 conclusion

The existing Route has important gameplay and story responsibilities, but almost none of its current spatial layout is intrinsically valuable.

RSP-1 should therefore start from the semantic topology:

`Yard ↔ Route ↔ Master Lab ↔ Route debt staging ↔ Local Pit`

and design the strongest believable authored scene around that topology rather than tracing `opening-world-v1`.

## Next package

`RSP-1 — Holistic Opening Route Art Brief / Composition Lock`
