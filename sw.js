const CACHE="roboquest-v8";
const FILES=["./","index.html","manifest.json","icon-192.png","icon-512.png","rq-banner.jpg","av-car.png","av-think.png","av-solder.png","av-gears.png","av-ladder.png","av-thumbs.png","av-fire.png","av-gearhold.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.url.endsWith(".mp4"))return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
