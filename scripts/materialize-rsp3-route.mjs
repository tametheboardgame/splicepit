import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, 'src', 'assets', 'rsp3', 'route-bright-base-v1.base64.txt');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'rsp3');
const WRITE_OUTPUTS = process.argv.includes('--write');

const SOURCE_WIDTH = 1536;
const SOURCE_HEIGHT = 1024;
const WORLD_SCALE = 1.5;
const WORLD_WIDTH = 2304;
const WORLD_HEIGHT = 1536;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const GENERATION_ID = '36419539-1a20-4646-b1be-d92b04955e40';
const SOURCE_PNG_SHA256 = '7ecfd2078efec161133671f09dbdfa2f9deb52fffc30bae06f64a4078e0c5ad5';
const EXPECTED_BASE_BYTES = 582212;
const EXPECTED_BASE_SHA256 = '786726d57a260597ae771e3417e811a9705262cd4367e8027cda82da3c809574';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readVp8Dimensions(buffer) {
  invariant(buffer.length >= 30, 'RSP-3 Route base is too small to be a valid WebP');
  invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'RSP-3 Route base is not RIFF');
  invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'RSP-3 Route base is not WebP');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'RSP-3 Route base must be a VP8 WebP');

  const declaredRiffLength = buffer.readUInt32LE(4) + 8;
  invariant(
    declaredRiffLength === buffer.length,
    `RSP-3 Route base is truncated or malformed: RIFF declares ${declaredRiffLength} bytes but source contains ${buffer.length}`,
  );

  const vp8Length = buffer.readUInt32LE(16);
  const expectedVp8End = 20 + vp8Length + (vp8Length % 2);
  invariant(
    expectedVp8End === buffer.length,
    `RSP-3 Route VP8 payload is incomplete: chunk requires ${expectedVp8End} bytes but source contains ${buffer.length}`,
  );

  invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a, 'RSP-3 Route base has an invalid VP8 key-frame header');
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
  const encoded = (await readFile(SOURCE_FILE, 'utf8')).trim();
  invariant(/^[A-Za-z0-9+/=]+$/.test(encoded), 'RSP-3 Route base contains invalid base64 characters');
  const buffer = Buffer.from(encoded, 'base64');
  invariant(buffer.length === EXPECTED_BASE_BYTES, `RSP-3 Route base byte length is ${buffer.length}; expected ${EXPECTED_BASE_BYTES}`);
  const actualSha256 = sha256(buffer);
  invariant(actualSha256 === EXPECTED_BASE_SHA256, `RSP-3 Route base sha256 is ${actualSha256}; expected ${EXPECTED_BASE_SHA256}`);
  const dimensions = readVp8Dimensions(buffer);
  invariant(
    dimensions.width === SOURCE_WIDTH && dimensions.height === SOURCE_HEIGHT,
    `RSP-3 Route base dimensions are ${dimensions.width}x${dimensions.height}; expected ${SOURCE_WIDTH}x${SOURCE_HEIGHT}`,
  );
  return buffer;
}

async function main() {
  const base = await loadBase();
  const foreground = transparentPng(SOURCE_WIDTH, SOURCE_HEIGHT);
  const manifest = {
    id: 'opening-route-bright-scene-rsp3-v1',
    workPackage: 'RSP-3',
    sourceGenerationId: GENERATION_ID,
    sourceComposition: 'integrated hooked-service-route master',
    selectedSourcePngSha256: SOURCE_PNG_SHA256,
    source: {
      width: SOURCE_WIDTH,
      height: SOURCE_HEIGHT,
      scale: WORLD_SCALE,
      format: 'image/webp',
      bytes: base.length,
      sha256: sha256(base),
      transport: 'src/assets/rsp3/route-bright-base-v1.base64.txt',
    },
    world: {
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      cameraTravelX: WORLD_WIDTH - VIEWPORT_WIDTH,
      cameraTravelY: WORLD_HEIGHT - VIEWPORT_HEIGHT,
    },
    assets: {
      base: '/generated/rsp3/route-bright-base.webp',
      foreground: '/generated/rsp3/route-bright-foreground.png',
      manifest: '/generated/rsp3/route-bright-scene.json',
    },
    foreground: {
      status: 'transparent-staging-layer-for-rsp6-depth-authoring',
      sha256: sha256(foreground),
    },
    rendering: {
      imageSmoothingEnabled: false,
      preloadRequired: true,
      exactLayerAlignmentRequired: true,
      runtimeActivationDeferredUntil: 'RSP-7',
    },
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-base.webp'), base);
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-foreground.png'), foreground);
    await writeFile(path.join(OUTPUT_DIR, 'route-bright-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`RSP-3 Route assets materialised: ${SOURCE_WIDTH}x${SOURCE_HEIGHT} @ ${WORLD_SCALE}x => ${WORLD_WIDTH}x${WORLD_HEIGHT}, ${base.length} bytes, sha256 ${manifest.source.sha256}`);
  } else {
    console.log(`RSP-3 Route source validated: ${SOURCE_WIDTH}x${SOURCE_HEIGHT}, ${base.length} bytes, sha256 ${manifest.source.sha256}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
