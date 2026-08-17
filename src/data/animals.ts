import type { BaseAnimalDefinition, EnemyCreatureDefinition } from '../types.js';

export const BASE_ANIMALS: Record<string, BaseAnimalDefinition> = {
  rabbit: {
    id: 'rabbit',
    status: 'prototype',
    name: 'Rabbit',
    description: 'A clean local specimen. Nervous, quick and genetically uncomplicated.',
    stats: { maxHp: 28, attack: 6, defence: 4, speed: 8, stability: 92 },
    body: 'rabbit',
  },
};

export const ENEMY_CREATURES: Record<string, EnemyCreatureDefinition> = {
  pit_scrap: {
    id: 'pit_scrap',
    status: 'prototype',
    name: 'Pit Scrap No. 7',
    description: 'A Fit Pit house creature assembled from whatever survived the last licensing inspection.',
    stats: { maxHp: 31, attack: 7, defence: 5, speed: 5, stability: 63 },
    genes: ['toad_hide', 'boar_muscle'],
    body: 'hound',
  },
};
