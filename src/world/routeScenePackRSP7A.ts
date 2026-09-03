import type {
  RouteSceneAnchorId,
  RouteScenePack,
  RouteScenePoint,
  RouteSceneRect,
} from './routeScenePack.js';

const SCALE = 3;

function point(x: number, y: number): RouteScenePoint {
  return { x: x * SCALE, y: y * SCALE };
}

function rect(x: number, y: number, width: number, height: number): RouteSceneRect {
  return { x: x * SCALE, y: y * SCALE, width: width * SCALE, height: height * SCALE };
}

function collider(id: string, x: number, y: number, width: number, height: number) {
  return { id, bounds: rect(x, y, width, height) };
}

/**
 * RSP-7A production geometry re-authored against the user-approved Bright
 * Opening Route master accepted on 3 September 2026.
 *
 * The approved Bright and Dark source masters have different source canvases,
 * so the production asset package normalises both to an identical 1024 × 683
 * render surface before gameplay. These coordinates are authored against that
 * shared production surface. Bright/Dark state changes therefore never alter
 * collision, semantic anchors or camera geometry.
 */
export const RSP7A_ROUTE_SCENE_PACK = {
  id: 'opening-route-approved-masters-rsp7a-v1',
  renderer: 'scene-image',
  source: {
    width: 1024,
    height: 683,
    scale: SCALE,
    assetPath: '/generated/rsp7a/route-bright-base.webp',
  },
  world: { width: 3072, height: 2049 },
  cameraBounds: { x: 0, y: 0, width: 3072, height: 2049 },
  playerFeetHitbox: { offsetX: -11, offsetY: -13, width: 22, height: 15 },
  boundaryInset: 24,

  // Lower-left gate: the only authored player-facing arrival into this scene.
  spawn: point(123, 554),

  collision: {
    mode: 'blocked-rectangles',
    colliders: [
      // Upper-left rural containment operation. The service lane remains open to the east.
      collider('upper-west-forest', 0, 0, 213, 167),
      collider('upper-greenhouse-compound', 213, 17, 190, 137),

      // Restricted private service spur above the Lab route. It is scenery, not a scene entrance.
      collider('private-service-gate', 407, 123, 60, 17),
      collider('upper-lab-utilities', 467, 0, 127, 173),

      // Viktor's Lab mass. The visible south-west entrance/forecourt remains open.
      collider('lab-main-upper', 600, 0, 333, 190),
      collider('lab-west-wing', 567, 160, 77, 90),
      collider('lab-east-wing', 697, 163, 243, 103),

      // The right cliff is a hard world edge throughout the Lab/Pit side.
      collider('east-cliff-upper', 933, 80, 91, 394),
      collider('east-cliff-middle', 893, 267, 131, 416),

      // Mutant livestock pens remain physical fenced compounds, not walkable prop islands.
      collider('west-greenhouse-bank', 0, 167, 140, 157),
      collider('animal-pen-upper', 133, 173, 217, 110),
      collider('animal-pen-lower', 120, 280, 200, 73),
      collider('west-mutant-growth', 0, 347, 160, 150),

      // Central experimental growth and tanks. The broad hooked road around them stays open.
      collider('central-mutant-plot', 347, 417, 187, 107),
      collider('central-specimen-tank', 460, 303, 63, 80),

      // Weighbridge deck is the debt staging surface and remains traversable.
      collider('weighbridge-booth', 530, 273, 61, 63),
      collider('weighbridge-east-utility', 673, 287, 63, 80),

      // Lower fenced biotech plots and utility tank frame the onward Pit road.
      collider('south-central-tank-complex', 460, 494, 117, 100),
      collider('lower-left-growth-bank', 227, 557, 230, 126),
      collider('lower-centre-growth', 460, 600, 200, 83),

      // Visible Local Pit ring/edge is scenery here; the interaction handoff occurs at its gate.
      collider('pit-ring', 773, 504, 187, 150),
    ],
  },

  anchors: [
    { id: 'yard-arrival', role: 'arrival', position: point(123, 554), radius: 141 },
    { id: 'master-lab-entrance', role: 'door', position: point(668, 248), radius: 135 },
    { id: 'master-lab-return', role: 'return', position: point(610, 273), radius: 123 },
    { id: 'debt-encounter', role: 'story', position: point(620, 374), radius: 177 },
    { id: 'local-pit-entrance', role: 'door', position: point(707, 557), radius: 144 },
    { id: 'local-pit-return', role: 'return', position: point(693, 500), radius: 135 },
  ],

  exits: [
    {
      id: 'yard-return',
      bounds: rect(50, 517, 67, 77),
      target: 'apprentice-yard',
      activation: 'interact',
      safeReturnAnchor: 'yard-arrival',
    },
    {
      id: 'master-lab-entrance',
      bounds: rect(640, 213, 63, 53),
      target: 'master-lab',
      activation: 'interact',
      safeReturnAnchor: 'master-lab-return',
    },
    {
      id: 'local-pit-entrance',
      bounds: rect(680, 527, 67, 67),
      target: 'local-pit',
      activation: 'interact',
      safeReturnAnchor: 'local-pit-return',
    },
  ],
} as const satisfies RouteScenePack;

export const RSP7A_ROUTE_SEMANTIC_ANCHORS = [
  'yard-arrival',
  'master-lab-entrance',
  'master-lab-return',
  'debt-encounter',
  'local-pit-entrance',
  'local-pit-return',
] as const satisfies readonly RouteSceneAnchorId[];
