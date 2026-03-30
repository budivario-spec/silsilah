const CACHE_NAME = 'silsilah-v2'; // Naikkan versi jika ada perubahan CSS/JS besar
const assets = [
  './',
  './index.html',
  './kirim-kabar.html',
  './cari-anggota.html',
  './statistik.html',
  './manifest.json',
  './config.js',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];

// 1. Install: Simpan aset dasar
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Gunakan cache.addAll dengan proteksi agar satu file gagal tidak merusak semua
      return Promise.allSettled(assets.map(url => cache.add(url)));
    })
  );
});

// 2. Activate: Hapus Cache Versi Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Menghapus cache lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetch: Logika Cerdas
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Jalur API & Gambar Cloud (JANGAN DI-CACHE)
  if (url.hostname.includes('script.google.com') || 
      url.hostname.includes('googleusercontent.com') ||
      url.searchParams.has('action')) { // Deteksi query ?action=
    return; // Biarkan browser menangani secara normal via network
  }

  // B. Aset Luar (Tailwind & CDN) - Stale-While-Revalidate
  if (url.hostname.includes('tailwindcss.com') || url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networked = fetch(event.request).then((res) => {
          const cacheCopy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          return res;
        }).catch(() => cached);
        return cached || networked;
      })
    );
    return;
  }

  // C. Aset Lokal (HTML, JS, CSS Lokal) - Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Jika benar-benar offline dan file tidak ada di cache
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});