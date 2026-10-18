import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRoute,createPlatform} from './router.mjs';
import cyberAI from './cyber-ai.mjs';
const root='hephzibahbehulah.com';
for(const [host,app]of [['engineering','engineering'],['cyber','cyber']]){
 test(host+' root resolves only its application',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/')).path,'/_apps/'+app+'/index.html'));
 test(host+' cannot reach admin APIs',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/api/admin/agent')).status,404));
 test(host+' cannot reach internal assets',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/_apps/engineering/index.html')).status,404));
}
test('private app routes preserve mount prefixes',()=>{const route=resolveRoute(new URL('https://'+root+'/engineering/simulator'));assert.equal(route.path,'/_apps/engineering/simulator.html');assert.equal(route.privateHost,true);assert.equal(route.base,'/engineering/');});
test('PLC nested assets keep the correct base',()=>assert.equal(resolveRoute(new URL('https://'+root+'/engineering/voltpro-plc/')).base,'/engineering/voltpro-plc/'));
test('old html routes redirect without discarding query',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://engineering.'+root+'/account.html?next=simulator.html'));assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://engineering.'+root+'/account?next=simulator.html');});
test('unknown host cannot obtain any application',()=>assert.equal(resolveRoute(new URL('https://example.com/')).status,404));
test('encoded path traversal is rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%2e%2e%2fadmin.html')).status,404));
test('malformed percent escapes are rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%zz')).status,400));
test('every private request is checked before asset or legacy access',async()=>{let touched=false;const worker=createPlatform({verifyAdmin:async()=>({ok:false}),legacy:{fetch:()=>{touched=true;}}});for(const host of [root,'admin.'+root])for(const p of ['/','/engineering/','/_hb/platform.js','/api/admin/agent']){const r=await worker.fetch(new Request('https://'+host+p),{});assert.equal(r.status,401);}assert.equal(touched,false);});
test('missing access configuration fails closed',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:false,status:503})});assert.equal((await worker.fetch(new Request('https://'+root+'/'))).status,503);});
test('public static requests do not call private authentication',async()=>{let touched=false;const worker=createPlatform({verifyAdmin:async()=>{touched=true;},legacy:{}});const r=await worker.fetch(new Request('https://cyber.'+root+'/style.css'),{ASSETS:{fetch:async r=>new Response(new URL(r.url).pathname)}});assert.equal(await r.text(),'/_apps/cyber/style.css');assert.equal(touched,false);});
test('private responses cannot be cached publicly',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async()=>new Response('existing tools')}});for(const p of ['/engineering/style.css','/']){const r=await worker.fetch(new Request('https://'+root+p),{ASSETS:{fetch:async()=>new Response('css')}});assert.equal(r.headers.get('cache-control'),'private, no-store');}});
test('private legacy content is preserved through the old worker',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async()=>new Response('existing tools')}});assert.equal(await(await worker.fetch(new Request('https://'+root+'/'))).text(),'existing tools');});
test('asset POST requests cannot turn into mutations',async()=>{const worker=createPlatform({});assert.equal((await worker.fetch(new Request('https://cyber.'+root+'/style.css',{method:'POST'}),{})).status,405);});
test('engineering inference rejects cross-origin requests before provider access',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://engineering.'+root+'/api/engineering/chat',{method:'POST',headers:{origin:'https://example.com'}}),{});assert.equal(r.status,403);});
test('engineering inference fails closed without its original six-request limiter',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://engineering.'+root+'/api/engineering/chat',{method:'POST'}),{});assert.equal(r.status,503);});
test('engineering gateway preserves authorization and uses the dedicated limiter',async()=>{const limiter={limit:async()=>({success:true})};const worker=createPlatform({engineeringAI:{fetch:async(request,env)=>{assert.equal(request.headers.get('authorization'),'Bearer member');assert.equal(new URL(request.url).pathname,'/chat');assert.equal(env.API_LIMITER,limiter);return new Response('provider result');}}});const r=await worker.fetch(new Request('https://engineering.'+root+'/api/engineering/chat',{method:'POST',headers:{authorization:'Bearer member'},body:'{}'}),{ENGINEERING_LIMITER:limiter});assert.equal(await r.text(),'provider result');});
test('tutor does not claim availability without AI binding',async()=>assert.equal((await cyberAI.fetch(new Request('https://cyber.'+root+'/api/cyber/chat',{method:'POST'}),{})).status,503));
test('tutor rejects foreign origins',async()=>assert.equal((await cyberAI.fetch(new Request('https://cyber.'+root+'/api/cyber/chat',{method:'POST',headers:{origin:'https://example.com'}}),{})).status,403));
test('tutor enforces limiter before inference',async()=>{let inferred=false;const r=await cyberAI.fetch(new Request('https://cyber.'+root+'/api/cyber/chat',{method:'POST'}),{AI:{run(){inferred=true;}},API_LIMITER:{limit:async()=>({success:false})}});assert.equal(r.status,429);assert.equal(inferred,false);});
test('tutor bounds request size',async()=>{const r=await cyberAI.fetch(new Request('https://cyber.'+root+'/api/cyber/chat',{method:'POST',body:'x'.repeat(13000)}),{AI:{},API_LIMITER:{limit:async()=>({success:true})}});assert.equal(r.status,413);});
test('tutor returns actual inference output',async()=>{const r=await cyberAI.fetch(new Request('https://cyber.'+root+'/api/cyber/chat',{method:'POST',body:JSON.stringify({question:'What is DNS?'})}),{AI:{run:async()=>({response:'DNS maps names to records.'})},API_LIMITER:{limit:async()=>({success:true})}});assert.equal((await r.json()).answer,'DNS maps names to records.');});
test('private pages cannot reuse stale public HTML through conditional requests',async()=>{
 const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async(request)=>{assert.equal(request.headers.has('if-none-match'),false);assert.equal(request.headers.has('if-modified-since'),false);return new Response('<html></html>',{headers:{'content-type':'text/html',etag:'old-public-version','last-modified':'yesterday'}});}}});
 const result=await worker.fetch(new Request('https://admin.'+root+'/admin',{headers:{'if-none-match':'old-public-version','if-modified-since':'yesterday'}}),{});
 assert.equal(result.status,200);assert.equal(result.headers.has('etag'),false);assert.equal(result.headers.has('last-modified'),false);assert.equal(result.headers.get('cache-control'),'private, no-store');
});
test('private service workers retire only after authorization',async()=>{
 let granted=false;const worker=createPlatform({verifyAdmin:async()=>({ok:granted})});
 const request=new Request('https://admin.'+root+'/engineering/service-worker.js');
 assert.equal((await worker.fetch(request,{})).status,401);granted=true;
 const result=await worker.fetch(request,{});assert.equal(result.status,200);assert.match(await result.text(),/registration\.unregister/);assert.equal(result.headers.get('cache-control'),'private, no-store');
});
