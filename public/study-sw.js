const META='superweb-offline-meta';
async function stored(path){const meta=await caches.open(META),pointer=await meta.match('/active-pack');if(!pointer)return;const info=await pointer.json(),cache=await caches.open(info.cache);return cache.match(path)}
self.addEventListener('install',()=>{ /* Learners explicitly download each complete text pack. */ });
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(u.origin!==self.location.origin||event.request.method!=='GET'||u.pathname.startsWith('/api/')||u.pathname.startsWith('/_next/'))return;
 if(['/offline.html','/offline-course.json','/icon.svg','/manifest.webmanifest','/icon-192.png','/icon-512.png'].includes(u.pathname))event.respondWith(fetch(event.request).catch(async()=>await stored(u.pathname)||new Response('Offline pack not downloaded',{status:503})));
 else if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(async()=>await stored('/offline.html')||new Response('Open Mandarin Sprout online and download the offline pack first.',{status:503})));
});
