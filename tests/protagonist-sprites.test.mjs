import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PROTAGONIST_DIRECTIONS,
  PROTAGONIST_FRAME_LAYOUT,
  PROTAGONIST_IDS,
  PROTAGONIST_SPRITE_COLUMNS,
  PROTAGONIST_SPRITE_DISPLAY_SCALE,
  PROTAGONIST_SPRITE_FRAME_HEIGHT,
  PROTAGONIST_SPRITE_FRAME_WIDTH,
  PROTAGONIST_SPRITE_ROWS,
  PROTAGONIST_SPRITES,
} from '../src/player/protagonists.js';

function pngDimensions(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG', `${path} must be a PNG`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

test('WP0.4D locks the four authored protagonist runtime sprite definitions', () => {
  assert.deepEqual(PROTAGONIST_IDS, ['milo', 'theo', 'ada', 'pip']);
  assert.deepEqual(PROTAGONIST_DIRECTIONS, ['down', 'left', 'right', 'up']);
  assert.equal(PROTAGONIST_SPRITE_FRAME_WIDTH, 24);
  assert.equal(PROTAGONIST_SPRITE_FRAME_HEIGHT, 32);
  assert.equal(PROTAGONIST_SPRITE_COLUMNS, 4);
  assert.equal(PROTAGONIST_SPRITE_ROWS, 4);
  assert.equal(PROTAGONIST_SPRITE_DISPLAY_SCALE, 4);
});

test('each direction owns one idle frame and three deterministic walk frames', () => {
  const frames = PROTAGONIST_DIRECTIONS.flatMap((direction) => {
    const row = PROTAGONIST_FRAME_LAYOUT[direction];
    return [row.idle, ...row.walk];
  });
  assert.deepEqual(frames, Array.from({ length: 16 }, (_, index) => index));
});

test('all four runtime sheets are exact 4-by-4 fixed grids', () => {
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
