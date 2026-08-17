import type { BaseAnimalDefinition, EnemyCreatureDefinition } from '../types.js';

export const BASE_ANIMALS: Record<string, BaseAnimalDefinition> = {
  rabbit: {
    id: 'rabbit',
    status: 'prototype',
    name: 'Rabbit',
    description: 'Light, fast and fragile. Common, cheap and a forgiving place to learn what the bench does.',
    stats: { maxHp: 28, attack: 6, defence: 4, speed: 8, stability: 92 },
    body: 'rabbit',
  },
  goat: {
    id: 'goat',
    status: 'prototype',
    name: 'Goat',
    description: 'Robust and stubborn, with useful horns, strong footing and a sturdier frame for risky work.',
    stats: { maxHp: 36, attack: 8, defence: 7, speed: 5, stability: 94 },
    body: 'goat',
  },
  pig: {
    id: 'pig',
    status: 'prototype',
    name: 'Pig',
    description: 'Heavy, durable and metabolically demanding. Strong neck, jaw and body mass from the start.',
    stats: { maxHp: 42, attack: 8, defence: 8, speed: 4, stability: 95 },
    body: 'pig',
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
