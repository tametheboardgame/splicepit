export type RandomFn = () => number;

export interface RandomSnapshot {
  version: 1;
  seed: string;
  state: number;
  calls: number;
}

export interface RandomSource {
  readonly seed: string;
  readonly calls: number;
  next(): number;
  snapshot(): RandomSnapshot;
  restore(snapshot: RandomSnapshot): void;
  reset(seed: string | number): void;
}

const UINT32_RANGE = 0x1_0000_0000;
const STEP = 0x6d2b79f5;

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function normaliseSeed(seed: string | number): string {
  const normalised = String(seed).trim();
  if (!normalised) throw new Error('RNG seed must not be empty.');
  return normalised;
}

function assertSnapshot(snapshot: RandomSnapshot): void {
  if (snapshot.version !== 1) throw new Error(`Unsupported RNG snapshot version: ${snapshot.version}`);
  if (!snapshot.seed.trim()) throw new Error('RNG snapshot seed must not be empty.');
  if (!Number.isInteger(snapshot.state) || snapshot.state < 0 || snapshot.state >= UINT32_RANGE) {
    throw new Error('RNG snapshot state must be an unsigned 32-bit integer.');
  }
  if (!Number.isSafeInteger(snapshot.calls) || snapshot.calls < 0) {
    throw new Error('RNG snapshot call count must be a non-negative safe integer.');
  }
}

export class SeededRandom implements RandomSource {
  private seedValue = '';
  private stateValue = 0;
  private callCount = 0;

  constructor(seed: string | number) {
    this.reset(seed);
  }

  get seed(): string { return this.seedValue; }
  get calls(): number { return this.callCount; }

  next(): number {
    this.stateValue = (this.stateValue + STEP) >>> 0;
    let value = this.stateValue;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    this.callCount += 1;
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  }

  nextInt(maxExclusive: number): number {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('RNG integer bound must be a positive safe integer.');
    }
    return Math.floor(this.next() * maxExclusive);
  }

  snapshot(): RandomSnapshot {
    return { version: 1, seed: this.seedValue, state: this.stateValue, calls: this.callCount };
  }

  restore(snapshot: RandomSnapshot): void {
    assertSnapshot(snapshot);
    this.seedValue = snapshot.seed;
    this.stateValue = snapshot.state >>> 0;
    this.callCount = snapshot.calls;
  }

  reset(seed: string | number): void {
    this.seedValue = normaliseSeed(seed);
    this.stateValue = hashSeed(this.seedValue);
    this.callCount = 0;
  }

  static fromSnapshot(snapshot: RandomSnapshot): SeededRandom {
    assertSnapshot(snapshot);
    const random = new SeededRandom(snapshot.seed);
    random.restore(snapshot);
    return random;
  }
}

export function randomFn(source: RandomSource): RandomFn {
  return () => source.next();
}
