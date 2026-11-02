import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyMainAssets} from './preflight.mjs';
import {publishArchives} from './app-archives.mjs';
import {copySharedAssets} from './release-assets.mjs';
import {stampRelease} from './release-stamp.mjs';
import {generateSeo} from './seo.mjs';
import {injectSitewideTheme} from './sitewide-theme.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cyber=path.resolve(process.argv[2]||'apps/pentest-source/build-app/web');
const assetDirectory=process.env.HB_PLATFORM_ASSETS_DIR||'dist-platform';
const destination=path.resolve(root,assetDirectory);
if(!destination.startsWith(root+path.sep))throw Error('HB_PLATFORM_ASSETS_DIR must resolve inside the repository.');
const lock=JSON.parse(fs.readFileSync(path.join(root,'platform/source-lock.json'),'utf8'));
verifyMainAssets(root);
for(const file of [path.join(cyber,'data.json'),path.join(cyber,'runtime/pyodide.asm.wasm')])if(!fs.existsSync(file))throw Error('Required cybersecurity build asset is missing: '+file);
if(fs.existsSync(destination))throw Error('Use a fresh output directory; refusing to overwrite an existing build.');
const extensions=new Set(['.html','.css','.js','.mjs','.json','.csv','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ttf','.webmanifest','.wasm','.zip','.py','.txt']);
function copy(from,to,{main=false,cyberApp=false}={}){
 for(const entry of fs.readdirSync(from,{withFileTypes:true})){
  if(entry.name.startsWith('.')||main&&['node_modules','dist-platform','platform-source','platform','tests','scripts','server','apps','packages','docs','backend','deployment','production-inventory','ml-service','pentest-script','work'].includes(entry.name))continue;
  if(!main&&['node_modules','.git','.github','server','apps','tests','scripts','docs'].includes(entry.name))continue;
  if(main&&['js','css'].includes(entry.name))continue;
  if(main&&entry.name==='favicon.ico')continue;
  const src=path.join(from,entry.name),resolvedSource=path.resolve(src),dst=path.join(to,entry.name);
  if(resolvedSource===destination||resolvedSource.startsWith(destination+path.sep))continue;
  if(entry.isDirectory()){copy(src,dst,{main,cyberApp});continue;}
  if(!extensions.has(path.extname(entry.name))||main&&/^worker.*\.[cm]?js$/.test(entry.name)||!cyberApp&&['.py','.zip'].includes(path.extname(entry.name)))continue;
  fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
 }
}
copy(root,destination,{main:true});
copy(path.join(root,'apps/public'),destination);
copy(path.join(root,'apps/admin'),destination);
copy(path.join(root,'apps/cyber-os'),path.join(destination,'cyber-os'));
copy(path.join(root,'packages/shared-data/data'),path.join(destination,'data'));
copySharedAssets(root,destination);
copy(cyber,path.join(destination,'_apps/cyber'),{cyberApp:true});

const repositoryPackage=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const shared=path.join(destination,'_hb');fs.mkdirSync(shared,{recursive:true});
let commitHash=process.env.GITHUB_SHA||'';
if(!/^[a-f0-9]{40}$/i.test(commitHash))try{commitHash=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{commitHash='Unknown';}
fs.writeFileSync(path.join(shared,'status-build.json'),JSON.stringify({version:repositoryPackage.version||'Unknown',commitHash,buildTimestamp:new Date().toISOString()},null,2)+'\n');
for(const file of ['platform.css','platform.js','release-update.js','admin-security-ui.js','admin-accounts-ui.js','adigunsps-admin-ui.js','adigunsps-admin-client.mjs','account.html','account-page.js','member.js','member.css','experience.js','experience.css'])fs.copyFileSync(path.join(root,'platform',file),path.join(shared,file));
for(const file of ['account-config.js','account-client.js'])fs.copyFileSync(path.join(root,'platform',file),path.join(shared,file));
for(const file of ['hb-logo.svg','hephzibah-behulah-official.jpg'])fs.copyFileSync(path.join(root,'packages/shared-ui/assets',file),path.join(shared,file));
fs.copyFileSync(path.join(root,'packages/shared-ui/css/sitewide-osint-theme.css'),path.join(shared,'sitewide-osint-theme.css'));
fs.copyFileSync(path.join(root,'packages/shared-i18n/language-system.js'),path.join(shared,'language-system.js'));
fs.cpSync(path.join(root,'packages/shared-data/data/translations'),path.join(shared,'data/translations'),{recursive:true});

const manifest={version:1,applications:lock,assets:{}};
const releases=publishArchives(destination,lock);
fs.writeFileSync(path.join(root,'platform/public-apps-lock.json'),JSON.stringify(releases,null,2)+'\n');
const themeCoverage=injectSitewideTheme(destination);
generateSeo(destination);
for(const file of ['robots.txt','sitemap.xml','_apps/cyber/robots.txt','_apps/cyber/sitemap.xml'])if(!fs.existsSync(path.join(destination,file)))throw Error('Required SEO release asset is missing: '+file);
for(const file of ['sitemap.xml','_apps/cyber/sitemap.xml'])if(!/<loc>https:\/\//.test(fs.readFileSync(path.join(destination,file),'utf8')))throw Error('Generated sitemap has no public routes: '+file);
stampRelease(destination,commitHash);
function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())inventory(file);else manifest.assets[path.relative(destination,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
inventory(destination);fs.writeFileSync(path.join(destination,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({destination,files:Object.keys(manifest.assets).length,applications:lock,themeCoverage},null,2));
