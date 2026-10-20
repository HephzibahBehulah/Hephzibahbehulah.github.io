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
for(const file of ['platform.css','platform.js','admin-accounts-ui.js','account.html','account-page.js','member.js','member.css','experience.js','experience.css','studio.js','studio.css','studio-bank.js','studio-search-worker.js'])fs.copyFileSync(path.join(root,'platform',file),path.join(shared,file));
fs.copyFileSync(path.join(root,'assets/hb-logo.svg'),path.join(shared,'hb-logo.svg'));
for(const file of ['account-config.js','account-client.js'])fs.copyFileSync(path.join(engineering,'platform',file),path.join(shared,file));
const electCadDist=path.join(root,'apps/voltpro-electcad/dist');
if(!fs.existsSync(path.join(electCadDist,'index.html')))throw Error('VoltPro ElectCAD production build is missing.');
copy(electCadDist,path.join(destination,'_apps/engineering/voltpro-electcad'));
// Apply the shared workspace navigation to the browser apps in the pinned release.
const engineeringOut=path.join(destination,'_apps/engineering');
const simulatorPage=path.join(engineeringOut,'simulator.html');
const simulatorHtml=fs.readFileSync(simulatorPage,'utf8');
const oldSimulatorActions='<div class="top-actions"><a href="index.html" aria-label="Academy home">Academy</a><a href="engineering.html">Engineering Tools</a><button id="themeBtn">Theme</button></div>';
const newSimulatorActions='<nav class="top-actions" aria-label="VoltPro platforms"><a href="index.html">Academy</a><a href="simulator.html" aria-current="page">Simulator</a><a href="voltpro-plc/">VoltPro PLC</a><a href="voltPro-ElectCAD/">VoltPro ElectCAD</a><a href="breadboard.html">VoltPro Breadboard</a><a href="engineering.html">Engineering</a><a href="academy-workbench.html">Workbench</a><a href="simulator.html#ai-designer">AI Circuit Designer</a><button id="themeBtn">Theme</button></nav>';
if(simulatorHtml.includes('class="top-actions"'))fs.writeFileSync(simulatorPage,simulatorHtml.replace(/<div class="top-actions">[\s\S]*?<\/div>/,newSimulatorActions));
const breadboardPage=path.join(engineeringOut,'breadboard.html');
let breadboardHtml=fs.readFileSync(breadboardPage,'utf8');
const oldBreadboardNav='<nav class="nav"><a class="btn" href="index.html">Academy</a><a class="btn" href="engineering.html">Engineering Tools</a><a class="btn" href="academy-workbench.html">Workbench</a></nav>';
const newBreadboardNav='<nav class="nav" aria-label="VoltPro platforms"><a class="btn" href="index.html">Academy</a><a class="btn" href="simulator.html">Simulator</a><a class="btn" href="voltpro-plc/">VoltPro PLC</a><a class="btn" href="voltPro-ElectCAD/">VoltPro ElectCAD</a><a class="btn" href="breadboard.html" aria-current="page">VoltPro Breadboard</a><a class="btn" href="engineering.html">Engineering</a><a class="btn" href="academy-workbench.html">Workbench</a><a class="btn" href="simulator.html#ai-designer">AI Circuit Designer</a></nav>';
if(breadboardHtml.includes(oldBreadboardNav))breadboardHtml=breadboardHtml.replace(oldBreadboardNav,newBreadboardNav);
fs.writeFileSync(breadboardPage,breadboardHtml);
// Keep the breadboard welcome flow fresh on entry; explicit Save and Import remain available.
const breadboardStudio=path.join(engineeringOut,'src/ui/breadboard-studio.js');
if(fs.existsSync(breadboardStudio)){
 let studio=fs.readFileSync(breadboardStudio,'utf8');
 const restore='Promise.resolve(window.VoltProRegistry?.ready).then(()=>{try{const saved=localStorage.getItem(\'voltpro-breadboard-project\');if(saved){restoring=true;ui.loadData(JSON.parse(saved));last=snapshot();restoring=false;welcome.hidden=S.parts.length>0}}catch(error){restoring=false;ui.setStatus(\'Stored project needs attention: \'+error.message)}}).finally(()=>{cataloguePending=false;});';
 if(studio.includes(restore))studio=studio.replace(restore,'Promise.resolve(window.VoltProRegistry?.ready).then(()=>{welcome.hidden=false;}).finally(()=>{cataloguePending=false;});');
 studio=studio.replace("clearTimeout(dirtyTimer);dirtyTimer=setTimeout(()=>{if(running||!scope.hidden)recompute();autosave()},180)","clearTimeout(dirtyTimer);dirtyTimer=setTimeout(()=>{if(running||!scope.hidden)recompute()},180)");
 studio=studio.replace("window.addEventListener('beforeunload',autosave);","");
 const welcomeClose="welcome.querySelector('.bb-welcome-close').onclick=()=>welcome.hidden=true;";
 const welcomeActions="welcome.querySelector('.bb-welcome-close').onclick=()=>welcome.hidden=true;const welcomeActions=document.createElement('div');welcomeActions.className='bb-welcome-actions';welcomeActions.innerHTML='<button type=\"button\" id=\"bbWelcomeBlank\">Start blank</button><button type=\"button\" id=\"bbWelcomeImport\">Import project</button>';welcome.appendChild(welcomeActions);welcome.querySelector('#bbWelcomeBlank').onclick=()=>{S.parts=[];S.wires=[];S.selectedPart=S.selectedWire=null;S.lastSimulation=null;ui.render();welcome.hidden=true;ui.setStatus('BLANK BOARD READY')};welcome.querySelector('#bbWelcomeImport').onclick=()=>{welcome.hidden=true;$('#loadProject').click()};";
 if(studio.includes(welcomeClose))studio=studio.replace(welcomeClose,welcomeActions);
 fs.writeFileSync(breadboardStudio,studio);
}
// Keep shared navigation consistent across the native engineering HTML entry points.
const oldBreadboardLink='<a class="nav-item" href="breadboard.html"><span>▦</span>Breadboard Electronics</a>';
const newWorkspaceLinks='<a class="nav-item" href="voltPro-ElectCAD/"><span>⌁</span>VoltPro ElectCAD</a>\n        <a class="nav-item" href="breadboard.html"><span>▦</span>VoltPro Breadboard</a>\n        <a class="nav-item" href="/simulator#ai-designer"><span>✦</span>AI Circuit Designer</a>';
let navigationPages=0;
function updateEngineeringNavigation(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())updateEngineeringNavigation(file);else if(entry.isFile()&&entry.name.endsWith('.html')){const html=fs.readFileSync(file,'utf8');if(html.includes(oldBreadboardLink)){fs.writeFileSync(file,html.replaceAll(oldBreadboardLink,newWorkspaceLinks));navigationPages++;}}}}
updateEngineeringNavigation(path.join(destination,'_apps/engineering'));
if(!navigationPages)throw Error('VoltPro studio navigation anchor was not found; refusing to ship without the ElectCAD link.');
// The pinned PLC module owns validation and state; the studio never reparents React controls.
const plcModule=path.join(destination,'_apps/engineering/voltpro-plc/assets/index-DSp8g4IS.js');const plcCode=fs.readFileSync(plcModule,'utf8');
if(!plcCode.includes('xt.getState().setProject')||!plcCode.includes('const V=Ei(R.data)'))throw Error('PLC integration contract changed; review the native import bridge before release.');
const integratedPLC=plcCode+'\n'+fs.readFileSync(path.join(root,'platform/studio-plc-bridge.js'),'utf8');const plcName='index-studio-'+crypto.createHash('sha256').update(integratedPLC).digest('hex').slice(0,12)+'.js';fs.writeFileSync(path.join(path.dirname(plcModule),plcName),integratedPLC);const plcHTML=path.join(destination,'_apps/engineering/voltpro-plc/index.html');fs.writeFileSync(plcHTML,fs.readFileSync(plcHTML,'utf8').replace('index-DSp8g4IS.js',plcName));
// Runtime values and React-owned text must not be rewritten by the static page translator.
for(const [file,needle,replacement]of [['simulator.html','class="sim-app"','class="sim-app" translate="no"'],['breadboard.html','class="app"','class="app" translate="no"'],['voltpro-plc/index.html','id="root"','id="root" translate="no"']]){const target=path.join(destination,'_apps/engineering',file);fs.writeFileSync(target,fs.readFileSync(target,'utf8').replace(needle,replacement));}

// Publish archives only after all app patches and generated assets have been applied.
const manifest={version:1,applications:lock,assets:{}};
const pinnedDownloads=JSON.parse(fs.readFileSync(path.join(root,'platform/public-apps-lock.json'),'utf8'));
const releases=publishArchives(destination,lock);
for(const [name,release]of Object.entries(releases.applications)){const expected=pinnedDownloads.applications[name];if(expected?.commit===release.commit&&(expected.sha256!==release.sha256||expected.bytes!==release.bytes))throw Error('Pinned '+name+' download changed; release blocked.');}
fs.writeFileSync(path.join(root,'platform/public-apps-lock.json'),JSON.stringify(releases,null,2)+'\n');
// Let shared AI navigation open the existing circuit designer panel directly.
const designerScript=path.join(engineeringOut,'src/ui/ai-circuit-designer.js');
if(fs.existsSync(designerScript)){
 let designer=fs.readFileSync(designerScript,'utf8');
 const designerApi='window.VoltProCircuitDesigner={open,close,generate:()=>generate.click(),getDraft:()=>draft,getValidation:()=>lastValidation};';
 if(designer.includes(designerApi)&&!designer.includes('location.hash==="#ai-designer"'))designer=designer.replace(designerApi,designerApi+'if(location.hash==="#ai-designer")setTimeout(open,0);');
 fs.writeFileSync(designerScript,designer);
}
function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())inventory(file);else manifest.assets[path.relative(destination,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
inventory(destination);fs.writeFileSync(path.join(destination,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({destination,files:Object.keys(manifest.assets).length,applications:lock},null,2));
