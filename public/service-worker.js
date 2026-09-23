// In questo script si ascoltano gli eventi di :
// - installazione
// - attivazione
// che sono le altre due fasi del lifecycle del ServiceWorker
const CURRENT_CACHE = 'version1';
self.addEventListener('install', (event) => {
  console.log('service worker installed', event);
  // aggiunta elenco risorse da mettere in cache
  /* event.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      // mmtto in cache il file test-1.js
      return cache.addAll(
        [
          // '/js/test-1.js',
          // '/js/test-2.js'
          // 'script.js',
        ]);
    })
  ); */
});

self.addEventListener('activate', (event) => {
  console.log('service worker activated', event);
});

// evento fetch per il recupero delle richieste fatte
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
