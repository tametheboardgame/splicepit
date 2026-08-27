# WP0.6M — Final Opening Visual Integration + Pass B Sign-off

## Scope

This is the final Graphics Tightening Pass B integration gate defined by `GRAPHICS_TIGHTENING_PASS_B_ROADMAP_2026-08-26.md`.

It reviews the completed Yard, opening route, Master Lab and Local Pit as one opening-world presentation rather than as four independent art packages.

## Integration review

The completed WP0.6H–WP0.6K environments already align on the contracts that matter for cross-location consistency, so this package does not introduce a gratuitous fifth redraw pass.

The final review confirms that all four locations:

- use the shared WP0.6G environment material vocabulary;
- retain the accepted 1280 × 720 gameplay presentation;
- retain the accepted 64 × 96 protagonist presentation scale;
- expose genuine authored bright and dark states;
- retain unchanged collision topology;
- keep Yard and route on the same `opening-world-v1` geometry contract;
- keep Master Lab and Local Pit on their explicit interior geometry contracts;
- meet the shared production-detail and dark-storytelling quality floor;
- use the WP0.6L corruption runtime rather than location-specific competing dark-state systems.

No individual environment was found to require structural art rework to meet the locked Pass B contract.

## Final automated integration gate

WP0.6M adds a single cross-location contract and browser gate so later work cannot silently make one location drift away from the others.

The gate checks:

- material and production-art contract consistency across all four locations;
- 1280 × 720 canvas presentation in every environment;
- bright visual density in every environment;
- materially distinct authored dark presentation in every environment;
- physical Yard → route traversal using the accepted collision path;
- objective/Bag UI compatibility with deliberately authored corruption;
- clean recovery to the bright layer;
- player position, zone and staging immutability through visual corruption;
- Local Pit entry corruption coexistence with the shared ambient runtime;
- mobile visual-stack alignment between the active environment and corruption overlay;
- the existing repository browser suite for controls, collision, overlays, Lab/Pit hand-offs and mobile presentation.

## Sign-off rule

Under `AUTONOMOUS_DELIVERY_POLICY.md`, this package is eligible for automatic merge when all applicable CI and browser gates are green. Human visual/playtest review then occurs on the integrated live Cloudflare deployment; any subjective art feedback becomes a targeted remediation package rather than holding completed green work off `main`.

## R0.6 / Pass B gate

Pass B is signed off when the merged package has green automated validation and the live deployment contains:

1. authored production-quality Yard, route, Master Lab and Local Pit environments;
2. authored bright and dark states for all four locations;
3. one coherent shared material/depth language;
4. location-correct ambient corruption with clean recovery;
5. stable traversal, collision, controls and opening UI;
6. Lab and Pit presentation suitable for the upcoming story/mechanics packages without structural environment redraw.

After this gate, roadmap execution moves to **WP0.7A — Cutscene Runtime**. WP0.7C must reuse the shared corruption system for RinoCow story timing rather than create a second dark-layer runtime.
