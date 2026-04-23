const cacheName = 'workout-timer-v10';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',

  './audio/start.wav',
  './audio/complete.wav',

  './audio/jj_intro.wav',
  './audio/knees_intro.wav',
  './audio/twists_intro.wav',
  './audio/squats_intro.wav',

  './audio/halfway.wav'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== cacheName && caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
