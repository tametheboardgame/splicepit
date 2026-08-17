import { BASE_ANIMALS } from '../data/animals.js';
import { GENES } from '../data/genes.js';
import { ids } from '../domain/ids.js';
import type { DomainContentCatalog } from '../domain/model.js';

const traitDefinitions = [
  ['regenerate', null],
  ['charge', 'land'],
  ['anticipate', null],
  ['secrete', null],
] as const;

export const PROTOTYPE_CONTENT_CATALOG: DomainContentCatalog = {
  baseAnimals: Object.values(BASE_ANIMALS).map((animal) => ({
    id: ids.baseAnimal(animal.id),
    status: animal.status,
    revision: 1,
    name: animal.name,
    description: animal.description,
    bodyPlanTags: [animal.body],
  })),
  sourcePackages: Object.values(GENES).map((gene) => ({
    id: ids.sourcePackage(gene.id),
    status: gene.status,
    revision: 1,
    name: gene.name,
    description: gene.description,
    sourceSpecies: gene.source,
    biologicalClassTags: ['prototype_r0_1'],
    potentialCapabilityIds: [ids.capability(`trait_${gene.trait}`)],
    potentialActionIds: [ids.action(`trait_${gene.trait}`)],
  })),
  mutations: [
    ['overgrowth', 'Benign Overgrowth'],
    ['tremor', 'Motor Tremor'],
    ['calcification', 'Bone Calcification'],
  ].map(([id, name]) => ({
    id: ids.mutationDefinition(id),
    status: 'prototype',
    revision: 1,
    name,
    description: 'R0.1 prototype mutation retained only as compatibility content.',
    tags: ['prototype_r0_1'],
  })),
  capabilities: [
    ...(['land', 'water', 'air'] as const).map((environment) => ({
      id: ids.capability(`arena_${environment}_function`),
      status: 'prototype' as const,
      revision: 1,
      name: `${environment} function`,
      description: 'Foundation capability marker used to prove independent arena qualification. Exact functional thresholds remain open.',
      environment,
    })),
    ...traitDefinitions.map(([trait, environment]) => ({
      id: ids.capability(`trait_${trait}`),
      status: 'prototype' as const,
      revision: 1,
      name: trait,
      description: 'R0.1 trait compatibility capability. Later biology WPs replace this prototype interpretation.',
      environment,
    })),
  ],
  actions: traitDefinitions.map(([trait]) => ({
    id: ids.action(`trait_${trait}`),
    status: 'prototype',
    revision: 1,
    name: trait,
    description: 'R0.1 trait compatibility action.',
    requiredCapabilityIds: [ids.capability(`trait_${trait}`)],
  })),
  items: Object.values(GENES).map((gene) => ({
    id: ids.item(`sample_${gene.id}`),
    status: 'prototype',
    revision: 1,
    name: `${gene.name} sample`,
    description: 'Prototype material item adapter. Physical stock mechanics are implemented in later WPs.',
    materialSourcePackageId: ids.sourcePackage(gene.id),
  })),
  locations: [
    {
      id: ids.location('damaged_pit'),
      status: 'prototype',
      revision: 1,
      name: 'Damaged Pit',
      description: 'R0.1 one-room prototype location.',
      linkedLocationIds: [],
    },
  ],
  quests: [
    {
      id: ids.quest('r0_1_slice'),
      status: 'prototype',
      revision: 1,
      name: 'R0.1 Vertical Slice',
      description: 'Compatibility definition for the accepted prototype flow.',
      startLocationId: ids.location('damaged_pit'),
      prerequisiteQuestIds: [],
      progressionStateIds: [
        'find_animal',
        'collect_genes',
        'splice',
        'fight',
        'slice_complete',
      ].map(ids.progressionState),
    },
  ],
  progressionStates: [
    ['find_animal', 'Find Animal'],
    ['collect_genes', 'Collect Genes'],
    ['splice', 'Splice'],
    ['fight', 'Fight'],
    ['slice_complete', 'Slice Complete'],
  ].map(([id, name]) => ({
    id: ids.progressionState(id),
    status: 'prototype',
    revision: 1,
    name,
    description: 'R0.1 quest-stage compatibility state.',
  })),
};
