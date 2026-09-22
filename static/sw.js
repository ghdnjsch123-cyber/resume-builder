const CACHE_NAME = "career-studio-v1";
const STATIC_ASSETS = [
    "/",
    "/static/css/style.css",
    "/static/js/app.js",
    "/static/manifest.json",
    "/static/icons/icon-192.png",
    "/static/icons/icon-512.png"
];

// 1. 서비스 워커 설치: 정적 자원 캐싱
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. 서비스 워커 활성화: 구버전 캐시 정리
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

// 3. 네트워크 요청 가로채기 (Network First with Cache Fallback for API, Cache First for static)
self.addEventListener("fetch", (event) => {
    // POST 요청(Gemini API 등)은 캐싱하지 않고 네트워크로 직접 전달
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                // 오프라인 fallback 필요 시 처리
                return caches.match("/");
            });
        })
    );
});
