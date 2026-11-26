// Life Trail: mostra os lembretes do celular. Não guarda o app em cache.
// 26/11/2026: os lembretes chegam cifrados; a chave fica só neste aparelho.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
const un64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function abrir(p){const db=await new Promise((ok,no)=>{const r=indexedDB.open('lifetrail-regiane-push',1);r.onupgradeneeded=()=>r.result.createObjectStore('keys');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});const raw=await new Promise((ok,no)=>{const r=db.transaction('keys','readonly').objectStore('keys').get('payload');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});db.close();const k=await crypto.subtle.importKey('raw',un64(raw),'AES-GCM',false,['decrypt']);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(p.iv)},k,un64(p.data))))}
self.addEventListener('push',e=>e.waitUntil((async()=>{let p={},m={t:'Você tem um lembrete no Life Trail. Toque para ver.'};try{p=e.data.json();if(p.encrypted)m=await abrir(p.encrypted)}catch(x){}
 await self.registration.showNotification('Life Trail',{body:String(m.t).slice(0,250),icon:'life-trail-192-v1.png',badge:'life-trail-192-v1.png',tag:p.tag||'lifetrail',data:{url:self.registration.scope}})})()));
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'./';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{const w=l.find(c=>c.url.startsWith(self.registration.scope));if(w)return w.focus();return self.clients.openWindow(url)}))});
