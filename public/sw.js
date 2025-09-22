// Service Worker with safer caching to avoid white screen after deploys
// - Do NOT cache HTML or Next.js dynamic chunks with cache-first
// - Prefer network-first for navigations; SWR for static hashed assets

const STATIC_CACHE = 'coastal-static-v5';
const RUNTIME_CACHE = 'coastal-runtime-v5';

// Only precache safe, local static assets. Do not precache '/'
const urlsToPrecache = [
  '/assets/favicon.png',
  '/assets/logo.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  '/assets/background.svg',
  '/assets/bg-loading.webp',
  '/assets/Loading Map BG.png',
  '/assets/Loading Map Overlay.png',
  '/assets/coin-icon.webp',
  '/assets/tutorial-bg.webp',
  '/assets/arrows-down.svg',
  '/assets/PUB_RidingTheTides_White.png',
  '/assets/PUB logo_white_transparent 2.svg',
  '/assets/map-v2.svg?v=1',
  '/assets/sector1-highlight-v2.svg',
  '/assets/sector2-highlight-v2.svg',
  '/assets/sector3-highlight-v2.svg',
  '/assets/seawall.webp',
  '/assets/mangroves-icon-3a15a8.webp',
  '/assets/storm-surge-barrier-icon.webp',
  '/assets/modal-arrow.svg',
  '/assets/hybrid-measure.webp',
  '/assets/coastal-barriers.webp',
  '/assets/artificial-reef.webp',
  '/assets/land-reclemation.webp',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.all(
        urlsToPrecache.map((url) => cache.add(url).catch(() => undefined))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      );
    }).then(() => self.clients.claim())
  );
});

function isNextAsset(requestUrl) {
  return requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/_next/');
}

function isLocalStaticAsset(requestUrl) {
  return requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/assets/');
}

function isNavigationRequest(event) {
  return event.request.mode === 'navigate';
}

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass for API and non-GET
  if (event.request.method !== 'GET' || requestUrl.pathname.startsWith('/api')) {
    return; // let the network handle it
  }

  // Always network-first for navigations (HTML)
  if (isNavigationRequest(event)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Stale-While-Revalidate for Next hashed assets
  if (isNextAsset(requestUrl)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkPromise = fetch(event.request).then((response) => {
          // Only cache successful, CORS-allowed responses
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => undefined);
        return cached || networkPromise || fetch(event.request);
      })
    );
    return;
  }

  // Cache-first for local static assets
  if (isLocalStaticAsset(requestUrl)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
    return;
  }

  // For cross-origin media (e.g., GCS mp4), use cache-first conservatively
  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              return caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
            }
            return response;
          })
        );
      })
    );
    return;
  }
});

// Optional: listen for manual skip waiting
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});