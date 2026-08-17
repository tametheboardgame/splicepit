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
export const SAVE_SCHEMA_VERSION = 2 as const;
export const R0_2_GAME_VERSION = '0.2.0';

interface SavePayloadV1 {
  gameplay: GameStateSnapshot;
  creatures: { records: unknown[]; mainCreatureIds: CreatureId[]; testAnimalIds: CreatureId[] };
  materials: { stock: MaterialLot[]; reagents?: ReagentStockEntry[] };
  research: { knowledge: ResearchKnowledgeRecord[]; experiments?: ExperimentObservationRecord[] };
  progression: DomainProgressionState;
}

interface SaveEnvelopeV1 {
  format: typeof SAVE_FORMAT;
  schemaVersion: 1;
  gameVersion: string;
  savedAt: string;
  payload: SavePayloadV1;
}

export interface SavePayloadV2 {
  gameplay: GameStateSnapshot;
  creatures: { records: CreatureState[]; mainCreatureIds: CreatureId[]; testAnimalIds: CreatureId[] };
  materials: { stock: MaterialLot[]; reagents?: ReagentStockEntry[] };
  research: { knowledge: ResearchKnowledgeRecord[]; experiments?: ExperimentObservationRecord[] };
  progression: DomainProgressionState;
}

export interface SaveEnvelopeV2 {
  format: typeof SAVE_FORMAT;
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  gameVersion: string;
  savedAt: string;
  payload: SavePayloadV2;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new SaveDecodeError(`${path} must be an object`);
  return value;
}
function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new SaveDecodeError(`${path} must be an array`);
  return value;
}
function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new SaveDecodeError(`${path} must be a non-empty string`);
  return value;
}
function requireFinite(value: unknown, path: string, minimum?: number, maximum?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new SaveDecodeError(`${path} must be a finite number`);
  if (minimum !== undefined && value < minimum) throw new SaveDecodeError(`${path} must be >= ${minimum}`);
  if (maximum !== undefined && value > maximum) throw new SaveDecodeError(`${path} must be <= ${maximum}`);
  return value;
}
function optionalStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}
function finiteOr(value: unknown, fallback: number, minimum?: number, maximum?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  if (minimum !== undefined && value < minimum) return fallback;
  if (maximum !== undefined && value > maximum) return fallback;
  return value;
}

function validateGameplay(value: unknown): asserts value is GameStateSnapshot {
  const gameplay = requireRecord(value, 'payload.gameplay');
  if (typeof gameplay.hasBaseAnimal !== 'boolean' || (gameplay.baseAnimalId !== null && typeof gameplay.baseAnimalId !== 'string')) {
    throw new SaveDecodeError('payload.gameplay base animal state is invalid');
  }
  requireArray(gameplay.collectedGenes, 'payload.gameplay.collectedGenes');
  if (gameplay.currentCreature !== null && !isRecord(gameplay.currentCreature)) {
    throw new SaveDecodeError('payload.gameplay.currentCreature is invalid');
  }
  for (const key of ['coins', 'debt', 'fitPitWins'] as const) {
    if (typeof gameplay[key] !== 'number' || !Number.isFinite(gameplay[key])) {
      throw new SaveDecodeError(`payload.gameplay.${key} is invalid`);
    }
  }
  requireString(gameplay.questStage, 'payload.gameplay.questStage');
  if (typeof gameplay.seenIntro !== 'boolean') throw new SaveDecodeError('payload.gameplay.seenIntro is invalid');
}

function validateSpliceExpressionV2(value: unknown, path: string): void {
  const expression = requireRecord(value, path);
  requireString(expression.sourcePackageId, `${path}.sourcePackageId`);
  requireString(expression.expressionId, `${path}.expressionId`);
  if (typeof expression.expressed !== 'boolean' || typeof expression.functional !== 'boolean') {
    throw new SaveDecodeError(`${path} expression flags are invalid`);
  }
  requireFinite(expression.magnitude, `${path}.magnitude`, 0, 1.5);
  for (const field of ['completeness', 'efficiency', 'reliability', 'stability'] as const) {
    requireFinite(expression[field], `${path}.${field}`, 0, 1);
  }
  for (const field of ['biologicalTags', 'phenotypeHooks', 'capabilityHooks', 'capabilityIds', 'actionIds'] as const) {
    requireArray(expression[field], `${path}.${field}`);
  }
  if (typeof expression.notes !== 'string') throw new SaveDecodeError(`${path}.notes must be a string`);
}

function validateCreatureV2(value: unknown, path: string): void {
  const creature = requireRecord(value, path);
  requireString(creature.id, `${path}.id`);
  requireString(creature.name, `${path}.name`);
  requireString(creature.baseAnimalId, `${path}.baseAnimalId`);
  if (creature.role !== 'main' && creature.role !== 'test') throw new SaveDecodeError(`${path}.role is invalid`);
  if (creature.lifeState !== 'living' && creature.lifeState !== 'deceased') throw new SaveDecodeError(`${path}.lifeState is invalid`);
  requireString(creature.createdAt, `${path}.createdAt`);
  if (creature.estimatedAgeDays !== null) requireFinite(creature.estimatedAgeDays, `${path}.estimatedAgeDays`, 0);
  requireString(creature.phenotypeSeed, `${path}.phenotypeSeed`);
  const history = requireArray(creature.spliceHistory, `${path}.spliceHistory`);
  let previousSequence = 0;
  history.forEach((attemptValue, attemptIndex) => {
    const attemptPath = `${path}.spliceHistory[${attemptIndex}]`;
    const attempt = requireRecord(attemptValue, attemptPath);
    requireString(attempt.id, `${attemptPath}.id`);
    if (!Number.isInteger(attempt.sequence) || (attempt.sequence as number) <= previousSequence) {
      throw new SaveDecodeError(`${attemptPath}.sequence must be strictly increasing`);
    }
    previousSequence = attempt.sequence as number;
    requireString(attempt.attemptedAt, `${attemptPath}.attemptedAt`);
    requireArray(attempt.sourcePackageIds, `${attemptPath}.sourcePackageIds`);
    requireArray(attempt.consumedMaterialLotIds, `${attemptPath}.consumedMaterialLotIds`);
    requireString(attempt.outcomeBand, `${attemptPath}.outcomeBand`);
    requireFinite(attempt.stabilityBefore, `${attemptPath}.stabilityBefore`, 0, 1);
    requireFinite(attempt.stabilityAfter, `${attemptPath}.stabilityAfter`, 0, 1);
    requireFinite(attempt.complexityAdded, `${attemptPath}.complexityAdded`, 0);
    const consequences = requireRecord(attempt.consequences, `${attemptPath}.consequences`);
    if (
      typeof consequences.mutationTriggered !== 'boolean'
      || typeof consequences.permanentDamage !== 'boolean'
      || typeof consequences.death !== 'boolean'
      || !['none', 'minor', 'major', 'permanent', 'lethal'].includes(String(consequences.injurySeverity))
    ) {
      throw new SaveDecodeError(`${attemptPath}.consequences is invalid`);
    }
    requireArray(attempt.expressions, `${attemptPath}.expressions`).forEach((expression, expressionIndex) => {
      validateSpliceExpressionV2(expression, `${attemptPath}.expressions[${expressionIndex}]`);
    });
  });
  requireArray(creature.mutations, `${path}.mutations`);
  requireArray(creature.injuries, `${path}.injuries`);
  requireArray(creature.training, `${path}.training`);
  requireArray(creature.capabilityIds, `${path}.capabilityIds`);
  const arena = requireRecord(creature.arenaCapabilities, `${path}.arenaCapabilities`);
  for (const environment of ['land', 'water', 'air'] as const) {
    const state = requireRecord(arena[environment], `${path}.arenaCapabilities.${environment}`);
    if (typeof state.functional !== 'boolean') throw new SaveDecodeError(`${path}.arenaCapabilities.${environment}.functional is invalid`);
    requireArray(state.supportingCapabilityIds, `${path}.arenaCapabilities.${environment}.supportingCapabilityIds`);
  }
}

function validateDomainSectionsV2(payload: Record<string, unknown>): void {
  const creatures = requireRecord(payload.creatures, 'payload.creatures');
  requireArray(creatures.records, 'payload.creatures.records').forEach((creature, index) => validateCreatureV2(creature, `payload.creatures.records[${index}]`));
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
      creatures: {
        records: structuredClone(domain.creatures) as unknown[],
        mainCreatureIds: structuredClone(domain.mainCreatureIds) as CreatureId[],
        testAnimalIds: structuredClone(domain.testAnimalIds) as CreatureId[],
      },
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

function migrateExpressionV1(value: unknown, index: number): Record<string, unknown> {
  const expression = isRecord(value) ? value : {};
  const functional = typeof expression.functional === 'boolean' ? expression.functional : false;
  const expressed = typeof expression.expressed === 'boolean' ? expression.expressed : functional;
  const capabilityIds = optionalStringArray(expression.capabilityIds);
  return {
    sourcePackageId: typeof expression.sourcePackageId === 'string' ? expression.sourcePackageId : 'legacy_unknown_source',
    expressionId: typeof expression.expressionId === 'string' ? expression.expressionId : `legacy_expression_${index + 1}`,
    expressed,
    magnitude: finiteOr(expression.magnitude, functional ? 1 : 0, 0, 1.5),
    completeness: finiteOr(expression.completeness, functional ? 1 : 0, 0, 1),
    efficiency: finiteOr(expression.efficiency, functional ? 1 : 0, 0, 1),
    reliability: finiteOr(expression.reliability, functional ? 1 : 0, 0, 1),
    stability: finiteOr(expression.stability, functional ? 1 : 0, 0, 1),
    biologicalTags: optionalStringArray(expression.biologicalTags),
    phenotypeHooks: optionalStringArray(expression.phenotypeHooks),
    capabilityHooks: expression.capabilityHooks === undefined ? capabilityIds : optionalStringArray(expression.capabilityHooks),
    capabilityIds,
    actionIds: optionalStringArray(expression.actionIds),
    functional,
    notes: typeof expression.notes === 'string' ? expression.notes : 'Migrated from save schema v1.',
  };
}

function migrateCreatureV1(value: unknown): Record<string, unknown> {
  const creature = requireRecord(value, 'payload.creatures.records[]');
  const oldHistory = requireArray(creature.spliceHistory, 'payload.creatures.records[].spliceHistory');
  let previousStability = 1;
  const spliceHistory = oldHistory.map((attemptValue, index) => {
    const attempt = requireRecord(attemptValue, `payload.creatures.records[].spliceHistory[${index}]`);
    const stabilityBefore = finiteOr(attempt.stabilityBefore, previousStability, 0, 1);
    const stabilityAfter = finiteOr(attempt.stabilityAfter, stabilityBefore, 0, 1);
    previousStability = stabilityAfter;
    return {
      ...structuredClone(attempt),
      stabilityBefore,
      stabilityAfter,
      complexityAdded: finiteOr(attempt.complexityAdded, 0, 0),
      consequences: isRecord(attempt.consequences)
        ? {
            mutationTriggered: attempt.consequences.mutationTriggered === true,
            permanentDamage: attempt.consequences.permanentDamage === true,
            death: attempt.consequences.death === true,
            injurySeverity: ['none', 'minor', 'major', 'permanent', 'lethal'].includes(String(attempt.consequences.injurySeverity))
              ? attempt.consequences.injurySeverity
              : 'none',
          }
        : { mutationTriggered: false, permanentDamage: false, death: false, injurySeverity: 'none' },
      expressions: requireArray(attempt.expressions, `payload.creatures.records[].spliceHistory[${index}].expressions`)
        .map((expression, expressionIndex) => migrateExpressionV1(expression, expressionIndex)),
    };
  });
  return {
    ...structuredClone(creature),
    lifeState: creature.lifeState === 'deceased' ? 'deceased' : 'living',
    spliceHistory,
  };
}

function migrateV1ToV2(value: SaveEnvelopeV1): SaveEnvelopeV2 {
  return {
    format: SAVE_FORMAT,
    schemaVersion: 2,
    gameVersion: value.gameVersion,
    savedAt: value.savedAt,
    payload: {
      gameplay: structuredClone(value.payload.gameplay),
      creatures: {
        records: value.payload.creatures.records.map((creature) => migrateCreatureV1(creature)) as unknown as CreatureState[],
        mainCreatureIds: structuredClone(value.payload.creatures.mainCreatureIds),
        testAnimalIds: structuredClone(value.payload.creatures.testAnimalIds),
      },
      materials: structuredClone(value.payload.materials),
      research: structuredClone(value.payload.research),
      progression: structuredClone(value.payload.progression),
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

function migrateV1Unknown(value: unknown): SaveEnvelopeV2 {
  const envelope = requireRecord(value, 'save');
  const payload = requireRecord(envelope.payload, 'payload');
  validateGameplay(payload.gameplay);
  const creatures = requireRecord(payload.creatures, 'payload.creatures');
  requireArray(creatures.records, 'payload.creatures.records');
  requireArray(creatures.mainCreatureIds, 'payload.creatures.mainCreatureIds');
  requireArray(creatures.testAnimalIds, 'payload.creatures.testAnimalIds');
  const materials = requireRecord(payload.materials, 'payload.materials');
  requireArray(materials.stock, 'payload.materials.stock');
  const research = requireRecord(payload.research, 'payload.research');
  requireArray(research.knowledge, 'payload.research.knowledge');
  const progression = requireRecord(payload.progression, 'payload.progression');
  requireArray(progression.activeStateIds, 'payload.progression.activeStateIds');
  requireArray(progression.activeQuestIds, 'payload.progression.activeQuestIds');
  requireArray(progression.completedQuestIds, 'payload.progression.completedQuestIds');
  requireString(envelope.gameVersion, 'gameVersion');
  requireString(envelope.savedAt, 'savedAt');
  return migrateV1ToV2(value as unknown as SaveEnvelopeV1);
}

const MIGRATIONS = new Map<number, (value: unknown) => unknown>([
  [0, migrateV0Unknown],
  [1, migrateV1Unknown],
]);

function migrateUnknown(value: unknown): unknown {
  let current = value;
  let version = schemaVersionOf(current);
  if (version > SAVE_SCHEMA_VERSION) {
    throw new IncompatibleSaveError(`Save schema ${version} is newer than supported schema ${SAVE_SCHEMA_VERSION}`);
  }
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

export function decodeSave(raw: string): SaveEnvelopeV2 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new SaveDecodeError('Save is not valid JSON');
  }
  const migrated = migrateUnknown(parsed);
  const envelope = requireRecord(migrated, 'save');
  if (envelope.format !== SAVE_FORMAT || envelope.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new SaveDecodeError('Save migration did not produce the current schema');
  }
  requireString(envelope.gameVersion, 'gameVersion');
  requireString(envelope.savedAt, 'savedAt');
  const payload = requireRecord(envelope.payload, 'payload');
  validateGameplay(payload.gameplay);
  validateDomainSectionsV2(payload);
  return structuredClone(migrated) as SaveEnvelopeV2;
}

export function encodeSave(envelope: SaveEnvelopeV2): string {
  return JSON.stringify(envelope);
}

export function createSaveEnvelope(
  gameplay: GameStateSnapshot,
  domain: GameDomainState,
  savedAt = new Date().toISOString(),
  gameVersion = R0_2_GAME_VERSION,
): SaveEnvelopeV2 {
  return {
    format: SAVE_FORMAT,
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameVersion,
    savedAt,
    payload: {
      gameplay: structuredClone(gameplay),
      creatures: {
        records: structuredClone(domain.creatures) as CreatureState[],
        mainCreatureIds: structuredClone(domain.mainCreatureIds) as CreatureId[],
        testAnimalIds: structuredClone(domain.testAnimalIds) as CreatureId[],
      },
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

export function domainStateFromSave(envelope: SaveEnvelopeV2): GameDomainState {
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
