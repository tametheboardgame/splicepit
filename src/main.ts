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
const WALK_FRAME_MS = 115;
const WALK_SEQUENCE = [1, 2, 3, 2] as const;
const LOWER_BODY_Y = 64;
const LOWER_BODY_OVERLAP = 2;
const HALF_WIDTH = FRAME_WIDTH / 2;

const CHARACTERS = ['milo', 'theo', 'ada', 'pip'] as const;
const DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
type CharacterId = (typeof CHARACTERS)[number];
type Direction = (typeof DIRECTIONS)[number];

const FRAME_BASE64: Record<CharacterId, Record<Direction, string>> = {
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
const frames = {} as Record<CharacterId, Record<Direction, HTMLImageElement>>;
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

function drawSection(
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  destX: number,
  destY: number,
  offsetX: number,
  offsetY: number,
): void {
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX + offsetX * DISPLAY_SCALE,
    destY + offsetY * DISPLAY_SCALE,
    sourceWidth * DISPLAY_SCALE,
    sourceHeight * DISPLAY_SCALE,
  );
}

function drawAnimatedCharacter(image: HTMLImageElement, destX: number, destY: number): void {
  if (animationFrame === 0) {
    ctx.drawImage(image, destX, destY, FRAME_WIDTH * DISPLAY_SCALE, FRAME_HEIGHT * DISPLAY_SCALE);
    return;
  }

  const stride = animationFrame === 1 ? -2 : animationFrame === 3 ? 2 : 0;
  const torsoX = animationFrame === 1 ? -1 : animationFrame === 3 ? 1 : 0;
  const torsoY = animationFrame === 2 ? -1 : 0;
  const leftY = animationFrame === 1 ? 1 : animationFrame === 3 ? -1 : 0;
  const rightY = -leftY;
  const lowerSourceY = LOWER_BODY_Y - LOWER_BODY_OVERLAP;
  const lowerHeight = FRAME_HEIGHT - lowerSourceY;
  const lowerDestY = destY + lowerSourceY * DISPLAY_SCALE;

  // Draw the legs first with a small overlap into the torso. The torso is then
  // drawn over the join so opposing walk offsets can never expose a black seam.
  drawSection(
    image,
    0,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX,
    lowerDestY,
    stride,
    leftY,
  );
  drawSection(
    image,
    HALF_WIDTH,
    lowerSourceY,
    HALF_WIDTH,
    lowerHeight,
    destX + HALF_WIDTH * DISPLAY_SCALE,
    lowerDestY,
    -stride,
    rightY,
  );
  drawSection(image, 0, 0, FRAME_WIDTH, LOWER_BODY_Y, destX, destY, torsoX, torsoY);
}

function draw(): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  if (!debug.ready) return;

  const character = CHARACTERS[characterIndex];
  const image = frames[character][direction];
  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;
  const destX = Math.round(x - width / 2);
  const destY = Math.round(y - height);

  drawAnimatedCharacter(image, destX, destY);

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

async function decodeFrame(base64: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = `data:image/png;base64,${base64.trim()}`;
  await image.decode();

  if (image.naturalWidth !== FRAME_WIDTH || image.naturalHeight !== FRAME_HEIGHT) {
    throw new Error(`${label} frame has unexpected dimensions ${image.naturalWidth}x${image.naturalHeight}`);
  }

  return image;
}

async function start(): Promise<void> {
  try {
    await Promise.all(
      CHARACTERS.flatMap((character) =>
        DIRECTIONS.map(async (frameDirection) => {
          frames[character] ??= {} as Record<Direction, HTMLImageElement>;
          frames[character][frameDirection] = await decodeFrame(
            FRAME_BASE64[character][frameDirection],
            `${character}-${frameDirection}`,
          );
        }),
      ),
    );

    debug.ready = true;
    resize();
    canvas.focus({ preventScroll: true });
    previousTime = performance.now();
    requestAnimationFrame(frame);
  } catch (error) {
    debug.error = error instanceof Error ? error.message : String(error);
    console.error('Failed to load approved protagonist directional frames', error);
  }
}

void start();
