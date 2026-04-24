const cacheName = 'workout-timer-v17';

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

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(cacheName).then(c=>c.addAll(filesToCache)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k=>k!==cacheName && caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
