/**
 * Service Worker registration + update lifecycle.
 *
 * Responsibilities:
 *  - Register `/sw.js` exactly once (production builds only).
 *  - Detect when a new worker has installed and is waiting.
 *  - Notify subscribers so the UI can show an "update available" prompt.
 *  - Activate the waiting worker on demand and reload the page once.
 *
 * Guarantees:
 *  - No duplicate registrations (module-level `registered` guard).
 *  - No infinite reload loops (`refreshing` guard + user-gated reload flag).
 *  - No surprise reloads: the page only reloads after the user approves.
 */

type UpdateCallback = () => void

let registered = false
let refreshing = false
// Only reload on `controllerchange` when the user explicitly approved an
// update. This prevents an unwanted reload on the very first install, when the
// first worker claims the page via clients.claim().
let reloadOnControllerChange = false
let waitingWorker: ServiceWorker | null = null
let currentRegistration: ServiceWorkerRegistration | null = null

const updateCallbacks = new Set<UpdateCallback>()

function notifyUpdate(): void {
  updateCallbacks.forEach((cb) => cb())
}

/**
 * Subscribe to "update available" events. If an update is already pending when
 * you subscribe, the callback fires immediately. Returns an unsubscribe fn.
 */
export function onServiceWorkerUpdate(callback: UpdateCallback): () => void {
  updateCallbacks.add(callback)
  if (waitingWorker) callback()
  return () => {
    updateCallbacks.delete(callback)
  }
}

/** Whether a new worker is installed and waiting to take over. */
export function isUpdatePending(): boolean {
  return waitingWorker !== null
}

/**
 * Activate the waiting worker and reload once it takes control. Safe to call
 * even if nothing is waiting (falls back to a plain reload).
 */
export function applyServiceWorkerUpdate(): void {
  if (!waitingWorker) {
    window.location.reload()
    return
  }
  reloadOnControllerChange = true
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
}

function trackInstallingWorker(registration: ServiceWorkerRegistration): void {
  const installing = registration.installing
  if (!installing) return
  installing.addEventListener('statechange', () => {
    // `installed` + an existing controller means this is an update to an
    // already-running app (not a first install).
    if (installing.state === 'installed' && navigator.serviceWorker.controller) {
      waitingWorker = registration.waiting ?? installing
      notifyUpdate()
    }
  })
}

function start(): void {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      currentRegistration = registration

      // A worker may already be waiting (installed on a previous visit).
      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorker = registration.waiting
        notifyUpdate()
      }

      registration.addEventListener('updatefound', () => trackInstallingWorker(registration))
    })
    .catch(() => {
      // Registration failed; the app still works online.
    })

  // Re-check for updates whenever the tab regains focus.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentRegistration) {
      currentRegistration.update().catch(() => {})
    }
  })
}

/** Register the service worker and begin watching for updates. Idempotent. */
export function registerServiceWorker(): void {
  if (registered) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  registered = true

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadOnControllerChange || refreshing) return
    refreshing = true
    window.location.reload()
  })

  if (document.readyState === 'complete') {
    start()
  } else {
    window.addEventListener('load', start, { once: true })
  }
}
