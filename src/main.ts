import miloDown from './assets/frames/milo-down.txt?raw';
import miloLeft from './assets/frames/milo-left.txt?raw';
import miloRight from './assets/frames/milo-right.txt?raw';
import miloUp from './assets/frames/milo-up.txt?raw';
import theoDown from './assets/frames/theo-down.txt?raw';
import theoLeft from './assets/frames/theo-left.txt?raw';
import theoRight from './assets/frames/theo-right.txt?raw';
import theoUp from './assets/frames/theo-up.txt?raw';
import adaDown from './assets/frames/ada-down.txt?raw';
import adaLeft from './assets/frames/ada-left.txt?raw';
import adaRight from './assets/frames/ada-right.txt?raw';
import adaUp from './assets/frames/ada-up.txt?raw';
import pipDown from './assets/frames/pip-down.txt?raw';
import pipLeft from './assets/frames/pip-left.txt?raw';
import pipRight from './assets/frames/pip-right.txt?raw';
import pipUp from './assets/frames/pip-up.txt?raw';

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const DISPLAY_SCALE = 2;
const SPEED = 180;

const CHARACTERS = ['milo', 'theo', 'ada', 'pip'] as const;
const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
type CharacterId = (typeof CHARACTERS)[number];
type Direction = (typeof DIRECTIONS)[number];

type FrameSources = Record<CharacterId, Record<Direction, string>>;
type FrameImages = Record<CharacterId, Record<Direction, HTMLImageElement>>;

const FRAME_SOURCES: FrameSources = {
  milo: { down: miloDown, left: miloLeft, right: miloRight, up: miloUp },
  theo: { down: theoDown, left: theoLeft, right: theoRight, up: theoUp },
  ada: { down: adaDown, left: adaLeft, right: adaRight, up: adaUp },
  pip: { down: pipDown, left: pipLeft, right: pipRight, up: pipUp },
};

const KEY_DIRECTION: Record<string, Direction | undefined> = {
  ArrowDown: 'down', s: 'down',
  ArrowLeft: 'left', a: 'left',
  ArrowRight: 'right', d: 'right',
  ArrowUp: 'up', w: 'up',
};

type SandboxDebug = {
  ready: boolean;
  error: string | null;
  x: number;
  y: number;
  character: CharacterId;
  direction: Direction;
  held: string[];
};

const root = document.getElementById('game');
if (!root) throw new Error('Missing #game root');

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'SplicePit bare sprite movement sandbox');
root.replaceChildren(canvas);

const maybeContext = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
if (!maybeContext) throw new Error('Canvas 2D is unavailable');
const ctx: CanvasRenderingContext2D = maybeContext;
ctx.imageSmoothingEnabled = false;

const held = new Set<string>();
const images = {} as FrameImages;
let characterIndex = 0;
let direction: Direction = 'down';
let x = window.innerWidth / 2;
let y = window.innerHeight / 2 + (FRAME_HEIGHT * DISPLAY_SCALE) / 2;
let previousTime = performance.now();

const debug: SandboxDebug = {
  ready: false,
  error: null,
  x,
  y,
  character: CHARACTERS[characterIndex],
  direction,
  held: [],
};
(globalThis as typeof globalThis & { __SPLICEPIT_SANDBOX__?: SandboxDebug }).__SPLICEPIT_SANDBOX__ = debug;

function resize(): void {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
  canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  clampPosition();
}

function clampPosition(): void {
  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;
  x = Math.max(width / 2, Math.min(window.innerWidth - width / 2, x));
  y = Math.max(height, Math.min(window.innerHeight, y));
}

function resetPosition(): void {
  x = window.innerWidth / 2;
  y = window.innerHeight / 2 + (FRAME_HEIGHT * DISPLAY_SCALE) / 2;
  clampPosition();
}

function normaliseKey(event: KeyboardEvent): string {
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

const movementKeys = new Set(Object.keys(KEY_DIRECTION));

window.addEventListener('keydown', (event) => {
  const key = normaliseKey(event);

  if (movementKeys.has(key)) {
    event.preventDefault();
    held.add(key);
    direction = KEY_DIRECTION[key] ?? direction;
    return;
  }

  if (!event.repeat && ['1', '2', '3', '4'].includes(key)) {
    characterIndex = Number(key) - 1;
    return;
  }

  if (!event.repeat && key === 'r') resetPosition();
});

window.addEventListener('keyup', (event) => {
  const key = normaliseKey(event);
  if (movementKeys.has(key)) {
    event.preventDefault();
    held.delete(key);
  }
});

window.addEventListener('blur', () => held.clear());
window.addEventListener('resize', resize);

function update(deltaSeconds: number): void {
  let dx = 0;
  let dy = 0;

  if (held.has('ArrowLeft') || held.has('a')) dx -= 1;
  if (held.has('ArrowRight') || held.has('d')) dx += 1;
  if (held.has('ArrowUp') || held.has('w')) dy -= 1;
  if (held.has('ArrowDown') || held.has('s')) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy) || 1;
    x += (dx / length) * SPEED * deltaSeconds;
    y += (dy / length) * SPEED * deltaSeconds;
    clampPosition();
  }
}

function draw(): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  if (!debug.ready) return;

  const character = CHARACTERS[characterIndex];
  const image = images[character][direction];
  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;

  ctx.drawImage(
    image,
    Math.round(x - width / 2),
    Math.round(y - height),
    width,
    height,
  );

  debug.x = x;
  debug.y = y;
  debug.character = character;
  debug.direction = direction;
  debug.held = [...held];
}

function frame(now: number): void {
  const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
  previousTime = now;
  update(deltaSeconds);
  draw();
  requestAnimationFrame(frame);
}

async function decodeFrame(character: CharacterId, frameDirection: Direction): Promise<HTMLImageElement> {
  const base64 = FRAME_SOURCES[character][frameDirection].trim();
  if (!base64.startsWith('iVBORw0KGgo')) {
    throw new Error(`${character}-${frameDirection} frame payload is invalid`);
  }

  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();

  if (image.naturalWidth !== FRAME_WIDTH || image.naturalHeight !== FRAME_HEIGHT) {
    throw new Error(
      `${character}-${frameDirection} has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`,
    );
  }

  return image;
}

async function start(): Promise<void> {
  try {
    for (const character of CHARACTERS) {
      const characterImages = {} as Record<Direction, HTMLImageElement>;
      images[character] = characterImages;

      await Promise.all(
        DIRECTIONS.map(async (frameDirection) => {
          characterImages[frameDirection] = await decodeFrame(character, frameDirection);
        }),
      );
    }

    debug.ready = true;
    resize();
    previousTime = performance.now();
    requestAnimationFrame(frame);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    console.error('Failed to load standalone protagonist frames', error);
  }
}

void start();
