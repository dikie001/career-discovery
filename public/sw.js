// Production-only PWA Service Worker
// This service worker is intentionally disabled for offline use.
// It only works in production and prevents offline functionality.

const CACHE_NAME = 'pathfinder-v1';

// Check if running in production via checking the server origin
function isProduction() {
  // In production, the origin should be the actual domain
  // In development, it's typically localhost
  const origin = typeof self !== 'undefined' ? self.location.origin : '';
  return !origin.includes('localhost') && !origin.includes('127.0.0.1');
}

if (!isProduction()) {
  // Non-production: Unregister or skip service worker
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    // Clean up all caches in development
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    // No offline caching in development
  });
} else {
  // Production: Limited functionality, no offline support
  // Cache only essential assets on install
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        // Only cache the app shell, no aggressive offline caching
        return cache.addAll([
          '/',
          '/offline.html',
        ]).catch(() => {
          // Offline.html might not exist yet during first install
          console.log('Some assets could not be cached during install');
        });
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
