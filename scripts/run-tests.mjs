import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const output = '.test-dist';
rmSync(output, { recursive: true, force: true });

const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const compile = spawnSync(tsc, ['-p', 'tsconfig.test.json'], { stdio: 'inherit', shell: false });
if (compile.status !== 0) process.exit(compile.status ?? 1);

const testDir = join(output, 'tests');
mkdirSync(testDir, { recursive: true });
for (const file of readdirSync('tests').filter((name) => name.endsWith('.test.mjs'))) {
  copyFileSync(join('tests', file), join(testDir, file));
}

const run = spawnSync(process.execPath, ['--test', `${testDir}/*.test.mjs`], { stdio: 'inherit', shell: true });
rmSync(output, { recursive: true, force: true });
process.exit(run.status ?? 1);
