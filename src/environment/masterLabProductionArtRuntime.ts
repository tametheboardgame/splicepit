import type { EnvironmentVisualSample } from './environmentVisualContract.js';
import { MASTER_LAB_PRODUCTION_ART_CONTRACT } from '../world/masterLabProductionArt.js';

type MasterLabArtDebug = {
  ready: true;
  active: boolean;
  renderIntegration: 'master-lab-render-loop';
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

type MasterLabArtGlobal = typeof globalThis & {
  __SPLICEPIT_MASTER_LAB_ART__?: MasterLabArtDebug;
};

const debug: MasterLabArtDebug = {
  ready: true,
  active: false,
  renderIntegration: 'master-lab-render-loop',
  depthModel: 'base-before-player-foreground-after-player',
  renderCount: 0,
  brightRendered: false,
  darkRendered: false,
  darkMix: 0,
  visualState: 'bright',
  geometryId: MASTER_LAB_PRODUCTION_ART_CONTRACT.geometryId,
  collisionTopology: MASTER_LAB_PRODUCTION_ART_CONTRACT.collisionTopology,
  brightDetailGroups: MASTER_LAB_PRODUCTION_ART_CONTRACT.brightDetailGroups,
  darkStoryGroups: MASTER_LAB_PRODUCTION_ART_CONTRACT.darkStoryGroups,
};

(globalThis as MasterLabArtGlobal).__SPLICEPIT_MASTER_LAB_ART__ = debug;

export function syncMasterLabProductionArtDebug(sample: EnvironmentVisualSample, active: boolean): void {
  debug.active = active;
  debug.darkMix = active ? Math.round(sample.darkMix * 1000) / 1000 : 0;
  debug.visualState = active ? sample.visualState : 'bright';
  if (!active) return;

  debug.renderCount += 1;
  debug.brightRendered = true;
  debug.darkRendered = debug.darkRendered || sample.darkMix > 0;
}
