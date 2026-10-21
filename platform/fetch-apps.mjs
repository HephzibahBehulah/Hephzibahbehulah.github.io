import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'platform/source-lock.json'),'utf8'));
const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'voltpro-pinned-apps-'));
const run=(command,args,cwd)=>execFileSync(command,args,{cwd,stdio:'inherit',env:process.env});
const checkout=(name,entry)=>{
 if(!entry||!/^[-A-Za-z0-9_.]+\/[A-Za-z0-9_.-]+$/.test(entry.repository)||!/^[a-f0-9]{40}$/.test(entry.commit))throw Error('Invalid pinned source entry: '+name);
 const destination=path.join(workspace,name);
 run('git',['clone','--filter=blob:none','--no-checkout','https://github.com/'+entry.repository+'.git',destination],root);
 run('git',['fetch','--depth','1','origin',entry.commit],destination);
 run('git',['checkout','--detach',entry.commit],destination);
 const actual=execFileSync('git',['rev-parse','HEAD'],{cwd:destination,encoding:'utf8'}).trim();
 if(actual!==entry.commit)throw Error('Source checkout does not match pinned commit for '+name+': '+actual);
 if(execFileSync('git',['status','--porcelain'],{cwd:destination,encoding:'utf8'}).trim())throw Error('Pinned source checkout is unexpectedly dirty: '+name);
 return destination;
};
const excluded=new Set(['.git','.github','node_modules','apps','tests','scripts','docs','server','build-app','dist-app','dist-platform','platform-source','.cache','.venv','__pycache__']);
const extensions=new Set(['.html','.css','.js','.mjs','.json','.csv','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ttf','.webmanifest','.wasm','.zip','.py','.txt']);
function copyBrowserTree(source,destination){
 fs.mkdirSync(destination,{recursive:true});
 for(const entry of fs.readdirSync(source,{withFileTypes:true})){
  if(entry.isDirectory()&&excluded.has(entry.name))continue;
  const from=path.join(source,entry.name),to=path.join(destination,entry.name);
  if(entry.isDirectory()){copyBrowserTree(from,to);continue;}
  const ext=path.extname(entry.name).toLowerCase();
  if(!extensions.has(ext)||['.py','.zip'].includes(ext)||/^worker.*\.[cm]?js$/i.test(entry.name))continue;
  fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);
 }
 for(const name of ['LICENSE','THIRD_PARTY_LICENSES.md','ASSET_ATTRIBUTIONS.md']){
  const from=path.join(source,name);if(fs.existsSync(from))fs.copyFileSync(from,path.join(destination,name));
 }
}
try{
 const engineeringSource=checkout('engineering',lock.engineering);
 const plc=path.join(engineeringSource,'apps/voltpro-plc');
 if(!fs.existsSync(path.join(plc,'package-lock.json')))throw Error('Pinned engineering source is missing the PLC package lock.');
 run('npm',['ci'],plc);
 run('npm',['test'],plc);
 run('npm',['run','build'],plc);
 const engineeringOut=path.join(root,'platform-source/engineering');
 fs.rmSync(engineeringOut,{recursive:true,force:true});
 copyBrowserTree(engineeringSource,engineeringOut);
 for(const required of ['simulator.html','breadboard.html','platform/account-config.js','platform/account-client.js','platform/cloud-projects.js','voltpro-plc/index.html','voltpro-plc/assets/index-DSp8g4IS.js']){
  if(!fs.existsSync(path.join(engineeringOut,required)))throw Error('Pinned engineering build is missing required browser asset: '+required);
 }
 console.log('Built engineering browser assets from pinned commit '+lock.engineering.commit);

 const cyberSource=checkout('cyber',lock.cyber);
 run('python3',['-m','pip','install','--disable-pip-version-check','-r','requirements-app-build.txt'],cyberSource);
 run('python3',['core/build_app.py','--out','build-app/web','--download-runtime'],cyberSource);
 const cyberOut=path.join(root,'platform-source/cyber');
 fs.rmSync(cyberOut,{recursive:true,force:true});
 fs.cpSync(path.join(cyberSource,'build-app/web'),cyberOut,{recursive:true});
 for(const required of ['data.json','runtime/pyodide.asm.wasm','runtime/pyodide.mjs','asset-manifest.json']){
  if(!fs.existsSync(path.join(cyberOut,required)))throw Error('Pinned cyber build is missing required browser asset: '+required);
 }
 console.log('Built cyber browser assets from pinned commit '+lock.cyber.commit);
}finally{
 fs.rmSync(workspace,{recursive:true,force:true});
}
