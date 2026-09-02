export type RouteScenePoint = { readonly x: number; readonly y: number };
export type RouteSceneRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

export type RouteSceneAnchorId =
  | 'yard-arrival'
  | 'master-lab-entrance'
  | 'master-lab-return'
  | 'debt-encounter'
  | 'local-pit-entrance'
  | 'local-pit-return';

export interface RouteSceneAnchor {
  readonly id: RouteSceneAnchorId;
  readonly role: 'arrival' | 'door' | 'return' | 'story';
  readonly position: RouteScenePoint;
  readonly radius: number;
}

export interface RouteSceneExit {
  readonly id: 'yard-return' | 'master-lab-entrance' | 'local-pit-entrance';
  readonly bounds: RouteSceneRect;
  readonly target: 'apprentice-yard' | 'master-lab' | 'local-pit';
  readonly activation: 'interact';
  readonly safeReturnAnchor: RouteSceneAnchorId;
}

export interface RouteSceneCollider {
  readonly id: string;
  readonly bounds: RouteSceneRect;
}

export interface RouteScenePack {
  readonly id: string;
  readonly renderer: 'scene-image';
  readonly source: {
    readonly width: number;
    readonly height: number;
    readonly scale: number;
    readonly assetPath: string;
  };
  readonly world: {
    readonly width: number;
    readonly height: number;
  };
  readonly cameraBounds: RouteSceneRect;
  readonly playerFeetHitbox: {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly width: number;
    readonly height: number;
  };
  readonly boundaryInset: number;
  readonly spawn: RouteScenePoint;
  readonly collision: {
    readonly mode: 'blocked-rectangles';
    readonly colliders: readonly RouteSceneCollider[];
  };
  readonly anchors: readonly RouteSceneAnchor[];
  readonly exits: readonly RouteSceneExit[];
}

const SCALE = 3;

function point(x: number, y: number): RouteScenePoint {
  return { x: x * SCALE, y: y * SCALE };
}

function rect(x: number, y: number, width: number, height: number): RouteSceneRect {
  return { x: x * SCALE, y: y * SCALE, width: width * SCALE, height: height * SCALE };
}

function collider(id: string, x: number, y: number, width: number, height: number): RouteSceneCollider {
  return { id, bounds: rect(x, y, width, height) };
}

/**
 * RSP-4 geometry authored directly from the locked RSP-3 Bright Route raster.
 *
 * Source coordinates below are intentionally expressed against the 1024 × 683
 * production image and converted to the locked 3× world mapping. Small scenic
 * clutter remains traversable; only large, visually solid masses and coherent
 * perimeter barriers are represented as collision.
 */
export const RSP4_ROUTE_SCENE_PACK = {
  id: 'opening-route-bright-rsp4-v1',
  renderer: 'scene-image',
  source: {
    width: 1024,
    height: 683,
    scale: SCALE,
    assetPath: '/generated/rsp3/route-bright-base.jpg',
  },
  world: { width: 3072, height: 2049 },
  cameraBounds: { x: 0, y: 0, width: 3072, height: 2049 },
  playerFeetHitbox: { offsetX: -11, offsetY: -13, width: 22, height: 15 },
  boundaryInset: 18,

  // Inside the lower-left Yard-side service gate, on broad visible dirt.
  spawn: point(258, 493),

  collision: {
    mode: 'blocked-rectangles',
    colliders: [
      // North-west animal/greenhouse operation and its fenced paddocks.
      collider('northwest-greenhouse-bank', 0, 0, 247, 170),
      collider('northwest-paddock-west', 0, 165, 118, 132),
      collider('northwest-paddock-east', 118, 165, 126, 80),
      collider('northwest-windmill-base', 216, 137, 48, 112),

      // Woodland/rock mass separating the farm operation from Viktor's Lab.
      collider('north-central-woodland', 360, 0, 137, 160),
      collider('north-central-rock-bank', 407, 131, 94, 94),

      // Viktor's Lab. The entrance notch remains open around x≈580–625/y≈180–260.
      collider('viktor-lab-upper', 500, 0, 367, 158),
      collider('viktor-lab-west-wing', 486, 136, 84, 112),
      collider('viktor-lab-east-wing', 642, 132, 238, 178),
      collider('viktor-lab-east-tank', 816, 120, 78, 165),
      collider('lab-cliff-retaining-wall', 850, 220, 80, 154),

      // Right-hand cliff remains a clear physical world edge above the Pit road.
      collider('east-cliff-upper', 918, 0, 106, 405),
      collider('east-cliff-middle', 889, 350, 135, 166),

      // Weighbridge is traversable staging ground; only the booth/rail machinery is solid.
      collider('weighbridge-west-rail', 520, 281, 30, 126),
      collider('weighbridge-booth', 672, 278, 48, 104),
      collider('weighbridge-east-rail', 690, 373, 30, 58),

      // South-west Yard-side industrial compound and gate structure.
      collider('southwest-tank-complex', 0, 333, 174, 221),
      collider('yard-gate-west-post', 120, 518, 37, 101),
      collider('yard-gate-east-post', 235, 516, 38, 102),
      collider('yard-fence-east-return', 272, 520, 94, 83),
      collider('yard-service-crates', 0, 556, 116, 84),

      // Lower central vegetation/fence masses frame, but do not narrow, the Pit road.
      collider('south-central-fenced-growth', 350, 466, 232, 167),
      collider('south-central-tree-mass', 451, 518, 190, 165),
      collider('weighbridge-south-verge', 538, 438, 105, 80),

      // Local Pit-side woodland/rock and the visible circular utility excavation.
      collider('pit-side-rock-bank', 822, 404, 202, 120),
      collider('pit-side-utility-ring', 794, 500, 123, 112),
      collider('pit-side-woodland', 900, 500, 124, 183),
      collider('south-east-fence-return', 815, 606, 92, 77),
    ],
  },

  anchors: [
    { id: 'yard-arrival', role: 'arrival', position: point(258, 493), radius: 132 },
    { id: 'master-lab-entrance', role: 'door', position: point(594, 227), radius: 126 },
    { id: 'master-lab-return', role: 'return', position: point(575, 275), radius: 108 },
    { id: 'debt-encounter', role: 'story', position: point(651, 424), radius: 162 },
    { id: 'local-pit-entrance', role: 'door', position: point(753, 660), radius: 135 },
    { id: 'local-pit-return', role: 'return', position: point(749, 608), radius: 114 },
  ],

  exits: [
    {
      id: 'yard-return',
      bounds: rect(174, 505, 78, 90),
      target: 'apprentice-yard',
      activation: 'interact',
      safeReturnAnchor: 'yard-arrival',
    },
    {
      id: 'master-lab-entrance',
      bounds: rect(568, 194, 62, 69),
      target: 'master-lab',
      activation: 'interact',
      safeReturnAnchor: 'master-lab-return',
    },
    {
      id: 'local-pit-entrance',
      bounds: rect(704, 642, 104, 41),
      target: 'local-pit',
      activation: 'interact',
      safeReturnAnchor: 'local-pit-return',
    },
  ],
} as const satisfies RouteScenePack;

function overlaps(a: RouteSceneRect, b: RouteSceneRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function containsPoint(bounds: RouteSceneRect, x: number, y: number): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

export function routeSceneAnchor(pack: RouteScenePack, id: RouteSceneAnchorId): RouteSceneAnchor {
  const anchor = pack.anchors.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Route scene anchor '${id}' is missing from ${pack.id}`);
  return anchor;
}

export function routeSceneExitAt(pack: RouteScenePack, x: number, y: number): RouteSceneExit | null {
  return pack.exits.find((exit) => containsPoint(exit.bounds, x, y)) ?? null;
}

export function isRouteScenePositionBlocked(pack: RouteScenePack, feetX: number, feetY: number): boolean {
  const hitbox: RouteSceneRect = {
    x: feetX + pack.playerFeetHitbox.offsetX,
    y: feetY + pack.playerFeetHitbox.offsetY,
    width: pack.playerFeetHitbox.width,
    height: pack.playerFeetHitbox.height,
  };
  const minX = pack.boundaryInset;
  const minY = pack.boundaryInset;
  const maxX = pack.world.width - pack.boundaryInset;
  const maxY = pack.world.height - pack.boundaryInset;
  if (hitbox.x < minX || hitbox.y < minY || hitbox.x + hitbox.width > maxX || hitbox.y + hitbox.height > maxY) return true;
  return pack.collision.colliders.some((solid) => overlaps(hitbox, solid.bounds));
}

export function routeSceneCameraLimits(
  pack: RouteScenePack,
  viewportWidth: number,
  viewportHeight: number,
): RouteSceneRect {
  return {
    x: pack.cameraBounds.x,
    y: pack.cameraBounds.y,
    width: Math.max(0, pack.cameraBounds.width - viewportWidth),
    height: Math.max(0, pack.cameraBounds.height - viewportHeight),
  };
}
