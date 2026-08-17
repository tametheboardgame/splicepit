import { deriveCreatureBiology } from './creatureBiology.js';
import { ids, type ActionId, type CapabilityId } from './ids.js';
import type { CreatureState, DomainContentCatalog } from './model.js';

export const COMBAT_METRIC_KEYS = [
  'vitality',
  'force',
  'protection',
  'mobility',
  'perception',
  'metabolicCapacity',
  'reliability',
  'reach',
  'mass',
] as const;

export type CombatMetricKey = (typeof COMBAT_METRIC_KEYS)[number];
export type CombatMetrics = Record<CombatMetricKey, number>;
export type CombatActionRole = 'offence' | 'defence' | 'mobility' | 'recovery' | 'sense' | 'concealment' | 'control';

type MetricDelta = Partial<Record<CombatMetricKey, number>>;

export interface CombatActionRule {
  id: ActionId;
  name: string;
  description: string;
  role: CombatActionRole;
  requiredCapabilityIds: readonly CapabilityId[];
  primaryMetric: CombatMetricKey;
  secondaryMetric: CombatMetricKey | null;
}

export interface LegalCombatAction extends CombatActionRule {
  supportingCapabilityIds: readonly CapabilityId[];
}

export interface CreatureCombatProfile {
  creatureId: CreatureState['id'];
  metrics: CombatMetrics;
  capabilityIds: readonly CapabilityId[];
  legalActions: readonly LegalCombatAction[];
}

const TAG_METRIC_DELTAS: Readonly<Record<string, MetricDelta>> = {
  'frame.light': { mass: -15, reach: -4, mobility: 8, protection: -5 },
  'frame.medium': { mass: 2, reach: 2 },
  'frame.heavy': { mass: 14, mobility: -8, protection: 6 },
  'mass.high': { mass: 10, force: 4, mobility: -3 },
  'mobility.high': { mobility: 10 },
  'hindlimb.powerful': { force: 8, mobility: 5 },
  'vitality.fragile': { vitality: -15 },
  'vitality.high': { vitality: 15 },
  'structure.robust': { protection: 12, vitality: 4 },
  'footing.stable': { protection: 5, reliability: 3 },
  'impact.head_ram': { force: 8 },
  'jaw.powerful': { force: 8, reach: 2 },
  'metabolism.high_demand': { metabolicCapacity: -10 },
  'temperament.alert': { perception: 6 },
  'temperament.stubborn': { reliability: 4 },
};

/**
 * PROTOTYPE / TUNABLE. These deltas translate already-functional capabilities
 * into battle-facing properties. They are not final R0.4 balance values.
 */
const CAPABILITY_METRIC_DELTAS: Readonly<Record<string, MetricDelta>> = {
  'movement.land': { mobility: 3 },
  'movement.hop': { mobility: 12 },
  'movement.climb': { mobility: 8, perception: 2 },
  'movement.burst': { mobility: 8, force: 6, metabolicCapacity: -4 },
  'movement.sprint': { mobility: 16, metabolicCapacity: -5 },
  'movement.adhesion': { mobility: 7 },
  'sense.alertness': { perception: 10, reliability: 2 },
  'sense.scent': { perception: 9 },
  'sense.night_vision': { perception: 10 },
  'sense.sound_localisation': { perception: 10 },
  'sense.electroreception': { perception: 8 },
  'sense.wide_tracking': { perception: 8 },
  'offence.hind_kick': { force: 8, reach: 2 },
  'offence.ram': { force: 12, protection: 2 },
  'offence.bite': { force: 9, reach: 1 },
  'offence.body_drive': { force: 10, mass: 4 },
  'offence.claw': { force: 8, reach: 3 },
  'offence.power': { force: 10 },
  'offence.horn': { force: 12, reach: 7 },
  'offence.impact': { force: 10, protection: 5 },
  'offence.electrical_discharge': { force: 9, metabolicCapacity: -4 },
  'defence.stable_footing': { protection: 8, reliability: 5 },
  'defence.armour': { protection: 18, mobility: -5 },
  'defence.keratin': { protection: 10 },
  'defence.armour_mobility': { protection: 4, mobility: 8 },
  'defence.toxin_contact': { protection: 6, force: 3 },
  'defence.gland_secretion': { protection: 5 },
  'behaviour.pursuit': { mobility: 5, reliability: 3 },
  'combat.commitment': { reliability: 6 },
  'combat.tracking': { perception: 8, reliability: 2 },
  'mass.increase': { mass: 18, reach: 7, mobility: -5 },
  'endurance.mass_support': { metabolicCapacity: 10, vitality: 5 },
  'endurance.sprint_recovery': { metabolicCapacity: 8 },
  'resource.bioelectric_charge': { metabolicCapacity: 8 },
  'recovery.wound_repair': { vitality: 8, metabolicCapacity: -3 },
  'recovery.regrowth': { vitality: 10, metabolicCapacity: -5 },
  'recovery.clean_healing': { vitality: 5 },
  'concealment.camouflage': { reliability: 2 },
  'concealment.adaptive_camouflage': { reliability: 3 },
};

const action = (
  id: string,
  name: string,
  description: string,
  role: CombatActionRole,
  requiredCapabilities: readonly string[],
  primaryMetric: CombatMetricKey,
  secondaryMetric: CombatMetricKey | null = null,
): CombatActionRule => ({
  id: ids.action(`combat.${id}`),
  name,
  description,
  role,
  requiredCapabilityIds: requiredCapabilities.map(ids.capability),
  primaryMetric,
  secondaryMetric,
});

/**
 * PROTOTYPE action vocabulary for WP0.4A. Availability is always derived from
 * current functional capability IDs; there is no move-slot or species branch.
 */
export const PROTOTYPE_COMBAT_ACTION_RULES: readonly CombatActionRule[] = [
  action('ground_reposition', 'Ground Reposition', 'Use functional terrestrial movement to change footing or angle.', 'mobility', ['movement.land'], 'mobility', 'perception'),
  action('evasive_hop', 'Evasive Hop', 'Exploit powerful hopping movement to evade or rapidly change range.', 'mobility', ['movement.hop'], 'mobility', 'reliability'),
  action('alert_watch', 'Alert Watch', 'Use alert senses to read an opponent and prepare a response.', 'sense', ['sense.alertness'], 'perception', 'reliability'),
  action('hind_kick', 'Hind Kick', 'Strike with functional powerful hind limbs.', 'offence', ['offence.hind_kick'], 'force', 'mobility'),
  action('climb_reposition', 'Climb / Reposition', 'Use climbing ability to exploit usable arena structure.', 'mobility', ['movement.climb'], 'mobility', 'perception'),
  action('ram', 'Ram', 'Drive reinforced head and body mass into the opponent.', 'offence', ['offence.ram'], 'force', 'mass'),
  action('stable_brace', 'Stable Brace', 'Use sure footing to absorb or redirect incoming force.', 'defence', ['defence.stable_footing'], 'protection', 'reliability'),
  action('bite', 'Bite', 'Attack with functional jaw and dentition.', 'offence', ['offence.bite'], 'force', 'reach'),
  action('body_drive', 'Body Drive', 'Use body mass and neck strength to shove or bowl through an opponent.', 'offence', ['offence.body_drive'], 'force', 'mass'),
  action('scent_track', 'Scent Track', 'Use scent information to maintain contact with a difficult target.', 'sense', ['sense.scent'], 'perception', 'reliability'),
  action('pursue', 'Pursue', 'Commit to following a retreating or evasive target.', 'control', ['behaviour.pursuit'], 'mobility', 'reliability'),
  action('press_attack', 'Press Attack', 'Use strong predatory commitment to sustain pressure.', 'control', ['combat.commitment'], 'reliability', 'force'),
  action('claw_slash', 'Claw Slash', 'Strike with functional claw structures.', 'offence', ['offence.claw'], 'force', 'reach'),
  action('burst_lunge', 'Burst Lunge', 'Combine burst movement and high-output force in a short committed attack.', 'offence', ['movement.burst', 'offence.power'], 'force', 'mobility'),
  action('horn_strike', 'Horn Strike', 'Attack with a functional horn structure.', 'offence', ['offence.horn'], 'force', 'reach'),
  action('impact_charge', 'Impact Charge', 'Exploit impact-tolerant cranial structure for a committed collision.', 'offence', ['offence.impact'], 'force', 'protection'),
  action('wound_repair', 'Wound Repair', 'Exploit active wound-repair biology during a lull.', 'recovery', ['recovery.wound_repair'], 'vitality', 'metabolicCapacity'),
  action('regrow_tissue', 'Regrow Tissue', 'Commit regenerative capacity to restoring damaged tissue.', 'recovery', ['recovery.regrowth'], 'vitality', 'metabolicCapacity'),
  action('adhesive_reposition', 'Adhesive Reposition', 'Use adhesive surfaces to hold or reach awkward positions.', 'mobility', ['movement.adhesion'], 'mobility', 'reliability'),
  action('sprint_burst', 'Sprint Burst', 'Use functional sprint physiology for rapid repositioning or pursuit.', 'mobility', ['movement.sprint'], 'mobility', 'metabolicCapacity'),
  action('armour_brace', 'Armour Brace', 'Present functional dermal armour against an incoming attack.', 'defence', ['defence.armour'], 'protection', 'reliability'),
  action('keratin_guard', 'Keratin Guard', 'Use reinforced keratinised surfaces defensively.', 'defence', ['defence.keratin'], 'protection', 'reliability'),
  action('armoured_shift', 'Armoured Shift', 'Move while keeping flexible armour oriented towards danger.', 'defence', ['defence.armour_mobility'], 'protection', 'mobility'),
  action('night_focus', 'Low-Light Focus', 'Use nocturnal vision to maintain target information in poor light.', 'sense', ['sense.night_vision'], 'perception', 'reliability'),
  action('directional_listen', 'Directional Listen', 'Localise movement through functional directional hearing.', 'sense', ['sense.sound_localisation'], 'perception', 'reliability'),
  action('track_target', 'Track Target', 'Use target-lock reflexes to follow fast or obscured movement.', 'sense', ['combat.tracking'], 'perception', 'reliability'),
  action('electrical_discharge', 'Electrical Discharge', 'Release functional bioelectric output at an opponent.', 'offence', ['offence.electrical_discharge'], 'force', 'metabolicCapacity'),
  action('electroreceptive_scan', 'Electroreceptive Scan', 'Read nearby electrical fields to locate or anticipate a target.', 'sense', ['sense.electroreception'], 'perception', 'reliability'),
  action('toxic_contact', 'Toxic Contact', 'Exploit functional contact toxin as a defensive biological weapon.', 'defence', ['defence.toxin_contact'], 'protection', 'reliability'),
  action('gland_secretion', 'Gland Secretion', 'Release material from functional specialised glands.', 'defence', ['defence.gland_secretion'], 'protection', 'metabolicCapacity'),
  action('camouflage', 'Camouflage', 'Use active colour change to reduce visual exposure.', 'concealment', ['concealment.camouflage'], 'reliability', 'perception'),
  action('wide_visual_sweep', 'Wide Visual Sweep', 'Use widened visual tracking to monitor movement around the creature.', 'sense', ['sense.wide_tracking'], 'perception', 'reliability'),
  action('adaptive_camouflage', 'Adaptive Camouflage', 'Actively match surface colour to current surroundings.', 'concealment', ['concealment.adaptive_camouflage'], 'reliability', 'perception'),
];

function emptyMetrics(): CombatMetrics {
  return Object.fromEntries(COMBAT_METRIC_KEYS.map((key) => [key, 50])) as CombatMetrics;
}

function clampMetric(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

function applyMetricDelta(metrics: CombatMetrics, delta: MetricDelta | undefined, scale = 1): void {
  if (!delta) return;
  for (const key of COMBAT_METRIC_KEYS) {
    const value = delta[key];
    if (value !== undefined) metrics[key] += value * scale;
  }
}

function expressionQuality(expression: {
  magnitude: number;
  completeness: number;
  efficiency: number;
  reliability: number;
  stability: number;
}): number {
  return (
    expression.magnitude
    + expression.completeness
    + expression.efficiency
    + expression.reliability
    + expression.stability
  ) / 5;
}

export function deriveCombatMetrics(creature: CreatureState, catalog: DomainContentCatalog): CombatMetrics {
  const baseAnimal = catalog.baseAnimals.find((candidate) => candidate.id === creature.baseAnimalId);
  if (!baseAnimal) throw new Error(`Unknown base animal for combat creature ${creature.id}: ${creature.baseAnimalId}`);

  const biology = deriveCreatureBiology(creature, catalog);
  const metrics = emptyMetrics();
  for (const tag of [...baseAnimal.bodyPlanTags, ...baseAnimal.biologicalTags]) {
    applyMetricDelta(metrics, TAG_METRIC_DELTAS[tag]);
  }

  const activeCapabilities = new Set<string>(biology.capabilityIds);
  const capabilityStrength = new Map<string, number>();
  for (const hook of baseAnimal.baselineCapabilityHooks) {
    if (activeCapabilities.has(hook)) capabilityStrength.set(hook, 1);
  }

  const functionalExpressions = biology.expressions.filter((expression) => expression.currentlyFunctional);
  for (const expression of functionalExpressions) {
    const quality = expressionQuality(expression);
    for (const capabilityId of expression.capabilityIds) {
      if (!activeCapabilities.has(capabilityId)) continue;
      capabilityStrength.set(capabilityId, Math.max(capabilityStrength.get(capabilityId) ?? 0, quality));
    }
  }

  for (const [capabilityId, strength] of capabilityStrength) {
    applyMetricDelta(metrics, CAPABILITY_METRIC_DELTAS[capabilityId], strength);
  }

  metrics.reliability += (biology.stability - 0.5) * 30;
  if (functionalExpressions.length > 0) {
    const meanExpressionReliability = functionalExpressions.reduce((sum, expression) => sum + expression.reliability, 0)
      / functionalExpressions.length;
    metrics.reliability += (meanExpressionReliability - 0.5) * 10;
  }

  for (const key of COMBAT_METRIC_KEYS) metrics[key] = clampMetric(metrics[key]);
  return metrics;
}

export function deriveLegalCombatActions(
  creature: CreatureState,
  catalog: DomainContentCatalog,
  rules: readonly CombatActionRule[] = PROTOTYPE_COMBAT_ACTION_RULES,
): readonly LegalCombatAction[] {
  const capabilities = new Set<string>(deriveCreatureBiology(creature, catalog).capabilityIds);
  return rules
    .filter((rule) => rule.requiredCapabilityIds.every((capabilityId) => capabilities.has(capabilityId)))
    .map((rule) => ({ ...rule, supportingCapabilityIds: [...rule.requiredCapabilityIds] }));
}

export function deriveCreatureCombatProfile(
  creature: CreatureState,
  catalog: DomainContentCatalog,
  rules: readonly CombatActionRule[] = PROTOTYPE_COMBAT_ACTION_RULES,
): CreatureCombatProfile {
  const biology = deriveCreatureBiology(creature, catalog);
  return {
    creatureId: creature.id,
    metrics: deriveCombatMetrics(creature, catalog),
    capabilityIds: [...biology.capabilityIds],
    legalActions: deriveLegalCombatActions(creature, catalog, rules),
  };
}
