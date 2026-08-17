const STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export type StableIdKind =
  | 'base-animal'
  | 'source-package'
  | 'material-lot'
  | 'creature'
  | 'splice-attempt'
  | 'mutation-definition'
  | 'mutation-instance'
  | 'capability'
  | 'action'
  | 'item'
  | 'location'
  | 'quest'
  | 'progression-state';

declare const stableIdBrand: unique symbol;
export type StableId<K extends StableIdKind> = string & { readonly [stableIdBrand]: K };

export type BaseAnimalId = StableId<'base-animal'>;
export type SourcePackageId = StableId<'source-package'>;
export type MaterialLotId = StableId<'material-lot'>;
export type CreatureId = StableId<'creature'>;
export type SpliceAttemptId = StableId<'splice-attempt'>;
export type MutationDefinitionId = StableId<'mutation-definition'>;
export type MutationInstanceId = StableId<'mutation-instance'>;
export type CapabilityId = StableId<'capability'>;
export type ActionId = StableId<'action'>;
export type ItemId = StableId<'item'>;
export type LocationId = StableId<'location'>;
export type QuestId = StableId<'quest'>;
export type ProgressionStateId = StableId<'progression-state'>;

export function isStableId(value: string): boolean {
  return value.length <= 96 && STABLE_ID_PATTERN.test(value);
}

function stableId<K extends StableIdKind>(value: string, kind: K): StableId<K> {
  if (!isStableId(value)) {
    throw new Error(`Invalid ${kind} ID: ${value}`);
  }
  return value as StableId<K>;
}

export const ids = {
  baseAnimal: (value: string): BaseAnimalId => stableId(value, 'base-animal'),
  sourcePackage: (value: string): SourcePackageId => stableId(value, 'source-package'),
  materialLot: (value: string): MaterialLotId => stableId(value, 'material-lot'),
  creature: (value: string): CreatureId => stableId(value, 'creature'),
  spliceAttempt: (value: string): SpliceAttemptId => stableId(value, 'splice-attempt'),
  mutationDefinition: (value: string): MutationDefinitionId => stableId(value, 'mutation-definition'),
  mutationInstance: (value: string): MutationInstanceId => stableId(value, 'mutation-instance'),
  capability: (value: string): CapabilityId => stableId(value, 'capability'),
  action: (value: string): ActionId => stableId(value, 'action'),
  item: (value: string): ItemId => stableId(value, 'item'),
  location: (value: string): LocationId => stableId(value, 'location'),
  quest: (value: string): QuestId => stableId(value, 'quest'),
  progressionState: (value: string): ProgressionStateId => stableId(value, 'progression-state'),
} as const;
