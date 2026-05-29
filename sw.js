const cacheName = 'workout-timer-v29';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',

  './audio/start.wav',
  './audio/complete.wav',
  './audio/halfway.wav',
  './audio/tick.wav',

  './audio/jj_intro.wav',
  './audio/knees_intro.wav',
  './audio/twists_intro.wav',
  './audio/squats_intro.wav',
  './audio/plank_taps_intro.wav',

  './audio/1.wav',
  './audio/2.wav',
  './audio/3.wav',
  './audio/4.wav',
  './audio/5.wav'
];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(cacheName).then(c=>c.addAll(filesToCache)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== cacheName && caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
