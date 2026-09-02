import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src', 'assets', 'rsp3');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'rsp3');
const WRITE_OUTPUTS = process.argv.includes('--write');

const WIDTH = 1024;
const HEIGHT = 683;
const WORLD_SCALE = 3;
const WORLD_WIDTH = WIDTH * WORLD_SCALE;
const WORLD_HEIGHT = HEIGHT * WORLD_SCALE;
const CAMERA_WIDTH = 1280;
const CAMERA_HEIGHT = 720;
const GENERATION_ID = '36419539-1a20-4646-b1be-d92b04955e40';
const EXPECTED_BASE_BYTES = 120561;
const EXPECTED_BASE_SHA256 = 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c';
const BASE_CHUNKS = Array.from({ length: 22 }, (_, index) =>
  `route-bright-canonical.part${String(index).padStart(2, '0')}.txt`,
);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readJpegDimensions(buffer) {
  invariant(buffer.length >= 4, 'RSP-3 route base is too small to be a JPEG');
  invariant(buffer[0] === 0xff && buffer[1] === 0xd8, 'RSP-3 route base is not a JPEG');

  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    invariant(offset < buffer.length, 'RSP-3 route JPEG has no frame header');
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    invariant(offset < buffer.length, 'RSP-3 route JPEG has a truncated marker');

    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    invariant(offset + 2 <= buffer.length, 'RSP-3 route JPEG has a truncated segment length');
    const segmentLength = buffer.readUInt16BE(offset);
    invariant(segmentLength >= 2, 'RSP-3 route JPEG has an invalid segment length');
    invariant(offset + segmentLength <= buffer.length, 'RSP-3 route JPEG contains a truncated segment');

    if (sofMarkers.has(marker)) {
      invariant(segmentLength >= 7, 'RSP-3 route JPEG frame header is too short');
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  throw new Error('RSP-3 route JPEG has no supported SOF frame header');
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
  invariant(/^[A-Za-z0-9+/=]+$/.test(encoded), 'RSP-3 route base contains invalid base64 characters');
  const base = Buffer.from(encoded, 'base64');
  invariant(base.length === EXPECTED_BASE_BYTES,
    `RSP-3 route base byte length is ${base.length}; expected ${EXPECTED_BASE_BYTES}`);
  const actualSha256 = sha256(base);
  invariant(actualSha256 === EXPECTED_BASE_SHA256,
    `RSP-3 route base sha256 is ${actualSha256}; expected ${EXPECTED_BASE_SHA256}`);
  const dimensions = readJpegDimensions(base);
  invariant(dimensions.width === WIDTH && dimensions.height === HEIGHT,
    `RSP-3 route base dimensions are ${dimensions.width}x${dimensions.height}; expected ${WIDTH}x${HEIGHT}`);
  return base;
}

async function main() {
  const base = await loadBase();
  const foreground = transparentPng(WIDTH, HEIGHT);
  const manifest = {
    id: 'opening-route-bright-scene-v1',
    workPackage: 'RSP-3',
    sourceGenerationId: GENERATION_ID,
    selectedDirection: 'holistic hooked semi-rural biotech Bright route',
    sourceRaster: { width: WIDTH, height: HEIGHT },
    base: {
      path: '/generated/rsp3/route-bright-base.jpg',
      format: 'image/jpeg',
      bytes: base.length,
      sha256: sha256(base),
      sourceChunks: BASE_CHUNKS,
    },
    foreground: {
      path: '/generated/rsp3/route-bright-foreground.png',
      format: 'image/png',
      sha256: sha256(foreground),
      status: 'transparent-staging-layer-for-rsp6-depth-authoring',
    },
    worldMapping: {
      sourcePixelScale: WORLD_SCALE,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      cameraReference: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT },
      minimumDistinctTraversalBeats: 3,
    },
    rendering: {
      imageSmoothingEnabled: false,
      preloadRequired: true,
      exactLayerAlignmentRequired: true,
    },
    geometryPolicy: 'RSP-4 must author walkability/collision/exits against this raster; do not force legacy opening-world-v1 coordinates.',
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-base.jpg'), base);
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-foreground.png'), foreground);
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`RSP-3 route assets materialised: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}, world ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  } else {
    console.log(`RSP-3 route source validated: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}, world ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
