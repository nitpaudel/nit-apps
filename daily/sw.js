// Makes Daily open instantly. The app is always served from the copy saved on the phone,
// and a fresh copy is fetched quietly in the background, so updates show up on the next launch.
const CACHE = "daily-v11";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/launch-1170x2532.png", "./icons/launch-1170x2532-dark.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const isPage = e.request.mode === "navigate";
  const key = isPage ? "./index.html" : e.request;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, { ignoreSearch: isPage });
    const fresh = fetch(e.request).then(r => { if (r && r.ok) cache.put(key, r.clone()); return r; }).catch(() => hit);
    if (hit) { e.waitUntil(fresh); return hit; }
    return fresh;
  }));
});
