# SplicePit Work Packages — R4 / Release Candidate

R4 is a stability phase. New features are out of scope unless a release-blocking defect cannot be solved without a narrowly bounded implementation change.

---

## WP4A — Release Feature Freeze, Defect Triage and RC Branch Discipline

**Depends on:** R3 accepted.

**Purpose:** Stop scope expansion and establish the release-blocking defect policy.

**Deliverables:**
- freeze production content/features;
- severity/priority criteria for RC defects;
- classify all known beta defects as blocker/fix/defer;
- branch/PR rules for RC changes;
- regression requirements for every RC fix;
- final supported-platform statement draft.

**Gate:** only release-blocking or explicitly approved stability changes enter the RC line.

## WP4B — Save Compatibility, Migration and Failure Recovery Certification

**Depends on:** WP4A.

**Purpose:** Treat player saves as a release contract.

**Deliverables:**
- all supported historical save fixtures migrate to RC;
- corrupt/partial-write recovery tests;
- backup/rollback handling verified;
- branch/quest/creature history/material knowledge integrity checks after migration;
- generated phenotype/seed stability checks;
- documentation of deliberately unsupported pre-R0.2 saves.

**Gate:** no supported save fixture loses critical progression, creatures, splice history or branch state during migration/recovery.

## WP4C — Deployment, Rollback and Browser Compatibility Certification

**Depends on:** WP4A–B.

**Purpose:** Make release deployment repeatable and reversible.

**Deliverables:**
- production Cloudflare Pages build configuration documented;
- release/tag/version process;
- rollback to prior known-good deployment tested;
- cache/versioning strategy verified;
- final supported browser/device matrix executed;
- clean-install and update paths tested;
- production error-page/failure behaviour reviewed.

**Gate:** an RC can be deployed and rolled back through documented steps without rebuilding from an unknown local state.

## WP4D — Legal, Licensing, Credits, Warning and Attribution Closure

**Depends on:** WP4A.

**Purpose:** Ensure every shipped dependency/asset/content notice is legally and editorially accounted for.

**Deliverables:**
- third-party library licence audit;
- art/audio/font/asset provenance audit;
- credits and attribution requirements completed;
- adult-content/fictional animal-harm warning/disclaimer final wording approved and presented;
- privacy/telemetry statement if any data collection was introduced;
- removal/replacement of assets without acceptable release rights.

**Gate:** no known shipped asset/library lacks a documented acceptable licence/provenance and required warnings/credits are present.

## WP4E — Final Performance, Presentation and Localisation Polish

**Depends on:** WP4B–D.

**Purpose:** Close non-feature quality issues that materially affect release experience.

**Deliverables:**
- final performance-budget verification;
- art/audio consistency pass;
- final supplied music integration and mix if available;
- SFX/volume/default settings review;
- localisation source completeness and fallback checks;
- controller/keyboard/settings defaults;
- typo/layout/content-placeholder audit;
- only low-risk polish changes allowed.

**Gate:** final presentation contains no known placeholder/prototype assets or high-severity performance/localisation defects.

## WP4F — Release Candidate Full-Game Certification

**Depends on:** WP4A–E.

**Purpose:** Make the final go/no-go decision from evidence rather than assumption.

**Deliverables:**
- repeated clean-save completion of all required major branches;
- representative specialist/generalist/arena paths;
- migrated-save completion tests;
- full automated suite and browser smoke green;
- known-defect list with explicit acceptance of any non-blockers;
- final release notes/version/tag;
- production deployment verification after the exact release artifact is published.

**Gate:** no unresolved release-blocking defect, save corruption, progression blocker or supported-platform failure remains. The exact release artifact has been played and verified after deployment.

### R4 release gate

The RC is approved for release only after the exact deployed artifact passes certification. A late feature request returns to post-release planning rather than bypassing freeze.
