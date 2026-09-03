import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'src', 'assets', 'rsp7a');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generated', 'rsp7a');
const WRITE_OUTPUTS = process.argv.includes('--write');

const WIDTH = 1024;
const HEIGHT = 683;
const WORLD_SCALE = 3;
const WORLD_WIDTH = WIDTH * WORLD_SCALE;
const WORLD_HEIGHT = HEIGHT * WORLD_SCALE;

const ASSETS = {
  bright: {
    sourceMaster: {
      width: 1535,
      height: 1024,
      bytes: 4419010,
      sha256: 'e75b3126a657f2b97f59e5a55fdb6077f4b49b3fa3c424d8ab8a4808812d1221',
    },
    production: {
      bytes: 392486,
      sha256: '7fc4f974507a2843ed08e50a6c151e9ee56b47631914b417ec73d0efecb958b6',
      file: 'route-bright-base.webp',
      chunkPrefix: 'route-bright-approved.part',
      chunkCount: 33,
    },
  },
  dark: {
    sourceMaster: {
      width: 1448,
      height: 1086,
      bytes: 3486931,
      sha256: 'a3ace884ddaa63b25113ca467fc35e8d1c3067a074b6f4da52af08c89fda18ef',
    },
    production: {
      bytes: 334852,
      sha256: '3aaa862f2e641831afbce9f9dc07d9a280e1aad7b7d30b096e3d2c70cf6d2554',
      file: 'route-dark-base.webp',
      chunkPrefix: 'route-dark-approved.part',
      chunkCount: 28,
    },
  },
};

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readWebpDimensions(buffer) {
  invariant(buffer.length >= 30, 'RSP-7A asset is too small to be WebP');
  invariant(buffer.toString('ascii', 0, 4) === 'RIFF', 'RSP-7A asset has no RIFF header');
  invariant(buffer.toString('ascii', 8, 12) === 'WEBP', 'RSP-7A asset has no WEBP signature');
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    invariant(buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a, 'RSP-7A VP8 frame header is invalid');
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  throw new Error(`Unsupported RSP-7A WebP chunk '${chunk}'`);
}

async function loadAsset(state) {
  const spec = ASSETS[state].production;
  const encodedParts = await Promise.all(
    Array.from({ length: spec.chunkCount }, async (_, index) => {
      const name = `${spec.chunkPrefix}${String(index).padStart(2, '0')}.txt`;
      return (await readFile(path.join(SOURCE_DIR, name), 'utf8')).trim();
    }),
  );
  const encoded = encodedParts.join('');
  invariant(/^[A-Za-z0-9+/=]+$/.test(encoded), `RSP-7A ${state} source contains invalid base64 characters`);
  const buffer = Buffer.from(encoded, 'base64');
  invariant(buffer.length === spec.bytes,
    `RSP-7A ${state} bytes are ${buffer.length}; expected ${spec.bytes}`);
  const actualSha = sha256(buffer);
  invariant(actualSha === spec.sha256,
    `RSP-7A ${state} sha256 is ${actualSha}; expected ${spec.sha256}`);
  const dimensions = readWebpDimensions(buffer);
  invariant(dimensions.width === WIDTH && dimensions.height === HEIGHT,
    `RSP-7A ${state} dimensions are ${dimensions.width}x${dimensions.height}; expected ${WIDTH}x${HEIGHT}`);
  return buffer;
}

async function main() {
  const [bright, dark] = await Promise.all([loadAsset('bright'), loadAsset('dark')]);
  const manifest = {
    id: 'opening-route-approved-pair-rsp7a-v1',
    workPackage: 'RSP-7A',
    approvedOn: '2026-09-03',
    sourceMasters: {
      bright: ASSETS.bright.sourceMaster,
      dark: ASSETS.dark.sourceMaster,
    },
    production: {
      width: WIDTH,
      height: HEIGHT,
      worldScale: WORLD_SCALE,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      bright: {
        path: '/generated/rsp7a/route-bright-base.webp',
        bytes: bright.length,
        sha256: sha256(bright),
      },
      dark: {
        path: '/generated/rsp7a/route-dark-base.webp',
        bytes: dark.length,
        sha256: sha256(dark),
      },
    },
    parityPolicy: 'Bright is geometry authority. Dark is normalised to the identical production canvas; collision, semantic anchors, exits and camera geometry are shared.',
    rendererCutover: 'Deferred to RSP-7B.',
  };

  if (WRITE_OUTPUTS) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, ASSETS.bright.production.file), bright);
    await writeFile(path.join(OUTPUT_DIR, ASSETS.dark.production.file), dark);
    await writeFile(path.join(OUTPUT_DIR, 'route-approved-scene.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`RSP-7A route pair materialised: ${WIDTH}x${HEIGHT}, world ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  } else {
    console.log(`RSP-7A route pair validated: Bright ${bright.length} bytes, Dark ${dark.length} bytes, ${WIDTH}x${HEIGHT}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
