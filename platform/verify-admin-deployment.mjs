import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {verifyDeployment} from './verify-deployment.mjs';
import {INTEGRITY_ASSETS} from './admin-security.mjs';
export async function verifyAdminDeployment({commit=process.env.GITHUB_SHA,fetcher=fetch,assetDirectory='dist-platform'}={}){
 const report={schemaVersion:1,commit,observedAt:new Date().toISOString(),workflowRun:process.env.GITHUB_RUN_ID||null,actor:process.env.GITHUB_ACTOR||null,checks:[],coverage:'Public routes, selected code hashes, and unauthenticated admin boundaries. Authenticated provider policies and private account records are not inspected by this job.'};
 const check=async(name,fn)=>{try{await fn();report.checks.push({name,result:'passed'});}catch(e){report.checks.push({name,result:'failed',message:String(e.message).slice(0,600)});}};
 await check('Public release and all seven tools',()=>verifyDeployment({commit,fetcher}));
 for(const path of ['/','/api/admin/security','/api/admin/security/session','/api/admin/accounts','/_hb/admin-security-ui.js'])await check('Unauthenticated admin boundary '+path,async()=>{
  const r=await fetcher('https://admin.hephzibahbehulah.com'+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  if([401,403].includes(r.status))return;
  assert.ok([302,303,307,308].includes(r.status),'Unauthenticated private request must be denied or sent to Access');
  const target=new URL(r.headers.get('location')||'','https://admin.hephzibahbehulah.com');assert.ok(target.hostname==='wispy-salad-ae7d.cloudflareaccess.com'||target.hostname==='admin.hephzibahbehulah.com'&&target.pathname.startsWith('/cdn-cgi/access/'),'Redirect must go to the known Access login boundary');
 });
 for(const host of ['engineering.','cyber.',''])for(const path of ['/api/admin/security','/_hb/admin-security-ui.js'])await check('Public isolation '+host+path,async()=>{const r=await fetcher('https://'+host+'hephzibahbehulah.com'+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});assert.equal(r.status,404);});
 let manifest;await check('Built release manifest available',async()=>{manifest=JSON.parse(fs.readFileSync(assetDirectory+'/release-manifest.json','utf8'));assert.ok(Object.keys(manifest.assets).length>0);});
 if(manifest)await Promise.all(INTEGRITY_ASSETS.map(path=>check('Public code hash '+path,async()=>{const expected=manifest.assets['_apps/engineering/'+path];assert.match(expected||'',/^[a-f0-9]{64}$/);const r=await fetcher('https://engineering.hephzibahbehulah.com/'+path,{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});assert.equal(r.status,200);assert.equal(crypto.createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),expected,'Public code differs from the built release');})));
 report.result=report.checks.every(c=>c.result==='passed')?'passed':'failed';return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=await verifyAdminDeployment();fs.mkdirSync('work',{recursive:true});fs.writeFileSync('work/production-security-report.json',JSON.stringify(report,null,2));console.log('Production security report: '+report.result+' ('+report.checks.length+' checks)');if(report.result!=='passed')process.exitCode=1;
}
