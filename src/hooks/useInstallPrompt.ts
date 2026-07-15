import { useCallback, useEffect, useState } from 'react'
import {
  canInstall,
  isInstalled,
  promptInstall,
  subscribeInstall,
} from '../pwa/installPrompt'

export type InstallPrompt = {
  canInstall: boolean
  installed: boolean
  install: () => Promise<void>
}

/**
 * React binding for the custom install prompt. Re-renders when install
 * availability changes (prompt captured / app installed). Cleans up on unmount.
 */
export function useInstallPrompt(): InstallPrompt {
  const [state, setState] = useState(() => ({
    canInstall: canInstall(),
    installed: isInstalled(),
  }))

  useEffect(() => {
    const update = () => setState({ canInstall: canInstall(), installed: isInstalled() })
    update()
    return subscribeInstall(update)
  }, [])

  const install = useCallback(async () => {
    await promptInstall()
  }, [])

  return { ...state, install }
}
