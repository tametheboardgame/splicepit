import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true}); const files=[];
  for(const e of entries){ const p=join(dir,e.name); if(e.isDirectory()) files.push(...await walk(p)); else if(e.name.endsWith('.js')||e.name.endsWith('.mjs')) files.push(p); }
  return files;
}
const files=[...await walk('src'),...await walk('tests'),...await walk('scripts')];
let failed=false;
for(const file of files){ const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'}); if(r.status!==0) failed=true; }
if(failed) process.exit(1);
console.log(`Syntax OK: ${files.length} files`);
