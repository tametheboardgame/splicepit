import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { ENEMY_CREATURES } from '../data/animals.js';
import { ACTIONS } from '../input/actions.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import { createCombatant, isDefeated, resolveAttack, resolveTrait } from '../systems/battleSystem.js';
import type { BattleAction } from '../systems/battleSystem.js';
import type { Combatant } from '../types.js';
import { addNoiseLines, wrappedText } from '../ui/helpers.js';
import { addButton, FocusMenu } from '../ui/primitives.js';
import { fadeIn, restartWithFade, transitionTo } from '../ui/transitions.js';
import { drawCreature } from '../render/CreatureRenderer.js';

export class BattleScene extends Phaser.Scene {
  player!: Combatant;
  enemy!: Combatant;
  busy = false;
  finished = false;
  playerName!: Phaser.GameObjects.Text;
  enemyName!: Phaser.GameObjects.Text;
  playerHp!: Phaser.GameObjects.Text;
  enemyHp!: Phaser.GameObjects.Text;
  log!: Phaser.GameObjects.Text;
  semanticInput!: SemanticInput;
  actionMenu!: FocusMenu;
  postBattleMenu: FocusMenu | null = null;

  constructor() { super('Battle'); }

  create(): void {
    if (!gameState.currentCreature) { transitionTo(this, 'Lab', { duration: 0 }); return; }
    this.player = createCombatant(gameState.currentCreature);
    const enemyData = ENEMY_CREATURES.pit_scrap;
    this.enemy = createCombatant({ ...enemyData, genes: enemyData.genes }, enemyData.name);
    this.busy = false; this.finished = false; this.postBattleMenu = null;
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep); fadeIn(this); this.drawPit(); addNoiseLines(this, 100, 0.06);
    this.add.text(46, 28, t('battle.eyebrow'), { ...TEXT.mono, fontSize: '11px', color: '#a0573d' });
    this.add.text(46, 50, t('battle.title'), { ...TEXT.title, fontSize: '32px' });
    drawCreature(this, 275, 285, gameState.currentCreature, { scale: 1.2 });
    drawCreature(this, 710, 275, { ...enemyData, mutation: null }, { scale: 1.15, flip: true, enemy: true });
    this.playerName = this.add.text(76, 132, this.player.name, { ...TEXT.title, fontSize: '21px' });
    this.enemyName = this.add.text(585, 132, this.enemy.name, { ...TEXT.title, fontSize: '21px' });
    this.playerHp = this.add.text(78, 163, '', { ...TEXT.mono, fontSize: '11px' });
    this.enemyHp = this.add.text(587, 163, '', { ...TEXT.mono, fontSize: '11px' });
    this.log = wrappedText(this, 70, 390, t('battle.openingLog'), 820, { fontSize: '16px', lineSpacing: 4 });

    this.semanticInput = new SemanticInput(this);
    const attack = addButton(this, 185, 500, 200, t('battle.attack'), () => this.takeTurn('attack'), { accent: PALETTE.rust });
    const trait = addButton(this, 480, 500, 200, t('battle.trait'), () => this.takeTurn('trait'), { accent: PALETTE.acid });
    const brace = addButton(this, 775, 500, 200, t('battle.brace'), () => this.takeTurn('guard'), { accent: PALETTE.moss });
    this.actionMenu = new FocusMenu(this.semanticInput, [attack, trait, brace], 'horizontal');
    this.updateHud();
  }

  update(): void {
    if (this.finished) {
      this.postBattleMenu?.update();
      return;
    }
    this.actionMenu.update();
    if (this.semanticInput.justDown(ACTIONS.BATTLE_PRIMARY)) this.takeTurn('attack');
    else if (this.semanticInput.justDown(ACTIONS.BATTLE_SECONDARY)) this.takeTurn('trait');
    else if (this.semanticInput.justDown(ACTIONS.BATTLE_TERTIARY)) this.takeTurn('guard');
  }

  private drawPit(): void {
    const g = this.add.graphics(); g.fillStyle(0x383128, 1); g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0x555044, 0.55); g.fillEllipse(480, 300, 850, 310); g.lineStyle(7, PALETTE.bone, 0.28); g.strokeEllipse(480, 300, 850, 310);
    g.lineStyle(2, PALETTE.rust, 0.25);
    for (let i = 0; i < 18; i += 1) {
      const a = (Math.PI * 2 / 18) * i;
      g.lineBetween(480 + Math.cos(a) * 370, 300 + Math.sin(a) * 130, 480 + Math.cos(a) * 425, 300 + Math.sin(a) * 155);
    }
    g.fillStyle(PALETTE.blood, 0.18); g.fillEllipse(512, 318, 230, 60); g.fillEllipse(300, 285, 80, 30);
  }

  private updateHud(): void {
    this.playerHp.setText(t('battle.hp', { current: this.player.hp, maximum: this.player.stats.maxHp }));
    this.enemyHp.setText(t('battle.hp', { current: this.enemy.hp, maximum: this.enemy.stats.maxHp }));
  }

  takeTurn(action: BattleAction): void {
    if (this.busy || this.finished) return;
    this.busy = true;
    let first = '';
    if (action === 'attack') first = resolveAttack(this.player, this.enemy);
    if (action === 'trait') first = resolveTrait(this.player, this.enemy);
    if (action === 'guard') { this.player.guarding = true; first = t('battle.guard', { name: this.player.name }); }
    this.updateHud(); this.log.setText(first);
    if (isDefeated(this.enemy)) { this.finish(true); return; }
    this.time.delayedCall(650, () => {
      const enemyAction = Math.random() < 0.28 ? 'trait' : 'attack';
      const second = enemyAction === 'trait' ? resolveTrait(this.enemy, this.player) : resolveAttack(this.enemy, this.player);
      this.log.setText(`${first}\n${second}`); this.updateHud();
      if (isDefeated(this.player)) this.finish(false); else this.busy = false;
    });
  }

  private finish(won: boolean): void {
    this.finished = true; this.busy = false; this.actionMenu.setEnabled(false);
    if (won) {
      gameState.recordWin(30); saveGame();
      this.log.setText(t('battle.win'));
      this.cameras.main.flash(220, 183, 200, 108, false);
    } else {
      this.log.setText(t('battle.loss'));
    }
    this.time.delayedCall(850, () => {
      const button = addButton(this, 480, 500, 300, won ? t('battle.return') : t('battle.retry'), () => {
        if (won) transitionTo(this, 'Lab'); else restartWithFade(this);
      }, { accent: won ? PALETTE.acid : PALETTE.rust });
      this.postBattleMenu = new FocusMenu(this.semanticInput, [button], 'vertical');
    });
  }
}
