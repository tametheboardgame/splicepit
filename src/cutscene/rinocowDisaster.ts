import type { CutsceneDefinition } from './cutsceneRuntime.js';

export type RinoCowDisasterCue = {
  readonly speaker: string;
  readonly text: string;
};

export const RINOCOW_DISASTER_DIALOGUE: Readonly<Record<string, RinoCowDisasterCue>> = {
  'viktor-arrival': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'There you are. Excellent. We are eleven minutes from a financially binding catastrophe.',
  },
  'viktor-introduces-rinocow': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'Meet RinoCow. Cow temperament, rhinoceros impact package. The grant application called her “agricultural resilience”.',
  },
  'viktor-horn-warning': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'Do not worry about the horn. Worry about the bit behind the horn.',
  },
  'containment-load': {
    speaker: 'LAB SYSTEM',
    text: 'CONTAINMENT 03: LATCH LOAD 142%.',
  },
  'viktor-new-number': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'Ah. That is a new number.',
  },
  'viktor-dont-panic': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'Nobody panic. Panic is how the forms become complicated.',
  },
  'viktor-final-command': {
    speaker: 'Dr Viktor Splicenstein',
    text: 'RinoCow. Sit.',
  },
  'viktor-biometric-alert': {
    speaker: 'LAB SYSTEM',
    text: 'BIOMETRIC ALERT: DR VIKTOR SPLICENSTEIN IS NO LONGER A STAFFING CONCERN.',
  },
  'gas-available': {
    speaker: 'LAB SYSTEM',
    text: 'CONTAINMENT FAILURE. EMERGENCY GAS FAIL-SAFE AVAILABLE.',
  },
  'gas-confirm': {
    speaker: 'EMERGENCY FAIL-SAFE',
    text: 'PULL HANDLE. THIS WILL KILL EVERY UNSEALED ORGANISM IN THE LAB. [ACTION]',
  },
  'aftermath-silence': {
    speaker: 'NARRATION',
    text: 'The fans stop. Nothing else gets up.',
  },
  'booking-reminder': {
    speaker: 'VIKTOR’S DESK TERMINAL',
    text: 'PIT BOOKING REMINDER: TONIGHT. NON-REFUNDABLE.',
  },
  'alone-now': {
    speaker: 'NARRATION',
    text: 'There is no Master now. Just you, a wrecked lab, and a fight booked for tonight.',
  },
} as const;

export const RINOCOW_DISASTER_FLAGS = {
  BREACH_STARTED: 'rinocow-containment-breach-started',
  MASTER_DEAD: 'master-dead',
  GAS_RELEASED: 'gas-released',
  RINOCOW_DEAD: 'rinocow-dead',
  OTHER_APPRENTICES_DEAD: 'other-apprentices-dead',
  PLAYER_SURVIVED: 'player-survived',
  PLAYER_ALONE: 'player-alone',
  COMPLETE: 'rinocow-disaster-complete',
} as const;

export const RINOCOW_DISASTER_TRANSITIONS = {
  BREACH: 'rinocow-containment-breach',
  IMPACT: 'rinocow-impact',
  GAS: 'gas-release',
  BLACKOUT: 'rinocow-blackout',
  BLACKOUT_RELEASE: 'rinocow-blackout-release',
} as const;

export const RINOCOW_DISASTER_CUTSCENE: CutsceneDefinition = {
  id: 'wp0.7b-rinocow-disaster',
  steps: [
    { kind: 'camera-focus', target: { x: 980, y: 620 }, durationMs: 360 },
    { kind: 'dialogue', cueId: 'viktor-arrival' },
    { kind: 'dialogue', cueId: 'viktor-introduces-rinocow' },
    { kind: 'camera-focus', target: { x: 1500, y: 700 }, durationMs: 420 },
    { kind: 'dialogue', cueId: 'viktor-horn-warning' },
    { kind: 'corruption', intensity: 'blink' },
    { kind: 'dialogue', cueId: 'containment-load', durationMs: 1050 },
    { kind: 'dialogue', cueId: 'viktor-new-number' },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.BREACH_STARTED, value: true },
    { kind: 'corruption', intensity: 'rupture' },
    { kind: 'transition', transitionId: RINOCOW_DISASTER_TRANSITIONS.BREACH, durationMs: 320 },
    { kind: 'move', actorId: 'rinocow', target: { x: 1240, y: 660 }, speed: 520, facing: 'left' },
    { kind: 'camera-focus', target: { x: 1100, y: 630 }, durationMs: 260 },
    { kind: 'dialogue', cueId: 'viktor-dont-panic' },
    { kind: 'face', actorId: 'viktor', facing: 'right' },
    { kind: 'dialogue', cueId: 'viktor-final-command' },
    { kind: 'move', actorId: 'rinocow', target: { x: 1008, y: 632 }, speed: 760, facing: 'left' },
    { kind: 'transition', transitionId: RINOCOW_DISASTER_TRANSITIONS.IMPACT, durationMs: 240 },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.MASTER_DEAD, value: true },
    { kind: 'corruption', intensity: 'rupture' },
    { kind: 'dialogue', cueId: 'viktor-biometric-alert', durationMs: 1450 },
    { kind: 'move', actorId: 'rinocow', target: { x: 1120, y: 758 }, speed: 210, facing: 'down' },
    { kind: 'dialogue', cueId: 'gas-available', durationMs: 1200 },
    { kind: 'dialogue', cueId: 'gas-confirm' },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.GAS_RELEASED, value: true },
    { kind: 'transition', transitionId: RINOCOW_DISASTER_TRANSITIONS.GAS, durationMs: 720 },
    { kind: 'corruption', intensity: 'linger' },
    { kind: 'wait', durationMs: 900 },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.RINOCOW_DEAD, value: true },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.OTHER_APPRENTICES_DEAD, value: true },
    { kind: 'transition', transitionId: RINOCOW_DISASTER_TRANSITIONS.BLACKOUT, durationMs: 650 },
    { kind: 'wait', durationMs: 420 },
    { kind: 'dialogue', cueId: 'aftermath-silence' },
    { kind: 'dialogue', cueId: 'booking-reminder' },
    { kind: 'dialogue', cueId: 'alone-now' },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.PLAYER_SURVIVED, value: true },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.PLAYER_ALONE, value: true },
    { kind: 'flag', flag: RINOCOW_DISASTER_FLAGS.COMPLETE, value: true },
    { kind: 'transition', transitionId: RINOCOW_DISASTER_TRANSITIONS.BLACKOUT_RELEASE, durationMs: 520 },
    { kind: 'camera-release', durationMs: 360 },
  ],
};
