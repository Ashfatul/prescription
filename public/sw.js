// PPMS Progressive Web App Service Worker
const CACHE_NAME = "ppms-cache-v1";

const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/icons/icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.json",
];

// Install: Cache core static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[PWA SW] Pre-caching failed:", err);
      })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Bypass chrome-extension and non-http(s)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // 1. API & Auth calls: Strict Network-Only / Network-First (Never serve stale medical/Rx data)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Offline: Unable to connect to clinical servers." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // 2. Static Assets (Icons, Images, Fonts, Next.js static files): Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Page Navigations: Network-First with Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached home page
          const fallbackHome = await caches.match("/");
          if (fallbackHome) {
            return fallbackHome;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>PPMS - Offline</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #080c15; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
                .card { max-width: 420px; background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                h1 { color: #14b8a6; margin-top: 0; font-size: 22px; }
                p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
                button { background: #0f766e; color: white; border: none; border-radius: 12px; padding: 12px 24px; font-weight: bold; cursor: pointer; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Clinical Connection Offline</h1>
                <p>You are currently offline. Please reconnect to the clinic network or Wi-Fi to synchronize prescriptions and patient queues.</p>
                <button onclick="window.location.reload()">Retry Connection</button>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
  }
});
