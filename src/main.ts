const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SHEET_WIDTH = FRAME_WIDTH * 4;
const SHEET_HEIGHT = FRAME_HEIGHT * 4;
const DISPLAY_SCALE = 2;
const SPEED = 180;
const WALK_FRAME_MS = 125;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;

const CHARACTERS = ['milo', 'theo', 'ada', 'pip'] as const;
const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
type CharacterId = (typeof CHARACTERS)[number];
type Direction = (typeof DIRECTIONS)[number];

const SHEET_PATHS: Record<CharacterId, string> = {
  milo: '/assets/protagonists/milo-hd-v2.png',
  theo: '/assets/protagonists/theo-hd-v2.png',
  ada: '/assets/protagonists/ada-hd-v2.png',
  pip: '/assets/protagonists/pip-hd-v2.png',
};

const DIRECTION_ROW: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
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
  moving: boolean;
  animationFrame: number;
};

const root = document.getElementById('game');
if (!root) throw new Error('Missing #game root');

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'SplicePit animated protagonist movement sandbox');
canvas.tabIndex = 0;
root.replaceChildren(canvas);

const maybeContext = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
if (!maybeContext) throw new Error('Canvas 2D is unavailable');
const ctx: CanvasRenderingContext2D = maybeContext;
ctx.imageSmoothingEnabled = false;

const held = new Set<string>();
const sheets = {} as Record<CharacterId, HTMLImageElement>;
let characterIndex = 0;
let direction: Direction = 'down';
let x = window.innerWidth / 2;
let y = window.innerHeight / 2 + (FRAME_HEIGHT * DISPLAY_SCALE) / 2;
let previousTime = performance.now();
let moving = false;
let animationElapsedMs = 0;
let animationFrame = 0;

const debug: SandboxDebug = {
  ready: false,
  error: null,
  x,
  y,
  character: CHARACTERS[characterIndex],
  direction,
  held: [],
  moving,
  animationFrame,
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
canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));

function update(deltaSeconds: number): void {
  let dx = 0;
  let dy = 0;

  if (held.has('ArrowLeft') || held.has('a')) dx -= 1;
  if (held.has('ArrowRight') || held.has('d')) dx += 1;
  if (held.has('ArrowUp') || held.has('w')) dy -= 1;
  if (held.has('ArrowDown') || held.has('s')) dy += 1;

  moving = dx !== 0 || dy !== 0;

  if (moving) {
    const length = Math.hypot(dx, dy) || 1;
    x += (dx / length) * SPEED * deltaSeconds;
    y += (dy / length) * SPEED * deltaSeconds;
    clampPosition();

    animationElapsedMs += deltaSeconds * 1000;
    const sequenceIndex = Math.floor(animationElapsedMs / WALK_FRAME_MS) % WALK_SEQUENCE.length;
    animationFrame = WALK_SEQUENCE[sequenceIndex];
  } else {
    animationElapsedMs = 0;
    animationFrame = 0;
  }
}

function draw(): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  if (!debug.ready) return;

  const character = CHARACTERS[characterIndex];
  const sheet = sheets[character];
  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;
  const sourceX = animationFrame * FRAME_WIDTH;
  const sourceY = DIRECTION_ROW[direction] * FRAME_HEIGHT;

  ctx.drawImage(
    sheet,
    sourceX,
    sourceY,
    FRAME_WIDTH,
    FRAME_HEIGHT,
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
  debug.moving = moving;
  debug.animationFrame = animationFrame;
}

function frame(now: number): void {
  const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
  previousTime = now;
  update(deltaSeconds);
  draw();
  requestAnimationFrame(frame);
}

async function decodeSheet(character: CharacterId): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = SHEET_PATHS[character];
  await image.decode();

  if (image.naturalWidth !== SHEET_WIDTH || image.naturalHeight !== SHEET_HEIGHT) {
    throw new Error(
      `${character} sheet has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`,
    );
  }

  return image;
}

async function start(): Promise<void> {
  try {
    await Promise.all(
      CHARACTERS.map(async (character) => {
        sheets[character] = await decodeSheet(character);
      }),
    );

    debug.ready = true;
    resize();
    canvas.focus({ preventScroll: true });
    previousTime = performance.now();
    requestAnimationFrame(frame);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    console.error('Failed to load protagonist walk sheets', error);
  }
}

void start();
