// One-time migration worker: remove old app caches, then retire itself.
export const publicServiceWorker=`const OWNED=['hb-site-','voltpro-','hb-public-static-'];
const CLEAN_ALL=['hephzibahbehulah.com','www.hephzibahbehulah.com','engineering.hephzibahbehulah.com'].includes(self.location.hostname);
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('message',event=>{if(event.data?.type==='HB_ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>CLEAN_ALL||OWNED.some(prefix=>name.startsWith(prefix))).map(name=>caches.delete(name)));
 await self.clients.claim();
 await self.registration.unregister();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method==='GET'&&url.origin===self.location.origin)event.respondWith(fetch(request,{cache:'no-store'}));
});`;
