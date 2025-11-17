// Service Worker — handle cache (as before) and push events for background notifications

const CACHE_NAME = "tasklist-cache-v1";
const urlsToCache = [
  "./index.html",
  "./manifest.json",
  "./install-prompt.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});

// Handle push events sent from your server (this runs even if page is closed)
self.addEventListener('push', event => {
  let data = { title: 'Reminder', body: 'You have a reminder', url: './index.html' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) { console.warn('push event data not json', e); }

  const options = {
    body: data.body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: { url: data.url } // optional: used when notification clicked
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === urlToOpen || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
