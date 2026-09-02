import {
  RSP4_ROUTE_SCENE_PACK,
  routeSceneAnchor,
  routeSceneExitAt,
  type RouteSceneAnchorId,
  type RouteSceneExit,
  type RouteScenePoint,
} from './routeScenePack.js';

export type RouteInteractionTarget = 'apprentice-yard' | 'master-lab' | 'local-pit';

export interface RouteStoryInteraction {
  readonly id: RouteSceneExit['id'];
  readonly target: RouteInteractionTarget;
  readonly prompt: string;
  readonly entryAnchorId: RouteSceneAnchorId;
  readonly returnAnchorId: RouteSceneAnchorId;
}

export interface RouteDebtEncounterPlacement {
  readonly anchorId: 'debt-encounter';
  readonly label: string;
  readonly triggerPosition: RouteScenePoint;
  readonly representativePosition: RouteScenePoint;
  readonly triggerRadius: number;
  readonly autoTrigger: true;
  readonly normalWorldOnly: true;
  readonly requiresPostDeathLab: true;
  readonly requiresSpliceBenchHandoff: true;
}

/**
 * RSP-5 adds story and interaction meaning without changing RSP-4 geometry.
 * RSP-7 can make this pack production-active without re-authoring coordinates.
 */
export const RSP5_ROUTE_SCENE_PACK = {
  ...RSP4_ROUTE_SCENE_PACK,
  id: 'opening-route-bright-rsp5-v1',
} as const;

export const RSP5_ROUTE_STORY_CONTRACT = {
  scenePackId: RSP5_ROUTE_SCENE_PACK.id,
  objectiveTargets: {
    'find-master': 'master-lab-entrance',
  },
  interactions: [
    {
      id: 'yard-return',
      target: 'apprentice-yard',
      prompt: 'ACTION  Return to the Apprentice Splicer Yard',
      entryAnchorId: 'yard-arrival',
      returnAnchorId: 'yard-arrival',
    },
    {
      id: 'master-lab-entrance',
      target: 'master-lab',
      prompt: 'ACTION  Enter Dr Viktor Splicenstein’s Master Lab',
      entryAnchorId: 'master-lab-entrance',
      returnAnchorId: 'master-lab-return',
    },
    {
      id: 'local-pit-entrance',
      target: 'local-pit',
      prompt: 'ACTION  Enter the Local Pit',
      entryAnchorId: 'local-pit-entrance',
      returnAnchorId: 'local-pit-return',
    },
  ] as const satisfies readonly RouteStoryInteraction[],
  debtEncounter: {
    anchorId: 'debt-encounter',
    label: 'Decommissioned Biosecurity Weighbridge',
    triggerRadius: 150,
    representativeOffset: { x: -78, y: -18 },
    autoTrigger: true,
    normalWorldOnly: true,
    requiresPostDeathLab: true,
    requiresSpliceBenchHandoff: true,
  },
} as const;

export function routeStoryInteractionAt(x: number, y: number): RouteStoryInteraction | null {
  const exit = routeSceneExitAt(RSP5_ROUTE_SCENE_PACK, x, y);
  if (!exit) return null;
  return RSP5_ROUTE_STORY_CONTRACT.interactions.find((interaction) => interaction.id === exit.id) ?? null;
}

export function routeStoryInteractionForTarget(target: RouteInteractionTarget): RouteStoryInteraction {
  const interaction = RSP5_ROUTE_STORY_CONTRACT.interactions.find((candidate) => candidate.target === target);
  if (!interaction) throw new Error(`RSP-5 Route interaction target '${target}' is not authored.`);
  return interaction;
}

export function routeObjectiveAnchor(objectiveId: string): RouteScenePoint | null {
  if (objectiveId !== 'find-master') return null;
  const anchorId = RSP5_ROUTE_STORY_CONTRACT.objectiveTargets['find-master'];
  return routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, anchorId).position;
}

export function routeSafeReturnPosition(target: RouteInteractionTarget): RouteScenePoint {
  const interaction = routeStoryInteractionForTarget(target);
  return routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, interaction.returnAnchorId).position;
}

export function routeDebtEncounterPlacement(): RouteDebtEncounterPlacement {
  const contract = RSP5_ROUTE_STORY_CONTRACT.debtEncounter;
  const anchor = routeSceneAnchor(RSP5_ROUTE_SCENE_PACK, contract.anchorId);
  return {
    anchorId: contract.anchorId,
    label: contract.label,
    triggerPosition: anchor.position,
    representativePosition: {
      x: anchor.position.x + contract.representativeOffset.x,
      y: anchor.position.y + contract.representativeOffset.y,
    },
    triggerRadius: Math.min(contract.triggerRadius, anchor.radius),
    autoTrigger: true,
    normalWorldOnly: true,
    requiresPostDeathLab: true,
    requiresSpliceBenchHandoff: true,
  };
}

export function routeDebtEncounterDistance(playerX: number, playerY: number): number {
  const placement = routeDebtEncounterPlacement();
  return Math.hypot(playerX - placement.triggerPosition.x, playerY - placement.triggerPosition.y);
}

export function shouldTriggerRouteDebtEncounter(input: {
  readonly playerX: number;
  readonly playerY: number;
  readonly armed: boolean;
  readonly routeVisible: boolean;
  readonly cutsceneRunning: boolean;
}): boolean {
  if (!input.armed || !input.routeVisible || input.cutsceneRunning) return false;
  return routeDebtEncounterDistance(input.playerX, input.playerY) <= routeDebtEncounterPlacement().triggerRadius;
}
