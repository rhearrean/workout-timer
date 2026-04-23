const cacheName = 'workout-timer-v4';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',

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

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== cacheName && caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
