import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.name.endsWith('.js'))files.push(file);}}
for(const name of ['js','cyber-os','apps/terminal','apps/admin','packages/shared-ui/js','packages/shared-i18n'])walk(path.join(root,name));
let failed=false;
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0){failed=true;console.error(result.stderr);}}
console.log(`Checked ${files.length} browser scripts.`);
if(failed)process.exitCode=1;
