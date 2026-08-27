import test from 'node:test';
import assert from 'node:assert/strict';
import { CutsceneControlGate } from '../src/cutscene/cutsceneControl.js';
import { CutsceneRuntime } from '../src/cutscene/cutsceneRuntime.js';

function adapterLog() {
  const calls = [];
  let now = 100;
  const adapter = {
    now: () => now,
    wait: async (durationMs, signal) => {
      if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
      calls.push(['wait', durationMs]);
      now += durationMs;
    },
    setPlayerControlLocked: async (locked) => calls.push(['control', locked]),
    focusCamera: async (target, durationMs) => calls.push(['camera-focus', target, durationMs]),
    releaseCamera: async (durationMs) => calls.push(['camera-release', durationMs]),
    moveActor: async (actorId, target, options) => calls.push(['move', actorId, target, options]),
    faceActor: async (actorId, facing) => calls.push(['face', actorId, facing]),
    showDialogue: async (cueId, durationMs) => calls.push(['dialogue', cueId, durationMs]),
    setEventFlag: async (flag, value) => calls.push(['flag', flag, value]),
    transition: async (transitionId, durationMs) => calls.push(['transition', transitionId, durationMs]),
    triggerCorruption: async (intensity) => calls.push(['corruption', intensity]),
    setAmbientCorruptionSuppressed: async (suppressed) => calls.push(['ambient', suppressed]),
  };
  return { adapter, calls };
}

test('cutscene runtime sequences every WP0.7A primitive and restores control', async () => {
  const { adapter, calls } = adapterLog();
  const runtime = new CutsceneRuntime(adapter);
  await runtime.play({
    id: 'runtime-contract',
    steps: [
      { kind: 'camera-focus', target: { x: 10, y: 20 }, durationMs: 50 },
      { kind: 'move', actorId: 'master', target: { x: 30, y: 40 }, speed: 120, facing: 'left' },
      { kind: 'face', actorId: 'rinocow', facing: 'right' },
      { kind: 'dialogue', cueId: 'master-warning', durationMs: 80 },
      { kind: 'flag', flag: 'warning-seen', value: true },
      { kind: 'corruption', intensity: 'rupture' },
      { kind: 'transition', transitionId: 'lab-impact', durationMs: 120 },
      { kind: 'wait', durationMs: 40 },
      { kind: 'camera-release', durationMs: 25 },
    ],
  });

  assert.deepEqual(calls, [
    ['control', true],
    ['ambient', true],
    ['camera-focus', { x: 10, y: 20 }, 50],
    ['move', 'master', { x: 30, y: 40 }, { speed: 120, facing: 'left' }],
    ['face', 'rinocow', 'right'],
    ['dialogue', 'master-warning', 80],
    ['flag', 'warning-seen', true],
    ['corruption', 'rupture'],
    ['transition', 'lab-impact', 120],
    ['wait', 40],
    ['camera-release', 25],
    ['ambient', false],
    ['control', false],
  ]);
  assert.equal(runtime.snapshot().status, 'completed');
  assert.equal(runtime.snapshot().completedSceneId, 'runtime-contract');
});

test('cutscene runtime honours explicit control release and skips default wrappers when requested', async () => {
  const { adapter, calls } = adapterLog();
  const runtime = new CutsceneRuntime(adapter);
  await runtime.play({
    id: 'control-window',
    lockPlayer: false,
    suppressAmbientCorruption: false,
    steps: [
      { kind: 'control', locked: true },
      { kind: 'wait', durationMs: 1 },
      { kind: 'control', locked: false },
    ],
  });
  assert.deepEqual(calls, [['control', true], ['wait', 1], ['control', false]]);
});

test('cutscene cancellation releases camera, corruption suppression and controls', async () => {
  const calls = [];
  let resolveWait;
  const adapter = {
    now: () => 0,
    wait: (_durationMs, signal) => new Promise((resolve, reject) => {
      resolveWait = resolve;
      signal.addEventListener('abort', () => reject(new DOMException('cancelled', 'AbortError')), { once: true });
    }),
    setPlayerControlLocked: async (locked) => calls.push(['control', locked]),
    focusCamera: async () => calls.push(['camera-focus']),
    releaseCamera: async () => calls.push(['camera-release']),
    moveActor: async () => {},
    faceActor: async () => {},
    showDialogue: async () => {},
    setEventFlag: async () => {},
    transition: async () => {},
    triggerCorruption: async () => {},
    setAmbientCorruptionSuppressed: async (suppressed) => calls.push(['ambient', suppressed]),
  };
  const runtime = new CutsceneRuntime(adapter);
  const run = runtime.play({
    id: 'cancel-me',
    steps: [
      { kind: 'camera-focus', target: { x: 1, y: 2 }, durationMs: 0 },
      { kind: 'wait', durationMs: 999 },
    ],
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(runtime.cancel(), true);
  await run;
  resolveWait?.();
  assert.equal(runtime.snapshot().status, 'cancelled');
  assert.deepEqual(calls, [
    ['control', true],
    ['ambient', true],
    ['camera-focus'],
    ['camera-release'],
    ['ambient', false],
    ['control', false],
  ]);
});

test('control gate composes independent locks safely', () => {
  const gate = new CutsceneControlGate();
  gate.lock('scene');
  gate.lock('dialogue');
  assert.equal(gate.isLocked(), true);
  assert.deepEqual(gate.reasons(), ['dialogue', 'scene']);
  gate.unlock('scene');
  assert.equal(gate.isLocked(), true);
  gate.unlock('dialogue');
  assert.equal(gate.isLocked(), false);
});
