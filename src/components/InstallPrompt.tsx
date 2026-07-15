import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { Button } from './ui/Button'

/**
 * Custom install prompt. Replaces the browser's native install UI with a
 * clean, dismissible card. Shown only when the browser exposes an install
 * prompt (Android / desktop Chrome) and the app is not already installed.
 * "Later" dismisses it without interrupting the user; it can reappear if the
 * install availability changes again.
 */
export default function InstallPrompt() {
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div
      role="dialog"
      aria-label="Install app"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="card animate-slide-in pointer-events-auto flex w-full max-w-md items-center gap-3 border border-border p-4 shadow-card-hover">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">Install Daily Task Reminder</p>
          <p className="text-sm text-text-secondary">
            Add to your home screen for quick, offline access.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setDismissed(true)}>
          Later
        </Button>
        <Button type="button" size="sm" onClick={() => void install()}>
          Install
        </Button>
      </div>
    </div>
  )
}
