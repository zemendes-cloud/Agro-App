const CACHE_NAME = 'herbanario-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/offline.html',
  '/pages/sobre.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/db.js',
  '/assets/js/modules/api.js',
  '/assets/js/modules/UI.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); }))));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((response) => {
      if (response) return response;
      if (event.request.mode === 'navigate') return caches.match('/pages/offline.html');
    }))
  );
});
