# WP0.6E1 — Hold-to-Run Control

Status: **IMPLEMENTED**

Parent package: `WP0.6E — Master Lab Interior`

## Goal

Reduce traversal time during development, visual review and playtesting without changing the normal walking feel.

## Delivered control

- Keyboard: hold either Shift key while moving.
- Mobile: hold the on-screen `RUN` button while using the D-pad.
- Walking remains 180 world units/second.
- Running is 1.8× walking speed, 324 world units/second.
- Releasing RUN immediately returns movement to normal speed.

The control uses the shared semantic input layer rather than a test-only shortcut, so the same input contract works in both the Apprentice Yard/opening route and the Master Lab interior.

## Scope boundary

This package does not add stamina, sprint animation, gameplay costs, combat effects or a permanent toggle. RUN is currently a simple hold-to-move-faster convenience control.

A later movement/animation polish pass can decide whether running becomes a fully authored player mechanic. This package deliberately avoids coupling that future decision to the immediate testing need.

## Regression coverage

Automated coverage verifies:

- both Shift keys bind to the semantic RUN action;
- mobile exposes the RUN touch control;
- the displayed keyboard hint normalises to `SHIFT`;
- browser movement with RUN is materially faster than walking;
- the speed increase works in both the Yard and Master Lab;
- the mobile RUN button remains large enough for touch use and can be held simultaneously with movement.
