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
import { wrappedText } from '../ui/helpers.js';
import { addButton, FocusMenu, type ButtonControl } from '../ui/primitives.js';
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
    economy.cooldownRounds > 0 ? `CD ${economy.cooldownRounds}` : null,
    economy.setupCost > 0 ? `SET ${economy.setupCost}` : null,
  ].filter(Boolean).join(' · ');
  return `${action.name} · MET ${economy.metabolicCost}${extras ? ` · ${extras}` : ''}`;
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
    this.cameras.main.setBackgroundColor(PALETTE.sky);
    fadeIn(this);
    this.state = buildState();
    this.semanticInput = new SemanticInput(this);

    this.drawArena();
    this.add.text(28, 20, 'WP0.4B COMBAT CADENCE PLAYTEST', {
      ...TEXT.mono,
      fontSize: '10px',
      color: '#392c35',
      backgroundColor: '#d8f64b',
      padding: { x: 8, y: 5 },
    }).setRotation(-0.012);
    this.add.text(28, 49, 'Initiative Rounds', {
      ...TEXT.title,
      fontSize: '29px',
      color: '#fff2bd',
      stroke: '#392c35',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#ff78ad', blur: 0, fill: true },
    });
    this.add.text(29, 89, 'Pick one action. Both creatures commit, then speed + biology decides who actually moves first.', {
      ...TEXT.body,
      fontSize: '13px',
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 8, y: 5 },
    });

    addButton(this, 865, 36, 150, 'Reset spar', () => this.resetSpar(), { accent: PALETTE.candy });
    addButton(this, 700, 36, 150, 'Back to title', () => this.returnToTitle(), { accent: PALETTE.acid });

    this.roundStatus = this.add.text(480, 132, '', {
      ...TEXT.mono,
      fontSize: '11px',
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 0);

    this.playerStatus = wrappedText(this, 92, 248, '', 250, {
      fontSize: '13px',
      lineSpacing: 2,
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 9, y: 7 },
    });
    this.opponentStatus = wrappedText(this, 688, 248, '', 250, {
      fontSize: '13px',
      lineSpacing: 2,
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 9, y: 7 },
    });
    this.logText = wrappedText(this, 348, 176, '', 265, {
      fontSize: '12px',
      lineSpacing: 2,
      color: '#392c35',
      backgroundColor: '#fff2bd',
      padding: { x: 10, y: 8 },
    });

    const player = this.player();
    const actionEntries: Array<{ id: string; label: string; accent: number }> = player.profile.legalActions.map((action) => ({
      id: action.id,
      label: actionLabel(action),
      accent: action.role === 'offence' ? PALETTE.rust : action.role === 'defence' ? PALETTE.moss : PALETTE.bruise,
    }));
    actionEntries.push({ id: RECOVER_BREATH_ACTION_ID, label: 'Recover Breath · MET 0', accent: PALETTE.acid });

    this.add.text(30, 324, 'WHAT DOES THIS THING DO?', {
      ...TEXT.title,
      fontSize: '20px',
      color: '#392c35',
      backgroundColor: '#ff78ad',
      padding: { x: 8, y: 4 },
    }).setRotation(0.01);

    const controls: ButtonControl[] = [];
    const columns = actionEntries.length > 8 ? 4 : 3;
    const width = columns === 4 ? 210 : 280;
    const gap = columns === 4 ? 230 : 305;
    const firstX = columns === 4 ? 120 : 175;
    const firstY = 383;
    const rowGap = 48;

    actionEntries.forEach((entry, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const button = addButton(this, firstX + column * gap, firstY + row * rowGap, width, entry.label, () => this.commit(entry.id), { accent: entry.accent });
      this.actionButtons.set(entry.id, button);
      controls.push(button);
    });
    this.menu = new FocusMenu(this.semanticInput, controls, 'vertical');
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

    this.roundStatus.setText(`ROUND ${this.state.round} DONE · CHOOSING ROUND ${nextRound}`);
    this.playerStatus.setText([
      `${player.name}`,
      `Vitality ${player.hp}/${player.maxHp} · Reserve ${player.metabolicReserve}/${player.maxMetabolicReserve}`,
      `Setup ${player.setup}/2 · ${this.cooldownSummary(player.cooldownAvailableFromRound, nextRound)}`,
    ]);
    this.opponentStatus.setText([
      `${opponent.name}`,
      `Vitality ${opponent.hp}/${opponent.maxHp} · Reserve ${opponent.metabolicReserve}/${opponent.maxMetabolicReserve}`,
      `Setup ${opponent.setup}/2 · ${this.cooldownSummary(opponent.cooldownAvailableFromRound, nextRound)}`,
    ]);

    const messages = this.state.events.length === 0
      ? [
          'Try a setup action before Burst Lunge. Then see what reserve and cooldown do to the next choice.',
          'Fast defence can resolve before a slower committed attack.',
        ]
      : this.state.events.slice(-4).map((value) => value.message);
    if (finished) messages.push(player.hp <= 0 ? 'The goat wins. Embarrassing.' : 'Burstwire Rabbit wins. Concerning.');
    this.logText.setText(messages.join('\n'));

    for (const [actionId, button] of this.actionButtons) {
      button.setEnabled(!finished && playerAvailable.has(actionId));
    }
  }

  private cooldownSummary(cooldowns: Record<string, number>, nextRound: number): string {
    const active = Object.entries(cooldowns)
      .filter(([, availableFrom]) => availableFrom > nextRound)
      .map(([actionId, availableFrom]) => `${actionId.replace('combat.', '')}→R${availableFrom}`);
    return active.length > 0 ? `Cooldown ${active.join(', ')}` : 'No cooldown';
  }

  private resetSpar(): void {
    this.state = buildState();
    this.render();
  }

  private returnToTitle(): void {
    const url = new URL(globalThis.location.href);
    url.searchParams.delete('combatPlaytest');
    globalThis.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    transitionTo(this, 'Title');
  }

  private drawArena(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.sky, 1); g.fillRect(0, 0, 960, 540);
    g.fillStyle(0xffffff, 0.78); g.fillCircle(165, 72, 34); g.fillCircle(197, 77, 25); g.fillCircle(132, 82, 24);
    g.fillStyle(0xffffff, 0.72); g.fillCircle(820, 104, 30); g.fillCircle(850, 108, 22); g.fillCircle(792, 112, 20);
    g.fillStyle(PALETTE.grassLight, 1); g.fillEllipse(238, 371, 700, 250);
    g.fillStyle(PALETTE.grass, 1); g.fillEllipse(735, 390, 820, 275);

    // The actual Fit Pit is painted into the field instead of being another UI box.
    g.fillStyle(0xe7b86f, 1); g.fillEllipse(480, 252, 700, 210);
    g.lineStyle(8, PALETTE.inkDark, 0.34); g.strokeEllipse(480, 252, 700, 210);
    g.lineStyle(5, PALETTE.bone, 1);
    g.lineBetween(96, 194, 864, 194); g.lineBetween(104, 302, 856, 302);
    for (let x = 118; x <= 842; x += 64) g.lineBetween(x, 173, x - 4, 318);

    this.drawRabbit(g, 246, 228);
    this.drawGoat(g, 714, 229);

    // Cheerful little flowers around the illegal animal-fighting venue.
    for (let i = 0; i < 17; i += 1) {
      const x = 25 + ((i * 113) % 910);
      const y = 293 + ((i * 43) % 65);
      const colour = [PALETTE.candy, PALETTE.yolk, PALETTE.bruise][i % 3];
      g.fillStyle(colour, 0.95); g.fillCircle(x - 3, y, 3); g.fillCircle(x + 3, y, 3); g.fillCircle(x, y - 3, 3);
      g.fillStyle(PALETTE.bone, 1); g.fillCircle(x, y, 2);
    }
  }

  private drawRabbit(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(PALETTE.candy, 1); g.lineStyle(5, PALETTE.inkDark, 0.92);
    g.fillEllipse(x, y, 92, 62); g.strokeEllipse(x, y, 92, 62);
    g.fillCircle(x + 35, y - 30, 29); g.strokeCircle(x + 35, y - 30, 29);
    g.fillEllipse(x + 22, y - 70, 20, 58); g.strokeEllipse(x + 22, y - 70, 20, 58);
    g.fillEllipse(x + 47, y - 72, 18, 61); g.strokeEllipse(x + 47, y - 72, 18, 61);
    g.fillStyle(PALETTE.acid, 1); g.fillCircle(x + 45, y - 34, 8);
    g.fillStyle(PALETTE.inkDark, 1); g.fillCircle(x + 47, y - 34, 4);
    g.lineStyle(9, PALETTE.bruise, 1); g.lineBetween(x - 20, y + 18, x - 42, y + 54); g.lineBetween(x + 12, y + 22, x + 8, y + 59);
    g.lineStyle(7, PALETTE.rust, 0.95); g.lineBetween(x - 28, y - 8, x - 67, y - 29); g.lineBetween(x - 67, y - 29, x - 76, y - 7);
    g.lineBetween(x - 23, y + 3, x - 72, y + 23);
    g.fillStyle(0x55dce1, 0.76); g.fillRoundedRect(x - 15, y - 61, 25, 51, 10); g.lineStyle(4, PALETTE.inkDark, 0.9); g.strokeRoundedRect(x - 15, y - 61, 25, 51, 10);
    g.fillStyle(PALETTE.acid, 0.9); g.fillCircle(x - 3, y - 26, 8);
  }

  private drawGoat(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(PALETTE.bone, 1); g.lineStyle(5, PALETTE.inkDark, 0.92);
    g.fillEllipse(x, y, 105, 66); g.strokeEllipse(x, y, 105, 66);
    g.fillEllipse(x - 40, y - 38, 48, 42); g.strokeEllipse(x - 40, y - 38, 48, 42);
    g.lineStyle(7, PALETTE.grape, 1); g.lineBetween(x - 52, y - 55, x - 69, y - 82); g.lineBetween(x - 29, y - 57, x - 14, y - 83);
    g.lineStyle(8, PALETTE.inkDark, 0.9); g.lineBetween(x - 25, y + 24, x - 32, y + 62); g.lineBetween(x + 30, y + 23, x + 37, y + 61);
    g.fillStyle(PALETTE.inkDark, 1); g.fillCircle(x - 51, y - 40, 4);
    g.fillStyle(PALETTE.rust, 0.88); g.fillCircle(x - 61, y - 29, 6);
  }
}
