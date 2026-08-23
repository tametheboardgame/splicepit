# SplicePit Master Execution Roadmap

## Purpose

This is the canonical execution order for SplicePit. It answers **what gets built next, what is deliberately deferred, and what must be approved before later systems proceed**.

`DECISION_LOG.md` remains the authority for locked product decisions. This roadmap controls development sequence. `docs/VISUAL_DIRECTION_2026-08-23.md` is the authority for the currently locked visual target.

Where older documents, prototype scenes, tests or work-package descriptions conflict with this roadmap after the 23 August 2026 graphics-first reset, **this roadmap wins**.

The forward plan contains 80 implementation work packages from R0.2 through release candidate. Work-package names inside R0.4 were rebased on 23 August 2026 without changing later numbering.

---

# 23 August 2026 graphics-first reset

Human review confirmed that the underlying SplicePit idea remains strong, but the existing player-facing visual implementations do not represent the game we want to build.

The approved direction is now anchored by:

- `docs/VISUAL_DIRECTION_2026-08-23.md`;
- `docs/visual-reference/splicepit-protagonists-biotech-v2.webp`.

The immediate development order is:

**approved protagonist art direction → production-ready player sprite sheets → four-character selection → Apprentice Splicer Yard → movement/collision/depth/camera polish → HUMAN PLAYTEST STOP → only then expand presentation/systems**

The first successful playable is intentionally tiny:

`Boot → Character Select → Apprentice Splicer Yard`

The player chooses **Milo, Theo, Ada or Pip**, enters a name, loads into the new yard and can walk around beautifully.

No splice system, battle system, economy, quest flow or large menu system should be added before this walking-around gate is accepted.

## Explicitly superseded visual work

The following are not target designs and must not be extended:

- the old `VisualDirectionScene` presentation;
- the existing player-facing Lab/Splice/Battle presentation;
- the previous oversized/high-saturation visual pivot;
- the old dark-terminal presentation language;
- giant web-style cards/panels as the dominant interface;
- procedural placeholder art that conflicts with the locked visual direction;
- previous visual-reference boards removed on 23 August 2026;
- the prior WP0.4D Interface Style System contract;
- the prior WP0.4E combined Creature and Player Sprite Design Pipeline contract;
- the prior WP0.4F modular Character Creation Prototype contract;
- any assumption that existing player-facing code must survive because it already exists.

Useful domain logic, deterministic systems, save infrastructure, content models, input abstractions and technical tests may be reused when genuinely presentation-independent. Reuse does **not** imply visual or gameplay approval.

---

# How to use this roadmap

A development conversation should begin with the next READY work package, currently:

> Start WP0.4D

The execution process should then:

1. read this roadmap;
2. read `docs/VISUAL_DIRECTION_2026-08-23.md`;
3. read `DECISION_LOG.md`;
4. read the current WP contract from `work-packages/R0_VISUAL_FIRST_REBASE.md`;
5. re-check repository, open PR and CI state;
6. create a dedicated branch/PR unless the WP explicitly belongs to an existing one;
7. implement only the defined scope;
8. run the acceptance flow;
9. stop at human gates rather than self-approving subjective art/game-feel decisions;
10. merge only when the WP gate passes.

Prototype implementation must never silently become canon.

---

# Work-package authority

- `work-packages/R0_FOUNDATIONS.md` — historical/technical contracts through WP0.4B only.
- `work-packages/R0_VISUAL_FIRST_REBASE.md` — **current authoritative contracts for WP0.4C through WP0.8H**.
- `work-packages/R1_ACT1.md` — WP1A through WP1I.
- `work-packages/R2_ACT2.md` — WP2A through WP2H.
- `work-packages/R3_BETA.md` — WP3A through WP3G.
- `work-packages/R4_RELEASE.md` — WP4A through WP4F.

If an older document assigns WP0.4C or later to a different purpose, it is superseded.

---

# Status key

- **COMPLETE** — gate passed and merged.
- **READY** — next executable work.
- **PLANNED** — sequenced but later dependencies remain.
- **HUMAN GATE** — requires explicit visual/gameplay approval.
- **SUPERSEDED** — evidence/history only; do not continue as target design.

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

R0.3 domain work is reusable infrastructure. Its player-facing splice-bench experience is not approved and must not constrain the later redesign.

---

# R0.4 — Graphics-First Player and World Foundation — IN PROGRESS

**Goal:** prove that choosing a protagonist and moving around a small SplicePit environment already feels like the right videogame before more systems return.

Historical experiments:

14. **WP0.4A — Combat Metrics and Capability Action Model** — technical experiment retained; combat design not locked by implementation.
15. **WP0.4B — Turn Structure and Action Economy** — **SUPERSEDED / NOT LOCKED**.

Current authoritative graphics-first sequence:

16. **WP0.4C — Visual Direction and Protagonist Lock** — **COMPLETE**
17. **WP0.4D — Runtime Protagonist Sprite Production** — **READY**
18. **WP0.4E — Character Selection and Identity Persistence** — **PLANNED**
19. **WP0.4F — Apprentice Splicer Yard Rebuild** — **PLANNED**
20. **WP0.4G — Movement, Collision, Depth and Camera Polish** — **PLANNED**
21. **WP0.4H — Graphics-First Playable Gate** — **HUMAN GATE**
22. **WP0.4I — Post-Gate Presentation Expansion** — **PLANNED, MUST NOT START BEFORE WP0.4H APPROVAL**
23. **WP0.4J — Visual Direction Lock for Mechanic Re-entry** — **HUMAN GATE**

## WP0.4C result — LOCKED

The approved visual target is documented in `docs/VISUAL_DIRECTION_2026-08-23.md`.

Locked player-facing direction:

- premium original GBA-era top-down RPG readability;
- 24 × 32 px protagonist frames;
- nearest-neighbour scaling;
- four directions;
- one idle + three walk frames per direction;
- four authored protagonists: Milo, Theo, Ada and Pip;
- cute-but-concerning apprentice gene-splicer styling;
- warm attractive environments containing increasingly questionable biotech detail;
- compact UI that does not dominate the world;
- no return to the removed earlier visual reference.

## WP0.4D–H immediate milestone

### WP0.4D — Runtime Protagonist Sprite Production

Produce clean runtime sheets for Milo, Theo, Ada and Pip on a fixed grid. The generated concept sheets are references only, not directly sliced runtime assets.

**Gate:** all four characters animate cleanly at actual in-game size and remain recognisable without enlarged concept-art detail.

### WP0.4E — Character Selection and Identity Persistence

Build a minimal four-character chooser.

Required:

- Milo / Theo / Ada / Pip selection;
- simple live sprite preview;
- player name entry;
- persisted `avatarId` and player name;
- save/load returns the same protagonist;
- no mechanical differences between protagonists;
- no broad modular appearance creator yet.

**Gate:** selecting and saving a protagonist is reliable and visually coherent.

### WP0.4F — Apprentice Splicer Yard Rebuild

Build a completely new small top-down environment from the approved reference rather than reskinning the old Lab scene.

Required visual ingredients:

- workshop/lab building;
- grass and dirt paths;
- trees, shrubs, flowers and strange plants;
- water feature and small bridge where appropriate;
- crates/barrels/specimen tables;
- fenced test pens/cages;
- creature-husbandry/containment details;
- improvised biotech props;
- enough clear walking space to judge movement.

No major gameplay systems are implemented here.

**Gate:** the environment already looks like a specific SplicePit location rather than generic prototype scenery.

### WP0.4G — Movement, Collision, Depth and Camera Polish

Required:

- responsive four-direction movement;
- correct directional walk/idle animation;
- collision against buildings, fences, trees, water and props;
- sensible player hitbox/feet origin;
- layered depth so the player can move behind canopies/awnings/tall props where appropriate;
- smooth camera follow;
- nearest-neighbour pixel presentation without shimmer/blur;
- keyboard baseline using existing semantic input architecture.

**Gate:** moving around feels pleasant without needing another system to make it interesting.

### WP0.4H — Graphics-First Playable Gate

This is a **hard stop**.

The playable should effectively be:

`Boot → Character Select → Apprentice Splicer Yard`

Human review must approve:

1. protagonist size and readability;
2. character choice presentation;
3. walking responsiveness;
4. animation personality;
5. camera behaviour;
6. collision/depth feeling;
7. environment richness;
8. biotech wrongness / SplicePit specificity;
9. overall desire to keep moving around even when there is nothing else to do.

If this gate fails, return to WP0.4D–G. Do not compensate by adding systems.

## WP0.4I–J after the walking gate

These remain intentionally narrower and later than before the reset.

**WP0.4I — Post-Gate Presentation Expansion** may only begin after WP0.4H approval. Its exact scope must be revalidated against the playtest. Likely work includes minimal title/opening integration, dialogue/interface proof and first creature visual proof, but none of those should constrain the walking prototype beforehand.

**WP0.4J — Visual Direction Lock for Mechanic Re-entry** confirms that the player/world/sprite/UI language is coherent enough for splice-mechanic redesign to resume.

**R0.4 release gate:** the visual/game-feel baseline receives explicit human approval. Splice and battle mechanics remain deferred until WP0.4J passes.

---

# R0.5 — Core Mechanic Redesign — PLANNED

**Goal:** redesign the defining mechanics from first principles against the approved visual/game-feel baseline.

24. **WP0.5A — Splice Mechanics Design Reset** — design/specification first; identify actual player decisions, testing loop, risk, pacing and information model before coding the bench.
25. **WP0.5B — Splice Bench Interaction Prototype** — implement only the newly approved splice model and validate it through human playtest.
26. **WP0.5C — Battle Mechanics Design Reset** — revisit cadence, spatial presentation, actions, resource pressure, readability and stakes after splice design is understood.
27. **WP0.5D — Battle Interaction Prototype** — implement only the newly approved battle model and validate it through human playtest.

**R0.5 release gate:** both central mechanics are explicitly accepted as enjoyable/readable. Existing mechanic prototypes are references, not requirements.

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
37. **WP0.7B — Environment, Player and NPC Asset Pipeline**
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

- **DG-GRAPHICS-FIRST-PLAYABLE:** immediate hard gate at WP0.4H. Choosing a protagonist and simply walking around must feel good before presentation or mechanics expand.
- **DG-PLAYER-SPRITE:** 24 × 32 frame contract, four authored protagonists and four-direction idle/walk language are locked for the current prototype; production adjustments require explicit human approval.
- **DG-PLAYER-CUSTOMISATION:** broad modular appearance customisation is deferred. Current choice is Milo/Theo/Ada/Pip plus player-entered name.
- **DG-VISUAL-DIRECTION:** final mechanic-re-entry lock occurs at WP0.4J after the graphics-first playable is accepted.
- **DG-SPLICE-PLAY:** current bench is superseded; player-facing splice loop must be redesigned in WP0.5A and accepted in WP0.5B.
- **DG-BATTLE-PLAY:** current battle/cadence implementation is superseded; battle must be redesigned in WP0.5C and accepted in WP0.5D.
- **DG-ARENA-THRESHOLDS:** Land/Water/Air functional qualification remains a later mechanic decision after battle redesign.
- **DG-INJURY-RISK:** exact competition injury/death model remains later tuning.
- **DG-WORLD:** final Act 1 geography/names lock no later than WP1A; subset approved for R0.8.
- **DG-CREDITOR / DG-DEBT / DG-UPGRADES:** lock at the latest safe authored-content gate, not during the graphics-first rebuild.
- **DG-MUSIC:** final supplied music remains separable from current visual/mechanic work.

---

# Parallelism rule

Do not parallelise work that is still defining the contract consumed by the next package.

In particular:

- WP0.4D → E → F → G are sequential;
- WP0.4H is a hard human stop;
- do not build WP0.4I or later presentation work before WP0.4H approval;
- do not build more splice mechanics during WP0.4C–J;
- do not build more battle mechanics during WP0.4C–J;
- do not expand world content before the visual lock and mechanic redesigns are accepted;
- do not mass-produce NPC/creature/environment assets before the graphics-first gate validates scale and movement.

Technical cleanup that does not constrain design may continue only when required by the active WP.

---

# Change-control rule

Playtest rejection is evidence, not failure. When a prototype reveals that the direction is wrong, stop extending it, record what was learned, supersede it explicitly and move the roadmap back to the earliest unresolved design contract.

The 23 August 2026 graphics-first reset deliberately removes prior visual planning that could pull implementation back toward the rejected presentation. The approved biotech-apprentice reference and walking-around milestone are now the path forward.