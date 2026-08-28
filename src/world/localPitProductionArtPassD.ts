import {
  drawPassDLocalPitExteriorBright,
  drawPassDLocalPitExteriorBrightForeground,
  drawPassDLocalPitExteriorDark,
  drawPassDLocalPitExteriorDarkForeground,
} from './localPitProductionArtPassDExterior.js';
import {
  drawPassDLocalPitInteriorBright,
  drawPassDLocalPitInteriorBrightForeground,
  drawPassDLocalPitInteriorDark,
  drawPassDLocalPitInteriorDarkForeground,
} from './localPitProductionArtPassDInterior.js';

export const LOCAL_PIT_PRODUCTION_ART_CONTRACT = {
  locationId: 'local-pit',
  geometryId: 'local-pit-v1',
  authoredStates: ['bright', 'dark'] as const,
  collisionTopology: 'unchanged' as const,
  activeArtGeneration: 'graphics-tightening-pass-d' as const,
  qualityReference: 'master-lab-and-approved-protagonists' as const,
  replacementMode: 'authored-exterior-and-interior-not-legacy-overlay-stack' as const,
  brightDetailGroups: [
    'authored-exterior-arrival',
    'venue-facade-and-gate',
    'animal-handling-and-loading',
    'reception-and-registration',
    'prep-weigh-and-decon',
    'results-payout-and-medical',
    'arena-and-spectator-business',
    'directional-lighting-and-depth',
  ] as const,
  darkStoryGroups: [
    'exterior-organic-intrusion',
    'failed-cleanup-and-runoff',
    'warped-holding-equipment',
    'arena-rail-and-floor-intrusion',
    'wrong-crowd-and-shadow',
    'blood-and-biological-residue',
  ] as const,
} as const;

export function drawPassDLocalPitBright(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDLocalPitExteriorBright(ctx, now);
  drawPassDLocalPitInteriorBright(ctx, now);
}

export function drawPassDLocalPitDark(ctx: CanvasRenderingContext2D, now: number): void {
  drawPassDLocalPitExteriorDark(ctx, now);
  drawPassDLocalPitInteriorDark(ctx, now);
}

export function drawPassDLocalPitBrightForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawPassDLocalPitExteriorBrightForeground(ctx, playerFeetY);
  drawPassDLocalPitInteriorBrightForeground(ctx, playerFeetY);
}

export function drawPassDLocalPitDarkForeground(ctx: CanvasRenderingContext2D, playerFeetY: number): void {
  drawPassDLocalPitExteriorDarkForeground(ctx, playerFeetY);
  drawPassDLocalPitInteriorDarkForeground(ctx, playerFeetY);
}
