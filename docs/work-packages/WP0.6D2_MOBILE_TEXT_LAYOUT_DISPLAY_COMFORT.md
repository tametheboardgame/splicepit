# WP0.6D2 — Mobile Text Layout & Display Comfort

Status: **IMPLEMENTED — VALIDATION PENDING**

Authoritative insertion: `docs/OPENING_VERTICAL_SLICE_ROADMAP_2026-08-26_MOBILE_LAYOUT_INSERT.md`

## Goal

Remove the remaining phone-playtest blocker before WP0.6E by keeping objective/tutorial text readable in portrait and landscape while retaining the accepted world/camera scale.

## Implementation

- Mobile objective/tutorial cards now use `src/ui/mobileGameplayHud.ts`, a responsive DOM HUD driven by the existing opening debug/runtime state.
- Touch devices no longer draw duplicate objective/tutorial cards into the scaled 1280 × 720 canvas; desktop/keyboard devices keep the existing canvas HUD unchanged.
- Portrait placement uses phone safe areas and reserves the lower control footprint.
- Landscape placement gives objective/tutorial cards a compact top band clear of both touch-control clusters.
- Objective text hides while Bag/Map shells are open, while tutorial prompts can remain visible when needed to teach Confirm/Back.
- Touch hint labels and tutorial fade/completion state are retained.
- `src/settings/displaySettings.ts` adds a persistent `Dim Screen` preference.
- The Settings screen now exposes `Dim Screen`, `Full Screen`/`Exit Full Screen`, and Back.
- Full Screen uses the browser Fullscreen API and therefore remains user-gesture driven rather than persisted.

## Regression coverage

Automated coverage verifies:

- Settings keyboard/pointer navigation for Dim Screen, Full Screen and Back;
- portrait mobile HUD cards stay inside the viewport and clear the touch controls;
- landscape mobile HUD cards remain visible and clear both control clusters;
- mobile HUD text retains a minimum readable CSS font size;
- no horizontal overflow is introduced;
- Dim Screen applies and persists across reload;
- Full Screen capability is surfaced through Settings;
- the existing WP0.6D1 touch-only onboarding and Yard → Master Lab route regression continues to run unchanged.

## Scope boundary

This package does not redesign Bag/Map shells or future story-dialogue presentation. Those should adopt the responsive mobile text pattern when their real content requires it.

## Next package

After green validation and merge: `WP0.6E — Master Lab Interior`.
