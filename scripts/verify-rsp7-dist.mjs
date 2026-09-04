import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'public/generated/rsp7/route-dark-scene.json'), 'utf8'));
const distBytes = readFileSync(resolve(process.cwd(), 'dist/generated/rsp7/route-dark-base.jpg'));
const distSha256 = createHash('sha256').update(distBytes).digest('hex');

if (distBytes.length !== manifest.source.bytes) {
  throw new Error(`RSP-7 dist Dark Route has ${distBytes.length} bytes; expected ${manifest.source.bytes}.`);
}
if (distSha256 !== manifest.source.sha256) {
  throw new Error(`RSP-7 dist Dark Route SHA-256 mismatch: ${distSha256} !== ${manifest.source.sha256}.`);
}

console.log(`RSP-7 dist Dark Route verified: ${distBytes.length} bytes, SHA-256 ${distSha256}`);
