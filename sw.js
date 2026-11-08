const CACHE_NAME = 'herbanario-cache-v38';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'plants-seed.json',
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
  'assets/images/favicon.svg',
  'assets/images/logo.svg',
  'assets/images/icons/icon.svg',
  'assets/images/icons/icon-maskable.svg',
  'assets/images/icons/logo-app.svg',
  'assets/images/icons/icon-192x192.png',
  'assets/images/icons/icon-512x512.png',
  'assets/css/style.css',
  'assets/css/styles.css',
  'assets/css/components/menu.css',
  'assets/css/components/auth.css',
  'assets/css/components/dashboard.css',
  'assets/css/components/garden-common.css',
  'assets/css/components/plants.css',
  'assets/css/components/add-plant.css',
  'assets/css/components/calendar.css',
  'assets/css/components/profile.css',
  'assets/css/components/admin-users.css',
  'assets/css/components/install-dialog.css',
  'assets/js/app.js',
  'assets/js/auth-page.js',
  'assets/js/db.js',
  'assets/js/menu.js',
  'assets/js/pwa.js',
  'assets/js/modules/UI.js',
  'assets/js/modules/add-plant.js',
  'assets/js/modules/admin-users.js',
  'assets/js/modules/api.js',
  'assets/js/modules/auth-page.js',
  'assets/js/modules/calendar.js',
  'assets/js/modules/dashboard.js',
  'assets/js/modules/firebase-config.js',
  'assets/js/modules/home-redirect.js',
  'assets/js/modules/local-auth.js',
  'assets/js/modules/plants.js',
  'assets/js/modules/profile.js',
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