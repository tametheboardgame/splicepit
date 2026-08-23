const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const DISPLAY_SCALE = 2;
const SPEED = 180;

const CHARACTERS = [
  { id: 'milo', path: 'assets/protagonists/milo-hd-v2.png' },
  { id: 'theo', path: 'assets/protagonists/theo-hd-v2.png' },
  { id: 'ada', path: 'assets/protagonists/ada-hd-v2.png' },
  { id: 'pip', path: 'assets/protagonists/pip-hd-v2.png' },
] as const;

type CharacterId = (typeof CHARACTERS)[number]['id'];

type SandboxDebug = {
  ready: boolean;
  x: number;
  y: number;
  character: CharacterId;
  held: string[];
};

const root = document.getElementById('game');
if (!root) throw new Error('Missing #game root');

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'SplicePit bare sprite movement sandbox');
root.replaceChildren(canvas);

const context = canvas.getContext('2d', { alpha: false });
if (!context) throw new Error('Canvas 2D is unavailable');
context.imageSmoothingEnabled = false;

const images = new Map<CharacterId, HTMLImageElement>();
const held = new Set<string>();
let characterIndex = 0;
let x = window.innerWidth / 2;
let y = window.innerHeight / 2 + (FRAME_HEIGHT * DISPLAY_SCALE) / 2;
let previousTime = performance.now();

const debug: SandboxDebug = {
  ready: false,
  x,
  y,
  character: CHARACTERS[characterIndex].id,
  held: [],
};
(globalThis as typeof globalThis & { __SPLICEPIT_SANDBOX__?: SandboxDebug }).__SPLICEPIT_SANDBOX__ = debug;

function resize(): void {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
  canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = false;
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

const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd']);

window.addEventListener('keydown', (event) => {
  const key = normaliseKey(event);
  if (movementKeys.has(key)) {
    event.preventDefault();
    held.add(key);
    return;
  }

  if (!event.repeat && ['1', '2', '3', '4'].includes(key)) {
    characterIndex = Number(key) - 1;
    debug.character = CHARACTERS[characterIndex].id;
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

async function loadCharacter(character: (typeof CHARACTERS)[number]): Promise<void> {
  const image = new Image();
  image.src = character.path;
  await image.decode();
  images.set(character.id, image);
}

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
  context.fillStyle = '#000000';
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const character = CHARACTERS[characterIndex];
  const image = images.get(character.id);
  if (!image) return;

  const width = FRAME_WIDTH * DISPLAY_SCALE;
  const height = FRAME_HEIGHT * DISPLAY_SCALE;

  // Deliberately draw the one known-good DOWN frame for every movement direction.
  // This build isolates movement from all directional-frame logic.
  context.drawImage(
    image,
    0,
    0,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    Math.round(x - width / 2),
    Math.round(y - height),
    width,
    height,
  );

  debug.x = x;
  debug.y = y;
  debug.character = character.id;
  debug.held = [...held];
}

function frame(now: number): void {
  const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
  previousTime = now;
  update(deltaSeconds);
  draw();
  requestAnimationFrame(frame);
}

resize();
Promise.all(CHARACTERS.map(loadCharacter)).then(() => {
  debug.ready = true;
  previousTime = performance.now();
  requestAnimationFrame(frame);
});
