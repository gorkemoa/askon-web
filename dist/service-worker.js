// Service Worker sürümü
const CACHE_VERSION = 'v1';
const CACHE_NAME = `askon-cache-${CACHE_VERSION}`;

// Önbelleğe alınacak dosyalar
const CACHE_FILES = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    // Diğer önbelleğe alınacak dosyaları buraya ekleyin
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CACHE_FILES))
            .then(() => self.skipWaiting())
    );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch olayı yönetimi
self.addEventListener('fetch', (event) => {
    // Preload isteği kontrolü
    if (event.preloadResponse) {
        event.waitUntil(
            Promise.race([
                event.preloadResponse,
                new Promise((resolve) => setTimeout(resolve, 1000))
            ]).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
        );
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(response => {
                    // Sadece başarılı istekleri önbelleğe al
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
}); 