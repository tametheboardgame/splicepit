import type { ContentStatus } from './domain/model.js';
import type { ProtagonistId } from './player/protagonists.js';

export interface CreatureStats {
  maxHp: number;
  attack: number;
  defence: number;
  speed: number;
  stability: number;
}

export type StatKey = keyof CreatureStats;

export interface Mutation {
  id: string;
  name: string;
  stat: StatKey;
  amount: number;
}

export interface GeneDefinition {
  id: string;
  status: ContentStatus;
  name: string;
  source: string;
  description: string;
  complexity: number;
  modifiers: Partial<CreatureStats>;
  trait: string;
}

export interface BaseAnimalDefinition {
  id: string;
  status: ContentStatus;
  name: string;
  description: string;
  stats: CreatureStats;
  body: string;
}

export interface CreatureRecord {
  id: string;
  name: string;
  baseAnimalId: string;
  genes: string[];
  stats: CreatureStats;
  mutation: Mutation | null;
  createdAt: string;
}

export interface EnemyCreatureDefinition {
  id: string;
  status: ContentStatus;
  name: string;
  description: string;
  stats: CreatureStats;
  genes: string[];
  body: string;
}

export interface CreatureVisual {
  genes?: readonly string[];
  mutation?: Mutation | null;
}

export interface BattleCreature {
  name: string;
  stats: Pick<CreatureStats, 'maxHp' | 'attack' | 'defence' | 'speed'> & Partial<Pick<CreatureStats, 'stability'>>;
  genes?: readonly string[];
}

export interface Combatant {
  name: string;
  stats: BattleCreature['stats'];
  hp: number;
  guarding: boolean;
  genes: string[];
}

export type QuestStage = 'find_animal' | 'collect_genes' | 'splice' | 'fight' | 'slice_complete';

export interface GameStateSnapshot {
  avatarId: ProtagonistId | null;
  playerName: string | null;
  hasBaseAnimal: boolean;
  baseAnimalId: string | null;
  collectedGenes: string[];
  currentCreature: CreatureRecord | null;
  coins: number;
  debt: number;
  fitPitWins: number;
  questStage: QuestStage;
  seenIntro: boolean;
}
