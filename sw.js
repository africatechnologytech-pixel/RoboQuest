const VER="AFT 2.0",CACHE="roboquest-v187",MEDIA="roboquest-media";
const VIDEO="Video.Guru_20261004_044522845.mp4";
const FB=["https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js","https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"];
const SHELL=["./","index.html","icons.js?v=47","firebase-config.js?v=37","cloud.js?v=64","manifest.json","privacy.txt","mcu-logo.png","av-think.png","quiz-good.webp","quiz-bad.webp"];const PICS=["mcu-logo.png","av-think.png","quiz-good.webp","quiz-bad.webp"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  await Promise.all(SHELL.map(async u=>{try{const r=await fetch(new Request(u+(u.indexOf("?")<0?"?":"&")+"cb="+CACHE,{cache:"reload"}));if(r.ok)await c.put(new Request(u),r)}catch(x){if(u==="index.html"||u==="./")throw x}}));
  await Promise.all(FB.map(async u=>{try{if(!(await c.match(u))){const r=await fetch(u,{mode:"no-cors"});await c.put(u,r)}}catch(x){}}));
  try{const pm=await caches.open(MEDIA);await Promise.all(PICS.map(async u=>{try{if(!(await pm.match(u))){const r=await fetch(u);if(r.ok)await pm.put(u,r)}}catch(x){}}))}catch(x){}
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
  const buf=await res.blob();
  const m=/bytes=(\d+)-(\d*)/.exec(range);
  const start=m?+m[1]:0,end=m&&m[2]?Math.min(+m[2],buf.size-1):buf.size-1;
  return new Response(buf.slice(start,end+1),{status:206,headers:{"Content-Type":res.headers.get("Content-Type")||"video/mp4","Content-Range":`bytes ${start}-${end}/${buf.size}`,"Content-Length":String(end-start+1)}});
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(FB.indexOf(e.request.url)>=0){e.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(e.request.url);if(hit)return hit;try{const n=await fetch(e.request);try{c.put(e.request.url,n.clone())}catch(x){}return n}catch(x){return Response.error()}})());return}
  if(u.pathname.endsWith(".mp4")){e.respondWith(serveVideo(e.request));return}
  if(/\.(png|jpe?g|webp|gif|svg)$/i.test(u.pathname)){e.respondWith(caches.open(MEDIA).then(async c=>{let hit=await c.match(e.request,{ignoreSearch:true});if(!hit)hit=await caches.match(e.request,{ignoreSearch:true});const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit||Response.error());return hit||net}));return}
  if(u.origin===location.origin&&u.pathname.endsWith("privacy.txt")){e.respondWith((async()=>{const c=await caches.open(CACHE);try{const n=await fetch(e.request,{cache:"no-store"});if(n.ok){c.put("privacy.txt",n.clone());return n}}catch(x){}const h=await c.match("privacy.txt");return h||new Response("",{status:404})})());return}
  if(u.origin===location.origin){e.respondWith((async()=>{const c=await caches.open(CACHE);let r=await c.match(e.request);if(r)return r;
    if(e.request.mode==="navigate"){r=(await c.match("index.html"))||(await c.match("./"));if(r)return r}
    try{const n=await fetch(e.request);if(n.ok)c.put(e.request,n.clone());return n}catch(x){const any=await caches.match(e.request,{ignoreSearch:true});if(any)return any;throw x}})());return}
  e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{})}return r}).catch(()=>caches.match(e.request)));
});
