import type { RandomFn } from '../random/RandomSource.js';
import type { BattleCreature, Combatant } from '../types.js';

export type { RandomFn } from '../random/RandomSource.js';
export type BattleAction = 'attack' | 'trait' | 'guard';

export function createCombatant(creature: BattleCreature, label = creature.name): Combatant {
  return {
    name: label,
    stats: { ...creature.stats },
    hp: creature.stats.maxHp,
    guarding: false,
    genes: [...(creature.genes ?? [])],
  };
}

export function damageFor(attacker: Combatant, defender: Combatant, random: RandomFn, power = 1): number {
  const variance = 0.9 + random() * 0.2;
  const raw = (attacker.stats.attack * power - defender.stats.defence * 0.45) * variance;
  const guard = defender.guarding ? 0.52 : 1;
  return Math.max(1, Math.round(raw * guard));
}

export function resolveAttack(
  attacker: Combatant,
  defender: Combatant,
  random: RandomFn,
  { power = 1, label = 'attacks' }: { power?: number; label?: string } = {},
): string {
  const damage = damageFor(attacker, defender, random, power);
  defender.hp = Math.max(0, defender.hp - damage);
  defender.guarding = false;
  return `${attacker.name} ${label} for ${damage}.`;
}

export function resolveTrait(user: Combatant, opponent: Combatant, random: RandomFn): string {
  if (user.genes.includes('gecko_regeneration')) {
    const heal = Math.min(7, user.stats.maxHp - user.hp);
    user.hp += heal;
    return `${user.name} knits ${heal} HP of itself back together.`;
  }
  if (user.genes.includes('boar_muscle')) return resolveAttack(user, opponent, random, { power: 1.35, label: 'charges' });
  if (user.genes.includes('moth_sense')) {
    user.guarding = true;
    return `${user.name} reads the air and braces before the strike.`;
  }
  if (user.genes.includes('toad_hide')) {
    const damage = Math.max(1, Math.round(user.stats.defence * 0.6));
    opponent.hp = Math.max(0, opponent.hp - damage);
    return `${user.name} secretes something medically inadvisable for ${damage}.`;
  }
  return resolveAttack(user, opponent, random, { power: 0.9, label: 'flails experimentally' });
}

export function isDefeated(combatant: Combatant): boolean {
  return combatant.hp <= 0;
}
