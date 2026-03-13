const CACHE_NAME = 'lar-v2-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
];

// Install – cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate – remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch – serve from cache first, then network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request).then(fetchResp => {
        // Dynamically cache new requests (e.g., imported JSON)
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, fetchResp.clone());
          return fetchResp;
        });
      }).catch(() => {
        // Optional: fallback offline page or empty response
        return new Response('', {status: 200, statusText: 'Offline'});
      });
    })
  );
});
