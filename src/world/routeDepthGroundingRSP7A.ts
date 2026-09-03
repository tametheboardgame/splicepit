import { RSP7A_ROUTE_SCENE_PACK } from './routeScenePackRSP7A.js';
import type { RouteSceneRect } from './routeScenePack.js';

export interface Rsp7aRouteForegroundOccluder {
  readonly id:
    | 'yard-entry-gate-front'
    | 'master-lab-entry-front-frame'
    | 'weighbridge-booth-front'
    | 'weighbridge-east-utility-front'
    | 'local-pit-gate-front';
  readonly bounds: RouteSceneRect;
  readonly sortY: number;
}

const SCALE = RSP7A_ROUTE_SCENE_PACK.source.scale;

function sourceRect(x: number, y: number, width: number, height: number): RouteSceneRect {
  return { x: x * SCALE, y: y * SCALE, width: width * SCALE, height: height * SCALE };
}

function sourceY(y: number): number {
  return y * SCALE;
}

/**
 * RSP-7A foreground is intentionally sparse. These are exact-base-pixel crops
 * of structures that genuinely pass in front of the protagonist. Ordinary
 * road, dirt, grass, weighbridge deck and open staging pixels are excluded.
 */
export const RSP7A_ROUTE_DEPTH_CONTRACT = {
  foreground: {
    mode: 'exact-base-pixel-regions',
    occluders: [
      {
        id: 'yard-entry-gate-front',
        bounds: sourceRect(45, 520, 100, 55),
        sortY: sourceY(575),
      },
      {
        id: 'master-lab-entry-front-frame',
        bounds: sourceRect(635, 205, 88, 55),
        sortY: sourceY(260),
      },
      {
        id: 'weighbridge-booth-front',
        bounds: sourceRect(520, 278, 65, 52),
        sortY: sourceY(334),
      },
      {
        id: 'weighbridge-east-utility-front',
        bounds: sourceRect(680, 315, 50, 50),
        sortY: sourceY(365),
      },
      {
        id: 'local-pit-gate-front',
        bounds: sourceRect(675, 530, 90, 55),
        sortY: sourceY(585),
      },
    ] as const satisfies readonly Rsp7aRouteForegroundOccluder[],
  },
  grounding: {
    shadow: {
      offsetY: -4,
      radiusX: 20,
      radiusY: 6,
      alpha: 0.22,
    },
  },
} as const;

export function rsp7aRouteForegroundOccluders(playerFeetY: number): readonly Rsp7aRouteForegroundOccluder[] {
  return RSP7A_ROUTE_DEPTH_CONTRACT.foreground.occluders.filter((occluder) => playerFeetY < occluder.sortY);
}

export function rsp7aRouteGroundingShadowAt(feetX: number, feetY: number) {
  const shadow = RSP7A_ROUTE_DEPTH_CONTRACT.grounding.shadow;
  return {
    x: feetX,
    y: feetY + shadow.offsetY,
    radiusX: shadow.radiusX,
    radiusY: shadow.radiusY,
    alpha: shadow.alpha,
  } as const;
}
