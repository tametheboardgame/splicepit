import { normalisePlayerIdentity } from '../player/identity.js';
import type { ProtagonistId } from '../player/protagonists.js';
import type { CreatureRecord, GameStateSnapshot, QuestStage } from '../types.js';

export const INITIAL: GameStateSnapshot = {
  avatarId: null,
  playerName: null,
  hasBaseAnimal: false,
  baseAnimalId: null,
  collectedGenes: [],
  currentCreature: null,
  coins: 12,
  debt: 860,
  fitPitWins: 0,
  questStage: 'find_animal',
  seenIntro: false,
};

class GameStateStore implements GameStateSnapshot {
  avatarId: ProtagonistId | null = null;
  playerName: string | null = null;
  hasBaseAnimal = false;
  baseAnimalId: string | null = null;
  collectedGenes: string[] = [];
  currentCreature: CreatureRecord | null = null;
  coins = 12;
  debt = 860;
  fitPitWins = 0;
  questStage: QuestStage = 'find_animal';
  seenIntro = false;

  constructor() {
    this.reset();
  }

  reset(): void {
    const fresh = structuredClone(INITIAL);
    this.avatarId = fresh.avatarId;
    this.playerName = fresh.playerName;
    this.hasBaseAnimal = fresh.hasBaseAnimal;
    this.baseAnimalId = fresh.baseAnimalId;
    this.collectedGenes = fresh.collectedGenes;
    this.currentCreature = fresh.currentCreature;
    this.coins = fresh.coins;
    this.debt = fresh.debt;
    this.fitPitWins = fresh.fitPitWins;
    this.questStage = fresh.questStage;
    this.seenIntro = fresh.seenIntro;
  }

  hydrate(data: Partial<GameStateSnapshot> = {}): void {
    this.reset();
    Object.assign(this, data);
    this.collectedGenes = Array.isArray(data.collectedGenes) ? [...data.collectedGenes] : [];

    const identity = normalisePlayerIdentity(
      (data as Partial<GameStateSnapshot> & { avatarId?: unknown }).avatarId,
      (data as Partial<GameStateSnapshot> & { playerName?: unknown }).playerName,
    );
    this.avatarId = identity?.avatarId ?? null;
    this.playerName = identity?.playerName ?? null;
  }

  setPlayerIdentity(avatarId: ProtagonistId, playerName: string): boolean {
    const identity = normalisePlayerIdentity(avatarId, playerName);
    if (!identity) return false;
    this.avatarId = identity.avatarId;
    this.playerName = identity.playerName;
    return true;
  }

  acquireAnimal(id: string): void {
    this.hasBaseAnimal = true;
    this.baseAnimalId = id;
    if (this.questStage === 'find_animal') this.questStage = 'collect_genes';
  }

  addGene(id: string): void {
    if (!this.collectedGenes.includes(id)) this.collectedGenes.push(id);
    if (this.hasBaseAnimal && this.collectedGenes.length > 0 && this.questStage === 'collect_genes') {
      this.questStage = 'splice';
    }
  }

  setCreature(creature: CreatureRecord): void {
    this.currentCreature = creature;
    this.questStage = 'fight';
  }

  recordWin(reward = 30): void {
    this.fitPitWins += 1;
    this.coins += reward;
    this.debt = Math.max(0, this.debt - reward);
    this.questStage = 'slice_complete';
  }

  snapshot(): GameStateSnapshot {
    return {
      avatarId: this.avatarId,
      playerName: this.playerName,
      hasBaseAnimal: this.hasBaseAnimal,
      baseAnimalId: this.baseAnimalId,
      collectedGenes: [...this.collectedGenes],
      currentCreature: this.currentCreature ? structuredClone(this.currentCreature) : null,
      coins: this.coins,
      debt: this.debt,
      fitPitWins: this.fitPitWins,
      questStage: this.questStage,
      seenIntro: this.seenIntro,
    };
  }
}

export const gameState = new GameStateStore();
