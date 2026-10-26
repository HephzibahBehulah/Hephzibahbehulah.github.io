// Online application code is always fetched fresh. Only non-code runtime/media
// resources have an offline fallback; stale HTML/JS/CSS must never be mixed.
export const publicServiceWorker=`const CACHE='hb-public-static-v2';
const owned=name=>name.startsWith('hb-public-static-')||name.startsWith('voltpro-')||name.startsWith('hb-site-');
self.addEventListener('message',event=>{if(event.data?.type==='HB_ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys()){
  if(!owned(name))continue;
  if(name!==CACHE){await caches.delete(name);continue;}
  const cache=await caches.open(name);
  for(const request of await cache.keys()){
   const url=new URL(request.url),response=await cache.match(request);
   if(!offlineResource(url)||response?.headers.get('content-type')?.includes('text/html'))await cache.delete(request);
  }
 }
 await self.clients.claim();
})()));
function offlineResource(url){return !url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/_hb/')&&/\\.(?:wasm|woff2?|ttf|png|jpe?g|webp|svg|ico)$/.test(url.pathname);}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'||!offlineResource(url)){event.respondWith(fetch(request,{cache:'no-store'}));return;}
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request,{cache:'no-cache'});
   if(response.ok&&!response.headers.get('cache-control')?.includes('no-store')&&!response.headers.get('content-type')?.includes('text/html'))event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
   return response;
  }catch(error){return await cache.match(request)||Response.error();}
 })());
});`;
