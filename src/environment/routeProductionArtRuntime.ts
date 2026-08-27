import type { EnvironmentVisualSample } from './environmentVisualContract.js';
import { ROUTE_PRODUCTION_ART_CONTRACT } from '../world/routeProductionArt.js';

type RouteArtDebug = {
  ready: true;
  active: boolean;
  renderIntegration: 'opening-world-render-loop';
  depthModel: 'base-before-player-foreground-after-player';
  renderCount: number;
  brightRendered: boolean;
  darkRendered: boolean;
  darkMix: number;
  visualState: 'bright' | 'dark';
  geometryId: string;
  collisionTopology: 'unchanged';
  brightDetailGroups: readonly string[];
  darkStoryGroups: readonly string[];
};

type RouteArtGlobal = typeof globalThis & {
  __SPLICEPIT_ROUTE_ART__?: RouteArtDebug;
};

const debug: RouteArtDebug = {
  ready: true,
  active: false,
  renderIntegration: 'opening-world-render-loop',
  depthModel: 'base-before-player-foreground-after-player',
  renderCount: 0,
  brightRendered: false,
  darkRendered: false,
  darkMix: 0,
  visualState: 'bright',
  geometryId: ROUTE_PRODUCTION_ART_CONTRACT.geometryId,
  collisionTopology: ROUTE_PRODUCTION_ART_CONTRACT.collisionTopology,
  brightDetailGroups: ROUTE_PRODUCTION_ART_CONTRACT.brightDetailGroups,
  darkStoryGroups: ROUTE_PRODUCTION_ART_CONTRACT.darkStoryGroups,
};

(globalThis as RouteArtGlobal).__SPLICEPIT_ROUTE_ART__ = debug;

export function syncRouteProductionArtDebug(sample: EnvironmentVisualSample, active: boolean): void {
  debug.active = active;
  debug.darkMix = active ? Math.round(sample.darkMix * 1000) / 1000 : 0;
  debug.visualState = active ? sample.visualState : 'bright';
  if (!active) return;

  debug.renderCount += 1;
  debug.brightRendered = true;
  debug.darkRendered = debug.darkRendered || sample.darkMix > 0;
}
