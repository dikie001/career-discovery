// Production-only PWA Service Worker
// This service worker is intentionally disabled for offline use.
// It only works in production and prevents offline functionality.

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!IS_PRODUCTION) {
  // Unregister service worker in non-production environments
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', (event) => {
    // No offline caching in development
  });
} else {
  // Production: Limited functionality, no offline support
  const CACHE_NAME = 'pathfinder-v1';

  // Cache only essential assets on install
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        // Only cache the app shell, no aggressive offline caching
        return cache.addAll([
          '/',
          '/offline.html',
        ]);
      })
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
    );
    self.clients.claim();
  });

  // Network first, but don't serve cache offline
  self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
      return;
    }

    // Skip API calls - must be online
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request).catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline - this app requires an internet connection' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
      return;
    }

    // Network first for HTML/pages
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Don't serve from cache - this ensures offline means offline
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              // We have a cached response, but only serve it if it's the root path
              if (event.request.url.endsWith('/')) {
                return cachedResponse;
              }
            }
            // Otherwise return offline page
            return caches.match('/offline.html') || new Response('Offline');
          });
        })
    );
  });
}
