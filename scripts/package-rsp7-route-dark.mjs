import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'src', 'assets', 'rsp7', 'safe');
const WIDTH = 1024;
const HEIGHT = 683;
const CHUNK_SIZE = 12000;
const BRIGHT_SHA256 = 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c';
const MANIFEST_NAME = 'route-dark-base.manifest.json';
const PART_PREFIX = 'route-dark-base.part';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readJpegDimensions(buffer) {
  invariant(buffer.length >= 4, 'RSP-7 Dark Route is too small to be a JPEG');
  invariant(buffer[0] === 0xff && buffer[1] === 0xd8, 'RSP-7 Dark Route must be a JPEG');

  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    invariant(offset < buffer.length, 'RSP-7 Dark Route JPEG has no frame header');
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    invariant(offset < buffer.length, 'RSP-7 Dark Route JPEG has a truncated marker');

    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    invariant(offset + 2 <= buffer.length, 'RSP-7 Dark Route JPEG has a truncated segment length');
    const segmentLength = buffer.readUInt16BE(offset);
    invariant(segmentLength >= 2, 'RSP-7 Dark Route JPEG has an invalid segment length');
    invariant(offset + segmentLength <= buffer.length, 'RSP-7 Dark Route JPEG contains a truncated segment');

    if (sofMarkers.has(marker)) {
      invariant(segmentLength >= 7, 'RSP-7 Dark Route JPEG frame header is too short');
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  throw new Error('RSP-7 Dark Route JPEG has no supported SOF frame header');
}

function chunkBase64(encoded) {
  const chunks = [];
  for (let offset = 0; offset < encoded.length; offset += CHUNK_SIZE) {
    chunks.push(encoded.slice(offset, offset + CHUNK_SIZE));
  }
  return chunks;
}

async function clearPreviousPackage() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const entries = await readdir(OUTPUT_DIR);
  await Promise.all(entries.map(async (name) => {
    if (name === MANIFEST_NAME || (name.startsWith(PART_PREFIX) && name.endsWith('.txt'))) {
      await rm(path.join(OUTPUT_DIR, name), { force: true });
    }
  }));
}

async function main() {
  const input = process.argv[2];
  invariant(input, 'Usage: npm run package:rsp7-dark -- <path-to-approved-1024x683-dark-route.jpg>');

  const inputPath = path.resolve(ROOT, input);
  const darkBase = await readFile(inputPath);
  const dimensions = readJpegDimensions(darkBase);
  invariant(
    dimensions.width === WIDTH && dimensions.height === HEIGHT,
    `RSP-7 Dark Route dimensions are ${dimensions.width}x${dimensions.height}; expected ${WIDTH}x${HEIGHT}`,
  );

  const darkSha256 = sha256(darkBase);
  invariant(
    darkSha256 !== BRIGHT_SHA256,
    'RSP-7 Dark Route matches the locked Bright Route byte-for-byte; refusing to package Bright as Dark',
  );

  const encoded = darkBase.toString('base64');
  const chunks = chunkBase64(encoded);
  const sourceChunks = chunks.map((_, index) => `${PART_PREFIX}${String(index).padStart(2, '0')}.txt`);

  await clearPreviousPackage();
  await Promise.all(chunks.map((chunk, index) =>
    writeFile(path.join(OUTPUT_DIR, sourceChunks[index]), `${chunk}\n`, 'utf8')));

  const manifest = {
    id: 'opening-route-dark-scene-rsp7-v1',
    workPackage: 'RSP-7',
    source: 'approved source-bound Dark counterpart of the locked RSP-3 Bright Route',
    format: 'image/jpeg',
    width: WIDTH,
    height: HEIGHT,
    bytes: darkBase.length,
    sha256: darkSha256,
    base64Chars: encoded.length,
    chunkSize: CHUNK_SIZE,
    sourceChunks,
    alignment: {
      brightSha256: BRIGHT_SHA256,
      brightScenePack: 'opening-route-bright-rsp6-v1',
      collisionShared: true,
      anchorsShared: true,
      foregroundRegionsShared: true,
    },
  };

  await writeFile(path.join(OUTPUT_DIR, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `RSP-7 Dark Route packaged: ${WIDTH}x${HEIGHT}, ${darkBase.length} bytes, sha256 ${darkSha256}, ${sourceChunks.length} canonical chunks`,
  );
  console.log(`Canonical source: ${path.relative(ROOT, OUTPUT_DIR)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
