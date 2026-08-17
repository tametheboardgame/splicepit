import { SeededRandom, type RandomFn, type RandomSnapshot } from '../random/RandomSource.js';

function requestedSeed(): string | null {
  if (typeof globalThis.location === 'undefined') return null;
  const seed = new URLSearchParams(globalThis.location.search).get('seed');
  return seed?.trim() || null;
}

function generatedSeed(): string {
  const values = new Uint32Array(2);
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    cryptoApi.getRandomValues(values);
    return `runtime-${values[0].toString(16).padStart(8, '0')}${values[1].toString(16).padStart(8, '0')}`;
  }
  return `runtime-${Date.now().toString(36)}`;
}

export const runtimeRandom = new SeededRandom(requestedSeed() ?? generatedSeed());
export const runtimeRandomFn: RandomFn = () => runtimeRandom.next();

export function setRuntimeSeed(seed: string | number): RandomSnapshot {
  runtimeRandom.reset(seed);
  return runtimeRandom.snapshot();
}
