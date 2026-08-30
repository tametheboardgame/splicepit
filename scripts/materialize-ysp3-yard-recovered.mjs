import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceDir = path.join(process.cwd(), 'src', 'assets', 'ysp3');
const segmentA = await readFile(path.join(sourceDir, 'yard-bright-base-v2.part06a.txt'), 'utf8');
const segmentB = await readFile(path.join(sourceDir, 'yard-bright-base-v2.part06b.txt'), 'utf8');

await writeFile(
  path.join(sourceDir, 'yard-bright-base-v2.part06.txt'),
  `${segmentA.trim()}${segmentB.trim()}`,
  'utf8',
);

await import('./materialize-ysp3-yard.mjs');
