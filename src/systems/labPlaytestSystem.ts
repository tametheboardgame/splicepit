import { OPENING_BASE_ANIMAL_IDS, OPENING_SOURCE_PACKAGE_IDS } from '../content/biologyCatalog.js';
import { CONTENT_CATALOG } from '../content/contentCatalog.js';
import { deriveCreatureBiology } from '../domain/creatureBiology.js';
import { ids, type CreatureId, type SourcePackageId } from '../domain/ids.js';
import { emptyArenaCapabilities, type CreatureState, type GameDomainState, type MaterialLot } from '../domain/model.js';
import { PROTOTYPE_GENERAL_REAGENT_ID } from '../domain/research.js';
import { domainState } from '../state/DomainState.js';
import { gameState } from '../state/GameState.js';
import type { CreatureRecord, CreatureStats } from '../types.js';
import { saveGame } from './saveSystem.js';

const LEGACY_SOURCE_BRIDGE: Readonly<Record<string, SourcePackageId>> = {
  gecko_regeneration: ids.sourcePackage('gecko_regeneration'),
  boar_muscle: ids.sourcePackage('cheetah_sprint_suite'),
  moth_sense: ids.sourcePackage('owl_nocturnal_sensory_suite'),
  ...Object.fromEntries(OPENING_SOURCE_PACKAGE_IDS.map((sourcePackageId) => [sourcePackageId, sourcePackageId])),
};

const LEGACY_TRAIT_BRIDGE: Readonly<Record<string, string>> = {
  gecko_regeneration: 'gecko_regeneration',
  cheetah_sprint_suite: 'boar_muscle',
  owl_nocturnal_sensory_suite: 'moth_sense',
};

/**
 * PROTOTYPE / TUNABLE playtest stock. These quantities prove finite physical
 * material and repeated experimentation; they are not the production economy.
 */
export const R03_PLAYTEST_MATERIAL_UNITS_PER_SOURCE = 8;
export const R03_PLAYTEST_REAGENT_UNITS = 24;

function blankCreature(
  id: CreatureId,
  name: string,
  baseAnimalId: string,
  role: 'main' | 'test',
  createdAt: string,
): CreatureState {
  return {
    id,
    name,
    baseAnimalId: ids.baseAnimal(baseAnimalId),
    role,
    lifeState: 'living',
    createdAt,
    estimatedAgeDays: null,
    phenotypeSeed: `${id}.phenotype`,
    spliceHistory: [],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: emptyArenaCapabilities(),
  };
}

function unlockedSources(): SourcePackageId[] {
  const mapped = gameState.collectedGenes
    .map((legacyId) => LEGACY_SOURCE_BRIDGE[legacyId])
    .filter((id): id is SourcePackageId => id !== undefined);
  return [...new Set(mapped)];
}

function prototypeMaterialLot(sourcePackageId: SourcePackageId, acquiredAt: string): MaterialLot {
  return {
    id: ids.materialLot(`r03.lot.${sourcePackageId}.bridge`),
    sourcePackageId,
    quantity: R03_PLAYTEST_MATERIAL_UNITS_PER_SOURCE,
    acquiredAt,
    notes: 'WP0.3H PROTOTYPE playtest stock bridged from the R0.1 recovered-sample flow.',
    quality: 0.82,
    acquisitionChannel: 'prototype',
  };
}

function sourceWasAlreadyIntroduced(state: GameDomainState, sourcePackageId: SourcePackageId): boolean {
  return state.materialStock.some((lot) => lot.sourcePackageId === sourcePackageId)
    || state.experimentHistory.some((observation) => observation.sourcePackageId === sourcePackageId)
    || state.researchKnowledge.some((record) => record.sourcePackageId === sourcePackageId);
}

function bridgeNewlyRecoveredSources(state: GameDomainState, now: string): GameDomainState {
  const newlyUnlocked = unlockedSources().filter((sourcePackageId) => !sourceWasAlreadyIntroduced(state, sourcePackageId));
  if (newlyUnlocked.length === 0) return state;
  return {
    ...state,
    materialStock: [
      ...state.materialStock,
      ...newlyUnlocked.map((sourcePackageId) => prototypeMaterialLot(sourcePackageId, now)),
    ],
  };
}

export function ensureR03LabPlaytestState(now = new Date().toISOString()): GameDomainState {
  const current = domainState.snapshot();
  if (current.creatures.length > 0) {
    const bridged = bridgeNewlyRecoveredSources(current, now);
    if (bridged !== current) {
      domainState.hydrate(bridged);
      saveGame();
    }
    return bridged;
  }
  if (!gameState.baseAnimalId) return current;

  const mainId = ids.creature(`r03.main.${gameState.baseAnimalId}`);
  const mainBase = CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === gameState.baseAnimalId);
  const main = blankCreature(mainId, `Pit ${mainBase?.name ?? gameState.baseAnimalId}`, gameState.baseAnimalId, 'main', now);
  const tests = OPENING_BASE_ANIMAL_IDS.map((baseAnimalId, index) => blankCreature(
    ids.creature(`r03.test.${baseAnimalId}.${index + 1}`),
    `Test ${CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === baseAnimalId)?.name ?? baseAnimalId}`,
    baseAnimalId,
    'test',
    now,
  ));
  const materialStock = unlockedSources().map((sourcePackageId) => prototypeMaterialLot(sourcePackageId, now));

  const next: GameDomainState = {
    ...current,
    creatures: [main, ...tests],
    mainCreatureIds: [main.id],
    testAnimalIds: tests.map((creature) => creature.id),
    materialStock,
    reagentStock: [{
      reagentId: PROTOTYPE_GENERAL_REAGENT_ID,
      quantity: R03_PLAYTEST_REAGENT_UNITS,
      notes: 'WP0.3H PROTOTYPE general reagent stock.',
    }],
  };
  domainState.hydrate(next);
  saveGame();
  return next;
}

export function persistLabDomainState(state: GameDomainState): void {
  domainState.hydrate(state);
  saveGame();
}

function baseStats(baseAnimalId: string): CreatureStats {
  if (baseAnimalId === 'goat') return { maxHp: 36, attack: 8, defence: 7, speed: 5, stability: 100 };
  if (baseAnimalId === 'pig') return { maxHp: 42, attack: 8, defence: 8, speed: 4, stability: 100 };
  return { maxHp: 28, attack: 6, defence: 4, speed: 8, stability: 100 };
}

export function legacyCreatureFromDomain(creature: CreatureState): CreatureRecord {
  const biology = deriveCreatureBiology(creature, CONTENT_CATALOG);
  const functionalExpressions = biology.expressions.filter((expression) => expression.currentlyFunctional);
  const legacyGenes = [...new Set(functionalExpressions
    .map((expression) => LEGACY_TRAIT_BRIDGE[expression.sourcePackageId])
    .filter((id): id is string => id !== undefined))];
  const stats = baseStats(creature.baseAnimalId);
  const capabilityBoost = Math.min(4, functionalExpressions.length);
  return {
    id: creature.id,
    name: creature.name,
    baseAnimalId: creature.baseAnimalId,
    genes: legacyGenes,
    stats: {
      maxHp: stats.maxHp + capabilityBoost * 2,
      attack: stats.attack + capabilityBoost,
      defence: stats.defence + Math.floor(capabilityBoost / 2),
      speed: stats.speed + Math.floor(capabilityBoost / 2),
      stability: Math.round(biology.stability * 100),
    },
    mutation: null,
    createdAt: creature.createdAt,
  };
}

export function syncLegacyMainCreature(state = domainState.snapshot()): void {
  const domainMains = state.mainCreatureIds
    .map((id) => state.creatures.find((creature) => creature.id === id))
    .filter((creature): creature is CreatureState => creature !== undefined);
  const main = domainMains.find((creature) => creature.lifeState === 'living' && creature.spliceHistory.length > 0);
  if (!main) {
    if (domainMains.some((creature) => creature.spliceHistory.length > 0)) {
      gameState.hydrate({ ...gameState.snapshot(), currentCreature: null, questStage: 'splice' });
      saveGame();
    }
    return;
  }
  gameState.setCreature(legacyCreatureFromDomain(main));
  saveGame();
}

export function nextLabOperationIds(state: GameDomainState): {
  attemptId: ReturnType<typeof ids.spliceAttempt>;
  observationId: ReturnType<typeof ids.experimentObservation>;
  mutationInstanceId: ReturnType<typeof ids.mutationInstance>;
} {
  let ordinal = state.experimentHistory.length + 1;
  const usedAttempts = new Set(state.creatures.flatMap((creature) => creature.spliceHistory.map((attempt) => attempt.id)));
  const usedObservations = new Set(state.experimentHistory.map((observation) => observation.id));
  const usedMutations = new Set(state.creatures.flatMap((creature) => creature.mutations.map((mutation) => mutation.id)));
  while (
    usedAttempts.has(ids.spliceAttempt(`r03.attempt.${ordinal}`))
    || usedObservations.has(ids.experimentObservation(`r03.observation.${ordinal}`))
    || usedMutations.has(ids.mutationInstance(`r03.mutation.${ordinal}`))
  ) ordinal += 1;
  return {
    attemptId: ids.spliceAttempt(`r03.attempt.${ordinal}`),
    observationId: ids.experimentObservation(`r03.observation.${ordinal}`),
    mutationInstanceId: ids.mutationInstance(`r03.mutation.${ordinal}`),
  };
}
