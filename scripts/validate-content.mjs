import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const output = '.content-dist';
rmSync(output, { recursive: true, force: true });

const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const compile = spawnSync(tsc, ['-p', 'tsconfig.test.json', '--outDir', output], { stdio: 'inherit', shell: false });
if (compile.status !== 0) process.exit(compile.status ?? 1);

const validate = spawnSync(process.execPath, [`${output}/src/content/validateContentCli.js`], { stdio: 'inherit', shell: false });
rmSync(output, { recursive: true, force: true });
process.exit(validate.status ?? 1);
