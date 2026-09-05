import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE_PATH = path.join(ROOT, 'src', 'assets', 'lpsp3', 'local-pit-bright-base64.txt');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'lpsp3');
const WRITE_OUTPUTS = process.argv.includes('--write');

const WIDTH = 1024;
const HEIGHT = 683;
const WORLD_SCALE = 3;
const WORLD_WIDTH = WIDTH * WORLD_SCALE;
const WORLD_HEIGHT = HEIGHT * WORLD_SCALE;
const CAMERA_WIDTH = 1280;
const CAMERA_HEIGHT = 720;
const GENERATION_ID = '29a7292d-3e04-45ce-9cb9-62d68c458eea';
const SOURCE_MASTER_WIDTH = 1536;
const SOURCE_MASTER_HEIGHT = 1024;
const SOURCE_MASTER_BYTES = 4193815;
const SOURCE_MASTER_SHA256 = '751b46842e0630a5cba646f13f5e170a8aae81ee94b21b6f119f32ad014dc6ce';
const EXPECTED_BASE_BYTES = 250783;
const EXPECTED_BASE_SHA256 = 'ee9fe9b78c0165131abb3e014177e39cc52d7c5595266fefb10f3ee9092d8b81';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readJpegDimensions(buffer) {
  invariant(buffer.length >= 4, 'LPSP-3 Pit base is too small to be a JPEG');
  invariant(buffer[0] === 0xff && buffer[1] === 0xd8, 'LPSP-3 Pit base is not a JPEG');
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    invariant(offset < buffer.length, 'LPSP-3 Pit JPEG has no frame header');
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    invariant(offset < buffer.length, 'LPSP-3 Pit JPEG has a truncated marker');
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    invariant(offset + 2 <= buffer.length, 'LPSP-3 Pit JPEG has a truncated segment length');
    const segmentLength = buffer.readUInt16BE(offset);
    invariant(segmentLength >= 2, 'LPSP-3 Pit JPEG has an invalid segment length');
    invariant(offset + segmentLength <= buffer.length, 'LPSP-3 Pit JPEG contains a truncated segment');
    if (sofMarkers.has(marker)) {
      invariant(segmentLength >= 7, 'LPSP-3 Pit JPEG frame header is too short');
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += segmentLength;
  }
  throw new Error('LPSP-3 Pit JPEG has no supported SOF frame header');
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
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
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([signature, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', Buffer.alloc(0))]);
}

async function loadBase() {
  const encoded = (await readFile(SOURCE_PATH, 'utf8')).trim();
  invariant(/^[A-Za-z0-9+/=]+$/.test(encoded), 'LPSP-3 Pit base contains invalid base64 characters');
  const base = Buffer.from(encoded, 'base64');
  invariant(base.length === EXPECTED_BASE_BYTES,
    `LPSP-3 Pit base byte length is ${base.length}; expected ${EXPECTED_BASE_BYTES}`);
  const actualSha256 = sha256(base);
  invariant(actualSha256 === EXPECTED_BASE_SHA256,
    `LPSP-3 Pit base sha256 is ${actualSha256}; expected ${EXPECTED_BASE_SHA256}`);
  const dimensions = readJpegDimensions(base);
  invariant(dimensions.width === WIDTH && dimensions.height === HEIGHT,
    `LPSP-3 Pit base dimensions are ${dimensions.width}x${dimensions.height}; expected ${WIDTH}x${HEIGHT}`);
  return base;
}

async function main() {
  const base = await loadBase();
  const foreground = transparentPng(WIDTH, HEIGHT);
  const manifest = {
    id: 'local-pit-bright-scene-v1',
    workPackage: 'LPSP-3',
    sourceGenerationId: GENERATION_ID,
    selectedDirection: 'daytime holistic Bramble Pit livestock-market/fairground fight venue',
    sourceMaster: {
      width: SOURCE_MASTER_WIDTH,
      height: SOURCE_MASTER_HEIGHT,
      bytes: SOURCE_MASTER_BYTES,
      sha256: SOURCE_MASTER_SHA256,
    },
    productionRecipe: {
      resize: `${SOURCE_MASTER_WIDTH}x${SOURCE_MASTER_HEIGHT} -> ${WIDTH}x${HEIGHT}`,
      resampler: 'Pillow 12.3.0 LANCZOS',
      format: 'JPEG',
      quality: 75,
      subsampling: 2,
      optimize: true,
      progressive: false,
    },
    base: {
      sourcePath: 'src/assets/lpsp3/local-pit-bright-base64.txt',
      path: '/generated/lpsp3/local-pit-bright-base.jpg',
      format: 'image/jpeg',
      bytes: base.length,
      sha256: sha256(base),
    },
    foreground: {
      path: '/generated/lpsp3/local-pit-bright-foreground.png',
      format: 'image/png',
      sha256: sha256(foreground),
      status: 'transparent-staging-layer-for-lpsp6-depth-authoring',
    },
    worldMapping: {
      sourcePixelScale: WORLD_SCALE,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      cameraReference: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT },
      minimumDistinctTraversalBeats: 4,
      battleSpacePolicy: 'tutorial battle must frame the same authored pit-battle-floor used by exploration',
    },
    rendering: {
      imageSmoothingEnabled: false,
      preloadRequired: true,
      exactLayerAlignmentRequired: true,
    },
    geometryPolicy: 'LPSP-4 must author walkability, collision, semantic anchors and battle boundaries against this raster; do not preserve local-pit-v1 coordinates.',
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'local-pit-bright-base.jpg'), base);
    await writeFile(path.join(OUTPUT_DIR, 'local-pit-bright-foreground.png'), foreground);
    await writeFile(path.join(OUTPUT_DIR, 'local-pit-bright-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`LPSP-3 Pit assets materialised: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}, world ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  } else {
    console.log(`LPSP-3 Pit source validated: ${WIDTH}x${HEIGHT}, ${base.length} bytes, base sha256 ${manifest.base.sha256}, world ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
