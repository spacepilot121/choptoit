/* Cache a complete release atomically. A failed download never replaces a
   working offline release. Updates activate after tabs close or an explicit update. */
importScripts('./offline-assets.js');
const CACHE = 'choptoit-release-' + self.CHOP_RELEASE.version;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Small groups avoid saturating mobile connections with hundreds of requests.
      const files = self.CHOP_RELEASE.files;
      for (let i = 0; i < files.length; i += 8) {
        await cache.addAll(files.slice(i, i + 8).map(file=>new Request(new URL(file,self.location.href),{cache:'reload'})));
        // Progress is informational; a closed tab must not fail installation.
        try {
          const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
          const progress = {type:'choptoit-offline-progress',completed:Math.min(i + 8,files.length),total:files.length};
          clients.forEach(client => client.postMessage(progress));
        } catch (_) {}
      }
    } catch (error) { await caches.delete(CACHE); throw error; }
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='choptoit-activate-update')event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('choptoit-release-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, {ignoreSearch:true});
    if (cached) return cached;
    if (event.request.mode === 'navigate' && url.pathname === new URL('./',self.location).pathname) {
      const entry = await cache.match('./index.html');
      if (entry) return entry;
    }
    return fetch(event.request);
  })());
});
