const CACHE_NAME = 'coastal-game-v3';
const urlsToCache = [
  '/',
  '/assets/favicon.png',
  '/assets/logo.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  '/assets/background.svg',
  '/assets/controller-background.png',
  '/assets/bg-loading.png',
  '/assets/Loading Map BG.png',
  '/assets/Loading Map Overlay.png',
  '/assets/coin-icon.png',
  '/assets/tutorial-bg.png',
  '/assets/arrows-down.svg',
  '/assets/PUB_RidingTheTides_White.png',
  '/assets/PUB logo_white_transparent 2.svg',
  '/assets/map-v2.svg?v=1',
  '/assets/sector1-highlight-v2.svg',
  '/assets/sector2-highlight-v2.svg',
  '/assets/sector3-highlight-v2.svg',
  '/assets/start-screen-bg-updated.webp',
  '/assets/land-reclamation-icon-6b707d.png',
  '/assets/seawall-icon-41fadd.png',
  '/assets/mangroves-icon-3a15a8.png',
  '/assets/storm-surge-barrier-icon.png',
  '/assets/artificial-reef-icon.png',
  '/assets/hybrid-measure-icon.png',
  '/assets/modal-arrow.svg',
  '/assets/input-team-name-bg.png',
  // Add other critical assets that should be cached
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});