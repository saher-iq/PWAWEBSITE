// service-worker.js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `tasklist-cache-${CACHE_VERSION}`;

// Adjust base path for GitHub Pages repo: '/username/repo-name'
// If serving at root (username.github.io), set BASE = '/'
const BASE = self.registration.scope.endsWith('/') ? self.registration.scope : '/';

const URLS_TO_CACHE = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}style.css`,
  `${BASE}main.js`,
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

// Network-first for navigation; cache-first for assets
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
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
      for (let client of windowClients) {
        // Focus first matching client
        return client.focus();
      }
      return clients.openWindow(`${BASE}index.html`);
    })
  );
});
