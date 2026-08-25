# SplicePit Autonomous Delivery Policy

Status: **LOCKED**

This file records the default delivery rule for SplicePit implementation work.

## Merge-to-live rule

When a work package, graphics pass, remediation package or other implementation unit is finished and all applicable automated validation gates are green, it should be merged to `main` without waiting for a separate human approval step.

The purpose is to make the completed work available on the normal live Cloudflare deployment so human review happens against the integrated live build, not against a temporary PR preview.

## Default execution sequence

1. Branch from current `main`.
2. Implement the scoped work.
3. Add or update appropriate automated tests/regressions.
4. Run the repository validation gates.
5. Fix failures until the applicable gates are green.
6. Open a PR when useful for CI/deployment/review traceability.
7. Merge the completed green work to `main` automatically.
8. Treat human review on the live build as feedback for a follow-up remediation package if changes are required.

## Exceptions

Do not merge automatically only when one of the following applies:

- an automated gate is failing or has not completed;
- there is a genuine unresolved technical or product blocker;
- the user has explicitly instructed that a particular package must remain unmerged;
- merging would knowingly break `main` or invalidate an already locked contract;
- a required external dependency or deployment prerequisite is unavailable and makes the implementation incomplete.

A roadmap phrase such as "human visual gate", "review before merge", or equivalent from older planning material does **not** override this newer policy unless the user explicitly reintroduces that requirement for a specific package.

## Review model

Human visual/playtest review remains important, but by default it occurs after merge on the live deployment. Negative review feedback should produce a targeted fix/remediation package rather than requiring completed work to remain on a branch.

Locked by user instruction on 25 August 2026.
