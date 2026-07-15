/**
 * Captures the browser's `beforeinstallprompt` event so the app can offer a
 * custom "Install App" button (Android / desktop Chromium). On browsers that
 * don't support it (e.g. iOS Safari, Firefox) nothing fires and the button
 * simply stays hidden — a graceful no-op.
 */

type Listener = () => void

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
let initialized = false
const listeners = new Set<Listener>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function initInstallPrompt(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    notify()
  })

  window.addEventListener('appinstalled', () => {
    installed = true
    deferredPrompt = null
    notify()
  })
}

export function isInstalled(): boolean {
  if (installed) return true
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

export function canInstall(): boolean {
  return deferredPrompt !== null && !isInstalled()
}

export function subscribeInstall(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  await deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  notify()
  return choice.outcome === 'accepted'
}
