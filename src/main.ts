const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const DISPLAY_SCALE = 2;
const SPEED = 180;
const ATLAS_PATH = 'assets/protagonists/protagonist-static-atlas-v3.png';

const CHARACTERS = ['milo', 'theo', 'ada', 'pip'] as const;
type CharacterId = (typeof CHARACTERS)[number];
type Direction = 'down' | 'left' | 'right' | 'up';

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

const maybeContext = canvas.getContext('2d', { alpha: false });
if (!maybeContext) throw new Error('Canvas 2D is unavailable');
const ctx: CanvasRenderingContext2D = maybeContext;
ctx.imageSmoothingEnabled = false;

const atlas = new Image();
const held = new Set<string>();
let characterIndex = 0;
let direction: Direction = 'down';
let x = window.innerWidth / 2;
let y = window.innerHeight / 2 + (FRAME_HEIGHT * DISPLAY_SCALE) / 2;
let previousTime = performance.now();

const debug: SandboxDebug = {
  ready: false,
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

  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;
  const sourceX = characterIndex * FRAME_WIDTH;
  const sourceY = DIRECTION_ROW[direction] * FRAME_HEIGHT;

  ctx.drawImage(
    atlas,
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
  debug.character = CHARACTERS[characterIndex];
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

atlas.src = ATLAS_PATH;
atlas.decode().then(() => {
  debug.ready = true;
  resize();
  previousTime = performance.now();
  requestAnimationFrame(frame);
}).catch((error) => {
  console.error('Failed to load protagonist atlas', error);
});
