const CACHE="roboquest-v10";
const VIDEO="Video.Guru_20261004_044522845.mp4";
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.add(VIDEO)).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function serveVideo(req){
  const cache=await caches.open(CACHE);
  let res=await cache.match(req.url);
  if(!res){try{const net=await fetch(req.url);if(net.ok){await cache.put(req.url,net.clone());res=net}}catch(e){}}
  if(!res)return fetch(req);
  const range=req.headers.get("range");
  if(!range)return res;
  const buf=await res.arrayBuffer();
  const m=/bytes=(\d+)-(\d*)/.exec(range);
  const start=m?+m[1]:0,end=m&&m[2]?Math.min(+m[2],buf.byteLength-1):buf.byteLength-1;
  return new Response(buf.slice(start,end+1),{status:206,headers:{"Content-Type":res.headers.get("Content-Type")||"video/mp4","Content-Range":`bytes ${start}-${end}/${buf.byteLength}`,"Content-Length":String(end-start+1)}});
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(e.request.url.endsWith(".mp4")){e.respondWith(serveVideo(e.request));return}
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{})}return r}).catch(()=>caches.match(e.request)));
});
