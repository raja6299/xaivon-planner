/* Daily Task Reminder — Service Worker
 * Offline-first, app-shell caching. No external dependencies.
 *
 * Update model: a newly-installed worker does NOT call skipWaiting() on its
 * own. It stays in the "waiting" state until the app explicitly posts a
 * { type: 'SKIP_WAITING' } message (triggered by the user pressing
 * "Update Now"). This gives the user control and prevents surprise reloads
 * while they are working.
 */
const CACHE_VERSION = 'v2'
const CACHE = `dtr-cache-${CACHE_VERSION}`
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  // Pre-cache the app shell. Intentionally NOT calling skipWaiting() here so
  // the new worker waits for the user's approval before activating.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)))
})

self.addEventListener('activate', (event) => {
  // On activation, purge every cache that isn't the current version. This is
  // the cache-versioning mechanism that prevents stale assets from lingering.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  // The page requests immediate activation of the waiting worker.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigations: network-first with offline fallback to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('./index.html', self.location).href)))
    return
  }

  // Static assets: cache-first, populate cache on miss.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
