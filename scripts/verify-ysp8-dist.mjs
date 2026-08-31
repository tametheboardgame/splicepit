import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const WIDTH = 1280;
const HEIGHT = 720;
const EXPECTED_BYTES = 143796;
const EXPECTED_SHA256 = 'f1b47165fa50ffa5c45ac0f65dfa2b70bdd43b9f7c034b35c84a4359ccfbeb8b';
const filePath = path.join(process.cwd(), 'dist', 'generated', 'ysp8', 'yard-dark-base.webp');
const buffer = await readFile(filePath);
const actualSha = createHash('sha256').update(buffer).digest('hex');

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

invariant(buffer.length === EXPECTED_BYTES,
  `YSP-8 dist Dark Yard byte length is ${buffer.length}; expected ${EXPECTED_BYTES}`);
invariant(actualSha === EXPECTED_SHA256,
  `YSP-8 dist Dark Yard sha256 is ${actualSha}; expected ${EXPECTED_SHA256}`);
invariant(buffer.subarray(0, 4).toString('ascii') === 'RIFF', 'YSP-8 dist Dark Yard is not RIFF');
invariant(buffer.subarray(8, 12).toString('ascii') === 'WEBP', 'YSP-8 dist Dark Yard is not WebP');
invariant(buffer.subarray(12, 16).toString('ascii') === 'VP8 ', 'YSP-8 dist Dark Yard must be VP8');
invariant(buffer.readUInt32LE(4) + 8 === buffer.length, 'YSP-8 dist Dark Yard RIFF length mismatch');
const vp8Length = buffer.readUInt32LE(16);
invariant(20 + vp8Length + (vp8Length % 2) === buffer.length, 'YSP-8 dist Dark Yard VP8 payload mismatch');
invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a,
  'YSP-8 dist Dark Yard has invalid VP8 key-frame marker');
const width = buffer.readUInt16LE(26) & 0x3fff;
const height = buffer.readUInt16LE(28) & 0x3fff;
invariant(width === WIDTH && height === HEIGHT,
  `YSP-8 dist Dark Yard dimensions are ${width}x${height}; expected ${WIDTH}x${HEIGHT}`);

console.log(`YSP-8 production Dark Yard verified in dist: ${width}x${height}, ${buffer.length} bytes, sha256 ${actualSha}`);
