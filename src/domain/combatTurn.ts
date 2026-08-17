import type { RandomFn } from '../random/RandomSource.js';
import type {
  CombatActionRole,
  CreatureCombatProfile,
  LegalCombatAction,
} from './combat.js';

export type CombatCadenceVariant = 'alternating' | 'initiative_rounds' | 'simultaneous_declaration';

/**
 * WP0.4B candidate selected for human playtest. This is not promoted to the
 * decision log until the player-facing gate is accepted.
 */
export const CANDIDATE_COMBAT_CADENCE: CombatCadenceVariant = 'initiative_rounds';
export const RECOVER_BREATH_ACTION_ID = 'combat.system.recover_breath';

export interface CombatActionEconomy {
  metabolicCost: number;
  cooldownRounds: number;
  speedModifier: number;
  setupCost: number;
  setupGain: number;
}

export interface CombatantTurnState {
  id: string;
  name: string;
  profile: CreatureCombatProfile;
  hp: number;
  maxHp: number;
  metabolicReserve: number;
  maxMetabolicReserve: number;
  setup: number;
  guarding: boolean;
  cooldownAvailableFromRound: Record<string, number>;
}

export interface CombatTurnState {
  round: number;
  cadence: CombatCadenceVariant;
  combatants: CombatantTurnState[];
  events: CombatEvent[];
}

export interface CombatDeclaration {
  actorId: string;
  targetId: string;
  actionId: string;
}

export type CombatEventType =
  | 'round_start'
  | 'action'
  | 'miss'
  | 'damage'
  | 'guard'
  | 'setup'
  | 'recover'
  | 'cooldown'
  | 'defeat'
  | 'round_end';

export interface CombatEvent {
  round: number;
  sequence: number;
  type: CombatEventType;
  actorId: string | null;
  targetId: string | null;
  actionId: string | null;
  message: string;
}

export interface CadenceComparisonRow {
  variant: CombatCadenceVariant;
  readablePlanningWindow: boolean;
  biologyAffectsOrder: boolean;
  preservesOneDecisionPerCreaturePerRound: boolean;
  reactiveEffectsStayReadable: boolean;
  multiCreatureScalingRisk: 'low' | 'medium' | 'high';
  summary: string;
}

const ROLE_ECONOMY: Readonly<Record<CombatActionRole, CombatActionEconomy>> = {
  offence: { metabolicCost: 18, cooldownRounds: 0, speedModifier: 0, setupCost: 0, setupGain: 0 },
  defence: { metabolicCost: 8, cooldownRounds: 0, speedModifier: 24, setupCost: 0, setupGain: 1 },
  mobility: { metabolicCost: 12, cooldownRounds: 0, speedModifier: 16, setupCost: 0, setupGain: 1 },
  recovery: { metabolicCost: 18, cooldownRounds: 1, speedModifier: -10, setupCost: 0, setupGain: 0 },
  sense: { metabolicCost: 6, cooldownRounds: 0, speedModifier: 14, setupCost: 0, setupGain: 1 },
  concealment: { metabolicCost: 10, cooldownRounds: 0, speedModifier: 12, setupCost: 0, setupGain: 1 },
  control: { metabolicCost: 10, cooldownRounds: 0, speedModifier: 8, setupCost: 0, setupGain: 1 },
};

const ACTION_ECONOMY_OVERRIDES: Readonly<Record<string, Partial<CombatActionEconomy>>> = {
  'combat.burst_lunge': { metabolicCost: 34, cooldownRounds: 2, speedModifier: -4, setupCost: 1 },
  'combat.impact_charge': { metabolicCost: 32, cooldownRounds: 2, speedModifier: -8, setupCost: 1 },
  'combat.electrical_discharge': { metabolicCost: 30, cooldownRounds: 2, speedModifier: -2 },
  'combat.regrow_tissue': { metabolicCost: 28, cooldownRounds: 2, speedModifier: -14 },
  'combat.wound_repair': { metabolicCost: 22, cooldownRounds: 1, speedModifier: -8 },
  'combat.sprint_burst': { metabolicCost: 20, cooldownRounds: 1, speedModifier: 20, setupGain: 2 },
  'combat.horn_strike': { metabolicCost: 20, cooldownRounds: 1, speedModifier: -2 },
  'combat.ram': { metabolicCost: 22, cooldownRounds: 1, speedModifier: -4 },
  'combat.body_drive': { metabolicCost: 22, cooldownRounds: 1, speedModifier: -6 },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function actionEconomyFor(action: LegalCombatAction): CombatActionEconomy {
  const base = ROLE_ECONOMY[action.role];
  const override = ACTION_ECONOMY_OVERRIDES[action.id] ?? {};
  return { ...base, ...override };
}

export function createTurnCombatant(
  id: string,
  name: string,
  profile: CreatureCombatProfile,
): CombatantTurnState {
  const maxHp = Math.round(70 + profile.metrics.vitality * 1.25);
  const maxMetabolicReserve = Math.round(clamp(45 + profile.metrics.metabolicCapacity * 0.55, 55, 100));
  return {
    id,
    name,
    profile,
    hp: maxHp,
    maxHp,
    metabolicReserve: maxMetabolicReserve,
    maxMetabolicReserve,
    setup: 0,
    guarding: false,
    cooldownAvailableFromRound: {},
  };
}

export function createCombatTurnState(
  combatants: readonly CombatantTurnState[],
  cadence: CombatCadenceVariant = CANDIDATE_COMBAT_CADENCE,
): CombatTurnState {
  if (combatants.length < 2) throw new Error('Combat requires at least two combatants.');
  return {
    round: 0,
    cadence,
    combatants: combatants.map((combatant) => structuredClone(combatant)),
    events: [],
  };
}

export function findAction(combatant: CombatantTurnState, actionId: string): LegalCombatAction | null {
  return combatant.profile.legalActions.find((action) => action.id === actionId) ?? null;
}

export function canDeclareAction(
  combatant: CombatantTurnState,
  actionId: string,
  round = 1,
): boolean {
  if (combatant.hp <= 0) return false;
  if (actionId === RECOVER_BREATH_ACTION_ID) return true;
  const action = findAction(combatant, actionId);
  if (!action) return false;
  const economy = actionEconomyFor(action);
  const availableFromRound = combatant.cooldownAvailableFromRound[actionId] ?? 1;
  return round >= availableFromRound
    && combatant.metabolicReserve >= economy.metabolicCost
    && combatant.setup >= economy.setupCost;
}

export function availableActionIdsForNextRound(combatant: CombatantTurnState, currentRound: number): string[] {
  const nextRound = currentRound + 1;
  return [
    ...combatant.profile.legalActions
      .filter((action) => canDeclareAction(combatant, action.id, nextRound))
      .map((action) => action.id),
    RECOVER_BREATH_ACTION_ID,
  ];
}

function actionInitiative(combatant: CombatantTurnState, actionId: string): number {
  if (actionId === RECOVER_BREATH_ACTION_ID) {
    return combatant.profile.metrics.mobility * 0.25 + combatant.profile.metrics.perception * 0.1 - 18;
  }
  const action = findAction(combatant, actionId);
  if (!action) return Number.NEGATIVE_INFINITY;
  const economy = actionEconomyFor(action);
  return economy.speedModifier
    + combatant.profile.metrics.mobility * 0.45
    + combatant.profile.metrics.perception * 0.25
    + combatant.setup * 5;
}

export function orderDeclarations(
  cadence: CombatCadenceVariant,
  combatants: readonly CombatantTurnState[],
  declarations: readonly CombatDeclaration[],
): CombatDeclaration[] {
  if (cadence === 'alternating' || cadence === 'simultaneous_declaration') return declarations.map((value) => ({ ...value }));

  const byId = new Map(combatants.map((combatant) => [combatant.id, combatant]));
  return [...declarations].sort((left, right) => {
    const leftActor = byId.get(left.actorId);
    const rightActor = byId.get(right.actorId);
    if (!leftActor || !rightActor) return left.actorId.localeCompare(right.actorId);
    const initiativeDelta = actionInitiative(rightActor, right.actionId) - actionInitiative(leftActor, left.actionId);
    if (Math.abs(initiativeDelta) > 0.0001) return initiativeDelta;
    return left.actorId.localeCompare(right.actorId);
  });
}

function event(
  events: CombatEvent[],
  round: number,
  type: CombatEventType,
  message: string,
  actorId: string | null = null,
  targetId: string | null = null,
  actionId: string | null = null,
): void {
  events.push({ round, sequence: events.length + 1, type, actorId, targetId, actionId, message });
}

function attackDamage(attacker: CombatantTurnState, defender: CombatantTurnState, action: LegalCombatAction, random: RandomFn): number {
  const primary = attacker.profile.metrics[action.primaryMetric];
  const secondary = action.secondaryMetric ? attacker.profile.metrics[action.secondaryMetric] : 50;
  const offensiveValue = primary * 0.72 + secondary * 0.22 + attacker.profile.metrics.mass * 0.08;
  const resistance = defender.profile.metrics.protection * 0.42 + defender.profile.metrics.vitality * 0.08;
  const variance = 0.9 + random() * 0.2;
  const guardMultiplier = defender.guarding ? 0.52 : 1;
  return Math.max(1, Math.round(Math.max(4, (offensiveValue - resistance) * 0.32) * variance * guardMultiplier));
}

function attackHits(attacker: CombatantTurnState, defender: CombatantTurnState, random: RandomFn): boolean {
  const accuracy = clamp(
    0.66
      + (attacker.profile.metrics.perception - defender.profile.metrics.mobility) * 0.003
      + (attacker.profile.metrics.reliability - 50) * 0.0025
      + attacker.setup * 0.06,
    0.3,
    0.96,
  );
  return random() <= accuracy;
}

function applyAction(
  actor: CombatantTurnState,
  target: CombatantTurnState,
  action: LegalCombatAction,
  round: number,
  random: RandomFn,
  events: CombatEvent[],
): void {
  const economy = actionEconomyFor(action);
  actor.metabolicReserve = round1(Math.max(0, actor.metabolicReserve - economy.metabolicCost));
  actor.setup = Math.max(0, actor.setup - economy.setupCost);
  if (economy.cooldownRounds > 0) {
    actor.cooldownAvailableFromRound[action.id] = round + economy.cooldownRounds + 1;
  }

  event(events, round, 'action', `${actor.name} uses ${action.name} (${economy.metabolicCost} reserve).`, actor.id, target.id, action.id);

  if (action.role === 'offence') {
    if (!attackHits(actor, target, random)) {
      event(events, round, 'miss', `${actor.name}'s ${action.name} misses.`, actor.id, target.id, action.id);
      return;
    }
    const damage = attackDamage(actor, target, action, random);
    target.hp = Math.max(0, target.hp - damage);
    const guardText = target.guarding ? ' through the guard' : '';
    event(events, round, 'damage', `${target.name} takes ${damage} damage${guardText}.`, actor.id, target.id, action.id);
    if (target.hp <= 0) event(events, round, 'defeat', `${target.name} can no longer continue.`, actor.id, target.id, action.id);
    return;
  }

  if (action.role === 'defence') {
    actor.guarding = true;
    actor.setup = Math.min(2, actor.setup + economy.setupGain);
    event(events, round, 'guard', `${actor.name} braces and prepares a cleaner follow-up.`, actor.id, actor.id, action.id);
    return;
  }

  if (action.role === 'recovery') {
    const heal = Math.max(1, Math.round(4 + actor.profile.metrics.vitality * 0.1));
    const before = actor.hp;
    actor.hp = Math.min(actor.maxHp, actor.hp + heal);
    event(events, round, 'recover', `${actor.name} restores ${actor.hp - before} vitality.`, actor.id, actor.id, action.id);
    return;
  }

  actor.setup = Math.min(2, actor.setup + economy.setupGain);
  event(events, round, 'setup', `${actor.name} gains ${economy.setupGain} setup (${actor.setup}/2).`, actor.id, actor.id, action.id);
}

function recoverBreath(actor: CombatantTurnState, round: number, events: CombatEvent[]): void {
  const amount = Math.round(actor.maxMetabolicReserve * 0.28);
  const before = actor.metabolicReserve;
  actor.metabolicReserve = Math.min(actor.maxMetabolicReserve, actor.metabolicReserve + amount);
  actor.setup = Math.min(2, actor.setup + 1);
  event(events, round, 'recover', `${actor.name} recovers breath: +${round1(actor.metabolicReserve - before)} reserve and +1 setup.`, actor.id, actor.id, RECOVER_BREATH_ACTION_ID);
}

function passiveRecovery(combatant: CombatantTurnState): number {
  return round1(4 + combatant.profile.metrics.metabolicCapacity * 0.08);
}

function validateDeclarations(state: CombatTurnState, declarations: readonly CombatDeclaration[], round: number): void {
  const living = state.combatants.filter((combatant) => combatant.hp > 0);
  const seen = new Set<string>();
  for (const declaration of declarations) {
    if (seen.has(declaration.actorId)) throw new Error(`Combatant ${declaration.actorId} declared more than one action in round ${round}.`);
    seen.add(declaration.actorId);
    const actor = state.combatants.find((combatant) => combatant.id === declaration.actorId);
    const target = state.combatants.find((combatant) => combatant.id === declaration.targetId);
    if (!actor || !target) throw new Error(`Unknown combat declaration participant in round ${round}.`);
    if (!canDeclareAction(actor, declaration.actionId, round)) throw new Error(`${actor.name} cannot declare ${declaration.actionId} in round ${round}.`);
  }
  for (const combatant of living) {
    if (!seen.has(combatant.id)) throw new Error(`Living combatant ${combatant.name} has no declaration for round ${round}.`);
  }
}

export function resolveCombatRound(
  source: CombatTurnState,
  declarations: readonly CombatDeclaration[],
  random: RandomFn,
): CombatTurnState {
  const state = structuredClone(source);
  const round = state.round + 1;
  state.round = round;
  state.events = [];
  for (const combatant of state.combatants) combatant.guarding = false;
  validateDeclarations(state, declarations, round);
  event(state.events, round, 'round_start', `Round ${round}: both handlers commit their actions.`);

  const ordered = orderDeclarations(state.cadence, state.combatants, declarations);
  for (const declaration of ordered) {
    const actor = state.combatants.find((combatant) => combatant.id === declaration.actorId);
    const target = state.combatants.find((combatant) => combatant.id === declaration.targetId);
    if (!actor || !target || actor.hp <= 0) continue;
    if (declaration.actionId === RECOVER_BREATH_ACTION_ID) {
      recoverBreath(actor, round, state.events);
      continue;
    }
    const action = findAction(actor, declaration.actionId);
    if (!action) throw new Error(`Unknown action ${declaration.actionId}.`);
    applyAction(actor, target, action, round, random, state.events);
  }

  for (const combatant of state.combatants) {
    if (combatant.hp <= 0) continue;
    const recovery = passiveRecovery(combatant);
    const before = combatant.metabolicReserve;
    combatant.metabolicReserve = Math.min(combatant.maxMetabolicReserve, round1(combatant.metabolicReserve + recovery));
    if (combatant.metabolicReserve > before) {
      event(state.events, round, 'recover', `${combatant.name} passively recovers ${round1(combatant.metabolicReserve - before)} reserve.`, combatant.id, combatant.id, null);
    }
  }
  event(state.events, round, 'round_end', `Round ${round} ends.`);
  return state;
}

/**
 * Small explicit comparison matrix recorded by WP0.4B. Automated fixtures use
 * the same order planner to demonstrate the practical differences; final
 * acceptance still requires the browser human-playtest gate.
 */
export const CADENCE_COMPARISON: readonly CadenceComparisonRow[] = [
  {
    variant: 'alternating',
    readablePlanningWindow: true,
    biologyAffectsOrder: false,
    preservesOneDecisionPerCreaturePerRound: true,
    reactiveEffectsStayReadable: true,
    multiCreatureScalingRisk: 'medium',
    summary: 'Very readable, but fixed first/second turns make mobility and fast defensive biology matter less than intended.',
  },
  {
    variant: 'initiative_rounds',
    readablePlanningWindow: true,
    biologyAffectsOrder: true,
    preservesOneDecisionPerCreaturePerRound: true,
    reactiveEffectsStayReadable: true,
    multiCreatureScalingRisk: 'low',
    summary: 'Both sides commit once per round, then action speed plus biology determines a deterministic resolution order.',
  },
  {
    variant: 'simultaneous_declaration',
    readablePlanningWindow: true,
    biologyAffectsOrder: false,
    preservesOneDecisionPerCreaturePerRound: true,
    reactiveEffectsStayReadable: false,
    multiCreatureScalingRisk: 'high',
    summary: 'Interesting commitment mind-game, but true simultaneous effects make guards, interrupts, defeats and later teams harder to explain.',
  },
];
