
const CACHE_NAME = 'physiocore-genesis-v4.1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Kurulum: Statik dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.error('[SW] Pre-cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Aktivasyon: Eski cache versiyonlarını temizle
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Önce cache, sonra network stratejisi
self.addEventListener('fetch', (event) => {
  // API veya dış kaynak isteklerini cache'leme
  if (event.request.url.includes('/api/') || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback or handle offline
      });
    })
  );
});
