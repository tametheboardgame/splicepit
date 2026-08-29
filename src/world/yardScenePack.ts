export type YardScenePoint = { readonly x: number; readonly y: number };
export type YardSceneRect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

export interface YardSceneInteractionAnchor {
  readonly id: string;
  readonly kind: 'interaction' | 'story' | 'door';
  readonly position: YardScenePoint;
  readonly radius: number;
}

export interface YardSceneExit {
  readonly id: string;
  readonly bounds: YardSceneRect;
  readonly target: string;
}

export interface YardSceneCollider {
  readonly id: string;
  readonly bounds: YardSceneRect;
}

export interface YardScenePack {
  readonly id: string;
  readonly renderer: 'scene-image';
  readonly source: {
    readonly width: number;
    readonly height: number;
    readonly scale: number;
  };
  readonly world: {
    readonly width: number;
    readonly height: number;
  };
  readonly cameraBounds: YardSceneRect;
  readonly playerFeetHitbox: {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly width: number;
    readonly height: number;
  };
  readonly boundaryInset: number;
  readonly spawn: YardScenePoint;
  readonly collision: {
    readonly mode: 'blocked-rectangles';
    readonly colliders: readonly YardSceneCollider[];
  };
  readonly anchors: readonly YardSceneInteractionAnchor[];
  readonly exits: readonly YardSceneExit[];
}

export const YSP0_YARD_SCENE_PACK = {
  id: 'yard-scene-spike-v1',
  renderer: 'scene-image',
  source: { width: 730, height: 400, scale: 4 },
  world: { width: 2920, height: 1600 },
  cameraBounds: { x: 0, y: 0, width: 2920, height: 1600 },
  playerFeetHitbox: { offsetX: -11, offsetY: -13, width: 22, height: 15 },
  boundaryInset: 12,
  spawn: { x: 900, y: 562 },
  collision: {
    mode: 'blocked-rectangles',
    colliders: [
      { id: 'workshop', bounds: { x: 288, y: 192, width: 592, height: 280 } },
      { id: 'west-animal-pen', bounds: { x: 180, y: 760, width: 420, height: 340 } },
      { id: 'north-pen-a', bounds: { x: 1328, y: 200, width: 260, height: 232 } },
      { id: 'north-pen-b', bounds: { x: 1680, y: 200, width: 260, height: 232 } },
      { id: 'science-bench', bounds: { x: 1320, y: 968, width: 540, height: 200 } },
      { id: 'east-tank-a', bounds: { x: 2440, y: 216, width: 100, height: 204 } },
      { id: 'east-tank-b', bounds: { x: 2600, y: 216, width: 100, height: 204 } },
      { id: 'master-lab', bounds: { x: 2420, y: 980, width: 460, height: 468 } },
      { id: 'service-pipe', bounds: { x: 288, y: 1256, width: 1392, height: 112 } },
    ],
  },
  anchors: [
    { id: 'workshop-door', kind: 'door', position: { x: 588, y: 500 }, radius: 72 },
    { id: 'science-bench', kind: 'interaction', position: { x: 1580, y: 1200 }, radius: 96 },
    { id: 'master-lab-door', kind: 'story', position: { x: 2660, y: 1480 }, radius: 120 },
  ],
  exits: [
    {
      id: 'east-master-route',
      bounds: { x: 2860, y: 480, width: 60, height: 260 },
      target: 'master-lab-route',
    },
  ],
} as const satisfies YardScenePack;

function overlaps(a: YardSceneRect, b: YardSceneRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function isYardScenePositionBlocked(pack: YardScenePack, feetX: number, feetY: number): boolean {
  const hitbox: YardSceneRect = {
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
  return pack.collision.colliders.some((collider) => overlaps(hitbox, collider.bounds));
}

export function yardSceneCameraLimits(pack: YardScenePack, viewportWidth: number, viewportHeight: number): YardSceneRect {
  return {
    x: pack.cameraBounds.x,
    y: pack.cameraBounds.y,
    width: Math.max(0, pack.cameraBounds.width - viewportWidth),
    height: Math.max(0, pack.cameraBounds.height - viewportHeight),
  };
}

export function yardSceneAnchor(pack: YardScenePack, id: string): YardSceneInteractionAnchor | null {
  return pack.anchors.find((anchor) => anchor.id === id) ?? null;
}
