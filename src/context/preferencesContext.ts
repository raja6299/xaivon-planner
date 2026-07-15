import { createContext } from 'react'
import type { Priority, TaskSort } from '../types/task'

export type Preferences = {
  defaultSort: TaskSort
  defaultPriority: Priority
  /** Prefilled reminder time for new tasks ('' = none). */
  defaultReminderTime: string
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultSort: { field: 'priority', direction: 'asc' },
  defaultPriority: 'medium',
  defaultReminderTime: '',
}

export type PreferencesContextValue = {
  preferences: Preferences
  setDefaultSort: (sort: TaskSort) => void
  setDefaultPriority: (priority: Priority) => void
  setDefaultReminderTime: (time: string) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)
