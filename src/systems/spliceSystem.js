import { GENES } from '../data/genes.js';
import { BASE_ANIMALS } from '../data/animals.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function calculateSplice(baseAnimalId, geneIds) {
  const base = BASE_ANIMALS[baseAnimalId];
  if (!base) throw new Error(`Unknown base animal: ${baseAnimalId}`);

  const uniqueGeneIds = [...new Set(geneIds)].filter((id) => GENES[id]);
  const complexity = uniqueGeneIds.reduce((sum, id) => sum + GENES[id].complexity, 0);
  const chance = clamp(96 - complexity * 8 - Math.max(0, uniqueGeneIds.length - 2) * 4, 38, 96);

  const stats = { ...base.stats };
  for (const id of uniqueGeneIds) {
    const mods = GENES[id].modifiers;
    for (const key of Object.keys(stats)) stats[key] += mods[key] ?? 0;
  }
  stats.stability = clamp(stats.stability - complexity * 2, 5, 100);

  return { base, geneIds: uniqueGeneIds, complexity, chance, stats };
}

export function attemptSplice(baseAnimalId, geneIds, random = Math.random) {
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
  const stats = { ...plan.stats };
  let mutation = null;

  if (mutated) {
    const variants = [
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
      id: `splice-${Date.now()}`,
      name: makeCreatureName(plan.base.name, plan.geneIds),
      baseAnimalId,
      genes: plan.geneIds,
      stats,
      mutation,
      createdAt: new Date().toISOString(),
    },
    message: mutated ? `Splice held, with mutation: ${mutation.name}.` : 'Splice held. The specimen is viable.',
  };
}

export function makeCreatureName(baseName, geneIds) {
  if (geneIds.length === 0) return baseName;
  const sources = geneIds.map((id) => GENES[id].source).slice(0, 3);
  return `${sources.join('-')} ${baseName}`;
}
