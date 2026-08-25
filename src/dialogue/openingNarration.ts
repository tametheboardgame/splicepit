import type { DialoguePortraitDefinition, DialogueSequenceDefinition } from './presentation.js';

const VIKTOR_PORTRAIT: DialoguePortraitDefinition = {
  src: '/art/portraits/viktor-splicenstein.svg',
  corruptedSrc: '/art/portraits/viktor-splicenstein-corrupted.svg',
  alt: 'Dr. Viktor Splicenstein',
};

export function openingNarrationSequence(): DialogueSequenceDefinition {
  return {
    id: 'opening-welcome',
    pages: [
      {
        id: 'welcome',
        speaker: 'Dr. Viktor Splicenstein',
        portrait: VIKTOR_PORTRAIT,
        text: 'Welcome to the wonderful world of Splicing.',
      },
      {
        id: 'science',
        speaker: 'Dr. Viktor Splicenstein',
        portrait: VIKTOR_PORTRAIT,
        text: 'Here, bright young minds combine science, ambition and a refreshingly flexible interpretation of animal welfare.',
        corruption: [
          { startMs: 540, durationMs: 170, strength: 0.52 },
          { startMs: 780, durationMs: 240, strength: 0.84 },
        ],
      },
      {
        id: 'brutality',
        speaker: 'Dr. Viktor Splicenstein',
        portrait: VIKTOR_PORTRAIT,
        text: 'You are about to embark on your own glorious adventure of fucked-up genetic alteration and animal brutality. If you are vegan, this may be an excellent point to reconsider your life choices.',
        corruption: [
          { startMs: 430, durationMs: 140, strength: 0.46 },
          { startMs: 670, durationMs: 330, strength: 1 },
          { startMs: 1110, durationMs: 110, strength: 0.68 },
        ],
      },
      {
        id: 'choose-apprentice',
        speaker: 'Dr. Viktor Splicenstein',
        portrait: VIKTOR_PORTRAIT,
        text: 'First, choose your Splice apprentice to quest through this wonderful world of amoral gene splicing and brutality.',
      },
    ],
  };
}
