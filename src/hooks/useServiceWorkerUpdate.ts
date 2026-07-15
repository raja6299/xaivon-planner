import { useCallback, useEffect, useState } from 'react'
import {
  applyServiceWorkerUpdate,
  onServiceWorkerUpdate,
} from '../pwa/serviceWorkerRegistration'

export type ServiceWorkerUpdate = {
  updateAvailable: boolean
  applyUpdate: () => void
  dismiss: () => void
}

/**
 * Exposes the service-worker update state to React. Subscribes on mount and
 * cleans up on unmount (no leaks). `applyUpdate` activates the waiting worker
 * and reloads; `dismiss` hides the prompt until the next update is detected.
 */
export function useServiceWorkerUpdate(): ServiceWorkerUpdate {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const unsubscribe = onServiceWorkerUpdate(() => setUpdateAvailable(true))
    return unsubscribe
  }, [])

  const applyUpdate = useCallback(() => {
    applyServiceWorkerUpdate()
  }, [])

  const dismiss = useCallback(() => {
    setUpdateAvailable(false)
  }, [])

  return { updateAvailable, applyUpdate, dismiss }
}
