export function createCombatant(creature, label = creature.name) {
  return {
    name: label,
    stats: { ...creature.stats },
    hp: creature.stats.maxHp,
    guarding: false,
    genes: [...(creature.genes ?? [])],
  };
}

export function damageFor(attacker, defender, power = 1, random = Math.random) {
  const variance = 0.9 + random() * 0.2;
  const raw = (attacker.stats.attack * power - defender.stats.defence * 0.45) * variance;
  const guard = defender.guarding ? 0.52 : 1;
  return Math.max(1, Math.round(raw * guard));
}

export function resolveAttack(attacker, defender, { power = 1, label = 'attacks' } = {}, random = Math.random) {
  const damage = damageFor(attacker, defender, power, random);
  defender.hp = Math.max(0, defender.hp - damage);
  defender.guarding = false;
  return `${attacker.name} ${label} for ${damage}.`;
}

export function resolveTrait(user, opponent, random = Math.random) {
  if (user.genes.includes('gecko_regeneration')) {
    const heal = Math.min(7, user.stats.maxHp - user.hp);
    user.hp += heal;
    return `${user.name} knits ${heal} HP of itself back together.`;
  }
  if (user.genes.includes('boar_muscle')) return resolveAttack(user, opponent, { power: 1.35, label: 'charges' }, random);
  if (user.genes.includes('moth_sense')) {
    user.guarding = true;
    return `${user.name} reads the air and braces before the strike.`;
  }
  if (user.genes.includes('toad_hide')) {
    const damage = Math.max(1, Math.round(user.stats.defence * 0.6));
    opponent.hp = Math.max(0, opponent.hp - damage);
    return `${user.name} secretes something medically inadvisable for ${damage}.`;
  }
  return resolveAttack(user, opponent, { power: 0.9, label: 'flails experimentally' }, random);
}

export function isDefeated(combatant) { return combatant.hp <= 0; }
