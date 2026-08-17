import type { GeneDefinition } from '../types.js';

export const GENES: Record<string, GeneDefinition> = {
  gecko_regeneration: {
    id: 'gecko_regeneration',
    name: 'Gecko Regeneration',
    source: 'Gecko',
    description: 'Rapid tissue repair. Unhelpfully enthusiastic about growing things back.',
    complexity: 2,
    modifiers: { maxHp: 8, attack: 0, defence: 1, speed: 0, stability: -5 },
    trait: 'regenerate',
  },
  boar_muscle: {
    id: 'boar_muscle',
    name: 'Boar Myofibre',
    source: 'Boar',
    description: 'Dense muscle fibres and a strong suggestion that walls are optional.',
    complexity: 2,
    modifiers: { maxHp: 4, attack: 4, defence: 1, speed: -1, stability: -4 },
    trait: 'charge',
  },
  moth_sense: {
    id: 'moth_sense',
    name: 'Moth Chemosense',
    source: 'Moth',
    description: 'Fine antennae tuned to movement, pheromones and regrettable laboratory smells.',
    complexity: 1,
    modifiers: { maxHp: 0, attack: 0, defence: 0, speed: 4, stability: -2 },
    trait: 'anticipate',
  },
  toad_hide: {
    id: 'toad_hide',
    name: 'Toad Dermal Gland',
    source: 'Toad',
    description: 'Thick glandular skin. Durable, damp and faintly offensive.',
    complexity: 2,
    modifiers: { maxHp: 5, attack: 0, defence: 4, speed: -2, stability: -4 },
    trait: 'secrete',
  },
};

export const GENE_ORDER = Object.keys(GENES);
