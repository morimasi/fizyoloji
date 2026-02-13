
const CACHE_NAME = 'physiocore-genesis-v5.0-production';
const OFFLINE_URL = '/index.html';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Önemli: addAll fail-fast çalışır. Hata toleransı için her biri tek tek denenebilir 
      // ancak stabilite için kritik olanlar bunlar.
      return cache.addAll(ASSETS).catch(err => console.warn('[SW] Cache addAll skipped:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini işle (POST/PUT/DELETE cache'lenmez)
  if (event.request.method !== 'GET') return;

  // Cross-origin istekleri (Google Search, AI API vb.) cache'leme
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fetch de başarısız olursa (Offline) ve asset değilse sessiz kal
        return null;
      });
    })
  );
});
