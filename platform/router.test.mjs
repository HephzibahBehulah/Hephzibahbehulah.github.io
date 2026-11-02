import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRoute,createPlatform as platformFactory} from './router.mjs';
const createPlatform=options=>platformFactory({...options,memberAuth:{gate:async()=>({allowed:true})}});
import cyberAI from './cyber-ai.mjs';
const root='hephzibahbehulah.com';
for(const [host,app]of [['engineering','engineering'],['cyber','cyber']]){
 test(host+' root resolves only its application',()=>{const route=resolveRoute(new URL('https://'+host+'.'+root+'/'));if(app==='engineering')assert.equal(route.kind,'retired');else assert.equal(route.path,'/_apps/'+app+'/index.html');});
 test(host+' cannot reach admin APIs',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/api/admin/agent')).status,404));
 test(host+' cannot reach internal assets',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/_apps/engineering/index.html')).status,404));
}
test('engineering suite routes retire after the private access check',()=>{const route=resolveRoute(new URL('https://admin.'+root+'/engineering/simulator'));assert.equal(route.kind,'retired');assert.equal(route.privateHost,true);});
test('ADIGUN operations alias serves the central private control page',()=>{for(const path of ['/and','/and/']){const route=resolveRoute(new URL('https://admin.'+root+path));assert.deepEqual(route,{kind:'app',privateHost:true,app:'admin',prefix:'',base:'/',path:'/admin.html'});}});
test('signed-in operations alias serves admin.html with private response headers',async()=>{let assetPath='';const worker=createPlatform({verifyAdmin:async()=>({ok:true,actor:'owner@example.test'})});const response=await worker.fetch(new Request('https://admin.'+root+'/and'),{ASSETS:{fetch:async request=>{assetPath=new URL(request.url).pathname;return new Response('<html><head></head><body>ADIGUN Control</body></html>',{headers:{'content-type':'text/html'}});}}});assert.equal(response.status,200);assert.equal(assetPath,'/admin.html');assert.equal(response.headers.get('cache-control'),'private, no-store');assert.match(response.headers.get('x-robots-tag'),/noindex/);assert.match(await response.text(),/ADIGUN Control/);});
test('old account links lead to the central account page and preserve their intended destination',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://engineering.'+root+'/account.html?next=/'));assert.equal(r.status,302);const target=new URL(r.headers.get('location'));assert.equal(target.origin,'https://'+root);assert.equal(target.pathname,'/account');assert.equal(target.searchParams.get('next'),'https://engineering.'+root+'/');});
test('unknown host cannot obtain any application',()=>assert.equal(resolveRoute(new URL('https://example.com/')).status,404));
test('encoded path traversal is rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%2e%2e%2fadmin.html')).status,404));
test('malformed percent escapes are rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%zz')).status,400));
test('every private request is checked before asset or legacy access',async()=>{let touched=false;const worker=createPlatform({verifyAdmin:async()=>({ok:false}),legacy:{fetch:()=>{touched=true;}}});for(const host of ['admin.'+root])for(const p of ['/','/and','/and/','/engineering/','/_hb/platform.js','/api/admin/agent']){const r=await worker.fetch(new Request('https://'+host+p),{});assert.equal(r.status,401);}assert.equal(touched,false);});
test('missing access configuration fails closed',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:false,status:503})});assert.equal((await worker.fetch(new Request('https://admin.'+root+'/'))).status,503);});
test('public static requests do not call private authentication',async()=>{let touched=false;const worker=createPlatform({verifyAdmin:async()=>{touched=true;},legacy:{}});const r=await worker.fetch(new Request('https://cyber.'+root+'/style.css'),{ASSETS:{fetch:async r=>new Response(new URL(r.url).pathname)}});assert.equal(await r.text(),'/_apps/cyber/style.css');assert.equal(touched,false);});
test('private responses cannot be cached publicly',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async()=>new Response('existing tools')}});for(const p of ['/engineering/style.css','/']){const r=await worker.fetch(new Request('https://admin.'+root+p),{ASSETS:{fetch:async()=>new Response('css')}});assert.equal(r.headers.get('cache-control'),'private, no-store');}});
test('private legacy content is preserved through the old worker',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async()=>new Response('existing tools')}});assert.equal(await(await worker.fetch(new Request('https://'+root+'/'))).text(),'existing tools');});
test('authenticated main-domain root explicitly serves its original index with asset HTML handling disabled',async()=>{
 const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async request=>new URL(request.url).pathname==='/index.html'?new Response('<h1>Original platform</h1>',{headers:{'content-type':'text/html'}}):new Response(null,{status:404})}});
 for(const method of ['GET','HEAD']){const response=await worker.fetch(new Request('https://'+root+'/?from=home',{method}),{});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');}
});
test('admin-domain root retains its control-room route',async()=>{
 const worker=createPlatform({verifyAdmin:async()=>({ok:true}),legacy:{fetch:async request=>{assert.equal(new URL(request.url).pathname,'/');return new Response('admin control');}}});
 assert.equal(await(await worker.fetch(new Request('https://admin.'+root+'/'),{})).text(),'admin control');
});
test('asset POST requests cannot turn into mutations',async()=>{const worker=createPlatform({});assert.equal((await worker.fetch(new Request('https://cyber.'+root+'/style.css',{method:'POST'}),{})).status,405);});
test('the retired engineering assistant API returns 404',async()=>{const worker=createPlatform({});for(const path of ['/api/engineering/chat','/api/engineering/health'])assert.equal((await worker.fetch(new Request('https://engineering.'+root+path,{method:'POST'}),{})).status,404);});
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

test('the workers.dev origin canonicalizes to the main domain',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://hephzibahbehulah-github-io.hephzibah-behulah.workers.dev/?from=worker'),{});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://'+root+'/?from=worker');});

test('public engineering and legacy HTML receive the global language system',async()=>{
 const original=globalThis.HTMLRewriter;
 class TestHTMLRewriter{
  on(selector,handlers){this.handlers=handlers;return this;}
  transform(response){let markup='';this.handlers.element({prepend(value){markup+=value;}});return response.text().then(html=>new Response(html.replace('<head>','<head>'+markup),{status:response.status,headers:response.headers}));}
 }
 globalThis.HTMLRewriter=TestHTMLRewriter;
 try{
  const worker=createPlatform({legacy:{fetch:async()=>new Response('<html><head></head><body></body></html>',{headers:{'content-type':'text/html'}})}});
  for(const url of ['https://'+root+'/ai.html']){
   const r=await worker.fetch(new Request(url),{ASSETS:{fetch:async()=>new Response('<html><head></head><body></body></html>',{headers:{'content-type':'text/html'}})}});
   assert.equal(r.status,200);
   assert.ok((await r.text()).includes('<script src="/_hb/language-system.js?v=20261024-1" defer></script>'));
  }
 }finally{if(original===undefined)delete globalThis.HTMLRewriter;else globalThis.HTMLRewriter=original;}
});

for(const path of ['/','/tools','/engineering','/simulator','/plc','/electcad','/breadboard','/electrical','/oscilloscope','/Oscilloscope','/simulator/child','/electcad/index.html','/breadboard.html','/electrical-canvas','/electrical-canvas.html','/oscilloscope.html','/voltpro-plc/','/voltpro-plc/index.html','/voltPro-ElectCAD/','/voltpro-electcad/index.html','/engineering.html?vp_embed=1']){
 test('removed engineering surface '+path+' returns 404',()=>assert.equal(resolveRoute(new URL('https://engineering.'+root+path)).status,404));
}
test('removed engineering surfaces return genuine 404 responses for GET and HEAD',async()=>{
 const worker=createPlatform({});
 for(const path of ['/tools','/','/plc','/electcad','/breadboard','/electrical','/Oscilloscope','/simulator','/electrical-canvas.html'])for(const method of ['GET','HEAD']){
  const response=await worker.fetch(new Request('https://engineering.'+root+path,{method}),{});
  assert.equal(response.status,404,method+' '+path);assert.equal(response.headers.get('location'),null,method+' '+path);
 }
});
test('private engineering surfaces require Access and then return 404',async()=>{const worker=createPlatform({verifyAdmin:async()=>({ok:false})});assert.equal((await worker.fetch(new Request('https://admin.'+root+'/engineering/tools'),{})).status,401);const authorized=createPlatform({verifyAdmin:async()=>({ok:true})});assert.equal((await authorized.fetch(new Request('https://admin.'+root+'/engineering/tools'),{})).status,404);});
