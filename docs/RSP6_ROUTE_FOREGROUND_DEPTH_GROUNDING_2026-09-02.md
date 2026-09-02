# RSP-6 — Route Foreground Depth / Character Grounding

Date: 2 September 2026

Status: complete pending merge gate

## Purpose

Make the protagonist read as physically embedded in the authored Bright Opening Route without repainting the approved RSP-2/RSP-3 scene and without introducing broad foreground masks over traversable ground.

RSP-6 does not activate the scene-image Route in production. RSP-7 remains responsible for the Dark counterpart and production renderer replacement.

## Locked input

RSP-6 inherits the complete RSP-5 semantic scene contract and therefore does not change:

- the 3072 × 2049 Route world;
- the 1024 × 683 Bright source raster or 3× mapping;
- collision geometry;
- player feet hitbox;
- camera bounds;
- Yard, Master Lab or Local Pit exits;
- semantic anchors or safe return positions;
- `find-master` objective routing;
- debt encounter placement or trigger semantics.

## Visual depth audit

The approved Bright Route was reviewed specifically for structures that can legitimately pass in front of the protagonist.

Four foreground cases are authored:

1. `master-lab-entry-front-frame`
   - the lower entrance frame and threshold structure around Viktor's Lab;
   - allows the protagonist to tuck naturally under the entrance architecture while approaching the Lab interaction.

2. `weighbridge-west-rail`
   - the narrow west-side rail/machinery edge of the decommissioned weighbridge;
   - provides depth when the protagonist passes behind the structure without masking the weighbridge deck.

3. `weighbridge-booth-front`
   - the solid front face of the inspection booth;
   - supports walk-behind depth around the debt encounter area.

4. `local-pit-gate-front`
   - the foreground gate structure on the Local Pit approach;
   - grounds the return/approach lane without covering the open dirt road.

The Yard-side chain-link gate was deliberately not turned into a rectangular exact-base crop. Its open mesh would require a more precise alpha mask to avoid erasing the protagonist through the fence holes. No such mask is needed for the current Route acceptance gate.

## Anti-mask rule

RSP-6 uses `exact-base-pixel-regions` and keeps the combined crop area below five per cent of the authored Route world.

Representative open-ground probes remain outside every foreground crop:

- Yard-side road;
- central route junction;
- centre of the debt encounter staging ground;
- Local Pit road.

This is a regression requirement. A future edit must not solve depth by redrawing ordinary road, grass, dirt or the weighbridge deck over the protagonist.

## Depth sorting

Each foreground structure owns a feet-based `sortY` line.

- player feet behind the structure: its exact Bright-base crop is redrawn after the protagonist;
- player feet in front of the structure: the crop is not redrawn after the protagonist.

The reusable runtime helper reads the same source-to-world scale as the scene pack and redraws only the active authored crops with image smoothing disabled.

## Contact grounding

RSP-6 adds one restrained scene-level contact shadow:

- feet offset: -4 px;
- horizontal radius: 20 px;
- vertical radius: 6 px;
- alpha: 0.22.

The shadow is tied to the protagonist's feet and is intentionally smaller and lighter than a generic blob shadow.

## Runtime boundary

`src/environment/routeDepthGroundingRuntime.ts` provides renderer-agnostic Bright Route helpers for:

- contact-shadow drawing;
- exact-base foreground redraw;
- returning active occluder IDs for runtime/debug verification.

RSP-7 can consume these helpers when the authored Route becomes production-active. RSP-6 itself does not alter the current production renderer.

## Automated gate

RSP-6 tests require that:

- all RSP-5 geometry and semantic contracts remain byte-for-byte structurally equivalent;
- only the four audited structural occluders are present;
- foreground crop area remains below five per cent of the world;
- representative road/staging probes are not masked;
- feet-based sort activation is deterministic;
- contact shadow dimensions and alpha remain restrained.

## Result

RSP-6 completes the Bright Route depth/grounding contract without reopening art, geometry or story integration.

Next: RSP-7 — Authored Dark Route + Production Replacement.
