import type { CutsceneDefinition } from './cutsceneRuntime.js';

export type DebtCollectorCue = {
  readonly speaker: string;
  readonly text: string;
};

export const DEBT_COLLECTOR_DIALOGUE: Readonly<Record<string, DebtCollectorCue>> = {
  'collector-arrival': {
    speaker: 'CREDITOR REPRESENTATIVE',
    text: 'Dr Splicenstein is dead. We have confirmed that. His account is not.',
  },
  'collector-inheritance': {
    speaker: 'CREDITOR REPRESENTATIVE',
    text: 'The lab, its Pit booking, and the obligations attached to the operation now sit with the surviving operator. That appears to be you.',
  },
  'collector-pressure': {
    speaker: 'CREDITOR REPRESENTATIVE',
    text: 'There is a fight booked tonight. Turn up, earn something, and keep the operation useful. The balance still exists whether the workshop does or not.',
  },
  'collector-terms-later': {
    speaker: 'CREDITOR REPRESENTATIVE',
    text: 'We will return with the figures and dates when the paperwork is complete. For now, understand the important part: your Master’s death did not clear what he owed.',
  },
  'collector-departure': {
    speaker: 'CREDITOR REPRESENTATIVE',
    text: 'Try not to die before then. It creates additional administration.',
  },
} as const;

export const DEBT_COLLECTOR_FLAGS = {
  STARTED: 'debt-collector-encounter-started',
  INHERITED_DEBT_CONFIRMED: 'inherited-debt-confirmed',
  COMPLETE: 'debt-collector-encounter-complete',
} as const;

export const DEBT_COLLECTOR_CUTSCENE: CutsceneDefinition = {
  id: 'wp0.7e-debt-collector-encounter',
  steps: [
    { kind: 'flag', flag: DEBT_COLLECTOR_FLAGS.STARTED, value: true },
    { kind: 'dialogue', cueId: 'collector-arrival' },
    { kind: 'dialogue', cueId: 'collector-inheritance' },
    { kind: 'dialogue', cueId: 'collector-pressure' },
    { kind: 'dialogue', cueId: 'collector-terms-later' },
    { kind: 'dialogue', cueId: 'collector-departure' },
    { kind: 'flag', flag: DEBT_COLLECTOR_FLAGS.INHERITED_DEBT_CONFIRMED, value: true },
    { kind: 'flag', flag: DEBT_COLLECTOR_FLAGS.COMPLETE, value: true },
  ],
};
