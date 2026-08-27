import type { EnvironmentLocationId } from './environmentVisualContract.js';

export const AMBIENT_CORRUPTION_INTENSITIES = ['blink', 'rupture', 'linger'] as const;
export type AmbientCorruptionIntensity = (typeof AMBIENT_CORRUPTION_INTENSITIES)[number];
export type CorruptionEventSource = 'ambient' | 'debug' | 'authored';

export interface AmbientCorruptionIntensityPreset {
  readonly durationMs: number;
  readonly overlayStrength: number;
}

export const AMBIENT_CORRUPTION_PRESETS: Readonly<Record<AmbientCorruptionIntensity, AmbientCorruptionIntensityPreset>> = {
  blink: { durationMs: 360, overlayStrength: 0.42 },
  rupture: { durationMs: 760, overlayStrength: 0.72 },
  linger: { durationMs: 1320, overlayStrength: 0.92 },
};

export interface AmbientCorruptionSchedulerConfig {
  readonly minDelayMs: number;
  readonly maxDelayMs: number;
  readonly recoveryBufferMs: number;
}

export const DEFAULT_AMBIENT_CORRUPTION_CONFIG: AmbientCorruptionSchedulerConfig = {
  minDelayMs: 22000,
  maxDelayMs: 52000,
  recoveryBufferMs: 12000,
};

export interface AmbientCorruptionEvent {
  readonly id: number;
  readonly locationId: EnvironmentLocationId;
  readonly intensity: AmbientCorruptionIntensity;
  readonly source: CorruptionEventSource;
  readonly startedAt: number;
  readonly durationMs: number;
  readonly overlayStrength: number;
  readonly ignoreSuppression: boolean;
}

export interface AmbientCorruptionSchedulerSnapshot {
  readonly enabled: boolean;
  readonly locationId: EnvironmentLocationId | null;
  readonly eventCount: number;
  readonly ambientEventCount: number;
  readonly authoredEventCount: number;
  readonly nextDueAt: number | null;
  readonly activeEvent: AmbientCorruptionEvent | null;
  readonly lastEvent: AmbientCorruptionEvent | null;
}

export interface AmbientCorruptionUpdate {
  readonly started: AmbientCorruptionEvent | null;
  readonly cancelled: AmbientCorruptionEvent | null;
  readonly ended: AmbientCorruptionEvent | null;
  readonly active: AmbientCorruptionEvent | null;
}

export interface AmbientCorruptionUpdateInput {
  readonly now: number;
  readonly locationId: EnvironmentLocationId;
  readonly exploring: boolean;
  readonly blocked: boolean;
}

type AmbientCorruptionSchedulerOptions = Partial<AmbientCorruptionSchedulerConfig> & {
  readonly random?: () => number;
};

function clampRandom(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(0.999999, value));
}

function safeDuration(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(1, value) : fallback;
}

export class AmbientWorldCorruptionScheduler {
  private readonly config: AmbientCorruptionSchedulerConfig;
  private readonly random: () => number;
  private enabled = true;
  private locationId: EnvironmentLocationId | null = null;
  private nextDueAt: number | null = null;
  private active: AmbientCorruptionEvent | null = null;
  private lastEvent: AmbientCorruptionEvent | null = null;
  private eventCount = 0;
  private ambientEventCount = 0;
  private authoredEventCount = 0;

  constructor(options: AmbientCorruptionSchedulerOptions = {}) {
    const minDelayMs = safeDuration(options.minDelayMs ?? DEFAULT_AMBIENT_CORRUPTION_CONFIG.minDelayMs, DEFAULT_AMBIENT_CORRUPTION_CONFIG.minDelayMs);
    const maxDelayMs = Math.max(minDelayMs, safeDuration(options.maxDelayMs ?? DEFAULT_AMBIENT_CORRUPTION_CONFIG.maxDelayMs, DEFAULT_AMBIENT_CORRUPTION_CONFIG.maxDelayMs));
    this.config = {
      minDelayMs,
      maxDelayMs,
      recoveryBufferMs: safeDuration(options.recoveryBufferMs ?? DEFAULT_AMBIENT_CORRUPTION_CONFIG.recoveryBufferMs, DEFAULT_AMBIENT_CORRUPTION_CONFIG.recoveryBufferMs),
    };
    this.random = options.random ?? Math.random;
  }

  update(input: AmbientCorruptionUpdateInput): AmbientCorruptionUpdate {
    const { now, locationId, exploring, blocked } = input;
    let ended: AmbientCorruptionEvent | null = null;
    let cancelled: AmbientCorruptionEvent | null = null;

    if (this.active && now >= this.active.startedAt + this.active.durationMs) {
      ended = this.active;
      this.lastEvent = this.active;
      this.active = null;
      if (this.enabled && exploring) this.scheduleFrom(now);
    }

    if (!this.enabled || !exploring) {
      cancelled = this.cancelActiveInternal();
      this.locationId = exploring ? locationId : null;
      this.nextDueAt = null;
      return { started: null, cancelled, ended, active: null };
    }

    if (this.locationId !== locationId) {
      cancelled = this.cancelActiveInternal();
      this.locationId = locationId;
      this.scheduleFrom(now);
      return { started: null, cancelled, ended, active: null };
    }

    if (blocked && !this.active?.ignoreSuppression) {
      cancelled = this.cancelActiveInternal();
      this.nextDueAt = now + this.config.recoveryBufferMs;
      return { started: null, cancelled, ended, active: null };
    }

    if (this.active) return { started: null, cancelled, ended, active: this.active };
    if (this.nextDueAt === null) this.scheduleFrom(now);
    if (this.nextDueAt === null || now < this.nextDueAt) {
      return { started: null, cancelled, ended, active: null };
    }

    const event = this.createEvent(locationId, now, this.pickAmbientIntensity(), 'ambient', false);
    this.active = event;
    this.nextDueAt = null;
    return { started: event, cancelled, ended, active: event };
  }

  force(
    locationId: EnvironmentLocationId,
    now: number,
    intensity: AmbientCorruptionIntensity = 'rupture',
    source: CorruptionEventSource = 'debug',
    ignoreSuppression = source === 'authored',
  ): AmbientCorruptionEvent {
    this.locationId = locationId;
    this.active = this.createEvent(locationId, now, intensity, source, ignoreSuppression);
    this.nextDueAt = null;
    return this.active;
  }

  cancel(now: number, reschedule = true): AmbientCorruptionEvent | null {
    const cancelled = this.cancelActiveInternal();
    if (this.enabled && this.locationId && reschedule) this.scheduleFrom(now);
    return cancelled;
  }

  setEnabled(enabled: boolean, now: number): AmbientCorruptionEvent | null {
    this.enabled = enabled;
    if (!enabled) {
      this.nextDueAt = null;
      return this.cancelActiveInternal();
    }
    if (this.locationId) this.scheduleFrom(now);
    return null;
  }

  reschedule(now: number): void {
    if (!this.enabled || !this.locationId) {
      this.nextDueAt = null;
      return;
    }
    this.scheduleFrom(now);
  }

  activeEvent(): AmbientCorruptionEvent | null {
    return this.active;
  }

  snapshot(): AmbientCorruptionSchedulerSnapshot {
    return {
      enabled: this.enabled,
      locationId: this.locationId,
      eventCount: this.eventCount,
      ambientEventCount: this.ambientEventCount,
      authoredEventCount: this.authoredEventCount,
      nextDueAt: this.nextDueAt,
      activeEvent: this.active,
      lastEvent: this.lastEvent,
    };
  }

  private createEvent(
    locationId: EnvironmentLocationId,
    now: number,
    intensity: AmbientCorruptionIntensity,
    source: CorruptionEventSource,
    ignoreSuppression: boolean,
  ): AmbientCorruptionEvent {
    const preset = AMBIENT_CORRUPTION_PRESETS[intensity];
    this.eventCount += 1;
    if (source === 'ambient') this.ambientEventCount += 1;
    if (source === 'authored') this.authoredEventCount += 1;
    const event: AmbientCorruptionEvent = {
      id: this.eventCount,
      locationId,
      intensity,
      source,
      startedAt: now,
      durationMs: preset.durationMs,
      overlayStrength: preset.overlayStrength,
      ignoreSuppression,
    };
    this.lastEvent = event;
    return event;
  }

  private pickAmbientIntensity(): AmbientCorruptionIntensity {
    const roll = clampRandom(this.random());
    if (roll < 0.56) return 'blink';
    if (roll < 0.92) return 'rupture';
    return 'linger';
  }

  private scheduleFrom(now: number): void {
    const roll = clampRandom(this.random());
    const span = this.config.maxDelayMs - this.config.minDelayMs;
    this.nextDueAt = now + this.config.minDelayMs + Math.round(span * roll);
  }

  private cancelActiveInternal(): AmbientCorruptionEvent | null {
    if (!this.active) return null;
    const cancelled = this.active;
    this.lastEvent = cancelled;
    this.active = null;
    return cancelled;
  }
}
