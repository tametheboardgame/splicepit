import type { EnvironmentVisualSample } from './environmentVisualContract.js';
import { LOCAL_PIT_PRODUCTION_ART_CONTRACT } from '../world/localPitProductionArt.js';

type LocalPitArtDebug = {
  ready: true;
  active: boolean;
  renderIntegration: 'local-pit-render-loop';
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

type LocalPitArtGlobal = typeof globalThis & {
  __SPLICEPIT_LOCAL_PIT_ART__?: LocalPitArtDebug;
};

const debug: LocalPitArtDebug = {
  ready: true,
  active: false,
  renderIntegration: 'local-pit-render-loop',
  depthModel: 'base-before-player-foreground-after-player',
  renderCount: 0,
  brightRendered: false,
  darkRendered: false,
  darkMix: 0,
  visualState: 'bright',
  geometryId: LOCAL_PIT_PRODUCTION_ART_CONTRACT.geometryId,
  collisionTopology: LOCAL_PIT_PRODUCTION_ART_CONTRACT.collisionTopology,
  brightDetailGroups: LOCAL_PIT_PRODUCTION_ART_CONTRACT.brightDetailGroups,
  darkStoryGroups: LOCAL_PIT_PRODUCTION_ART_CONTRACT.darkStoryGroups,
};

(globalThis as LocalPitArtGlobal).__SPLICEPIT_LOCAL_PIT_ART__ = debug;

export function syncLocalPitProductionArtDebug(sample: EnvironmentVisualSample, active: boolean): void {
  debug.active = active;
  debug.darkMix = active ? Math.round(sample.darkMix * 1000) / 1000 : 0;
  debug.visualState = active ? sample.visualState : 'bright';
  if (!active) return;

  debug.renderCount += 1;
  debug.brightRendered = true;
  debug.darkRendered = debug.darkRendered || sample.darkMix > 0;
}
