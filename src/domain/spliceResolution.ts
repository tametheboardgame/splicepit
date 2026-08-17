import type { CompatibilityAssessment } from './compatibility.js';
import {
  SPLICE_OUTCOME_BANDS,
  type BiologicalComplexityLevel,
  type SourcePackageDefinition,
  type SpliceOutcomeBand,
} from './model.js';
import type { RandomSnapshot, RandomSource } from '../random/RandomSource.js';

export interface SpliceResolutionInput {
  incomingSources: readonly SourcePackageDefinition[];
  compatibility: CompatibilityAssessment;
  currentStability: number;
  accumulatedComplexity: number;
  facilitySafety: number;
  facilityPrecision: number;
  materialQuality: number;
}

export interface SpliceRiskContext {
  incomingComplexity: number;
  incomingComplexityPressure: number;
  accumulatedComplexityPressure: number;
  compatibilityFactor: number;
  requirementFailureRatio: number;
  instabilityPressure: number;
  riskPressure: number;
  catastrophicEligible: boolean;
}

export interface SpliceOutcomeProbability {
  band: SpliceOutcomeBand;
  weight: number;
  probability: number;
}

export interface ResolvedExpression {
  sourcePackageId: SourcePackageDefinition['id'];
  expressionId: string;
  expressed: boolean;
  selectionChance: number;
  magnitude: number;
  completeness: number;
  efficiency: number;
  reliability: number;
  stability: number;
}

export type SpliceInjurySeverity = 'none' | 'minor' | 'major' | 'permanent' | 'lethal';

export interface SpliceConsequences {
  mutationTriggered: boolean;
  permanentDamage: boolean;
  death: boolean;
  injurySeverity: SpliceInjurySeverity;
}

export interface SpliceResolutionResult {
  outcomeBand: SpliceOutcomeBand;
  distribution: readonly SpliceOutcomeProbability[];
  risk: SpliceRiskContext;
  expressions: readonly ResolvedExpression[];
  stabilityBefore: number;
  stabilityDelta: number;
  stabilityAfter: number;
  consequences: SpliceConsequences;
  randomBefore: RandomSnapshot;
  randomAfter: RandomSnapshot;
}

const COMPLEXITY_VALUE: Readonly<Record<BiologicalComplexityLevel, number>> = {
  low: 0.25,
  moderate: 0.5,
  high: 0.75,
  extreme: 1,
};

const EXPRESSION_SELECTION_BASE: Readonly<Record<SpliceOutcomeBand, number>> = {
  clean_rejection: 0.02,
  damaging_failure: 0.1,
  partial_expression: 0.48,
  unstable_viable: 0.76,
  normal_success: 0.86,
  mutated_success: 0.89,
  exceptional_synergy: 0.95,
  catastrophic_result: 0.08,
};

const MINIMUM_EXPRESSION_COUNT: Readonly<Record<SpliceOutcomeBand, number>> = {
  clean_rejection: 0,
  damaging_failure: 0,
  partial_expression: 1,
  unstable_viable: 1,
  normal_success: 1,
  mutated_success: 1,
  exceptional_synergy: 1,
  catastrophic_result: 0,
};

const STRENGTH_RANGE: Readonly<Record<SpliceOutcomeBand, readonly [number, number]>> = {
  clean_rejection: [0.02, 0.15],
  damaging_failure: [0.08, 0.38],
  partial_expression: [0.18, 0.58],
  unstable_viable: [0.45, 0.92],
  normal_success: [0.62, 1.18],
  mutated_success: [0.58, 1.28],
  exceptional_synergy: [0.95, 1.5],
  catastrophic_result: [0.03, 0.3],
};

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be a finite number between 0 and 1.`);
  }
}

function assertInput(input: SpliceResolutionInput): void {
  if (input.incomingSources.length === 0) {
    throw new Error('Splice resolution requires at least one incoming source package.');
  }
  const incomingIds = input.incomingSources.map((source) => source.id);
  if (new Set(incomingIds).size !== incomingIds.length) {
    throw new Error('Splice resolution contains the same incoming source package more than once.');
  }
  const assessmentIds = new Set(input.compatibility.incomingSourceIds);
  if (assessmentIds.size !== incomingIds.length || incomingIds.some((id) => !assessmentIds.has(id))) {
    throw new Error('Compatibility assessment does not match the incoming source packages.');
  }
  if (!Number.isFinite(input.compatibility.netScore)) {
    throw new Error('Compatibility assessment net score must be finite.');
  }
  assertUnitInterval('currentStability', input.currentStability);
  assertUnitInterval('facilitySafety', input.facilitySafety);
  assertUnitInterval('facilityPrecision', input.facilityPrecision);
  assertUnitInterval('materialQuality', input.materialQuality);
  if (!Number.isFinite(input.accumulatedComplexity) || input.accumulatedComplexity < 0) {
    throw new Error('accumulatedComplexity must be a finite non-negative number.');
  }
}

function sourceComplexity(source: SourcePackageDefinition): number {
  const values = [
    source.complexity.integration,
    source.complexity.structuralDemand,
    source.complexity.metabolicDemand,
    source.complexity.regulatoryVolatility,
  ].map((level) => COMPLEXITY_VALUE[level]);
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function calculateSpliceRiskContext(input: SpliceResolutionInput): SpliceRiskContext {
  assertInput(input);
  const incomingComplexity = input.incomingSources.reduce((total, source) => total + sourceComplexity(source), 0);
  const incomingComplexityPressure = 1 - Math.exp(-incomingComplexity / 2.25);
  const accumulatedComplexityPressure = 1 - Math.exp(-input.accumulatedComplexity / 10);
  const compatibilityFactor = clamp(input.compatibility.netScore / 8, -1, 1);
  const requirementFailureRatio = input.compatibility.requirements.length === 0
    ? 0
    : input.compatibility.requirements.filter((requirement) => !requirement.satisfied).length
      / input.compatibility.requirements.length;
  const instabilityPressure = 1 - input.currentStability;
  const incompatibilityPressure = Math.max(0, -compatibilityFactor);
  const riskPressure = clamp(
    (incomingComplexityPressure * 0.25)
      + (accumulatedComplexityPressure * 0.22)
      + (instabilityPressure * 0.28)
      + ((1 - input.facilitySafety) * 0.16)
      + ((1 - input.materialQuality) * 0.08)
      + (incompatibilityPressure * 0.24)
      + (requirementFailureRatio * 0.12),
  );

  return {
    incomingComplexity,
    incomingComplexityPressure,
    accumulatedComplexityPressure,
    compatibilityFactor,
    requirementFailureRatio,
    instabilityPressure,
    riskPressure,
    catastrophicEligible: riskPressure >= 0.68,
  };
}

function outcomeWeights(input: SpliceResolutionInput, risk: SpliceRiskContext): Record<SpliceOutcomeBand, number> {
  const favourable = Math.max(0, risk.compatibilityFactor);
  const hostile = Math.max(0, -risk.compatibilityFactor);
  const precision = input.facilityPrecision;
  const normalWeight = Math.max(
    2,
    48 * (1 - (0.65 * risk.riskPressure))
      + (12 * favourable)
      + (5 * precision),
  );
  const exceptionalWeight = Math.max(
    0.2,
    1 + (10 * favourable) + (2 * precision) - (4 * risk.riskPressure),
  );
  const catastrophicWeight = risk.catastrophicEligible
    ? Math.max(
      0,
      0.4
        + (((risk.riskPressure - 0.68) / 0.32) * 5)
        + (3 * hostile)
        + (1.5 * risk.requirementFailureRatio),
    )
    : 0;

  return {
    clean_rejection: 8
      + (10 * hostile)
      + (6 * risk.requirementFailureRatio)
      + (2 * risk.incomingComplexityPressure),
    damaging_failure: 3
      + (18 * risk.riskPressure)
      + (8 * hostile)
      + (5 * risk.instabilityPressure),
    partial_expression: 16
      + (10 * risk.incomingComplexityPressure)
      + (5 * hostile)
      + (5 * risk.requirementFailureRatio),
    unstable_viable: 7
      + (20 * risk.riskPressure)
      + (8 * risk.instabilityPressure)
      + (6 * risk.accumulatedComplexityPressure),
    normal_success: normalWeight,
    mutated_success: 8
      + (9 * risk.incomingComplexityPressure)
      + (8 * risk.accumulatedComplexityPressure)
      + (8 * risk.riskPressure),
    exceptional_synergy: exceptionalWeight,
    catastrophic_result: catastrophicWeight,
  };
}

export function buildSpliceOutcomeDistribution(input: SpliceResolutionInput): SpliceOutcomeProbability[] {
  const risk = calculateSpliceRiskContext(input);
  const weights = outcomeWeights(input, risk);
  const total = SPLICE_OUTCOME_BANDS.reduce((sum, band) => sum + weights[band], 0);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('Splice outcome distribution produced no positive weight.');
  }
  return SPLICE_OUTCOME_BANDS.map((band) => ({
    band,
    weight: weights[band],
    probability: weights[band] / total,
  }));
}

function chooseOutcomeBand(distribution: readonly SpliceOutcomeProbability[], random: RandomSource): SpliceOutcomeBand {
  const roll = random.next();
  let cumulative = 0;
  for (const entry of distribution) {
    cumulative += entry.probability;
    if (roll < cumulative) return entry.band;
  }
  return distribution[distribution.length - 1]?.band ?? 'normal_success';
}

function expressionRequirementPenalty(
  input: SpliceResolutionInput,
  sourceId: SourcePackageDefinition['id'],
  expressionId: string,
): number {
  const sourceRequirementFailed = input.compatibility.requirements.some(
    (requirement) => requirement.scope === 'source'
      && requirement.sourcePackageId === sourceId
      && !requirement.satisfied,
  );
  const expressionRequirementFailed = input.compatibility.requirements.some(
    (requirement) => requirement.scope === 'expression'
      && requirement.sourcePackageId === sourceId
      && requirement.expressionId === expressionId
      && !requirement.satisfied,
  );
  return (sourceRequirementFailed ? 0.2 : 0) + (expressionRequirementFailed ? 0.42 : 0);
}

function randomBetween(random: RandomSource, minimum: number, maximum: number): number {
  return minimum + ((maximum - minimum) * random.next());
}

function qualityValue(random: RandomSource, centre: number, spread: number, maximum = 1): number {
  return clamp(centre + ((random.next() - 0.5) * spread), 0, maximum);
}

function resolveExpressionStrength(
  band: SpliceOutcomeBand,
  input: SpliceResolutionInput,
  random: RandomSource,
): Pick<ResolvedExpression, 'magnitude' | 'completeness' | 'efficiency' | 'reliability' | 'stability'> {
  const [minimum, maximum] = STRENGTH_RANGE[band];
  const rawMagnitude = randomBetween(random, minimum, maximum);
  const magnitude = clamp(
    rawMagnitude * (0.88 + (0.12 * input.facilityPrecision)) * (0.9 + (0.1 * input.materialQuality)),
    0,
    1.5,
  );
  const normalisedMagnitude = clamp(magnitude / 1.15);
  const completeness = qualityValue(random, (normalisedMagnitude * 0.78) + (input.facilityPrecision * 0.16), 0.3);
  const efficiency = qualityValue(random, (normalisedMagnitude * 0.7) + (input.materialQuality * 0.2), 0.34);
  const reliabilityCentre = (normalisedMagnitude * 0.62)
    + (input.facilityPrecision * 0.16)
    + (input.currentStability * 0.12);
  const stabilityCentre = (input.currentStability * 0.52)
    + (input.facilitySafety * 0.18)
    + (normalisedMagnitude * 0.12);
  return {
    magnitude,
    completeness,
    efficiency,
    reliability: qualityValue(random, reliabilityCentre, band === 'unstable_viable' ? 0.55 : 0.34),
    stability: qualityValue(random, stabilityCentre, band === 'unstable_viable' ? 0.6 : 0.38),
  };
}

function resolveExpressions(
  band: SpliceOutcomeBand,
  input: SpliceResolutionInput,
  risk: SpliceRiskContext,
  random: RandomSource,
): ResolvedExpression[] {
  const candidates = input.incomingSources.flatMap((source) => source.expressions.map((expression) => {
    const penalty = expressionRequirementPenalty(input, source.id, expression.id);
    const selectionChance = clamp(
      EXPRESSION_SELECTION_BASE[band]
        + (risk.compatibilityFactor * 0.08)
        + (input.facilityPrecision * 0.08)
        + (input.materialQuality * 0.05)
        - (risk.incomingComplexityPressure * 0.05)
        - penalty,
      0.01,
      0.99,
    );
    return {
      sourcePackageId: source.id,
      expressionId: expression.id,
      selectionChance,
      roll: random.next(),
    };
  }));

  const expressedKeys = new Set(
    candidates
      .filter((candidate) => candidate.roll < candidate.selectionChance)
      .map((candidate) => `${candidate.sourcePackageId}|${candidate.expressionId}`),
  );
  const minimumCount = Math.min(MINIMUM_EXPRESSION_COUNT[band], candidates.length);
  if (expressedKeys.size < minimumCount) {
    const remaining = candidates
      .filter((candidate) => !expressedKeys.has(`${candidate.sourcePackageId}|${candidate.expressionId}`))
      .map((candidate) => ({ candidate, rescueRoll: random.next() }))
      .sort((left, right) => (
        (right.candidate.selectionChance + (right.rescueRoll * 0.1))
        - (left.candidate.selectionChance + (left.rescueRoll * 0.1))
      ));
    for (const entry of remaining.slice(0, minimumCount - expressedKeys.size)) {
      expressedKeys.add(`${entry.candidate.sourcePackageId}|${entry.candidate.expressionId}`);
    }
  }

  return candidates.map((candidate) => {
    const expressed = expressedKeys.has(`${candidate.sourcePackageId}|${candidate.expressionId}`);
    const strength = expressed
      ? resolveExpressionStrength(band, input, random)
      : { magnitude: 0, completeness: 0, efficiency: 0, reliability: 0, stability: 0 };
    return {
      sourcePackageId: candidate.sourcePackageId,
      expressionId: candidate.expressionId,
      expressed,
      selectionChance: candidate.selectionChance,
      ...strength,
    };
  });
}

function resolveConsequences(
  band: SpliceOutcomeBand,
  risk: SpliceRiskContext,
  random: RandomSource,
): SpliceConsequences {
  if (band === 'catastrophic_result') {
    if (!risk.catastrophicEligible) {
      throw new Error('Catastrophic result resolved without an eligible extreme-risk distribution.');
    }
    const scaledDanger = clamp((risk.riskPressure - 0.68) / 0.32);
    const deathChance = 0.03 + (0.17 * scaledDanger);
    const death = random.next() < deathChance;
    return {
      mutationTriggered: random.next() < 0.45,
      permanentDamage: true,
      death,
      injurySeverity: death ? 'lethal' : 'permanent',
    };
  }

  if (band === 'damaging_failure') {
    const injuryRoll = random.next();
    return {
      mutationTriggered: false,
      permanentDamage: injuryRoll < 0.12,
      death: false,
      injurySeverity: injuryRoll < 0.12 ? 'permanent' : injuryRoll < 0.62 ? 'major' : 'minor',
    };
  }

  if (band === 'unstable_viable') {
    const injuryRoll = random.next();
    return {
      mutationTriggered: random.next() < 0.22,
      permanentDamage: false,
      death: false,
      injurySeverity: injuryRoll < 0.12 ? 'major' : injuryRoll < 0.42 ? 'minor' : 'none',
    };
  }

  if (band === 'mutated_success') {
    return { mutationTriggered: true, permanentDamage: false, death: false, injurySeverity: 'none' };
  }

  if (band === 'exceptional_synergy') {
    return {
      mutationTriggered: random.next() < 0.12,
      permanentDamage: false,
      death: false,
      injurySeverity: 'none',
    };
  }

  if (band === 'partial_expression') {
    return {
      mutationTriggered: false,
      permanentDamage: false,
      death: false,
      injurySeverity: random.next() < 0.08 ? 'minor' : 'none',
    };
  }

  return { mutationTriggered: false, permanentDamage: false, death: false, injurySeverity: 'none' };
}

function baseStabilityDelta(band: SpliceOutcomeBand, risk: SpliceRiskContext): number {
  switch (band) {
    case 'clean_rejection': return -0.01 * risk.incomingComplexityPressure;
    case 'damaging_failure': return -0.1 - (0.1 * risk.riskPressure);
    case 'partial_expression': return -0.035 - (0.045 * risk.incomingComplexityPressure);
    case 'unstable_viable': return -0.12 - (0.1 * risk.riskPressure);
    case 'normal_success': return -0.015 - (0.025 * risk.incomingComplexityPressure);
    case 'mutated_success': return -0.05 - (0.04 * risk.incomingComplexityPressure);
    case 'exceptional_synergy': return -0.008 - (0.012 * risk.incomingComplexityPressure);
    case 'catastrophic_result': return -0.35 - (0.4 * risk.riskPressure);
  }
}

function resolveStabilityDelta(
  band: SpliceOutcomeBand,
  input: SpliceResolutionInput,
  risk: SpliceRiskContext,
  expressions: readonly ResolvedExpression[],
  consequences: SpliceConsequences,
): number {
  const expressed = expressions.filter((expression) => expression.expressed);
  const meanExpressionStability = expressed.length === 0
    ? 0.5
    : expressed.reduce((total, expression) => total + expression.stability, 0) / expressed.length;
  const expressionAdjustment = (meanExpressionStability - 0.5) * 0.04;
  const permanentDamagePenalty = consequences.permanentDamage ? 0.08 : 0;
  const lethalPenalty = consequences.death ? 0.2 : 0;
  return Math.min(
    0,
    baseStabilityDelta(band, risk)
      + expressionAdjustment
      - permanentDamagePenalty
      - lethalPenalty
      - (risk.accumulatedComplexityPressure * 0.012),
  );
}

export function resolveSplice(input: SpliceResolutionInput, random: RandomSource): SpliceResolutionResult {
  assertInput(input);
  const randomBefore = random.snapshot();
  const risk = calculateSpliceRiskContext(input);
  const distribution = buildSpliceOutcomeDistribution(input);
  const outcomeBand = chooseOutcomeBand(distribution, random);
  const expressions = resolveExpressions(outcomeBand, input, risk, random);
  const consequences = resolveConsequences(outcomeBand, risk, random);
  const stabilityDelta = resolveStabilityDelta(outcomeBand, input, risk, expressions, consequences);
  const stabilityAfter = clamp(input.currentStability + stabilityDelta);
  return {
    outcomeBand,
    distribution,
    risk,
    expressions,
    stabilityBefore: input.currentStability,
    stabilityDelta,
    stabilityAfter,
    consequences,
    randomBefore,
    randomAfter: random.snapshot(),
  };
}
