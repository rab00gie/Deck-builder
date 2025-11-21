// Simple PWA service worker for Commander Deck Helper

const CACHE_NAME = "commander-deck-helper-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// Activate: clean up old caches if CACHE_NAME changes
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: cache-first for our own files, network for external requests (Scryfall)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).catch(
            () =>
              new Response(
                "<h1>Offline</h1><p>The app shell loaded, but this file isn't cached.</p>",
                { headers: { "Content-Type": "text/html" } }
              )
          )
        );
      })
    );
    return;
  }

  // For Scryfall / external: just try network; if offline they fail
  event.respondWith(fetch(event.request).catch(() => new Response(null)));
});
