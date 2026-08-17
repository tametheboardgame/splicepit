# SplicePit World and Progression Plan

## 1. Role of the world

SplicePit is not a sequence of laboratory and arena menus. The world exists to give biological experimentation context, scarcity, discovery and consequences.

The world loop should make the player ask:

- What animal or trait might exist here?
- Who can help me obtain it?
- What do I need to risk, trade or accomplish?
- What new splice becomes possible if I succeed?
- What can that splice then let me do in the world or Fit Pits?

## 2. Locked RPG structure

- Most exploration is top-down 2D.
- Movement is spatial/tile-based in the Pokémon / classic Final Fantasy sense, without copying their visual identity.
- NPCs, quests, locations and interactable environments are major parts of play.
- The pit/lab acts as a persistent home base.
- The established opening leaves that pit damaged and the player under external pressure.

## 3. Narrative boundary

World systems may expose variables, quest hooks, dialogue conditions and progression gates. They must not invent the full storyline.

The engine should support authored story supplied later:

```text
story flags
quest states
NPC relationship/state
location state
pit state
Fit Pit rank/access
inventory/sample state
creature roster/history
```

Actual names, dialogue, chapter beats and story outcomes beyond the established opening remain separate authored content.

## 4. World structure — OPEN

The exact geography/region model has not been locked.

Possible structures include interconnected routes/settlements, larger regional maps, chapter hubs, or another authored arrangement. R0.5 should support the chosen structure without assuming an enormous seamless world.

Technical requirements regardless of final structure:

- stable location IDs
- map transitions
- persistent per-location state
- conditional interactables
- spawn/trigger control
- quest-aware NPC state
- return visits after progression changes

## 5. Location model — PLANNED

A location should be data-driven enough to define:

- map/visual asset reference
- collision/navigation
- entrances/exits
- interactables
- NPC placement/state rules
- encounter/sample opportunities
- ambience/music
- conditional changes
- quest triggers
- environmental tags relevant to biology if later used

Avoid putting quest logic directly into map-rendering code.

## 6. Dialogue system — PLANNED

Dialogue needs:

- stable dialogue/node IDs
- speaker metadata
- branching choices
- conditions based on quest/story/player state
- actions that set flags, start/advance quests, give/remove items, etc.
- localisation-ready text separation if practical
- skip/advance controls
- history/backlog only if later useful

The content format should remain human-editable because narrative text will be authored iteratively.

## 7. Quest system — PLANNED

Quests should be composable from objective types rather than custom code per quest.

Candidate objective types:

- speak to NPC
- visit location/trigger
- acquire item/sample
- obtain base animal
- inspect/sample animal
- deliver item/sample
- complete splice meeting conditions
- win/participate in Fit Pit bout
- interact with facility/object
- choose dialogue/state outcome

Quests may chain or branch. A quest should be able to reward world state changes, items, samples, money, access, pit upgrades or story flags.

## 8. Biological acquisition — OPEN DESIGN GATE

How the player obtains genes/base animals is central and must not collapse into “pick up glowing gene token”.

R0.5 should prototype acquisition modes such as:

- quest reward/access
- non-lethal sampling/collection
- buying/trading biological material
- scavenging/salvage
- arena rewards
- extraction from owned/defeated creatures if consistent with chosen tone
- specialist NPC services

The final mix should make different world activities valuable while keeping exploration and quests important.

## 9. Inventory model — PLANNED

Inventory should distinguish categories rather than use one generic item bag if the systems need different rules.

Potential domains:

- gene samples/biological material
- base animals / creature roster
- lab materials
- consumables
- quest items
- money/resources
- keys/access credentials

Actual categories remain adjustable. Stable item IDs and transaction APIs are required.

## 10. Creature roster/management — PLANNED FOR R1

The player will need a persistent way to manage created creatures.

Minimum likely information:

- creature identity/name
- base animal
- genes
- mutations
- phenotype preview
- stats/capabilities
- battle status/injury if used
- creation history
- Fit Pit history

Open questions include roster size limits, storage fiction, retirement/release, creature death and whether creatures can become gene sources.

## 11. Pit/base progression

The inherited pit should become more than a menu backdrop.

Potential facility domains:

- splice bench/lab capability
- diagnostics
- sample storage
- animal holding/recovery
- creature management
- Fit Pit administration/access
- repair/restoration

The actual upgrade tree is OPEN. The design rule is that major upgrades should change options, information or risk management rather than only add flat percentages.

## 12. Economy and pressure — OPEN

Crime/syndicate pressure is established as part of the setup, but the actual numbers and payment mechanics are not canon.

The economy must eventually account for:

- earning from Fit Pits/quests/other work
- spending on pit operation/upgrades
- cost of experimentation
- biological sample scarcity
- failure consequences
- external obligations/debt/pressure if used mechanically

The system should create meaningful trade-offs without turning the RPG into repetitive money grinding.

## 13. Progression philosophy

Progression should primarily broaden the player’s design space.

Good progression examples:

- access to a new base animal body plan
- access to a gene category
- better diagnostics revealing compatibility information
- ability to manage higher-complexity work
- new Fit Pit rules/opponents
- a facility enabling mutation analysis
- world access unlocked through authored quest progression

Less desirable as the main progression model:

- endless +5% damage upgrades
- linear replacement of old genes by strictly stronger coloured tiers
- raw level inflation that makes biological construction secondary

## 14. Player knowledge progression

The player should get better at SplicePit partly because they learn the system.

Potential mechanisms:

- lab records of prior attempts
- discovered compatibility notes
- NPC expertise
- diagnostics upgrades
- creature histories
- observed opponent traits

The game should support genuine experimentation while avoiding the need for external spreadsheets/wikis to understand basic cause and effect.

## 15. World consequences of creatures — FUTURE DESIGN

A valuable long-term direction is allowing creature biology to matter outside the arena where feasible.

Examples could include traversal, senses, environmental tolerance or quest interactions. This is not required for R0.5 and should not create uncontrolled scope before core systems are proven.

## 16. World/progression acceptance tests for R0.5

R0.5 should prove:

1. Player can travel between at least two authored locations.
2. NPC state persists across visits/save/load.
3. A data-defined quest can advance through multiple objective types.
4. Quest/world play produces a biological acquisition used by the lab.
5. Inventory transactions are persistent and validated.
6. A completed splice can be taken into a Fit Pit.
7. Fit Pit/world rewards can change pit/player progression.
8. At least one pit upgrade changes player options rather than only a stat number.
9. No authored quest requires custom scene code solely to function.
10. Story content can be replaced/expanded without rewriting the quest engine.
