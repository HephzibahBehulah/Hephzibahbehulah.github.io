import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createPlatform} from './router.mjs';
import {publicServiceWorker} from './public-sw.mjs';
const origin='https://engineering.hephzibahbehulah.com';
const worker=createPlatform({memberAuth:{gate:async()=>({allowed:true})}});
test('all seven tool routes return uncached HTML and discard stale HTML validators',async()=>{
 for(const path of ['/plc','/electcad','/tools','/breadboard','/electrical','/oscilloscope','/simulator']){
  const r=await worker.fetch(new Request(origin+path,{headers:{'if-none-match':'old'}}),{ASSETS:{fetch:async req=>{assert.equal(req.headers.has('if-none-match'),false);return new Response('new HTML',{headers:{'content-type':'text/html',etag:'old','cache-control':'public,max-age=99999'}});}}});
  assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('cloudflare-cdn-cache-control'),'no-store');assert.equal(r.headers.has('etag'),false);
 }
});
test('shared and tool assets override an upstream long TTL but retain validators for revalidation',async()=>{
 for(const path of ['/_hb/platform.js','/workspace-shell.js?v=unchanged','/src/ui/site-shell.css','/voltpro-plc/assets/index-old.js']){
  const r=await worker.fetch(new Request(origin+path),{ASSETS:{fetch:async()=>new Response('new code',{headers:{'content-type':'text/javascript',etag:'new','cache-control':'public,max-age=31536000,immutable'}})}});
  assert.equal(r.headers.get('cache-control'),'no-cache');assert.equal(r.headers.get('etag'),'new');assert.equal(r.headers.get('cloudflare-cdn-cache-control'),'no-store');
 }
});
test('release metadata is public on every public host and cannot be cached',async()=>{
 for(const host of ['engineering.','cyber.','']){
  const r=await worker.fetch(new Request('https://'+host+'hephzibahbehulah.com/_hb/release.json'),{ASSETS:{fetch:async()=>Response.json({commitHash:'b'.repeat(40)})}});
  assert.equal((await r.json()).commitHash,'b'.repeat(40));assert.equal(r.headers.get('cache-control'),'no-store');
 }
});
test('missing JS stays a real 404 instead of becoming an HTML fallback',async()=>{
 const r=await worker.fetch(new Request(origin+'/missing.js'),{ASSETS:{fetch:async()=>new Response(null,{status:404})}});assert.equal(r.status,404);assert.equal(r.headers.get('cache-control'),'no-cache');
});
function harness({fetcher=async()=>new Response('release B'),cacheNames=[]}={}){
 const events={},deleted=[],opened=[],calls=[];
 const context={URL,Response,self:{location:{origin},clients:{claim:async()=>{}},skipWaiting:async()=>calls.push('skip'),addEventListener:(name,fn)=>events[name]=fn},caches:{keys:async()=>cacheNames,delete:async name=>deleted.push(name),open:async name=>{opened.push(name);return {keys:async()=>[],match:async()=>new Response('old media'),put:async()=>{}};}},fetch:async(request,options)=>{calls.push(options);return fetcher(request,options);}};
 vm.runInNewContext(publicServiceWorker,context);
 return {events,deleted,opened,calls,async fetch(path,mode){let result;events.fetch({request:{url:origin+path,method:'GET',mode},respondWith:value=>result=value,waitUntil:()=>{}});return result;}};
}
test('old browser cache cannot satisfy online application code after deployment A to B',async()=>{
 const h=harness();for(const p of ['/workspace-shell.js?v=unchanged','/style.css','/tool.json','/api/member/session','/_hb/release.json'])assert.equal(await(await h.fetch(p)).text(),'release B');
 assert.equal(h.opened.length,0);assert.ok(h.calls.every(options=>options.cache==='no-store'));
});
test('offline application code fails rather than silently mixing release A with B',async()=>{
 const h=harness({fetcher:async()=>{throw Error('offline');}});await assert.rejects(h.fetch('/tool.js'),/offline/);await assert.rejects(h.fetch('/plc','navigate'),/offline/);assert.equal(h.opened.length,0);
});
test('offline media fallback reads only this worker cache',async()=>{
 const h=harness({fetcher:async()=>{throw Error('offline');}});assert.equal(await(await h.fetch('/runtime/test.wasm')).text(),'old media');assert.deepEqual(h.opened,['hb-public-static-v2']);
});
test('activation cleans owned legacy caches and leaves unrelated origin caches intact',async()=>{
 const h=harness({cacheNames:['hb-site-v6','voltpro-v93','hb-public-static-20261019','other-app-v1','hb-public-static-v2']});let done;h.events.activate({waitUntil:p=>done=p});await done;assert.deepEqual(h.deleted,['hb-site-v6','voltpro-v93','hb-public-static-20261019']);assert.ok(!h.opened.includes('other-app-v1'));
});
test('worker waits by default and activates only after the update action',async()=>{
 const h=harness();assert.equal(h.events.install,undefined);let done;h.events.message({data:{type:'HB_ACTIVATE_UPDATE'},waitUntil:p=>done=p});await done;assert.deepEqual(h.calls,['skip']);
});
