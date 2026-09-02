import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist', 'generated', 'rsp3');
const WIDTH = 1024;
const HEIGHT = 683;
const EXPECTED_BYTES = 120561;
const EXPECTED_SHA256 = 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c';
const GENERATION_ID = '36419539-1a20-4646-b1be-d92b04955e40';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readJpegDimensions(buffer) {
  invariant(buffer[0] === 0xff && buffer[1] === 0xd8, 'RSP-3 dist base is not JPEG');
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    invariant(offset < buffer.length, 'RSP-3 dist JPEG has no frame header');
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    invariant(offset + 2 <= buffer.length, 'RSP-3 dist JPEG has a truncated segment');
    const length = buffer.readUInt16BE(offset);
    invariant(length >= 2 && offset + length <= buffer.length, 'RSP-3 dist JPEG has an invalid segment');
    if (sofMarkers.has(marker)) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  throw new Error('RSP-3 dist JPEG has no supported SOF frame header');
}

function readPngDimensions(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  invariant(buffer.subarray(0, 8).equals(signature), 'RSP-3 foreground is not PNG');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'IHDR', 'RSP-3 foreground has no IHDR');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function main() {
  const [base, foreground, manifestText] = await Promise.all([
    readFile(path.join(DIST_DIR, 'route-bright-base.jpg')),
    readFile(path.join(DIST_DIR, 'route-bright-foreground.png')),
    readFile(path.join(DIST_DIR, 'route-bright-scene.json'), 'utf8'),
  ]);
  invariant(base.length === EXPECTED_BYTES, `RSP-3 dist base has ${base.length} bytes; expected ${EXPECTED_BYTES}`);
  invariant(sha256(base) === EXPECTED_SHA256, 'RSP-3 dist base sha256 mismatch');
  const baseDimensions = readJpegDimensions(base);
  invariant(baseDimensions.width === WIDTH && baseDimensions.height === HEIGHT, 'RSP-3 dist base dimensions mismatch');
  const foregroundDimensions = readPngDimensions(foreground);
  invariant(foregroundDimensions.width === WIDTH && foregroundDimensions.height === HEIGHT, 'RSP-3 foreground dimensions mismatch');

  const manifest = JSON.parse(manifestText);
  invariant(manifest.workPackage === 'RSP-3', 'RSP-3 manifest work package mismatch');
  invariant(manifest.sourceGenerationId === GENERATION_ID, 'RSP-3 manifest generation ID mismatch');
  invariant(manifest.base?.sha256 === EXPECTED_SHA256 && manifest.base?.bytes === EXPECTED_BYTES, 'RSP-3 manifest base identity mismatch');
  invariant(manifest.worldMapping?.sourcePixelScale === 3, 'RSP-3 manifest world scale mismatch');
  invariant(manifest.worldMapping?.width === 3072 && manifest.worldMapping?.height === 2049, 'RSP-3 manifest world dimensions mismatch');
  invariant(manifest.worldMapping?.minimumDistinctTraversalBeats >= 3, 'RSP-3 manifest traversal beat contract missing');
  invariant(manifest.foreground?.sha256 === sha256(foreground), 'RSP-3 manifest foreground identity mismatch');

  console.log(`RSP-3 dist verification passed: ${WIDTH}x${HEIGHT}, ${base.length} bytes, world 3072x2049`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
