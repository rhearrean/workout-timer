const CACHE_NAME = "fit-timer-v3.13.1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css?v=3.13.1",
  "./app.js?v=3.13.1",
  "./manifest.json?v=3.13.1",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("./", copy));
        return response;
      }).catch(() => caches.match("./").then(response => response || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
