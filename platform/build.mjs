import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyMainAssets} from './preflight.mjs';
import {publishArchives} from './app-archives.mjs';
import {copySharedAssets} from './release-assets.mjs';
import {generateSeo} from './seo.mjs';
import {injectSitewideTheme} from './sitewide-theme.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
execFileSync(process.execPath,['platform/generate-gaps.mjs','--check'],{cwd:root,stdio:'inherit'});
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
  if(main&&['js','css'].includes(entry.name))continue;
  if(main&&entry.name==='favicon.ico')continue;
  const src=path.join(from,entry.name),dst=path.join(to,entry.name);
  if(entry.isDirectory()){copy(src,dst,{main,cyber});continue;}
  if(!extensions.has(path.extname(entry.name))||main&&/^worker.*\.[cm]?js$/.test(entry.name)||!cyber&&['.py','.zip'].includes(path.extname(entry.name)))continue;
  fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
 }
}
copy(root,destination,{main:true});
copySharedAssets(root,destination);
copy(engineering,path.join(destination,'_apps/engineering'));
fs.copyFileSync(path.join(root,'gaps.json'),path.join(destination,'_apps/engineering/gaps.json'));
const repositoryPackage=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
let commitHash=process.env.GITHUB_SHA||'';
if(!/^[a-f0-9]{40}$/i.test(commitHash))try{commitHash=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{commitHash='Unknown';}
fs.writeFileSync(path.join(destination,'_apps/engineering/status-build.json'),JSON.stringify({version:repositoryPackage.version||'Unknown',commitHash,buildTimestamp:new Date().toISOString()},null,2)+'\n');


for(const name of ['LICENSE','THIRD_PARTY_LICENSES.md','ASSET_ATTRIBUTIONS.md'])if(fs.existsSync(path.join(engineering,name)))fs.copyFileSync(path.join(engineering,name),path.join(destination,'_apps/engineering',name));
copy(cyber,path.join(destination,'_apps/cyber'),{cyber:true});
const assistant=path.join(destination,'_apps/engineering/voltpro-assistant.js');
fs.writeFileSync(assistant,fs.readFileSync(assistant,'utf8').replace('https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat','/api/engineering/chat'));
const preferences=path.join(destination,'_apps/engineering/platform/user-preferences.js');
const preferenceSource=fs.readFileSync(preferences,'utf8');
if(!preferenceSource.includes("new URL('/api/engineering/chat'"))fs.writeFileSync(preferences,preferenceSource.replace("'https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat'","new URL('/api/engineering/chat',root.location?.origin||'https://engineering.hephzibahbehulah.com').href").replace("const u=new URL(String(input.aiEndpoint));","const u=new URL(String(input.aiEndpoint));if(u.href==='https://voltpro-engineering-ai.hephzibah-behulah.workers.dev/chat')u.href=defaults.aiEndpoint;"));
const shared=path.join(destination,'_hb');fs.mkdirSync(shared,{recursive:true});
for(const file of ['platform.css','platform.js','release-update.js','admin-accounts-ui.js','account.html','account-page.js','member.js','member.css','experience.js','experience.css','studio.js','studio.css','studio-bank.js','studio-search-worker.js'])fs.copyFileSync(path.join(root,'platform',file),path.join(shared,file));
fs.copyFileSync(path.join(root,'assets/hb-logo.svg'),path.join(shared,'hb-logo.svg'));
fs.copyFileSync(path.join(root,'css/sitewide-osint-theme.css'),path.join(shared,'sitewide-osint-theme.css'));
for(const file of ['account-config.js','account-client.js','cloud-projects.js'])fs.copyFileSync(path.join(engineering,'platform',file),path.join(shared,file));
fs.copyFileSync(path.join(root,'js/language-system.js'),path.join(shared,'language-system.js'));
fs.cpSync(path.join(root,'data/translations'),path.join(shared,'data/translations'),{recursive:true});
const manifest={version:1,applications:lock,assets:{}};
const releases=publishArchives(destination,lock);
fs.writeFileSync(path.join(root,'platform/public-apps-lock.json'),JSON.stringify(releases,null,2)+'\n');
const electCadDist=path.join(root,'apps/voltpro-electcad/dist');
if(!fs.existsSync(path.join(electCadDist,'index.html')))throw Error('VoltPro ElectCAD production build is missing.');
copy(electCadDist,path.join(destination,'_apps/engineering/voltpro-electcad'));
const electCadIndex=path.join(destination,'_apps/engineering/voltpro-electcad/index.html');
const electCadHtml=fs.readFileSync(electCadIndex,'utf8');
for(const file of ['account-config.js','account-client.js','cloud-projects.js'])if(!electCadHtml.includes('/_hb/'+file)||!fs.existsSync(path.join(shared,file)))throw Error('VoltPro ElectCAD shared cloud bridge is missing: '+file);
// Keep shared navigation consistent across the native engineering HTML entry points.
const oldBreadboardLink='<a class="nav-item" href="breadboard.html"><span>▦</span>Breadboard Electronics</a>';
const newWorkspaceLinks='<a class="nav-item" href="/electcad"><span>⌁</span>VoltPro ElectCAD</a>\n        <a class="nav-item" href="breadboard.html"><span>▦</span>VoltPro Breadboard</a>';
let navigationPages=0;
function updateEngineeringNavigation(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())updateEngineeringNavigation(file);else if(entry.isFile()&&entry.name.endsWith('.html')){const html=fs.readFileSync(file,'utf8');if(html.includes(oldBreadboardLink)){fs.writeFileSync(file,html.replaceAll(oldBreadboardLink,newWorkspaceLinks));navigationPages++;}else if(html.includes('href="/oscilloscope"'))navigationPages++;}}}
updateEngineeringNavigation(path.join(destination,'_apps/engineering'));
if(!navigationPages)throw Error('VoltPro studio navigation anchor was not found; refusing to ship without the ElectCAD link.');
// Remove only the extra AI Circuit Designer entry from the shared Design & Simulation navigation.
// The Simulator's existing designer implementation and all other workspace links remain untouched.
let removedAICircuitDesignerLinks=0;
const aiCircuitDesignerNavItem=/<a\b(?=[^>]*\bclass=["'][^"']*\bnav-item\b[^"']*["'])[^>]*>(?:(?!<\/a>)[\s\S])*?AI Circuit Designer(?:(?!<\/a>)[\s\S])*?<\/a>/giu;
function removeAICircuitDesignerNavigation(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())removeAICircuitDesignerNavigation(file);else if(entry.isFile()&&entry.name.endsWith('.html')){const html=fs.readFileSync(file,'utf8');const updated=html.replace(aiCircuitDesignerNavItem,()=>{removedAICircuitDesignerLinks++;return '';});if(updated!==html)fs.writeFileSync(file,updated);}}}
removeAICircuitDesignerNavigation(path.join(destination,'_apps/engineering'));

// The pinned PLC module owns validation and state; the studio never reparents React controls.
const plcAssets=path.join(destination,'_apps/engineering/voltpro-plc/assets');
const plcBundle=fs.readdirSync(plcAssets).find(name=>/^index-.+\.js$/.test(name));
if(!plcBundle)throw Error('PLC production JavaScript bundle is missing.');
const plcModule=path.join(plcAssets,plcBundle);const plcCode=fs.readFileSync(plcModule,'utf8');
if(!plcCode.includes('HBPLCStudioRuntime'))throw Error('PLC editor runtime bridge is missing; refusing to ship imports without native validation.');
const integratedPLC=plcCode+'\n'+fs.readFileSync(path.join(root,'platform/studio-plc-bridge.js'),'utf8');const plcName='index-studio-'+crypto.createHash('sha256').update(integratedPLC).digest('hex').slice(0,12)+'.js';fs.writeFileSync(path.join(path.dirname(plcModule),plcName),integratedPLC);const plcHTML=path.join(destination,'_apps/engineering/voltpro-plc/index.html');const html=fs.readFileSync(plcHTML,'utf8'),updated=html.replace(/(src=["'][^"']*\/assets\/)index-[^"']+\.js(["'])/,`$1${plcName}$2`);if(updated===html)throw Error('Could not point the PLC entry page at its integrated bridge bundle.');fs.writeFileSync(plcHTML,updated);
const themeCoverage=injectSitewideTheme(destination);
generateSeo(destination);
for(const file of ['robots.txt','sitemap.xml','_apps/engineering/robots.txt','_apps/engineering/sitemap.xml','_apps/cyber/robots.txt','_apps/cyber/sitemap.xml'])if(!fs.existsSync(path.join(destination,file)))throw Error('Required SEO release asset is missing: '+file);
for(const file of ['sitemap.xml','_apps/engineering/sitemap.xml','_apps/cyber/sitemap.xml'])if(!/<loc>https:\/\//.test(fs.readFileSync(path.join(destination,file),'utf8')))throw Error('Generated sitemap has no public routes: '+file);

function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())inventory(file);else manifest.assets[path.relative(destination,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
inventory(destination);fs.writeFileSync(path.join(destination,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({destination,files:Object.keys(manifest.assets).length,applications:lock,themeCoverage},null,2));
