import { ENVIRONMENT_MATERIALS } from './environmentArtLanguage.js';
import {
  ENVIRONMENT_CAPABILITIES,
  ENVIRONMENT_LOCATION_IDS,
  type EnvironmentLocationId,
} from './environmentVisualContract.js';
import {
  LOCAL_PIT_VIEW_HEIGHT,
  LOCAL_PIT_VIEW_WIDTH,
} from '../world/localPit.js';
import { LOCAL_PIT_PRODUCTION_ART_CONTRACT } from '../world/localPitProductionArt.js';
import {
  MASTER_LAB_VIEW_HEIGHT,
  MASTER_LAB_VIEW_WIDTH,
} from '../world/masterLab.js';
import { MASTER_LAB_PRODUCTION_ART_CONTRACT } from '../world/masterLabProductionArt.js';
import { ROUTE_PRODUCTION_ART_CONTRACT } from '../world/routeProductionArt.js';
import {
  YARD_VIEW_HEIGHT,
  YARD_VIEW_WIDTH,
} from '../world/yard.js';
import { YARD_PRODUCTION_ART_CONTRACT } from '../world/yardProductionArt.js';

export type OpeningProductionArtContract = {
  readonly locationId: EnvironmentLocationId;
  readonly geometryId: string;
  readonly authoredStates: readonly ['bright', 'dark'];
  readonly collisionTopology: 'unchanged';
  readonly brightDetailGroups: readonly string[];
  readonly darkStoryGroups: readonly string[];
};

export const OPENING_PRODUCTION_ART_CONTRACTS: Readonly<Record<EnvironmentLocationId, OpeningProductionArtContract>> = {
  yard: YARD_PRODUCTION_ART_CONTRACT,
  route: ROUTE_PRODUCTION_ART_CONTRACT,
  'master-lab': MASTER_LAB_PRODUCTION_ART_CONTRACT,
  'local-pit': LOCAL_PIT_PRODUCTION_ART_CONTRACT,
};

export const OPENING_VISUAL_INTEGRATION_GATE = {
  viewport: { width: 1280, height: 720 },
  protagonistFrame: { width: 64, height: 96 },
  minimumBrightDetailGroups: 7,
  minimumDarkStoryGroups: 6,
  locationIds: ENVIRONMENT_LOCATION_IDS,
  materialIds: Object.keys(ENVIRONMENT_MATERIALS),
  corruptionRuntime: 'ambient-world-corruption-v1',
  handoffPolicy: 'location transitions preserve the accepted gameplay geometry and selected protagonist identity',
  uiPolicy: 'objective, Bag and Map presentation remains legible without creating location-specific UI variants',
} as const;

export function openingVisualIntegrationIssues(): string[] {
  const issues: string[] = [];
  const expectedViewport = OPENING_VISUAL_INTEGRATION_GATE.viewport;
  const viewports = [
    ['yard', YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT],
    ['route', YARD_VIEW_WIDTH, YARD_VIEW_HEIGHT],
    ['master-lab', MASTER_LAB_VIEW_WIDTH, MASTER_LAB_VIEW_HEIGHT],
    ['local-pit', LOCAL_PIT_VIEW_WIDTH, LOCAL_PIT_VIEW_HEIGHT],
  ] as const;

  for (const [id, width, height] of viewports) {
    if (width !== expectedViewport.width || height !== expectedViewport.height) {
      issues.push(`${id}: viewport ${width}x${height} differs from 1280x720 opening contract`);
    }
  }

  for (const id of ENVIRONMENT_LOCATION_IDS) {
    const capability = ENVIRONMENT_CAPABILITIES[id];
    const art = OPENING_PRODUCTION_ART_CONTRACTS[id];
    if (art.locationId !== id) issues.push(`${id}: production-art location id mismatch`);
    if (art.geometryId !== capability.geometryId) issues.push(`${id}: production art and environment geometry ids differ`);
    if (art.collisionTopology !== 'unchanged') issues.push(`${id}: production art changes collision topology`);
    if (art.authoredStates.join('|') !== 'bright|dark') issues.push(`${id}: bright/dark authored state pair is incomplete`);
    if (capability.darkArtStatus !== 'authored') issues.push(`${id}: dark art is not marked authored`);
    if (art.brightDetailGroups.length < OPENING_VISUAL_INTEGRATION_GATE.minimumBrightDetailGroups) {
      issues.push(`${id}: bright production detail manifest is below the integration quality floor`);
    }
    if (art.darkStoryGroups.length < OPENING_VISUAL_INTEGRATION_GATE.minimumDarkStoryGroups) {
      issues.push(`${id}: dark environmental storytelling manifest is below the integration quality floor`);
    }
  }

  if (ENVIRONMENT_CAPABILITIES.yard.geometryId !== ENVIRONMENT_CAPABILITIES.route.geometryId) {
    issues.push('yard/route: connected opening-world geometry contract diverged');
  }
  if (OPENING_VISUAL_INTEGRATION_GATE.materialIds.length !== 10) {
    issues.push('shared material vocabulary is incomplete');
  }

  return issues;
}
