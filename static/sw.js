const CACHE_NAME = "career-studio-v4";
const STATIC_ASSETS = [
    "/",
    "/manifest.json",
    "/static/css/style.css",
    "/static/js/app.js",
    "/static/icons/icon-192.png",
    "/static/icons/icon-512.png"
];

// 1. 서비스 워커 설치: 정적 자원 안전 캐싱 (개별 파일 실패 시에도 SW 설치 보장)
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of STATIC_ASSETS) {
                try {
                    await cache.add(asset);
                } catch (err) {
                    console.warn("캐시 실패 항목 무시:", asset, err);
                }
            }
        })
    );
    self.skipWaiting();
});

// 2. 서비스 워커 활성화: 구버전 캐시 정리 및 클라이언트 즉시 제어
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. 네트워크 요청 처리: 정적 파일은 Cache First, 그 외 Network First
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return networkResponse;
            }).catch(() => {
                return caches.match("/");
            });
        })
    );
});
