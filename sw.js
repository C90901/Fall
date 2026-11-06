// Caches the page, libraries and small models after first load so the app works offline.
const CACHE = "smartcam-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (sameOrigin) {
      // pages: network first (so updates show up), cache as fallback
      try {
        const r = await fetch(req);
        if (r.ok) cache.put(req, r.clone());
        return r;
      } catch (err) {
        return hit || Response.error();
      }
    }
    // libraries and models: cache first
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok) cache.put(req, r.clone());
      return r;
    } catch (err) {
      return Response.error();
    }
  })());
});
