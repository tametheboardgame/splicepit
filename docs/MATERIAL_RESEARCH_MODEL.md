# SplicePit Physical Material and Research Model

## Status

Introduced by WP0.3B. This document defines the prototype contract separating physical laboratory resources from persistent biological knowledge.

It implements locked decisions S-004 and S-005 without locking the final game economy. Exact quantities, prices, replication/storage upgrades and later diagnostic progression remain tuning/design work.

## Physical source material

A source package being known does not mean the player possesses usable material from it.

Usable genetic/source stock is represented as physical material lots. Each lot records:

- stable material-lot ID;
- source-package ID;
- remaining quantity;
- acquisition timestamp;
- notes/provenance;
- optional quality from `0` to `1`;
- optional acquisition channel (`buy`, `harvest`, `win`, `trade`, `inherit`, `extract`, `prototype`).

Experiments and later splice attempts must explicitly consume eligible physical material. A knowledge record has no operation that replenishes material stock.

## Reagents

Laboratory reagents are a separate consumable resource from source material.

WP0.3B introduces stable reagent IDs and reagent-stock entries. Attempt costs can require both source material and reagent quantities.

`general_lab_reagent` is a prototype-only reagent used to prove the resource boundary. Its name, exact quantity, price and future replacement with more specialised reagents are not canon economy decisions.

## Attempt-cost abstraction

An `AttemptCost` contains:

- one or more physical source-material requirements, each with quantity and minimum quality;
- one or more reagent requirements with quantity.

Costs are checked before the result is committed. A shortage must not create a partial experiment that consumes some resources but produces no observation.

The current `prototypeResearchAttemptCost()` value of one source-material unit plus one general reagent unit is a tuning value only.

## Research context

Research knowledge is persistent and contextual.

A record is keyed by:

- source package;
- base animal;
- a normalised context key derived from relevant context tags.

This allows repeated Rabbit/Gecko experiments to improve Rabbit/Gecko knowledge without silently making Goat/Gecko equally understood. Later WPs can introduce additional context tags for accumulated biology, facility conditions, injuries or other relevant experimental circumstances.

WP0.3B does not define the final confidence/prediction formula. It stores reliable evidence for that later calculation through observation counts and experiment history.

## Experiment observations

A completed research experiment persists an observation containing:

- stable observation ID;
- subject creature and whether it was a `main` or `test` animal;
- source package and base animal;
- normalised context;
- timestamp and result code;
- exact consumed material lots/quantities/quality;
- consumed reagents;
- notes.

This gives later diagnostic and lab UX work an auditable experiment history rather than only a single abstract knowledge number.

## Test animals and main roster

Test animals use the same creature domain model but remain outside the maximum-three serious main roster.

Research experiments can target a test animal directly. Running experiments does not promote a test animal, remove a main creature or otherwise alter roster membership.

This is the intended foundation for common animals being strategically useful as repeatable experimental subjects.

## Persistence compatibility

WP0.3B adds reagent stock and experiment history to the existing save payload as additive schema-v1 sections.

Older schema-v1 saves remain readable. Missing reagent stock and experiment history load as empty collections. Existing material and knowledge records remain readable; older material lots without explicit quality are treated as full-quality legacy stock by the prototype research service.

No R0.1 compatibility promise is added.

## Explicit non-goals

WP0.3B does not implement:

- compatibility or epistasis scoring;
- splice outcome probabilities;
- final research-confidence curves;
- diagnostic UI;
- sample replication facilities;
- final reagent catalogue/economy;
- mutation extraction;
- final source quality acquisition balance.

Those remain owned by later roadmap work packages.

## WP0.3B gate

The automated gate proves that:

1. repeated experiments on test animals consume material and reagent stock;
2. those experiments increase persistent source/base/context knowledge;
3. observations are stored independently of the three-main roster;
4. insufficient resources fail atomically;
5. learned knowledge cannot create replacement source material;
6. physically present material can still be unusable when it fails an attempt's quality requirement;
7. the new lab-resource collections survive save/load while older schema-v1 saves still load.
