# LPSP-3 Execution Recovery Plan

Status: ACTIVE

Date: 6 September 2026

Purpose: finish LPSP-3 in small, independently verifiable execution windows so progress is never ambiguous if a tool/session stalls.

## Operating rule

Each execution window should perform one small mutation or one validation only. After every successful step, record the exact branch/head state before moving on.

## Sequence

1. Repair the truncated canonical LPSP-3 asset source only.
2. Verify the repaired source decodes to exactly 250,783 bytes and SHA-256 `ee9fe9b78c0165131abb3e014177e39cc52d7c5595266fefb10f3ee9092d8b81`.
3. Run the LPSP-3 materialisation/verification scripts only.
4. Run exact-head CI as a separate step.
5. Fix only genuine failures exposed by that exact-head CI run, one failure class at a time.
6. Update LPSP-3 status/roadmap only after validation is green.
7. Finalise PR/merge-readiness and record the exact commit SHA.

## Scope guardrails

- Do not regenerate, repaint, annotate, crop or otherwise alter the approved Bramble Pit artwork.
- The approved LPSP-2 source identity remains authoritative: generation ID `29a7292d-3e04-45ce-9cb9-62d68c458eea`, source SHA-256 `751b46842e0630a5cba646f13f5e170a8aae81ee94b21b6f119f32ad014dc6ce`.
- The generated annotated map is reference-only and must never replace the approved master or production derivative.
- Do not implement LPSP-4 collision, walkability, semantic coordinates or battle boundaries during LPSP-3 recovery.
- Do not cut the new Pit scene into production runtime during LPSP-3 recovery.

## Current known blocker

The existing canonical Base64 source on the LPSP-3 branch is truncated. The expected production derivative is a 1024 × 683 JPEG, 250,783 bytes, SHA-256 `ee9fe9b78c0165131abb3e014177e39cc52d7c5595266fefb10f3ee9092d8b81`.

## Completion condition

LPSP-3 is complete only when the exact branch head passes source validation, deterministic materialisation, dist verification and browser decode smoke, after which roadmap/status documentation is updated and the package is ready for merge.
