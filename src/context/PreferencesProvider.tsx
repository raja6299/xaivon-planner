import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_PREFERENCES,
  PreferencesContext,
  type Preferences,
} from './preferencesContext'
import type { Priority, TaskSort } from '../types/task'
import { readJSON, writeJSON } from '../lib/utils/storage'

const STORAGE_KEY = 'dtr:prefs'

function readPreferences(): Preferences {
  const stored = readJSON<Partial<Preferences>>(STORAGE_KEY, {})
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    defaultSort: { ...DEFAULT_PREFERENCES.defaultSort, ...(stored.defaultSort ?? {}) },
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences)

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch }
      writeJSON(STORAGE_KEY, next)
      return next
    })
  }, [])

  const setDefaultSort = useCallback((defaultSort: TaskSort) => update({ defaultSort }), [update])
  const setDefaultPriority = useCallback(
    (defaultPriority: Priority) => update({ defaultPriority }),
    [update],
  )
  const setDefaultReminderTime = useCallback(
    (defaultReminderTime: string) => update({ defaultReminderTime }),
    [update],
  )

  const value = useMemo(
    () => ({ preferences, setDefaultSort, setDefaultPriority, setDefaultReminderTime }),
    [preferences, setDefaultSort, setDefaultPriority, setDefaultReminderTime],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
