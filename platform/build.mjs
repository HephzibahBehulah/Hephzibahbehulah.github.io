import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyMainAssets} from './preflight.mjs';
import {publishArchives} from './app-archives.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const engineering=path.resolve(process.argv[2]||'../engineering-source');
const cyber=path.resolve(process.argv[3]||'../cyber/build-app/web');
const destination=path.resolve(root,'dist-platform');
const lock=JSON.parse(fs.readFileSync(path.join(root,'platform/source-lock.json'),'utf8'));
verifyMainAssets(root);
for(const file of [path.join(engineering,'simulator.html'),path.join(engineering,'voltpro-plc/index.html'),path.join(cyber,'data.json'),path.join(cyber,'runtime/pyodide.asm.wasm')])if(!fs.existsSync(file))throw Error('Required built application asset is missing: '+file);
if(fs.existsSync(destination))throw Error('Use a fresh output directory; refusing to overwrite an existing build.');
const extensions=new Set(['.html','.css','.js','.mjs','.json','.csv','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ttf','.webmanifest','.wasm','.zip','.py','.txt']);
function copy(from,to,{main=false,cyber=false}={}){
 for(const entry of fs.readdirSync(from,{withFileTypes:true})){
  if(entry.name.startsWith('.')||['node_modules','dist-platform','platform-source','platform','tests','scripts','server','apps','docs','backend','deployment','production-inventory','ml-service','pentest-script'].includes(entry.name)&&main)continue;
  if(!main&&['node_modules','.git','.github','server','apps','tests','scripts','docs'].includes(entry.name))continue;
  const src=path.join(from,entry.name),dst=path.join(to,entry.name);
  if(entry.isDirectory()){copy(src,dst,{main,cyber});continue;}
  if(!extensions.has(path.extname(entry.name))||main&&/^worker.*\.[cm]?js$/.test(entry.name)||!cyber&&['.py','.zip'].includes(path.extname(entry.name)))continue;
  fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
 }
}
copy(root,destination,{main:true});
copy(engineering,path.join(destination,'_apps/engineering'));
for(const name of ['LICENSE','THIRD_PARTY_LICENSES.md','ASSET_ATTRIBUTIONS.md'])if(fs.existsSync(path.join(engineering,name)))fs.copyFileSync(path.join(engineering,name),path.join(destination,'_apps/engineering',name));
copy(cyber,path.join(destination,'_apps/cyber'),{cyber:true});
const assistant=path.join(destination,'_apps/engineering/voltpro-assistant.js');
fs.writeFileSync(assistant,fs.readFileSync(assistant,'utf8').replace('https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat','/api/engineering/chat'));
const preferences=path.join(destination,'_apps/engineering/platform/user-preferences.js');
const preferenceSource=fs.readFileSync(preferences,'utf8');
if(!preferenceSource.includes("new URL('/api/engineering/chat'"))fs.writeFileSync(preferences,preferenceSource.replace("'https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat'","new URL('/api/engineering/chat',root.location?.origin||'https://engineering.hephzibahbehulah.com').href").replace("const u=new URL(String(input.aiEndpoint));","const u=new URL(String(input.aiEndpoint));if(u.href==='https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat')u.href=defaults.aiEndpoint;"));
const shared=path.join(destination,'_hb');fs.mkdirSync(shared,{recursive:true});
for(const file of ['platform.css','platform.js','admin-accounts-ui.js'])fs.copyFileSync(path.join(root,'platform',file),path.join(shared,file));
fs.copyFileSync(path.join(root,'assets/hb-logo.svg'),path.join(shared,'hb-logo.svg'));
for(const file of ['account-config.js','account-client.js'])fs.copyFileSync(path.join(engineering,'platform',file),path.join(shared,file));
const manifest={version:1,applications:lock,assets:{}};
const releases=publishArchives(destination,lock);
fs.writeFileSync(path.join(root,'platform/public-apps-lock.json'),JSON.stringify(releases,null,2)+'\n');
function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())inventory(file);else manifest.assets[path.relative(destination,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
inventory(destination);fs.writeFileSync(path.join(destination,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({destination,files:Object.keys(manifest.assets).length,applications:lock},null,2));
