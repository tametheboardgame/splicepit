# YSP-9 — Mobile / Performance / Regression Hardening

Date: 31 August 2026
Status: ACTIVE — implementation and full browser gate in progress

## Purpose

Harden the merged YSP-7/YSP-8 authored Bright/Dark Apprentice Splicer Yard before the YSP-10 human visual decision gate.

YSP-9 does not redesign the Yard and does not convert the Opening Route or Local Pit to scene images. Its job is to prove that the accepted Yard scene-image architecture is technically stable enough to place in front of the user for final visual judgement.

## Locked inputs

YSP-9 inherits without visual redesign:

- production canvas/world: **1280 × 720**;
- Bright Yard identity: **177,808 bytes**, SHA-256 `6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb`;
- Dark Yard identity: **143,796 bytes**, SHA-256 `f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b`;
- YSP-4 collision and feet hitbox;
- YSP-5 semantic anchors and Master Lab tunnel handoff;
- YSP-6 foreground depth and contact grounding;
- YSP-7 production scene-image renderer;
- YSP-8 coherent Bright/Dark transition contract;
- existing Bag / Map / Action / objective / tutorial / save and story semantics.

## Asset lifecycle hardening

The Bright base, transparent foreground staging layer and Dark base form one atomic production dependency.

YSP-9 memoises their decoded `HTMLImageElement` set for the lifetime of the page. Returning from the Yard to character selection and re-entering the Yard must reuse those decoded surfaces rather than allocating and decoding another three full-size images.

Failure behaviour remains recoverable: a failed atomic preload clears the memoised promise so a later production attempt can retry rather than permanently caching rejection.

The runtime exposes explicit lifecycle evidence:

- preload request count;
- cache-hit count;
- decode-start count;
- successful-load count;
- failed-load count;
- last local decode duration;
- decoded-memory budget information.

## Memory / source budget

The two authored compressed base images total:

- Bright: 177,808 bytes;
- Dark: 143,796 bytes;
- combined authored bases: **321,604 bytes**.

For conservative decoded-surface accounting, YSP-9 treats all three 1280 × 720 production image surfaces as 32-bit RGBA:

`1280 × 720 × 4 × 3 = 11,059,200 bytes`

The locked conservative decoded budget is **12 MiB / 12,582,912 bytes** for those three surfaces.

This is a guardrail, not a claim that every browser uses exactly that amount of internal memory.

## Rendering hardening

Requirements:

- scene-image rendering remains nearest/un-smoothed (`imageSmoothingEnabled = false`);
- Bright and Dark bases retain exact alignment;
- foreground crops use the same transition mix as the base pass;
- no legacy Pass-D/procedural Yard appears during normal rendering or transitions;
- Bright ↔ Dark transitions do not change player position or camera;
- repeated Yard entry does not trigger another full asset decode;
- local decode time is recorded, while CI only uses a generous catastrophic-regression ceiling rather than pretending a hosted runner is a stable FPS benchmark.

## Mobile acceptance

YSP-9 retains existing detailed mobile layout and touch suites and adds targeted scene-image checks for both portrait and landscape orientations.

Required:

- no horizontal page overflow;
- scene canvas stays horizontally contained by the viewport;
- ACTION and RUN remain visible touch targets at least 44 × 44 CSS pixels;
- scene image smoothing remains disabled after viewport changes;
- forced Dark Yard remains coherent on mobile;
- changing visual state or orientation does not move player/camera state;
- Bag UI remains usable under the existing corruption-suppression contract: opening the shell temporarily presents Bright while preserving the forced Dark state, and authored Dark resumes after the shell closes;
- touch-only onboarding and Master Lab tunnel traversal continue to pass.

## Traversal regression hardening

YSP-8 exposed a pre-existing browser-test weakness: several tests used fixed-duration or overly loose axis waypoints through the narrow corridor beside the pit retaining wall.

The shared authored-Yard browser helper now targets the actual safe centre of that corridor (`y = 392`, tolerance 4) before moving east to the visible Master Lab tunnel. Mobile traversal uses the same adaptive geometry-safe helper while still generating movement exclusively through the visible touch D-pad.

This is test hardening, not a gameplay geometry change.

## Existing regression coverage retained

The full player-facing suite still covers:

- title and mobile title;
- menu and settings;
- narration;
- protagonist selection and rename;
- all four protagonist Yard presentation;
- Bright/Dark Yard visual transition;
- Route production art and tunnel handoff;
- tutorial sequence;
- Bag and Map shells;
- opening objective progression;
- touch gameplay and mobile HUD layout;
- Master Lab and Local Pit;
- run controls;
- ambient corruption;
- cutscene runtime;
- RinoCow disaster and mobile presentation;
- post-death Lab state;
- debt collector encounter;
- cross-location opening visual integration;
- isolated scene-image contract smoke.

## Gate

YSP-9 is complete only when:

1. typecheck/content/RNG/unit/build gates pass;
2. exact Bright and Dark asset validation still passes;
3. the complete player-facing browser suite passes;
4. the targeted YSP-9 lifecycle/mobile hardening smoke passes;
5. repeated Yard entry proves cache reuse with no additional image decodes;
6. decoded-surface budget remains within 12 MiB;
7. portrait and landscape checks remain presentation-safe;
8. no new soft lock, traversal regression, visual fallback or story/UI regression is present.

Once complete, the roadmap must advance to **YSP-10 — Yard Scene-Image Human Gate**.

No Opening Route or Local Pit scene-image conversion begins before the user explicitly passes YSP-10.
