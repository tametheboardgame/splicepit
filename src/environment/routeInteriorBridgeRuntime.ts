import {
  MASTER_LAB_EXTERIOR_ENTRY_ZONE,
  type MasterLabRect,
} from '../world/masterLab.js';
import {
  LOCAL_PIT_YARD_ENTRY_ZONE,
  type LocalPitRect,
} from '../world/localPit.js';
import { RSP6_ROUTE_SCENE_PACK } from '../world/routeDepthGrounding.js';
import { dispatchRouteInteriorReturn } from '../world/routeRuntimeBridge.js';
import {
  routeStoryInteractionForTarget,
  type RouteInteractionTarget,
} from '../world/routeStoryIntegration.js';

export type RouteInteriorBridgeTarget = Extract<RouteInteractionTarget, 'master-lab' | 'local-pit'>;

export const RSP7_ROUTE_INTERIOR_BRIDGE_CONTRACT = {
  id: 'route-interior-semantic-bridge-rsp7-v1',
  targets: ['master-lab', 'local-pit'],
  entrySource: 'authored-route-exit',
  returnTransport: 'splicepit:route-interior-return',
  legacyFallbackPreserved: true,
} as const;

type Rect = { x: number; y: number; width: number; height: number };

type YardDebug = {
  routeRenderer?: 'legacy' | 'scene-image';
  sceneMode?: string;
};

type InteriorDebug = {
  active?: boolean;
};

type BridgeGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: YardDebug;
  __SPLICEPIT_MASTER_LAB__?: InteriorDebug;
  __SPLICEPIT_LOCAL_PIT__?: InteriorDebug;
};

const LEGACY_MASTER_LAB_ENTRY: MasterLabRect = { ...MASTER_LAB_EXTERIOR_ENTRY_ZONE };
const LEGACY_LOCAL_PIT_ENTRY: LocalPitRect = { ...LOCAL_PIT_YARD_ENTRY_ZONE };
let installed = false;
let lastMasterLabActive = false;
let lastLocalPitActive = false;
let authoredEntryMode = false;

function copyRect(target: Rect, source: Rect): void {
  target.x = source.x;
  target.y = source.y;
  target.width = source.width;
  target.height = source.height;
}

export function routeInteriorAuthoredEntryBounds(target: RouteInteriorBridgeTarget): Rect {
  const interaction = routeStoryInteractionForTarget(target);
  const exit = RSP6_ROUTE_SCENE_PACK.exits.find((candidate) => candidate.id === interaction.id);
  if (!exit) throw new Error(`RSP-7 semantic interior '${target}' has no authored Route exit.`);
  return { ...exit.bounds };
}

/**
 * Existing interior overlays still read their historic mutable entry-zone
 * objects. RSP-7 keeps those consumers stable but rebinds the objects to the
 * authored semantic Route exits while scene-image Route production is active.
 */
export function setRouteInteriorAuthoredEntryMode(active: boolean): void {
  if (authoredEntryMode === active) return;
  authoredEntryMode = active;
  if (active) {
    copyRect(MASTER_LAB_EXTERIOR_ENTRY_ZONE, routeInteriorAuthoredEntryBounds('master-lab'));
    copyRect(LOCAL_PIT_YARD_ENTRY_ZONE, routeInteriorAuthoredEntryBounds('local-pit'));
    return;
  }
  copyRect(MASTER_LAB_EXTERIOR_ENTRY_ZONE, LEGACY_MASTER_LAB_ENTRY);
  copyRect(LOCAL_PIT_YARD_ENTRY_ZONE, LEGACY_LOCAL_PIT_ENTRY);
}

export function routeInteriorBridgeInstalled(): boolean {
  return installed;
}

function tick(): void {
  const global = globalThis as BridgeGlobal;
  const yard = global.__SPLICEPIT_VISUAL_RESET__;
  const authoredRouteActive = yard?.routeRenderer === 'scene-image' && yard.sceneMode === 'master-lab-route';
  setRouteInteriorAuthoredEntryMode(authoredRouteActive);

  const masterLabActive = Boolean(global.__SPLICEPIT_MASTER_LAB__?.active);
  const localPitActive = Boolean(global.__SPLICEPIT_LOCAL_PIT__?.active);

  if (authoredRouteActive && lastMasterLabActive && !masterLabActive) {
    dispatchRouteInteriorReturn('master-lab');
  }
  if (authoredRouteActive && lastLocalPitActive && !localPitActive) {
    dispatchRouteInteriorReturn('local-pit');
  }

  lastMasterLabActive = masterLabActive;
  lastLocalPitActive = localPitActive;
  window.requestAnimationFrame(tick);
}

export function installRouteInteriorBridgeRuntime(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.requestAnimationFrame(tick);
}
