// Service worker: keeps the app shell available and nothing else.
//
// It must never touch /api/ (answers about one signed-in person that change as visitors arrive) or the link
// pages /g/, /v/ and /q/ (a pass's state changes when it is used). Those share this origin, and an earlier
// version cached every GET, which served stale lists and could show one person another person's answer.
// So only the shell and the hashed build assets are handled here; every other request goes straight to the
// network and is never stored.

const CACHE_NAME = 'qaribu-shell-v7';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL).catch(() => undefined)));
});

// Deleting every other cache also clears whatever the old version stored, including old API answers.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// What this worker may serve: the shell and the content-hashed files under /assets/.
const handles = (url) =>
  url.origin === self.location.origin &&
  (SHELL.includes(url.pathname) || url.pathname.startsWith('/assets/'));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!handles(url)) return; // the browser handles it normally: not cached, not intercepted

  if (url.pathname.startsWith('/assets/')) {
    // Hashed file names never change content, so the cached copy is always right.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // The shell: the network first, so a new deploy shows at once; the cached copy only when offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error())),
  );
});
