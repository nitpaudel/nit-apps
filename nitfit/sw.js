// Opens the newest NitFit when online, and the copy saved on the phone when offline.
const CACHE = "nitfit-v12";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/nf3-180.png", "./icons/nf3-192.png", "./icons/nf3-512.png", "./icons/launch-1170x2532.png"];
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
      const had = await cache.match("./index.html");
      // newest version first; only fall back to the saved copy when offline or slow
      try { await within(freshPage(cache), had ? 2500 : 8000); } catch (_) {}
      return (await cache.match("./index.html")) || fetch(e.request);
    })());
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true })).then(hit => hit || fetch(e.request)));
});
