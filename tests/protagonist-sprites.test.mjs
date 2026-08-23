import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  DEFAULT_PROTAGONIST_APPEARANCE,
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_FRAME_LAYOUT,
  PROTAGONIST_GAMEPLAY_SCALE,
  PROTAGONIST_IDS,
  PROTAGONIST_REVIEW_SCALE,
  PROTAGONIST_SPRITE_COLUMNS,
  PROTAGONIST_SPRITE_FRAME_HEIGHT,
  PROTAGONIST_SPRITE_FRAME_WIDTH,
  PROTAGONIST_SPRITE_ROWS,
  PROTAGONIST_SPRITES,
  isProtagonistId,
} from '../src/player/protagonists.js';

function pngDimensions(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG', `${path} must be a PNG`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

test('WP0.4D locks the four approved high-detail protagonist runtime definitions', () => {
  assert.deepEqual(PROTAGONIST_IDS, ['milo', 'theo', 'ada', 'pip']);
  assert.deepEqual(PROTAGONIST_DIRECTIONS, ['down', 'left', 'right', 'up']);
  assert.equal(PROTAGONIST_SPRITE_FRAME_WIDTH, 64);
  assert.equal(PROTAGONIST_SPRITE_FRAME_HEIGHT, 96);
  assert.equal(PROTAGONIST_SPRITE_COLUMNS, 4);
  assert.equal(PROTAGONIST_SPRITE_ROWS, 4);
  assert.equal(PROTAGONIST_GAMEPLAY_SCALE, 1);
  assert.equal(PROTAGONIST_REVIEW_SCALE, 2);
});

test('each direction owns one idle frame and three deterministic walk frames', () => {
  const frames = PROTAGONIST_DIRECTIONS.flatMap((direction) => {
    const row = PROTAGONIST_FRAME_LAYOUT[direction];
    return [row.idle, ...row.walk];
  });
  assert.deepEqual(frames, Array.from({ length: 16 }, (_, index) => index));
});

test('all four approved runtime sheets are exact 256-by-384 fixed grids', () => {
  for (const id of PROTAGONIST_IDS) {
    const definition = PROTAGONIST_SPRITES[id];
    assert.equal(definition.id, id);
    assert.match(definition.textureKey, /^protagonist-/);
    assert.equal(definition.assetPath, `assets/protagonists/${id}.png`);

    const { width, height } = pngDimensions(`public/${definition.assetPath}`);
    assert.equal(width, PROTAGONIST_SPRITE_FRAME_WIDTH * PROTAGONIST_SPRITE_COLUMNS);
    assert.equal(height, PROTAGONIST_SPRITE_FRAME_HEIGHT * PROTAGONIST_SPRITE_ROWS);
  }
});

test('appearance boundary defaults cleanly and validates protagonist IDs', () => {
  assert.deepEqual(DEFAULT_PROTAGONIST_APPEARANCE, {
    id: 'milo',
    skinToneId: 'base',
    accentVariantId: 'base',
  });
  assert.equal(isProtagonistId('ada'), true);
  assert.equal(isProtagonistId('unknown'), false);
  assert.equal(isProtagonistId(null), false);
});

test('temporary base64 TypeScript sprite-data experiments are removed', () => {
  assert.equal(existsSync('src/player/spriteData/milo.1.ts'), false);
  assert.equal(existsSync('src/player/spriteData/milo.q1.ts'), false);
  assert.equal(existsSync('src/player/protagonists.v2.ts'), false);
  assert.equal(existsSync('src/player/spriteMetricOverride.ts'), false);
});
