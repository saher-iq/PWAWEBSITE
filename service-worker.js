const CACHE_NAME = "task-pwa-cache-v1";
const urlsToCache = [
  "/PWAWEBSITE/index.html",
  "/PWAWEBSITE/manifest.json",
  "/PWAWEBSITE/icons/icon-192.png",
  "/PWAWEBSITE/icons/icon-512.png",
  "/PWAWEBSITE/style.css" // إذا لديك ملف CSS خارجي
];

// Install SW and cache resources
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Serve cached content
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
