import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';
import type { RandomFn } from '../random/RandomSource.js';
import type { BaseAnimalDefinition, CreatureRecord, CreatureStats, Mutation, StatKey } from '../types.js';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export interface SplicePlan {
  base: BaseAnimalDefinition;
  geneIds: string[];
  complexity: number;
  chance: number;
  stats: CreatureStats;
}

export interface SpliceAttemptMetadata {
  creatureId?: string;
  createdAt?: string;
}

export type SpliceResult =
  | { success: false; chance: number; roll: number; message: string; creature?: undefined }
  | { success: true; chance: number; roll: number; creature: CreatureRecord; message: string };

export function calculateSplice(baseAnimalId: string, geneIds: Iterable<string>): SplicePlan {
  const base = BASE_ANIMALS[baseAnimalId];
  if (!base) throw new Error(`Unknown base animal: ${baseAnimalId}`);

  const uniqueGeneIds = [...new Set(geneIds)].filter((id) => Boolean(GENES[id]));
  const complexity = uniqueGeneIds.reduce((sum, id) => sum + GENES[id].complexity, 0);
  const chance = clamp(96 - complexity * 8 - Math.max(0, uniqueGeneIds.length - 2) * 4, 38, 96);

  const stats: CreatureStats = { ...base.stats };
  for (const id of uniqueGeneIds) {
    const mods = GENES[id].modifiers;
    for (const key of Object.keys(stats) as StatKey[]) stats[key] += mods[key] ?? 0;
  }
  stats.stability = clamp(stats.stability - complexity * 2, 5, 100);

  return { base, geneIds: uniqueGeneIds, complexity, chance, stats };
}

function generatedCreatureId(random: RandomFn): string {
  return `splice-${Math.floor(random() * 0x1_0000_0000).toString(16).padStart(8, '0')}`;
}

export function attemptSplice(
  baseAnimalId: string,
  geneIds: Iterable<string>,
  random: RandomFn,
  metadata: SpliceAttemptMetadata = {},
): SpliceResult {
  const plan = calculateSplice(baseAnimalId, geneIds);
  const roll = random() * 100;
  const success = roll <= plan.chance;

  if (!success) {
    return {
      success: false,
      chance: plan.chance,
      roll,
      message: 'The tissue rejects the pattern. The specimen survives; the splice does not.',
    };
  }

  const mutationChance = Math.min(8 + plan.complexity * 4, 34);
  const mutationRoll = random() * 100;
  const mutated = mutationRoll <= mutationChance;
  const stats: CreatureStats = { ...plan.stats };
  let mutation: Mutation | null = null;

  if (mutated) {
    const variants: Mutation[] = [
      { id: 'overgrowth', name: 'Benign Overgrowth', stat: 'maxHp', amount: 5 },
      { id: 'tremor', name: 'Motor Tremor', stat: 'speed', amount: -2 },
      { id: 'calcification', name: 'Bone Calcification', stat: 'defence', amount: 3 },
    ];
    mutation = variants[Math.floor(random() * variants.length) % variants.length];
    stats[mutation.stat] = Math.max(1, stats[mutation.stat] + mutation.amount);
    stats.stability = clamp(stats.stability - 6, 1, 100);
  }

  return {
    success: true,
    chance: plan.chance,
    roll,
    creature: {
      id: metadata.creatureId ?? generatedCreatureId(random),
      name: makeCreatureName(plan.base.name, plan.geneIds),
      baseAnimalId,
      genes: plan.geneIds,
      stats,
      mutation,
      createdAt: metadata.createdAt ?? new Date().toISOString(),
    },
    message: mutated ? `Splice held, with mutation: ${mutation?.name}.` : 'Splice held. The specimen is viable.',
  };
}

export function makeCreatureName(baseName: string, geneIds: readonly string[]): string {
  if (geneIds.length === 0) return baseName;
  const sources = geneIds.map((id) => GENES[id].source).slice(0, 3);
  return `${sources.join('-')} ${baseName}`;
}
