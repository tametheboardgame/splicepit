import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src', 'assets', 'ysp8', 'safe');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'ysp8');
const WRITE_OUTPUTS = process.argv.includes('--write');

const WIDTH = 1280;
const HEIGHT = 720;
const EXPECTED_BYTES = 143796;
const EXPECTED_SHA256 = 'f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b';
const EXPECTED_BASE64_CHARS = 191728;
const SOURCE_CHUNKS = [
  'yard-dark-base.part00.txt',
  'yard-dark-base.part01.txt',
  'yard-dark-base.part02.txt',
  ...Array.from({ length: 13 }, (_, index) => `yard-dark-base.part${String(index + 3).padStart(2, '0')}.txt`),
  'yard-dark-base.part16a.txt',
  'yard-dark-base.part16b.txt',
  'yard-dark-base.part17.txt',
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateWebp(buffer) {
  invariant(buffer.length >= 30, 'YSP-8 Dark Yard is too small to be a valid WebP');
  invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'YSP-8 Dark Yard is not RIFF');
  invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'YSP-8 Dark Yard is not WebP');
  invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'YSP-8 Dark Yard must be a VP8 WebP');

  const riffLength = buffer.readUInt32LE(4) + 8;
  invariant(
    riffLength === buffer.length,
    `YSP-8 Dark Yard is truncated or malformed: RIFF declares ${riffLength} bytes but source contains ${buffer.length}`,
  );

  const vp8Length = buffer.readUInt32LE(16);
  const vp8End = 20 + vp8Length + (vp8Length % 2);
  invariant(
    vp8End === buffer.length,
    `YSP-8 Dark Yard VP8 payload is incomplete: chunk requires ${vp8End} bytes but source contains ${buffer.length}`,
  );
  invariant(
    buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a,
    'YSP-8 Dark Yard has an invalid VP8 key-frame header',
  );

  const width = buffer.readUInt16LE(26) & 0x3fff;
  const height = buffer.readUInt16LE(28) & 0x3fff;
  invariant(width === WIDTH && height === HEIGHT,
    `YSP-8 Dark Yard dimensions are ${width}x${height}; expected ${WIDTH}x${HEIGHT}`);
}

async function loadSourcePart(name) {
  const raw = (await readFile(path.join(SOURCE_DIR, name), 'utf8')).trim();
  invariant(/^[A-Za-z0-9+/=]+$/.test(raw), `YSP-8 source ${name} contains invalid base64 characters`);

  // The GitHub text transport appended an unrelated tail to part15 during authoring.
  // The first 12,000 characters are the locked source segment; the final whole-file
  // byte count + SHA-256 below remain the authority, so an incorrect prefix cannot pass.
  if (name === 'yard-dark-base.part15.txt') {
    invariant(raw.length >= 12000, `YSP-8 source ${name} is too short: ${raw.length}`);
    return raw.slice(0, 12000);
  }

  return raw;
}

async function loadDarkBase() {
  const encodedParts = await Promise.all(SOURCE_CHUNKS.map(loadSourcePart));
  const encoded = encodedParts.join('');
  invariant(encoded.length === EXPECTED_BASE64_CHARS,
    `YSP-8 Dark Yard base64 length is ${encoded.length}; expected ${EXPECTED_BASE64_CHARS}`);
  const buffer = Buffer.from(encoded, 'base64');
  invariant(buffer.length === EXPECTED_BYTES,
    `YSP-8 Dark Yard byte length is ${buffer.length}; expected ${EXPECTED_BYTES}`);
  const actualSha = sha256(buffer);
  invariant(actualSha === EXPECTED_SHA256,
    `YSP-8 Dark Yard sha256 is ${actualSha}; expected ${EXPECTED_SHA256}`);
  validateWebp(buffer);
  return buffer;
}

async function main() {
  const darkBase = await loadDarkBase();
  const manifest = {
    id: 'yard-dark-scene-ysp8-v1',
    workPackage: 'YSP-8',
    source: 'user-approved authored Dark Yard counterpart, 31 August 2026',
    width: WIDTH,
    height: HEIGHT,
    base: {
      path: '/generated/ysp8/yard-dark-base.webp',
      format: 'image/webp',
      bytes: darkBase.length,
      sha256: sha256(darkBase),
      sourceChunks: SOURCE_CHUNKS,
    },
    alignment: {
      brightScenePack: 'yard-bright-scene-ysp6-v1',
      collisionShared: true,
      anchorsShared: true,
      foregroundRegionsShared: true,
    },
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'yard-dark-base.webp'), darkBase);
    await writeFile(path.join(OUTPUT_DIR, 'yard-dark-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`YSP-8 Dark Yard materialised: ${WIDTH}x${HEIGHT}, ${darkBase.length} bytes, sha256 ${manifest.base.sha256}`);
  } else {
    console.log(`YSP-8 Dark Yard source validated: ${WIDTH}x${HEIGHT}, ${darkBase.length} bytes, sha256 ${manifest.base.sha256}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
