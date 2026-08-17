import Phaser from 'phaser';
import { PALETTE, TEXT } from '../config.js';
import { BIOLOGY_CONTENT_CATALOG } from '../content/biologyCatalog.js';
import { deriveCreatureCombatProfile, type LegalCombatAction } from '../domain/combat.js';
import {
  CANDIDATE_COMBAT_CADENCE,
  RECOVER_BREATH_ACTION_ID,
  actionEconomyFor,
  availableActionIdsForNextRound,
  createCombatTurnState,
  createTurnCombatant,
  resolveCombatRound,
  type CombatTurnState,
} from '../domain/combatTurn.js';
import { ids } from '../domain/ids.js';
import { emptyArenaCapabilities, type CreatureState, type SpliceExpressionRecord } from '../domain/model.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { runtimeRandomFn } from '../runtime/runtimeRandom.js';
import { addNoiseLines, wrappedText } from '../ui/helpers.js';
import { addButton, addPanel, FocusMenu, type ButtonControl } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

const PLAYER_ID = 'wp0.4b-player';
const OPPONENT_ID = 'wp0.4b-opponent';

function expression(sourcePackageId: string, expressionId: string, capabilityHooks: readonly string[]): SpliceExpressionRecord {
  return {
    sourcePackageId: ids.sourcePackage(sourcePackageId),
    expressionId,
    expressed: true,
    magnitude: 0.8,
    completeness: 0.82,
    efficiency: 0.78,
    reliability: 0.8,
    stability: 0.81,
    biologicalTags: [`playtest.${expressionId}`],
    phenotypeHooks: [],
    capabilityHooks,
    capabilityIds: capabilityHooks.map(ids.capability),
    actionIds: [],
    functional: true,
    notes: 'WP0.4B playtest-only functional expression.',
  };
}

function creature(baseAnimalId: 'rabbit' | 'goat', name: string, player = false): CreatureState {
  const expressions = player ? [
    expression('lion_predatory_suite', 'playtest_burst_system', ['movement.burst', 'offence.power']),
    expression('electric_eel_electrocyte_suite', 'playtest_discharge', ['offence.electrical_discharge']),
    expression('electric_eel_electrocyte_suite', 'playtest_charge', ['resource.bioelectric_charge']),
  ] : [];
  return {
    id: ids.creature(player ? 'wp0_4b_spliced_rabbit' : 'wp0_4b_goat'),
    name,
    baseAnimalId: ids.baseAnimal(baseAnimalId),
    role: 'main',
    lifeState: 'living',
    createdAt: '2026-08-17T20:00:00.000Z',
    estimatedAgeDays: 420,
    phenotypeSeed: player ? 'wp0.4b-player' : 'wp0.4b-opponent',
    spliceHistory: expressions.length === 0 ? [] : [{
      id: ids.spliceAttempt('wp0_4b_playtest_splice'),
      sequence: 1,
      attemptedAt: '2026-08-17T20:00:00.000Z',
      sourcePackageIds: [ids.sourcePackage('lion_predatory_suite'), ids.sourcePackage('electric_eel_electrocyte_suite')],
      consumedMaterialLotIds: [],
      outcomeBand: 'normal_success',
      stabilityBefore: 1,
      stabilityAfter: 0.84,
      complexityAdded: 0.42,
      consequences: { mutationTriggered: false, permanentDamage: false, death: false, injurySeverity: 'none' },
      expressions,
    }],
    mutations: [],
    injuries: [],
    training: [],
    capabilityIds: [],
    arenaCapabilities: emptyArenaCapabilities(),
  };
}

function buildState(): CombatTurnState {
  const playerCreature = creature('rabbit', 'Burstwire Rabbit', true);
  const opponentCreature = creature('goat', 'Sparring Goat');
  const player = createTurnCombatant(PLAYER_ID, playerCreature.name, deriveCreatureCombatProfile(playerCreature, BIOLOGY_CONTENT_CATALOG));
  const opponent = createTurnCombatant(OPPONENT_ID, opponentCreature.name, deriveCreatureCombatProfile(opponentCreature, BIOLOGY_CONTENT_CATALOG));
  return createCombatTurnState([player, opponent], CANDIDATE_COMBAT_CADENCE);
}

function actionLabel(action: LegalCombatAction): string {
  const economy = actionEconomyFor(action);
  const extras = [
    economy.cooldownRounds > 0 ? `CD${economy.cooldownRounds}` : null,
    economy.setupCost > 0 ? `SET${economy.setupCost}` : null,
  ].filter(Boolean).join(' ');
  return `${action.name}  ${economy.metabolicCost}${extras ? `  ${extras}` : ''}`;
}

export class CombatPlaytestScene extends Phaser.Scene {
  private state!: CombatTurnState;
  private semanticInput!: SemanticInput;
  private menu!: FocusMenu;
  private playerStatus!: Phaser.GameObjects.Text;
  private opponentStatus!: Phaser.GameObjects.Text;
  private roundStatus!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private actionButtons = new Map<string, ButtonControl>();

  constructor() { super('CombatPlaytest'); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    fadeIn(this);
    addNoiseLines(this, 120, 0.06);
    this.state = buildState();
    this.semanticInput = new SemanticInput(this);

    this.add.text(34, 22, 'WP0.4B COMBAT CADENCE PLAYTEST', { ...TEXT.mono, fontSize: '12px', color: '#a0573d' });
    this.add.text(34, 43, 'Initiative Rounds', { ...TEXT.title, fontSize: '30px', color: '#e8dfc8' });
    this.add.text(34, 80, 'Choose one action. Both creatures commit, then action speed + biology decides resolution order.', { ...TEXT.body, fontSize: '15px', color: '#a79d88' });

    addPanel(this, 24, 116, 300, 452, 0.82);
    addPanel(this, 342, 116, 594, 178, 0.82);
    addPanel(this, 342, 310, 594, 258, 0.82);

    const player = this.player();
    const controls: ButtonControl[] = [];
    player.profile.legalActions.forEach((action, index) => {
      const button = addButton(this, 174, 148 + index * 48, 268, actionLabel(action), () => this.commit(action.id), {
        accent: action.role === 'offence' ? PALETTE.rust : PALETTE.moss,
      });
      this.actionButtons.set(action.id, button);
      controls.push(button);
    });
    const recoverY = 148 + player.profile.legalActions.length * 48;
    const recover = addButton(this, 174, recoverY, 268, 'Recover Breath  0', () => this.commit(RECOVER_BREATH_ACTION_ID), { accent: PALETTE.acid });
    this.actionButtons.set(RECOVER_BREATH_ACTION_ID, recover);
    controls.push(recover);
    this.menu = new FocusMenu(this.semanticInput, controls, 'vertical');

    this.roundStatus = this.add.text(364, 134, '', { ...TEXT.mono, fontSize: '12px', color: '#b7c86c' });
    this.playerStatus = wrappedText(this, 364, 162, '', 255, { fontSize: '16px', lineSpacing: 3 });
    this.opponentStatus = wrappedText(this, 650, 162, '', 255, { fontSize: '16px', lineSpacing: 3 });
    this.logText = wrappedText(this, 364, 330, '', 548, { fontSize: '14px', lineSpacing: 3 });

    addButton(this, 822, 540, 190, 'Reset spar', () => this.resetSpar(), { accent: PALETTE.bruise });
    addButton(this, 600, 540, 190, 'Back to title', () => transitionTo(this, 'Title'), { accent: PALETTE.moss });
    this.render();
  }

  update(): void {
    this.menu.update();
  }

  private player() {
    const value = this.state.combatants.find((combatant) => combatant.id === PLAYER_ID);
    if (!value) throw new Error('WP0.4B playtest player missing.');
    return value;
  }

  private opponent() {
    const value = this.state.combatants.find((combatant) => combatant.id === OPPONENT_ID);
    if (!value) throw new Error('WP0.4B playtest opponent missing.');
    return value;
  }

  private opponentDeclaration(): string {
    const opponent = this.opponent();
    const available = new Set(availableActionIdsForNextRound(opponent, this.state.round));
    const preference = this.state.round % 3 === 1
      ? ['combat.stable_brace', 'combat.ram', 'combat.ground_reposition', RECOVER_BREATH_ACTION_ID]
      : ['combat.ram', 'combat.stable_brace', 'combat.ground_reposition', RECOVER_BREATH_ACTION_ID];
    return preference.find((actionId) => available.has(actionId)) ?? RECOVER_BREATH_ACTION_ID;
  }

  private commit(actionId: string): void {
    const player = this.player();
    const opponent = this.opponent();
    const available = new Set(availableActionIdsForNextRound(player, this.state.round));
    if (!available.has(actionId) || player.hp <= 0 || opponent.hp <= 0) return;

    const enemyActionId = this.opponentDeclaration();
    this.state = resolveCombatRound(this.state, [
      { actorId: PLAYER_ID, targetId: OPPONENT_ID, actionId },
      { actorId: OPPONENT_ID, targetId: PLAYER_ID, actionId: enemyActionId },
    ], runtimeRandomFn);
    this.render();
  }

  private render(): void {
    const player = this.player();
    const opponent = this.opponent();
    const nextRound = this.state.round + 1;
    const playerAvailable = new Set(availableActionIdsForNextRound(player, this.state.round));
    const finished = player.hp <= 0 || opponent.hp <= 0;

    this.roundStatus.setText(`ROUND ${this.state.round} COMPLETE  •  declaring round ${nextRound}`);
    this.playerStatus.setText([
      `${player.name}`,
      `Vitality ${player.hp}/${player.maxHp}`,
      `Reserve ${player.metabolicReserve}/${player.maxMetabolicReserve}`,
      `Setup ${player.setup}/2`,
      this.cooldownSummary(player.cooldownAvailableFromRound, nextRound),
    ]);
    this.opponentStatus.setText([
      `${opponent.name}`,
      `Vitality ${opponent.hp}/${opponent.maxHp}`,
      `Reserve ${opponent.metabolicReserve}/${opponent.maxMetabolicReserve}`,
      `Setup ${opponent.setup}/2`,
      this.cooldownSummary(opponent.cooldownAvailableFromRound, nextRound),
    ]);

    const messages = this.state.events.length === 0
      ? [
          'Try a setup action before Burst Lunge, then watch what cooldown and reserve do to your next decision.',
          'Fast defence should often resolve before a slower committed attack. Recover Breath is always available, but gives up offensive pressure.',
        ]
      : this.state.events.map((value) => value.message);
    if (finished) messages.push(player.hp <= 0 ? 'PLAYTEST END: the sparring goat wins.' : 'PLAYTEST END: Burstwire Rabbit wins.');
    this.logText.setText(messages.join('\n'));

    for (const [actionId, button] of this.actionButtons) {
      button.setEnabled(!finished && playerAvailable.has(actionId));
    }
  }

  private cooldownSummary(cooldowns: Record<string, number>, nextRound: number): string {
    const active = Object.entries(cooldowns)
      .filter(([, availableFrom]) => availableFrom > nextRound)
      .map(([actionId, availableFrom]) => `${actionId.replace('combat.', '')}→R${availableFrom}`);
    return active.length > 0 ? `Cooldown ${active.join(', ')}` : 'Cooldown none';
  }

  private resetSpar(): void {
    this.state = buildState();
    this.render();
  }
}
