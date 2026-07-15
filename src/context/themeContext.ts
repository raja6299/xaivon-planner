import { createContext } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export type ThemeContextValue = {
  /** The user's stored preference. */
  theme: ThemePreference
  /** The actual theme in effect (system resolved to light/dark). */
  resolvedTheme: ResolvedTheme
  setTheme: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
