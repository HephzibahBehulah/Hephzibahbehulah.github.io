import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createPlatform,resolveRoute} from './router.mjs';
import {adminSecurity,INTEGRITY_ASSETS,EXTRA_ASSET_TARGETS,SURFACE_ROUTES} from './admin-security.mjs';
const origin='https://admin.hephzibahbehulah.com';
const identity={ok:true,identity:{email:'owner@example.test'},claims:{exp:Date.now()/1000+300}};
const gate={limit:async()=>({success:true})};
test('all public hosts reject private security APIs and scripts',()=>{
 for(const host of ['engineering.','cyber.',''])for(const path of ['/api/admin/security','/api/admin/security/session','/_hb/admin-security-ui.js'])assert.equal(resolveRoute(new URL('https://'+host+'hephzibahbehulah.com'+path)).status,404);
});
test('security endpoints authenticate before accessing assets or upstream services',async()=>{
 let called=false;const worker=createPlatform({verifyAdmin:async()=>({ok:false})});const r=await worker.fetch(new Request(origin+'/api/admin/security'),{ASSETS:{fetch:async()=>{called=true;}}});assert.equal(r.status,401);assert.equal(called,false);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('strict-transport-security'),'max-age=31536000');assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'self'/);assert.ok(r.headers.get('x-request-id'));
});
test('private legacy errors are sanitized and carry correlation IDs',async()=>{
 const worker=createPlatform({verifyAdmin:async()=>identity,legacy:{fetch:async()=>{throw Error('secret-token-never-expose');}}});const r=await worker.fetch(new Request(origin+'/'),{});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/secret-token/);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
});
test('all private mutation routes require the exact origin before invoking old handlers',async()=>{
 let called=false;const worker=createPlatform({verifyAdmin:async()=>identity,legacy:{fetch:async()=>{called=true;return new Response('ok');}}});for(const headers of [{},{origin:'https://engineering.hephzibahbehulah.com'},{origin, 'sec-fetch-site':'cross-site'}]){const r=await worker.fetch(new Request(origin+'/api/admin/agent',{method:'POST',headers,body:'{}'}),{});assert.equal(r.status,403);}assert.equal(called,false);
 const r=await worker.fetch(new Request(origin+'/api/admin/agent',{method:'POST',headers:{origin},body:'{}'}),{});assert.equal(r.status,200);assert.equal(called,true);
});
test('session response exposes verified identity and expiry without token contents or MFA claims',async()=>{
 const r=await adminSecurity(new Request(origin+'/api/admin/security/session'),{},identity);const data=await r.json();assert.equal(data.session.email,'owner@example.test');assert.ok(data.session.expiresAt);assert.match(data.session.mfa,/not inferred/);assert.equal(data.claims,undefined);assert.equal(data.token,undefined);
});
test('security reporting is read-only, identity-bound, and rate limited',async()=>{
 assert.equal((await adminSecurity(new Request(origin+'/api/admin/security'),{},null)).status,401);
 assert.equal((await adminSecurity(new Request(origin+'/api/admin/security',{method:'POST'}),{},identity)).status,405);
 assert.equal((await adminSecurity(new Request(origin+'/api/admin/security'),{},identity)).status,503);
 assert.equal((await adminSecurity(new Request(origin+'/api/admin/security'),{ADMIN_AI_LIMITER:{limit:async()=>({success:false})}},identity)).status,429);
});
async function report({mismatch=false,githubFailed=false,surfaceIssue=false}={}){
 const bytes=new TextEncoder().encode('trusted code'),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join(''),commit='a'.repeat(40),manifest={assets:Object.fromEntries(INTEGRITY_ASSETS.map(p=>['_apps/engineering/'+p,hash]))};
 for(const target of EXTRA_ASSET_TARGETS)manifest.assets[target.key]=hash;
 const env={GITHUB_TOKEN:'test-secret',ADMIN_AI_LIMITER:gate,ASSETS:{fetch:async req=>{const path=new URL(req.url).pathname;if(path==='/release-manifest.json')return Response.json(manifest);if(manifest.assets[path.slice(1)])return new Response(mismatch?'modified code':bytes,{headers:{'content-type':'text/javascript'}});return Response.json({commitHash:commit});}}};
 const surfaceRequests=[];const fetcher=async(url,options)=>{
  assert.equal(options.redirect,'manual');
  if(url.startsWith('https://api.github.com')){assert.equal(options.headers.authorization,'Bearer test-secret');if(githubFailed)return new Response(null,{status:503});if(url.endsWith('/branches/main'))return Response.json({protected:true,commit:{sha:commit}});return Response.json({workflow_runs:[{id:1,head_sha:commit,status:'completed',conclusion:'success',event:'push'}]});}
  assert.equal(options.headers?.authorization,undefined);if(url.startsWith('https://raw.githubusercontent.com/'))return new Response(bytes);if(SURFACE_ROUTES.some(route=>route.url===url)){surfaceRequests.push({url,options});if(surfaceIssue&&url.endsWith('/simulator'))return new Response(null,{status:302,headers:{location:'https://untrusted.example/','cache-control':'public, max-age=3600'}});return new Response(null,{headers:{'content-type':'text/html','cache-control':'no-store','strict-transport-security':'max-age=31536000','content-security-policy':'default-src \'self\'','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});}assert.ok(['https://engineering.hephzibahbehulah.com/','https://hephzibahbehulah.com/','https://cyber.hephzibahbehulah.com/'].some(prefix=>url.startsWith(prefix)));return new Response(mismatch?'modified code':bytes,{headers:{'content-type':'text/javascript'}});
 };
 const r=await adminSecurity(new Request(origin+'/api/admin/security'),env,identity,{fetcher});return {data:await r.json(),surfaceRequests};
}
test('matching code and workflow include passive checks for only the eight owned routes',async()=>{const {data,surfaceRequests}=await report();assert.equal(data.integrity.length,INTEGRITY_ASSETS.length+EXTRA_ASSET_TARGETS.length);assert.ok(data.integrity.every(x=>x.status==='match'));assert.equal(data.signals.length,0);assert.match(data.verification,/Successful/);assert.ok(data.coverage.some(x=>/not independent/.test(x)));assert.equal(data.surface.length,SURFACE_ROUTES.length);assert.ok(data.surface.every(x=>x.ok&&x.findings.length===0));assert.equal(surfaceRequests.length,SURFACE_ROUTES.length);assert.ok(surfaceRequests.every(x=>x.options.method==='GET'&&x.options.redirect==='manual'&&x.options.cache==='no-store'));assert.ok(!JSON.stringify(data).includes('test-secret'));});
test('surface failures and redirects are reported without following or exposing redirect targets',async()=>{const {data,surfaceRequests}=await report({surfaceIssue:true});const result=data.surface.find(x=>x.label==='Simulator');assert.equal(result.status,302);assert.equal(result.ok,false);assert.ok(result.findings.some(x=>x.code==='redirect'));assert.doesNotMatch(JSON.stringify(result),/untrusted\.example/);assert.equal(surfaceRequests.find(x=>x.url.endsWith('/simulator')).options.redirect,'manual');});
test('modified code produces alerts without claiming proven malicious intent',async()=>{const {data}=await report({mismatch:true});assert.ok(data.integrity.every(x=>x.status==='mismatch'));assert.ok(data.signals.some(x=>x.level==='alert'));});
test('unavailable source and workflow evidence never becomes verified or healthy',async()=>{const {data}=await report({githubFailed:true});assert.equal(data.source,null);assert.equal(data.verification,undefined);assert.ok(data.signals.some(x=>/unverified/.test(x.message)));});
test('private UI renders untrusted records as text and links the account menu to monitoring',()=>{
 const ui=fs.readFileSync(new URL('./admin-security-ui.js',import.meta.url),'utf8');assert.doesNotMatch(ui,/\.innerHTML\s*=/);assert.match(ui,/textContent/);assert.match(ui,/expiry&&Date\.now\(\)>=expiry/);assert.match(ui,/Surface checks/);assert.match(ui,/Malicious activity/);assert.match(ui,/ArrowRight/);assert.match(ui,/No CVE database or reputation feed is connected/);assert.match(fs.readFileSync(new URL('./platform.js',import.meta.url),'utf8'),/watchSession\(accountMenu\)/);
});


test('ADIGUN security-review AI receives useful release evidence without operator identity or credentials',async()=>{
 const {securityReviewSnapshot}=await import('./admin-security-ui.js');
 const snapshot=securityReviewSnapshot({session:{email:'private@example.test',role:'Owner',token:'never-send'},build:{commitHash:'a'.repeat(40)},source:{repository:'owner/repo',mainCommit:'b'.repeat(40),branchProtected:true},verification:'successful deployment recorded',signals:[{level:'review',message:'asset mismatch'}],integrity:[{status:'match'},{status:'mismatch'}],releases:[{commit:'a'.repeat(40),status:'completed',actor:'private@example.test',createdAt:'2026-10-27T00:00:00Z',url:'https://github.com/run'}],coverage:['Cloudflare denials require provider logs']});
 const json=JSON.stringify(snapshot);assert.match(json,/asset mismatch/);assert.match(json,/integrity/);assert.doesNotMatch(json,/private@example\.test|never-send|Owner/);assert.equal(snapshot.integrity.match,1);assert.equal(snapshot.integrity.mismatch,1);assert.equal(snapshot.releases[0].actor,undefined);
});