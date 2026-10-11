const CACHE='superelly-level1-v2';
const BASE='/superelly';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([BASE,BASE+'/bakery-monsters',BASE+'/manifest.webmanifest',...['elly-idle','elly-run','elly-jump','yellow','pink','blue','boss','cookie','crate','bakery'].map(n=>BASE+'/assets/'+n+'.webp')])));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('superelly-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;if(!(url.pathname.startsWith(BASE)||url.pathname.startsWith('/_next/static/')))return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return response;}).catch(()=>caches.match(req).then(r=>r||caches.match(BASE+'/bakery-monsters'))));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return response;})));
});

self.addEventListener('message',event=>{if(event.data?.type!=='CACHE_GAME'||!Array.isArray(event.data.urls))return;const urls=event.data.urls.filter(value=>{try{const url=new URL(value);return url.origin===self.location.origin&&url.pathname.startsWith('/_next/static/');}catch{return false;}});event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(urls.map(url=>cache.add(url).catch(()=>{})))));});
