const CACHE_NAME = 'herbanario-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/offline.html',
  '/pages/sobre.html',
  '/pages/dashboard.html',
  '/pages/plants.html',
  '/pages/add-plant.html',
  '/pages/calendar.html',
  '/pages/profile.html',
  '/assets/css/styles.css',
  '/assets/css/dashboard.css',
  '/assets/css/garden-common.css',
  '/assets/css/plants.css',
  '/assets/css/add-plant.css',
  '/assets/css/calendar.css',
  '/assets/css/profile.css',
  '/assets/js/app.js',
  '/assets/js/db.js',
  '/assets/js/modules/api.js',
  '/assets/js/modules/UI.js',
  '/assets/js/dashboard.js',
  '/assets/js/plants.js',
  '/assets/js/add-plant.js',
  '/assets/js/calendar.js',
  '/assets/js/profile.js',
  '/assets/js/home-redirect.js'
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
