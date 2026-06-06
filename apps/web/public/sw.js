/* Fogora service worker — minimal, safe, no offline shell takeover. */
const CACHE = "fogora-static-v1";
const STATIC_ASSETS = [
  "/cine/fogora-mark.png",
  "/cine/fogora-logo.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; everything else hits the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStatic =
    url.pathname.startsWith("/cine/") ||
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|css|js)$/.test(url.pathname);

  if (isStatic) {
    // Cache-first for static assets.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE).then((cache) => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => cached),
      ),
    );
    return;
  }

  // Network for everything else (no offline shell).
});
