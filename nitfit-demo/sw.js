// Makes NitFit open instantly from the copy saved on the phone, and checks for a newer
// version in the background. A newer version shows the next time NitFit opens.
const CACHE = "nitfitdemo-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/launch-1170x2532.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  // only ever clean up NitFit's own old copies, never another app's
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("nitfit-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function freshPage(cache) {
  const res = await fetch("./index.html?t=" + Date.now(), { cache: "no-store" });
  if (!res.ok) return;
  const text = await res.clone().text();
  const old = await cache.match("./index.html");
  if (old && (await old.text()) === text) return;
  await cache.put("./index.html", new Response(text, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
}
const within = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;   // GitHub saving goes straight to the internet
  if (e.request.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match("./index.html");
      if (hit) { e.waitUntil(freshPage(cache).catch(() => {})); return hit; }
      try { await within(freshPage(cache), 8000); } catch (_) {}
      return (await cache.match("./index.html")) || fetch(e.request);
    })());
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true })).then(hit => hit || fetch(e.request)));
});
