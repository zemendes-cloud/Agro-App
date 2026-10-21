const CACHE_NAME = 'herbanario-cache-v31';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'favicon.svg',
  'pages/offline.html',
  'pages/menu.html',
  'pages/dashboard.html',
  'pages/plants.html',
  'pages/add-plant.html',
  'pages/calendar.html',
  'pages/profile.html',
  'pages/login.html',
  'pages/register.html',
  'pages/admin-users.html',
  'pages/sobre.html',
  'assets/images/logo.svg',
  'assets/images/icons/icon.svg',
  'assets/images/icons/icon-maskable.svg',
  'assets/images/icons/icon-192x192.png',
  'assets/images/icons/icon-512x512.png',
  'assets/css/styles.css',
  'assets/css/dashboard.css',
  'assets/css/garden-common.css',
  'assets/css/plants.css',
  'assets/css/add-plant.css',
  'assets/css/calendar.css',
  'assets/css/profile.css',
  'assets/css/admin-users.css',
  'assets/js/dashboard.js',
  'assets/js/plants.js',
  'assets/js/add-plant.js',
  'assets/js/calendar.js',
  'assets/js/profile.js',
  'assets/js/auth-page.js',
  'assets/js/local-auth.js',
  'assets/js/db.js',
  'assets/js/firebase-config.js',
  'assets/js/app.js',
  'assets/js/modules/api.js',
  'assets/js/modules/UI.js',
  'assets/js/admin-users.js',
  'assets/js/home-redirect.js',
  'assets/js/pwa.js?v=31',
];

self.addEventListener('install', (event) => {
  const baseUrl = self.registration.scope;
  const assets = ASSETS_TO_CACHE.map((asset) => new URL(asset, baseUrl));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('herbanario-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key))
  )));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((response) => {
      if (response) return response;
      if (event.request.mode === 'navigate') {
        return caches.match(new URL('pages/offline.html', self.registration.scope));
      }
    }))
  );
});
