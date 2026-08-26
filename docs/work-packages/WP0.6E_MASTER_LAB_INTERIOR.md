# WP0.6E — Master Lab Interior

Status: **IMPLEMENTED**

Authoritative parent: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-25.md`

## Goal

Turn the WP0.6D Master's Lab exterior into a proper playable interior that can carry the opening cutscene work which follows without forcing the room to be rebuilt again.

The lab must already provide convincing spatial staging for:

- Viktor's opening cutscene;
- RinoCow containment and the later fatal incident;
- the future splice-bench tutorial;
- a visibly changed post-death room state.

WP0.6E supplies the environment and runtime seam only. It does not fire the RinoCow event or implement the later story beat.

## Delivered room

The Master Lab is a 1960×1200 authored interior rendered at the locked 1280×720 gameplay view.

The room includes:

- a south entrance and return doorway to the Yard;
- a central Viktor demonstration floor with clear player/camera staging;
- an eastern RinoCow containment bay with tank, monitoring console and husbandry/biotech dressing;
- a western primary splice bay reserved for the later splice tutorial;
- specimen-preparation benches and labelled containment jars;
- source-library cold storage;
- floor tanks, overhead pipework, status lights and warning signage;
- strong material separation across tile, steel, glass, wood and biological fluids;
- environmental jokes and labelling that keep the bright monster-RPG surface while leaving room for the darker layer beneath it.

## World transition

The WP0.6D exterior remains physically unchanged.

When the player is standing in the authored interaction zone immediately outside the Master's door, the existing Action input enters the lab. The lab then owns movement and interaction until the player returns to the south doorway, at which point control is handed back to the existing Yard runtime at the same exterior location.

The transition is implemented as a dedicated gameplay canvas layer loaded before the opening runtime. This deliberately avoids rewriting the accepted Yard movement/tutorial/save path and keeps keyboard and mobile semantic inputs on the same action contract.

## Opening shell continuity

Inside the lab:

- movement keeps the same speed/facing contract as the Yard;
- Action remains the interaction control;
- Back/Escape closes an open shell first and can leave through the authored exit;
- Bag remains available;
- Map remains available;
- the opening objective remains `Find your Master` until the later narrative package advances it.

## Future staging contract

`src/world/masterLab.ts` exposes stable authored stage identifiers:

- `entry`;
- `master-stage`;
- `rinocow-containment`;
- `splice-bench`;
- `aftermath-focus`.

These are deliberately separated from story scripting so R0.7 can target stable positions without coupling cutscene logic to raw art coordinates.

## Post-death visual preparation

The renderer accepts two room states:

- `pre-disaster`;
- `aftermath`.

WP0.6E runs only `pre-disaster` during normal play. The dormant `aftermath` rendering path already changes the demonstration floor, containment damage, biological spill/debris and splice-bay details so WP0.7 can switch the environment after the fatal RinoCow event without rebuilding the room.

This package does not itself trigger that state.

## Scope boundary

WP0.6E does **not** add:

- Viktor NPC dialogue or cutscene runtime;
- the RinoCow fatal incident;
- combat;
- the dark-layer corruption/flicker transition;
- post-death objective progression;
- debt collectors;
- a functioning splice-bench tutorial or the rebuilt splice UX;
- the Local Pit foundation.

Those remain assigned to later roadmap packages.

## Regression coverage

Automated coverage verifies:

- the lab exceeds the gameplay viewport and preserves the locked 1280×720 view;
- all five authored staging points exist and are walkable;
- entrance → Viktor, Viktor → RinoCow and Viktor → splice-bench paths remain traversable;
- the exterior entrance and interior exit interaction zones remain explicit;
- walls and the RinoCow tank remain physically solid;
- the browser runtime renders a visually dense lab canvas;
- Bag and Map remain available inside the room;
- real movement reaches the Viktor and RinoCow staging zones;
- leaving the lab hands control back to the Yard runtime.

## Next package

`WP0.6F — Local Pit Foundation`
