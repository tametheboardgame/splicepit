# SplicePit Master Execution Roadmap

## Purpose

This is the master build sequence for SplicePit. It answers **what gets built, in what order, and what constitutes completion**.

Detailed WP contracts live under `docs/work-packages/`. Game-system intent lives in the specialist design documents. `DECISION_LOG.md` is authoritative when any document disagrees about what is locked versus open.

R0.1 is complete and merged. The forward plan contains **74 implementation work packages** from R0.2 through release candidate.

---

# How to use this roadmap

A future development conversation can start with a command such as:

> Start WP0.2A

The execution process should then:

1. read `DECISION_LOG.md`;
2. read the WP contract in the relevant `docs/work-packages/*.md` file;
3. read only the specialist design documents referenced by that WP;
4. re-check current repository/CI state;
5. create a dedicated branch/PR unless the WP explicitly belongs to an existing one;
6. implement only the defined scope;
7. run the required tests/acceptance flow;
8. update documentation/decision log for any deliberately resolved design gate;
9. merge only when the WP gate passes and approval/merge policy permits.

A WP must not convert a PROVISIONAL proposal into canon just because implementation needs placeholder content. Temporary content remains labelled.

---

# Planning hierarchy

## Authoritative design

- `DECISION_LOG.md` — locked/open decisions.
- `MASTER_PLAN.md` — product pillars/development rules.
- `SPLICING_SYSTEM.md` — splicing intent.
- `COMBAT_SYSTEM.md` — Fit Pit combat intent.
- `WORLD_PROGRESSION.md` — world/progression intent.
- `TECHNICAL_ARCHITECTURE.md` — architecture intent.
- `CONTENT_AND_PRESENTATION.md` — visual/audio/UI/content intent.
- `TEST_STRATEGY.md` — quality strategy.

## Execution contracts

- `work-packages/R0_FOUNDATIONS.md` — WP0.2A through WP0.7H.
- `work-packages/R1_ACT1.md` — WP1A through WP1I.
- `work-packages/R2_ACT2.md` — WP2A through WP2H.
- `work-packages/R3_BETA.md` — WP3A through WP3G.
- `work-packages/R4_RELEASE.md` — WP4A through WP4F.

## Approved/provisional content references

- `OPENING_CONTENT_PROPOSAL.md` — historical filename; Rabbit/Goat/Pig and the ten opening source packages are now LOCKED.
- `PIT_UPGRADE_TREE_PROPOSAL.md` — nine domains locked; detailed tiers/costs/dependencies still subject to approval/tuning.
- `WORLD_MAP_PROPOSAL.md` — structural world proposal, still PROVISIONAL.
- `ACT1_STORY_FRAMEWORK.md` — authorised Act 1 structure with exact story details still subject to locking.
- `CREDITOR_FACTION_PROPOSAL.md` — The Clearing House proposal, still PROVISIONAL until explicitly approved.

---

# Status key

- **COMPLETE** — gate passed and merged.
- **READY** — dependencies/decisions sufficient to begin.
- **PLANNED** — sequenced but dependencies remain.
- **DECISION GATE** — cannot ship dependent authored content until an explicit decision is made.

---

# R0.1 — First Playable Vertical Slice — COMPLETE

Purpose achieved: prove browser viability and the minimum loop. R0.1-specific combat, economy, visual styling and stat formulas remain prototype-only unless separately promoted.

---

# R0.2 — Architecture Hardening — READY

**Goal:** replace the quick proof architecture with the production foundation while preserving behaviour.

1. **WP0.2A — Toolchain Migration** — Vite + strict TypeScript + pinned Phaser + `dist` deployment.
2. **WP0.2B — Domain, IDs and Content Boundaries** — stable schemas/IDs, validation, Phaser-independent domain model.
3. **WP0.2C — State, Save Versioning and Persistence Contract** — R0.2 becomes first supported save schema.
4. **WP0.2D — Semantic Input, UI Shell and Localisable Dialogue Framework** — keyboard-first, controller/touch-ready, localisation-ready.
5. **WP0.2E — Deterministic RNG, Diagnostics and CI Hardening** — seeded simulation and reproducible testing.

**Release gate:** typed/versioned/validated/deterministic foundation; R0.1 behaviour still playable; browser deployment green.

---

# R0.3 — Real Splicing Prototype — PLANNED

**Goal:** prove the defining uncertain, irreversible, cumulative experimentation system.

6. **WP0.3A — Source Package Taxonomy and Biological Data Model**
7. **WP0.3B — Physical Material, Reagents and Research-Knowledge Model**
8. **WP0.3C — Compatibility and Epistasis Engine**
9. **WP0.3D — Splice Resolution, Outcome Bands, Variance and Stability**
10. **WP0.3E — Cumulative Creature Biology and Capability Derivation**
11. **WP0.3F — Mutation Research Prototype**
12. **WP0.3G — Hybrid Phenotype Composition Prototype**
13. **WP0.3H — Lab Experimentation UX and Splicing Playtest Gate**

**Release gate:** player can test on common animals, improve knowledge, consume real material and then risk a valued creature with a non-guaranteed individual outcome.

---

# R0.4 — Fit Pit Combat Prototype — PLANNED

**Goal:** prove turn-based capability combat where preparation and tactical play both matter.

14. **WP0.4A — Combat Metrics and Capability Action Model**
15. **WP0.4B — Turn Structure and Action Economy** — resolves final internal turn cadence.
16. **WP0.4C — Training and Individual Skill Expression**
17. **WP0.4D — Status, Injury, Recovery and Pit Danger**
18. **WP0.4E — Land, Water and Air Functional Eligibility** — functional flight/swimming required; multi-environment qualification allowed.
19. **WP0.4F — Multi-Creature and Special-Bout Architecture**
20. **WP0.4G — Opponent Construction and AI**
21. **WP0.4H — Balance Harness and Combat Playtest Lock**

**Release gate:** biology determines available actions; environment eligibility is functional; combat is tactically readable; no obvious universal build/action dominates.

---

# R0.5 — World, Quests, Acquisition and Pit Progression — PLANNED

**Goal:** connect lab + arena into the complete RPG loop.

22. **WP0.5A — Authored World/Map Runtime**
23. **WP0.5B — Dialogue, NPC and Relationship State**
24. **WP0.5C — Quest, Story Clock and Branch-State Framework**
25. **WP0.5D — Acquisition, Inventory and Economy Framework** — Buy / Harvest / Win / Trade.
26. **WP0.5E — Test Stock, Housing and Physical Creature Handling**
27. **WP0.5F — Pit Upgrade Framework** — nine locked domains, data-driven dependencies.
28. **WP0.5G — Fit Pit Ladder, Circuits and Reward Progression Framework**
29. **WP0.5H — Integrated World Loop Prototype**

**Release gate:** leave pit → acquire/test material → splice/train/fight → earn/upgrade → advance quest/debt state works end-to-end without bespoke scene hacks.

---

# R0.6 — Production Presentation Pipeline — PLANNED

**Goal:** establish production art/UI/audio/accessibility before large content volume.

30. **WP0.6A — Art Direction, Tone and Content-Warning Specification**
31. **WP0.6B — Environment and Character Asset Pipeline** — locks tile/sprite/camera metrics.
32. **WP0.6C — Production Creature Phenotype Renderer**
33. **WP0.6D — UI Design System and World/Dialogue Production Pass**
34. **WP0.6E — Lab and Combat Production UI**
35. **WP0.6F — Audio, Settings, Accessibility and Localisation Runtime**
36. **WP0.6G — Asset Performance and Presentation Integration Gate**

**Release gate:** scalable production presentation replaces prototype scene art/UI without blocking final user-supplied music.

---

# R0.7 — Integrated Pre-Alpha Slice — PLANNED

**Goal:** prove all foundations together in one intentionally authored production-quality slice.

37. **WP0.7A — Pre-Alpha Content Lock and Slice Manifest**
38. **WP0.7B — Opening Disaster and Emergency Starter**
39. **WP0.7C — Inherited Pit Production Location**
40. **WP0.7D — Starting Hub and Routes**
41. **WP0.7E — Authored Acquisition and Experimentation Loop**
42. **WP0.7F — First Fit Pit, Debt Pressure and Early Upgrades**
43. **WP0.7G — Save, Onboarding and End-to-End Integration**
44. **WP0.7H — Structured Pre-Alpha Playtest and Hardening**

**Decision gates before/inside WP0.7A:** approve the subset of provisional world-map, pit-upgrade and Act 1 details used by the slice. Final whole-game debt balance is not required yet.

**R0 gate:** a new player understands the real core game from play, not explanation, and no high-severity foundational blocker remains.

---

# R1 — Alpha 1 / Complete Act 1 — PLANNED

**Goal:** turn the pre-alpha systems into the first genuine complete authored chapter.

45. **WP1A — Act 1 Canon and Production Content Lock**
46. **WP1B — Act 1 Geography and Environmental Content**
47. **WP1C — Act 1 NPCs, Dialogue, Relationships and Suspicion Arc**
48. **WP1D — Act 1 Base Animals, Source Packages and Biological Content Roster**
49. **WP1E — Act 1 Quests, Acquisition Economy and Optional Work**
50. **WP1F — Act 1 Fit Pit Circuit and Water/Air Introduction**
51. **WP1G — Act 1 Pit Upgrades, Training, Recovery and Creature Management**
52. **WP1H — Debt Deadline and Paid/Unpaid Act 1 Resolution**
53. **WP1I — Alpha 1 Integration, Balance, Onboarding and QA**

**Decision gates resolved by WP1A:**
- final Act 1 geography/names;
- creditor identity/culture/terms, including approval/replacement of The Clearing House;
- debt currency/amount/deadline/default terms;
- exact reason first booked bout must be honoured;
- Act 1 cast/opponents/suspicion beats;
- approved early pit-upgrade tiers.

**Release gate:** fresh player can complete Act 1 through either paid or unpaid debt outcome with no external instructions or high-severity progression/save blocker.

---

# R2 — Alpha 2 / Act 2 Expansion — PLANNED

**Goal:** prove scale, specialisation and genuinely different post-debt routes.

54. **WP2A — Act 2 Branch Architecture and Content Lock**
55. **WP2B — Independent/Free Act 2 Route**
56. **WP2C — Creditor-Controlled Act 2 Route**
57. **WP2D — Water, Air and Specialist Circuit Expansion**
58. **WP2E — Advanced Biology, Rare Bases and Mutation Research Content**
59. **WP2F — Advanced Pit, Training, Recovery and High-Risk Competition**
60. **WP2G — Act 2 Progression, Economy and Branch Convergence Tuning**
61. **WP2H — Alpha 2 Integration, Scale, Save and Performance QA**

**Release gate:** both major Act 2 routes are completable, meaningfully different and primarily expanded through content/data rather than core-engine rewrites.

---

# R3 — Content-Complete Beta — PLANNED

**Goal:** stop inventing and make the intended full game complete, balanced and repeatedly finishable.

62. **WP3A — Content Completion and Canon Audit**
63. **WP3B — Splicing, Knowledge and Biological Balance Pass**
64. **WP3C — Combat, Arena and Pit Balance Pass**
65. **WP3D — Economy, Progression and Branch-Coherence Pass**
66. **WP3E — UX, Accessibility, Controller and Localisation Beta Pass**
67. **WP3F — Browser Performance, Asset and Compatibility Beta Pass**
68. **WP3G — Full-Game Beta Regression and Feature Freeze Gate**

**Release gate:** intended content is present and major routes repeatedly complete; development enters feature freeze except blocker-driven change.

---

# R4 — Release Candidate — PLANNED

**Goal:** certify the exact release artifact; do not expand scope.

69. **WP4A — Release Feature Freeze, Defect Triage and RC Branch Discipline**
70. **WP4B — Save Compatibility, Migration and Failure Recovery Certification**
71. **WP4C — Deployment, Rollback and Browser Compatibility Certification**
72. **WP4D — Legal, Licensing, Credits, Warning and Attribution Closure**
73. **WP4E — Final Performance, Presentation and Localisation Polish**
74. **WP4F — Release Candidate Full-Game Certification**

**Release gate:** exact deployed artifact has no unresolved release-blocking defect, save corruption, progression blocker or supported-platform failure.

---

# Cross-cutting decision gates

These are intentionally **not** required before WP0.2A. They are resolved at the latest safe point:

- **DG-SPLICE-TAXONOMY:** exact six-class schema — resolved/prototyped in WP0.3A.
- **DG-MATERIAL-ECONOMY:** quantities/reagents/storage — prototype in WP0.3B, production balance later.
- **DG-SPLICE-DISTRIBUTION:** exact compatibility/outcome/stability formulas — WP0.3C–D then tune R3.
- **DG-TURN-STRUCTURE:** alternating/initiative/action-speed cadence — lock in WP0.4B.
- **DG-ARENA-THRESHOLDS:** functional qualification rules — lock prototype in WP0.4E.
- **DG-INJURY-RISK:** exact Pit danger/injury/death rules — prototype WP0.4D; production tuning R1/R2/R3.
- **DG-WORLD:** final geography/hub names — must be locked for Act 1 in WP1A; subset approved earlier for R0.7.
- **DG-CREDITOR:** creditor faction identity/terms — must be locked in WP1A; The Clearing House is current proposal.
- **DG-DEBT:** currency, amount and deadline — must be locked in WP1A before WP1H; temporary values allowed in R0.7.
- **DG-UPGRADES:** detailed tree/tier/costs — framework in WP0.5F; early production tiers locked in WP1A.
- **DG-ART-METRICS:** tile/sprite/camera metrics — lock in WP0.6B.
- **DG-WARNING:** final warning/disclaimer wording — production treatment in WP0.6A; legal closure in WP4D.
- **DG-MUSIC:** final music content — supplied separately when ready; integration architecture exists from WP0.6F.

---

# Parallelism rules

The roadmap is ordered, but not every WP must be serial.

Safe examples once dependencies are satisfied:

- content-schema work and save work can overlap after WP0.2B interfaces stabilise;
- phenotype work can proceed alongside later splicing UX after its data contract is stable;
- map/dialogue/quest framework WPs can overlap once shared state contracts are agreed;
- environment/character pipeline and production phenotype pipeline can run in parallel after art direction locks;
- authored content WPs in R1/R2 can be divided by region/system once canon manifests are locked.

Do **not** parallelise work that is still deciding the contract another WP consumes. In particular, do not build large content volumes while the source schema, combat action model, save contract or map/quest data format is still moving.

---

# Change-control rule

Playtesting will create new work. When it does:

- a defect/small hardening task can become a patch WP under the relevant release (for example `WP0.3H1`);
- a material design change must first update `DECISION_LOG.md` and affected system docs;
- a new major feature should be placed in the earliest dependency-correct release rather than bolted onto the current WP;
- R3/R4 scope expansion requires explicit reopening of feature freeze.

The roadmap is a control structure, not a promise that learning will stop.

---

# Deferred / Post-Release Backlog

Not dependencies for the initial release unless explicitly promoted:

- native/mobile wrapper;
- cloud accounts/saves;
- multiplayer/PvP;
- player-to-player creature trading/sharing;
- modding/editor tooling;
- procedural world generation;
- runtime generative-AI creature art;
- large backend/service architecture.

Do not carry architectural complexity for these features until a real requirement exists.
