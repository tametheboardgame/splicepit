import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src/domain', 'src/systems', 'src/random', 'src/runtime'];
const explicitFiles = ['src/scenes/BattleScene.ts', 'src/scenes/SpliceScene.ts'];
const files = [];

function walk(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry));
    return;
  }
  if (path.endsWith('.ts')) files.push(path);
}

for (const root of roots) walk(root);
files.push(...explicitFiles);

const violations = [];
for (const file of [...new Set(files)].sort()) {
  const source = readFileSync(file, 'utf8');
  if (/\bMath\.random\s*\(/u.test(source)) violations.push(file);
}

if (violations.length) {
  console.error('Uncontrolled Math.random() is forbidden in core stochastic code:');
  for (const file of violations) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`RNG boundary OK: ${new Set(files).size} core files contain no direct Math.random() calls`);
