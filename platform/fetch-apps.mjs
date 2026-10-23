import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'platform-source');
fs.rmSync(output,{recursive:true,force:true});
for(const [source,destination] of [['apps/voltpro-engineering-source','engineering'],['apps/pentest-source','cyber']]){
  const from=path.join(root,source),to=path.join(output,destination);
  if(!fs.existsSync(from))throw Error('Consolidated application source is missing: '+source);
  fs.cpSync(from,to,{recursive:true,filter:file=>!/(^|[\\/])(?:\.git|node_modules|build-app|dist-app)(?:[\\/]|$)/.test(file)});
}
for(const required of ['engineering/simulator.html','engineering/breadboard.html','engineering/engine/voltpro-engine.js','engineering/platform/plc-project-bank.js','engineering/apps/voltpro-plc/package-lock.json','cyber/core/build_app.py','cyber/app/index.html','cyber/master_index.json']){
  if(!fs.existsSync(path.join(output,required)))throw Error('Required consolidated source missing: '+required);
}
console.log('Prepared engineering and cybersecurity source from repository-owned apps/ folders.');
