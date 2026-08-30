import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src', 'assets', 'ysp3');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'ysp3');
const WRITE_OUTPUTS = process.argv.includes('--write');

const WIDTH = 1280;
const HEIGHT = 720;
const GENERATION_ID = '4e7d4d4d-fabd-4839-b155-15ca1b4053fe';
const EXPECTED_BASE_BYTES = 177808;
const EXPECTED_BASE_SHA256 = '6e525dd2a7e35a1beb3e397040982f750c2b2c0eac86df7264f6462830950beb';
const BASE_CHUNKS = Array.from({ length: 12 }, (_, index) =>
  `yard-bright-base-v2.part${String(index).padStart(2, '0')}.txt`,
);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readVp8Dimensions(buffer) {
  invariant(buffer.length >= 30, 'YSP-3 Yard base is too small to be a valid WebP');
  invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'YSP-3 Yard base is not RIFF');
  invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'YSP-3 Yard base is not WebP');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'YSP-3 Yard base must be a VP8 WebP');

  const declaredRiffLength = buffer.readUInt32LE(4) + 8;
  invariant(
    declaredRiffLength === buffer.length,
    `YSP-3 Yard base is truncated or malformed: RIFF declares ${declaredRiffLength} bytes but source contains ${buffer.length}`,
  );

  const vp8Length = buffer.readUInt32LE(16);
  const expectedVp8End = 20 + vp8Length + (vp8Length % 2);
  invariant(
    expectedVp8End === buffer.length,
    `YSP-3 Yard VP8 payload is incomplete: chunk requires ${expectedVp8End} bytes but source contains ${buffer.length}`,
  );

  invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a, 'YSP-3 Yard base has an invalid VP8 key-frame header');
  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function transparentPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowBytes = width * 4 + 1;
  const raw = Buffer.alloc(rowBytes * height);
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function loadBase() {
  const encodedParts = await Promise.all(
    BASE_CHUNKS.map(async (name) => (await readFile(path.join(SOURCE_DIR, name), 'utf8')).trim()),
  );
  const encoded = encodedParts.join('');
  invariant(/^[A-Za-z0-9+/=]+$/.test(encoded), 'YSP-3 Yard base contains invalid base64 characters');
  const buffer = Buffer.from(encoded, 'base64');

  invariant(
    buffer.length === EXPECTED_BASE_BYTES,
    `YSP-3 Yard base byte length is ${buffer.length}; expected ${EXPECTED_BASE_BYTES}`,
  );
  const actualSha256 = sha256(buffer);
  invariant(
    actualSha256 === EXPECTED_BASE_SHA256,
    `YSP-3 Yard base sha256 is ${actualSha256}; expected ${EXPECTED_BASE_SHA256}`,
  );

  const dimensions = readVp8Dimensions(buffer);
  invariant(dimensions.width === WIDTH && dimensions.height === HEIGHT,
    `YSP-3 Yard base dimensions are ${dimensions.width}x${dimensions.height}; expected ${WIDTH}x${HEIGHT}`);
  return buffer;
}

async function main() {
  const base = await loadBase();
  const foreground = transparentPng(WIDTH, HEIGHT);
  const manifest = {
    id: 'yard-bright-scene-v1',
    workPackage: 'YSP-3',
    sourceGenerationId: GENERATION_ID,
    sourceDirection: 'open-centre Yard',
    sourceRecovery: 'user-supplied approved Bright Yard master, 30 August 2026',
    width: WIDTH,
    height: HEIGHT,
    base: {
      path: '/generated/ysp3/yard-bright-base.webp',
      format: 'image/webp',
      bytes: base.length,
      sha256: sha256(base),
      sourceChunks: BASE_CHUNKS,
    },
    foreground: {
      path: '/generated/ysp3/yard-bright-foreground.png',
      format: 'image/png',
      sha256: sha256(foreground),
      status: 'transparent-staging-layer-for-ysp6-depth-authoring',
    },
    rendering: {
      imageSmoothingEnabled: false,
      preloadRequired: true,
      exactLayerAlignmentRequired: true,
    },
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'yard-bright-base.webp'), base);
    await writeFile(path.join(OUTPUT_DIR, 'yard-bright-foreground.png'), foreground);
    await writeFile(path.join(OUTPUT_DIR, 'yard-bright-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`YSP-3 Yard assets materialised: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}`);
  } else {
    console.log(`YSP-3 Yard source validated: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
