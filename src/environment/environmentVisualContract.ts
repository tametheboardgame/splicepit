export const ENVIRONMENT_LOCATION_IDS = ['yard', 'route', 'master-lab', 'local-pit'] as const;
export type EnvironmentLocationId = (typeof ENVIRONMENT_LOCATION_IDS)[number];

export type EnvironmentVisualState = 'bright' | 'dark';
export type EnvironmentTransitionPhase = 'steady' | 'rupture' | 'dark-glimpse' | 'recovery';
export type EnvironmentRenderSurfaceId = 'opening-world' | 'master-lab' | 'local-pit';
export type EnvironmentDarkArtStatus = 'pending' | 'authored';

export interface EnvironmentCapability {
  readonly id: EnvironmentLocationId;
  readonly label: string;
  readonly renderSurfaceId: EnvironmentRenderSurfaceId;
  readonly geometryId: string;
  readonly authoredStates: readonly ['bright', 'dark'];
  readonly darkArtStatus: EnvironmentDarkArtStatus;
}

export const ENVIRONMENT_CAPABILITIES: Readonly<Record<EnvironmentLocationId, EnvironmentCapability>> = {
  yard: {
    id: 'yard',
    label: 'Apprentice Splicer Yard',
    renderSurfaceId: 'opening-world',
    geometryId: 'opening-world-v1',
    authoredStates: ['bright', 'dark'],
    darkArtStatus: 'pending',
  },
  route: {
    id: 'route',
    label: 'Opening Route',
    renderSurfaceId: 'opening-world',
    geometryId: 'opening-world-v1',
    authoredStates: ['bright', 'dark'],
    darkArtStatus: 'pending',
  },
  'master-lab': {
    id: 'master-lab',
    label: 'Master Lab',
    renderSurfaceId: 'master-lab',
    geometryId: 'master-lab-v1',
    authoredStates: ['bright', 'dark'],
    darkArtStatus: 'pending',
  },
  'local-pit': {
    id: 'local-pit',
    label: 'Local Pit',
    renderSurfaceId: 'local-pit',
    geometryId: 'local-pit-v1',
    authoredStates: ['bright', 'dark'],
    darkArtStatus: 'pending',
  },
} as const;

export const DEFAULT_ENVIRONMENT_TRANSITION_MS = 760;
export const OPENING_ROUTE_ENVIRONMENT_X = 1720;

export interface EnvironmentVisualSample {
  readonly locationId: EnvironmentLocationId;
  readonly visualState: EnvironmentVisualState;
  readonly phase: EnvironmentTransitionPhase;
  readonly darkMix: number;
  readonly transitionProgress: number;
  readonly suppressed: boolean;
}

export interface EnvironmentVisualSnapshot extends EnvironmentVisualSample {
  readonly forcedState: EnvironmentVisualState | null;
  readonly suppressionReasons: readonly string[];
  readonly transitionLocation: EnvironmentLocationId | null;
  readonly transitionCount: number;
}

type ActiveTransition = {
  readonly locationId: EnvironmentLocationId;
  readonly startedAt: number;
  readonly durationMs: number;
};

function runtimeNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function openingWorldEnvironmentAt(feetX: number): 'yard' | 'route' {
  return feetX >= OPENING_ROUTE_ENVIRONMENT_X ? 'route' : 'yard';
}

export class EnvironmentVisualController {
  private activeLocation: EnvironmentLocationId = 'yard';
  private forcedState: EnvironmentVisualState | null = null;
  private transition: ActiveTransition | null = null;
  private readonly suppressions = new Set<string>();
  private transitionCount = 0;

  setActiveLocation(locationId: EnvironmentLocationId): void {
    this.activeLocation = locationId;
  }

  getActiveLocation(): EnvironmentLocationId {
    return this.activeLocation;
  }

  forceBright(): void {
    this.forcedState = 'bright';
  }

  forceDark(): void {
    this.forcedState = 'dark';
  }

  clearForcedState(): void {
    this.forcedState = null;
  }

  forceTransition(
    locationId: EnvironmentLocationId = this.activeLocation,
    now: number = runtimeNow(),
    durationMs: number = DEFAULT_ENVIRONMENT_TRANSITION_MS,
  ): void {
    const safeDuration = Number.isFinite(durationMs) ? Math.max(1, durationMs) : DEFAULT_ENVIRONMENT_TRANSITION_MS;
    this.transition = { locationId, startedAt: now, durationMs: safeDuration };
    this.transitionCount += 1;
  }

  clearTransition(): void {
    this.transition = null;
  }

  setSuppressed(reason: string, suppressed: boolean): void {
    const key = reason.trim() || 'unspecified';
    if (suppressed) this.suppressions.add(key);
    else this.suppressions.delete(key);
  }

  isSuppressed(): boolean {
    return this.suppressions.size > 0;
  }

  sample(locationId: EnvironmentLocationId = this.activeLocation, now: number = runtimeNow()): EnvironmentVisualSample {
    this.pruneTransition(now);

    if (this.isSuppressed()) {
      return {
        locationId,
        visualState: 'bright',
        phase: 'steady',
        darkMix: 0,
        transitionProgress: 0,
        suppressed: true,
      };
    }

    if (this.forcedState) {
      return {
        locationId,
        visualState: this.forcedState,
        phase: 'steady',
        darkMix: this.forcedState === 'dark' ? 1 : 0,
        transitionProgress: 0,
        suppressed: false,
      };
    }

    const transition = this.transition;
    if (!transition || transition.locationId !== locationId) {
      return {
        locationId,
        visualState: 'bright',
        phase: 'steady',
        darkMix: 0,
        transitionProgress: 0,
        suppressed: false,
      };
    }

    const progress = clamp01((now - transition.startedAt) / transition.durationMs);
    let phase: EnvironmentTransitionPhase;
    let darkMix: number;
    if (progress < 0.18) {
      phase = 'rupture';
      darkMix = clamp01((progress / 0.18) * 0.55);
    } else if (progress < 0.68) {
      phase = 'dark-glimpse';
      darkMix = 1;
    } else {
      phase = 'recovery';
      darkMix = clamp01(1 - ((progress - 0.68) / 0.32));
    }

    return {
      locationId,
      visualState: darkMix >= 0.5 ? 'dark' : 'bright',
      phase,
      darkMix,
      transitionProgress: progress,
      suppressed: false,
    };
  }

  snapshot(now: number = runtimeNow()): EnvironmentVisualSnapshot {
    const sample = this.sample(this.activeLocation, now);
    return {
      ...sample,
      forcedState: this.forcedState,
      suppressionReasons: [...this.suppressions].sort(),
      transitionLocation: this.transition?.locationId ?? null,
      transitionCount: this.transitionCount,
    };
  }

  private pruneTransition(now: number): void {
    if (!this.transition) return;
    if (now >= this.transition.startedAt + this.transition.durationMs) this.transition = null;
  }
}

export interface AuthoredEnvironmentRenderers {
  readonly bright: () => void;
  readonly dark?: () => void;
}

export function renderAuthoredEnvironment(
  ctx: CanvasRenderingContext2D,
  sample: EnvironmentVisualSample,
  renderers: AuthoredEnvironmentRenderers,
): void {
  if (!renderers.dark || sample.darkMix <= 0) {
    renderers.bright();
    return;
  }

  if (sample.darkMix >= 1) {
    renderers.dark();
    return;
  }

  ctx.save();
  renderers.bright();
  ctx.globalAlpha = clamp01(sample.darkMix);
  renderers.dark();
  ctx.restore();
}

export const environmentVisualController = new EnvironmentVisualController();

export const environmentVisualDebugState: EnvironmentVisualSnapshot & { ready: true } = {
  ready: true,
  ...environmentVisualController.snapshot(),
};

export function refreshEnvironmentVisualDebug(now: number = runtimeNow()): void {
  Object.assign(environmentVisualDebugState, environmentVisualController.snapshot(now));
}

export const environmentVisualDebugControl = {
  state: environmentVisualDebugState,
  capabilities: ENVIRONMENT_CAPABILITIES,
  forceBright(): void {
    environmentVisualController.forceBright();
    refreshEnvironmentVisualDebug();
  },
  forceDark(): void {
    environmentVisualController.forceDark();
    refreshEnvironmentVisualDebug();
  },
  clearForce(): void {
    environmentVisualController.clearForcedState();
    refreshEnvironmentVisualDebug();
  },
  forceTransition(locationId?: EnvironmentLocationId, durationMs?: number): void {
    environmentVisualController.forceTransition(
      locationId ?? environmentVisualController.getActiveLocation(),
      runtimeNow(),
      durationMs ?? DEFAULT_ENVIRONMENT_TRANSITION_MS,
    );
    refreshEnvironmentVisualDebug();
  },
  clearTransition(): void {
    environmentVisualController.clearTransition();
    refreshEnvironmentVisualDebug();
  },
  suppress(reason = 'debug'): void {
    environmentVisualController.setSuppressed(reason, true);
    refreshEnvironmentVisualDebug();
  },
  resume(reason = 'debug'): void {
    environmentVisualController.setSuppressed(reason, false);
    refreshEnvironmentVisualDebug();
  },
};

type EnvironmentDebugGlobal = typeof globalThis & {
  __SPLICEPIT_ENVIRONMENT__?: typeof environmentVisualDebugControl;
};

(globalThis as EnvironmentDebugGlobal).__SPLICEPIT_ENVIRONMENT__ = environmentVisualDebugControl;
