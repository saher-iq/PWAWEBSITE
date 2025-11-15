const CACHE_NAME = "task-app-v1";
const ASSETS = [
  "/PWAWEBSITE/",
  "/PWAWEBSITE/index.html",
  "/PWAWEBSITE/manifest.json",
  "/PWAWEBSITE/install-prompt.js",
  "/PWAWEBSITE/service-worker.js",
  "/PWAWEBSITE/icons/icon-192.png",
  "/PWAWEBSITE/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cacheRes) => cacheRes || fetch(e.request))
  );
});
