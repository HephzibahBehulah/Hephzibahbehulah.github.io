// Keep static learning/runtime assets available without caching account data.
export const publicServiceWorker=`const CACHE='hb-public-static-20261019';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys()){
  const cache=await caches.open(name);
  for(const request of await cache.keys()){
   const url=new URL(request.url),response=await cache.match(request);
   if(url.pathname.startsWith('/api/')||response?.headers.get('content-type')?.includes('text/html'))await cache.delete(request);
  }
 }
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const sensitive=url.pathname.startsWith('/api/')||url.pathname.startsWith('/_hb/')||request.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname==='/account';
 if(sensitive){event.respondWith(fetch(request,{cache:'no-store'}));return;}
 event.respondWith((async()=>{
  try{const response=await fetch(request);if(response.ok&&!response.headers.get('cache-control')?.includes('no-store')&&!response.headers.get('content-type')?.includes('text/html')){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
  catch(error){return await caches.match(request)||Response.error();}
 })());
});`;
