import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const parts = [];

for (let index = 0; index < 5; index += 1) {
  const source = await readFile(resolve(root, `src/ui/titleSplashPart${index}.ts`), 'utf8');
  const match = source.match(/= '([^']+)';/s);
  if (!match?.[1]) throw new Error(`Unable to read title splash part ${index}`);
  parts.push(match[1]);
}

let bytes = Buffer.from(parts.join(''), 'base64');
if (bytes.length < 50_000) throw new Error(`Happy title splash is unexpectedly small: ${bytes.length} bytes`);
if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('Happy title splash is not a valid WebP payload');
}

const declaredLength = bytes.readUInt32LE(4) + 8;
if (bytes.length === declaredLength - 1) {
  bytes = Buffer.concat([bytes, Buffer.from([0])]);
}
if (bytes.length !== declaredLength) {
  throw new Error(
    `Happy title splash RIFF length mismatch: declared ${declaredLength}, reconstructed ${bytes.length}`,
  );
}

const output = resolve(root, 'public/assets/splicepit-happy-title-v3.webp');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
console.log(`Materialised approved happy title splash v3 (${bytes.length} bytes).`);
