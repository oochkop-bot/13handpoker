/* Монгол Покер — офлайн ажиллагаа
   Апп-ын файлуудыг кэшлээд, интернэтгүй үед ч нээгддэг болгоно.
   (Хүнтэй тоглохын тулд интернэт хэрэгтэй, ботуудтай офлайн тоглож болно.) */

const CACHE = 'mongol-poker-v1';
const SHELL = [
  './',
  './index.html',
  './peerjs.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // PeerJS сервер рүү хийх дуудлагыг кэшлэхгүй
  if (req.url.indexOf('peerjs.com') > -1 || req.url.indexOf('/peerjs') > -1) return;

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
