const CACHE_NAME = "weather-app-v1";
consturlsToCache = [
    "/",
    "/index.html",
    "/src/style.css",
    "/src/index.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil (
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlToCache))
        );
});

self.addEventListener("fetch", (event) => {
    event.respondWith (
        caches.match(event.request).then ((response) => {
            return response || fetch(event.request);
        })
    );
});
