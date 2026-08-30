import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist', 'generated', 'ysp3');
const WIDTH = 1280;
const HEIGHT = 720;
const EXPECTED_BASE_BYTES = 177808;
const EXPECTED_BASE_SHA256 = '6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readVp8Dimensions(buffer) {
  invariant(buffer.length >= 30, 'Emitted YSP-3 Yard base is too small to be a valid WebP');
  invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'Emitted YSP-3 Yard base is not RIFF');
  invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'Emitted YSP-3 Yard base is not WebP');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'Emitted YSP-3 Yard base must be a VP8 WebP');

  const declaredRiffLength = buffer.readUInt32LE(4) + 8;
  invariant(
    declaredRiffLength === buffer.length,
    `Emitted YSP-3 Yard base is truncated or malformed: RIFF declares ${declaredRiffLength} bytes but dist contains ${buffer.length}`,
  );

  const vp8Length = buffer.readUInt32LE(16);
  const expectedVp8End = 20 + vp8Length + (vp8Length % 2);
  invariant(
    expectedVp8End === buffer.length,
    `Emitted YSP-3 Yard VP8 payload is incomplete: chunk requires ${expectedVp8End} bytes but dist contains ${buffer.length}`,
  );

  invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a, 'Emitted YSP-3 Yard base has an invalid VP8 key-frame header');
  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

function readPngDimensions(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  invariant(buffer.length >= 24, 'Emitted YSP-3 foreground is too small to be a valid PNG');
  invariant(buffer.subarray(0, 8).equals(signature), 'Emitted YSP-3 foreground is not a PNG');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'IHDR', 'Emitted YSP-3 foreground has no IHDR');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function main() {
  const [base, foreground, manifestText] = await Promise.all([
    readFile(path.join(DIST_DIR, 'yard-bright-base.webp')),
    readFile(path.join(DIST_DIR, 'yard-bright-foreground.png')),
    readFile(path.join(DIST_DIR, 'yard-bright-scene.json'), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestText);
  const baseDimensions = readVp8Dimensions(base);
  const foregroundDimensions = readPngDimensions(foreground);
  const actualBaseSha256 = sha256(base);

  invariant(manifest.id === 'yard-bright-scene-v1', `Unexpected YSP-3 scene-pack ID ${manifest.id}`);
  invariant(manifest.width === WIDTH && manifest.height === HEIGHT, 'YSP-3 manifest dimensions do not match the production canvas');
  invariant(base.length === EXPECTED_BASE_BYTES, `Emitted YSP-3 base byte length is ${base.length}; expected ${EXPECTED_BASE_BYTES}`);
  invariant(actualBaseSha256 === EXPECTED_BASE_SHA256, `Emitted YSP-3 base sha256 is ${actualBaseSha256}; expected ${EXPECTED_BASE_SHA256}`);
  invariant(baseDimensions.width === WIDTH && baseDimensions.height === HEIGHT, 'Emitted YSP-3 base dimensions do not match the production canvas');
  invariant(foregroundDimensions.width === WIDTH && foregroundDimensions.height === HEIGHT, 'Emitted YSP-3 foreground dimensions do not match the production canvas');
  invariant(manifest.base?.bytes === EXPECTED_BASE_BYTES, 'YSP-3 manifest base byte length does not match the recovered approved asset');
  invariant(manifest.base?.sha256 === actualBaseSha256, 'Emitted YSP-3 base does not match its manifest hash');
  invariant(manifest.foreground?.sha256 === sha256(foreground), 'Emitted YSP-3 foreground does not match its manifest hash');

  console.log(`YSP-3 production pack verified in dist: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${actualBaseSha256}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
