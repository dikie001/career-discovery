const CACHE_NAME = "pathfinder-v1"
const RUNTIME_CACHE = "pathfinder-runtime-v1"
const PAGES_CACHE = "pathfinder-pages-v1"

const ASSETS_TO_CACHE = [
  "/",
  "/offline.html",
  "/logo.png",
  "/manifest.json",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching assets")
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[Service Worker] Failed to cache some assets:", err)
        // Continue even if some assets fail to cache
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== PAGES_CACHE) {
            console.log("[Service Worker] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome extensions
  if (url.protocol === "chrome-extension:") {
    return
  }

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "error") {
            return response
          }

          const cache = caches.open(RUNTIME_CACHE)
          cache.then((c) => c.put(request, response.clone()))
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached
            }
            // Return offline page for failed API calls
            return new Response("Offline - Data not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ "Content-Type": "text/plain" }),
            })
          })
        })
    )
    return
  }

  // HTML pages - network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response
          }

          const cache = caches.open(PAGES_CACHE)
          cache.then((c) => c.put(request, response.clone()))
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached
            }
            return caches.match("/offline.html")
          })
        })
    )
    return
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response
        }

        const cache = caches.open(RUNTIME_CACHE)
        cache.then((c) => c.put(request, response.clone()))
        return response
      })
    })
  )
})

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLIENTS_CLAIM") {
    self.clients.claim()
  }
})
