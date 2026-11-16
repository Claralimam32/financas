const V="mvf-d2511162",APP=["./","index.html","manifest.json","icon-192.png","icon-512.png","icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(APP.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("mvf-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url);
 if(u.origin===location.origin){ // app: usa o que está guardado e atualiza por trás
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:true})||(r.mode==="navigate"?await c.match("index.html"):null);
   const net=fetch(r,{cache:"no-cache"}).then(res=>{if(res.ok)return c.put(r,res.clone()).then(()=>res);return res}).catch(()=>hit);e.waitUntil(net.catch(()=>{}));return hit||net}));return}
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // fontes: guarda para usar offline
  e.respondWith(caches.open(V+"-fontes").then(async c=>(await c.match(r))||fetch(r).then(res=>{c.put(r,res.clone());return res})))}});
async function avisar(){const c=await caches.open("avisos"),r=await c.match("avisos.json");if(!r)return;
 const {raw}=await r.json(),n=new Date(),hj=new Date(n.getFullYear(),n.getMonth(),n.getDate()),id=hj.toISOString().slice(0,10);
 const f=await c.match("ultimo");if(f&&await f.text()===id)return;
 const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 for(const x of raw||[]){const k=Math.round((new Date(x.date+"T00:00:00")-hj)/864e5);if(k>1)continue;
  await self.registration.showNotification(x.t,{body:(k<0?"Atrasada há "+(-k)+(k===-1?" dia":" dias"):k===0?"Vence hoje":"Vence amanhã")+" · "+brl(x.v),tag:x.t+x.date,icon:"icon-192.png",badge:"icon-192.png"})}
 await c.put("ultimo",new Response(id))}
self.addEventListener("periodicsync",e=>{if(e.tag==="avisos")e.waitUntil(avisar())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow("./")))});
