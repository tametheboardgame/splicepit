import { ids } from '../domain/ids.js';
import type {
  BaseAnimalDefinition,
  BiologicalClass,
  BiologicalComplexityProfile,
  BiologicalExpressionDefinition,
  BiologicalRequirementSet,
  DomainContentCatalog,
  SourcePackageDefinition,
} from '../domain/model.js';

const req = (
  allOfTags: readonly string[] = [],
  anyOfTags: readonly string[] = [],
  noneOfTags: readonly string[] = [],
): BiologicalRequirementSet => ({ allOfTags, anyOfTags, noneOfTags });

const cx = (
  integration: BiologicalComplexityProfile['integration'],
  structuralDemand: BiologicalComplexityProfile['structuralDemand'],
  metabolicDemand: BiologicalComplexityProfile['metabolicDemand'],
  regulatoryVolatility: BiologicalComplexityProfile['regulatoryVolatility'],
): BiologicalComplexityProfile => ({ integration, structuralDemand, metabolicDemand, regulatoryVolatility });

interface ExpressionOptions {
  requirements?: BiologicalRequirementSet;
  compatibilityTags?: readonly string[];
  phenotypeHooks?: readonly string[];
  capabilityHooks?: readonly string[];
  createsBiologicalTags?: readonly string[];
}

const e = (
  id: string,
  name: string,
  biologicalClass: BiologicalClass,
  description: string,
  options: ExpressionOptions = {},
): BiologicalExpressionDefinition => ({
  id,
  name,
  biologicalClass,
  description,
  requirements: options.requirements ?? req(),
  compatibilityTags: options.compatibilityTags ?? [],
  createsBiologicalTags: options.createsBiologicalTags ?? [`${biologicalClass}.${id}`],
  phenotypeHooks: options.phenotypeHooks ?? [],
  capabilityHooks: options.capabilityHooks ?? [],
});

const source = (
  id: string,
  name: string,
  sourceSpecies: string,
  biologicalClassTags: readonly BiologicalClass[],
  expressions: readonly BiologicalExpressionDefinition[],
  complexity: BiologicalComplexityProfile,
  compatibilityTags: readonly string[],
  options: {
    description?: string;
    requirements?: BiologicalRequirementSet;
    phenotypeHooks?: readonly string[];
    capabilityHooks?: readonly string[];
    revision?: number;
  } = {},
): SourcePackageDefinition => ({
  id: ids.sourcePackage(id),
  status: 'canon',
  revision: options.revision ?? 1,
  name,
  description: options.description ?? `${sourceSpecies}-derived biological source package with several independently resolvable expression tendencies.`,
  sourceSpecies,
  biologicalClassTags,
  expressions,
  requirements: options.requirements ?? req(),
  compatibilityTags,
  complexity,
  phenotypeHooks: options.phenotypeHooks ?? [`source.${id}`],
  capabilityHooks: options.capabilityHooks ?? [],
  potentialCapabilityIds: [],
  potentialActionIds: [],
});

export const OPENING_BASE_ANIMAL_IDS = [ids.baseAnimal('rabbit'), ids.baseAnimal('goat'), ids.baseAnimal('pig')] as const;
export const OPENING_SOURCE_PACKAGE_IDS = [
  ids.sourcePackage('lion_predatory_suite'),
  ids.sourcePackage('rhinoceros_impact_suite'),
  ids.sourcePackage('elephant_growth_mass_regulation'),
  ids.sourcePackage('gecko_regeneration'),
  ids.sourcePackage('cheetah_sprint_suite'),
  ids.sourcePackage('pangolin_dermal_plate_suite'),
  ids.sourcePackage('owl_nocturnal_sensory_suite'),
  ids.sourcePackage('electric_eel_electrocyte_suite'),
  ids.sourcePackage('toad_toxin_gland_suite'),
  ids.sourcePackage('chameleon_visual_adaptation_suite'),
] as const;

export const CANONICAL_BASE_ANIMALS: readonly BaseAnimalDefinition[] = [
  {
    id: ids.baseAnimal('rabbit'), status: 'canon', revision: 1, name: 'Rabbit', species: 'European rabbit',
    description: 'Light, fast and fragile; common availability makes equivalent test animals easy to source.',
    bodyPlanTags: ['body.mammal', 'body.quadruped', 'body.endoskeleton', 'body.head', 'body.neck', 'body.limbs', 'body.musculature', 'surface.skin', 'surface.fur', 'sense.vision', 'sense.hearing', 'locomotion.terrestrial'],
    biologicalTags: ['frame.light', 'mobility.high', 'hindlimb.powerful', 'vitality.fragile', 'temperament.alert'],
    baselinePhenotypeHooks: ['base.rabbit', 'silhouette.light_quadruped', 'surface.furred'],
    baselineCapabilityHooks: ['movement.land', 'movement.hop', 'sense.alertness', 'offence.hind_kick'],
  },
  {
    id: ids.baseAnimal('goat'), status: 'canon', revision: 1, name: 'Goat', species: 'Domestic goat',
    description: 'Robust mid-sized animal with strong footing, natural horns and useful ramming anatomy.',
    bodyPlanTags: ['body.mammal', 'body.quadruped', 'body.endoskeleton', 'body.head', 'body.neck', 'body.limbs', 'body.musculature', 'body.horns', 'surface.skin', 'surface.fur', 'sense.vision', 'sense.hearing', 'locomotion.terrestrial'],
    biologicalTags: ['frame.medium', 'structure.robust', 'footing.stable', 'impact.head_ram', 'temperament.stubborn'],
    baselinePhenotypeHooks: ['base.goat', 'silhouette.medium_quadruped', 'anatomy.horns', 'surface.furred'],
    baselineCapabilityHooks: ['movement.land', 'movement.climb', 'offence.ram', 'defence.stable_footing'],
  },
  {
    id: ids.baseAnimal('pig'), status: 'canon', revision: 1, name: 'Pig', species: 'Domestic pig',
    description: 'Heavy and durable with strong neck/jaw structure and a naturally high metabolic burden.',
    bodyPlanTags: ['body.mammal', 'body.quadruped', 'body.endoskeleton', 'body.head', 'body.neck', 'body.limbs', 'body.musculature', 'body.jaw', 'surface.skin', 'surface.hair', 'sense.vision', 'sense.hearing', 'sense.smell', 'locomotion.terrestrial'],
    biologicalTags: ['frame.heavy', 'mass.high', 'vitality.high', 'jaw.powerful', 'metabolism.high_demand'],
    baselinePhenotypeHooks: ['base.pig', 'silhouette.heavy_quadruped', 'surface.sparse_hair'],
    baselineCapabilityHooks: ['movement.land', 'offence.bite', 'offence.body_drive', 'sense.scent'],
  },
];

export const CANONICAL_SOURCE_PACKAGES: readonly SourcePackageDefinition[] = [
  source('lion_predatory_suite', 'Lion Predatory Suite', 'Lion', ['behavioural_neurological', 'anatomical', 'physiological'], [
    e('predatory_drive', 'Predatory Drive', 'behavioural_neurological', 'Stronger pursuit commitment and aggression without human-like intelligence.', { compatibilityTags: ['neural.predation', 'behaviour.aggression'], capabilityHooks: ['behaviour.pursuit', 'combat.commitment'] }),
    e('jaw_dentition', 'Jaw and Dentition Development', 'anatomical', 'Predatory jaw/tooth development where the host can structurally support it.', { requirements: req([], ['body.head', 'body.jaw']), compatibilityTags: ['structure.cranial', 'weapon.dentition'], phenotypeHooks: ['head.predatory_jaw'], capabilityHooks: ['offence.bite'] }),
    e('claw_development', 'Claw Development', 'anatomical', 'Claw-like terminal weapon growth on compatible limbs.', { requirements: req(['body.limbs']), compatibilityTags: ['structure.limb_terminal', 'weapon.claw'], phenotypeHooks: ['limb.claws'], capabilityHooks: ['offence.claw'] }),
    e('burst_power', 'Burst Power', 'physiological', 'Short-duration muscular power and acceleration at increased energy demand.', { requirements: req(['body.musculature']), compatibilityTags: ['muscle.burst', 'demand.high_energy'], capabilityHooks: ['movement.burst', 'offence.power'] }),
  ], cx('moderate', 'moderate', 'moderate', 'moderate'), ['source.predatory', 'demand.energy', 'system.musculoskeletal', 'system.neural']),

  source('rhinoceros_impact_suite', 'Rhinoceros Cranial Keratin / Impact Suite', 'Rhinoceros', ['anatomical', 'regulatory'], [
    e('horn_growth', 'Horn Growth', 'anatomical', 'Keratinous horn growth with outcome-dependent number, size, placement and usefulness.', { requirements: req(['body.head']), compatibilityTags: ['surface.keratin', 'structure.cranial', 'weapon.horn'], phenotypeHooks: ['head.horn'], capabilityHooks: ['offence.horn'] }),
    e('cranial_reinforcement', 'Cranial Reinforcement', 'anatomical', 'Skull/neck reinforcement that may support impact loads.', { requirements: req(['body.head'], ['body.neck', 'body.endoskeleton']), compatibilityTags: ['structure.cranial', 'structure.impact'], phenotypeHooks: ['head.heavy_brow', 'neck.reinforced'], capabilityHooks: ['offence.impact'] }),
    e('horn_pattern_regulation', 'Horn Pattern Regulation', 'regulatory', 'Developmental control over horn placement and growth emphasis.', { requirements: req(['body.head']), compatibilityTags: ['regulation.keratin_growth', 'regulation.cranial'], phenotypeHooks: ['head.horn_pattern_variable'] }),
  ], cx('moderate', 'high', 'low', 'moderate'), ['source.impact', 'surface.keratin', 'system.cranial'], { requirements: req([], ['body.head', 'body.endoskeleton']) }),

  source('elephant_growth_mass_regulation', 'Elephant Growth / Mass Regulation', 'Elephant', ['regulatory', 'physiological'], [
    e('growth_amplification', 'Growth Amplification', 'regulatory', 'Signals favouring larger overall body scale.', { compatibilityTags: ['regulation.growth', 'demand.structure', 'demand.energy'], phenotypeHooks: ['proportion.scale_up'], capabilityHooks: ['mass.increase'] }),
    e('supporting_tissue_scaling', 'Supporting Tissue Scaling', 'physiological', 'Thicker load-bearing/supporting tissues that may or may not keep pace with growth.', { requirements: req([], ['body.endoskeleton', 'structure.robust']), compatibilityTags: ['structure.load_bearing', 'tissue.connective'], phenotypeHooks: ['proportion.thick_support'] }),
    e('mass_metabolism', 'Large-Body Metabolic Support', 'physiological', 'Physiological support for maintaining greater mass at high energetic cost.', { compatibilityTags: ['metabolism.mass_support', 'demand.high_energy'], capabilityHooks: ['endurance.mass_support'] }),
  ], cx('high', 'high', 'high', 'high'), ['source.growth', 'demand.structure', 'demand.energy', 'regulation.growth']),

  source('gecko_regeneration', 'Gecko Regeneration Suite', 'Gecko', ['physiological', 'regulatory', 'anatomical'], [
    e('rapid_wound_repair', 'Rapid Wound Repair', 'physiological', 'Accelerated repair with variable speed, quality and metabolic cost.', { compatibilityTags: ['healing.rapid', 'demand.energy'], capabilityHooks: ['recovery.wound_repair'] }),
    e('tissue_regrowth', 'Tissue and Limb Regrowth', 'regulatory', 'Regenerative programmes capable of replacing tissue or appendages to varying completeness.', { requirements: req([], ['body.limbs', 'surface.skin', 'body.musculature']), compatibilityTags: ['regulation.regeneration', 'development.reset'], phenotypeHooks: ['limb.regrowth_variable'], capabilityHooks: ['recovery.regrowth'] }),
    e('scarless_healing', 'Scarless Healing', 'physiological', 'Repair biased toward restoration rather than dense scar formation.', { compatibilityTags: ['healing.scarless'], capabilityHooks: ['recovery.clean_healing'] }),
    e('adhesive_surface', 'Adhesive Surface Side Expression', 'anatomical', 'Possible adhesive pads/surface microstructures as a side expression.', { requirements: req([], ['body.limbs', 'surface.skin']), compatibilityTags: ['surface.adhesive'], phenotypeHooks: ['surface.adhesive_pads'], capabilityHooks: ['movement.adhesion'] }),
  ], cx('high', 'moderate', 'high', 'high'), ['source.regeneration', 'demand.energy', 'development.reset'], { revision: 2 }),

  source('cheetah_sprint_suite', 'Cheetah Fast-Twitch / Sprint Suite', 'Cheetah', ['physiological', 'regulatory'], [
    e('fast_twitch_shift', 'Fast-Twitch Muscle Shift', 'physiological', 'Explosive acceleration through fast-twitch muscle bias.', { requirements: req(['body.musculature']), compatibilityTags: ['muscle.fast_twitch', 'risk.overheat'], capabilityHooks: ['movement.sprint'] }),
    e('heat_dissipation', 'Sprint Heat Dissipation', 'physiological', 'Cooling support for short periods of intense exertion.', { compatibilityTags: ['thermoregulation.cooling', 'demand.energy'], capabilityHooks: ['endurance.sprint_recovery'] }),
    e('sprint_frame_regulation', 'Sprint Frame Regulation', 'regulatory', 'Developmental bias toward lighter/flexible running proportions.', { requirements: req(['body.limbs']), compatibilityTags: ['regulation.proportion', 'risk.structural_strain'], phenotypeHooks: ['proportion.sprint_frame'] }),
  ], cx('moderate', 'moderate', 'high', 'moderate'), ['source.sprint', 'risk.overheat', 'risk.structural_strain']),

  source('pangolin_dermal_plate_suite', 'Pangolin Dermal Plate Suite', 'Pangolin', ['anatomical', 'physiological'], [
    e('dermal_plates', 'Dermal Plates', 'anatomical', 'Overlapping keratin plate growth across suitable skin regions.', { requirements: req(['surface.skin']), compatibilityTags: ['surface.keratin', 'surface.competition'], phenotypeHooks: ['surface.plates'], capabilityHooks: ['defence.armour'] }),
    e('keratin_reinforcement', 'Keratin Reinforcement', 'physiological', 'Increased strength/thickness of keratinised surfaces.', { requirements: req(['surface.skin']), compatibilityTags: ['surface.keratin', 'demand.material'], capabilityHooks: ['defence.keratin'] }),
    e('plate_flexion', 'Plate Flexion Support', 'physiological', 'Soft-tissue support allowing heavy plates to move without fully immobilising the host.', { requirements: req([], ['body.limbs', 'body.musculature']), compatibilityTags: ['surface.plates', 'mobility.tradeoff'], capabilityHooks: ['defence.armour_mobility'] }),
  ], cx('moderate', 'moderate', 'low', 'low'), ['source.armour', 'surface.keratin', 'surface.competition', 'mobility.tradeoff'], { requirements: req(['surface.skin']) }),

  source('owl_nocturnal_sensory_suite', 'Owl Nocturnal Sensory Suite', 'Owl', ['sensory', 'anatomical', 'behavioural_neurological'], [
    e('low_light_vision', 'Low-Light Vision', 'sensory', 'Improved visual sensitivity in dim conditions.', { requirements: req([], ['sense.vision', 'body.head']), compatibilityTags: ['sense.low_light'], capabilityHooks: ['sense.night_vision'] }),
    e('directional_hearing', 'Directional Hearing', 'sensory', 'Fine directional auditory localisation.', { requirements: req([], ['sense.hearing', 'body.head']), compatibilityTags: ['sense.directional_hearing'], capabilityHooks: ['sense.sound_localisation'] }),
    e('ocular_cranial_adaptation', 'Ocular / Cranial Adaptation', 'anatomical', 'Eye/skull changes supporting owl-like sensory geometry, potentially awkward on unsuitable hosts.', { requirements: req(['body.head']), compatibilityTags: ['structure.cranial', 'sense.vision'], phenotypeHooks: ['head.owl_eye_geometry'] }),
    e('target_lock_reflex', 'Target-Lock Reflex', 'behavioural_neurological', 'Tracking reflexes improving attention to moving targets without general intelligence gain.', { compatibilityTags: ['neural.tracking', 'sense.integration'], capabilityHooks: ['combat.tracking'] }),
  ], cx('moderate', 'moderate', 'moderate', 'moderate'), ['source.nocturnal', 'sense.integration', 'system.cranial']),

  source('electric_eel_electrocyte_suite', 'Electric Eel Electrocyte Suite', 'Electric eel', ['biochemical', 'physiological', 'sensory'], [
    e('electrical_discharge', 'Electrical Discharge', 'biochemical', 'Electrochemical tissue capable of external discharge if enough support biology develops.', { requirements: req([], ['body.musculature', 'body.limbs']), compatibilityTags: ['system.electrogenic', 'risk.self_damage'], capabilityHooks: ['offence.electrical_discharge'] }),
    e('electrocyte_support', 'Electrocyte Support Physiology', 'physiological', 'Tissue and ionic regulation supporting repeated bioelectric output at high metabolic cost.', { compatibilityTags: ['system.electrogenic', 'metabolism.ion_balance', 'demand.high_energy'], capabilityHooks: ['resource.bioelectric_charge'] }),
    e('electroreception', 'Electroreception', 'sensory', 'Sensitivity to nearby electrical fields.', { compatibilityTags: ['sense.electric_field', 'sense.integration'], capabilityHooks: ['sense.electroreception'] }),
  ], cx('high', 'moderate', 'extreme', 'high'), ['source.electrogenic', 'demand.extreme_energy', 'risk.self_damage', 'system.ion_balance']),

  source('toad_toxin_gland_suite', 'Toad Toxin / Gland Suite', 'Toad', ['biochemical', 'anatomical'], [
    e('toxin_secretion', 'Toxin Secretion', 'biochemical', 'Production/release of defensive toxins with outcome-dependent strength and self-tolerance.', { requirements: req(['surface.skin']), compatibilityTags: ['chemical.toxin', 'risk.self_toxicity'], capabilityHooks: ['defence.toxin_contact'] }),
    e('specialised_glands', 'Specialised Glands', 'anatomical', 'New or enlarged gland structures whose placement can compete with other surface systems.', { requirements: req(['surface.skin']), compatibilityTags: ['surface.glands', 'surface.competition'], phenotypeHooks: ['surface.gland_clusters'], capabilityHooks: ['defence.gland_secretion'] }),
    e('gland_distribution', 'Gland Distribution', 'anatomical', 'Distributed glandular-skin expression that can alter texture and defensive coverage.', { requirements: req(['surface.skin']), compatibilityTags: ['surface.glands', 'surface.texture'], phenotypeHooks: ['surface.glandular_texture'] }),
  ], cx('moderate', 'low', 'moderate', 'moderate'), ['source.toxin', 'surface.glands', 'risk.self_toxicity', 'surface.competition'], { requirements: req(['surface.skin']) }),

  source('chameleon_visual_adaptation_suite', 'Chameleon Chromatophore / Visual Adaptation Suite', 'Chameleon', ['physiological', 'sensory', 'regulatory'], [
    e('chromatophore_colour_change', 'Chromatophore Colour Change', 'physiological', 'Active colour/pattern change across suitable surface tissue.', { requirements: req(['surface.skin']), compatibilityTags: ['surface.chromatophore', 'demand.energy'], phenotypeHooks: ['surface.dynamic_colour'], capabilityHooks: ['concealment.camouflage'] }),
    e('visual_tracking', 'Independent Visual Tracking', 'sensory', 'Partially independent eye tracking and widened visual attention where anatomy permits.', { requirements: req([], ['sense.vision', 'body.head']), compatibilityTags: ['sense.vision', 'tracking.visual'], phenotypeHooks: ['eye.independent_tracking'], capabilityHooks: ['sense.wide_tracking'] }),
    e('pattern_regulation', 'Pattern Regulation', 'regulatory', 'Developmental control over where colour-changing tissue appears.', { requirements: req(['surface.skin']), compatibilityTags: ['regulation.surface_pattern', 'surface.chromatophore'], phenotypeHooks: ['surface.pattern_zones'] }),
    e('camouflage_response', 'Camouflage Response', 'physiological', 'Response linking environmental input to active surface colour adjustment.', { requirements: req(['surface.skin'], ['sense.vision']), compatibilityTags: ['surface.chromatophore', 'sense.integration'], capabilityHooks: ['concealment.adaptive_camouflage'] }),
  ], cx('high', 'low', 'moderate', 'high'), ['source.camouflage', 'surface.chromatophore', 'sense.integration', 'demand.energy'], { requirements: req(['surface.skin']) }),
];

export const BIOLOGY_CONTENT_CATALOG: DomainContentCatalog = {
  baseAnimals: CANONICAL_BASE_ANIMALS,
  sourcePackages: CANONICAL_SOURCE_PACKAGES,
  mutations: [], capabilities: [], actions: [], items: [], locations: [], quests: [], progressionStates: [],
};
