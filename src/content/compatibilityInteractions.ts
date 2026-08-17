import type { AuthoredCompatibilityInteraction } from '../domain/compatibility.js';
import { ids } from '../domain/ids.js';

export const PROTOTYPE_AUTHORED_COMPATIBILITY_INTERACTIONS: readonly AuthoredCompatibilityInteraction[] = [
  {
    id: 'prototype.goat_rhino_horn_bed',
    status: 'prototype',
    kind: 'synergy',
    scoreDelta: 2,
    visibility: 'observable',
    baseAnimalId: ids.baseAnimal('goat'),
    incomingSourceIds: [ids.sourcePackage('rhinoceros_impact_suite')],
    requiredSubjectTags: ['body.horns'],
    explanation: 'The goat already has a horn-bearing cranial growth site, giving rhinoceros horn development a useful anatomical foothold.',
  },
] as const;
