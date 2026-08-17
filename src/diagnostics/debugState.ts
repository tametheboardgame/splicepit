import type Phaser from 'phaser';
import { BASE_ANIMALS } from '../data/animals.js';
import { GENES } from '../data/genes.js';
import type { GameDomainState } from '../domain/model.js';
import { readSave } from '../persistence/storage.js';
import { SeededRandom, type RandomSnapshot } from '../random/RandomSource.js';
import { runtimeRandom, setRuntimeSeed } from '../runtime/runtimeRandom.js';
import { domainState } from '../state/DomainState.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import type { CreatureRecord, GameStateSnapshot } from '../types.js';

export interface DebugSceneState {
  active: string[];
  registered: string[];
}

export interface DebugStateV1 {
  version: 1;
  exportedAt: string;
  gameplay: GameStateSnapshot;
  domain: GameDomainState;
  rng: RandomSnapshot;
  scene: DebugSceneState;
}

export interface DeveloperDiagnostics {
  ids: {
    baseAnimals: string[];
    genes: string[];
    currentCreature: string | null;
    domainCreatures: string[];
  };
  rng: RandomSnapshot;
  scene: DebugSceneState;
  gameplay: GameStateSnapshot;
  domain: GameDomainState;
  creatureBiology: CreatureRecord | null;
  persistedSave: {
    source: 'primary' | 'backup';
    envelope: ReturnType<typeof readSave> extends infer T ? T extends { envelope: infer E } ? E : never : never;
  } | null;
}

export interface DebugImportOptions {
  persist?: boolean;
  restartScene?: boolean;
}

export interface SplicePitDebugApi {
  diagnostics(): DeveloperDiagnostics;
  exportState(): string;
  importState(serialised: string, options?: DebugImportOptions): DeveloperDiagnostics;
  setSeed(seed: string | number): RandomSnapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function captureSceneState(game: Phaser.Game): DebugSceneState {
  return {
    active: game.scene.getScenes(true).map((scene) => scene.scene.key),
    registered: game.scene.getScenes(false).map((scene) => scene.scene.key),
  };
}

function validateSceneState(value: unknown): DebugSceneState {
  if (!isRecord(value) || !Array.isArray(value.active) || !Array.isArray(value.registered)) {
    throw new Error('Debug state scene payload is invalid.');
  }
  if (![...value.active, ...value.registered].every((entry) => typeof entry === 'string')) {
    throw new Error('Debug state scene keys must be strings.');
  }
  return { active: [...value.active] as string[], registered: [...value.registered] as string[] };
}

function validateRandomSnapshot(value: unknown): RandomSnapshot {
  if (!isRecord(value)) throw new Error('Debug state RNG payload is invalid.');
  const candidate = value as unknown as RandomSnapshot;
  return SeededRandom.fromSnapshot(candidate).snapshot();
}

export function decodeDebugState(serialised: string): DebugStateV1 {
  const parsed = JSON.parse(serialised) as unknown;
  if (!isRecord(parsed) || parsed.version !== 1) throw new Error('Unsupported or invalid debug state.');
  if (typeof parsed.exportedAt !== 'string' || !isRecord(parsed.gameplay) || !isRecord(parsed.domain)) {
    throw new Error('Debug state payload is incomplete.');
  }
  return {
    version: 1,
    exportedAt: parsed.exportedAt,
    gameplay: structuredClone(parsed.gameplay) as unknown as GameStateSnapshot,
    domain: structuredClone(parsed.domain) as unknown as GameDomainState,
    rng: validateRandomSnapshot(parsed.rng),
    scene: validateSceneState(parsed.scene),
  };
}

export function encodeDebugState(state: DebugStateV1): string {
  return JSON.stringify(state, null, 2);
}

export function captureDeveloperDiagnostics(game: Phaser.Game): DeveloperDiagnostics {
  const gameplay = gameState.snapshot();
  const domain = domainState.snapshot();
  let persistedSave: DeveloperDiagnostics['persistedSave'] = null;
  if (typeof globalThis.localStorage !== 'undefined') {
    const loaded = readSave(globalThis.localStorage);
    if (loaded) persistedSave = { source: loaded.source, envelope: structuredClone(loaded.envelope) };
  }

  return {
    ids: {
      baseAnimals: Object.keys(BASE_ANIMALS).sort(),
      genes: Object.keys(GENES).sort(),
      currentCreature: gameplay.currentCreature?.id ?? null,
      domainCreatures: domain.creatures.map((creature) => creature.id).sort(),
    },
    rng: runtimeRandom.snapshot(),
    scene: captureSceneState(game),
    gameplay,
    domain,
    creatureBiology: gameplay.currentCreature ? structuredClone(gameplay.currentCreature) : null,
    persistedSave,
  };
}

export function exportDebugState(game: Phaser.Game): string {
  const diagnostics = captureDeveloperDiagnostics(game);
  return encodeDebugState({
    version: 1,
    exportedAt: new Date().toISOString(),
    gameplay: diagnostics.gameplay,
    domain: diagnostics.domain,
    rng: diagnostics.rng,
    scene: diagnostics.scene,
  });
}

export function importDebugState(game: Phaser.Game, serialised: string, options: DebugImportOptions = {}): DeveloperDiagnostics {
  const imported = decodeDebugState(serialised);
  gameState.hydrate(imported.gameplay);
  domainState.hydrate(imported.domain);
  runtimeRandom.restore(imported.rng);

  if (options.persist !== false) saveGame();
  if (options.restartScene !== false) {
    const target = imported.scene.active[0];
    const available = new Set(game.scene.getScenes(false).map((scene) => scene.scene.key));
    if (target && available.has(target)) game.scene.start(target);
  }
  return captureDeveloperDiagnostics(game);
}

function diagnosticsEnabled(): boolean {
  if (typeof globalThis.location === 'undefined') return false;
  const host = globalThis.location.hostname;
  const query = new URLSearchParams(globalThis.location.search);
  return host === 'localhost' || host === '127.0.0.1' || query.get('debug') === '1';
}

export function installDeveloperDiagnostics(game: Phaser.Game): boolean {
  if (!diagnosticsEnabled()) return false;
  globalThis.__SPLICEPIT_DEBUG__ = {
    diagnostics: () => captureDeveloperDiagnostics(game),
    exportState: () => exportDebugState(game),
    importState: (serialised, options) => importDebugState(game, serialised, options),
    setSeed: (seed) => setRuntimeSeed(seed),
  };
  console.info(`[SplicePit debug] deterministic RNG seed: ${runtimeRandom.seed}`);
  return true;
}
