import {
  BIOLOGICAL_CLASSES,
  BIOLOGICAL_COMPLEXITY_LEVELS,
  CONTENT_STATUSES,
  SPLICE_OUTCOME_BANDS,
} from './model.js';
import { isStableId } from './ids.js';
import type {
  BiologicalRequirementSet,
  DomainContentCatalog,
  GameDomainState,
  QuestDefinition,
  SourcePackageDefinition,
  SpliceAttemptRecord,
} from './model.js';

export type ValidationCode =
  | 'duplicate_id'
  | 'invalid_id'
  | 'invalid_status'
  | 'invalid_range'
  | 'invalid_schema'
  | 'broken_reference'
  | 'invalid_order'
  | 'roster_limit'
  | 'roster_role_mismatch';

export interface ValidationIssue {
  code: ValidationCode;
  path: string;
  message: string;
}

const contentStatuses = new Set<string>(CONTENT_STATUSES);
const spliceBands = new Set<string>(SPLICE_OUTCOME_BANDS);
const biologicalClasses = new Set<string>(BIOLOGICAL_CLASSES);
const complexityLevels = new Set<string>(BIOLOGICAL_COMPLEXITY_LEVELS);

function pushDuplicateAndBasicIssues(
  issues: ValidationIssue[],
  collectionName: string,
  values: readonly { id: string; status: string; revision: number }[],
): Set<string> {
  const ids = new Set<string>();
  values.forEach((value, index) => {
    const path = `${collectionName}[${index}]`;
    if (!isStableId(value.id)) {
      issues.push({ code: 'invalid_id', path: `${path}.id`, message: `Invalid stable ID: ${value.id}` });
    }
    if (ids.has(value.id)) {
      issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `Duplicate ${collectionName} ID: ${value.id}` });
    }
    ids.add(value.id);
    if (!contentStatuses.has(value.status)) {
      issues.push({ code: 'invalid_status', path: `${path}.status`, message: `Unknown content status: ${value.status}` });
    }
    if (!Number.isInteger(value.revision) || value.revision < 1) {
      issues.push({ code: 'invalid_range', path: `${path}.revision`, message: 'Content revision must be an integer >= 1.' });
    }
  });
  return ids;
}

function requireReference(
  issues: ValidationIssue[],
  knownIds: ReadonlySet<string>,
  id: string,
  path: string,
  label: string,
): void {
  if (!knownIds.has(id)) {
    issues.push({ code: 'broken_reference', path, message: `Unknown ${label} reference: ${id}` });
  }
}

function validateNonBlank(issues: ValidationIssue[], value: string, path: string, label: string): void {
  if (value.trim().length === 0) {
    issues.push({ code: 'invalid_schema', path, message: `${label} cannot be blank.` });
  }
}

function validateTagList(
  issues: ValidationIssue[],
  values: readonly string[],
  path: string,
  options: { required?: boolean } = {},
): void {
  if (options.required && values.length === 0) {
    issues.push({ code: 'invalid_schema', path, message: 'At least one tag is required.' });
  }

  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (!isStableId(value)) {
      issues.push({ code: 'invalid_id', path: `${path}[${index}]`, message: `Invalid biological tag/hook ID: ${value}` });
    }
    if (seen.has(value)) {
      issues.push({ code: 'duplicate_id', path: `${path}[${index}]`, message: `Duplicate biological tag/hook: ${value}` });
    }
    seen.add(value);
  });
}

function validateRequirements(issues: ValidationIssue[], value: BiologicalRequirementSet, path: string): void {
  validateTagList(issues, value.allOfTags, `${path}.allOfTags`);
  validateTagList(issues, value.anyOfTags, `${path}.anyOfTags`);
  validateTagList(issues, value.noneOfTags, `${path}.noneOfTags`);

  const positive = new Set([...value.allOfTags, ...value.anyOfTags]);
  value.noneOfTags.forEach((tag, index) => {
    if (positive.has(tag)) {
      issues.push({
        code: 'invalid_schema',
        path: `${path}.noneOfTags[${index}]`,
        message: `Requirement tag ${tag} cannot be both required/accepted and forbidden.`,
      });
    }
  });
}

function validateSourcePackageSchema(
  issues: ValidationIssue[],
  sourcePackage: SourcePackageDefinition,
  index: number,
): void {
  const path = `sourcePackages[${index}]`;
  validateNonBlank(issues, sourcePackage.sourceSpecies, `${path}.sourceSpecies`, 'Source species');

  if (sourcePackage.biologicalClassTags.length === 0) {
    issues.push({ code: 'invalid_schema', path: `${path}.biologicalClassTags`, message: 'A source package must declare at least one biological class.' });
  }
  const classSet = new Set<string>();
  sourcePackage.biologicalClassTags.forEach((biologicalClass, classIndex) => {
    if (!biologicalClasses.has(biologicalClass)) {
      issues.push({ code: 'invalid_schema', path: `${path}.biologicalClassTags[${classIndex}]`, message: `Unknown biological class: ${biologicalClass}` });
    }
    if (classSet.has(biologicalClass)) {
      issues.push({ code: 'duplicate_id', path: `${path}.biologicalClassTags[${classIndex}]`, message: `Duplicate biological class: ${biologicalClass}` });
    }
    classSet.add(biologicalClass);
  });

  if (sourcePackage.expressions.length === 0) {
    issues.push({ code: 'invalid_schema', path: `${path}.expressions`, message: 'A source package must define at least one potential expression.' });
  }
  if (sourcePackage.status === 'canon' && sourcePackage.expressions.length < 2) {
    issues.push({ code: 'invalid_schema', path: `${path}.expressions`, message: 'Canonical source packages must expose multiple potential expressions.' });
  }

  const expressionIds = new Set<string>();
  const representedClasses = new Set<string>();
  sourcePackage.expressions.forEach((expression, expressionIndex) => {
    const expressionPath = `${path}.expressions[${expressionIndex}]`;
    if (!isStableId(expression.id)) {
      issues.push({ code: 'invalid_id', path: `${expressionPath}.id`, message: `Invalid expression ID: ${expression.id}` });
    }
    if (expressionIds.has(expression.id)) {
      issues.push({ code: 'duplicate_id', path: `${expressionPath}.id`, message: `Duplicate expression ID within source package: ${expression.id}` });
    }
    expressionIds.add(expression.id);
    validateNonBlank(issues, expression.name, `${expressionPath}.name`, 'Expression name');
    validateNonBlank(issues, expression.description, `${expressionPath}.description`, 'Expression description');

    if (!biologicalClasses.has(expression.biologicalClass)) {
      issues.push({ code: 'invalid_schema', path: `${expressionPath}.biologicalClass`, message: `Unknown biological class: ${expression.biologicalClass}` });
    } else if (!classSet.has(expression.biologicalClass)) {
      issues.push({
        code: 'invalid_schema',
        path: `${expressionPath}.biologicalClass`,
        message: `Expression class ${expression.biologicalClass} is not declared by its source package.`,
      });
    }
    representedClasses.add(expression.biologicalClass);

    validateRequirements(issues, expression.requirements, `${expressionPath}.requirements`);
    validateTagList(issues, expression.compatibilityTags, `${expressionPath}.compatibilityTags`);
    validateTagList(issues, expression.createsBiologicalTags, `${expressionPath}.createsBiologicalTags`, { required: true });
    validateTagList(issues, expression.phenotypeHooks, `${expressionPath}.phenotypeHooks`);
    validateTagList(issues, expression.capabilityHooks, `${expressionPath}.capabilityHooks`);
  });

  if (sourcePackage.status === 'canon') {
    sourcePackage.biologicalClassTags.forEach((biologicalClass) => {
      if (!representedClasses.has(biologicalClass)) {
        issues.push({
          code: 'invalid_schema',
          path: `${path}.biologicalClassTags`,
          message: `Canonical source package declares ${biologicalClass} without any expression in that class.`,
        });
      }
    });
  }

  validateRequirements(issues, sourcePackage.requirements, `${path}.requirements`);
  validateTagList(issues, sourcePackage.compatibilityTags, `${path}.compatibilityTags`, { required: true });
  validateTagList(issues, sourcePackage.phenotypeHooks, `${path}.phenotypeHooks`);
  validateTagList(issues, sourcePackage.capabilityHooks, `${path}.capabilityHooks`);

  for (const [dimension, level] of Object.entries(sourcePackage.complexity)) {
    if (!complexityLevels.has(level)) {
      issues.push({ code: 'invalid_schema', path: `${path}.complexity.${dimension}`, message: `Unknown biological complexity level: ${level}` });
    }
  }
}

export function validateContentCatalog(catalog: DomainContentCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const baseAnimalIds = pushDuplicateAndBasicIssues(issues, 'baseAnimals', catalog.baseAnimals);
  const sourcePackageIds = pushDuplicateAndBasicIssues(issues, 'sourcePackages', catalog.sourcePackages);
  pushDuplicateAndBasicIssues(issues, 'mutations', catalog.mutations);
  const capabilityIds = pushDuplicateAndBasicIssues(issues, 'capabilities', catalog.capabilities);
  const actionIds = pushDuplicateAndBasicIssues(issues, 'actions', catalog.actions);
  pushDuplicateAndBasicIssues(issues, 'items', catalog.items);
  const locationIds = pushDuplicateAndBasicIssues(issues, 'locations', catalog.locations);
  const questIds = pushDuplicateAndBasicIssues(issues, 'quests', catalog.quests);
  const progressionStateIds = pushDuplicateAndBasicIssues(issues, 'progressionStates', catalog.progressionStates);

  catalog.baseAnimals.forEach((baseAnimal, index) => {
    const path = `baseAnimals[${index}]`;
    validateNonBlank(issues, baseAnimal.species, `${path}.species`, 'Species');
    validateTagList(issues, baseAnimal.bodyPlanTags, `${path}.bodyPlanTags`, { required: true });
    validateTagList(issues, baseAnimal.biologicalTags, `${path}.biologicalTags`, { required: true });
    validateTagList(issues, baseAnimal.baselinePhenotypeHooks, `${path}.baselinePhenotypeHooks`);
    validateTagList(issues, baseAnimal.baselineCapabilityHooks, `${path}.baselineCapabilityHooks`);
  });

  catalog.sourcePackages.forEach((sourcePackage, index) => {
    validateSourcePackageSchema(issues, sourcePackage, index);
    sourcePackage.potentialCapabilityIds.forEach((id, refIndex) => {
      requireReference(issues, capabilityIds, id, `sourcePackages[${index}].potentialCapabilityIds[${refIndex}]`, 'capability');
    });
    sourcePackage.potentialActionIds.forEach((id, refIndex) => {
      requireReference(issues, actionIds, id, `sourcePackages[${index}].potentialActionIds[${refIndex}]`, 'action');
    });
  });

  catalog.actions.forEach((action, index) => {
    action.requiredCapabilityIds.forEach((id, refIndex) => {
      requireReference(issues, capabilityIds, id, `actions[${index}].requiredCapabilityIds[${refIndex}]`, 'capability');
    });
  });

  catalog.items.forEach((item, index) => {
    if (item.materialSourcePackageId) {
      requireReference(issues, sourcePackageIds, item.materialSourcePackageId, `items[${index}].materialSourcePackageId`, 'source package');
    }
  });

  catalog.locations.forEach((location, index) => {
    location.linkedLocationIds.forEach((id, refIndex) => {
      requireReference(issues, locationIds, id, `locations[${index}].linkedLocationIds[${refIndex}]`, 'location');
    });
  });

  catalog.quests.forEach((quest, index) => validateQuestReferences(
    issues,
    quest,
    index,
    locationIds,
    questIds,
    progressionStateIds,
  ));

  void baseAnimalIds;
  return issues;
}

function validateQuestReferences(
  issues: ValidationIssue[],
  quest: QuestDefinition,
  index: number,
  locationIds: ReadonlySet<string>,
  questIds: ReadonlySet<string>,
  progressionStateIds: ReadonlySet<string>,
): void {
  if (quest.startLocationId) {
    requireReference(issues, locationIds, quest.startLocationId, `quests[${index}].startLocationId`, 'location');
  }
  quest.prerequisiteQuestIds.forEach((id, refIndex) => {
    requireReference(issues, questIds, id, `quests[${index}].prerequisiteQuestIds[${refIndex}]`, 'quest');
  });
  quest.progressionStateIds.forEach((id, refIndex) => {
    requireReference(issues, progressionStateIds, id, `quests[${index}].progressionStateIds[${refIndex}]`, 'progression state');
  });
}

function validateSpliceHistory(issues: ValidationIssue[], history: readonly SpliceAttemptRecord[], path: string): void {
  const ids = new Set<string>();
  let previousSequence = 0;
  history.forEach((attempt, index) => {
    const attemptPath = `${path}[${index}]`;
    if (!isStableId(attempt.id)) {
      issues.push({ code: 'invalid_id', path: `${attemptPath}.id`, message: `Invalid splice-attempt ID: ${attempt.id}` });
    }
    if (ids.has(attempt.id)) {
      issues.push({ code: 'duplicate_id', path: `${attemptPath}.id`, message: `Duplicate splice-attempt ID: ${attempt.id}` });
    }
    ids.add(attempt.id);
    if (!Number.isInteger(attempt.sequence) || attempt.sequence < 1) {
      issues.push({ code: 'invalid_range', path: `${attemptPath}.sequence`, message: 'Splice sequence must be an integer >= 1.' });
    }
    if (attempt.sequence <= previousSequence) {
      issues.push({ code: 'invalid_order', path: `${attemptPath}.sequence`, message: 'Splice history must be strictly chronological by sequence.' });
    }
    previousSequence = attempt.sequence;
    if (!spliceBands.has(attempt.outcomeBand)) {
      issues.push({ code: 'invalid_status', path: `${attemptPath}.outcomeBand`, message: `Unknown splice outcome band: ${attempt.outcomeBand}` });
    }
  });
}

export function validateDomainState(state: GameDomainState, catalog?: DomainContentCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const creatureIds = new Set<string>();
  const creatureById = new Map(state.creatures.map((creature) => [creature.id, creature] as const));
  const baseAnimalIds = catalog ? new Set(catalog.baseAnimals.map((value) => value.id)) : null;
  const sourcePackageIds = catalog ? new Set(catalog.sourcePackages.map((value) => value.id)) : null;
  const capabilityIds = catalog ? new Set(catalog.capabilities.map((value) => value.id)) : null;
  const questIds = catalog ? new Set(catalog.quests.map((value) => value.id)) : null;
  const progressionStateIds = catalog ? new Set(catalog.progressionStates.map((value) => value.id)) : null;

  state.creatures.forEach((creature, index) => {
    const path = `creatures[${index}]`;
    if (!isStableId(creature.id)) {
      issues.push({ code: 'invalid_id', path: `${path}.id`, message: `Invalid creature ID: ${creature.id}` });
    }
    if (creatureIds.has(creature.id)) {
      issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `Duplicate creature ID: ${creature.id}` });
    }
    creatureIds.add(creature.id);
    if (creature.estimatedAgeDays !== null && (!Number.isFinite(creature.estimatedAgeDays) || creature.estimatedAgeDays < 0)) {
      issues.push({ code: 'invalid_range', path: `${path}.estimatedAgeDays`, message: 'Estimated age cannot be negative.' });
    }
    if (baseAnimalIds) requireReference(issues, baseAnimalIds, creature.baseAnimalId, `${path}.baseAnimalId`, 'base animal');
    validateSpliceHistory(issues, creature.spliceHistory, `${path}.spliceHistory`);
    for (const environment of ['land', 'water', 'air'] as const) {
      creature.arenaCapabilities[environment].supportingCapabilityIds.forEach((id, refIndex) => {
        if (capabilityIds) {
          requireReference(issues, capabilityIds, id, `${path}.arenaCapabilities.${environment}.supportingCapabilityIds[${refIndex}]`, 'capability');
        }
      });
    }
  });

  if (state.mainCreatureIds.length > 3) {
    issues.push({ code: 'roster_limit', path: 'mainCreatureIds', message: 'Main serious-combat roster cannot contain more than three creatures.' });
  }

  state.mainCreatureIds.forEach((id, index) => {
    const creature = creatureById.get(id);
    if (!creature) {
      issues.push({ code: 'broken_reference', path: `mainCreatureIds[${index}]`, message: `Unknown creature reference: ${id}` });
    } else if (creature.role !== 'main') {
      issues.push({ code: 'roster_role_mismatch', path: `mainCreatureIds[${index}]`, message: `Creature ${id} is not marked as a main creature.` });
    }
  });

  state.testAnimalIds.forEach((id, index) => {
    const creature = creatureById.get(id);
    if (!creature) {
      issues.push({ code: 'broken_reference', path: `testAnimalIds[${index}]`, message: `Unknown creature reference: ${id}` });
    } else if (creature.role !== 'test') {
      issues.push({ code: 'roster_role_mismatch', path: `testAnimalIds[${index}]`, message: `Creature ${id} is not marked as a test animal.` });
    }
  });

  const materialIds = new Set<string>();
  state.materialStock.forEach((lot, index) => {
    const path = `materialStock[${index}]`;
    if (!isStableId(lot.id)) {
      issues.push({ code: 'invalid_id', path: `${path}.id`, message: `Invalid material-lot ID: ${lot.id}` });
    }
    if (materialIds.has(lot.id)) {
      issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `Duplicate material-lot ID: ${lot.id}` });
    }
    materialIds.add(lot.id);
    if (!Number.isFinite(lot.quantity) || lot.quantity < 0) {
      issues.push({ code: 'invalid_range', path: `${path}.quantity`, message: 'Material quantity cannot be negative.' });
    }
    if (sourcePackageIds) requireReference(issues, sourcePackageIds, lot.sourcePackageId, `${path}.sourcePackageId`, 'source package');
  });

  state.researchKnowledge.forEach((record, index) => {
    const path = `researchKnowledge[${index}]`;
    if (!Number.isInteger(record.observationCount) || record.observationCount < 0) {
      issues.push({ code: 'invalid_range', path: `${path}.observationCount`, message: 'Observation count must be an integer >= 0.' });
    }
    if (sourcePackageIds) requireReference(issues, sourcePackageIds, record.sourcePackageId, `${path}.sourcePackageId`, 'source package');
    if (record.baseAnimalId && baseAnimalIds) requireReference(issues, baseAnimalIds, record.baseAnimalId, `${path}.baseAnimalId`, 'base animal');
  });

  state.progression.activeQuestIds.forEach((id, index) => {
    if (questIds) requireReference(issues, questIds, id, `progression.activeQuestIds[${index}]`, 'quest');
  });
  state.progression.completedQuestIds.forEach((id, index) => {
    if (questIds) requireReference(issues, questIds, id, `progression.completedQuestIds[${index}]`, 'quest');
  });
  state.progression.activeStateIds.forEach((id, index) => {
    if (progressionStateIds) requireReference(issues, progressionStateIds, id, `progression.activeStateIds[${index}]`, 'progression state');
  });

  return issues;
}

export function assertValidContentCatalog(catalog: DomainContentCatalog): void {
  const issues = validateContentCatalog(catalog);
  if (issues.length > 0) {
    throw new Error(`Content validation failed:\n${issues.map((issue) => `${issue.code} ${issue.path}: ${issue.message}`).join('\n')}`);
  }
}

export function assertValidDomainState(state: GameDomainState, catalog?: DomainContentCatalog): void {
  const issues = validateDomainState(state, catalog);
  if (issues.length > 0) {
    throw new Error(`Domain-state validation failed:\n${issues.map((issue) => `${issue.code} ${issue.path}: ${issue.message}`).join('\n')}`);
  }
}
