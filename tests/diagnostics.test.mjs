import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeDebugState, encodeDebugState } from '../src/diagnostics/debugState.js';
import { SeededRandom } from '../src/random/RandomSource.js';

test('debug state encoding preserves gameplay, domain, scene and RNG state', () => {
  const state = {
    version: 1,
    exportedAt: '2026-08-17T12:00:00.000Z',
    gameplay: {
      hasBaseAnimal: false,
      baseAnimalId: null,
      collectedGenes: [],
      currentCreature: null,
      coins: 12,
      debt: 860,
      fitPitWins: 0,
      questStage: 'find_animal',
      seenIntro: false,
    },
    domain: {
      creatures: [],
      mainCreatureIds: [],
      testAnimalIds: [],
      materialStock: [],
      researchKnowledge: [],
      progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
    },
    rng: new SeededRandom('debug-fixture').snapshot(),
    scene: { active: ['Lab'], registered: ['Title', 'Lab', 'Splice', 'Battle'] },
  };
  assert.deepEqual(decodeDebugState(encodeDebugState(state)), state);
});

test('debug state rejects unsupported versions', () => {
  assert.throws(() => decodeDebugState(JSON.stringify({ version: 99 })), /invalid debug state/i);
});
