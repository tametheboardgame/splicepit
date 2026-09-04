import { RSP6_ROUTE_SCENE_PACK } from './routeDepthGrounding.js';
import {
  isRouteScenePositionBlocked,
  routeSceneAnchor,
  routeSceneCameraLimits,
  type RouteScenePoint,
} from './routeScenePack.js';
import {
  routeSafeReturnPosition,
  routeStoryInteractionAt,
  routeStoryInteractionForTarget,
  type RouteInteractionTarget,
  type RouteStoryInteraction,
} from './routeStoryIntegration.js';
import {
  isYardScenePositionBlocked,
  YSP6_YARD_SCENE_PACK,
  type YardScenePack,
  type YardScenePoint,
} from './yardScenePack.js';

const YARD_RETURN_CLEARANCE = 24;

/**
 * Pure geometry/semantic contract used by the RSP-7 production cutover.
 *
 * This module deliberately has no browser or asset dependencies. It lets the
 * runtime switch from the legacy opening-world coordinates to the authored
 * RSP-4/RSP-5/RSP-6 scene as one operation once the atomic Bright + Dark asset
 * gate is ready.
 */
export const RSP7_ROUTE_PRODUCTION_CUTOVER_CONTRACT = {
  id: 'opening-route-production-rsp7-v1',
  scenePackId: RSP6_ROUTE_SCENE_PACK.id,
  renderer: 'scene-image',
  yardEntryTarget: 'apprentice-yard',
  interiorTargets: ['master-lab', 'local-pit'],
  returnPolicy: 'semantic-authored-anchor',
  legacyCoordinatesAllowed: false,
} as const;

export type RouteInteriorTarget = Extract<RouteInteractionTarget, 'master-lab' | 'local-pit'>;

/** Authored Route position used when leaving the scene-image Yard. */
export function routeProductionEntryFromYard(): RouteScenePoint {
  const interaction = routeStoryInteractionForTarget('apprentice-yard');
  return routeSceneAnchor(RSP6_ROUTE_SCENE_PACK, interaction.entryAnchorId).position;
}

/** Authored collision wrapper for the production Route runtime. */
export function isRouteProductionPositionBlocked(feetX: number, feetY: number): boolean {
  return isRouteScenePositionBlocked(RSP6_ROUTE_SCENE_PACK, feetX, feetY);
}

/** Authored camera limits for the production Route runtime. */
export function routeProductionCameraLimits(
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number; width: number; height: number } {
  return routeSceneCameraLimits(RSP6_ROUTE_SCENE_PACK, viewportWidth, viewportHeight);
}

/** Current authored exit/interaction at the player's feet. */
export function routeProductionInteractionAt(x: number, y: number): RouteStoryInteraction | null {
  return routeStoryInteractionAt(x, y);
}

/**
 * Authored Route-side position used when an interior runtime exits. Consumers
 * pass only the semantic interior target, never raw Route coordinates.
 */
export function routeProductionReturnFromInterior(target: RouteInteriorTarget): RouteScenePoint {
  return routeSafeReturnPosition(target);
}

/**
 * Scene-owned safe position just inside the Yard after taking the authored
 * Route's `yard-return` interaction. Prefer the broad south path because it is
 * the human-reviewed visible route out of the YSP-10 Yard; fall back to the
 * Yard spawn only if future geometry makes that derived position blocked.
 */
export function yardProductionReturnFromRoute(
  pack: YardScenePack = YSP6_YARD_SCENE_PACK,
): YardScenePoint {
  const exit = pack.exits.find((candidate) => candidate.id === 'master-lab-south-path')
    ?? pack.exits.find((candidate) => candidate.id === 'master-lab-tunnel');
  if (!exit) return pack.spawn;

  const candidate = {
    x: exit.bounds.x + exit.bounds.width / 2,
    y: Math.max(pack.boundaryInset + pack.playerFeetHitbox.height, exit.bounds.y - YARD_RETURN_CLEARANCE),
  };
  return isYardScenePositionBlocked(pack, candidate.x, candidate.y) ? pack.spawn : candidate;
}
