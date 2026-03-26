const CACHE_NAME = 'silsilah-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com' // Caching library eksternal agar tetap jalan offline
];

// Tahap Install: Simpan aset ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Tahap Fetch: Ambil dari cache jika sedang offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
