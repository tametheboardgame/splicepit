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
  readonly targetEntry?: YardScenePoint;
}

export interface YardSceneCollider {
  readonly id: string;
  readonly bounds: YardSceneRect;
}

export interface YardSceneForegroundOccluder {
  readonly id: string;
  readonly bounds: YardSceneRect;
  readonly sortY: number;
}

export interface YardSceneGroundingShadow {
  readonly offsetY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly alpha: number;
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
  readonly foreground?: {
    readonly mode: 'exact-base-pixel-regions';
    readonly occluders: readonly YardSceneForegroundOccluder[];
  };
  readonly grounding?: {
    readonly shadow: YardSceneGroundingShadow;
  };
}

/**
 * YSP-4 collision authored from the recovered 1280 × 720 Bright Yard raster.
 */
export const YSP4_YARD_SCENE_PACK = {
  id: 'yard-bright-scene-ysp4-v1',
  renderer: 'scene-image',
  source: { width: 1280, height: 720, scale: 1 },
  world: { width: 1280, height: 720 },
  cameraBounds: { x: 0, y: 0, width: 1280, height: 720 },
  playerFeetHitbox: { offsetX: -11, offsetY: -13, width: 22, height: 15 },
  boundaryInset: 12,
  spawn: { x: 575, y: 660 },
  collision: {
    mode: 'blocked-rectangles',
    colliders: [
      { id: 'geneco-workshop', bounds: { x: 0, y: 0, width: 465, height: 315 } },
      { id: 'workshop-service-stack', bounds: { x: 420, y: 78, width: 118, height: 188 } },
      { id: 'north-wall-west', bounds: { x: 465, y: 0, width: 92, height: 118 } },
      { id: 'the-hut', bounds: { x: 552, y: 28, width: 282, height: 222 } },
      { id: 'north-wall-services', bounds: { x: 834, y: 0, width: 226, height: 150 } },
      { id: 'north-vats', bounds: { x: 1050, y: 0, width: 230, height: 252 } },
      { id: 'west-storage', bounds: { x: 0, y: 250, width: 178, height: 162 } },
      { id: 'lower-left-containment', bounds: { x: 0, y: 414, width: 338, height: 306 } },
      { id: 'containment-fence-return', bounds: { x: 185, y: 390, width: 148, height: 70 } },
      { id: 'pit-west-machinery', bounds: { x: 690, y: 318, width: 72, height: 112 } },
      { id: 'pit-retaining-wall-west', bounds: { x: 812, y: 172, width: 198, height: 194 } },
      { id: 'pit-retaining-wall-north', bounds: { x: 1008, y: 172, width: 272, height: 134 } },
      { id: 'pit-retaining-wall-east', bounds: { x: 1162, y: 300, width: 118, height: 130 } },
      { id: 'splice-pit', bounds: { x: 730, y: 408, width: 302, height: 142 } },
      { id: 'cryo-container-stack', bounds: { x: 962, y: 486, width: 318, height: 234 } },
      { id: 'lower-right-container-base', bounds: { x: 900, y: 602, width: 380, height: 118 } },
      { id: 'service-ring', bounds: { x: 754, y: 603, width: 70, height: 69 } },
    ],
  },
  anchors: [],
  exits: [
    {
      id: 'master-lab-tunnel',
      bounds: { x: 1072, y: 318, width: 88, height: 82 },
      target: 'master-lab-route',
    },
  ],
} as const satisfies YardScenePack;

/** YSP-5 semantic gameplay locations on the YSP-4 geometry. */
export const YSP5_YARD_SCENE_PACK = {
  ...YSP4_YARD_SCENE_PACK,
  id: 'yard-bright-scene-ysp5-v1',
  anchors: [
    { id: 'geneco-workshop-door', kind: 'door', position: { x: 336, y: 342 }, radius: 76 },
    { id: 'containment-inspection-point', kind: 'interaction', position: { x: 365, y: 540 }, radius: 78 },
    { id: 'service-ring-inspection', kind: 'interaction', position: { x: 731, y: 642 }, radius: 78 },
    { id: 'master-lab-tunnel', kind: 'story', position: { x: 1110, y: 382 }, radius: 88 },
  ],
  exits: [
    {
      id: 'master-lab-tunnel',
      bounds: { x: 1072, y: 318, width: 88, height: 82 },
      target: 'master-lab-route',
      targetEntry: { x: 1760, y: 655 },
    },
  ],
} as const satisfies YardScenePack;

/** YSP-6 exact-pixel foreground depth and contact grounding. */
const YSP6_YARD_SCENE_PACK_BASE = {
  ...YSP5_YARD_SCENE_PACK,
  id: 'yard-bright-scene-ysp6-v1',
  foreground: {
    mode: 'exact-base-pixel-regions',
    occluders: [
      { id: 'service-ring-front-rim', bounds: { x: 746, y: 632, width: 88, height: 44 }, sortY: 655 },
      { id: 'pit-front-rail-west', bounds: { x: 724, y: 486, width: 166, height: 48 }, sortY: 558 },
      { id: 'pit-front-rail-east', bounds: { x: 874, y: 488, width: 174, height: 50 }, sortY: 558 },
      { id: 'lab-tunnel-rail-and-threshold', bounds: { x: 1032, y: 314, width: 142, height: 94 }, sortY: 402 },
    ],
  },
  grounding: {
    shadow: {
      offsetY: -4,
      radiusX: 20,
      radiusY: 6,
      alpha: 0.24,
    },
  },
} as const satisfies YardScenePack;

/**
 * YSP-10 human-gate revision.
 *
 * On-device review approved the authored-scene direction but exposed four
 * gameplay-layer defects: the lower spawn sat underneath tutorial cards; the
 * narrow pit/wall seam allowed an impossible descent; the visible Lab tunnel
 * was covered by wall collision while its transition trigger sat below the
 * doorway; and the foreground cryo/container stack behaved as one huge solid
 * rectangle instead of an object the player could pass behind.
 */
export const YSP10_YARD_SCENE_PACK = {
  ...YSP6_YARD_SCENE_PACK_BASE,
  id: 'yard-bright-scene-ysp10-r1',
  spawn: { x: 575, y: 430 },
  collision: {
    mode: 'blocked-rectangles',
    colliders: [
      { id: 'geneco-workshop', bounds: { x: 0, y: 0, width: 465, height: 315 } },
      { id: 'workshop-service-stack', bounds: { x: 420, y: 78, width: 118, height: 188 } },
      { id: 'north-wall-west', bounds: { x: 465, y: 0, width: 92, height: 118 } },
      { id: 'the-hut', bounds: { x: 552, y: 28, width: 282, height: 222 } },
      { id: 'north-wall-services', bounds: { x: 834, y: 0, width: 226, height: 150 } },
      { id: 'north-vats', bounds: { x: 1050, y: 0, width: 230, height: 252 } },
      { id: 'west-storage', bounds: { x: 0, y: 250, width: 178, height: 162 } },
      { id: 'lower-left-containment', bounds: { x: 0, y: 414, width: 338, height: 306 } },
      { id: 'containment-fence-return', bounds: { x: 185, y: 390, width: 148, height: 70 } },
      { id: 'pit-west-machinery', bounds: { x: 690, y: 318, width: 72, height: 112 } },
      { id: 'pit-gap-upper-guard', bounds: { x: 758, y: 286, width: 56, height: 80 } },
      { id: 'pit-retaining-wall-west', bounds: { x: 812, y: 172, width: 198, height: 194 } },
      { id: 'pit-retaining-wall-north-west', bounds: { x: 1008, y: 172, width: 96, height: 134 } },
      { id: 'pit-retaining-wall-north-east', bounds: { x: 1188, y: 172, width: 92, height: 134 } },
      { id: 'pit-retaining-wall-east', bounds: { x: 1188, y: 300, width: 92, height: 130 } },
      { id: 'splice-pit', bounds: { x: 730, y: 408, width: 302, height: 142 } },
      { id: 'lower-right-container-base', bounds: { x: 900, y: 602, width: 380, height: 118 } },
      { id: 'service-ring', bounds: { x: 754, y: 603, width: 70, height: 69 } },
    ],
  },
  anchors: [
    { id: 'geneco-workshop-door', kind: 'door', position: { x: 336, y: 342 }, radius: 76 },
    { id: 'containment-inspection-point', kind: 'interaction', position: { x: 365, y: 540 }, radius: 78 },
    { id: 'service-ring-inspection', kind: 'interaction', position: { x: 731, y: 642 }, radius: 78 },
    { id: 'master-lab-tunnel', kind: 'story', position: { x: 1147, y: 340 }, radius: 92 },
  ],
  exits: [
    {
      id: 'master-lab-tunnel',
      bounds: { x: 1104, y: 248, width: 84, height: 148 },
      target: 'master-lab-route',
      targetEntry: { x: 1760, y: 655 },
    },
  ],
  foreground: {
    mode: 'exact-base-pixel-regions',
    occluders: [
      { id: 'service-ring-front-rim', bounds: { x: 746, y: 632, width: 88, height: 44 }, sortY: 655 },
      { id: 'pit-front-rail-west', bounds: { x: 724, y: 486, width: 166, height: 48 }, sortY: 558 },
      { id: 'pit-front-rail-east', bounds: { x: 874, y: 488, width: 174, height: 50 }, sortY: 558 },
      { id: 'lab-tunnel-rail-and-threshold', bounds: { x: 1032, y: 300, width: 164, height: 108 }, sortY: 402 },
      { id: 'cryo-container-upper-stack', bounds: { x: 950, y: 468, width: 330, height: 252 }, sortY: 620 },
    ],
  },
} as const satisfies YardScenePack;

/**
 * Compatibility export: existing production callers named this contract YSP-6.
 * Route them through the human-reviewed YSP-10 revision without forcing a wide
 * mechanical rename across the opening runtime.
 */
export const YSP6_YARD_SCENE_PACK: YardScenePack = YSP10_YARD_SCENE_PACK;
export const YSP0_YARD_SCENE_PACK: YardScenePack = YSP10_YARD_SCENE_PACK;

function overlaps(a: YardSceneRect, b: YardSceneRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function containsPoint(bounds: YardSceneRect, x: number, y: number): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
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

export function yardSceneExitAt(pack: YardScenePack, feetX: number, feetY: number): YardSceneExit | null {
  return pack.exits.find((exit) => containsPoint(exit.bounds, feetX, feetY)) ?? null;
}

export function yardSceneExitForTarget(pack: YardScenePack, target: string): YardSceneExit | null {
  return pack.exits.find((exit) => exit.target === target) ?? null;
}

export function yardSceneForegroundOccluders(pack: YardScenePack, playerFeetY: number): readonly YardSceneForegroundOccluder[] {
  const foreground = pack.foreground;
  if (!foreground) return [];
  return foreground.occluders.filter((occluder) => playerFeetY < occluder.sortY);
}
