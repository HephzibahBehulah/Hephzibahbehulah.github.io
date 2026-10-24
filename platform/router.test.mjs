import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRoute,createPlatform as platformFactory} from './router.mjs';
const createPlatform=options=>platformFactory({...options,memberAuth:{gate:async()=>({allowed:true})}});
import cyberAI from './cyber-ai.mjs';
const root='hephzibahbehulah.com';
for(const [host,app]of [['engineering','engineering'],['cyber','cyber']]){
 test(host+' root resolves only its application',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/')).path,'/_apps/'+app+'/index.html'));
 test(host+' cannot reach admin APIs',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/api/admin/agent')).status,404));
 test(host+' cannot reach internal assets',()=>assert.equal(resolveRoute(new URL('https://'+host+'.'+root+'/_apps/engineering/index.html')).status,404));
}
test('private app routes preserve mount prefixes through the SPA shell',()=>{const route=resolveRoute(new URL('https://admin.'+root+'/engineering/simulator'));assert.equal(route.path,'/_apps/engineering/workspace-shell.html');assert.equal(route.privateHost,true);assert.equal(route.base,'/engineering/');});
test('PLC route uses the shell while embedded PLC keeps its nested base',()=>{const shell=resolveRoute(new URL('https://admin.'+root+'/engineering/voltpro-plc/'));assert.equal(shell.path,'/_apps/engineering/workspace-shell.html');const frame=resolveRoute(new URL('https://admin.'+root+'/engineering/voltpro-plc/?vp_embed=1'));assert.equal(frame.path,'/_apps/engineering/voltpro-plc/index.html');assert.equal(frame.base,'/engineering/voltpro-plc/');});
test('old account links lead to the central account page and preserve their intended destination',async()=>{const worker=createPlatform({});const r=await worker.fetch(new Request('https://engineering.'+root+'/account.html?next=simulator.html'));assert.equal(r.status,302);const target=new URL(r.headers.get('location'));assert.equal(target.origin,'https://'+root);assert.equal(target.pathname,'/account');assert.equal(target.searchParams.get('next'),'https://engineering.'+root+'/simulator.html');});
test('unknown host cannot obtain any application',()=>assert.equal(resolveRoute(new URL('https://example.com/')).status,404));
test('encoded path traversal is rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%2e%2e%2fadmin.html')).status,404));
test('malformed percent escapes are rejected',()=>assert.equal(resolveRoute(new URL('https://cyber.'+root+'/%zz')).status,400));
test('every private request is checked before asset or legacy access',async()=>{let touched=false;const worker=createPlatform({verifyAdmin:async()=>({ok:false}),legacy:{fetch:()=>{touched=true;}}});for(const host of ['admin.'+root])for(const p of ['/','/engineering/','/_hb/platform.js','/api/admin/agent']){const r=await worker.fetch(new Request('https://'+host+p),{});assert.equal(r.status,401);}assert.equal(touched,false);});
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

test('ElectCAD route enters the SPA shell while its embedded app keeps the canonical base',()=>{
 const route=resolveRoute(new URL('https://engineering.'+root+'/voltPro-ElectCAD/'));
 assert.equal(route.kind,'app');assert.equal(route.path,'/_apps/engineering/workspace-shell.html');assert.equal(route.base,'/');
 const frame=resolveRoute(new URL('https://engineering.'+root+'/voltPro-ElectCAD/?vp_embed=1'));
 assert.equal(frame.path,'/_apps/engineering/voltpro-electcad/index.html');assert.equal(frame.base,'/voltPro-ElectCAD/');
});
test('ElectCAD route without a slash opens the persistent shell',()=>{
 const route=resolveRoute(new URL('https://engineering.'+root+'/voltPro-ElectCAD'));
 assert.equal(route.kind,'app');assert.equal(route.path,'/_apps/engineering/workspace-shell.html');
});
test('ElectCAD assets resolve beneath the application directory',()=>{
 const route=resolveRoute(new URL('https://engineering.'+root+'/voltPro-ElectCAD/assets/index.js'));
 assert.equal(route.path,'/_apps/engineering/voltpro-electcad/assets/index.js');assert.equal(route.base,'/voltPro-ElectCAD/');
});
test('ElectCAD SPA route retains authenticated admin prefix for its embedded app',()=>{
 const shell=resolveRoute(new URL('https://admin.'+root+'/engineering/voltPro-ElectCAD/'));
 assert.equal(shell.privateHost,true);assert.equal(shell.path,'/_apps/engineering/workspace-shell.html');assert.equal(shell.base,'/engineering/');
 const frame=resolveRoute(new URL('https://admin.'+root+'/engineering/voltPro-ElectCAD/?vp_embed=1'));
 assert.equal(frame.path,'/_apps/engineering/voltpro-electcad/index.html');assert.equal(frame.base,'/engineering/voltPro-ElectCAD/');
});

test('lowercase ElectCAD alias enters the shell and keeps embedded assets direct',()=>{
 const route=resolveRoute(new URL('https://engineering.'+root+'/voltpro-electcad/'));
 assert.equal(route.kind,'app');assert.equal(route.path,'/_apps/engineering/workspace-shell.html');
 const asset=resolveRoute(new URL('https://engineering.'+root+'/voltpro-electcad/assets/index.js?vp_embed=1'));
 assert.equal(asset.path,'/_apps/engineering/voltpro-electcad/assets/index.js');assert.equal(asset.base,'/voltPro-ElectCAD/');
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
  for(const url of ['https://engineering.'+root+'/simulator','https://'+root+'/ai.html']){
   const r=await worker.fetch(new Request(url),{ASSETS:{fetch:async()=>new Response('<html><head></head><body></body></html>',{headers:{'content-type':'text/html'}})}});
   assert.equal(r.status,200);
   assert.ok((await r.text()).includes('<script src="/_hb/language-system.js?v=20261024-1" defer></script>'));
  }
 }finally{if(original===undefined)delete globalThis.HTMLRewriter;else globalThis.HTMLRewriter=original;}
});

for(const path of ['/simulator','/plc','/electcad','/tools','/breadboard','/electrical']){
 test('workspace '+path+' is served by the persistent shell',()=>{const route=resolveRoute(new URL('https://engineering.'+root+path));assert.equal(route.kind,'app');assert.equal(route.path,'/_apps/engineering/workspace-shell.html');});
}
test('private BuildingCAD workspace preserves its Cloudflare Access mount',()=>{const route=resolveRoute(new URL('https://admin.'+root+'/engineering/electrical'));assert.equal(route.path,'/_apps/engineering/workspace-shell.html');assert.equal(route.base,'/engineering/');assert.equal(route.privateHost,true);});
test('embedded tool pages bypass SPA shell routing without remounting the shell',()=>{
 assert.equal(resolveRoute(new URL('https://engineering.'+root+'/simulator.html?vp_embed=1')).path,'/_apps/engineering/simulator.html');
 assert.equal(resolveRoute(new URL('https://engineering.'+root+'/voltpro-plc/?vp_embed=1')).path,'/_apps/engineering/voltpro-plc/index.html');
 assert.equal(resolveRoute(new URL('https://engineering.'+root+'/voltpro-electcad/?vp_embed=1')).path,'/_apps/engineering/voltpro-electcad/index.html');
 assert.equal(resolveRoute(new URL('https://engineering.'+root+'/electrical-canvas.html?vp_embed=1')).path,'/_apps/engineering/electrical-canvas.html');
});

for(const path of ['/engineering','/voltpro-plc','/voltpro-plc/','/voltpro-electcad','/voltpro-electcad/']){
 test('legacy workspace route '+path+' enters the SPA shell',()=>assert.equal(resolveRoute(new URL('https://engineering.'+root+path)).path,'/_apps/engineering/workspace-shell.html'));
}
