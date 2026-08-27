import type { EnvironmentVisualSample } from './environmentVisualContract.js';
import { YARD_PRODUCTION_ART_CONTRACT } from '../world/yardProductionArt.js';

type YardArtDebug = {
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

type YardArtGlobal = typeof globalThis & {
  __SPLICEPIT_YARD_ART__?: YardArtDebug;
};

const debug: YardArtDebug = {
  ready: true,
  active: false,
  renderIntegration: 'opening-world-render-loop',
  depthModel: 'base-before-player-foreground-after-player',
  renderCount: 0,
  brightRendered: false,
  darkRendered: false,
  darkMix: 0,
  visualState: 'bright',
  geometryId: YARD_PRODUCTION_ART_CONTRACT.geometryId,
  collisionTopology: YARD_PRODUCTION_ART_CONTRACT.collisionTopology,
  brightDetailGroups: YARD_PRODUCTION_ART_CONTRACT.brightDetailGroups,
  darkStoryGroups: YARD_PRODUCTION_ART_CONTRACT.darkStoryGroups,
};

(globalThis as YardArtGlobal).__SPLICEPIT_YARD_ART__ = debug;

export function syncYardProductionArtDebug(sample: EnvironmentVisualSample, active: boolean): void {
  debug.active = active;
  debug.darkMix = active ? Math.round(sample.darkMix * 1000) / 1000 : 0;
  debug.visualState = active ? sample.visualState : 'bright';
  if (!active) return;

  debug.renderCount += 1;
  debug.brightRendered = true;
  debug.darkRendered = debug.darkRendered || sample.darkMix > 0;
}
