const cacheName = 'workout-timer-v3';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',

  // 🎧 Audio files
  './audio/start.wav',
  './audio/complete.wav',

  './audio/jj.wav',
  './audio/knees.wav',
  './audio/twists.wav',
  './audio/squats.wav',

  './audio/halfway.wav',

  './audio/5.wav',
  './audio/4.wav',
  './audio/3.wav',
  './audio/2.wav',
  './audio/1.wav'
];

// Install + cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

// Activate: clean old caches (important)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: serve cached first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
