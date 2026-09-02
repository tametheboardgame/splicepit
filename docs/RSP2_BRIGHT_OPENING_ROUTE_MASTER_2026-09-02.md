# RSP-2 — Bright Opening Route Master

Status: **COMPLETE — MASTER SELECTED**

Date: 2 September 2026

Authority: `docs/RSP1_HOLISTIC_OPENING_ROUTE_ART_BRIEF_2026-09-02.md`, `docs/work-packages/RSP-0_OPENING_ROUTE_SCENE_CONTRACT.md`, and `docs/SCENE_IMAGE_PROPAGATION_ROADMAP_2026-09-02.md`.

## Objective

Generate and select the single Bright Opening Route master image that becomes the visual source of truth for RSP-3 onward.

The selected scene must read as one believable SplicePit place first. Collision, semantic coordinates, exits and camera bounds remain deliberately deferred until production asset preparation and geometry authoring.

## Locked selection order

RSP-2 used the RSP-1 priority order:

1. holistic place-read;
2. story topology readability;
3. Viktor's Lab destination hierarchy;
4. debt encounter staging quality;
5. protagonist compatibility;
6. mobile traversal readability;
7. SplicePit specificity;
8. approved Yard compatibility;
9. camera rhythm;
10. foreground-separation potential;
11. Dark-state potential.

A visually stronger authored place was preferred over a composition that merely labelled story nodes more explicitly or would be easier to integrate technically.

## Generation pass

Four clean-environment directions were evaluated during RSP-2.

### Candidate A — selected

Generation ID: `36419539-1a20-4646-b1be-d92b04955e40`

This is the selected master.

Strengths:

- strongest holistic read as one working semi-rural biotech landscape rather than a route diagram;
- broad hooked / broken-S service-road flow with multiple natural traversal beats;
- Yard-side industrial/agricultural arrival language at lower-left;
- Viktor's Lab as the dominant architectural mass in the upper-right;
- a distinct offset weighbridge / inspection hardstanding suitable for the creditor encounter;
- a clear onward continuation beyond the encounter area towards the lower-right route edge;
- warm daylight, rural vegetation, patched roads, fencing, tanks, pipework and service infrastructure integrated into one coherent operating landscape;
- generous traversable ground and approach aprons suitable for later touch-friendly collision authoring;
- useful foreground-depth candidates around gantries, fences, tree edges, Lab infrastructure and inspection hardware;
- no protagonist, Viktor, creditor, UI or required gameplay text baked into the scene;
- strong Dark-state transformation hooks in drainage, vegetation, pipes, containment infrastructure and road repairs.

Trade-offs accepted for RSP-3 evaluation:

- the Lab exterior leans towards a greenhouse / institutional-biotech silhouette and must be checked against the exact Master Lab exterior language during production preparation;
- whole-scene generation is more compact than the eventual desired camera rhythm, so RSP-3 may upscale, crop, extend or otherwise prepare the raster to produce the required multi-camera world footprint without redrawing the composition to legacy coordinates;
- the far lower-right continuation is visually less explicit than the rejected labelled concepts, which is acceptable because the first-journey Pit destination is intentionally subordinate.

### Candidate B — rejected

Generation ID: `86ecfc24-2bec-44e7-baf8-791162f21174`

Rejected because it introduced baked destination labels, explicit route signage and a visually corrupted purple route feature in the Bright state. Although the story topology was very legible, the result became more map-like and less naturally authored.

### Candidate C — rejected

Generation ID: `ce75d403-cb1d-4fee-9431-107253663bea`

Rejected because the scene became too diagrammatic: Yard, Lab, weighbridge and Pit were presented as unusually isolated destination islands with readable labels. Traversal was generous, but the holistic-place score was lower than Candidate A.

### Candidate D — rejected

Generation ID: `1504c30a-0942-4ae9-b87a-03494a6b7fc6`

Rejected despite excellent debt-staging clarity. The explicit Lab / weighbridge / Pit labels, helipad-like infrastructure and stronger destination-node treatment pushed the composition towards a designed route board and away from the rural-biotech working-place brief.

## Canonical master identity

Selected Bright master:

- generation ID: `36419539-1a20-4646-b1be-d92b04955e40`;
- generated source dimensions: `1536 × 1024`;
- source mode: RGB;
- source format: PNG;
- source SHA-256 captured at selection: `7ecfd2078efec161133671f09dbdfa2f9deb52fffc30bae06f64a4078e0c5ad5`;
- selected composition name: **integrated hooked-service-route master**.

The generation identity and hash are the RSP-2 source-of-truth record. RSP-3 owns deterministic repository materialisation, final production dimensions, crop/extension decisions, decode validation and any minor paint repair required for production use.

## By-eye acceptance against RSP-1

### Holistic place-read — PASS

The environment reads as one connected rural-biotech operating landscape. Roads, fences, buildings, inspection infrastructure, vegetation and utilities have physical relationships rather than existing as separate prop islands.

### Story topology — PASS

The player can plausibly arrive from the lower-left, follow the service route towards the dominant Lab, leave the Lab into a subsequent route beat, pass the inspection/weighbridge staging area and continue towards the lower-right Pit direction.

### Lab hierarchy — PASS

The Lab is the strongest architectural mass and naturally attracts the eye before the onward route.

### Debt encounter staging — PASS

The inspection hardstanding is offset from the through-route, broad enough for the waiting creditor and player approach, and visually separated from the Lab threshold.

### Protagonist / mobile compatibility — PASS WITH RSP-3 SCALE CHECK

The main lanes and aprons are materially wider than the approved protagonist footprint. Exact raster/world scale remains an RSP-3 decision.

### SplicePit specificity — PASS

Agricultural service infrastructure, containment fencing, tanks, pipework, greenhouse/lab systems and obsolete inspection hardware are intrinsic to the scene rather than pasted decorative motifs.

### Yard continuity — PASS

The warm rural palette, industrial improvisation, vegetation density and service clutter plausibly continue from the approved YSP-10 Yard while becoming more ordered near the Lab.

### Camera rhythm — PASS IN COMPOSITION, DEFERRED TECHNICALLY

The scene contains the required Yard/Lab, Lab-turn and inspection/Pit spatial beats. RSP-3 must prepare a world footprint that allows the 1280 × 720 camera to experience those beats sequentially rather than exposing the entire master at once.

### Foreground and Dark-state potential — PASS

The selected geometry contains multiple useful depth and corruption hooks without pre-corrupting the Bright scene.

## RSP-3 preparation notes

RSP-3 should preserve the selected composition and solve production issues around it rather than redesigning the route.

Required preparation work includes:

- materialise the selected generation into deterministic repository-owned assets;
- choose the production world dimensions and scale needed for at least three camera-scale traversal beats;
- retain the lower-left Yard arrival, upper-right Lab hierarchy, offset inspection staging and lower-right Pit continuation;
- check that Lab architectural detailing remains consistent with the existing Master Lab visual language;
- remove or repair only genuine generation artefacts, not compositionally useful irregularity;
- establish deterministic hashes and decode validation;
- identify candidate exact-pixel foreground regions without creating broad masks over ordinary ground;
- do not author final collision, semantic anchors or trigger geometry until RSP-4/RSP-5.

## Completion gate

**RSP-2 COMPLETE.**

The Bright Opening Route master is selected. No legacy route coordinate or collision constraint has been reintroduced.

## Next package

`RSP-3 — Game-Ready Route Asset Preparation`
