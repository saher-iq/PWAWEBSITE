const CACHE_NAME = "tasklist-cache-v1";
const urlsToCache = [
  "./index.html",
  "./main/manifest.json",
  "./main/install-prompt.js",
  "./main/icons/icon-192.png",
  "./main/icons/icon-512.png",
  "./main/style.css" // لو استعملت ملف CSS خارجي
];

// Install SW
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate SW
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
