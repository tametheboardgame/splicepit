import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'dist', 'generated', 'rsp7a');

const expected = [
  ['route-bright-base.webp', 392486, '7fc4f974507a2843ed08e50a6c151e9ee56b47631914b417ec73d0efecb958b6'],
  ['route-dark-base.webp', 334852, '3aaa862f2e641831afbce9f9dc07d9a280e1aad7b7d30b096e3d2c70cf6d2554'],
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

for (const [name, bytes, hash] of expected) {
  const buffer = await readFile(path.join(DIR, name));
  if (buffer.length !== bytes) throw new Error(`${name} dist bytes ${buffer.length}; expected ${bytes}`);
  const actual = sha256(buffer);
  if (actual !== hash) throw new Error(`${name} dist sha256 ${actual}; expected ${hash}`);
}

const manifest = JSON.parse(await readFile(path.join(DIR, 'route-approved-scene.json'), 'utf8'));
if (manifest.production?.width !== 1024 || manifest.production?.height !== 683) {
  throw new Error(`RSP-7A manifest dimensions mismatch: ${JSON.stringify(manifest.production)}`);
}
if (manifest.production?.worldWidth !== 3072 || manifest.production?.worldHeight !== 2049) {
  throw new Error(`RSP-7A manifest world mismatch: ${JSON.stringify(manifest.production)}`);
}
console.log('RSP-7A dist verification passed: approved Bright/Dark pair intact.');
