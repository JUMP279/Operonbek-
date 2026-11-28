// FindLead PWA service worker (2026-11-22) — sayt/ilovani telefon ekraniga o'rnatish uchun.
// Hech narsani KESHLAMAYDI (API ham, sahifa ham har doim yangi) — faqat internet yo'q bo'lsa offline.html ko'rsatadi.
const CACHE = 'fl-offline-v1';
const OFFLINE = '/offline.html';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;          // fayllar, API — brauzer o'zi, odatdagidek
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});
