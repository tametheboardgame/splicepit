import { BIOLOGY_CONTENT_CATALOG } from './biologyCatalog.js';
import { PROTOTYPE_CONTENT_CATALOG } from './prototypeCatalog.js';
import type { DomainContentCatalog } from '../domain/model.js';

function mergeDefinitions<T extends { id: string }>(
  fallback: readonly T[],
  preferred: readonly T[],
): readonly T[] {
  const byId = new Map<string, T>();
  fallback.forEach((definition) => byId.set(definition.id, definition));
  preferred.forEach((definition) => byId.set(definition.id, definition));
  return [...byId.values()];
}

export const CONTENT_CATALOG: DomainContentCatalog = {
  baseAnimals: mergeDefinitions(PROTOTYPE_CONTENT_CATALOG.baseAnimals, BIOLOGY_CONTENT_CATALOG.baseAnimals),
  sourcePackages: mergeDefinitions(PROTOTYPE_CONTENT_CATALOG.sourcePackages, BIOLOGY_CONTENT_CATALOG.sourcePackages),
  mutations: PROTOTYPE_CONTENT_CATALOG.mutations,
  capabilities: PROTOTYPE_CONTENT_CATALOG.capabilities,
  actions: PROTOTYPE_CONTENT_CATALOG.actions,
  items: PROTOTYPE_CONTENT_CATALOG.items,
  locations: PROTOTYPE_CONTENT_CATALOG.locations,
  quests: PROTOTYPE_CONTENT_CATALOG.quests,
  progressionStates: PROTOTYPE_CONTENT_CATALOG.progressionStates,
};
