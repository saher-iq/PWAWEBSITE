// service-worker.js
const CACHE_VERSION = 'v2';
const CACHE_NAME = `tasklist-cache-${CACHE_VERSION}`;

const BASE = self.registration.scope;

const URLS_TO_CACHE = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}stopwatch.html`,
  `${BASE}manifest.json`,
  `${BASE}style.css`,
  `${BASE}main.js`,
  `${BASE}stopwatch.js`,
  `${BASE}install-prompt.js`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Network-first for same-origin files (so updates always show), cache as fallback offline
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then(cached => cached || caches.match(`${BASE}index.html`))
      )
  );
});

// Listen for messages to show notifications
self.addEventListener('message', event => {
  const { type, title, body } = event.data || {};
  if (type === 'notify') {
    self.registration.showNotification(title || 'Reminder', {
      body: body || 'You have a reminder',
      icon: `${BASE}icons/icon-192.png`,
      badge: `${BASE}icons/icon-192.png`,
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      if (windowClients.length > 0) return windowClients[0].focus();
      return clients.openWindow(`${BASE}index.html`);
    })
  );
});
