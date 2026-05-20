const CACHE_NAME = "arahaven-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  OFFLINE_URL,
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install Event - Pre-cache essential offline files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Caching Strategy
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests (e.g. POST, Server Actions, Admin panel operations)
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Ignore chrome-extension or external analytics calls
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Handle local pages & API (Network First, fallback to cache, then offline.html)
  if (
    event.request.mode === "navigate" ||
    url.pathname.startsWith("/catalog") ||
    url.pathname.startsWith("/blog") ||
    url.pathname.startsWith("/gallery") ||
    url.pathname.startsWith("/about")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Open cache and save the latest version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, return the offline.html fallback
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle static assets like CSS, JS, Google Fonts, and images (Cache First)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // If valid response, save to cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback check for images if offline
          if (event.request.destination === "image") {
            return caches.match("/icons/icon-192x192.png");
          }
        });
    })
  );
});
