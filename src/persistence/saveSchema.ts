import type { CreatureId } from '../domain/ids.js';
import type {
  CreatureState,
  DomainProgressionState,
  ExperimentObservationRecord,
  GameDomainState,
  MaterialLot,
  ReagentStockEntry,
  ResearchKnowledgeRecord,
} from '../domain/model.js';
import type { GameStateSnapshot } from '../types.js';

export const SAVE_FORMAT = 'splicepit-save' as const;
export const SAVE_SCHEMA_VERSION = 1 as const;
export const R0_2_GAME_VERSION = '0.2.0';

export interface SavePayloadV1 {
  gameplay: GameStateSnapshot;
  creatures: { records: CreatureState[]; mainCreatureIds: CreatureId[]; testAnimalIds: CreatureId[] };
  materials: { stock: MaterialLot[]; reagents?: ReagentStockEntry[] };
  research: { knowledge: ResearchKnowledgeRecord[]; experiments?: ExperimentObservationRecord[] };
  progression: DomainProgressionState;
}

export interface SaveEnvelopeV1 {
  format: typeof SAVE_FORMAT;
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  gameVersion: string;
  savedAt: string;
  payload: SavePayloadV1;
}

interface SaveEnvelopeV0 {
  format: typeof SAVE_FORMAT;
  schemaVersion: 0;
  gameVersion: string;
  savedAt: string;
  payload: { gameplay: GameStateSnapshot; domain: GameDomainState };
}

export class SaveDecodeError extends Error {}
export class IncompatibleSaveError extends SaveDecodeError {}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function requireRecord(value: unknown, path: string): Record<string, unknown> { if (!isRecord(value)) throw new SaveDecodeError(`${path} must be an object`); return value; }
function requireArray(value: unknown, path: string): unknown[] { if (!Array.isArray(value)) throw new SaveDecodeError(`${path} must be an array`); return value; }
function requireString(value: unknown, path: string): string { if (typeof value !== 'string' || value.length === 0) throw new SaveDecodeError(`${path} must be a non-empty string`); return value; }

function validateGameplay(value: unknown): asserts value is GameStateSnapshot {
  const gameplay = requireRecord(value, 'payload.gameplay');
  if (typeof gameplay.hasBaseAnimal !== 'boolean' || (gameplay.baseAnimalId !== null && typeof gameplay.baseAnimalId !== 'string')) throw new SaveDecodeError('payload.gameplay base animal state is invalid');
  requireArray(gameplay.collectedGenes, 'payload.gameplay.collectedGenes');
  if (gameplay.currentCreature !== null && !isRecord(gameplay.currentCreature)) throw new SaveDecodeError('payload.gameplay.currentCreature is invalid');
  for (const key of ['coins', 'debt', 'fitPitWins'] as const) if (typeof gameplay[key] !== 'number' || !Number.isFinite(gameplay[key])) throw new SaveDecodeError(`payload.gameplay.${key} is invalid`);
  requireString(gameplay.questStage, 'payload.gameplay.questStage');
  if (typeof gameplay.seenIntro !== 'boolean') throw new SaveDecodeError('payload.gameplay.seenIntro is invalid');
}

function validateDomainSections(payload: Record<string, unknown>): void {
  const creatures = requireRecord(payload.creatures, 'payload.creatures');
  requireArray(creatures.records, 'payload.creatures.records');
  requireArray(creatures.mainCreatureIds, 'payload.creatures.mainCreatureIds');
  requireArray(creatures.testAnimalIds, 'payload.creatures.testAnimalIds');
  const materials = requireRecord(payload.materials, 'payload.materials');
  requireArray(materials.stock, 'payload.materials.stock');
  if (materials.reagents !== undefined) requireArray(materials.reagents, 'payload.materials.reagents');
  const research = requireRecord(payload.research, 'payload.research');
  requireArray(research.knowledge, 'payload.research.knowledge');
  if (research.experiments !== undefined) requireArray(research.experiments, 'payload.research.experiments');
  const progression = requireRecord(payload.progression, 'payload.progression');
  requireArray(progression.activeStateIds, 'payload.progression.activeStateIds');
  requireArray(progression.activeQuestIds, 'payload.progression.activeQuestIds');
  requireArray(progression.completedQuestIds, 'payload.progression.completedQuestIds');
}

function migrateV0ToV1(value: SaveEnvelopeV0): SaveEnvelopeV1 {
  const domain = value.payload.domain;
  return {
    format: SAVE_FORMAT,
    schemaVersion: 1,
    gameVersion: value.gameVersion,
    savedAt: value.savedAt,
    payload: {
      gameplay: structuredClone(value.payload.gameplay),
      creatures: { records: structuredClone(domain.creatures) as CreatureState[], mainCreatureIds: structuredClone(domain.mainCreatureIds) as CreatureId[], testAnimalIds: structuredClone(domain.testAnimalIds) as CreatureId[] },
      materials: {
        stock: structuredClone(domain.materialStock) as MaterialLot[],
        reagents: structuredClone(domain.reagentStock ?? []) as ReagentStockEntry[],
      },
      research: {
        knowledge: structuredClone(domain.researchKnowledge) as ResearchKnowledgeRecord[],
        experiments: structuredClone(domain.experimentHistory ?? []) as ExperimentObservationRecord[],
      },
      progression: structuredClone(domain.progression),
    },
  };
}

function schemaVersionOf(value: unknown): number {
  const envelope = requireRecord(value, 'save');
  if (envelope.format !== SAVE_FORMAT) throw new SaveDecodeError('Unrecognised save format');
  if (!Number.isInteger(envelope.schemaVersion)) throw new SaveDecodeError('schemaVersion must be an integer');
  return envelope.schemaVersion as number;
}

function migrateV0Unknown(value: unknown): SaveEnvelopeV1 {
  const envelope = requireRecord(value, 'save');
  const payload = requireRecord(envelope.payload, 'payload');
  validateGameplay(payload.gameplay);
  const domain = requireRecord(payload.domain, 'payload.domain');
  requireArray(domain.creatures, 'payload.domain.creatures');
  requireArray(domain.mainCreatureIds, 'payload.domain.mainCreatureIds');
  requireArray(domain.testAnimalIds, 'payload.domain.testAnimalIds');
  requireArray(domain.materialStock, 'payload.domain.materialStock');
  requireArray(domain.researchKnowledge, 'payload.domain.researchKnowledge');
  const progression = requireRecord(domain.progression, 'payload.domain.progression');
  requireArray(progression.activeStateIds, 'payload.domain.progression.activeStateIds');
  requireArray(progression.activeQuestIds, 'payload.domain.progression.activeQuestIds');
  requireArray(progression.completedQuestIds, 'payload.domain.progression.completedQuestIds');
  requireString(envelope.gameVersion, 'gameVersion');
  requireString(envelope.savedAt, 'savedAt');
  return migrateV0ToV1(value as SaveEnvelopeV0);
}

const MIGRATIONS = new Map<number, (value: unknown) => unknown>([[0, migrateV0Unknown]]);

function migrateUnknown(value: unknown): unknown {
  let current = value;
  let version = schemaVersionOf(current);
  if (version > SAVE_SCHEMA_VERSION) throw new IncompatibleSaveError(`Save schema ${version} is newer than supported schema ${SAVE_SCHEMA_VERSION}`);
  if (version < 0) throw new IncompatibleSaveError(`Save schema ${version} is not supported`);
  while (version < SAVE_SCHEMA_VERSION) {
    const migration = MIGRATIONS.get(version);
    if (!migration) throw new IncompatibleSaveError(`No migration is available from save schema ${version}`);
    current = migration(current);
    const nextVersion = schemaVersionOf(current);
    if (nextVersion <= version) throw new SaveDecodeError(`Save migration from schema ${version} did not advance the version`);
    version = nextVersion;
  }
  return current;
}

export function decodeSave(raw: string): SaveEnvelopeV1 {
  let parsed: unknown;
  try { parsed = JSON.parse(raw) as unknown; } catch { throw new SaveDecodeError('Save is not valid JSON'); }
  const migrated = migrateUnknown(parsed);
  const envelope = requireRecord(migrated, 'save');
  if (envelope.format !== SAVE_FORMAT || envelope.schemaVersion !== SAVE_SCHEMA_VERSION) throw new SaveDecodeError('Save migration did not produce the current schema');
  requireString(envelope.gameVersion, 'gameVersion');
  requireString(envelope.savedAt, 'savedAt');
  const payload = requireRecord(envelope.payload, 'payload');
  validateGameplay(payload.gameplay);
  validateDomainSections(payload);
  return structuredClone(migrated) as SaveEnvelopeV1;
}

export function encodeSave(envelope: SaveEnvelopeV1): string { return JSON.stringify(envelope); }

export function createSaveEnvelope(gameplay: GameStateSnapshot, domain: GameDomainState, savedAt = new Date().toISOString(), gameVersion = R0_2_GAME_VERSION): SaveEnvelopeV1 {
  return {
    format: SAVE_FORMAT,
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameVersion,
    savedAt,
    payload: {
      gameplay: structuredClone(gameplay),
      creatures: { records: structuredClone(domain.creatures) as CreatureState[], mainCreatureIds: structuredClone(domain.mainCreatureIds) as CreatureId[], testAnimalIds: structuredClone(domain.testAnimalIds) as CreatureId[] },
      materials: {
        stock: structuredClone(domain.materialStock) as MaterialLot[],
        reagents: structuredClone(domain.reagentStock) as ReagentStockEntry[],
      },
      research: {
        knowledge: structuredClone(domain.researchKnowledge) as ResearchKnowledgeRecord[],
        experiments: structuredClone(domain.experimentHistory) as ExperimentObservationRecord[],
      },
      progression: structuredClone(domain.progression),
    },
  };
}

export function domainStateFromSave(envelope: SaveEnvelopeV1): GameDomainState {
  return {
    creatures: structuredClone(envelope.payload.creatures.records),
    mainCreatureIds: structuredClone(envelope.payload.creatures.mainCreatureIds),
    testAnimalIds: structuredClone(envelope.payload.creatures.testAnimalIds),
    materialStock: structuredClone(envelope.payload.materials.stock),
    reagentStock: structuredClone(envelope.payload.materials.reagents ?? []),
    researchKnowledge: structuredClone(envelope.payload.research.knowledge),
    experimentHistory: structuredClone(envelope.payload.research.experiments ?? []),
    progression: structuredClone(envelope.payload.progression),
  };
}
