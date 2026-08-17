import type {
  ActionId,
  BaseAnimalId,
  CapabilityId,
  CreatureId,
  ExperimentObservationId,
  ItemId,
  LocationId,
  MaterialLotId,
  MutationDefinitionId,
  MutationInstanceId,
  ProgressionStateId,
  QuestId,
  ReagentId,
  SourcePackageId,
  SpliceAttemptId,
} from './ids.js';

export const CONTENT_STATUSES = ['prototype', 'draft', 'canon', 'deprecated'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const BIOLOGICAL_CLASSES = [
  'anatomical',
  'physiological',
  'sensory',
  'biochemical',
  'behavioural_neurological',
  'regulatory',
] as const;
export type BiologicalClass = (typeof BIOLOGICAL_CLASSES)[number];

export const BIOLOGICAL_COMPLEXITY_LEVELS = ['low', 'moderate', 'high', 'extreme'] as const;
export type BiologicalComplexityLevel = (typeof BIOLOGICAL_COMPLEXITY_LEVELS)[number];

export interface ContentDefinition<Id extends string> {
  id: Id;
  status: ContentStatus;
  revision: number;
  name: string;
  description: string;
}

export interface BiologicalRequirementSet {
  allOfTags: readonly string[];
  anyOfTags: readonly string[];
  noneOfTags: readonly string[];
}

export interface BiologicalComplexityProfile {
  integration: BiologicalComplexityLevel;
  structuralDemand: BiologicalComplexityLevel;
  metabolicDemand: BiologicalComplexityLevel;
  regulatoryVolatility: BiologicalComplexityLevel;
}

export interface BiologicalExpressionDefinition {
  id: string;
  name: string;
  description: string;
  biologicalClass: BiologicalClass;
  requirements: BiologicalRequirementSet;
  compatibilityTags: readonly string[];
  createsBiologicalTags: readonly string[];
  phenotypeHooks: readonly string[];
  capabilityHooks: readonly string[];
}

export interface BaseAnimalDefinition extends ContentDefinition<BaseAnimalId> {
  species: string;
  bodyPlanTags: readonly string[];
  biologicalTags: readonly string[];
  baselinePhenotypeHooks: readonly string[];
  baselineCapabilityHooks: readonly string[];
}

export interface SourcePackageDefinition extends ContentDefinition<SourcePackageId> {
  sourceSpecies: string;
  biologicalClassTags: readonly BiologicalClass[];
  expressions: readonly BiologicalExpressionDefinition[];
  requirements: BiologicalRequirementSet;
  compatibilityTags: readonly string[];
  complexity: BiologicalComplexityProfile;
  phenotypeHooks: readonly string[];
  capabilityHooks: readonly string[];
  potentialCapabilityIds: readonly CapabilityId[];
  potentialActionIds: readonly ActionId[];
}

export interface MutationDefinition extends ContentDefinition<MutationDefinitionId> {
  tags: readonly string[];
}

export type ArenaEnvironment = 'land' | 'water' | 'air';

export interface CapabilityDefinition extends ContentDefinition<CapabilityId> {
  environment: ArenaEnvironment | null;
}

export interface ActionDefinition extends ContentDefinition<ActionId> {
  requiredCapabilityIds: readonly CapabilityId[];
}

export interface ItemDefinition extends ContentDefinition<ItemId> {
  materialSourcePackageId: SourcePackageId | null;
}

export interface LocationDefinition extends ContentDefinition<LocationId> {
  linkedLocationIds: readonly LocationId[];
}

export interface QuestDefinition extends ContentDefinition<QuestId> {
  startLocationId: LocationId | null;
  prerequisiteQuestIds: readonly QuestId[];
  progressionStateIds: readonly ProgressionStateId[];
}

export interface ProgressionStateDefinition extends ContentDefinition<ProgressionStateId> {}

export interface DomainContentCatalog {
  baseAnimals: readonly BaseAnimalDefinition[];
  sourcePackages: readonly SourcePackageDefinition[];
  mutations: readonly MutationDefinition[];
  capabilities: readonly CapabilityDefinition[];
  actions: readonly ActionDefinition[];
  items: readonly ItemDefinition[];
  locations: readonly LocationDefinition[];
  quests: readonly QuestDefinition[];
  progressionStates: readonly ProgressionStateDefinition[];
}

export const SPLICE_OUTCOME_BANDS = [
  'clean_rejection',
  'damaging_failure',
  'partial_expression',
  'unstable_viable',
  'normal_success',
  'mutated_success',
  'exceptional_synergy',
  'catastrophic_result',
] as const;
export type SpliceOutcomeBand = (typeof SPLICE_OUTCOME_BANDS)[number];

export interface SpliceExpressionRecord {
  sourcePackageId: SourcePackageId;
  expressionId: string;
  expressed: boolean;
  magnitude: number;
  completeness: number;
  efficiency: number;
  reliability: number;
  stability: number;
  biologicalTags: readonly string[];
  phenotypeHooks: readonly string[];
  capabilityHooks: readonly string[];
  capabilityIds: readonly CapabilityId[];
  actionIds: readonly ActionId[];
  functional: boolean;
  notes: string;
}

export type SpliceInjurySeverityRecord = 'none' | 'minor' | 'major' | 'permanent' | 'lethal';

export interface SpliceAttemptConsequencesRecord {
  mutationTriggered: boolean;
  permanentDamage: boolean;
  death: boolean;
  injurySeverity: SpliceInjurySeverityRecord;
}

export interface SpliceAttemptRecord {
  id: SpliceAttemptId;
  sequence: number;
  attemptedAt: string;
  sourcePackageIds: readonly SourcePackageId[];
  consumedMaterialLotIds: readonly MaterialLotId[];
  outcomeBand: SpliceOutcomeBand;
  stabilityBefore: number;
  stabilityAfter: number;
  complexityAdded: number;
  consequences: SpliceAttemptConsequencesRecord;
  expressions: readonly SpliceExpressionRecord[];
}

export interface MutationInstance {
  id: MutationInstanceId;
  definitionId: MutationDefinitionId;
  acquiredFromSpliceAttemptId: SpliceAttemptId | null;
  recordedAt: string;
}

export interface InjuryRecord {
  id: string;
  recordedAt: string;
  status: 'active' | 'recovering' | 'healed' | 'permanent';
  notes: string;
  affectedCapabilityIds?: readonly CapabilityId[];
  affectedExpressionIds?: readonly string[];
}

export interface TrainingRecord {
  id: string;
  recordedAt: string;
  capabilityId: CapabilityId | null;
  notes: string;
}

export interface ArenaEnvironmentState {
  functional: boolean;
  supportingCapabilityIds: readonly CapabilityId[];
}

export interface ArenaCapabilities {
  land: ArenaEnvironmentState;
  water: ArenaEnvironmentState;
  air: ArenaEnvironmentState;
}

export type CreatureLifeState = 'living' | 'deceased';

export interface CreatureState {
  id: CreatureId;
  name: string;
  baseAnimalId: BaseAnimalId;
  role: 'main' | 'test';
  lifeState: CreatureLifeState;
  createdAt: string;
  estimatedAgeDays: number | null;
  phenotypeSeed: string;
  spliceHistory: readonly SpliceAttemptRecord[];
  mutations: readonly MutationInstance[];
  injuries: readonly InjuryRecord[];
  training: readonly TrainingRecord[];
  capabilityIds: readonly CapabilityId[];
  arenaCapabilities: ArenaCapabilities;
}

export type MaterialAcquisitionChannel = 'buy' | 'harvest' | 'win' | 'trade' | 'inherit' | 'extract' | 'prototype';

export interface MaterialLot {
  id: MaterialLotId;
  sourcePackageId: SourcePackageId;
  quantity: number;
  acquiredAt: string;
  notes: string;
  quality?: number;
  acquisitionChannel?: MaterialAcquisitionChannel;
}

export interface ReagentStockEntry {
  reagentId: ReagentId;
  quantity: number;
  notes: string;
}

export interface MaterialAttemptCost {
  sourcePackageId: SourcePackageId;
  quantity: number;
  minimumQuality: number;
}

export interface ReagentAttemptCost {
  reagentId: ReagentId;
  quantity: number;
}

export interface AttemptCost {
  materials: readonly MaterialAttemptCost[];
  reagents: readonly ReagentAttemptCost[];
}

export interface ConsumedMaterialRecord {
  materialLotId: MaterialLotId;
  sourcePackageId: SourcePackageId;
  quantity: number;
  quality: number;
}

export interface ResearchKnowledgeRecord {
  sourcePackageId: SourcePackageId;
  baseAnimalId: BaseAnimalId | null;
  contextKey?: string;
  contextTags?: readonly string[];
  observationCount: number;
  notes: readonly string[];
}

export interface ExperimentObservationRecord {
  id: ExperimentObservationId;
  subjectCreatureId: CreatureId;
  sourcePackageId: SourcePackageId;
  baseAnimalId: BaseAnimalId;
  subjectRole: 'main' | 'test';
  contextKey: string;
  contextTags: readonly string[];
  observedAt: string;
  consumedMaterials: readonly ConsumedMaterialRecord[];
  consumedReagents: readonly ReagentAttemptCost[];
  resultCode: string;
  notes: string;
}

export interface DomainProgressionState {
  activeStateIds: readonly ProgressionStateId[];
  activeQuestIds: readonly QuestId[];
  completedQuestIds: readonly QuestId[];
}

export interface GameDomainState {
  creatures: readonly CreatureState[];
  mainCreatureIds: readonly CreatureId[];
  testAnimalIds: readonly CreatureId[];
  materialStock: readonly MaterialLot[];
  reagentStock: readonly ReagentStockEntry[];
  researchKnowledge: readonly ResearchKnowledgeRecord[];
  experimentHistory: readonly ExperimentObservationRecord[];
  progression: DomainProgressionState;
}

export function emptyArenaCapabilities(): ArenaCapabilities {
  return {
    land: { functional: false, supportingCapabilityIds: [] },
    water: { functional: false, supportingCapabilityIds: [] },
    air: { functional: false, supportingCapabilityIds: [] },
  };
}
