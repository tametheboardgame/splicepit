import { RSP5_ROUTE_SCENE_PACK } from './routeStoryIntegration.js';
import type { RouteSceneRect } from './routeScenePack.js';

export interface RouteSceneForegroundOccluder {
  readonly id:
    | 'master-lab-entry-front-frame'
    | 'weighbridge-west-rail'
    | 'weighbridge-booth-front'
    | 'local-pit-gate-front';
  readonly bounds: RouteSceneRect;
  readonly sortY: number;
}

export interface RouteSceneGroundingShadow {
  readonly offsetY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly alpha: number;
}

const SCALE = RSP5_ROUTE_SCENE_PACK.source.scale;

function sourceRect(x: number, y: number, width: number, height: number): RouteSceneRect {
  return {
    x: x * SCALE,
    y: y * SCALE,
    width: width * SCALE,
    height: height * SCALE,
  };
}

function sourceY(y: number): number {
  return y * SCALE;
}

/**
 * RSP-6 adds only authored foreground depth and contact grounding.
 *
 * Every crop is tight to a visible structure that can genuinely pass in front
 * of the protagonist. Ordinary road, dirt, grass and weighbridge deck pixels
 * are deliberately excluded so the foreground pass cannot become a broad mask.
 */
export const RSP6_ROUTE_SCENE_PACK = {
  ...RSP5_ROUTE_SCENE_PACK,
  id: 'opening-route-bright-rsp6-v1',
  foreground: {
    mode: 'exact-base-pixel-regions',
    occluders: [
      {
        id: 'master-lab-entry-front-frame',
        bounds: sourceRect(558, 174, 100, 84),
        sortY: sourceY(252),
      },
      {
        id: 'weighbridge-west-rail',
        bounds: sourceRect(516, 303, 42, 126),
        sortY: sourceY(420),
      },
      {
        id: 'weighbridge-booth-front',
        bounds: sourceRect(668, 278, 58, 111),
        sortY: sourceY(390),
      },
      {
        id: 'local-pit-gate-front',
        bounds: sourceRect(720, 568, 99, 92),
        sortY: sourceY(651),
      },
    ] as const satisfies readonly RouteSceneForegroundOccluder[],
  },
  grounding: {
    shadow: {
      offsetY: -4,
      radiusX: 20,
      radiusY: 6,
      alpha: 0.22,
    } as const satisfies RouteSceneGroundingShadow,
  },
} as const;

export function routeSceneForegroundOccluders(playerFeetY: number): readonly RouteSceneForegroundOccluder[] {
  return RSP6_ROUTE_SCENE_PACK.foreground.occluders.filter((occluder) => playerFeetY < occluder.sortY);
}

export function routeGroundingShadowAt(feetX: number, feetY: number): {
  readonly x: number;
  readonly y: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly alpha: number;
} {
  const shadow = RSP6_ROUTE_SCENE_PACK.grounding.shadow;
  return {
    x: feetX,
    y: feetY + shadow.offsetY,
    radiusX: shadow.radiusX,
    radiusY: shadow.radiusY,
    alpha: shadow.alpha,
  };
}
