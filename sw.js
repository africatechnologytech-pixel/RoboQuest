const VER="16G",CACHE="roboquest-v59",MEDIA="roboquest-media";
const VIDEO="Video.Guru_20261004_044522845.mp4";
const SHELL=["./","index.html","icons.js?v=35","firebase-config.js?v=35","cloud.js?v=35","manifest.json"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  await Promise.all(SHELL.map(async u=>{try{const r=await fetch(new Request(u,{cache:"reload"}));if(r.ok)await c.put(new Request(u),r)}catch(x){if(u==="index.html"||u==="./")throw x}}));
  try{const m=await caches.open(MEDIA);if(!(await m.match(VIDEO)))await m.add(VIDEO)}catch(x){}})())});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf("roboquest-v")===0&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data==="skip")self.skipWaiting();if(e.data==="ver"&&e.ports&&e.ports[0])e.ports[0].postMessage({c:CACHE,v:VER})});
async function serveVideo(req){
  const cache=await caches.open(MEDIA);
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
  const u=new URL(e.request.url);
  if(u.pathname.endsWith(".mp4")){e.respondWith(serveVideo(e.request));return}
  if(/\.(png|jpe?g|webp|gif|svg)$/i.test(u.pathname)){e.respondWith(caches.open(MEDIA).then(async c=>{const hit=await c.match(e.request);const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
  if(u.origin===location.origin){e.respondWith((async()=>{const c=await caches.open(CACHE);let r=await c.match(e.request);if(r)return r;
    if(e.request.mode==="navigate"){r=(await c.match("index.html"))||(await c.match("./"));if(r)return r}
    try{const n=await fetch(e.request);if(n.ok)c.put(e.request,n.clone());return n}catch(x){const any=await caches.match(e.request,{ignoreSearch:true});if(any)return any;throw x}})());return}
  e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{})}return r}).catch(()=>caches.match(e.request)));
});
