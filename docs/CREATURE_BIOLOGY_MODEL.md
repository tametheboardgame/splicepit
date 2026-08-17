# Cumulative Creature Biology Prototype Contract

## Status

This document records the WP0.3E implementation contract for irreversible creature history and capability derivation.

The product rules are LOCKED: creatures accumulate irreversible biological history, later splices operate on the already-modified animal, and Land / Water / Air qualification must come from functional capability rather than attempted source labels.

The numeric expression-function thresholds and the small R0.3 arena-hook bridge introduced here are **PROTOTYPE / TUNABLE**. They do not close `CR-OPEN-01`; final environment qualification belongs to WP0.4E.

## Persistent history, derived present

A creature's ordered splice history is the biological source of truth. Each persisted attempt now records:

- sequence and attempt identity;
- source packages and consumed material lots;
- resolved outcome band;
- stability before and after the attempt;
- complexity added by that attempt;
- mutation / injury / death consequence flags;
- every candidate expression and whether it actually established;
- resolved magnitude, completeness, efficiency, reliability and local stability;
- biological tags and phenotype hooks created by established expression;
- capability hooks and whether the expression passed the prototype functional gate.

The current creature state is derived from this cumulative record rather than treating the latest splice as an equipped loadout.

## Functional expression

An attempted source package does not grant capabilities.

An individual resolved expression is considered functionally capable in the R0.3 prototype only when it:

1. actually expressed; and
2. meets all prototype minimums for magnitude, completeness, efficiency, reliability and local stability.

The current prototype minimums are deliberately tuning values:

- magnitude: 0.20;
- completeness: 0.35;
- efficiency: 0.30;
- reliability: 0.35;
- local stability: 0.25.

A visible but unreliable wing expression can therefore contribute phenotype/history while granting no flight capability.

## Capability derivation

Base-animal capability hooks are treated as functional baseline biology.

Functional splice expressions add capability IDs derived from their capability hooks. Non-functional or rejected expressions add no capability ID. Capability IDs are consequently evidence of current function, not evidence that a source package was attempted.

Active, recovering or permanent injuries may suppress specific expressions or capability IDs without deleting the underlying biological history. A healed injury stops suppressing function. A deceased creature has no currently functional capabilities.

This creates a distinction between:

- what biology happened historically;
- what visibly expressed;
- what is currently functional.

## Land / Water / Air prototype bridge

R0.3 only needs to prove that environment capability can emerge independently and simultaneously.

The temporary semantic bridge recognises:

- Land from `movement.land`;
- Water from `movement.swim`, `movement.water` or `movement.aquatic`;
- Air from `movement.flight` or `movement.sustained_flight`.

Only currently functional capability IDs count. A creature can therefore be Land + Water + Air if all three are genuinely functional, while an expressed but unreliable wing remains non-Air-capable.

These hooks are not the final arena eligibility algorithm. WP0.4E still owns sustained-flight, respiration, combat-function and other final qualification tests.

## Later splice context

`buildCreatureSpliceResolutionInput()` derives the WP0.3D resolver inputs directly from current cumulative biology:

- current stability is the previous attempt's persisted `stabilityAfter` value, defaulting to 1 for an unmodified creature;
- accumulated complexity is the unbounded sum of prior attempt complexity;
- compatibility receives only source packages with an expression that actually established;
- compatibility receives biological tags produced by established expressions;
- persistent mutation instances contribute mutation-context tags;
- active/recovering/permanent injuries contribute injury-context tags.

This means future systemic or authored compatibility rules can react to prior expression, mutation and injury without converting the engine into a base/source pairing table.

## Mutations

WP0.3E persists the `mutationTriggered` consequence on a splice attempt and already includes existing `MutationInstance` records in later compatibility context.

WP0.3F owns creation, analysis, stabilisation, preservation and extraction behaviour for actual mutation instances. WP0.3E does not pre-empt those mechanics.

## Injury and death

WP0.3D consequences are persisted into attempt history. Non-`none` injury severity creates an injury history record; permanent/lethal consequences are recorded as permanent damage. A lethal result marks the creature `deceased`.

The prototype does not guess which anatomical capability a generic resolver injury damaged. Capability-specific injury suppression is supported by the domain contract and can be authored by later injury/combat systems when the affected biology is known.

## Age

Age remains persistent identity/history metadata. Applying or deriving splices does not impose retirement, age decay or a hidden combat penalty.

This deliberately respects CR-007 while leaving modest future species-appropriate ageing effects open.

## Save/schema impact

WP0.3E advances the supported save schema from v1 to **v2** because resolved expression quality, stability and cumulative complexity are now persisted biological facts.

Migration behaviour:

- schema v0 still migrates through the existing v0 → v1 path and then into v2;
- schema v1 creatures gain `lifeState: living` unless already explicitly deceased;
- old splice attempts gain neutral stability/complexity/consequence defaults when the historical save could not have recorded those WP0.3D facts;
- old expression records preserve known capability/action IDs and are normalised into the v2 expression shape;
- optional reagent and experiment collections introduced during WP0.3B remain backward compatible.

Save migration does not invent historical stochastic quality that was never recorded; neutral/default values are marked by the migrated record shape rather than pretending old data contains WP0.3D resolution evidence.

## Acceptance coverage

Automated tests prove:

1. a single creature can receive multiple sequential irreversible splices;
2. later resolver inputs use accumulated stability, complexity and existing biology;
3. Land, Water and Air capability can emerge independently and simultaneously;
4. an expressed but non-functional attempted trait does not grant its capability;
5. injury can suppress a real capability without deleting expression history and healing can restore it;
6. previous expression, mutation and injury context can participate in later compatibility rules;
7. age metadata is preserved without a retirement mechanic;
8. cumulative history and derived capability state reproduce after save/load;
9. schema-v0 and schema-v1 saves migrate through the v2 compatibility path.
