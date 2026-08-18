# SplicePit Master Execution Roadmap

## Purpose

This is the canonical execution order for SplicePit. It answers **what gets built next, what is deliberately deferred, and what must be approved before later systems proceed**.

`DECISION_LOG.md` remains the authority for product decisions that are still explicitly locked. This roadmap controls development sequence. Where an older work-package document conflicts with this roadmap after the 18 August 2026 design reset, this roadmap wins.

The forward plan now contains **80 implementation work packages** from R0.2 through release candidate.

---

# 18 August 2026 design reset

Human review of the first splice-bench, combat-cadence and bright visual prototypes showed that continuing to polish those implementations would lock the project into the wrong game feel.

The new development order is therefore:

**visual identity → interface language → creature/player sprite design → workshop → opening flow → visual lock → splice redesign → battle redesign → world/progression → production presentation → authored pre-alpha**

The following are now explicitly **SUPERSEDED EXPERIMENTS**, not target designs:

- the current player-facing splice-bench flow;
- the current combat playtest/cadence UI and battle implementation;
- the oversized, highly saturated WP0.4C visual-pivot implementation;
- any assumption that existing prototype mechanics must be preserved because code already exists.

Useful domain code, tests, deterministic infrastructure and biological data may be reused. Reuse does **not** imply design approval.

No further splice or combat mechanic development should occur until the visual lock at WP0.4J passes.

---

# How to use this roadmap

A development conversation can start with a command such as:

> Start WP0.4C

The execution process should then:

1. read this roadmap;
2. read `DECISION_LOG.md`;
3. read the current WP contract from the file named below;
4. read only specialist design documents relevant to that WP;
5. re-check repository, open PR and CI state;
6. create a dedicated branch/PR unless the WP explicitly belongs to an existing one;
7. implement only the defined scope;
8. run the acceptance flow;
9. update decisions/docs only when a gate is deliberately resolved;
10. merge only when the WP gate passes and required human approval has been given.

Prototype implementation must never silently become canon.

---

# Work-package authority

- `work-packages/R0_FOUNDATIONS.md` — historical/technical contracts through WP0.4B only.
- `work-packages/R0_VISUAL_FIRST_REBASE.md` — **current authoritative contracts for WP0.4C through WP0.8H**.
- `work-packages/R1_ACT1.md` — WP1A through WP1I.
- `work-packages/R2_ACT2.md` — WP2A through WP2H.
- `work-packages/R3_BETA.md` — WP3A through WP3G.
- `work-packages/R4_RELEASE.md` — WP4A through WP4F.

If an older document assigns WP0.4C or later to a different purpose, it is superseded by `R0_VISUAL_FIRST_REBASE.md`.

---

# Status key

- **COMPLETE** — gate passed and merged.
- **READY** — next executable work.
- **PLANNED** — sequenced but later dependencies remain.
- **HUMAN GATE** — requires explicit visual/gameplay approval.
- **SUPERSEDED** — useful experiment/history only; do not continue as target design.

---

# R0.1 — First Playable Vertical Slice — COMPLETE

Browser viability and the minimum loop were proven. R0.1-specific mechanics, visuals and formulas are historical prototypes only.

---

# R0.2 — Architecture Hardening — COMPLETE

**Goal:** production browser/tooling/state/input/testing foundation.

1. **WP0.2A — Toolchain Migration**
2. **WP0.2B — Domain, IDs and Content Boundaries**
3. **WP0.2C — State, Save Versioning and Persistence Contract**
4. **WP0.2D — Semantic Input, UI Shell and Localisable Dialogue Framework**
5. **WP0.2E — Deterministic RNG, Diagnostics and CI Hardening**

**Release result:** typed, deterministic, versioned and testable foundation.

---

# R0.3 — Biological/Splicing Technical Prototype — COMPLETE AS TECHNICAL EXPERIMENT

**Goal achieved:** prove that cumulative biology, uncertain outcomes, research/material separation, mutations and phenotype composition are technically viable.

6. **WP0.3A — Source Package Taxonomy and Biological Data Model**
7. **WP0.3B — Physical Material, Reagents and Research-Knowledge Model**
8. **WP0.3C — Compatibility and Epistasis Engine**
9. **WP0.3D — Splice Resolution, Outcome Bands, Variance and Stability**
10. **WP0.3E — Cumulative Creature Biology and Capability Derivation**
11. **WP0.3F — Mutation Research Prototype**
12. **WP0.3G — Hybrid Phenotype Composition Prototype**
13. **WP0.3H — Lab Experimentation UX and Splicing Playtest Gate** — **player-facing UX/mechanic outcome superseded**.

**Important:** R0.3 domain work is reusable infrastructure. The current splice-bench gameplay is not approved and must not constrain the later WP0.5 redesign.

---

# R0.4 — Visual Identity, Player and Workshop Foundation — READY

**Goal:** make SplicePit look and feel like the right game before mechanics continue.

Historical experiments:

14. **WP0.4A — Combat Metrics and Capability Action Model** — technical experiment retained; combat design not locked by implementation.
15. **WP0.4B — Turn Structure and Action Economy** — **SUPERSEDED / NOT LOCKED**. Candidate cadence remains evidence only.

Current visual-first sequence:

16. **WP0.4C — Visual Direction Reset** — **READY / HUMAN GATE**
17. **WP0.4D — Interface Style System**
18. **WP0.4E — Creature and Player Sprite Design Pipeline**
19. **WP0.4F — Player Character Creation Prototype**
20. **WP0.4G — Workshop Scene Rebuild**
21. **WP0.4H — Opening Scene Rebuild**
22. **WP0.4I — Opening Flow and Presentation Integration**
23. **WP0.4J — Visual Direction Lock** — **HUMAN GATE**

## Locked direction for this phase

The target is **cartoon/animation quality, restrained rather than loud**:

- smaller, more intimate scale;
- high-quality small sprites with strong silhouettes and readable animation;
- controlled, slightly darker palette than the rejected bright pass;
- colourful accents rather than full-screen saturation;
- polished animation/game-art finish rather than painterly styling;
- workshop/laboratory atmosphere with eccentric mad-science detail;
- unsettling biological weirdness delivered through design and props rather than making the entire UI grotesque;
- interface integrated into the world rather than dominating it with giant panels.

The player should be able to customise their on-screen character to a meaningful degree, with those choices resolved into a coherent small sprite rather than an arbitrary collection of incompatible parts.

**R0.4 release gate:** title/opening/player/workshop/interface/sprite language feels like one deliberate game and receives explicit human approval. Splice and battle mechanics remain deferred until this gate passes.

---

# R0.5 — Core Mechanic Redesign — PLANNED

**Goal:** redesign the defining mechanics from first principles against the approved visual/game-feel baseline.

24. **WP0.5A — Splice Mechanics Design Reset** — conversation/design/spec first; identify the actual player decisions, testing loop, risk, pacing and information model before coding the bench.
25. **WP0.5B — Splice Bench Interaction Prototype** — implement only the newly approved splice model and validate it through human playtest.
26. **WP0.5C — Battle Mechanics Design Reset** — revisit cadence, spatial presentation, actions, resource pressure, readability and stakes after splice design is understood.
27. **WP0.5D — Battle Interaction Prototype** — implement only the newly approved battle model and validate it through human playtest.

**R0.5 release gate:** both central mechanics are explicitly accepted as enjoyable/readable. Existing R0.3/R0.4 mechanic prototypes are references, not requirements.

---

# R0.6 — World, Quests, Acquisition and Pit Progression — PLANNED

**Goal:** connect the approved player/workshop/splice/battle experience into the actual RPG loop.

28. **WP0.6A — Authored World/Map Runtime**
29. **WP0.6B — Dialogue, NPC and Relationship State**
30. **WP0.6C — Quest, Story Clock and Branch-State Framework**
31. **WP0.6D — Acquisition, Inventory and Economy Framework** — Buy / Harvest / Win / Trade.
32. **WP0.6E — Test Stock, Housing and Physical Creature Handling**
33. **WP0.6F — Pit Upgrade Framework**
34. **WP0.6G — Fit Pit Ladder, Circuits and Reward Progression Framework**
35. **WP0.6H — Integrated World Loop Prototype**

**R0.6 release gate:** leave workshop → acquire material/animals → experiment → prepare/fight → earn/upgrade → progress works end-to-end without bespoke scene hacks.

---

# R0.7 — Production Presentation Pipeline — PLANNED

**Goal:** turn the approved visual prototype into a scalable production-quality asset/UI/audio pipeline.

36. **WP0.7A — Production Art Specification and Content-Warning Treatment**
37. **WP0.7B — Environment, Player and NPC Asset Pipeline** — locks tile/sprite/camera/animation metrics from the approved R0.4 direction.
38. **WP0.7C — Production Creature Phenotype Renderer**
39. **WP0.7D — Production UI, World and Dialogue Pass**
40. **WP0.7E — Production Lab and Combat Presentation**
41. **WP0.7F — Audio, Settings, Accessibility and Localisation Runtime**
42. **WP0.7G — Asset Performance and Presentation Integration Gate**

**R0.7 release gate:** production assets replace temporary prototype drawing without changing the approved visual language.

---

# R0.8 — Integrated Pre-Alpha Slice — PLANNED

**Goal:** prove all foundations together in one intentionally authored, production-quality slice.

43. **WP0.8A — Pre-Alpha Content Lock and Slice Manifest**
44. **WP0.8B — Opening Disaster and Emergency Starter**
45. **WP0.8C — Inherited Workshop/Pit Production Location**
46. **WP0.8D — Starting Hub and Routes**
47. **WP0.8E — Authored Acquisition and Experimentation Loop**
48. **WP0.8F — First Fit Pit, Debt Pressure and Early Upgrades**
49. **WP0.8G — Save, Onboarding and End-to-End Integration**
50. **WP0.8H — Structured Pre-Alpha Playtest and Hardening**

**R0 gate:** a fresh player understands the intended game from play, the opening/workshop/creatures feel visually coherent, and no high-severity foundational blocker remains.

---

# R1 — Alpha 1 / Complete Act 1 — PLANNED

**Goal:** first complete authored chapter.

51. **WP1A — Act 1 Canon and Production Content Lock**
52. **WP1B — Act 1 Geography and Environmental Content**
53. **WP1C — Act 1 NPCs, Dialogue, Relationships and Suspicion Arc**
54. **WP1D — Act 1 Base Animals, Source Packages and Biological Content Roster**
55. **WP1E — Act 1 Quests, Acquisition Economy and Optional Work**
56. **WP1F — Act 1 Fit Pit Circuit and Water/Air Introduction**
57. **WP1G — Act 1 Pit Upgrades, Training, Recovery and Creature Management**
58. **WP1H — Debt Deadline and Paid/Unpaid Act 1 Resolution**
59. **WP1I — Alpha 1 Integration, Balance, Onboarding and QA**

**Release gate:** a fresh player can complete Act 1 through either major debt outcome with no progression/save blocker.

---

# R2 — Alpha 2 / Act 2 Expansion — PLANNED

60. **WP2A — Act 2 Branch Architecture and Content Lock**
61. **WP2B — Independent/Free Act 2 Route**
62. **WP2C — Creditor-Controlled Act 2 Route**
63. **WP2D — Water, Air and Specialist Circuit Expansion**
64. **WP2E — Advanced Biology, Rare Bases and Mutation Research Content**
65. **WP2F — Advanced Pit, Training, Recovery and High-Risk Competition**
66. **WP2G — Act 2 Progression, Economy and Branch Convergence Tuning**
67. **WP2H — Alpha 2 Integration, Scale, Save and Performance QA**

**Release gate:** both major Act 2 routes are completable, meaningfully different and primarily content/data expansion rather than core-engine rewrites.

---

# R3 — Content-Complete Beta — PLANNED

68. **WP3A — Content Completion and Canon Audit**
69. **WP3B — Splicing, Knowledge and Biological Balance Pass**
70. **WP3C — Combat, Arena and Pit Balance Pass**
71. **WP3D — Economy, Progression and Branch-Coherence Pass**
72. **WP3E — UX, Accessibility, Controller and Localisation Beta Pass**
73. **WP3F — Browser Performance, Asset and Compatibility Beta Pass**
74. **WP3G — Full-Game Beta Regression and Feature Freeze Gate**

**Release gate:** intended content is present, major routes repeatedly complete and development enters feature freeze except blocker-driven change.

---

# R4 — Release Candidate — PLANNED

75. **WP4A — Release Feature Freeze, Defect Triage and RC Branch Discipline**
76. **WP4B — Save Compatibility, Migration and Failure Recovery Certification**
77. **WP4C — Deployment, Rollback and Browser Compatibility Certification**
78. **WP4D — Legal, Licensing, Credits, Warning and Attribution Closure**
79. **WP4E — Final Performance, Presentation and Localisation Polish**
80. **WP4F — Release Candidate Full-Game Certification**

**Release gate:** exact deployed artifact has no unresolved release-blocking defect, save corruption, progression blocker or supported-platform failure.

---

# Current decision gates

- **DG-VISUAL-DIRECTION:** lock in WP0.4J. This is now the immediate priority.
- **DG-PLAYER-SPRITE:** character customisation scope, sprite proportions, animation language and export/composition rules lock across WP0.4E–F.
- **DG-SPLICE-PLAY:** current bench is superseded; the player-facing splice loop must be redesigned in WP0.5A and accepted in WP0.5B.
- **DG-BATTLE-PLAY:** current battle/cadence implementation is superseded; battle must be redesigned in WP0.5C and accepted in WP0.5D.
- **DG-ARENA-THRESHOLDS:** Land/Water/Air functional qualification remains a later mechanic decision after battle redesign.
- **DG-INJURY-RISK:** exact competition injury/death model remains later tuning.
- **DG-WORLD:** final Act 1 geography/names lock no later than WP1A; subset approved for R0.8.
- **DG-CREDITOR / DG-DEBT / DG-UPGRADES:** lock at the latest safe authored-content gate, not during the visual reset.
- **DG-MUSIC:** final supplied music remains separable from the current visual/mechanic work.

---

# Parallelism rule

Do not parallelise work that is still defining the contract consumed by the next package.

In particular:

- do not build more splice mechanics during WP0.4C–J;
- do not build more battle mechanics during WP0.4C–J;
- do not expand world content before the visual lock and mechanic redesigns are accepted;
- do not mass-produce sprites/assets before WP0.4E establishes the sprite language.

Technical cleanup that does not constrain design may continue when it is required by the active WP.

---

# Change-control rule

Playtest rejection is evidence, not failure. When a prototype reveals that the direction is wrong, stop extending it, record what was learned, supersede it explicitly and move the roadmap back to the earliest unresolved design contract.

The 18 August 2026 reset is an intentional application of this rule.