const CACHE_NAME = 'coastal-game-v3';
const userAgent = navigator.userAgent || "";
const isAppleMobile = /iPad|iPhone|iPod/.test(userAgent);
const isModernIPad = !isAppleMobile && navigator.platform === "MacIntel" && (navigator).maxTouchPoints > 1;
const isIOS = isAppleMobile || isModernIPad;

const CUT_SCENES = [
  "news intro 1",
  "news intro 2",
  "news intro 3",

  "R1-1A-0",
  "R1-1A-1",
  "R1-1A-2",
  "R1-1A-3",
  "R1-1A-4",
  "R1-1A-5",

  "R1-1B-0",
  "R1-1B-1",
  "R1-1B-2",
  "R1-1B-3",
  "R1-1B-4",
  "R1-1B-5",

  "R1-2A-0",
  "R1-2A-1",
  "R1-2A-2",
  "R1-2A-3",
  "R1-2A-4",
  "R1-2A-5",

  "R1-2B-0",
  "R1-2B-1",
  "R1-2B-2",
  "R1-2B-3",
  "R1-2B-4",
  "R1-2B-5",


  "R1-3A-0",
  "R1-3A-1",
  "R1-3A-2",
  "R1-3A-3",
  "R1-3A-4",

  "R1-3B-0",
  "R1-3B-1",
  "R1-3B-2",
  "R1-3B-3",
  "R1-3B-4",

  "R2-1A-0",
  "R2-1A-1",
  "R2-1A-2",
  "R2-1A-3",
  "R2-1A-4",
  "R2-1A-5",
  "R2-1A-6",
  "R2-1A-7",
  "R2-1A-8",
  "R2-1A-9",
  "R2-1A-10",
  "R2-1A-11",
  "R2-1A-12",
  "R2-1A-13",
  "R2-1A-14",
  "R2-1A-15",
  "R2-1A-16",
  "R2-1A-17",

  "R2-1B-0",
  "R2-1B-1",
  "R2-1B-2",
  "R2-1B-3",
  "R2-1B-4",
  "R2-1B-5",
  "R2-1B-6",
  "R2-1B-7",
  "R2-1B-8",
  "R2-1B-9",
  "R2-1B-10",
  "R2-1B-11",
  "R2-1B-12",
  "R2-1B-13",
  "R2-1B-14",

  "R2-2A-0",
  "R2-2A-1",
  "R2-2A-2",
  "R2-2A-3",
  "R2-2A-4",
  "R2-2A-5",
  "R2-2A-6",
  "R2-2A-7",
  "R2-2A-8",
  "R2-2A-9",
  "R2-2A-10",

  "R2-2B-0",
  "R2-2B-1",
  "R2-2B-2",
  "R2-2B-3",
  "R2-2B-4",
  "R2-2B-5",
  "R2-2B-6",
  "R2-2B-7",
  "R2-2B-8",
  "R2-2B-9",

  "R2-3A-0",
  "R2-3A-1",
  "R2-3A-2",
  "R2-3A-3",
  "R2-3A-4",
  "R2-3A-5",
  "R2-3A-6",
  "R2-3A-7",
  "R2-3A-8",
  "R2-3A-9",
  "R2-3A-10",
  "R2-3A-11",
  "R2-3A-12",
  "R2-3A-13",
  "R2-3A-14",
  "R2-3A-15",

  "R2-3B-0",
  "R2-3B-1",
  "R2-3B-2",
  "R2-3B-3",
  "R2-3B-4",
  "R2-3B-5",
  "R2-3B-6",
  "R2-3B-7",
  "R2-3B-8",
  "R2-3B-9",
  "R2-3B-10",
  "R2-3B-11",
  "R2-3B-12",
];

const urlsToCache = [
  '/',
  '/assets/favicon.png',
  '/assets/logo.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  '/assets/background.svg',
  '/assets/bg-loading.webp',
  '/assets/Loading Map BG.png',
  '/assets/Loading Map Overlay.png',
  `https://storage.googleapis.com/pub-coastal-game-files/${isIOS ? "mobile/" : ""}news intro 1.mp4`,
  `https://storage.googleapis.com/pub-coastal-game-files/${isIOS ? "mobile/" : ""}news intro 2.mp4`,
  `https://storage.googleapis.com/pub-coastal-game-files/${isIOS ? "mobile/" : ""}news intro 3.mp4`,
  '/assets/coin-icon.webp',
  '/assets/tutorial-bg.webp',
  '/assets/arrows-down.svg',
  '/assets/PUB_RidingTheTides_White.png',
  '/assets/PUB logo_white_transparent 2.svg',
  '/assets/map-v2.svg?v=1',
  '/assets/sector1-highlight-v2.svg',
  '/assets/sector2-highlight-v2.svg',
  '/assets/sector3-highlight-v2.svg',
  '/assets/land-reclamation-icon-6b707d.png',
  '/assets/seawall-icon-41fadd.png',
  '/assets/seawall.webp',
  '/assets/mangroves-icon-3a15a8.png',
  '/assets/storm-surge-barrier-icon.webp',
  '/assets/artificial-reef-icon.webp',
  '/assets/hybrid-measure-icon.webp',
  '/assets/modal-arrow.svg',
  '/assets/hybrid-measure.webp',
  '/assets/coastal-barriers.webp',
  '/assets/artificial-reef.webp',
  '/assets/land-reclemation.webp',
  // ...Object.values(CUT_SCENES).map((value) => `https://storage.googleapis.com/pub-coastal-game-files/${isIOS ? "mobile/" : ""}${value?.replaceAll("-", " ").toLocaleLowerCase()}.mp4`)
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