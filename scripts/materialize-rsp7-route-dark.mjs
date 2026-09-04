import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = resolve(ROOT, 'src/assets/rsp7/safe');
const OUTPUT_DIR = resolve(ROOT, 'public/generated/rsp7');
const OUTPUT_IMAGE = resolve(OUTPUT_DIR, 'route-dark-base.jpg');
const OUTPUT_MANIFEST = resolve(OUTPUT_DIR, 'route-dark-scene.json');
const WRITE = process.argv.includes('--write');
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 683;
const EXPECTED_BASE64_CHARACTERS = 124000;
const BRIGHT_SHA256 = 'b1a1a0bb2553eb674a3043a9a1e5a19be7f2c7b09bf52956124503c13eec482c';

const fragments = [
  'route-dark-base.part00.txt',
  'route-dark-base.part01.txt',
  'route-dark-base.part02.txt',
  'route-dark-base.part03.txt',
  'route-dark-base.part04.txt',
  'route-dark-base.tail00.txt',
  'route-dark-base.tail01.txt',
  'route-dark-base.tail02.txt',
  'route-dark-base.tail03.txt',
  'route-dark-base.tail04.txt',
  'route-dark-base.tail05a.txt',
  'route-dark-base.tail05b.txt',
  'route-dark-base.tail06a.txt',
  'route-dark-base.tail06b.txt',
  'route-dark-base.tail07a.txt',
  'route-dark-base.tail07b.txt',
  'route-dark-base.tail08a.txt',
  'route-dark-base.tail08b.txt',
  'route-dark-base.tail09a0.txt',
  'route-dark-base.tail09a1.txt',
  'route-dark-base.tail09b0.txt',
  'route-dark-base.tail09b1.txt',
  'route-dark-base.tail10.txt',
  'route-dark-base.tail11.txt',
  'route-dark-base.tail12.txt',
  'route-dark-base.tail13.txt',
  'route-dark-base.tail14.txt',
  'route-dark-base.tail15.txt',
];

function readFragment(name) {
  return readFileSync(resolve(SOURCE_DIR, name), 'utf8').replace(/\s+/g, '');
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('RSP-7 Dark Route source is not a JPEG: missing SOI marker.');
  }
  if (buffer.at(-2) !== 0xff || buffer.at(-1) !== 0xd9) {
    throw new Error('RSP-7 Dark Route source is truncated: missing EOI marker.');
  }

  let offset = 2;
  while (offset + 3 < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;

    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= buffer.length) break;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      throw new Error(`RSP-7 Dark Route source has invalid JPEG segment length at marker 0x${marker.toString(16)}.`);
    }
    const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) {
      if (segmentLength < 7) throw new Error('RSP-7 Dark Route source has malformed SOF segment.');
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  throw new Error('RSP-7 Dark Route source has no JPEG SOF dimensions.');
}

const base64 = fragments.map(readFragment).join('');
if (base64.length !== EXPECTED_BASE64_CHARACTERS) {
  throw new Error(`RSP-7 Dark Route transport has ${base64.length} Base64 characters; expected ${EXPECTED_BASE64_CHARACTERS}.`);
}
if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
  throw new Error('RSP-7 Dark Route transport is not canonical Base64.');
}

const bytes = Buffer.from(base64, 'base64');
const dimensions = jpegDimensions(bytes);
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (dimensions.width !== EXPECTED_WIDTH || dimensions.height !== EXPECTED_HEIGHT) {
  throw new Error(`RSP-7 Dark Route source is ${dimensions.width}x${dimensions.height}; expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}.`);
}
if (sha256 === BRIGHT_SHA256) {
  throw new Error('RSP-7 Dark Route source is byte-identical to the Bright Route source.');
}

const manifest = {
  id: 'opening-route-dark-scene-rsp7-v1',
  workPackage: 'RSP-7',
  source: {
    width: dimensions.width,
    height: dimensions.height,
    bytes: bytes.length,
    sha256,
    format: 'image/jpeg',
    base64Characters: base64.length,
    fragments,
  },
  world: { scale: 3, width: 3072, height: 2049 },
  alignment: 'exact-bright-route-pixel-grid',
};

if (WRITE) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_IMAGE, bytes);
  writeFileSync(OUTPUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`RSP-7 Dark Route materialisation validated: ${JSON.stringify({
  write: WRITE,
  bytes: bytes.length,
  width: dimensions.width,
  height: dimensions.height,
  sha256,
  base64Characters: base64.length,
})}`);
