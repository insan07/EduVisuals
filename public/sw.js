// Service Worker for EduVisuals
const CACHE_NAME = "eduvisuals-static-v1";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  "/",
  "/offline",
  "/favicon.ico"
];

// Install: Cache Shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Purge old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests or internal dev sockets
  if (event.request.method !== "GET" || event.request.url.includes("/_next/") || event.request.url.includes("webpack")) {
    return;
  }

  // Cache-first for images/placeholder visual assets
  if (event.request.destination === "image" || event.request.url.includes(".jpg") || event.request.url.includes(".png") || event.request.url.includes(".svg")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match("/favicon.ico"));
      })
    );
    return;
  }

  // Network-first with offline fallback for pages
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline mode content unavailable.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
      })
  );
});
