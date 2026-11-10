// Makes Daily open instantly from the copy saved on the phone, and quietly checks for a newer
// version in the background. A newer version is saved and shows the next time Daily opens.
const CACHE = "daily-v28";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/launch-1170x2532.png", "./icons/launch-1170x2532-dark.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// ask GitHub for the newest page, skipping every cache on the way (the ?t= makes it a fresh request)
async function freshPage(cache){
  const res = await fetch("./index.html?t=" + Date.now(), { cache: "no-store" });
  if (!res.ok) return;
  const text = await res.clone().text();
  const old = await cache.match("./index.html");
  const oldText = old ? await old.text() : "";
  if (oldText === text) return;
  await cache.put("./index.html", new Response(text, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
  if (oldText){
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(c => c.postMessage({ type: "daily-updated" }));
  }
}
// never wait long on a slow connection
const within = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;   // GitHub sync goes straight to the internet
  if (e.request.mode === "navigate"){
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      // 1. the saved copy, from any version we have: opens instantly, even offline
      const hit = (await cache.match("./index.html")) || (await caches.match("./index.html", { ignoreSearch: true }));
      if (hit){ e.waitUntil(freshPage(cache).catch(() => {})); return hit; }
      // 2. nothing saved yet (first ever open): use the internet
      try { await within(freshPage(cache), 8000); } catch(_){}
      return (await cache.match("./index.html")) || fetch(e.request);
    })());
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
