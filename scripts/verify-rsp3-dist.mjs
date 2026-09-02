import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist', 'generated', 'rsp3');
const BASE_PATH = path.join(DIST_DIR, 'route-bright-base.webp');
const FOREGROUND_PATH = path.join(DIST_DIR, 'route-bright-foreground.png');
const MANIFEST_PATH = path.join(DIST_DIR, 'route-bright-scene.json');

const EXPECTED_WIDTH = 1536;
const EXPECTED_HEIGHT = 1024;
const EXPECTED_BYTES = 582212;
const EXPECTED_SHA256 = '786726d57a260597ae771e3417e811a9705262cd4367e8027cda82da3c809574';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readVp8Dimensions(buffer) {
  invariant(buffer.length >= 30, 'RSP-3 dist base is too small to be valid WebP');
  invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'RSP-3 dist base is not RIFF');
  invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'RSP-3 dist base is not WebP');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'RSP-3 dist base is not VP8 WebP');
  const declaredRiffLength = buffer.readUInt32LE(4) + 8;
  invariant(declaredRiffLength === buffer.length, `RSP-3 dist RIFF length mismatch: ${declaredRiffLength} vs ${buffer.length}`);
  const vp8Length = buffer.readUInt32LE(16);
  const expectedVp8End = 20 + vp8Length + (vp8Length % 2);
  invariant(expectedVp8End === buffer.length, `RSP-3 dist VP8 payload mismatch: ${expectedVp8End} vs ${buffer.length}`);
  invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a, 'RSP-3 dist VP8 key-frame header invalid');
  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

function readPngDimensions(buffer) {
  invariant(buffer.length >= 24, 'RSP-3 foreground PNG is too small');
  invariant(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'RSP-3 foreground is not PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function main() {
  const [base, foreground, manifestRaw] = await Promise.all([
    readFile(BASE_PATH),
    readFile(FOREGROUND_PATH),
    readFile(MANIFEST_PATH, 'utf8'),
  ]);
  invariant(base.length === EXPECTED_BYTES, `RSP-3 dist base byte length ${base.length}; expected ${EXPECTED_BYTES}`);
  invariant(sha256(base) === EXPECTED_SHA256, `RSP-3 dist base sha256 ${sha256(base)}; expected ${EXPECTED_SHA256}`);
  const baseDimensions = readVp8Dimensions(base);
  invariant(baseDimensions.width === EXPECTED_WIDTH && baseDimensions.height === EXPECTED_HEIGHT,
    `RSP-3 dist base dimensions ${baseDimensions.width}x${baseDimensions.height}; expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`);
  const foregroundDimensions = readPngDimensions(foreground);
  invariant(foregroundDimensions.width === EXPECTED_WIDTH && foregroundDimensions.height === EXPECTED_HEIGHT,
    `RSP-3 foreground dimensions ${foregroundDimensions.width}x${foregroundDimensions.height}; expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`);

  const manifest = JSON.parse(manifestRaw);
  invariant(manifest.id === 'opening-route-bright-scene-rsp3-v1', `Unexpected RSP-3 manifest id ${manifest.id}`);
  invariant(manifest.source?.sha256 === EXPECTED_SHA256, 'RSP-3 manifest base hash mismatch');
  invariant(manifest.source?.bytes === EXPECTED_BYTES, 'RSP-3 manifest byte length mismatch');
  invariant(manifest.source?.scale === 1.5, 'RSP-3 manifest world scale mismatch');
  invariant(manifest.world?.width === 2304 && manifest.world?.height === 1536, 'RSP-3 manifest world dimensions mismatch');
  invariant(manifest.world?.cameraTravelX === 1024 && manifest.world?.cameraTravelY === 816, 'RSP-3 manifest camera travel mismatch');

  console.log(`RSP-3 dist verification passed: ${baseDimensions.width}x${baseDimensions.height}, ${base.length} bytes, sha256 ${EXPECTED_SHA256}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
