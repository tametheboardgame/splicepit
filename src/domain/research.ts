import { ids, type CreatureId, type ExperimentObservationId, type SourcePackageId } from './ids.js';
import type {
  AttemptCost,
  ConsumedMaterialRecord,
  GameDomainState,
  MaterialLot,
  ResearchKnowledgeRecord,
} from './model.js';

export const PROTOTYPE_GENERAL_REAGENT_ID = ids.reagent('general_lab_reagent');

export class ResearchExperimentError extends Error {
  constructor(
    public readonly code: 'unknown_subject' | 'invalid_cost' | 'insufficient_material' | 'insufficient_reagent',
    message: string,
  ) {
    super(message);
  }
}

export interface ResearchExperimentInput {
  observationId: ExperimentObservationId;
  subjectCreatureId: CreatureId;
  sourcePackageId: SourcePackageId;
  cost: AttemptCost;
  observedAt: string;
  resultCode: string;
  notes: string;
  contextTags?: readonly string[];
}

export interface ResearchExperimentResult {
  state: GameDomainState;
  consumedMaterials: readonly ConsumedMaterialRecord[];
  knowledge: ResearchKnowledgeRecord;
}

export function prototypeResearchAttemptCost(sourcePackageId: SourcePackageId): AttemptCost {
  return {
    materials: [{ sourcePackageId, quantity: 1, minimumQuality: 0 }],
    reagents: [{ reagentId: PROTOTYPE_GENERAL_REAGENT_ID, quantity: 1 }],
  };
}

export function materialQuality(lot: MaterialLot): number {
  return lot.quality ?? 1;
}

export function availableMaterialQuantity(
  state: GameDomainState,
  sourcePackageId: SourcePackageId,
  minimumQuality = 0,
): number {
  return state.materialStock
    .filter((lot) => lot.sourcePackageId === sourcePackageId && materialQuality(lot) >= minimumQuality)
    .reduce((total, lot) => total + lot.quantity, 0);
}

export function makeResearchContextKey(baseAnimalId: string, contextTags: readonly string[] = []): string {
  const normalisedTags = [...new Set(contextTags)].sort();
  return `base:${baseAnimalId}|context:${normalisedTags.length > 0 ? normalisedTags.join('+') : 'default'}`;
}

function recordContextKey(record: ResearchKnowledgeRecord): string {
  return record.contextKey ?? makeResearchContextKey(record.baseAnimalId ?? 'general', record.contextTags ?? []);
}

export function researchKnowledgeFor(
  state: GameDomainState,
  sourcePackageId: SourcePackageId,
  baseAnimalId: string,
  contextTags: readonly string[] = [],
): ResearchKnowledgeRecord | null {
  const contextKey = makeResearchContextKey(baseAnimalId, contextTags);
  return state.researchKnowledge.find((record) => (
    record.sourcePackageId === sourcePackageId
    && record.baseAnimalId === baseAnimalId
    && recordContextKey(record) === contextKey
  )) ?? null;
}

function validateAttemptCost(cost: AttemptCost): void {
  const materialSources = new Set<string>();
  for (const entry of cost.materials) {
    if (materialSources.has(entry.sourcePackageId)) {
      throw new ResearchExperimentError('invalid_cost', `Attempt cost repeats material source ${entry.sourcePackageId}.`);
    }
    materialSources.add(entry.sourcePackageId);
    if (!Number.isFinite(entry.quantity) || entry.quantity <= 0 || !Number.isFinite(entry.minimumQuality) || entry.minimumQuality < 0 || entry.minimumQuality > 1) {
      throw new ResearchExperimentError('invalid_cost', 'Material attempt costs require positive quantity and quality between 0 and 1.');
    }
  }

  const reagentIds = new Set<string>();
  for (const entry of cost.reagents) {
    if (reagentIds.has(entry.reagentId)) {
      throw new ResearchExperimentError('invalid_cost', `Attempt cost repeats reagent ${entry.reagentId}.`);
    }
    reagentIds.add(entry.reagentId);
    if (!Number.isFinite(entry.quantity) || entry.quantity <= 0) {
      throw new ResearchExperimentError('invalid_cost', 'Reagent attempt costs require positive quantity.');
    }
  }
}

function consumeMaterials(state: GameDomainState, cost: AttemptCost): {
  stock: MaterialLot[];
  consumed: ConsumedMaterialRecord[];
} {
  const stock = state.materialStock.map((lot) => ({ ...lot }));
  const consumed: ConsumedMaterialRecord[] = [];

  for (const requirement of cost.materials) {
    const available = availableMaterialQuantity(state, requirement.sourcePackageId, requirement.minimumQuality);
    if (available < requirement.quantity) {
      throw new ResearchExperimentError(
        'insufficient_material',
        `Need ${requirement.quantity} units of ${requirement.sourcePackageId}; only ${available} eligible units remain.`,
      );
    }

    let remaining = requirement.quantity;
    const candidateIndexes = stock
      .map((lot, index) => ({ lot, index }))
      .filter(({ lot }) => lot.sourcePackageId === requirement.sourcePackageId && materialQuality(lot) >= requirement.minimumQuality && lot.quantity > 0)
      .sort((a, b) => materialQuality(a.lot) - materialQuality(b.lot) || a.lot.acquiredAt.localeCompare(b.lot.acquiredAt))
      .map(({ index }) => index);

    for (const index of candidateIndexes) {
      if (remaining <= 0) break;
      const lot = stock[index];
      const quantity = Math.min(lot.quantity, remaining);
      lot.quantity -= quantity;
      remaining -= quantity;
      consumed.push({
        materialLotId: lot.id,
        sourcePackageId: lot.sourcePackageId,
        quantity,
        quality: materialQuality(lot),
      });
    }
  }

  return { stock: stock.filter((lot) => lot.quantity > 0), consumed };
}

function consumeReagents(state: GameDomainState, cost: AttemptCost) {
  const stock = state.reagentStock.map((entry) => ({ ...entry }));

  for (const requirement of cost.reagents) {
    const index = stock.findIndex((entry) => entry.reagentId === requirement.reagentId);
    const available = index >= 0 ? stock[index].quantity : 0;
    if (available < requirement.quantity) {
      throw new ResearchExperimentError(
        'insufficient_reagent',
        `Need ${requirement.quantity} units of ${requirement.reagentId}; only ${available} units remain.`,
      );
    }
    stock[index].quantity -= requirement.quantity;
  }

  return stock.filter((entry) => entry.quantity > 0);
}

export function executeResearchExperiment(
  state: GameDomainState,
  input: ResearchExperimentInput,
): ResearchExperimentResult {
  validateAttemptCost(input.cost);

  const subject = state.creatures.find((creature) => creature.id === input.subjectCreatureId);
  if (!subject) {
    throw new ResearchExperimentError('unknown_subject', `Unknown experiment subject ${input.subjectCreatureId}.`);
  }

  const sourceCost = input.cost.materials.find((entry) => entry.sourcePackageId === input.sourcePackageId);
  if (!sourceCost) {
    throw new ResearchExperimentError('invalid_cost', 'Research experiment must consume physical material from the source being observed.');
  }

  const contextTags = [...new Set(input.contextTags ?? [])].sort();
  const contextKey = makeResearchContextKey(subject.baseAnimalId, contextTags);

  const { stock: materialStock, consumed: consumedMaterials } = consumeMaterials(state, input.cost);
  const reagentStock = consumeReagents(state, input.cost);

  const existingIndex = state.researchKnowledge.findIndex((record) => (
    record.sourcePackageId === input.sourcePackageId
    && record.baseAnimalId === subject.baseAnimalId
    && recordContextKey(record) === contextKey
  ));

  const researchKnowledge: ResearchKnowledgeRecord[] = state.researchKnowledge.map((record) => ({
    ...record,
    contextTags: record.contextTags ? [...record.contextTags] : undefined,
    notes: [...record.notes],
  }));
  const existing = existingIndex >= 0 ? researchKnowledge[existingIndex] : null;
  const knowledge: ResearchKnowledgeRecord = existing
    ? {
      ...existing,
      contextKey,
      contextTags,
      observationCount: existing.observationCount + 1,
      notes: [...existing.notes, input.notes],
    }
    : {
      sourcePackageId: input.sourcePackageId,
      baseAnimalId: subject.baseAnimalId,
      contextKey,
      contextTags,
      observationCount: 1,
      notes: [input.notes],
    };

  if (existingIndex >= 0) researchKnowledge[existingIndex] = knowledge;
  else researchKnowledge.push(knowledge);

  const observation = {
    id: input.observationId,
    subjectCreatureId: subject.id,
    sourcePackageId: input.sourcePackageId,
    baseAnimalId: subject.baseAnimalId,
    subjectRole: subject.role,
    contextKey,
    contextTags,
    observedAt: input.observedAt,
    consumedMaterials,
    consumedReagents: input.cost.reagents.map((entry) => ({ ...entry })),
    resultCode: input.resultCode,
    notes: input.notes,
  } as const;

  return {
    state: {
      ...state,
      materialStock,
      reagentStock,
      researchKnowledge,
      experimentHistory: [...state.experimentHistory, observation],
    },
    consumedMaterials,
    knowledge,
  };
}
