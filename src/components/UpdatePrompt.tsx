import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate'
import { Button } from './ui/Button'

/**
 * Non-intrusive toast shown when a new service worker is waiting. It sits at
 * the bottom of the screen and never blocks interaction — the user keeps
 * working until they choose "Update Now" (reloads into the new version) or
 * "Later" (dismisses; reappears when the next update is detected).
 */
export default function UpdatePrompt() {
  const { updateAvailable, applyUpdate, dismiss } = useServiceWorkerUpdate()

  if (!updateAvailable) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="card animate-slide-in pointer-events-auto flex w-full max-w-md items-center gap-3 border border-border p-4 shadow-card-hover">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">New version available</p>
          <p className="text-sm text-text-secondary">Reload to get the latest version.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={dismiss}>
          Later
        </Button>
        <Button type="button" size="sm" onClick={applyUpdate}>
          Update Now
        </Button>
      </div>
    </div>
  )
}
