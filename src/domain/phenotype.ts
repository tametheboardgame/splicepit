import type {
  BaseAnimalDefinition,
  CreatureState,
  DomainContentCatalog,
  SpliceExpressionRecord,
} from './model.js';

export const PHENOTYPE_SCHEMA_VERSION = 1 as const;

export type PhenotypeRegion = 'body' | 'head' | 'neck' | 'forelimbs' | 'hindlimbs' | 'eyes' | 'tail' | 'surface';

export interface PhenotypeRegionAnchor {
  region: PhenotypeRegion;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AuthoredBaseBody {
  baseAnimalId: string;
  skeletonId: string;
  regions: readonly PhenotypeRegionAnchor[];
  proportions: PhenotypeProportions;
  defaultSurface: string;
}

export interface PhenotypeProportions {
  scale: number;
  bodyLength: number;
  bodyDepth: number;
  legLength: number;
  legThickness: number;
  headScale: number;
  earScale: number;
  tailScale: number;
}

export interface PhenotypeComponent {
  id: string;
  slot: string;
  region: PhenotypeRegion;
  kind: string;
  strength: number;
  variant: number;
  sourceHooks: readonly string[];
}

export interface PhenotypeSurfaceLayer {
  id: string;
  kind: string;
  coverage: number;
  intensity: number;
  variant: number;
  sourceHook: string;
}

export type PhenotypeFallbackReason = 'unsupported_hook' | 'slot_conflict';

export interface PhenotypeFallback {
  hook: string;
  reason: PhenotypeFallbackReason;
  retainedAs: 'diagnostic_only' | 'dominant_component';
  detail: string;
}

export interface PhenotypeBlueprint {
  schemaVersion: typeof PHENOTYPE_SCHEMA_VERSION;
  creatureId: string;
  baseAnimalId: string;
  phenotypeSeed: string;
  skeletonId: string;
  regions: readonly PhenotypeRegionAnchor[];
  proportions: PhenotypeProportions;
  components: readonly PhenotypeComponent[];
  surfaceLayers: readonly PhenotypeSurfaceLayer[];
  fallbacks: readonly PhenotypeFallback[];
  signature: string;
}

interface VisualHookObservation {
  hook: string;
  strength: number;
  sequence: number;
  expressionId: string;
}

interface ComponentRule {
  kind: 'component';
  slot: string;
  region: PhenotypeRegion;
  componentKind: string;
}

interface SurfaceRule {
  kind: 'surface';
  surfaceKind: string;
}

interface ProportionRule {
  kind: 'proportion';
  apply: (proportions: PhenotypeProportions, strength: number) => void;
}

interface NoopRule {
  kind: 'noop';
}

type HookRule = ComponentRule | SurfaceRule | ProportionRule | NoopRule;

const RABBIT_BODY: AuthoredBaseBody = {
  baseAnimalId: 'rabbit',
  skeletonId: 'mammal.rabbit.v1',
  regions: [
    { region: 'body', x: 0, y: 0, width: 1.15, height: 0.72 },
    { region: 'head', x: 0.62, y: -0.2, width: 0.48, height: 0.46 },
    { region: 'neck', x: 0.42, y: -0.05, width: 0.24, height: 0.34 },
    { region: 'forelimbs', x: 0.32, y: 0.38, width: 0.22, height: 0.62 },
    { region: 'hindlimbs', x: -0.38, y: 0.34, width: 0.38, height: 0.66 },
    { region: 'eyes', x: 0.72, y: -0.27, width: 0.12, height: 0.1 },
    { region: 'tail', x: -0.64, y: -0.02, width: 0.18, height: 0.18 },
    { region: 'surface', x: 0, y: 0, width: 1.2, height: 0.78 },
  ],
  proportions: { scale: 0.9, bodyLength: 1.02, bodyDepth: 0.82, legLength: 1.05, legThickness: 0.82, headScale: 0.9, earScale: 1.42, tailScale: 0.72 },
  defaultSurface: 'fur',
};

const GOAT_BODY: AuthoredBaseBody = {
  baseAnimalId: 'goat',
  skeletonId: 'mammal.goat.v1',
  regions: [
    { region: 'body', x: 0, y: 0, width: 1.28, height: 0.78 },
    { region: 'head', x: 0.69, y: -0.18, width: 0.5, height: 0.48 },
    { region: 'neck', x: 0.45, y: -0.08, width: 0.3, height: 0.46 },
    { region: 'forelimbs', x: 0.35, y: 0.4, width: 0.22, height: 0.72 },
    { region: 'hindlimbs', x: -0.4, y: 0.4, width: 0.24, height: 0.72 },
    { region: 'eyes', x: 0.77, y: -0.25, width: 0.12, height: 0.1 },
    { region: 'tail', x: -0.72, y: -0.08, width: 0.24, height: 0.18 },
    { region: 'surface', x: 0, y: 0, width: 1.32, height: 0.82 },
  ],
  proportions: { scale: 1, bodyLength: 1.08, bodyDepth: 0.98, legLength: 1.08, legThickness: 1, headScale: 1, earScale: 0.9, tailScale: 0.82 },
  defaultSurface: 'fur',
};

const PIG_BODY: AuthoredBaseBody = {
  baseAnimalId: 'pig',
  skeletonId: 'mammal.pig.v1',
  regions: [
    { region: 'body', x: 0, y: 0, width: 1.42, height: 0.92 },
    { region: 'head', x: 0.76, y: -0.05, width: 0.6, height: 0.52 },
    { region: 'neck', x: 0.46, y: 0, width: 0.4, height: 0.54 },
    { region: 'forelimbs', x: 0.38, y: 0.48, width: 0.25, height: 0.58 },
    { region: 'hindlimbs', x: -0.42, y: 0.48, width: 0.27, height: 0.58 },
    { region: 'eyes', x: 0.82, y: -0.16, width: 0.12, height: 0.1 },
    { region: 'tail', x: -0.82, y: -0.02, width: 0.3, height: 0.24 },
    { region: 'surface', x: 0, y: 0, width: 1.48, height: 0.96 },
  ],
  proportions: { scale: 1.08, bodyLength: 1.14, bodyDepth: 1.16, legLength: 0.82, legThickness: 1.18, headScale: 1.12, earScale: 0.72, tailScale: 0.9 },
  defaultSurface: 'sparse_hair',
};

export const OPENING_AUTHORED_BASE_BODIES: readonly AuthoredBaseBody[] = [RABBIT_BODY, GOAT_BODY, PIG_BODY];

const HOOK_RULES: Readonly<Record<string, HookRule>> = {
  'base.rabbit': { kind: 'noop' },
  'base.goat': { kind: 'noop' },
  'base.pig': { kind: 'noop' },
  'silhouette.light_quadruped': { kind: 'noop' },
  'silhouette.medium_quadruped': { kind: 'noop' },
  'silhouette.heavy_quadruped': { kind: 'noop' },
  'surface.furred': { kind: 'surface', surfaceKind: 'fur' },
  'surface.sparse_hair': { kind: 'surface', surfaceKind: 'sparse_hair' },
  'anatomy.horns': { kind: 'component', slot: 'head.horns', region: 'head', componentKind: 'horn_array' },
  'head.predatory_jaw': { kind: 'component', slot: 'head.jaw', region: 'head', componentKind: 'predatory_jaw' },
  'limb.claws': { kind: 'component', slot: 'limbs.terminals', region: 'forelimbs', componentKind: 'claws' },
  'head.horn': { kind: 'component', slot: 'head.horns', region: 'head', componentKind: 'horn_array' },
  'head.heavy_brow': { kind: 'component', slot: 'head.brow', region: 'head', componentKind: 'heavy_brow' },
  'neck.reinforced': { kind: 'component', slot: 'neck.structure', region: 'neck', componentKind: 'reinforced_neck' },
  'head.horn_pattern_variable': { kind: 'component', slot: 'head.horns', region: 'head', componentKind: 'horn_array' },
  'limb.regrowth_variable': { kind: 'component', slot: 'limbs.regrowth', region: 'hindlimbs', componentKind: 'regrowth_asymmetry' },
  'surface.adhesive_pads': { kind: 'component', slot: 'limbs.pads', region: 'forelimbs', componentKind: 'adhesive_pads' },
  'surface.plates': { kind: 'surface', surfaceKind: 'dermal_plates' },
  'head.owl_eye_geometry': { kind: 'component', slot: 'eyes.geometry', region: 'eyes', componentKind: 'owl_eye_geometry' },
  'surface.gland_clusters': { kind: 'surface', surfaceKind: 'gland_clusters' },
  'surface.glandular_texture': { kind: 'surface', surfaceKind: 'glandular_texture' },
  'surface.dynamic_colour': { kind: 'surface', surfaceKind: 'dynamic_colour' },
  'eye.independent_tracking': { kind: 'component', slot: 'eyes.tracking', region: 'eyes', componentKind: 'independent_tracking' },
  'surface.pattern_zones': { kind: 'surface', surfaceKind: 'pattern_zones' },
  'proportion.scale_up': {
    kind: 'proportion',
    apply: (p, s) => {
      p.scale *= 1 + (0.38 * s);
      p.bodyDepth *= 1 + (0.12 * s);
      p.headScale *= 1 + (0.06 * s);
    },
  },
  'proportion.thick_support': {
    kind: 'proportion',
    apply: (p, s) => {
      p.bodyDepth *= 1 + (0.18 * s);
      p.legThickness *= 1 + (0.28 * s);
      p.legLength *= 1 - (0.05 * s);
    },
  },
  'proportion.sprint_frame': {
    kind: 'proportion',
    apply: (p, s) => {
      p.bodyLength *= 1 + (0.14 * s);
      p.bodyDepth *= 1 - (0.16 * s);
      p.legLength *= 1 + (0.22 * s);
      p.legThickness *= 1 - (0.08 * s);
    },
  },
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function unit(seed: string, key: string): number {
  return hash32(`${seed}|${key}`) / 0xffffffff;
}

function rounded(value: number): number {
  return Number(value.toFixed(4));
}

function expressionStrength(expression: SpliceExpressionRecord): number {
  if (!expression.expressed) return 0;
  return clamp((
    clamp(expression.magnitude) +
    clamp(expression.completeness) +
    clamp(expression.efficiency) +
    clamp(expression.reliability)
  ) / 4);
}

function findBaseBody(baseAnimal: BaseAnimalDefinition): AuthoredBaseBody {
  const body = OPENING_AUTHORED_BASE_BODIES.find((entry) => entry.baseAnimalId === baseAnimal.id);
  if (!body) throw new Error(`No authored phenotype body for base animal ${baseAnimal.id}`);
  return body;
}

function copyProportions(base: PhenotypeProportions, seed: string): PhenotypeProportions {
  const jitter = (key: string, amount: number): number => 1 + ((unit(seed, key) - 0.5) * amount * 2);
  return {
    scale: base.scale * jitter('scale', 0.035),
    bodyLength: base.bodyLength * jitter('bodyLength', 0.045),
    bodyDepth: base.bodyDepth * jitter('bodyDepth', 0.045),
    legLength: base.legLength * jitter('legLength', 0.05),
    legThickness: base.legThickness * jitter('legThickness', 0.045),
    headScale: base.headScale * jitter('headScale', 0.04),
    earScale: base.earScale * jitter('earScale', 0.055),
    tailScale: base.tailScale * jitter('tailScale', 0.06),
  };
}

function collectHooks(creature: CreatureState, baseAnimal: BaseAnimalDefinition): VisualHookObservation[] {
  const observations: VisualHookObservation[] = baseAnimal.baselinePhenotypeHooks.map((hook, index) => ({
    hook,
    strength: hook === 'anatomy.horns' ? 0.72 : 1,
    sequence: -1,
    expressionId: `baseline.${index}`,
  }));

  for (const attempt of [...creature.spliceHistory].sort((a, b) => a.sequence - b.sequence)) {
    for (const expression of attempt.expressions) {
      const strength = expressionStrength(expression);
      if (strength <= 0) continue;
      for (const hook of expression.phenotypeHooks) {
        observations.push({ hook, strength, sequence: attempt.sequence, expressionId: expression.expressionId });
      }
    }
  }

  return observations;
}

function buildSignature(blueprint: Omit<PhenotypeBlueprint, 'signature'>): string {
  const payload = JSON.stringify(blueprint);
  return `phenotype-${hash32(payload).toString(16).padStart(8, '0')}`;
}

export function composePhenotype(creature: CreatureState, catalog: DomainContentCatalog): PhenotypeBlueprint {
  const baseAnimal = catalog.baseAnimals.find((entry) => entry.id === creature.baseAnimalId);
  if (!baseAnimal) throw new Error(`Unknown base animal ${creature.baseAnimalId}`);
  if (!creature.phenotypeSeed) throw new Error(`Creature ${creature.id} has no phenotype seed`);

  const authoredBody = findBaseBody(baseAnimal);
  const proportions = copyProportions(authoredBody.proportions, creature.phenotypeSeed);
  const componentsBySlot = new Map<string, PhenotypeComponent>();
  const surfaces: PhenotypeSurfaceLayer[] = [];
  const fallbacks: PhenotypeFallback[] = [];
  const observations = collectHooks(creature, baseAnimal);

  for (const observation of observations) {
    const rule = HOOK_RULES[observation.hook];
    if (!rule) {
      fallbacks.push({
        hook: observation.hook,
        reason: 'unsupported_hook',
        retainedAs: 'diagnostic_only',
        detail: 'Visible expression is preserved in biology but has no authored visual module yet.',
      });
      continue;
    }

    if (rule.kind === 'noop') continue;

    if (rule.kind === 'proportion') {
      rule.apply(proportions, observation.strength);
      continue;
    }

    if (rule.kind === 'surface') {
      surfaces.push({
        id: `${rule.surfaceKind}.${observation.sequence}.${observation.expressionId}`,
        kind: rule.surfaceKind,
        coverage: rounded(clamp(0.35 + (observation.strength * 0.6))),
        intensity: rounded(observation.strength),
        variant: rounded(unit(creature.phenotypeSeed, `${observation.hook}.${observation.sequence}.surface`)),
        sourceHook: observation.hook,
      });
      continue;
    }

    const candidate: PhenotypeComponent = {
      id: `${rule.componentKind}.${rule.slot}`,
      slot: rule.slot,
      region: rule.region,
      kind: rule.componentKind,
      strength: rounded(observation.strength),
      variant: rounded(unit(creature.phenotypeSeed, `${observation.hook}.${observation.sequence}.component`)),
      sourceHooks: [observation.hook],
    };
    const existing = componentsBySlot.get(rule.slot);
    if (!existing) {
      componentsBySlot.set(rule.slot, candidate);
      continue;
    }

    if (existing.kind === candidate.kind) {
      componentsBySlot.set(rule.slot, {
        ...existing,
        strength: rounded(Math.max(existing.strength, candidate.strength)),
        variant: rounded((existing.variant + candidate.variant) / 2),
        sourceHooks: [...new Set([...existing.sourceHooks, observation.hook])],
      });
      continue;
    }

    if (candidate.strength > existing.strength) {
      fallbacks.push({
        hook: existing.sourceHooks[existing.sourceHooks.length - 1] ?? existing.kind,
        reason: 'slot_conflict',
        retainedAs: 'dominant_component',
        detail: `${candidate.kind} visually dominates slot ${rule.slot}; the suppressed expression remains in creature biology.`,
      });
      componentsBySlot.set(rule.slot, candidate);
    } else {
      fallbacks.push({
        hook: observation.hook,
        reason: 'slot_conflict',
        retainedAs: 'dominant_component',
        detail: `${existing.kind} visually dominates slot ${rule.slot}; the suppressed expression remains in creature biology.`,
      });
    }
  }

  const normalisedProportions: PhenotypeProportions = {
    scale: rounded(clamp(proportions.scale, 0.55, 1.85)),
    bodyLength: rounded(clamp(proportions.bodyLength, 0.62, 1.7)),
    bodyDepth: rounded(clamp(proportions.bodyDepth, 0.58, 1.65)),
    legLength: rounded(clamp(proportions.legLength, 0.58, 1.65)),
    legThickness: rounded(clamp(proportions.legThickness, 0.58, 1.7)),
    headScale: rounded(clamp(proportions.headScale, 0.65, 1.5)),
    earScale: rounded(clamp(proportions.earScale, 0.5, 1.7)),
    tailScale: rounded(clamp(proportions.tailScale, 0.45, 1.65)),
  };

  if (!surfaces.some((surface) => surface.kind === authoredBody.defaultSurface)) {
    surfaces.unshift({
      id: `baseline.${authoredBody.defaultSurface}`,
      kind: authoredBody.defaultSurface,
      coverage: 1,
      intensity: 1,
      variant: rounded(unit(creature.phenotypeSeed, 'baseline.surface')),
      sourceHook: `baseline.${authoredBody.defaultSurface}`,
    });
  }

  const blueprintWithoutSignature: Omit<PhenotypeBlueprint, 'signature'> = {
    schemaVersion: PHENOTYPE_SCHEMA_VERSION,
    creatureId: creature.id,
    baseAnimalId: creature.baseAnimalId,
    phenotypeSeed: creature.phenotypeSeed,
    skeletonId: authoredBody.skeletonId,
    regions: authoredBody.regions.map((region) => ({ ...region })),
    proportions: normalisedProportions,
    components: [...componentsBySlot.values()].sort((a, b) => a.slot.localeCompare(b.slot)),
    surfaceLayers: surfaces.sort((a, b) => a.id.localeCompare(b.id)),
    fallbacks: fallbacks.sort((a, b) => `${a.hook}.${a.reason}`.localeCompare(`${b.hook}.${b.reason}`)),
  };

  return {
    ...blueprintWithoutSignature,
    signature: buildSignature(blueprintWithoutSignature),
  };
}
