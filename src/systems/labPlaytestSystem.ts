import { OPENING_BASE_ANIMAL_IDS, OPENING_SOURCE_PACKAGE_IDS } from '../content/biologyCatalog.js';
import { CONTENT_CATALOG } from '../content/contentCatalog.js';
import { deriveCreatureBiology } from '../domain/creatureBiology.js';
import { ids, type CreatureId, type SourcePackageId } from '../domain/ids.js';
import { emptyArenaCapabilities, type CreatureState, type GameDomainState, type MaterialLot } from '../domain/model.js';
import { availableMaterialQuantity, PROTOTYPE_GENERAL_REAGENT_ID } from '../domain/research.js';
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

function nextCreatureId(state: GameDomainState, stem: string): CreatureId {
  const used = new Set(state.creatures.map((creature) => creature.id));
  let ordinal = 1;
  let candidate = ids.creature(`${stem}.${ordinal}`);
  while (used.has(candidate)) {
    ordinal += 1;
    candidate = ids.creature(`${stem}.${ordinal}`);
  }
  return candidate;
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

function mainCommitRecoveryLot(sourcePackageId: SourcePackageId, acquiredAt: string): MaterialLot {
  return {
    id: ids.materialLot(`r03.lot.${sourcePackageId}.wp04c-main-reserve`),
    sourcePackageId,
    quantity: 1,
    acquiredAt,
    notes: 'WP0.4C one-time recovery dose for saves that spent every prototype unit on disposable tests before the main-reserve rule existed.',
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

/**
 * Common test animals are disposable experimental stock. One individual is used
 * for one bench experiment, then removed from the active roster while its full
 * creature/experiment history remains persistent. Animal holding supplies a
 * fresh clean Rabbit, Goat and Pig whenever an active species slot is missing.
 */
export function restockMissingTestAnimals(state: GameDomainState, now: string): GameDomainState {
  let next = state;
  for (const baseAnimalId of OPENING_BASE_ANIMAL_IDS) {
    const hasLivingTest = next.testAnimalIds
      .map((id) => next.creatures.find((creature) => creature.id === id))
      .some((creature) => (
        creature?.role === 'test'
        && creature.baseAnimalId === baseAnimalId
        && creature.lifeState === 'living'
        && creature.spliceHistory.length === 0
      ));
    if (hasLivingTest) continue;

    const id = nextCreatureId(next, `r03.test.${baseAnimalId}.replacement`);
    const definition = CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === baseAnimalId);
    const replacement = blankCreature(id, `Test ${definition?.name ?? baseAnimalId}`, baseAnimalId, 'test', now);
    next = {
      ...next,
      creatures: [...next.creatures, replacement],
      testAnimalIds: [...next.testAnimalIds, replacement.id],
    };
  }
  return next;
}

/**
 * Migrates old prototype saves that left used/dead disposable subjects in the
 * active roster. Used individuals remain in creature/history data but cannot be
 * selected as clean test stock again.
 */
export function normaliseDisposableTestRoster(state: GameDomainState, now: string): GameDomainState {
  const cleanActiveIds = state.testAnimalIds.filter((id) => {
    const creature = state.creatures.find((candidate) => candidate.id === id);
    return Boolean(
      creature
      && creature.role === 'test'
      && creature.lifeState === 'living'
      && creature.spliceHistory.length === 0,
    );
  });
  const pruned = cleanActiveIds.length === state.testAnimalIds.length
    ? state
    : { ...state, testAnimalIds: cleanActiveIds };
  return restockMissingTestAnimals(pruned, now);
}

export function retireDisposableTestSubject(state: GameDomainState, creatureId: CreatureId, now: string): GameDomainState {
  const subject = state.creatures.find((creature) => creature.id === creatureId);
  if (!subject || subject.role !== 'test') return state;
  return normaliseDisposableTestRoster({
    ...state,
    testAnimalIds: state.testAnimalIds.filter((id) => id !== creatureId),
  }, now);
}

/**
 * WP0.4C recovery bridge. Earlier playtest UI allowed disposable tests to spend
 * all eight source units, leaving a correctly researched main splice impossible.
 * If that exact legacy condition is detected, restore one and only one physical
 * dose. Once a main attempt is recorded, no replacement dose is ever generated.
 */
export function restoreMainCommitReserve(state: GameDomainState, now: string): GameDomainState {
  const testedSources = [...new Set(state.experimentHistory
    .filter((observation) => observation.subjectRole === 'test')
    .map((observation) => observation.sourcePackageId))];
  const recoverable = testedSources.filter((sourcePackageId) => {
    const mainAttemptExists = state.experimentHistory.some((observation) => (
      observation.sourcePackageId === sourcePackageId && observation.subjectRole === 'main'
    ));
    return !mainAttemptExists && availableMaterialQuantity(state, sourcePackageId) === 0;
  });
  if (recoverable.length === 0) return state;
  return {
    ...state,
    materialStock: [
      ...state.materialStock,
      ...recoverable.map((sourcePackageId) => mainCommitRecoveryLot(sourcePackageId, now)),
    ],
  };
}

export function hasLivingMainCreature(state = domainState.snapshot()): boolean {
  return state.mainCreatureIds
    .map((id) => state.creatures.find((creature) => creature.id === id))
    .some((creature) => creature?.role === 'main' && creature.lifeState === 'living');
}

/**
 * A dead valued creature is a real loss, but not a permanent game soft-lock.
 * The dead individual stays in history; animal holding can register a new main.
 */
export function replaceDeadMainCreature(baseAnimalId: string, now = new Date().toISOString()): GameDomainState {
  const current = domainState.snapshot();
  if (hasLivingMainCreature(current)) return current;

  const id = nextCreatureId(current, `r03.main.${baseAnimalId}.replacement`);
  const definition = CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === baseAnimalId);
  const replacement = blankCreature(id, `Pit ${definition?.name ?? baseAnimalId}`, baseAnimalId, 'main', now);
  const next = normaliseDisposableTestRoster({
    ...current,
    creatures: [...current.creatures, replacement],
    mainCreatureIds: [replacement.id],
  }, now);

  domainState.hydrate(next);
  const gameplay = gameState.snapshot();
  gameState.hydrate({
    ...gameplay,
    hasBaseAnimal: true,
    baseAnimalId,
    currentCreature: null,
    questStage: gameplay.collectedGenes.length > 0 ? 'splice' : 'collect_genes',
  });
  saveGame();
  return next;
}

export function ensureR03LabPlaytestState(now = new Date().toISOString()): GameDomainState {
  const current = domainState.snapshot();
  if (current.creatures.length > 0) {
    const bridged = bridgeNewlyRecoveredSources(current, now);
    const normalised = normaliseDisposableTestRoster(bridged, now);
    const repaired = restoreMainCommitReserve(normalised, now);
    if (repaired !== current) {
      domainState.hydrate(repaired);
      saveGame();
    }
    return repaired;
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
      gameState.hydrate({ ...gameState.snapshot(), currentCreature: null, questStage: 'find_animal' });
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
